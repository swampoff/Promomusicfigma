/**
 * SMTP EMAIL SENDER — Автономная отправка email через SMTP (Postfix / любой SMTP)
 * Замена Resend API. Работает с локальным Postfix или любым SMTP-сервером.
 *
 * Features:
 * - Direct TCP SMTP via Deno.connect
 * - STARTTLS support (port 587)
 * - AUTH LOGIN
 * - Connection timeout (30s)
 * - Per-email retry with exponential backoff
 * - List-Unsubscribe header (RFC 8058)
 * - Multi-part MIME (HTML + plain text fallback)
 * - Proper UTF-8 encoding via TextEncoder
 * - Batch sending with rate limiting
 */

const DEFAULT_SMTP_HOST = Deno.env.get('SMTP_HOST') || 'localhost';
const DEFAULT_SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '25');
const SMTP_USER = Deno.env.get('SMTP_USER') || '';
const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';
const SMTP_FROM = Deno.env.get('SMTP_FROM') || 'ПРОМО.МУЗЫКА <noreply@promofm.org>';
const SMTP_TLS = Deno.env.get('SMTP_TLS') === 'true';
const UNSUBSCRIBE_URL = 'https://promofm.org/unsubscribe';
const CONNECT_TIMEOUT_MS = 30_000;

interface SmtpSendOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  listUnsubscribe?: boolean; // default true for campaigns
  campaignId?: string;
}

interface SmtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── UTF-8 safe Base64 ──
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64Encode(str: string): string {
  return btoa(str);
}

// ── Read SMTP response with timeout ──
async function readResponse(reader: ReadableStreamDefaultReader<Uint8Array>, timeoutMs = 15000): Promise<string> {
  const timer = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('SMTP read timeout')), timeoutMs)
  );
  const read = reader.read().then(({ value }) => {
    if (!value) return '';
    return new TextDecoder().decode(value);
  });
  return Promise.race([read, timer]);
}

// ── Send SMTP command ──
async function sendCommand(writer: WritableStreamDefaultWriter<Uint8Array>, cmd: string): Promise<void> {
  await writer.write(new TextEncoder().encode(cmd + '\r\n'));
}

// ── Generate Message-ID ──
function generateMessageId(): string {
  const rand = Math.random().toString(36).substring(2, 15);
  const ts = Date.now().toString(36);
  return `<${ts}.${rand}@promofm.org>`;
}

// ── Strip HTML to plain text (basic) ──
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Encode MIME header value (RFC 2047) ──
function encodeMimeHeader(value: string): string {
  // Check if value has non-ASCII chars
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${utf8ToBase64(value)}?=`;
}

// ── Build multi-part MIME message ──
function buildMessage(opts: SmtpSendOptions, messageId: string): string {
  const to = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
  const from = opts.from || SMTP_FROM;
  const date = new Date().toUTCString();
  const boundary = `----PromoMusic_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;

  // Encode from name if it has non-ASCII
  const fromEncoded = from.includes('<')
    ? `${encodeMimeHeader(from.split('<')[0].trim())} <${from.match(/<(.+)>/)?.[1] || from}>`
    : from;

  const plainText = htmlToPlainText(opts.html);
  const htmlBase64 = utf8ToBase64(opts.html);
  const textBase64 = utf8ToBase64(plainText);

  const headers = [
    `From: ${fromEncoded}`,
    `To: ${to}`,
    `Subject: ${encodeMimeHeader(opts.subject)}`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `X-Mailer: PromoMusic/2.0`,
    `Precedence: bulk`,
  ];

  if (opts.replyTo) headers.push(`Reply-To: ${opts.replyTo}`);

  // List-Unsubscribe (RFC 8058)
  if (opts.listUnsubscribe !== false) {
    const email = Array.isArray(opts.to) ? opts.to[0] : opts.to;
    const unsubUrl = opts.campaignId
      ? `${UNSUBSCRIBE_URL}?email=${encodeURIComponent(email)}&campaign=${opts.campaignId}`
      : `${UNSUBSCRIBE_URL}?email=${encodeURIComponent(email)}`;
    headers.push(`List-Unsubscribe: <${unsubUrl}>`);
    headers.push(`List-Unsubscribe-Post: List-Unsubscribe=One-Click`);
  }

  const body = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    '',
    textBase64,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    '',
    htmlBase64,
    '',
    `--${boundary}--`,
  ];

  return [...headers, '', ...body].join('\r\n');
}

// ── Connect with timeout ──
async function connectWithTimeout(hostname: string, port: number): Promise<Deno.TcpConn> {
  const timer = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`SMTP connection timeout (${CONNECT_TIMEOUT_MS}ms)`)), CONNECT_TIMEOUT_MS)
  );
  const connect = Deno.connect({ hostname, port });
  return Promise.race([connect, timer]);
}

/**
 * Отправить email через SMTP (TCP) с таймаутом и retry
 */
export async function smtpSendEmail(opts: SmtpSendOptions, retries = 2): Promise<SmtpResult> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await smtpSendEmailOnce(opts);
    if (result.success) return result;

    // Don't retry on permanent errors (bad recipient, auth failure)
    if (result.error?.includes('AUTH failed') || result.error?.includes('RCPT TO failed')) {
      return result;
    }

    if (attempt < retries) {
      const delay = 1000 * Math.pow(2, attempt); // 1s, 2s
      console.warn(`[SMTP] Retry ${attempt + 1}/${retries} for ${Array.isArray(opts.to) ? opts.to[0] : opts.to} in ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

async function smtpSendEmailOnce(opts: SmtpSendOptions): Promise<SmtpResult> {
  const messageId = generateMessageId();
  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];
  const fromAddr = (opts.from || SMTP_FROM).match(/<(.+)>/)?.[1] || (opts.from || SMTP_FROM);

  let conn: Deno.TcpConn | undefined;

  try {
    conn = await connectWithTimeout(DEFAULT_SMTP_HOST, DEFAULT_SMTP_PORT);

    const reader = conn.readable.getReader();
    const writer = conn.writable.getWriter();

    const cmd = async (command: string): Promise<string> => {
      await sendCommand(writer, command);
      return readResponse(reader);
    };

    // Read greeting
    const greeting = await readResponse(reader);
    if (!greeting.startsWith('220')) {
      throw new Error(`SMTP greeting failed: ${greeting.trim()}`);
    }

    // EHLO
    let ehloResp = await cmd('EHLO promofm.org');
    if (!ehloResp.startsWith('250')) {
      throw new Error(`EHLO failed: ${ehloResp.trim()}`);
    }

    // STARTTLS if configured (for port 587)
    if (SMTP_TLS) {
      const tlsResp = await cmd('STARTTLS');
      if (tlsResp.startsWith('220')) {
        reader.releaseLock();
        writer.releaseLock();
        const tlsConn = await Deno.startTls(conn, { hostname: DEFAULT_SMTP_HOST });
        conn = tlsConn as unknown as Deno.TcpConn;
        const newReader = conn.readable.getReader();
        const newWriter = conn.writable.getWriter();

        const tlsCmd = async (command: string): Promise<string> => {
          await newWriter.write(new TextEncoder().encode(command + '\r\n'));
          return readResponse(newReader);
        };

        // Re-EHLO after TLS
        ehloResp = await tlsCmd('EHLO promofm.org');

        // AUTH if credentials provided
        if (SMTP_USER && SMTP_PASS) {
          const authStart = await tlsCmd('AUTH LOGIN');
          if (!authStart.startsWith('334')) throw new Error(`AUTH LOGIN rejected: ${authStart.trim()}`);
          const userResp = await tlsCmd(base64Encode(SMTP_USER));
          if (!userResp.startsWith('334')) throw new Error(`SMTP AUTH user rejected: ${userResp.trim()}`);
          const passResp = await tlsCmd(base64Encode(SMTP_PASS));
          if (!passResp.startsWith('235')) throw new Error(`SMTP AUTH failed: ${passResp.trim()}`);
        }

        // MAIL FROM
        const mailResp = await tlsCmd(`MAIL FROM:<${fromAddr}>`);
        if (!mailResp.startsWith('250')) throw new Error(`MAIL FROM failed: ${mailResp.trim()}`);

        // RCPT TO
        for (const rcpt of recipients) {
          const rcptResp = await tlsCmd(`RCPT TO:<${rcpt.trim()}>`);
          if (!rcptResp.startsWith('250')) throw new Error(`RCPT TO failed for ${rcpt}: ${rcptResp.trim()}`);
        }

        // DATA
        const dataResp = await tlsCmd('DATA');
        if (!dataResp.startsWith('354')) throw new Error(`DATA failed: ${dataResp.trim()}`);

        const message = buildMessage(opts, messageId);
        await newWriter.write(new TextEncoder().encode(message + '\r\n.\r\n'));
        const sendResp = await readResponse(newReader);
        if (!sendResp.startsWith('250')) throw new Error(`Message send failed: ${sendResp.trim()}`);

        await newWriter.write(new TextEncoder().encode('QUIT\r\n'));
        newReader.releaseLock();
        newWriter.releaseLock();

        console.log(`[SMTP] Sent email to ${recipients.join(', ')}, msgId: ${messageId}`);
        return { success: true, messageId };
      }
    }

    // AUTH if credentials provided (non-TLS, e.g. local Postfix)
    if (SMTP_USER && SMTP_PASS) {
      const authResp1 = await cmd('AUTH LOGIN');
      if (authResp1.startsWith('334')) {
        const userResp = await cmd(base64Encode(SMTP_USER));
        if (!userResp.startsWith('334')) throw new Error(`SMTP AUTH user rejected: ${userResp.trim()}`);
        const authResp2 = await cmd(base64Encode(SMTP_PASS));
        if (!authResp2.startsWith('235')) {
          throw new Error(`SMTP AUTH failed: ${authResp2.trim()}`);
        }
      }
    }

    // MAIL FROM
    const mailResp = await cmd(`MAIL FROM:<${fromAddr}>`);
    if (!mailResp.startsWith('250')) {
      throw new Error(`MAIL FROM failed: ${mailResp.trim()}`);
    }

    // RCPT TO for each recipient
    for (const rcpt of recipients) {
      const rcptResp = await cmd(`RCPT TO:<${rcpt.trim()}>`);
      if (!rcptResp.startsWith('250')) {
        throw new Error(`RCPT TO failed for ${rcpt}: ${rcptResp.trim()}`);
      }
    }

    // DATA
    const dataResp = await cmd('DATA');
    if (!dataResp.startsWith('354')) {
      throw new Error(`DATA command failed: ${dataResp.trim()}`);
    }

    // Send message body
    const message = buildMessage(opts, messageId);
    const sendResp = await cmd(message + '\r\n.');
    if (!sendResp.startsWith('250')) {
      throw new Error(`Message rejected: ${sendResp.trim()}`);
    }

    // QUIT
    await cmd('QUIT');
    reader.releaseLock();
    writer.releaseLock();

    console.log(`[SMTP] Sent email to ${recipients.join(', ')}, msgId: ${messageId}`);
    return { success: true, messageId };

  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[SMTP] Failed to send to ${recipients?.join(', ')}:`, errMsg);
    return { success: false, error: errMsg };
  } finally {
    try { conn?.close(); } catch { /* ignore */ }
  }
}

/**
 * Отправить email батчами (для рассылок)
 * Отправляет по batchSize писем с паузой delayMs между батчами
 * Использует sequential sending внутри батча для стабильности
 */
export async function smtpSendBatch(
  recipients: { email: string; vars?: Record<string, string> }[],
  subject: string,
  htmlTemplate: string,
  options?: {
    from?: string;
    replyTo?: string;
    batchSize?: number;
    delayMs?: number;
    campaignId?: string;
  }
): Promise<{ total: number; sent: number; failed: number; errors: string[] }> {
  const batchSize = options?.batchSize || 50;
  const delayMs = options?.delayMs || 1000;
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  // Validate emails and deduplicate
  const seen = new Set<string>();
  const validRecipients = recipients.filter(rcpt => {
    const email = rcpt.email.trim().toLowerCase();
    if (!email || !email.includes('@') || seen.has(email)) return false;
    seen.add(email);
    return true;
  });

  for (let i = 0; i < validRecipients.length; i += batchSize) {
    const batch = validRecipients.slice(i, i + batchSize);

    // Send sequentially within batch for SMTP stability
    for (const rcpt of batch) {
      let html = htmlTemplate;
      if (rcpt.vars) {
        for (const [key, val] of Object.entries(rcpt.vars)) {
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
        }
      }

      const result = await smtpSendEmail({
        to: rcpt.email,
        subject,
        html,
        from: options?.from,
        replyTo: options?.replyTo,
        listUnsubscribe: true,
        campaignId: options?.campaignId,
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${rcpt.email}: ${result.error}`);
      }
    }

    // Delay between batches
    if (i + batchSize < validRecipients.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  console.log(`[SMTP Batch] Total: ${validRecipients.length}, Sent: ${sent}, Failed: ${failed}`);
  return { total: validRecipients.length, sent, failed, errors };
}
