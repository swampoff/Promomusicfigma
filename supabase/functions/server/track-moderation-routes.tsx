/**
 * TRACK MODERATION ROUTES - Модерация загруженных треков
 */

import { Hono } from 'npm:hono@4';
import { trackModerationStore } from './db.tsx';

const app = new Hono();

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Dance',
  'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass',
  'Jazz', 'Blues', 'Classical', 'Country', 'Folk',
  'Reggae', 'Afrobeat', 'Metal', 'Punk', 'Indie', 'Alternative',
  'Soul', 'Funk', 'Disco', 'Gospel', 'Latin', 'World'
];

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
      uploaded_by_email: body.uploaded_by_email || '',
      uploaded_by_user_id: body.uploaded_by_user_id || '',
      moderation_status: 'pending',
      overall_score: null,
      moderator_notes: null,
      rejection_reason: null,
      created_at: now,
      updated_at: now,
    };

    await trackModerationStore.set(trackId, track);

    return c.json({
      success: true,
      pending_track_id: trackId,
      message: 'Трек отправлен на модерацию'
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

    const allTracks = await trackModerationStore.getAll();
    let filteredTracks = allTracks || [];

    // Фильтр по статусу
    if (status && status !== 'all') {
      filteredTracks = filteredTracks.filter((t: any) => t.moderation_status === status);
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

// POST /manageTrackModeration - Модерация трека
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
      track.overall_score = overall_score || null;
      track.moderator_notes = moderator_notes || null;
      track.updated_at = now;
      await trackModerationStore.set(pendingTrackId, track);

      return c.json({
        success: true,
        message: 'Трек одобрен',
        trackId: pendingTrackId,
        coinsAwarded: 50
      });
    } else if (action === 'reject') {
      track.moderation_status = 'rejected';
      track.rejection_reason = rejection_reason || '';
      track.moderator_notes = moderator_notes || null;
      track.updated_at = now;
      await trackModerationStore.set(pendingTrackId, track);

      return c.json({
        success: true,
        message: 'Трек отклонён'
      });
    } else {
      return c.json({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    console.error('Error in manageTrackModeration:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

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
      track.updated_at = now;
      await trackModerationStore.set(trackId, track);
      results.push({ trackId, success: true, message: `${action} successful` });
    }

    return c.json({
      success: true,
      message: `Processed ${trackIds.length} tracks`,
      results
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
      subscription: 'artist_pro'
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
      }).length
    };

    return c.json(stats);
  } catch (error) {
    console.error('Error in stats:', error);
    return c.json({ total: 0, pending: 0, approved: 0, rejected: 0, todayCount: 0 });
  }
});

export default app;
