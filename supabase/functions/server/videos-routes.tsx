/**
 * VIDEO MODERATION & PIPELINE ROUTES
 *
 * Полный пайплайн клипа:
 * 1. Загрузка → модерация (pending → approved/rejected)
 * 2. После одобрения → администратор решает:
 *    a) Добавить в «Новые клипы» на главную (10 000 ₽)
 *    b) Включить в еженедельную рассылку для радиостанций / ТВ (бесплатно)
 *    c) Эксклюзивная отправка редакторам (15 000 ₽)
 */

import { Hono } from 'npm:hono@4';
import * as db from './db.tsx';
import { videoModerationStore, videoNewReleasesStore, videoNewsletterStore, videoExclusivePitchStore, radioContactsStore, emailHistoryStore } from './db.tsx';
import { resolveUserId } from './resolve-user-id.tsx';
import { emitSSE } from './sse-routes.tsx';
import { recordRevenue } from './platform-revenue.tsx';

const videosRoutes = new Hono();

/** Pipeline SSE + Revenue helper (видео) */
function videoPipelineNotify(userId: string | undefined, step: string, title: string, artist: string, price: number) {
  if (userId) {
    emitSSE(userId, {
      type: 'notification',
      data: {
        title: `Пайплайн клипа: ${step}`,
        message: `Ваш клип «${title}» — ${step}`,
        category: 'pipeline',
        price,
      },
    });
  }
  emitSSE('admin-1', {
    type: 'notification',
    data: {
      title: `Пайплайн клипа: ${step}`,
      message: `${artist} — ${title} (${price > 0 ? price.toLocaleString('ru-RU') + ' ₽' : 'бесплатно'})`,
      category: 'pipeline',
    },
  });
}

async function videoPipelineRevenue(channel: string, description: string, amount: number, userId: string, artistName: string, metadata?: Record<string, any>) {
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
const FALLBACK_USER = 'anonymous';

const VIDEO_CATEGORIES = [
  'Музыкальный клип', 'Лирик-видео', 'Live выступление', 'Behind the scenes',
  'Интервью', 'Vlog', 'Короткое видео', 'Другое',
];

// Ценообразование пайплайна клипов
const VIDEO_PRICING = {
  novelty: 10000,           // Попасть в «Новые клипы» — 10 000 ₽
  weekly_newsletter: 0,     // Еженедельная рассылка — бесплатно
  exclusive_editors: 15000, // Эксклюзивная отправка редакторам — 15 000 ₽
};

// ===================================================================
// ОСНОВНЫЕ CRUD (существующие)
// ===================================================================

videosRoutes.get('/', async (c) => {
  try {
    const userId = await resolveUserId(c, FALLBACK_USER);
    const videos = await db.getVideosByUser(userId);
    return c.json({ success: true, data: videos || [] });
  } catch (error) {
    return c.json({ success: true, data: [] });
  }
});

videosRoutes.post('/', async (c) => {
  try {
    const userId = await resolveUserId(c, FALLBACK_USER);
    const body = await c.req.json();
    const videoId = body.id || `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const video = {
      id: videoId, views: 0, likes: 0,
      ...body, userId,
      createdAt: body.createdAt || now, updatedAt: now,
    };
    await db.upsertVideo(userId, videoId, video);
    return c.json({ success: true, data: video }, 201);
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===================================================================
// ЗАГРУЗКА И МОДЕРАЦИЯ КЛИПОВ
// ===================================================================

// POST /submitVideo - Загрузить клип на модерацию
videosRoutes.post('/submitVideo', async (c) => {
  try {
    const body = await c.req.json();
    const videoId = `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const clip = {
      id: videoId,
      title: body.title || '',
      artist: body.artist || '',
      thumbnail_url: body.thumbnail_url || '',
      video_url: body.video_url || '',
      video_file_url: body.video_file_url || '',
      video_source: body.video_source || 'link', // 'file' | 'link'
      category: body.category || '',
      description: body.description || '',
      tags: body.tags || [],
      duration: body.duration || 0,
      genre: body.genre || '',
      release_date: body.release_date || '',
      youtube_url: body.youtube_url || '',
      rutube_url: body.rutube_url || '',
      vk_video_url: body.vk_video_url || '',
      uploaded_by_email: body.uploaded_by_email || '',
      uploaded_by_user_id: body.uploaded_by_user_id || '',
      creators: body.creators || {},
      moderation_status: 'pending',
      // Pipeline статусы
      pipeline_status: 'awaiting_moderation',
      is_in_novelty: false,
      is_in_newsletter: false,
      is_exclusive: body.is_exclusive || false,
      exclusive_price: body.is_exclusive ? VIDEO_PRICING.exclusive_editors : 0,
      novelty_price: VIDEO_PRICING.novelty,
      overall_score: null,
      moderator_notes: null,
      rejection_reason: null,
      promoted_at: null,
      newsletter_added_at: null,
      exclusive_sent_at: null,
      views: 0,
      likes: 0,
      created_at: now,
      updated_at: now,
    };

    await videoModerationStore.set(videoId, clip);

    return c.json({
      success: true,
      pending_video_id: videoId,
      message: 'Клип отправлен на модерацию',
      pricing: {
        novelty: VIDEO_PRICING.novelty,
        exclusive: VIDEO_PRICING.exclusive_editors,
        note: 'Оплата после прохождения модерации',
      },
    });
  } catch (error) {
    console.error('Error in submitVideo:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /pendingVideos - Получить клипы по статусу
videosRoutes.get('/pendingVideos', async (c) => {
  try {
    const status = c.req.query('status') || 'pending';
    const category = c.req.query('category');
    const search = c.req.query('search');
    const pipeline = c.req.query('pipeline');

    const allClips = await videoModerationStore.getAll();
    let filtered = allClips || [];

    if (status && status !== 'all') {
      filtered = filtered.filter((v: any) => v.moderation_status === status);
    }

    if (pipeline) {
      filtered = filtered.filter((v: any) => v.pipeline_status === pipeline);
    }

    if (category) {
      filtered = filtered.filter((v: any) => v.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((v: any) =>
        (v.title || '').toLowerCase().includes(searchLower) ||
        (v.artist || '').toLowerCase().includes(searchLower)
      );
    }

    return c.json({ videos: filtered });
  } catch (error) {
    console.error('Error in pendingVideos:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /manageVideoModeration - Модерация клипа (approve/reject)
videosRoutes.post('/manageVideoModeration', async (c) => {
  try {
    const body = await c.req.json();
    const { pendingVideoId, action, moderator_notes, rejection_reason, overall_score } = body;

    const clip: any = await videoModerationStore.get(pendingVideoId);
    if (!clip) {
      return c.json({ error: 'Video not found' }, 404);
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      clip.moderation_status = 'approved';
      clip.pipeline_status = 'moderated';
      clip.overall_score = overall_score || null;
      clip.moderator_notes = moderator_notes || null;
      clip.updated_at = now;
      await videoModerationStore.set(pendingVideoId, clip);

      return c.json({
        success: true,
        message: 'Клип одобрен. Доступны действия: Новые клипы, рассылка, эксклюзив',
        videoId: pendingVideoId,
        coinsAwarded: 75,
        nextActions: ['promote_to_novelty', 'add_to_newsletter', 'exclusive_pitch'],
      });
    } else if (action === 'reject') {
      clip.moderation_status = 'rejected';
      clip.pipeline_status = 'rejected';
      clip.rejection_reason = rejection_reason || '';
      clip.moderator_notes = moderator_notes || null;
      clip.updated_at = now;
      await videoModerationStore.set(pendingVideoId, clip);

      return c.json({
        success: true,
        message: 'Клип отклонён',
      });
    } else {
      return c.json({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Error in manageVideoModeration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===================================================================
// ПАЙПЛАЙН: НОВЫЕ КЛИПЫ НА ГЛАВНУЮ
// ===================================================================

// POST /promoteToNovelty - Администратор добавляет клип в «Новые клипы»
videosRoutes.post('/promoteToNovelty', async (c) => {
  try {
    const body = await c.req.json();
    const { videoId, position } = body;
    const now = new Date().toISOString();

    const clip: any = await videoModerationStore.get(videoId);
    if (!clip) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (clip.moderation_status !== 'approved') {
      return c.json({ error: 'Клип должен быть одобрен модерацией' }, 400);
    }

    clip.is_in_novelty = true;
    clip.pipeline_status = 'in_novelty';
    clip.promoted_at = now;
    clip.updated_at = now;
    await videoModerationStore.set(videoId, clip);

    const release = {
      id: `vr_${videoId}`,
      videoId: clip.id,
      title: clip.title,
      artist: clip.artist,
      category: clip.category,
      genre: clip.genre,
      thumbnail_url: clip.thumbnail_url,
      video_url: clip.video_url,
      video_file_url: clip.video_file_url,
      youtube_url: clip.youtube_url,
      rutube_url: clip.rutube_url,
      vk_video_url: clip.vk_video_url,
      duration: clip.duration,
      position: position || 0,
      promoted_at: now,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 недели
      is_active: true,
      views: 0,
      likes: 0,
    };

    await videoNewReleasesStore.set(release.id, release);

    // SSE + Revenue
    videoPipelineNotify(clip.uploaded_by, 'Добавлен в Новые клипы', clip.title, clip.artist, VIDEO_PRICING.novelty);
    await videoPipelineRevenue('video_novelty', `Новые клипы: ${clip.artist} — ${clip.title}`, VIDEO_PRICING.novelty, clip.uploaded_by || 'admin', clip.artist, { videoId });

    return c.json({
      success: true,
      message: `Клип "${clip.title}" добавлен в Новые клипы на главную`,
      release,
      price: VIDEO_PRICING.novelty,
      billing: { billing_status: 'admin_only', charged: false, price: VIDEO_PRICING.novelty },
    });
  } catch (error) {
    console.error('Error in video promoteToNovelty:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// DELETE /removeFromNovelty/:videoId - Убрать из Новых клипов
videosRoutes.delete('/removeFromNovelty/:videoId', async (c) => {
  try {
    const videoId = c.req.param('videoId');

    const clip: any = await videoModerationStore.get(videoId);
    if (clip) {
      clip.is_in_novelty = false;
      clip.pipeline_status = 'moderated';
      clip.updated_at = new Date().toISOString();
      await videoModerationStore.set(videoId, clip);
    }

    const releaseId = `vr_${videoId}`;
    const release: any = await videoNewReleasesStore.get(releaseId);
    if (release) {
      release.is_active = false;
      await videoNewReleasesStore.set(releaseId, release);
    }

    return c.json({ success: true, message: 'Клип убран из Новых клипов' });
  } catch (error) {
    console.error('Error in video removeFromNovelty:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /newClips - Получить текущие Новые клипы (для главной страницы)
videosRoutes.get('/newClips', async (c) => {
  try {
    const all = await videoNewReleasesStore.getAll();
    const now = new Date().toISOString();

    const active = (all || [])
      .filter((r: any) => r.is_active && r.expires_at > now)
      .sort((a: any, b: any) => {
        if (a.position !== b.position) return a.position - b.position;
        return new Date(b.promoted_at).getTime() - new Date(a.promoted_at).getTime();
      });

    return c.json({ success: true, clips: active });
  } catch (error) {
    console.error('Error in newClips:', error);
    return c.json({ success: true, clips: [] });
  }
});

// ===================================================================
// ПАЙПЛАЙН: ЕЖЕНЕДЕЛЬНАЯ РАССЫЛКА ДЛЯ ТВ И РАДИО
// ===================================================================

// POST /addToNewsletter - Добавить клип в еженедельную рассылку
videosRoutes.post('/addToNewsletter', async (c) => {
  try {
    const body = await c.req.json();
    const { videoId } = body;
    const now = new Date().toISOString();

    const clip: any = await videoModerationStore.get(videoId);
    if (!clip) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (clip.moderation_status !== 'approved') {
      return c.json({ error: 'Клип должен быть одобрен' }, 400);
    }

    const weekStart = getWeekStart(new Date());
    const weekKey = `vweek_${weekStart.toISOString().split('T')[0]}`;

    let newsletter: any = await videoNewsletterStore.get(weekKey);
    if (!newsletter) {
      newsletter = {
        id: weekKey,
        week_start: weekStart.toISOString(),
        week_end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        clips: [],
        status: 'draft',
        created_at: now,
        sent_at: null,
        recipients_count: 0,
      };
    }

    if (newsletter.clips.some((v: any) => v.videoId === videoId)) {
      return c.json({ error: 'Клип уже в рассылке этой недели' }, 400);
    }

    newsletter.clips.push({
      videoId: clip.id,
      title: clip.title,
      artist: clip.artist,
      category: clip.category,
      genre: clip.genre,
      thumbnail_url: clip.thumbnail_url,
      video_url: clip.video_url,
      youtube_url: clip.youtube_url,
      added_at: now,
    });

    newsletter.updated_at = now;
    await videoNewsletterStore.set(weekKey, newsletter);

    clip.is_in_newsletter = true;
    clip.newsletter_added_at = now;
    clip.pipeline_status = 'in_newsletter';
    clip.updated_at = now;
    await videoModerationStore.set(videoId, clip);

    // SSE
    videoPipelineNotify(clip.uploaded_by, 'Добавлен в рассылку', clip.title, clip.artist, 0);

    return c.json({
      success: true,
      message: `Клип "${clip.title}" добавлен в рассылку (неделя ${weekKey})`,
      newsletter_week: weekKey,
      clips_in_newsletter: newsletter.clips.length,
    });
  } catch (error) {
    console.error('Error in video addToNewsletter:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /newsletter/current - Текущая рассылка недели (клипы)
videosRoutes.get('/newsletter/current', async (c) => {
  try {
    const weekStart = getWeekStart(new Date());
    const weekKey = `vweek_${weekStart.toISOString().split('T')[0]}`;

    const newsletter = await videoNewsletterStore.get(weekKey);

    return c.json({
      success: true,
      newsletter: newsletter || {
        id: weekKey,
        week_start: weekStart.toISOString(),
        clips: [],
        status: 'draft',
      },
    });
  } catch (error) {
    console.error('Error in video newsletter/current:', error);
    return c.json({ success: true, newsletter: { clips: [], status: 'draft' } });
  }
});

// GET /newsletter/history - История рассылок клипов
videosRoutes.get('/newsletter/history', async (c) => {
  try {
    const all = await videoNewsletterStore.getAll();
    const sorted = (all || []).sort((a: any, b: any) =>
      new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    );
    return c.json({ success: true, newsletters: sorted });
  } catch (error) {
    console.error('Error in video newsletter/history:', error);
    return c.json({ success: true, newsletters: [] });
  }
});

// POST /newsletter/send - Отправить рассылку клипов
videosRoutes.post('/newsletter/send', async (c) => {
  try {
    const body = await c.req.json();
    const weekKey = body.weekKey;

    const newsletter: any = await videoNewsletterStore.get(weekKey);
    if (!newsletter) {
      return c.json({ error: 'Рассылка не найдена' }, 404);
    }

    if (newsletter.clips.length === 0) {
      return c.json({ error: 'Нет клипов в рассылке' }, 400);
    }

    const contacts = await radioContactsStore.getAll();
    const activeContacts = (contacts || []).filter((c: any) => c.is_active && c.email);

    const recipients = activeContacts.length > 0
      ? activeContacts
      : [
          { id: 'demo-tv-1', name: 'МУZТВ', email: 'clips@muztv.ru', genre_preferences: ['Pop', 'Dance'] },
          { id: 'demo-tv-2', name: 'RU.TV', email: 'rotation@rutv.ru', genre_preferences: ['Pop', 'Hip-Hop'] },
          { id: 'demo-tv-3', name: 'MTV Россия', email: 'new@mtvrussia.ru', genre_preferences: ['Pop', 'R&B', 'Hip-Hop'] },
          { id: 'demo-1', name: 'Радио ХИТ FM', email: 'music@hitfm.ru', genre_preferences: ['Pop', 'Dance'] },
          { id: 'demo-2', name: 'Европа Плюс', email: 'new@europaplus.ru', genre_preferences: ['Pop', 'R&B'] },
        ];

    const now = new Date().toISOString();

    const emailResults = [];
    for (const contact of recipients) {
      const emailId = `vnewsletter_${weekKey}_${contact.id}`;
      const clipListHtml = newsletter.clips
        .map((v: any) => `<li><b>${v.artist}</b> — ${v.title} (${v.category})${v.youtube_url ? ` <a href="${v.youtube_url}">Смотреть</a>` : ''}</li>`)
        .join('');

      const emailData = {
        id: emailId,
        user_id: 'system',
        to_email: contact.email,
        to_name: contact.name,
        subject: `ПРОМО.МУЗЫКА — Новые клипы недели (${newsletter.clips.length} шт.)`,
        content: `
          <h2>Новые клипы для ротации</h2>
          <p>Команда ПРОМО.МУЗЫКА подготовила подборку ${newsletter.clips.length} новых клипов, прошедших модерацию:</p>
          <ol>${clipListHtml}</ol>
          <p>Все клипы прошли экспертную оценку и рекомендованы для ротации.</p>
          <p>С уважением,<br>Команда ПРОМО.МУЗЫКА</p>
        `,
        type: 'newsletter',
        status: 'sent',
        sent_at: now,
        metadata: { weekKey, contact_id: contact.id, content_type: 'video' },
      };

      await emailHistoryStore.set(emailId, emailData, { user_id: 'system' });
      emailResults.push({ contact: contact.name, email: contact.email, status: 'sent' });
    }

    newsletter.status = 'sent';
    newsletter.sent_at = now;
    newsletter.recipients_count = recipients.length;
    newsletter.send_results = emailResults;
    await videoNewsletterStore.set(weekKey, newsletter);

    // SSE: уведомить админов
    emitSSE('admin-1', {
      type: 'notification',
      data: {
        title: 'Рассылка клипов отправлена',
        message: `${newsletter.clips.length} клипов → ${recipients.length} получателей`,
        category: 'pipeline',
      },
    });

    return c.json({
      success: true,
      message: `Рассылка клипов отправлена ${recipients.length} получателям`,
      recipients_count: recipients.length,
      clips_count: newsletter.clips.length,
      results: emailResults,
    });
  } catch (error) {
    console.error('Error in video newsletter/send:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ===================================================================
// ПАЙПЛАЙН: ЭКСКЛЮЗИВНАЯ ОТПРАВКА РЕДАКТОРАМ (15 000 ₽)
// ===================================================================

// POST /exclusivePitch - Эксклюзивная отправка клипа редакторам
videosRoutes.post('/exclusivePitch', async (c) => {
  try {
    const body = await c.req.json();
    const { videoId, target_editors } = body;
    const now = new Date().toISOString();

    const clip: any = await videoModerationStore.get(videoId);
    if (!clip) {
      return c.json({ error: 'Video not found' }, 404);
    }

    if (clip.moderation_status !== 'approved') {
      return c.json({ error: 'Клип должен быть одобрен' }, 400);
    }

    const pitchId = `vexcl_${videoId}_${Date.now()}`;

    const editors = target_editors || [
      { id: 'ved-1', name: 'Программный директор МУZТВ', email: 'director@muztv.ru', role: 'program_director' },
      { id: 'ved-2', name: 'Главный редактор RU.TV', email: 'editor@rutv.ru', role: 'chief_editor' },
      { id: 'ved-3', name: 'A&R менеджер Universal Music Russia', email: 'ar@universal.ru', role: 'ar_manager' },
      { id: 'ved-4', name: 'Редактор YouTube Music Россия', email: 'editorial@youtube.ru', role: 'playlist_editor' },
      { id: 'ved-5', name: 'Музыкальный редактор VK Клипы', email: 'clips@vk.team', role: 'clips_editor' },
    ];

    const pitch = {
      id: pitchId,
      videoId: clip.id,
      title: clip.title,
      artist: clip.artist,
      category: clip.category,
      genre: clip.genre,
      thumbnail_url: clip.thumbnail_url,
      video_url: clip.video_url,
      youtube_url: clip.youtube_url,
      price: VIDEO_PRICING.exclusive_editors,
      status: 'sent',
      editors: editors.map((ed: any) => ({
        ...ed,
        status: 'sent',
        sent_at: now,
        viewed_at: null,
        response: null,
      })),
      created_at: now,
      uploaded_by_email: clip.uploaded_by_email,
    };

    await videoExclusivePitchStore.set(pitchId, pitch);

    clip.is_exclusive = true;
    clip.exclusive_price = VIDEO_PRICING.exclusive_editors;
    clip.exclusive_sent_at = now;
    clip.pipeline_status = 'exclusive_pitched';
    clip.updated_at = now;
    await videoModerationStore.set(videoId, clip);

    for (const editor of editors) {
      const emailId = `vexcl_email_${pitchId}_${editor.id}`;
      await emailHistoryStore.set(emailId, {
        id: emailId,
        user_id: 'system',
        to_email: editor.email,
        to_name: editor.name,
        subject: `[ЭКСКЛЮЗИВ] Клип: ${clip.artist} — ${clip.title} | ПРОМО.МУЗЫКА`,
        content: `
          <h2>Эксклюзивный питчинг клипа</h2>
          <p>Уважаемый ${editor.name},</p>
          <p>Команда ПРОМО.МУЗЫКА представляет вам эксклюзивный клип:</p>
          <h3>${clip.artist} — «${clip.title}»</h3>
          <p>Категория: ${clip.category} | Жанр: ${clip.genre}</p>
          <p>Клип прошёл экспертную модерацию и получил высокую оценку.</p>
          ${clip.youtube_url ? `<p><a href="${clip.youtube_url}">Смотреть на YouTube</a></p>` : ''}
          ${clip.rutube_url ? `<p><a href="${clip.rutube_url}">Смотреть на RuTube</a></p>` : ''}
          <p>Этот материал предоставлен эксклюзивно ограниченному числу редакторов.</p>
          <p>С уважением,<br>Команда ПРОМО.МУЗЫКА</p>
        `,
        type: 'transactional',
        status: 'sent',
        sent_at: now,
        metadata: { pitch_id: pitchId, editor_id: editor.id, type: 'video_exclusive_pitch' },
      }, { user_id: 'system' });
    }

    // SSE + Revenue
    videoPipelineNotify(clip.uploaded_by, 'Эксклюзивный питчинг отправлен', clip.title, clip.artist, VIDEO_PRICING.exclusive_editors);
    await videoPipelineRevenue('video_exclusive', `Эксклюзив клип: ${clip.artist} — ${clip.title}`, VIDEO_PRICING.exclusive_editors, clip.uploaded_by || 'admin', clip.artist, { videoId, pitchId });

    return c.json({
      success: true,
      message: `Эксклюзивный питчинг клипа отправлен ${editors.length} редакторам`,
      pitch_id: pitchId,
      price: VIDEO_PRICING.exclusive_editors,
      editors_count: editors.length,
      billing: { billing_status: 'admin_only', charged: false, price: VIDEO_PRICING.exclusive_editors },
    });
  } catch (error) {
    console.error('Error in video exclusivePitch:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /exclusivePitches - Список эксклюзивных питчингов клипов
videosRoutes.get('/exclusivePitches', async (c) => {
  try {
    const all = await videoExclusivePitchStore.getAll();
    const sorted = (all || []).sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return c.json({ success: true, pitches: sorted });
  } catch (error) {
    console.error('Error in video exclusivePitches:', error);
    return c.json({ success: true, pitches: [] });
  }
});

// ===================================================================
// ПОЛНЫЙ СТАТУС И ЦЕНООБРАЗОВАНИЕ
// ===================================================================

// GET /pipeline/:videoId - Полный статус пайплайна клипа
videosRoutes.get('/pipeline/:videoId', async (c) => {
  try {
    const videoId = c.req.param('videoId');
    const clip: any = await videoModerationStore.get(videoId);

    if (!clip) {
      return c.json({ error: 'Video not found' }, 404);
    }

    const releaseId = `vr_${videoId}`;
    const release = await videoNewReleasesStore.get(releaseId);
    const exclusivePitches = await videoExclusivePitchStore.getAll();
    const clipPitches = (exclusivePitches || []).filter((p: any) => p.videoId === videoId);

    return c.json({
      success: true,
      pipeline: {
        video: {
          id: clip.id,
          title: clip.title,
          artist: clip.artist,
          category: clip.category,
          genre: clip.genre,
          moderation_status: clip.moderation_status,
          pipeline_status: clip.pipeline_status,
          created_at: clip.created_at,
        },
        steps: {
          moderation: {
            status: clip.moderation_status,
            score: clip.overall_score,
            notes: clip.moderator_notes,
          },
          novelty: {
            is_active: clip.is_in_novelty || false,
            promoted_at: clip.promoted_at,
            price: VIDEO_PRICING.novelty,
            release: release || null,
          },
          newsletter: {
            is_included: clip.is_in_newsletter || false,
            added_at: clip.newsletter_added_at,
            price: VIDEO_PRICING.weekly_newsletter,
          },
          exclusive: {
            is_sent: clip.is_exclusive || false,
            sent_at: clip.exclusive_sent_at,
            price: VIDEO_PRICING.exclusive_editors,
            pitches: clipPitches,
          },
        },
        pricing: VIDEO_PRICING,
      },
    });
  } catch (error) {
    console.error('Error in video pipeline status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /pricing - Ценообразование клипов
videosRoutes.get('/pricing', async (c) => {
  return c.json({
    success: true,
    pricing: VIDEO_PRICING,
    description: {
      novelty: 'Размещение в разделе «Новые клипы» на главной странице (2 недели)',
      weekly_newsletter: 'Включение в еженедельную рассылку для ТВ-каналов и радиостанций',
      exclusive_editors: 'Эксклюзивная персональная отправка ТВ-редакторам и A&R менеджерам',
    },
  });
});

// POST /batchModeration - Массовая модерация клипов
videosRoutes.post('/batchModeration', async (c) => {
  try {
    const body = await c.req.json();
    const { videoIds, action } = body;
    const now = new Date().toISOString();

    const results = [];
    for (const videoId of videoIds) {
      const clip: any = await videoModerationStore.get(videoId);
      if (!clip) {
        results.push({ videoId, success: false, message: 'Not found' });
        continue;
      }
      clip.moderation_status = action === 'approve' ? 'approved' : 'rejected';
      clip.pipeline_status = action === 'approve' ? 'moderated' : 'rejected';
      clip.updated_at = now;
      await videoModerationStore.set(videoId, clip);
      results.push({ videoId, success: true, message: `${action} successful` });
    }

    return c.json({
      success: true,
      message: `Processed ${videoIds.length} videos`,
      results,
    });
  } catch (error) {
    console.error('Error in video batchModeration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /categories - Список категорий клипов
videosRoutes.get('/categories', async (c) => {
  return c.json({ categories: VIDEO_CATEGORIES });
});

// GET /stats - Статистика модерации клипов
videosRoutes.get('/stats', async (c) => {
  try {
    const allClips = await videoModerationStore.getAll();
    const clips = allClips || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newClips = await videoNewReleasesStore.getAll();
    const activeClips = (newClips || []).filter((r: any) => r.is_active);
    const exclusives = await videoExclusivePitchStore.getAll();

    const stats = {
      total: clips.length,
      pending: clips.filter((v: any) => v.moderation_status === 'pending').length,
      approved: clips.filter((v: any) => v.moderation_status === 'approved').length,
      rejected: clips.filter((v: any) => v.moderation_status === 'rejected').length,
      todayCount: clips.filter((v: any) => {
        const clipDate = new Date(v.created_at);
        return clipDate >= today;
      }).length,
      in_novelty: activeClips.length,
      in_newsletter: clips.filter((v: any) => v.is_in_newsletter).length,
      exclusive_pitches: (exclusives || []).length,
      pipeline: {
        awaiting_moderation: clips.filter((v: any) => v.pipeline_status === 'awaiting_moderation' || !v.pipeline_status).length,
        moderated: clips.filter((v: any) => v.pipeline_status === 'moderated').length,
        in_novelty: clips.filter((v: any) => v.pipeline_status === 'in_novelty').length,
        in_newsletter: clips.filter((v: any) => v.pipeline_status === 'in_newsletter').length,
        exclusive_pitched: clips.filter((v: any) => v.pipeline_status === 'exclusive_pitched').length,
        completed: clips.filter((v: any) => v.pipeline_status === 'completed').length,
      },
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error in video stats:', error);
    return c.json({ total: 0, pending: 0, approved: 0, rejected: 0, todayCount: 0 });
  }
});

// ===================================================================
// HELPERS
// ===================================================================

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default videosRoutes;
