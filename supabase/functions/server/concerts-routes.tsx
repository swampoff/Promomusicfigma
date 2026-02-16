import { Hono } from 'npm:hono@4';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const concertsRoutes = new Hono();

// Helper to get Supabase client with user auth
const getSupabaseClient = (accessToken?: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = accessToken 
    ? Deno.env.get('SUPABASE_ANON_KEY')!
    : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
  
  return client;
};

// Helper to verify user authentication
const verifyAuth = async (accessToken?: string) => {
  if (!accessToken) {
    return { user: null, error: 'No access token provided' };
  }
  
  const supabase = getSupabaseClient(accessToken);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { user: null, error: 'Unauthorized' };
  }
  
  return { user, error: null };
};

// ============================================
// KV-BASED CONCERTS API
// Using kv_store table for data persistence
// Keys: concert:promoted:{concertId}
//       concert:user:{userId}:{concertId}
// ============================================

// Create concert (simple, via X-User-Id header - used by artist data API)
concertsRoutes.post('/', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const body = await c.req.json();
    const concertId = body.id || `concert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const concert = {
      id: concertId,
      artistId: userId,
      views: 0,
      clicks: 0,
      isPromoted: false,
      moderationStatus: 'draft',
      status: 'draft',
      ...body,
      userId,
      createdAt: body.createdAt || now,
      updatedAt: now,
    };

    await kv.set(`concert:user:${userId}:${concertId}`, concert);
    console.log(`Concert created: ${concertId} for user ${userId}`);
    return c.json({ success: true, data: concert }, 201);
  } catch (error) {
    console.error('Error in POST /concerts:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all concerts for user (via X-User-Id header)
concertsRoutes.get('/', async (c) => {
  try {
    const userId = c.req.header('X-User-Id') || 'demo-user';
    const userConcerts = await kv.getByPrefix(`concert:user:${userId}:`);
    const list = userConcerts || [];
    return c.json({ success: true, data: list });
  } catch (error) {
    console.error('Error in GET /concerts:', error);
    return c.json({ success: true, data: [] });
  }
});

// Get all promoted concerts (public, no auth required)
concertsRoutes.get('/promoted', async (c) => {
  try {
    console.log('🎸 Fetching promoted concerts from KV store...');
    
    // Get all promoted concerts from KV store
    const promotedConcerts = await kv.getByPrefix('concert:promoted:');
    
    console.log(`📦 Found ${promotedConcerts.length} promoted concerts in KV`);
    
    if (promotedConcerts.length === 0) {
      console.log('📭 No promoted concerts found, initializing demo data...');
      
      // Initialize demo concerts
      const demoConcerts = [
        {
          id: 1,
          title: 'Summer Music Fest 2026',
          date: '2026-07-15',
          time: '18:00',
          city: 'Москва',
          venue: 'Olympic Stadium',
          type: 'Фестиваль',
          description: 'Грандиозный летний музыкальный фестиваль',
          banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
          ticketPriceFrom: '2000',
          ticketPriceTo: '8000',
          ticketLink: 'https://promo.music/tickets/summer-fest',
          views: 15400,
          clicks: 850,
          isPromoted: true,
          moderationStatus: 'approved',
          promotionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Акустический вечер',
          date: '2026-07-22',
          time: '20:00',
          city: 'Санкт-Петербург',
          venue: 'A2 Green Concert',
          type: 'Акустический сет',
          description: 'Интимная атмосфера живой акустики',
          banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
          ticketPriceFrom: '1500',
          ticketPriceTo: '5000',
          ticketLink: 'https://promo.music/tickets/acoustic',
          views: 8200,
          clicks: 420,
          isPromoted: true,
          moderationStatus: 'approved',
          promotionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Electronic Paradise',
          date: '2026-08-05',
          time: '22:00',
          city: 'Москва',
          venue: 'Adrenaline Stadium',
          type: 'DJ сет',
          description: 'Ночь электронной музыки с лучшими DJ',
          banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
          ticketPriceFrom: '3000',
          ticketPriceTo: '12000',
          ticketLink: 'https://promo.music/tickets/electronic',
          views: 12300,
          clicks: 670,
          isPromoted: true,
          moderationStatus: 'approved',
          promotionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
      
      // Save demo concerts to KV
      for (const concert of demoConcerts) {
        await kv.set(`concert:promoted:${concert.id}`, concert);
      }
      
      console.log('✅ Demo concerts initialized');
      
      return c.json({ success: true, data: demoConcerts });
    }
    
    // Filter valid promoted concerts
    const currentDate = new Date();
    const validConcerts = promotedConcerts
      .filter(concert => {
        if (!concert.isPromoted) return false;
        if (concert.moderationStatus !== 'approved') return false;
        if (new Date(concert.promotionExpiresAt) < currentDate) return false;
        if (new Date(concert.date) < currentDate) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 20);
    
    console.log(`✅ Returning ${validConcerts.length} valid promoted concerts`);
    
    return c.json({ success: true, data: validConcerts });
  } catch (error) {
    console.error('❌ Error in GET /promoted:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all concerts for current user
concertsRoutes.get('/tour-dates', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    // Get user's concerts from KV
    const userConcerts = await kv.getByPrefix(`concert:user:${user.id}:`);
    
    // Sort by date
    const sortedConcerts = userConcerts.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return c.json({ success: true, data: sortedConcerts });
  } catch (error) {
    console.error('Error in GET /tour-dates:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create new concert
concertsRoutes.post('/tour-dates', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    
    // Generate concert ID
    const concertId = Date.now();
    
    // Create concert object
    const concert = {
      id: concertId,
      artistId: user.id,
      title: body.title,
      description: body.description || '',
      venue: body.venue_name || body.venue,
      city: body.city,
      country: body.country || 'Россия',
      date: body.date,
      time: body.show_start || body.time || '19:00',
      ticketLink: body.ticket_url || body.ticketLink || '#',
      ticketPriceFrom: body.ticket_price_min?.toString() || body.ticketPriceFrom || '0',
      ticketPriceTo: body.ticket_price_max?.toString() || body.ticketPriceTo || '0',
      type: body.event_type || body.type || 'Концерт',
      banner: body.banner_url || body.banner || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      views: 0,
      clicks: 0,
      isPromoted: false,
      moderationStatus: 'draft',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to KV
    await kv.set(`concert:user:${user.id}:${concertId}`, concert);
    
    console.log(`✅ Concert created: ${concertId} for user ${user.id}`);
    return c.json({ success: true, data: concert }, 201);
  } catch (error) {
    console.error('Error in POST /tour-dates:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Promote concert (make it appear on homepage)
concertsRoutes.post('/tour-dates/:id/promote', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    const body = await c.req.json();
    const { days = 7 } = body;
    
    // Get concert from user's KV
    const concert = await kv.get(`concert:user:${user.id}:${id}`);
    
    if (!concert) {
      return c.json({ success: false, error: 'Concert not found' }, 404);
    }
    
    // Calculate promotion expiry
    const promotionExpiresAt = new Date();
    promotionExpiresAt.setDate(promotionExpiresAt.getDate() + days);
    
    // Update concert
    const updatedConcert = {
      ...concert,
      isPromoted: true,
      promotionExpiresAt: promotionExpiresAt.toISOString(),
      moderationStatus: 'approved', // Auto-approve for demo
      updatedAt: new Date().toISOString(),
    };
    
    // Save to both user's KV and promoted KV
    await kv.set(`concert:user:${user.id}:${id}`, updatedConcert);
    await kv.set(`concert:promoted:${id}`, updatedConcert);
    
    console.log(`✅ Concert promoted: ${id} for ${days} days`);
    return c.json({ success: true, data: updatedConcert });
  } catch (error) {
    console.error('Error in POST /tour-dates/:id/promote:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete concert
concertsRoutes.delete('/tour-dates/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { user, error: authError } = await verifyAuth(accessToken);
    
    if (authError || !user) {
      return c.json({ success: false, error: authError || 'Unauthorized' }, 401);
    }
    
    // Delete from both KVs
    await kv.del(`concert:user:${user.id}:${id}`);
    await kv.del(`concert:promoted:${id}`);
    
    console.log(`✅ Concert deleted: ${id}`);
    return c.json({ success: true, message: 'Concert deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /tour-dates/:id:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default concertsRoutes;