/**
 * SMTP EMAIL SENDER — Автономная отправка email через SMTP (Postfix / любой SMTP)
 * Замена Resend API. Работает с локальным Postfix или любым SMTP-сервером.
 *
 * Используется Deno TCP (Deno.connect) для прямой работы с SMTP.
 */

const DEFAULT_SMTP_HOST = Deno.env.get('SMTP_HOST') || 'localhost';
const DEFAULT_SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '25');
const SMTP_USER = Deno.env.get('SMTP_USER') || '';
const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';
const SMTP_FROM = Deno.env.get('SMTP_FROM') || 'ПРОМО.МУЗЫКА <noreply@promofm.org>';
const SMTP_TLS = Deno.env.get('SMTP_TLS') === 'true'; // Use STARTTLS

interface SmtpSendOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface SmtpResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Base64 encode for SMTP AUTH ──
function base64Encode(str: string): string {
  return btoa(str);
}

// ── Read SMTP response ──
async function readResponse(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<string> {
  const { value } = await reader.read();
  if (!value) return '';
  return new TextDecoder().decode(value);
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

// ── Build MIME message ──
function buildMessage(opts: SmtpSendOptions, messageId: string): string {
  const to = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
  const from = opts.from || SMTP_FROM;
  const date = new Date().toUTCString();

  // Encode subject in UTF-8 Base64 for non-ASCII chars
  const subjectEncoded = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(opts.subject)))}?=`;
  // Encode from name
  const fromEncoded = from.includes('<')
    ? `=?UTF-8?B?${btoa(unescape(encodeURIComponent(from.split('<')[0].trim())))}?= <${from.match(/<(.+)>/)?.[1] || from}>`
    : from;

  return [
    `From: ${fromEncoded}`,
    `To: ${to}`,
    `Subject: ${subjectEncoded}`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    opts.replyTo ? `Reply-To: ${opts.replyTo}` : '',
    `X-Mailer: PromoMusic/1.0`,
    '',
    btoa(unescape(encodeURIComponent(opts.html))),
  ].filter(Boolean).join('\r\n');
}

/**
 * Отправить email через SMTP (TCP)
 */
export async function smtpSendEmail(opts: SmtpSendOptions): Promise<SmtpResult> {
  const messageId = generateMessageId();
  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];
  const fromAddr = (opts.from || SMTP_FROM).match(/<(.+)>/)?.[1] || (opts.from || SMTP_FROM);

  let conn: Deno.TcpConn | undefined;

  try {
    // Connect to SMTP server
    conn = await Deno.connect({
      hostname: DEFAULT_SMTP_HOST,
      port: DEFAULT_SMTP_PORT,
    });

    const reader = conn.readable.getReader();
    const writer = conn.writable.getWriter();

    // Helper: send command and read response
    const cmd = async (command: string): Promise<string> => {
      await sendCommand(writer, command);
      const resp = await readResponse(reader);
      return resp;
    };

    // Read greeting
    const greeting = await readResponse(reader);
    if (!greeting.startsWith('220')) {
      throw new Error(`SMTP greeting failed: ${greeting.trim()}`);
    }

    // EHLO
    let ehloResp = await cmd(`EHLO promofm.org`);
    if (!ehloResp.startsWith('250')) {
      throw new Error(`EHLO failed: ${ehloResp.trim()}`);
    }

    // STARTTLS if configured (for port 587)
    if (SMTP_TLS) {
      const tlsResp = await cmd('STARTTLS');
      if (tlsResp.startsWith('220')) {
        // Upgrade to TLS
        // Note: Deno.startTls requires closing reader/writer first
        reader.releaseLock();
        writer.releaseLock();
        const tlsConn = await Deno.startTls(conn, { hostname: DEFAULT_SMTP_HOST });
        conn = tlsConn as unknown as Deno.TcpConn;
        // Re-EHLO after TLS
        const newReader = conn.readable.getReader();
        const newWriter = conn.writable.getWriter();
        await newWriter.write(new TextEncoder().encode('EHLO promofm.org\r\n'));
        ehloResp = new TextDecoder().decode((await newReader.read()).value || new Uint8Array());

        // AUTH if credentials provided
        if (SMTP_USER && SMTP_PASS) {
          await newWriter.write(new TextEncoder().encode('AUTH LOGIN\r\n'));
          await newReader.read(); // 334
          await newWriter.write(new TextEncoder().encode(base64Encode(SMTP_USER) + '\r\n'));
          await newReader.read(); // 334
          await newWriter.write(new TextEncoder().encode(base64Encode(SMTP_PASS) + '\r\n'));
          const authResp = new TextDecoder().decode((await newReader.read()).value || new Uint8Array());
          if (!authResp.startsWith('235')) {
            throw new Error(`SMTP AUTH failed: ${authResp.trim()}`);
          }
        }

        // MAIL FROM
        await newWriter.write(new TextEncoder().encode(`MAIL FROM:<${fromAddr}>\r\n`));
        const mailResp = new TextDecoder().decode((await newReader.read()).value || new Uint8Array());
        if (!mailResp.startsWith('250')) throw new Error(`MAIL FROM failed: ${mailResp.trim()}`);

        // RCPT TO
        for (const rcpt of recipients) {
          await newWriter.write(new TextEncoder().encode(`RCPT TO:<${rcpt.trim()}>\r\n`));
          const rcptResp = new TextDecoder().decode((await newReader.read()).value || new Uint8Array());
          if (!rcptResp.startsWith('250')) throw new Error(`RCPT TO failed for ${rcpt}: ${rcptResp.trim()}`);
        }

        // DATA
        await newWriter.write(new TextEncoder().encode('DATA\r\n'));
        const dataResp = new TextDecoder().decode((await newReader.read()).value || new Uint8Array());
        if (!dataResp.startsWith('354')) throw new Error(`DATA failed: ${dataResp.trim()}`);

        const message = buildMessage(opts, messageId);
        await newWriter.write(new TextEncoder().encode(message + '\r\n.\r\n'));
        const sendResp = new TextDecoder().decode((await newReader.read()).value || new Uint8Array());
        if (!sendResp.startsWith('250')) throw new Error(`Message send failed: ${sendResp.trim()}`);

        // QUIT
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
        await cmd(base64Encode(SMTP_USER));
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
  }
): Promise<{ total: number; sent: number; failed: number; errors: string[] }> {
  const batchSize = options?.batchSize || 50;
  const delayMs = options?.delayMs || 1000;
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const promises = batch.map(async (rcpt) => {
      // Replace template variables
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
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${rcpt.email}: ${result.error}`);
      }
    });

    await Promise.all(promises);

    // Delay between batches to avoid overwhelming SMTP
    if (i + batchSize < recipients.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  console.log(`[SMTP Batch] Total: ${recipients.length}, Sent: ${sent}, Failed: ${failed}`);
  return { total: recipients.length, sent, failed, errors };
}
