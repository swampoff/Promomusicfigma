/**
 * BOOKING ROUTES - API для системы букинга артистов
 * 
 * Endpoints:
 * - POST /create - Создание заявки на букинг
 * - GET /list - Список букингов пользователя
 * - PUT /:id/accept - Принять заявку (Artist)
 * - PUT /:id/reject - Отклонить заявку (Artist)
 * - POST /:id/pay-deposit - Оплатить депозит (Venue)
 * - POST /:id/pay-final - Оплатить остаток (Venue)
 * - PUT /:id/cancel - Отменить букинг
 * - GET /:id - Получить детали букинга
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { getSupabaseClient } from './supabase-client.tsx';

const app = new Hono();

// Supabase клиент - используем singleton
const supabase = getSupabaseClient();

// =====================================================
// HELPER: Получить пользователя из токена
// =====================================================
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// =====================================================
// HELPER: Отправить уведомление
// =====================================================
async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  try {
    await supabase.from('notifications').insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

// =====================================================
// POST /create - Создать заявку на букинг
// =====================================================
app.post('/create', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const {
      performerId,
      performerType, // 'artist' или 'dj'
      eventType,
      eventTitle,
      eventDescription,
      eventDate,
      startTime,
      durationHours,
      venueAddress,
      venueCity,
      venueType,
      expectedAudience,
      audienceType,
      technicalRequirements,
      specialRequests,
    } = body;

    // Валидация
    if (!performerId || !performerType || !eventType || !eventTitle || !eventDate || !durationHours) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Получить профиль performer'а для расчета цены
    const tableName = performerType === 'dj' ? 'dj_profiles' : 'artist_profiles';
    const { data: performer, error: performerError } = await supabase
      .from(tableName)
      .select('user_id, hourly_rate, minimum_booking_hours, booking_enabled')
      .eq('user_id', performerId)
      .single();

    if (performerError || !performer) {
      console.error('Performer not found:', performerError);
      return c.json({ error: 'Performer not found' }, 404);
    }

    if (!performer.booking_enabled) {
      return c.json({ error: 'Performer bookings are disabled' }, 400);
    }

    // Проверка минимума часов
    if (durationHours < performer.minimum_booking_hours) {
      return c.json({ 
        error: `Minimum booking is ${performer.minimum_booking_hours} hours`,
        minimumHours: performer.minimum_booking_hours
      }, 400);
    }

    // Расчет цен
    const offeredPrice = performer.hourly_rate * durationHours;
    const platformCommission = offeredPrice * 0.10; // 10%
    const performerFee = offeredPrice - platformCommission;
    const depositAmount = offeredPrice * 0.30; // 30%
    const finalAmount = offeredPrice * 0.70; // 70%

    // Получить информацию о venue
    const { data: venueProfile } = await supabase
      .from('venue_profiles')
      .select('id, venue_name')
      .eq('user_id', user.id)
      .single();

    // Создать заявку
    const { data: booking, error: bookingError } = await supabase
      .from('booking_requests')
      .insert({
        requester_id: user.id,
        requester_type: 'venue',
        performer_id: performerId,
        performer_type: performerType,
        event_type: eventType,
        event_title: eventTitle,
        event_description: eventDescription,
        event_date: eventDate,
        start_time: startTime,
        duration_hours: durationHours,
        venue_id: venueProfile?.id,
        venue_name: venueProfile?.venue_name,
        venue_address: venueAddress,
        venue_city: venueCity,
        venue_type: venueType,
        expected_audience: expectedAudience,
        audience_type: audienceType,
        offered_price: offeredPrice,
        performer_fee: performerFee,
        platform_commission: platformCommission,
        deposit_amount: depositAmount,
        deposit_percentage: 30.0,
        final_amount: finalAmount,
        technical_requirements: technicalRequirements || {},
        special_requests: specialRequests,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Failed to create booking:', bookingError);
      return c.json({ error: 'Failed to create booking', details: bookingError.message }, 500);
    }

    // Отправить уведомление артисту
    await sendNotification({
      userId: performerId,
      type: 'booking_request_new',
      title: 'Новая заявка на букинг',
      message: `Заведение ${venueProfile?.venue_name || 'неизвестное'} хочет забронировать вас на ${eventDate}`,
      data: { bookingId: booking.id },
    });

    console.log('✅ Booking created:', booking.id);
    return c.json({ 
      success: true,
      booking,
      message: 'Booking request created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// GET /list - Получить список букингов
// =====================================================
app.get('/list', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = c.req.query('role'); // 'requester' или 'performer'
    const status = c.req.query('status'); // фильтр по статусу

    let query = supabase
      .from('booking_requests')
      .select(`
        *,
        requester:profiles!booking_requests_requester_id_fkey(id, display_name, avatar_url),
        performer:profiles!booking_requests_performer_id_fkey(id, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    // Фильтр по роли
    if (role === 'requester') {
      query = query.eq('requester_id', user.id);
    } else if (role === 'performer') {
      query = query.eq('performer_id', user.id);
    } else {
      // Оба варианта
      query = query.or(`requester_id.eq.${user.id},performer_id.eq.${user.id}`);
    }

    // Фильтр по статусу
    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Failed to fetch bookings:', error);
      return c.json({ error: 'Failed to fetch bookings', details: error.message }, 500);
    }

    return c.json({ 
      success: true,
      bookings: bookings || []
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// GET /:id - Получить детали букинга
// =====================================================
app.get('/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');

    const { data: booking, error } = await supabase
      .from('booking_requests')
      .select(`
        *,
        requester:profiles!booking_requests_requester_id_fkey(id, display_name, avatar_url),
        performer:profiles!booking_requests_performer_id_fkey(id, display_name, avatar_url)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Проверка доступа
    if (booking.requester_id !== user.id && booking.performer_id !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ 
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// PUT /:id/accept - Принять заявку (Artist)
// =====================================================
app.put('/:id/accept', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');

    // Получить букинг
    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .eq('performer_id', user.id)
      .single();

    if (fetchError || !booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'pending') {
      return c.json({ error: 'Booking already processed' }, 400);
    }

    // Обновить статус
    const { data: updated, error: updateError } = await supabase
      .from('booking_requests')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to accept booking:', updateError);
      return c.json({ error: 'Failed to accept booking', details: updateError.message }, 500);
    }

    // Уведомление venue
    await sendNotification({
      userId: booking.requester_id,
      type: 'booking_accepted',
      title: 'Заявка принята!',
      message: `Артист принял вашу заявку на ${booking.event_title}. Оплатите депозит ${booking.deposit_amount}₽`,
      data: { bookingId: booking.id },
    });

    console.log('✅ Booking accepted:', bookingId);
    return c.json({ 
      success: true,
      booking: updated,
      message: 'Booking accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting booking:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// PUT /:id/reject - Отклонить заявку (Artist)
// =====================================================
app.put('/:id/reject', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');
    const { rejectionReason } = await c.req.json();

    // Получить букинг
    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .eq('performer_id', user.id)
      .single();

    if (fetchError || !booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'pending') {
      return c.json({ error: 'Booking already processed' }, 400);
    }

    // Обновить статус
    const { data: updated, error: updateError } = await supabase
      .from('booking_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        cancellation_reason: rejectionReason || 'No reason provided',
        cancelled_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to reject booking:', updateError);
      return c.json({ error: 'Failed to reject booking', details: updateError.message }, 500);
    }

    // Уведомление venue
    await sendNotification({
      userId: booking.requester_id,
      type: 'booking_rejected',
      title: 'Заявка отклонена',
      message: `Артист отклонил вашу заявку на ${booking.event_title}`,
      data: { bookingId: booking.id, reason: rejectionReason },
    });

    console.log('✅ Booking rejected:', bookingId);
    return c.json({ 
      success: true,
      booking: updated,
      message: 'Booking rejected'
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// POST /:id/pay-deposit - Оплатить депозит (Venue)
// =====================================================
app.post('/:id/pay-deposit', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');
    const { paymentMethodId } = await c.req.json(); // Mock payment method

    // Получить букинг
    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .eq('requester_id', user.id)
      .single();

    if (fetchError || !booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'accepted') {
      return c.json({ error: 'Booking must be accepted first' }, 400);
    }

    if (booking.deposit_paid_at) {
      return c.json({ error: 'Deposit already paid' }, 400);
    }

    // MOCK: В реальности здесь интеграция с платежной системой (Stripe, YooKassa)
    console.log('💳 Processing deposit payment:', {
      amount: booking.deposit_amount,
      currency: 'RUB',
      bookingId,
      paymentMethodId,
    });

    // Simulate payment success
    const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

    // Обновить букинг
    const { data: updated, error: updateError } = await supabase
      .from('booking_requests')
      .update({
        status: 'deposit_paid',
        deposit_paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      return c.json({ error: 'Failed to update booking', details: updateError.message }, 500);
    }

    // Создать запись платежа
    await supabase.from('booking_payments').insert({
      booking_id: bookingId,
      payer_id: user.id,
      recipient_id: 'platform',
      amount: booking.deposit_amount,
      currency: 'RUB',
      payment_type: 'deposit',
      status: 'completed',
      gateway: 'mock',
      gateway_payment_id: paymentIntentId,
      processed_at: new Date().toISOString(),
    });

    // Заблокировать дату в календаре
    await supabase.from('booking_calendar').upsert({
      performer_id: booking.performer_id,
      performer_type: booking.performer_type,
      date: booking.event_date,
      is_available: false,
      booking_id: bookingId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Уведомление артисту
    await sendNotification({
      userId: booking.performer_id,
      type: 'booking_deposit_paid',
      title: 'Депозит получен!',
      message: `Депозит ${booking.deposit_amount}₽ оплачен. Дата ${booking.event_date} забронирована.`,
      data: { bookingId: booking.id },
    });

    console.log('✅ Deposit paid:', bookingId);
    return c.json({ 
      success: true,
      booking: updated,
      payment: { id: paymentIntentId, amount: booking.deposit_amount },
      message: 'Deposit paid successfully'
    });

  } catch (error) {
    console.error('Error paying deposit:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// POST /:id/pay-final - Оплатить остаток (Venue)
// =====================================================
app.post('/:id/pay-final', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');
    const { paymentMethodId } = await c.req.json();

    // Получить букинг
    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .eq('requester_id', user.id)
      .single();

    if (fetchError || !booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'deposit_paid') {
      return c.json({ error: 'Deposit must be paid first' }, 400);
    }

    if (booking.full_payment_at) {
      return c.json({ error: 'Final payment already completed' }, 400);
    }

    // MOCK: Интеграция с платежной системой
    console.log('💳 Processing final payment:', {
      amount: booking.final_amount,
      currency: 'RUB',
      bookingId,
      paymentMethodId,
    });

    const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

    // Обновить букинг
    const { data: updated, error: updateError } = await supabase
      .from('booking_requests')
      .update({
        status: 'confirmed',
        full_payment_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      return c.json({ error: 'Failed to update booking', details: updateError.message }, 500);
    }

    // Создать запись платежа
    await supabase.from('booking_payments').insert({
      booking_id: bookingId,
      payer_id: user.id,
      recipient_id: 'platform',
      amount: booking.final_amount,
      currency: 'RUB',
      payment_type: 'final',
      status: 'completed',
      gateway: 'mock',
      gateway_payment_id: paymentIntentId,
      processed_at: new Date().toISOString(),
    });

    // Уведомление артисту
    await sendNotification({
      userId: booking.performer_id,
      type: 'booking_confirmed',
      title: 'Букинг подтвержден!',
      message: `Полная оплата получена (${booking.offered_price}₽). Мероприятие ${booking.event_date} подтверждено.`,
      data: { bookingId: booking.id },
    });

    console.log('✅ Final payment completed:', bookingId);
    return c.json({ 
      success: true,
      booking: updated,
      payment: { id: paymentIntentId, amount: booking.final_amount },
      message: 'Final payment completed successfully'
    });

  } catch (error) {
    console.error('Error paying final amount:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// =====================================================
// PUT /:id/cancel - Отменить букинг
// =====================================================
app.put('/:id/cancel', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const bookingId = c.req.param('id');
    const { cancellationReason } = await c.req.json();

    // Получить букинг
    const { data: booking, error: fetchError } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Проверка доступа
    if (booking.requester_id !== user.id && booking.performer_id !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return c.json({ error: 'Booking cannot be cancelled' }, 400);
    }

    // Обновить статус
    const { data: updated, error: updateError } = await supabase
      .from('booking_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: cancellationReason || 'No reason provided',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to cancel booking:', updateError);
      return c.json({ error: 'Failed to cancel booking', details: updateError.message }, 500);
    }

    // Разблокировать дату в календаре
    await supabase
      .from('booking_calendar')
      .delete()
      .eq('booking_id', bookingId);

    // Уведомления обеим сторонам
    const otherUserId = booking.requester_id === user.id ? booking.performer_id : booking.requester_id;
    await sendNotification({
      userId: otherUserId,
      type: 'booking_cancelled',
      title: 'Букинг отменен',
      message: `Букинг "${booking.event_title}" был отменен`,
      data: { bookingId: booking.id, reason: cancellationReason },
    });

    console.log('✅ Booking cancelled:', bookingId);
    return c.json({ 
      success: true,
      booking: updated,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;