/**
 * PROMO.GUIDE API ROUTES - ФАЗА 1 (МИНИМУМ)
 * 
 * Публичные endpoints БЕЗ авторизации:
 * - GET  /make-server-84730125/public/guide/venues - список заведений
 * - GET  /make-server-84730125/public/guide/venues/:id - детали заведения
 * - GET  /make-server-84730125/public/guide/live-feed - что играет сейчас
 */

import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// ==============================================
// TYPES
// ==============================================
interface NowPlaying {
  track_id: string;
  track_name: string;
  artist_name: string;
  artist_id?: string;
  album_name?: string;
  cover_url: string;
  genre: string;
  started_at: string;
  is_playing: boolean;
}

interface Venue {
  id: string;
  venue_name: string;
  type: string;
  address: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  rating?: number;
  capacity?: number;
  genres: string[];
  is_open?: boolean;
  open_until?: string;
  verified: boolean;
  phone_number?: string;
  website?: string;
  cover_image?: string;
  description?: string;
  hours?: string;
  show_in_guide: boolean;
  show_now_playing: boolean;
  guide_tier: string;
  now_playing?: NowPlaying | null;
}

// ==============================================
// GET /public/guide/venues
// Список заведений для Promo.Guide
// ==============================================
app.get('/public/guide/venues', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    // Query params
    const city = c.req.query('city');
    const type = c.req.query('type');
    const genre = c.req.query('genre');
    const onlyWithMusic = c.req.query('onlyWithMusic') === 'true';
    const onlyOpen = c.req.query('onlyOpen') === 'true';
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    // Build query
    let query = supabase
      .from('venue_profiles')
      .select(`
        id,
        venue_name,
        type,
        address,
        city,
        country,
        lat,
        lng,
        rating,
        capacity,
        genres,
        is_open,
        open_until,
        verified,
        phone_number,
        website,
        cover_image,
        description,
        hours,
        show_in_guide,
        show_now_playing,
        guide_tier,
        created_at
      `)
      .eq('show_in_guide', true) // ТОЛЬКО те кто включили публичность!
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filters
    if (city) {
      query = query.eq('city', city);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (onlyOpen) {
      query = query.eq('is_open', true);
    }

    const { data: venues, error } = await query;

    if (error) {
      console.error('Error fetching venues:', error);
      return c.json({ error: 'Failed to fetch venues', details: error.message }, 500);
    }

    // Для каждого venue получить now_playing (если show_now_playing = true)
    const venuesWithNowPlaying = await Promise.all(
      (venues || []).map(async (venue) => {
        let nowPlaying = null;

        if (venue.show_now_playing) {
          const { data: playback } = await supabase
            .from('venue_playback_status')
            .select('*')
            .eq('venue_id', venue.id)
            .eq('is_playing', true)
            .eq('public_visibility', true) // КЛЮЧЕВОЕ ПОЛЕ!
            .single();

          if (playback) {
            nowPlaying = {
              track_id: playback.current_track_id,
              track_name: playback.current_track_name,
              artist_name: playback.current_artist,
              album_name: playback.current_album,
              cover_url: playback.current_cover_url,
              genre: playback.current_genre || 'Unknown',
              started_at: playback.started_at,
              is_playing: playback.is_playing
            };
          }
        }

        return {
          ...venue,
          now_playing: nowPlaying
        };
      })
    );

    // Filter по жанру (если указан)
    let filteredVenues = venuesWithNowPlaying;
    if (genre) {
      filteredVenues = venuesWithNowPlaying.filter(v => 
        v.genres && v.genres.includes(genre)
      );
    }

    // Filter по onlyWithMusic (только с now_playing)
    if (onlyWithMusic) {
      filteredVenues = filteredVenues.filter(v => v.now_playing !== null);
    }

    return c.json({
      success: true,
      data: filteredVenues,
      meta: {
        total: filteredVenues.length,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Error in /public/guide/venues:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==============================================
// GET /public/guide/venues/:id
// Детали одного заведения
// ==============================================
app.get('/public/guide/venues/:id', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const venueId = c.req.param('id');

    // Get venue
    const { data: venue, error: venueError } = await supabase
      .from('venue_profiles')
      .select('*')
      .eq('id', venueId)
      .eq('show_in_guide', true) // ТОЛЬКО публичные!
      .single();

    if (venueError || !venue) {
      return c.json({ error: 'Venue not found' }, 404);
    }

    // Get now_playing (если включено)
    let nowPlaying = null;
    if (venue.show_now_playing) {
      const { data: playback } = await supabase
        .from('venue_playback_status')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_playing', true)
        .eq('public_visibility', true)
        .single();

      if (playback) {
        nowPlaying = {
          track_id: playback.current_track_id,
          track_name: playback.current_track_name,
          artist_name: playback.current_artist,
          artist_id: playback.current_artist_id,
          album_name: playback.current_album,
          cover_url: playback.current_cover_url,
          genre: playback.current_genre || 'Unknown',
          started_at: playback.started_at,
          is_playing: playback.is_playing
        };
      }
    }

    // Get recent plays (топ-5 треков за неделю)
    const { data: recentPlays } = await supabase
      .from('venue_playback_history')
      .select('track_name, artist_name, cover_url, genre, played_at, play_count')
      .eq('venue_id', venueId)
      .gte('played_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('play_count', { ascending: false })
      .limit(5);

    return c.json({
      success: true,
      data: {
        ...venue,
        now_playing: nowPlaying,
        top_tracks_week: recentPlays || []
      }
    });

  } catch (error) {
    console.error('Error in /public/guide/venues/:id:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==============================================
// GET /public/guide/live-feed
// Что играет ПРЯМО СЕЙЧАС во всех заведениях
// ==============================================
app.get('/public/guide/live-feed', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const limit = parseInt(c.req.query('limit') || '20');

    // Get all venues with active playback
    const { data: playbacks, error } = await supabase
      .from('venue_playback_status')
      .select(`
        venue_id,
        current_track_id,
        current_track_name,
        current_artist,
        current_artist_id,
        current_album,
        current_cover_url,
        current_genre,
        started_at,
        is_playing,
        public_visibility,
        venue:venue_profiles!inner(
          id,
          venue_name,
          type,
          address,
          city,
          verified,
          show_in_guide,
          show_now_playing
        )
      `)
      .eq('is_playing', true)
      .eq('public_visibility', true)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching live feed:', error);
      return c.json({ error: 'Failed to fetch live feed', details: error.message }, 500);
    }

    // Filter только те venue где show_in_guide = true
    const filteredPlaybacks = (playbacks || []).filter(p => 
      p.venue && p.venue.show_in_guide && p.venue.show_now_playing
    );

    // Transform to feed format
    const feed = filteredPlaybacks.map(p => ({
      venue: {
        id: p.venue.id,
        name: p.venue.venue_name,
        type: p.venue.type,
        address: p.venue.address,
        city: p.venue.city,
        verified: p.venue.verified
      },
      track: {
        id: p.current_track_id,
        name: p.current_track_name,
        artist: p.current_artist,
        artist_id: p.current_artist_id,
        album: p.current_album,
        cover_url: p.current_cover_url,
        genre: p.current_genre
      },
      started_at: p.started_at,
      is_playing: p.is_playing
    }));

    return c.json({
      success: true,
      data: feed,
      meta: {
        total: feed.length,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in /public/guide/live-feed:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==============================================
// GET /public/guide/cities
// Список городов где есть заведения
// ==============================================
app.get('/public/guide/cities', async (c) => {
  try {
    const supabase = getSupabaseClient();

    const { data: cities, error } = await supabase
      .from('venue_profiles')
      .select('city, country')
      .eq('show_in_guide', true)
      .order('city');

    if (error) {
      console.error('Error fetching cities:', error);
      return c.json({ error: 'Failed to fetch cities', details: error.message }, 500);
    }

    // Unique cities
    const uniqueCities = Array.from(
      new Set((cities || []).map(c => c.city))
    ).map(city => {
      const cityData = cities.find(c => c.city === city);
      return {
        city,
        country: cityData?.country
      };
    });

    return c.json({
      success: true,
      data: uniqueCities
    });

  } catch (error) {
    console.error('Error in /public/guide/cities:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==============================================
// GET /public/guide/stats
// Общая статистика Promo.Guide
// ==============================================
app.get('/public/guide/stats', async (c) => {
  try {
    const supabase = getSupabaseClient();

    // Total venues
    const { count: totalVenues } = await supabase
      .from('venue_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('show_in_guide', true);

    // Live now (playing now)
    const { count: liveNow } = await supabase
      .from('venue_playback_status')
      .select('*', { count: 'exact', head: true })
      .eq('is_playing', true)
      .eq('public_visibility', true);

    // Cities
    const { data: cities } = await supabase
      .from('venue_profiles')
      .select('city')
      .eq('show_in_guide', true);

    const uniqueCities = new Set((cities || []).map(c => c.city)).size;

    return c.json({
      success: true,
      data: {
        total_venues: totalVenues || 0,
        live_now: liveNow || 0,
        cities: uniqueCities || 0
      }
    });

  } catch (error) {
    console.error('Error in /public/guide/stats:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;
