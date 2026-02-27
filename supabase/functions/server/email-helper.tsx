/**
 * EMAIL HELPER — Отправка email через Resend API
 * Используется для дублирования заявок на info@promofm.ru
 */

const ADMIN_EMAIL = 'info@promofm.ru';
const FROM_EMAIL = 'noreply@promofm.ru';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Отправить email через Resend API
 */
export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not set, skipping email');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: opts.from || FROM_EMAIL,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Email] Resend error:', res.status, err);
      return false;
    }

    const data = await res.json();
    console.log('[Email] Sent:', data.id, 'to:', opts.to);
    return true;
  } catch (err) {
    console.error('[Email] Send failed:', err);
    return false;
  }
}

/**
 * Уведомить админа о новой заявке артиста на радио
 */
export async function notifyArtistRequest(data: {
  artistName: string;
  trackTitle: string;
  genre?: string;
  stationName?: string;
  stationId: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #FF577F;">Новая заявка артиста на радио</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold;">Артист:</td><td style="padding: 8px;">${data.artistName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Трек:</td><td style="padding: 8px;">${data.trackTitle}</td></tr>
        ${data.genre ? `<tr><td style="padding: 8px; font-weight: bold;">Жанр:</td><td style="padding: 8px;">${data.genre}</td></tr>` : ''}
        <tr><td style="padding: 8px; font-weight: bold;">Радиостанция:</td><td style="padding: 8px;">${data.stationName || data.stationId}</td></tr>
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">ПРОМО.МУЗЫКА — автоматическое уведомление</p>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ПРОМО] Заявка артиста: ${data.artistName} — ${data.trackTitle}`,
    html,
  });
}

/**
 * Уведомить админа о новой заявке заведения на радио
 */
export async function notifyVenueRequest(data: {
  venueName: string;
  venueCity?: string;
  packageType?: string;
  totalPrice?: number;
  stationName?: string;
  stationId: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #7C3AED;">Новая заявка заведения на радиорекламу</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold;">Заведение:</td><td style="padding: 8px;">${data.venueName}</td></tr>
        ${data.venueCity ? `<tr><td style="padding: 8px; font-weight: bold;">Город:</td><td style="padding: 8px;">${data.venueCity}</td></tr>` : ''}
        ${data.packageType ? `<tr><td style="padding: 8px; font-weight: bold;">Пакет:</td><td style="padding: 8px;">${data.packageType}</td></tr>` : ''}
        ${data.totalPrice ? `<tr><td style="padding: 8px; font-weight: bold;">Сумма:</td><td style="padding: 8px;">${data.totalPrice} ₽</td></tr>` : ''}
        <tr><td style="padding: 8px; font-weight: bold;">Радиостанция:</td><td style="padding: 8px;">${data.stationName || data.stationId}</td></tr>
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">ПРОМО.МУЗЫКА — автоматическое уведомление</p>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ПРОМО] Заявка заведения: ${data.venueName}${data.totalPrice ? ` — ${data.totalPrice}₽` : ''}`,
    html,
  });
}

/**
 * Уведомить админа о новом бронировании
 */
export async function notifyBookingRequest(data: {
  venueName: string;
  performerName?: string;
  eventTitle: string;
  eventDate: string;
  offeredPrice?: number;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #10B981;">Новое бронирование</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold;">Заведение:</td><td style="padding: 8px;">${data.venueName}</td></tr>
        ${data.performerName ? `<tr><td style="padding: 8px; font-weight: bold;">Артист:</td><td style="padding: 8px;">${data.performerName}</td></tr>` : ''}
        <tr><td style="padding: 8px; font-weight: bold;">Событие:</td><td style="padding: 8px;">${data.eventTitle}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Дата:</td><td style="padding: 8px;">${data.eventDate}</td></tr>
        ${data.offeredPrice ? `<tr><td style="padding: 8px; font-weight: bold;">Цена:</td><td style="padding: 8px;">${data.offeredPrice} ₽</td></tr>` : ''}
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">ПРОМО.МУЗЫКА — автоматическое уведомление</p>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ПРОМО] Бронирование: ${data.eventTitle} — ${data.eventDate}`,
    html,
  });
}

/**
 * Уведомить админа о регистрации нового пользователя
 */
export async function notifyNewUser(data: {
  email: string;
  name: string;
  role: string;
  via?: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #3B82F6;">Новый пользователь</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight: bold;">Имя:</td><td style="padding: 8px;">${data.name}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${data.email}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Роль:</td><td style="padding: 8px;">${data.role}</td></tr>
        ${data.via ? `<tr><td style="padding: 8px; font-weight: bold;">Через:</td><td style="padding: 8px;">${data.via}</td></tr>` : ''}
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">ПРОМО.МУЗЫКА — автоматическое уведомление</p>
    </div>
  `;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[ПРОМО] Новый ${data.role}: ${data.name} (${data.email})`,
    html,
  });
}
