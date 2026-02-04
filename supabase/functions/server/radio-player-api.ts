/**
 * RADIO PLAYER API - Управление подключением плееров заведений
 * 
 * Функционал:
 * - Регистрация плееров (веб, hardware, mobile)
 * - Выдача stream URL и WebSocket credentials
 * - Управление состоянием плееров
 * - Синхронизация плейлистов
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Hono } from 'npm:hono@4';
import type { Context } from 'npm:hono@4';

const radioPlayerApi = new Hono();

// =====================================================
// TYPES
// =====================================================

interface RegisterPlayerRequest {
  venue_id: string;
  player_type: 'web' | 'hardware' | 'mobile';
  device_id: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface PlayerConfig {
  player_id: string;
  stream_url: string;
  websocket_url: string;
  auth_token: string;
  config: {
    playlist_id: string | null;
    volume: number;
    crossfade: number;
    jingle_frequency: number;
  };
}

interface PlayerStatus {
  is_playing: boolean;
  current_track: any | null;
  current_time: number;
  volume: number;
  timestamp: number;
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Генерация JWT токена для плеера
 */
function generatePlayerToken(playerId: string, venueId: string): string {
  // В продакшене использовать реальный JWT
  // import { create } from 'npm:djwt@3';
  
  const payload = {
    player_id: playerId,
    venue_id: venueId,
    type: 'player_auth',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 дней
  };
  
  // Временно - простой токен (заменить на настоящий JWT)
  return `player_${playerId}_${Date.now()}`;
}

/**
 * Генерация Stream URL для плеера
 */
function generateStreamUrl(playerId: string, venueId: string): string {
  const projectId = Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0];
  return `https://${projectId}.supabase.co/storage/v1/object/public/radio-streams/venue-${venueId}/stream.m3u8`;
}

/**
 * Генерация WebSocket URL для управления
 */
function generateWebSocketUrl(playerId: string): string {
  const projectId = Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0];
  return `wss://${projectId}.supabase.co/functions/v1/make-server-84730125/ws/player/${playerId}`;
}

// =====================================================
// ROUTES
// =====================================================

/**
 * POST /radio/register-player
 * Регистрация нового плеера или переподключение существующего
 */
radioPlayerApi.post('/radio/register-player', async (c: Context) => {
  try {
    const body = await c.req.json<RegisterPlayerRequest>();
    const { venue_id, player_type, device_id, location } = body;

    console.log('📡 [RadioPlayerAPI] Регистрация плеера:', {
      venue_id,
      player_type,
      device_id
    });

    // ВРЕМЕННО: используем демо-режим без обращения к БД
    // TODO: Раскомментировать после выполнения SQL миграции
    console.log('⚠️ [RadioPlayerAPI] SQL таблицы не созданы, используется демо-режим');
    
    const playerId = `demo-player-${Date.now()}`;
    const authToken = generatePlayerToken(playerId, venue_id);
    const streamUrl = generateStreamUrl(playerId, venue_id);
    const websocketUrl = generateWebSocketUrl(playerId);

    const config: PlayerConfig = {
      player_id: playerId,
      stream_url: streamUrl,
      websocket_url: websocketUrl,
      auth_token: authToken,
      config: {
        playlist_id: null,
        volume: 0.8,
        crossfade: 3,
        jingle_frequency: 5,
      },
    };

    console.log('🎉 [RadioPlayerAPI] Плеер зарегистрирован (демо):', playerId);
    return c.json(config);

    /* РАСКОММЕНТИРОВАТЬ ПОСЛЕ SQL МИГРАЦИИ:
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Проверяем существование venue
    const { data: venue, error: venueError } = await supabase
      .from('venues_84730125')
      .select('*')
      .eq('id', venue_id)
      .single();

    if (venueError || !venue) {
      console.error('❌ Venue не найдено:', venueError);
      return c.json({ error: 'Venue not found' }, 404);
    }

    // Проверяем, есть ли уже плеер с таким device_id
    const { data: existingPlayer } = await supabase
      .from('radio_players_84730125')
      .select('*')
      .eq('venue_id', venue_id)
      .eq('device_id', device_id)
      .single();

    let playerId: string;
    let playerData: any;

    if (existingPlayer) {
      // Обновляем существующий плеер
      playerId = existingPlayer.id;
      
      const { data, error } = await supabase
        .from('radio_players_84730125')
        .update({
          last_seen: new Date().toISOString(),
          status: 'online',
          location: location || existingPlayer.location,
        })
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;
      playerData = data;

      console.log('🔄 Плеер переподключён:', playerId);
    } else {
      // Создаём новый плеер
      const { data, error } = await supabase
        .from('radio_players_84730125')
        .insert({
          venue_id,
          player_type,
          device_id,
          location,
          status: 'online',
          last_seen: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      playerData = data;
      playerId = data.id;

      console.log('✅ Новый плеер создан:', playerId);
    }

    // Получаем активный плейлист заведения
    const { data: activePlaylist } = await supabase
      .from('venue_playlists_84730125')
      .select('id')
      .eq('venue_id', venue_id)
      .eq('is_active', true)
      .single();

    // Генерируем credentials
    const authToken = generatePlayerToken(playerId, venue_id);
    const streamUrl = generateStreamUrl(playerId, venue_id);
    const websocketUrl = generateWebSocketUrl(playerId);

    // Формируем конфигурацию
    const config: PlayerConfig = {
      player_id: playerId,
      stream_url: streamUrl,
      websocket_url: websocketUrl,
      auth_token: authToken,
      config: {
        playlist_id: activePlaylist?.id || null,
        volume: playerData.volume || 0.8,
        crossfade: playerData.crossfade || 3,
        jingle_frequency: playerData.jingle_frequency || 5,
      },
    };

    console.log('🎉 [RadioPlayerAPI] Плеер зарегистрирован:', playerId);

    return c.json(config);
    */
  } catch (error) {
    console.error('❌ [RadioPlayerAPI] Ошибка регистрации плеера:', error);
    return c.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /radio/player-status
 * Обновление статуса плеера (heartbeat)
 */
radioPlayerApi.post('/radio/player-status', async (c: Context) => {
  try {
    const { player_id, status } = await c.req.json() as {
      player_id: string;
      status: PlayerStatus;
    };

    console.log('📊 [RadioPlayerAPI] Обновление статуса:', player_id);

    // ВРЕМЕННО ОТКЛЮЧЕНО: таблицы radio_players_84730125 ещё не созданы
    // TODO: Раскомментировать после выполнения SQL миграции
    console.log('⚠️ [RadioPlayerAPI] SQL таблицы не созданы, используется демо-режим');
    
    return c.json({
      success: true,
      message: 'Status updated (demo mode)',
      player_id,
      timestamp: Date.now()
    });

    /* РАСКОММЕНТИРОВАТЬ ПОСЛЕ SQL МИГРАЦИИ:
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Обновляем статус плеера
    const { error } = await supabase
      .from('radio_players_84730125')
      .update({
        last_seen: new Date().toISOString(),
        is_playing: status.is_playing,
        current_track_id: status.current_track?.id || null,
        current_time: status.current_time,
        volume: status.volume,
      })
      .eq('id', player_id);

    if (error) throw error;

    // Сохраняем метрики для аналитики
    await supabase
      .from('radio_player_metrics_84730125')
      .insert({
        player_id,
        is_playing: status.is_playing,
        track_id: status.current_track?.id || null,
        volume: status.volume,
        timestamp: new Date().toISOString(),
      });

    return c.json({
      success: true,
      message: 'Status updated',
    });
    */
  } catch (error) {
    console.error('❌ [RadioPlayerAPI] Ошибка обновления статуса:', error);
    return c.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /radio/player/:id
 * Получение информации о плеере
 */
radioPlayerApi.get('/radio/player/:id', async (c: Context) => {
  try {
    const playerId = c.req.param('id');

    console.log('⚠️ [RadioPlayerAPI] SQL таблицы не созданы, используется демо-режим');
    
    return c.json({
      id: playerId,
      status: 'online',
      message: 'Demo mode - SQL tables not created yet'
    });

    /* РАСКОММЕНТИРОВАТЬ ПОСЛЕ SQL МИГРАЦИИ:
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: player, error } = await supabase
      .from('radio_players_84730125')
      .select(`
        *,
        venues_84730125 (
          id,
          name,
          type
        )
      `)
      .eq('id', playerId)
      .single();

    if (error || !player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    return c.json(player);
    */
  } catch (error) {
    console.error('❌ [RadioPlayerAPI] Ошибка получения плеера:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /radio/venue/:venueId/players
 * Получение всех плееров заведения
 */
radioPlayerApi.get('/radio/venue/:venueId/players', async (c: Context) => {
  try {
    const venueId = c.req.param('venueId');

    console.log('⚠️ [RadioPlayerAPI] SQL таблицы не созданы, используется демо-режим');
    
    return c.json({ 
      players: [],
      message: 'Demo mode - SQL tables not created yet'
    });

    /* РАСКОММЕНТИРОВАТЬ ПОСЛЕ SQL МИГРАЦИИ:
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: players, error } = await supabase
      .from('radio_players_84730125')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return c.json({ players: players || [] });
    */
  } catch (error) {
    console.error('❌ [RadioPlayerAPI] Ошибка получения плееров:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * POST /radio/player/:id/command
 * Отправка команды плееру
 */
radioPlayerApi.post('/radio/player/:id/command', async (c: Context) => {
  try {
    const playerId = c.req.param('id');
    const { command, params } = await c.req.json<{
      command: 'PLAY' | 'PAUSE' | 'VOLUME' | 'LOAD_PLAYLIST' | 'SKIP' | 'INJECT_CONTENT';
      params?: any;
    }>();

    console.log('🎮 [RadioPlayerAPI] Команда плееру:', playerId, command);
    console.log('⚠️ [RadioPlayerAPI] SQL таблицы не созданы, используется демо-режим');

    return c.json({ 
      success: true,
      message: 'Command received (demo mode)',
      command,
      player_id: playerId
    });

    /* РАСКОММЕНТИРОВАТЬ ПОСЛЕ SQL МИГРАЦИИ:
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase
      .from('radio_player_commands_84730125')
      .insert({
        player_id: playerId,
        command,
        params,
        status: 'pending',
      });

    return c.json({ success: true });
    */
  } catch (error) {
    console.error('❌ [RadioPlayerAPI] Ошибка отправки команды:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// =====================================================
// EXPORT
// =====================================================

export default radioPlayerApi;
