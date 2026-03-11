/**
 * TRACK MODERATION & PIPELINE ROUTES
 *
 * Полный пайплайн трека:
 * 1. Загрузка → модерация (pending → approved/rejected)
 * 2. После одобрения → администратор решает:
 *    a) Добавить в «Новинки» на главную (бесплатно / стандартная цена 5000₽)
 *    b) Включить в еженедельную рассылку для радиостанций
 *    c) Эксклюзивная отправка редакторам (10 000₽ — цена 2x)
 */

import { Hono } from 'npm:hono@4';
import { trackModerationStore, newReleasesStore, radioNewsletterStore, exclusivePitchStore, radioContactsStore, emailHistoryStore } from './db.tsx';
import { emitSSE } from './sse-routes.tsx';
import { recordRevenue } from './platform-revenue.tsx';

const app = new Hono();

/**
 * Pipeline billing + SSE helper
 * Пайплайн работает в админском режиме — биллинг артиста не подключён.
 * При каждом шаге: SSE уведомление артисту + запись revenue платформы.
 */
function pipelineNotify(userId: string | undefined, step: string, title: string, artist: string, price: number) {
  if (userId) {
    emitSSE(userId, {
      type: 'notification',
      data: {
        title: `Пайплайн: ${step}`,
        message: `Ваш трек «${title}» — ${step}`,
        category: 'pipeline',
        price,
      },
    });
  }
  // Всегда уведомляем админов
  emitSSE('admin-1', {
    type: 'notification',
    data: {
      title: `Пайплайн трека: ${step}`,
      message: `${artist} — ${title} (${price > 0 ? price.toLocaleString('ru-RU') + ' ₽' : 'бесплатно'})`,
      category: 'pipeline',
    },
  });
}

async function pipelineRecordRevenue(channel: string, description: string, amount: number, userId: string, artistName: string, metadata?: Record<string, any>) {
  if (amount > 0) {
    await recordRevenue({
      channel,
      description,
      grossAmount: amount,
      platformRevenue: amount,
      payoutAmount: 0,
      commissionRate: 1.0,
      payerId: userId || 'admin',
      payerName: artistName || 'Артист',
      metadata: { ...metadata, billing_status: 'admin_only' },
    });
  }
}

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Dance',
  'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass',
  'Jazz', 'Blues', 'Classical', 'Country', 'Folk',
  'Reggae', 'Afrobeat', 'Metal', 'Punk', 'Indie', 'Alternative',
  'Soul', 'Funk', 'Disco', 'Gospel', 'Latin', 'World'
];

// Ценообразование пайплайна
const PRICING = {
  novelty: 5000,          // Попасть в Новинки — 5 000 ₽
  weekly_newsletter: 0,   // Еженедельная рассылка — бесплатно (входит в модерацию)
  exclusive_editors: 10000, // Эксклюзивная отправка редакторам — 10 000 ₽
};

// ===================================================================
// ЗАГРУЗКА И МОДЕРАЦИЯ
// ===================================================================

// POST /submitTrack - Загрузить трек на модерацию
app.post('/submitTrack', async (c) => {
  try {
    const body = await c.req.json();
    const trackId = `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const track = {
      id: trackId,
      title: body.title || '',
      artist: body.artist || '',
      cover_image_url: body.cover_image_url || '',
      audio_file_url: body.audio_file_url || '',
      duration: body.duration || 0,
      genre: body.genre || '',
      yandex_music_url: body.yandex_music_url || '',
      youtube_url: body.youtube_url || '',
      spotify_url: body.spotify_url || '',
      apple_music_url: body.apple_music_url || '',
      uploaded_by_email: body.uploaded_by_email || '',
      uploaded_by_user_id: body.uploaded_by_user_id || '',
      moderation_status: 'pending',
      // Pipeline статусы
      pipeline_status: 'awaiting_moderation', // awaiting_moderation → moderated → in_novelty → in_newsletter → completed
      is_in_novelty: false,
      is_in_newsletter: false,
      is_exclusive: body.is_exclusive || false,
      exclusive_price: body.is_exclusive ? PRICING.exclusive_editors : 0,
      novelty_price: PRICING.novelty,
      overall_score: null,
      moderator_notes: null,
      rejection_reason: null,
      promoted_at: null,
      newsletter_added_at: null,
      exclusive_sent_at: null,
      created_at: now,
      updated_at: now,
    };

    await trackModerationStore.set(trackId, track);

    return c.json({
      success: true,
      pending_track_id: trackId,
      message: 'Трек отправлен на модерацию',
      pricing: {
        novelty: PRICING.novelty,
        exclusive: PRICING.exclusive_editors,
        note: 'Оплата после прохождения модерации',
      },
    });
  } catch (error) {
    console.error('Error in submitTrack:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /pendingTracks - Получить треки по статусу
app.get('/pendingTracks', async (c) => {
  try {
    const status = c.req.query('status') || 'pending';
    const genre = c.req.query('genre');
    const search = c.req.query('search');
    const pipeline = c.req.query('pipeline'); // фильтр по pipeline_status

    const allTracks = await trackModerationStore.getAll();
    let filteredTracks = allTracks || [];

    // Фильтр по статусу модерации
    if (status && status !== 'all') {
      filteredTracks = filteredTracks.filter((t: any) => t.moderation_status === status);
    }

    // Фильтр по pipeline_status
    if (pipeline) {
      filteredTracks = filteredTracks.filter((t: any) => t.pipeline_status === pipeline);
    }

    // Фильтр по жанру
    if (genre) {
      filteredTracks = filteredTracks.filter((t: any) => t.genre === genre);
    }

    // Поиск
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTracks = filteredTracks.filter((t: any) =>
        (t.title || '').toLowerCase().includes(searchLower) ||
        (t.artist || '').toLowerCase().includes(searchLower)
      );
    }

    return c.json({ tracks: filteredTracks });
  } catch (error) {
    console.error('Error in pendingTracks:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /manageTrackModeration - Модерация трека (approve/reject)
app.post('/manageTrackModeration', async (c) => {
  try {
    const body = await c.req.json();
    const { pendingTrackId, action, moderator_notes, rejection_reason, overall_score } = body;

    const track: any = await trackModerationStore.get(pendingTrackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      track.moderation_status = 'approved';
      track.pipeline_status = 'moderated'; // Готов к дальнейшим действиям
      track.overall_score = overall_score || null;
      track.moderator_notes = moderator_notes || null;
      track.updated_at = now;
      await trackModerationStore.set(pendingTrackId, track);

      return c.json({
        success: true,
        message: 'Трек одобрен. Доступны действия: Новинки, рассылка, эксклюзив',
        trackId: pendingTrackId,
        coinsAwarded: 50,
        nextActions: ['promote_to_novelty', 'add_to_newsletter', 'exclusive_pitch'],
      });
    } else if (action === 'reject') {
      track.moderation_status = 'rejected';
      track.pipeline_status = 'rejected';
      track.rejection_reason = rejection_reason || '';
      track.moderator_notes = moderator_notes || null;
      track.updated_at = now;
      await trackModerationStore.set(pendingTrackId, track);

      return c.json({
        success: true,
        message: 'Трек отклонён',
      });
    } else {
      return c.json({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Error in manageTrackModeration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===================================================================
// ПАЙПЛАЙН: НОВИНКИ НА ГЛАВНУЮ
// ===================================================================

// POST /promoteToNovelty - Администратор добавляет трек в «Новинки»
app.post('/promoteToNovelty', async (c) => {
  try {
    const body = await c.req.json();
    const { trackId, position } = body;
    const now = new Date().toISOString();

    const track: any = await trackModerationStore.get(trackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    if (track.moderation_status !== 'approved') {
      return c.json({ error: 'Трек должен быть одобрен модерацией' }, 400);
    }

    // Обновляем статус трека
    track.is_in_novelty = true;
    track.pipeline_status = 'in_novelty';
    track.promoted_at = now;
    track.updated_at = now;
    await trackModerationStore.set(trackId, track);

    // Добавляем в store новинок
    const release = {
      id: `nr_${trackId}`,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre,
      cover_image_url: track.cover_image_url,
      audio_file_url: track.audio_file_url,
      yandex_music_url: track.yandex_music_url,
      youtube_url: track.youtube_url,
      spotify_url: track.spotify_url,
      apple_music_url: track.apple_music_url,
      duration: track.duration,
      position: position || 0,
      promoted_at: now,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 недели
      is_active: true,
      views: 0,
      plays: 0,
      likes: 0,
    };

    await newReleasesStore.set(release.id, release);

    // SSE + Revenue
    pipelineNotify(track.uploaded_by, 'Добавлен в Новинки', track.title, track.artist, PRICING.novelty);
    await pipelineRecordRevenue('track_novelty', `Новинки: ${track.artist} — ${track.title}`, PRICING.novelty, track.uploaded_by || 'admin', track.artist, { trackId });

    return c.json({
      success: true,
      message: `Трек "${track.title}" добавлен в Новинки на главную`,
      release,
      price: PRICING.novelty,
      billing: { billing_status: 'admin_only', charged: false, price: PRICING.novelty },
    });
  } catch (error) {
    console.error('Error in promoteToNovelty:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /removeFromNovelty/:trackId - Убрать из Новинок
app.delete('/removeFromNovelty/:trackId', async (c) => {
  try {
    const trackId = c.req.param('trackId');

    const track: any = await trackModerationStore.get(trackId);
    if (track) {
      track.is_in_novelty = false;
      track.pipeline_status = 'moderated';
      track.updated_at = new Date().toISOString();
      await trackModerationStore.set(trackId, track);
    }

    // Удаляем из новинок
    const releaseId = `nr_${trackId}`;
    const release: any = await newReleasesStore.get(releaseId);
    if (release) {
      release.is_active = false;
      await newReleasesStore.set(releaseId, release);
    }

    return c.json({ success: true, message: 'Трек убран из Новинок' });
  } catch (error) {
    console.error('Error in removeFromNovelty:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /newReleases - Получить текущие Новинки (для главной страницы)
app.get('/newReleases', async (c) => {
  try {
    const all = await newReleasesStore.getAll();
    const now = new Date().toISOString();

    // Только активные и не просроченные
    const active = (all || [])
      .filter((r: any) => r.is_active && r.expires_at > now)
      .sort((a: any, b: any) => {
        // Сначала по позиции, потом по дате
        if (a.position !== b.position) return a.position - b.position;
        return new Date(b.promoted_at).getTime() - new Date(a.promoted_at).getTime();
      });

    return c.json({ success: true, releases: active });
  } catch (error) {
    console.error('Error in newReleases:', error);
    return c.json({ success: true, releases: [] });
  }
});

// ===================================================================
// ПАЙПЛАЙН: ЕЖЕНЕДЕЛЬНАЯ РАССЫЛКА ДЛЯ РАДИОСТАНЦИЙ
// ===================================================================

// POST /addToNewsletter - Добавить трек в еженедельную рассылку
app.post('/addToNewsletter', async (c) => {
  try {
    const body = await c.req.json();
    const { trackId } = body;
    const now = new Date().toISOString();

    const track: any = await trackModerationStore.get(trackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    if (track.moderation_status !== 'approved') {
      return c.json({ error: 'Трек должен быть одобрен' }, 400);
    }

    // Определяем номер недели
    const weekStart = getWeekStart(new Date());
    const weekKey = `week_${weekStart.toISOString().split('T')[0]}`;

    // Получаем текущую рассылку недели
    let newsletter: any = await radioNewsletterStore.get(weekKey);
    if (!newsletter) {
      newsletter = {
        id: weekKey,
        week_start: weekStart.toISOString(),
        week_end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tracks: [],
        status: 'draft', // draft → ready → sent
        created_at: now,
        sent_at: null,
        recipients_count: 0,
      };
    }

    // Проверяем дубликат
    if (newsletter.tracks.some((t: any) => t.trackId === trackId)) {
      return c.json({ error: 'Трек уже в рассылке этой недели' }, 400);
    }

    newsletter.tracks.push({
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre,
      cover_image_url: track.cover_image_url,
      audio_file_url: track.audio_file_url,
      yandex_music_url: track.yandex_music_url,
      youtube_url: track.youtube_url,
      added_at: now,
    });

    newsletter.updated_at = now;
    await radioNewsletterStore.set(weekKey, newsletter);

    // Обновляем статус трека
    track.is_in_newsletter = true;
    track.newsletter_added_at = now;
    track.pipeline_status = 'in_newsletter';
    track.updated_at = now;
    await trackModerationStore.set(trackId, track);

    // SSE
    pipelineNotify(track.uploaded_by, 'Добавлен в рассылку', track.title, track.artist, 0);

    return c.json({
      success: true,
      message: `Трек "${track.title}" добавлен в рассылку для радиостанций (неделя ${weekKey})`,
      newsletter_week: weekKey,
      tracks_in_newsletter: newsletter.tracks.length,
    });
  } catch (error) {
    console.error('Error in addToNewsletter:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /newsletter/current - Текущая рассылка недели
app.get('/newsletter/current', async (c) => {
  try {
    const weekStart = getWeekStart(new Date());
    const weekKey = `week_${weekStart.toISOString().split('T')[0]}`;

    const newsletter = await radioNewsletterStore.get(weekKey);

    return c.json({
      success: true,
      newsletter: newsletter || {
        id: weekKey,
        week_start: weekStart.toISOString(),
        tracks: [],
        status: 'draft',
      },
    });
  } catch (error) {
    console.error('Error in newsletter/current:', error);
    return c.json({ success: true, newsletter: { tracks: [], status: 'draft' } });
  }
});

// GET /newsletter/history - История рассылок
app.get('/newsletter/history', async (c) => {
  try {
    const all = await radioNewsletterStore.getAll();
    const sorted = (all || []).sort((a: any, b: any) =>
      new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    );
    return c.json({ success: true, newsletters: sorted });
  } catch (error) {
    console.error('Error in newsletter/history:', error);
    return c.json({ success: true, newsletters: [] });
  }
});

// POST /newsletter/send - Отправить рассылку радиостанциям
app.post('/newsletter/send', async (c) => {
  try {
    const body = await c.req.json();
    const weekKey = body.weekKey;

    const newsletter: any = await radioNewsletterStore.get(weekKey);
    if (!newsletter) {
      return c.json({ error: 'Рассылка не найдена' }, 404);
    }

    if (newsletter.tracks.length === 0) {
      return c.json({ error: 'Нет треков в рассылке' }, 400);
    }

    // Получаем контакты радиостанций
    const contacts = await radioContactsStore.getAll();
    const activeContacts = (contacts || []).filter((c: any) => c.is_active && c.email);

    // Если нет контактов — используем демо-контакты
    const recipients = activeContacts.length > 0
      ? activeContacts
      : [
          { id: 'demo-1', name: 'Радио ХИТ FM', email: 'music@hitfm.ru', genre_preferences: ['Pop', 'Dance'] },
          { id: 'demo-2', name: 'Радио ENERGY', email: 'playlist@energyfm.ru', genre_preferences: ['Electronic', 'Dance'] },
          { id: 'demo-3', name: 'Европа Плюс', email: 'new@europaplus.ru', genre_preferences: ['Pop', 'R&B'] },
          { id: 'demo-4', name: 'Love Radio', email: 'tracks@loveradio.ru', genre_preferences: ['Pop', 'R&B'] },
          { id: 'demo-5', name: 'DFM', email: 'music@dfm.ru', genre_preferences: ['Electronic', 'House', 'Dance'] },
        ];

    const now = new Date().toISOString();

    // Формируем email для каждого контакта
    const emailResults = [];
    for (const contact of recipients) {
      const emailId = `newsletter_${weekKey}_${contact.id}`;
      const trackListHtml = newsletter.tracks
        .map((t: any) => `<li><b>${t.artist}</b> — ${t.title} (${t.genre})${t.yandex_music_url ? ` <a href="${t.yandex_music_url}">Слушать</a>` : ''}</li>`)
        .join('');

      const emailData = {
        id: emailId,
        user_id: 'system',
        to_email: contact.email,
        to_name: contact.name,
        subject: `ПРОМО.МУЗЫКА — Новые треки недели (${newsletter.tracks.length} шт.)`,
        content: `
          <h2>Новые треки для эфира</h2>
          <p>Команда ПРОМО.МУЗЫКА подготовила подборку ${newsletter.tracks.length} новых треков, прошедших модерацию:</p>
          <ol>${trackListHtml}</ol>
          <p>Все треки прошли экспертную оценку и рекомендованы для эфира.</p>
          <p>С уважением,<br>Команда ПРОМО.МУЗЫКА</p>
        `,
        type: 'newsletter',
        status: 'sent',
        sent_at: now,
        metadata: { weekKey, contact_id: contact.id },
      };

      await emailHistoryStore.set(emailId, emailData, { user_id: 'system' });
      emailResults.push({ contact: contact.name, email: contact.email, status: 'sent' });
    }

    // Обновляем статус рассылки
    newsletter.status = 'sent';
    newsletter.sent_at = now;
    newsletter.recipients_count = recipients.length;
    newsletter.send_results = emailResults;
    await radioNewsletterStore.set(weekKey, newsletter);

    // SSE: уведомить админов
    emitSSE('admin-1', {
      type: 'notification',
      data: {
        title: 'Рассылка треков отправлена',
        message: `${newsletter.tracks.length} треков → ${recipients.length} радиостанций`,
        category: 'pipeline',
      },
    });

    return c.json({
      success: true,
      message: `Рассылка отправлена ${recipients.length} радиостанциям`,
      recipients_count: recipients.length,
      tracks_count: newsletter.tracks.length,
      results: emailResults,
    });
  } catch (error) {
    console.error('Error in newsletter/send:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===================================================================
// ПАЙПЛАЙН: ЭКСКЛЮЗИВНАЯ ОТПРАВКА РЕДАКТОРАМ (10 000 ₽)
// ===================================================================

// POST /exclusivePitch - Эксклюзивная отправка трека редакторам
app.post('/exclusivePitch', async (c) => {
  try {
    const body = await c.req.json();
    const { trackId, target_editors } = body;
    const now = new Date().toISOString();

    const track: any = await trackModerationStore.get(trackId);
    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    if (track.moderation_status !== 'approved') {
      return c.json({ error: 'Трек должен быть одобрен' }, 400);
    }

    const pitchId = `excl_${trackId}_${Date.now()}`;

    // Редакторы по умолчанию (если не указаны)
    const editors = target_editors || [
      { id: 'ed-1', name: 'Главный редактор Hit FM', email: 'editor@hitfm.ru', role: 'chief_editor' },
      { id: 'ed-2', name: 'Музыкальный директор Европа Плюс', email: 'music.director@europaplus.ru', role: 'music_director' },
      { id: 'ed-3', name: 'A&R менеджер Universal Music Russia', email: 'ar@universal.ru', role: 'ar_manager' },
      { id: 'ed-4', name: 'Редактор Яндекс Музыка', email: 'editorial@music.yandex.ru', role: 'playlist_editor' },
      { id: 'ed-5', name: 'Музыкальный редактор VK Музыка', email: 'music@vk.team', role: 'playlist_editor' },
    ];

    const pitch = {
      id: pitchId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre,
      cover_image_url: track.cover_image_url,
      audio_file_url: track.audio_file_url,
      price: PRICING.exclusive_editors,
      status: 'sent', // sent → viewed → responded → accepted/declined
      editors: editors.map((ed: any) => ({
        ...ed,
        status: 'sent',
        sent_at: now,
        viewed_at: null,
        response: null,
      })),
      created_at: now,
      uploaded_by_email: track.uploaded_by_email,
    };

    await exclusivePitchStore.set(pitchId, pitch);

    // Обновляем трек
    track.is_exclusive = true;
    track.exclusive_price = PRICING.exclusive_editors;
    track.exclusive_sent_at = now;
    track.pipeline_status = 'exclusive_pitched';
    track.updated_at = now;
    await trackModerationStore.set(trackId, track);

    // Создаём email для каждого редактора
    for (const editor of editors) {
      const emailId = `excl_email_${pitchId}_${editor.id}`;
      await emailHistoryStore.set(emailId, {
        id: emailId,
        user_id: 'system',
        to_email: editor.email,
        to_name: editor.name,
        subject: `[ЭКСКЛЮЗИВ] ${track.artist} — ${track.title} | ПРОМО.МУЗЫКА`,
        content: `
          <h2>Эксклюзивный питчинг</h2>
          <p>Уважаемый ${editor.name},</p>
          <p>Команда ПРОМО.МУЗЫКА представляет вам эксклюзивный трек:</p>
          <h3>${track.artist} — «${track.title}»</h3>
          <p>Жанр: ${track.genre}</p>
          <p>Трек прошёл экспертную модерацию и получил высокую оценку.</p>
          ${track.yandex_music_url ? `<p><a href="${track.yandex_music_url}">Слушать на Яндекс Музыке</a></p>` : ''}
          ${track.youtube_url ? `<p><a href="${track.youtube_url}">Смотреть на YouTube</a></p>` : ''}
          <p>Этот материал предоставлен эксклюзивно ограниченному числу редакторов.</p>
          <p>С уважением,<br>Команда ПРОМО.МУЗЫКА</p>
        `,
        type: 'transactional',
        status: 'sent',
        sent_at: now,
        metadata: { pitch_id: pitchId, editor_id: editor.id, type: 'exclusive_pitch' },
      }, { user_id: 'system' });
    }

    // SSE + Revenue
    pipelineNotify(track.uploaded_by, 'Эксклюзивный питчинг отправлен', track.title, track.artist, PRICING.exclusive_editors);
    await pipelineRecordRevenue('track_exclusive', `Эксклюзив: ${track.artist} — ${track.title}`, PRICING.exclusive_editors, track.uploaded_by || 'admin', track.artist, { trackId, pitchId });

    return c.json({
      success: true,
      message: `Эксклюзивный питчинг отправлен ${editors.length} редакторам`,
      pitch_id: pitchId,
      price: PRICING.exclusive_editors,
      editors_count: editors.length,
      billing: { billing_status: 'admin_only', charged: false, price: PRICING.exclusive_editors },
    });
  } catch (error) {
    console.error('Error in exclusivePitch:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /exclusivePitches - Список эксклюзивных питчингов
app.get('/exclusivePitches', async (c) => {
  try {
    const all = await exclusivePitchStore.getAll();
    const sorted = (all || []).sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return c.json({ success: true, pitches: sorted });
  } catch (error) {
    console.error('Error in exclusivePitches:', error);
    return c.json({ success: true, pitches: [] });
  }
});

// ===================================================================
// ПАЙПЛАЙН: ПОЛНЫЙ СТАТУС И ЦЕНООБРАЗОВАНИЕ
// ===================================================================

// GET /pipeline/:trackId - Полный статус пайплайна трека
app.get('/pipeline/:trackId', async (c) => {
  try {
    const trackId = c.req.param('trackId');
    const track: any = await trackModerationStore.get(trackId);

    if (!track) {
      return c.json({ error: 'Track not found' }, 404);
    }

    // Собираем данные из всех stores
    const releaseId = `nr_${trackId}`;
    const release = await newReleasesStore.get(releaseId);
    const exclusivePitches = await exclusivePitchStore.getAll();
    const trackPitches = (exclusivePitches || []).filter((p: any) => p.trackId === trackId);

    return c.json({
      success: true,
      pipeline: {
        track: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          genre: track.genre,
          moderation_status: track.moderation_status,
          pipeline_status: track.pipeline_status,
          created_at: track.created_at,
        },
        steps: {
          moderation: {
            status: track.moderation_status,
            score: track.overall_score,
            notes: track.moderator_notes,
          },
          novelty: {
            is_active: track.is_in_novelty || false,
            promoted_at: track.promoted_at,
            price: PRICING.novelty,
            release: release || null,
          },
          newsletter: {
            is_included: track.is_in_newsletter || false,
            added_at: track.newsletter_added_at,
            price: PRICING.weekly_newsletter,
          },
          exclusive: {
            is_sent: track.is_exclusive || false,
            sent_at: track.exclusive_sent_at,
            price: PRICING.exclusive_editors,
            pitches: trackPitches,
          },
        },
        pricing: PRICING,
      },
    });
  } catch (error) {
    console.error('Error in pipeline status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /pricing - Получить ценообразование
app.get('/pricing', async (c) => {
  return c.json({
    success: true,
    pricing: PRICING,
    description: {
      novelty: 'Размещение в разделе «Новинки» на главной странице (2 недели)',
      weekly_newsletter: 'Включение в еженедельную рассылку для 500+ радиостанций',
      exclusive_editors: 'Эксклюзивная персональная отправка музыкальным редакторам и A&R менеджерам',
    },
  });
});

// ===================================================================
// УПРАВЛЕНИЕ КОНТАКТАМИ РАДИОСТАНЦИЙ
// ===================================================================

// GET /radioContacts - Список контактов радиостанций
app.get('/radioContacts', async (c) => {
  try {
    const contacts = await radioContactsStore.getAll();
    return c.json({ success: true, contacts: contacts || [] });
  } catch (error) {
    return c.json({ success: true, contacts: [] });
  }
});

// POST /radioContacts - Добавить контакт радиостанции
app.post('/radioContacts', async (c) => {
  try {
    const body = await c.req.json();
    const contactId = `rc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const contact = {
      id: contactId,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      city: body.city || '',
      genre_preferences: body.genre_preferences || [],
      is_active: true,
      created_at: now,
    };

    await radioContactsStore.set(contactId, contact);
    return c.json({ success: true, contact });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===================================================================
// МАССОВЫЕ ОПЕРАЦИИ И УТИЛИТЫ
// ===================================================================

// POST /batchModeration - Массовая модерация
app.post('/batchModeration', async (c) => {
  try {
    const body = await c.req.json();
    const { trackIds, action } = body;
    const now = new Date().toISOString();

    const results = [];
    for (const trackId of trackIds) {
      const track: any = await trackModerationStore.get(trackId);
      if (!track) {
        results.push({ trackId, success: false, message: 'Not found' });
        continue;
      }
      track.moderation_status = action === 'approve' ? 'approved' : 'rejected';
      track.pipeline_status = action === 'approve' ? 'moderated' : 'rejected';
      track.updated_at = now;
      await trackModerationStore.set(trackId, track);
      results.push({ trackId, success: true, message: `${action} successful` });
    }

    return c.json({
      success: true,
      message: `Processed ${trackIds.length} tracks`,
      results,
    });
  } catch (error) {
    console.error('Error in batchModeration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /genres - Получить список жанров
app.get('/genres', async (c) => {
  return c.json({ genres: GENRES });
});

// GET /uploadStats - Статистика загрузок
app.get('/uploadStats', async (c) => {
  try {
    return c.json({
      current: 0,
      limit: 10,
      remaining: 10,
      subscription: 'artist_pro',
    });
  } catch (error) {
    console.error('Error in uploadStats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /stats - Статистика модерации для админов
app.get('/stats', async (c) => {
  try {
    const allTracks = await trackModerationStore.getAll();
    const tracks = allTracks || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newReleases = await newReleasesStore.getAll();
    const activeReleases = (newReleases || []).filter((r: any) => r.is_active);
    const exclusives = await exclusivePitchStore.getAll();

    const stats = {
      total: tracks.length,
      pending: tracks.filter((t: any) => t.moderation_status === 'pending').length,
      approved: tracks.filter((t: any) =>
        t.moderation_status === 'approved' ||
        t.moderation_status === 'approved_and_migrated'
      ).length,
      rejected: tracks.filter((t: any) => t.moderation_status === 'rejected').length,
      todayCount: tracks.filter((t: any) => {
        const trackDate = new Date(t.created_at);
        return trackDate >= today;
      }).length,
      // Pipeline stats
      in_novelty: activeReleases.length,
      in_newsletter: tracks.filter((t: any) => t.is_in_newsletter).length,
      exclusive_pitches: (exclusives || []).length,
      pipeline: {
        awaiting_moderation: tracks.filter((t: any) => t.pipeline_status === 'awaiting_moderation' || !t.pipeline_status).length,
        moderated: tracks.filter((t: any) => t.pipeline_status === 'moderated').length,
        in_novelty: tracks.filter((t: any) => t.pipeline_status === 'in_novelty').length,
        in_newsletter: tracks.filter((t: any) => t.pipeline_status === 'in_newsletter').length,
        exclusive_pitched: tracks.filter((t: any) => t.pipeline_status === 'exclusive_pitched').length,
        completed: tracks.filter((t: any) => t.pipeline_status === 'completed').length,
      },
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error in stats:', error);
    return c.json({ total: 0, pending: 0, approved: 0, rejected: 0, todayCount: 0 });
  }
});

// ===================================================================
// HELPERS
// ===================================================================

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default app;
