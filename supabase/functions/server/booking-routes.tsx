/**
 * BOOKING ROUTES - API для системы букинга артистов
 * Миграция на KV Store (вместо SQL таблиц)
 * 
 * KV ключи:
 * - booking:{id} - данные букинга
 * - bookings_by_user:{userId} - JSON массив booking ID для пользователя (обе роли)
 * - booking_payment:{id} - данные платежа
 * - booking_calendar:{performerId}:{date} - заблокированные даты
 * - notification:{userId}:{id} - уведомления
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

import { getSupabaseClient } from './supabase-client.tsx';
import { recordRevenue } from './platform-revenue.tsx';
import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const app = new Hono();
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
// HELPER: Добавить booking ID в индекс пользователя
// =====================================================
async function addBookingToUserIndex(userId: string, bookingId: string) {
  const key = `bookings_by_user:${userId}`;
  const existing = await kv.get(key);
  const ids: string[] = existing ? JSON.parse(existing) : [];
  if (!ids.includes(bookingId)) {
    ids.unshift(bookingId); // newest first
    await kv.set(key, JSON.stringify(ids));
  }
}

// =====================================================
// HELPER: Отправить уведомление через KV
// =====================================================
async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  try {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const notification = {
      id: notifId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data || {},
      read: false,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`notification:${params.userId}:${notifId}`, JSON.stringify(notification));
  } catch (error) {
    console.error('Failed to send notification via KV:', error);
  }
}

// =====================================================
// HELPER: Получить профиль исполнителя из KV
// =====================================================
async function getPerformerProfile(performerId: string, performerType: string) {
  // Try artist KV data first
  const artistData = await kv.get(`artist:${performerId}`);
  if (artistData) {
    const artist = JSON.parse(artistData);
    return {
      userId: artist.id,
      displayName: artist.name,
      avatar: artist.avatar,
      hourlyRate: artist.hourlyRate || 5000,
      minimumBookingHours: artist.minimumBookingHours || 2,
      bookingEnabled: true,
    };
  }

  // Try DJ profile
  const djData = await kv.get(`dj_profile:${performerId}`);
  if (djData) {
    const dj = JSON.parse(djData);
    return {
      userId: dj.userId || dj.id,
      displayName: dj.djName || dj.name,
      avatar: dj.avatar,
      hourlyRate: dj.hourlyRate || 4000,
      minimumBookingHours: dj.minimumBookingHours || 2,
      bookingEnabled: true,
    };
  }

  return null;
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
      performerType,
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

    if (!performerId || !performerType || !eventType || !eventTitle || !eventDate || !durationHours) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Получить профиль performer'а из KV
    const performer = await getPerformerProfile(performerId, performerType);
    if (!performer) {
      console.error('Performer not found in KV:', performerId);
      return c.json({ error: 'Performer not found' }, 404);
    }

    if (!performer.bookingEnabled) {
      return c.json({ error: 'Performer bookings are disabled' }, 400);
    }

    if (durationHours < performer.minimumBookingHours) {
      return c.json({ 
        error: `Minimum booking is ${performer.minimumBookingHours} hours`,
        minimumHours: performer.minimumBookingHours
      }, 400);
    }

    // Расчет цен
    const offeredPrice = performer.hourlyRate * durationHours;
    const platformCommission = offeredPrice * 0.10;
    const performerFee = offeredPrice - platformCommission;
    const depositAmount = offeredPrice * 0.30;
    const finalAmount = offeredPrice * 0.70;

    // Получить venue profile из KV
    const venueProfileData = await kv.get(`venue_profile:${user.id}`);
    const venueProfile = venueProfileData ? JSON.parse(venueProfileData) : null;

    // Создать букинг
    const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const booking = {
      id: bookingId,
      requesterId: user.id,
      requesterType: 'venue',
      performerId,
      performerType,
      eventType,
      eventTitle,
      eventDescription,
      eventDate,
      startTime,
      durationHours,
      venueId: venueProfile?.id,
      venueName: venueProfile?.venueName || 'Неизвестное заведение',
      venueAddress,
      venueCity,
      venueType,
      expectedAudience,
      audienceType,
      offeredPrice,
      performerFee,
      platformCommission,
      depositAmount,
      depositPercentage: 30.0,
      finalAmount,
      technicalRequirements: technicalRequirements || {},
      specialRequests,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Populated fields for frontend
      performer: {
        id: performer.userId,
        displayName: performer.displayName,
        avatarUrl: performer.avatar,
      },
      requester: {
        id: user.id,
        displayName: venueProfile?.venueName || user.email,
        avatarUrl: venueProfile?.logoUrl,
      },
    };

    // Сохранить в KV
    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    // Обновить индексы для обоих пользователей
    await addBookingToUserIndex(user.id, bookingId);
    await addBookingToUserIndex(performerId, bookingId);

    // Уведомление артисту
    await sendNotification({
      userId: performerId,
      type: 'booking_request_new',
      title: 'Новая заявка на букинг',
      message: `Заведение ${venueProfile?.venueName || 'неизвестное'} хочет забронировать вас на ${eventDate}`,
      data: { bookingId },
    });

    console.log('Booking created via KV:', bookingId);
    return c.json({ 
      success: true,
      booking,
      message: 'Booking request created successfully'
    });

  } catch (error: any) {
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

    const role = c.req.query('role');
    const statusFilter = c.req.query('status');

    // Получить ID букингов пользователя
    const indexData = await kv.get(`bookings_by_user:${user.id}`);
    const bookingIds: string[] = indexData ? JSON.parse(indexData) : [];

    if (bookingIds.length === 0) {
      return c.json({ success: true, bookings: [] });
    }

    // Загрузить букинги
    const bookingKeys = bookingIds.map(id => `booking:${id}`);
    const bookingValues = await kv.mget(bookingKeys);
    
    let bookings = bookingValues
      .filter(v => v !== null)
      .map(v => JSON.parse(v!));

    // Фильтр по роли
    if (role === 'requester') {
      bookings = bookings.filter(b => b.requesterId === user.id);
    } else if (role === 'performer') {
      bookings = bookings.filter(b => b.performerId === user.id);
    }

    // Фильтр по статусу
    if (statusFilter) {
      bookings = bookings.filter(b => b.status === statusFilter);
    }

    // Сортировка по дате создания (newest first)
    bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ success: true, bookings });

  } catch (error: any) {
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
    const bookingData = await kv.get(`booking:${bookingId}`);

    if (!bookingData) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const booking = JSON.parse(bookingData);

    // Проверка доступа
    if (booking.requesterId !== user.id && booking.performerId !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    return c.json({ success: true, booking });

  } catch (error: any) {
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
    const bookingData = await kv.get(`booking:${bookingId}`);

    if (!bookingData) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const booking = JSON.parse(bookingData);

    if (booking.performerId !== user.id) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'pending') {
      return c.json({ error: 'Booking already processed' }, 400);
    }

    // Обновить статус
    booking.status = 'accepted';
    booking.acceptedAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();

    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    // Уведомление venue
    await sendNotification({
      userId: booking.requesterId,
      type: 'booking_accepted',
      title: 'Заявка принята!',
      message: `Артист принял вашу заявку на ${booking.eventTitle}. Оплатите депозит ${booking.depositAmount} руб.`,
      data: { bookingId },
    });

    console.log('Booking accepted via KV:', bookingId);
    return c.json({ success: true, booking, message: 'Booking accepted successfully' });

  } catch (error: any) {
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

    const bookingData = await kv.get(`booking:${bookingId}`);
    if (!bookingData) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const booking = JSON.parse(bookingData);

    if (booking.performerId !== user.id) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'pending') {
      return c.json({ error: 'Booking already processed' }, 400);
    }

    booking.status = 'rejected';
    booking.rejectedAt = new Date().toISOString();
    booking.cancellationReason = rejectionReason || 'No reason provided';
    booking.cancelledBy = user.id;
    booking.updatedAt = new Date().toISOString();

    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    await sendNotification({
      userId: booking.requesterId,
      type: 'booking_rejected',
      title: 'Заявка отклонена',
      message: `Артист отклонил вашу заявку на ${booking.eventTitle}`,
      data: { bookingId, reason: rejectionReason },
    });

    console.log('Booking rejected via KV:', bookingId);
    return c.json({ success: true, booking, message: 'Booking rejected' });

  } catch (error: any) {
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
    const { paymentMethodId } = await c.req.json();

    const bookingData = await kv.get(`booking:${bookingId}`);
    if (!bookingData) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const booking = JSON.parse(bookingData);

    if (booking.requesterId !== user.id) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'accepted') {
      return c.json({ error: 'Booking must be accepted first' }, 400);
    }

    if (booking.depositPaidAt) {
      return c.json({ error: 'Deposit already paid' }, 400);
    }

    // Mock payment
    const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

    booking.status = 'deposit_paid';
    booking.depositPaidAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();

    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    // Запись платежа в KV
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    await kv.set(`booking_payment:${paymentId}`, JSON.stringify({
      id: paymentId,
      bookingId,
      payerId: user.id,
      recipientId: 'platform',
      amount: booking.depositAmount,
      currency: 'RUB',
      paymentType: 'deposit',
      status: 'completed',
      gateway: 'mock',
      gatewayPaymentId: paymentIntentId,
      processedAt: new Date().toISOString(),
    }));

    // Заблокировать дату в календаре
    await kv.set(`booking_calendar:${booking.performerId}:${booking.eventDate}`, JSON.stringify({
      performerId: booking.performerId,
      performerType: booking.performerType,
      date: booking.eventDate,
      isAvailable: false,
      bookingId,
      createdAt: new Date().toISOString(),
    }));

    await sendNotification({
      userId: booking.performerId,
      type: 'booking_deposit_paid',
      title: 'Депозит получен!',
      message: `Депозит ${booking.depositAmount} руб. оплачен. Дата ${booking.eventDate} забронирована.`,
      data: { bookingId },
    });

    console.log('Deposit paid via KV:', bookingId);
    return c.json({ 
      success: true,
      booking,
      payment: { id: paymentIntentId, amount: booking.depositAmount },
      message: 'Deposit paid successfully'
    });

  } catch (error: any) {
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

    const bookingData = await kv.get(`booking:${bookingId}`);
    if (!bookingData) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const booking = JSON.parse(bookingData);

    if (booking.requesterId !== user.id) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.status !== 'deposit_paid') {
      return c.json({ error: 'Deposit must be paid first' }, 400);
    }

    if (booking.fullPaymentAt) {
      return c.json({ error: 'Final payment already completed' }, 400);
    }

    const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`;

    booking.status = 'confirmed';
    booking.fullPaymentAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();

    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    // Запись платежа
    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    await kv.set(`booking_payment:${paymentId}`, JSON.stringify({
      id: paymentId,
      bookingId,
      payerId: user.id,
      recipientId: 'platform',
      amount: booking.finalAmount,
      currency: 'RUB',
      paymentType: 'final',
      status: 'completed',
      gateway: 'mock',
      gatewayPaymentId: paymentIntentId,
      processedAt: new Date().toISOString(),
    }));

    // Запись дохода платформы (комиссия 10% от полной суммы букинга)
    await recordRevenue({
      channel: 'dj_booking',
      description: `Букинг: ${booking.eventTitle}`,
      grossAmount: booking.offeredPrice,
      platformRevenue: booking.platformCommission,
      payoutAmount: booking.performerFee,
      commissionRate: 0.10,
      payerId: booking.requesterId,
      payerName: booking.requester?.displayName || booking.venueName || 'Заведение',
      payeeId: booking.performerId,
      payeeName: booking.performer?.displayName || 'Артист',
      metadata: { bookingId, eventDate: booking.eventDate, paymentId },
    });

    await sendNotification({
      userId: booking.performerId,
      type: 'booking_confirmed',
      title: 'Букинг подтвержден!',
      message: `Полная оплата получена (${booking.offeredPrice} руб.). Мероприятие ${booking.eventDate} подтверждено.`,
      data: { bookingId },
    });

    console.log('Final payment completed via KV:', bookingId);
    return c.json({ 
      success: true,
      booking,
      payment: { id: paymentIntentId, amount: booking.finalAmount },
      message: 'Final payment completed successfully'
    });

  } catch (error: any) {
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

    const bookingData = await kv.get(`booking:${bookingId}`);
    if (!bookingData) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const booking = JSON.parse(bookingData);

    if (booking.requesterId !== user.id && booking.performerId !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return c.json({ error: 'Booking cannot be cancelled' }, 400);
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = user.id;
    booking.cancellationReason = cancellationReason || 'No reason provided';
    booking.updatedAt = new Date().toISOString();

    await kv.set(`booking:${bookingId}`, JSON.stringify(booking));

    // Разблокировать дату
    await kv.del(`booking_calendar:${booking.performerId}:${booking.eventDate}`);

    // Уведомление другой стороне
    const otherUserId = booking.requesterId === user.id ? booking.performerId : booking.requesterId;
    await sendNotification({
      userId: otherUserId,
      type: 'booking_cancelled',
      title: 'Букинг отменен',
      message: `Букинг "${booking.eventTitle}" был отменен`,
      data: { bookingId, reason: cancellationReason },
    });

    console.log('Booking cancelled via KV:', bookingId);
    return c.json({ success: true, booking, message: 'Booking cancelled successfully' });

  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

export default app;