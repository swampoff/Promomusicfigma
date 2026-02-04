import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Helper functions
async function getUserFromToken(authHeader: string | undefined) {
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

/**
 * POST /ad-slots/create
 * Создать новый рекламный слот
 */
app.post('/ad-slots/create', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: station } = await supabase
      .from('radio_stations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!station) {
      return c.json({ error: 'Radio station not found' }, 404);
    }

    // Получаем данные из запроса
    const body = await c.req.json();
    const { slotType, timeSlot, price, duration, maxPerHour } = body;

    // Создаем новый рекламный слот
    const { data: adSlot, error } = await supabase
      .from('ad_slots')
      .insert({
        station_id: station.id,
        slot_type: slotType,
        time_slot: timeSlot,
        price,
        duration,
        max_per_hour: maxPerHour,
        status: 'available',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      adSlot,
      message: 'Ad slot created successfully',
    });

  } catch (error) {
    console.error('❌ Error creating ad slot:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default app;