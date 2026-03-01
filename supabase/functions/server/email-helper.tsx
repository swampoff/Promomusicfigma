/**
 * EMAIL HELPER — Отправка email через Resend API
 * Используется для уведомлений, сброса пароля, верификации email
 */

const ADMIN_EMAIL = 'info@promofm.ru';
const FROM_EMAIL = 'noreply@mail.promofm.org';
const SITE_URL = 'https://promofm.org';
const API_BASE = 'https://qzpmiiqfwkcnrhvubdgt.supabase.co/functions/v1/server';

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

// ── Email Templates ──

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a1a; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background: #1a1a2e; border-radius: 16px; overflow: hidden;">
        <tr><td style="padding: 32px 40px; background: linear-gradient(135deg, #FF577F 0%, #7C3AED 100%);">
          <h1 style="margin: 0; color: #fff; font-size: 24px; font-weight: 700;">ПРОМО.МУЗЫКА</h1>
        </td></tr>
        <tr><td style="padding: 32px 40px; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
          ${content}
        </td></tr>
        <tr><td style="padding: 20px 40px 32px; color: #666; font-size: 12px; border-top: 1px solid #2a2a3e;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ПРОМО.МУЗЫКА — платформа продвижения музыки</p>
          <p style="margin: 4px 0 0;"><a href="${SITE_URL}" style="color: #FF577F; text-decoration: none;">promofm.org</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const buttonStyle = 'display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF577F 0%, #7C3AED 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;';

/**
 * Отправить email для сброса пароля
 */
export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; color: #fff; font-size: 20px;">Сброс пароля</h2>
    <p>Здравствуйте, <strong>${name}</strong>!</p>
    <p>Вы запросили сброс пароля для вашего аккаунта на ПРОМО.МУЗЫКА.</p>
    <p>Нажмите кнопку ниже, чтобы установить новый пароль:</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" style="${buttonStyle}">Сбросить пароль</a>
    </p>
    <p style="color: #999; font-size: 14px;">Ссылка действительна в течение 1 часа.</p>
    <p style="color: #999; font-size: 14px;">��сли вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
    <p style="color: #666; font-size: 12px; margin-top: 24px; word-break: break-all;">Если кнопка не работает, скопируйте ссылку: ${resetUrl}</p>
  `);

  return sendEmail({
    to: email,
    subject: 'Сброс пароля — ПРОМО.МУЗЫКА',
    html,
  });
}

/**
 * Отправить email для подтверждения аккаунта
 */
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
  const verifyUrl = `${API_BASE}/auth/verify-email-page?token=${token}`;

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; color: #fff; font-size: 20px;">Подтвердите ваш email</h2>
    <p>Здравствуйте, <strong>${name}</strong>!</p>
    <p>Спасибо за регистрацию на ПРОМО.МУЗЫКА! Пожалуйста, подтвердите ваш email-адрес.</p>
    <p style="text-align: center; margin: 28px 0;">
      <a href="${verifyUrl}" style="${buttonStyle}">Подтвердить email</a>
    </p>
    <p style="color: #999; font-size: 14px;">Ссылка действительна в течение 24 часов.</p>
    <p style="color: #666; font-size: 12px; margin-top: 24px; word-break: break-all;">Если кнопка не работает, скопируйте ссылку: ${verifyUrl}</p>
  `);

  return sendEmail({
    to: email,
    subject: 'Подтвердите email — ПРОМО.МУЗЫКА',
    html,
  });
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
