/**
 * PRODUCER STUDIO ROUTES
 * Маршруты для реальных сообщений (KV Store) и календаря сессий
 * Ключи KV:
 *   producer-convs:{producerId}       → ConversationMeta[]
 *   producer-msgs:{conversationId}    → Message[]
 *   producer-sessions:{producerId}    → CalendarSession[]
 */

import { Hono } from "npm:hono@4";
import * as kv from "./kv_store.tsx";
import { getSupabaseClient } from "./supabase-client.tsx";
import { requireAuth } from './auth-middleware.tsx';

const app = new Hono();

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

interface Message {
  id: string;
  text: string;
  sender: 'producer' | 'client';
  timestamp: string;      // ISO
  read: boolean;
  attachment?: { type: 'audio' | 'image' | 'file'; name: string };
}

interface ConversationMeta {
  id: string;
  producerId: string;
  clientName: string;
  clientInitial: string;
  orderTitle: string;
  orderId: string;
  lastMessage: string;
  lastTime: string;       // HH:mm
  unread: number;
  online: boolean;
  createdAt: string;      // ISO
}

interface CalendarSession {
  id: string;
  producerId: string;
  title: string;
  clientName: string;
  clientId?: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  type: 'recording' | 'mixing' | 'mastering' | 'consultation' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  color?: string;
  orderId?: string;
  createdAt: string;
}

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function timeHHmm(): string {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });
}

// ════════════════════════════════════════
// CONVERSATIONS
// ════════════════════════════════════════

// GET /conversations/:producerId
app.get('/conversations/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const key = `producer-convs:${producerId}`;
    let convs: ConversationMeta[] = await kv.get(key) || [];

    // If empty, seed demo conversations for this producer
    if (convs.length === 0) {
      convs = seedDemoConversations(producerId);
      await kv.set(key, convs);
      // Also seed messages for each conversation
      for (const conv of convs) {
        const msgs = seedDemoMessages(conv.id);
        await kv.set(`producer-msgs:${conv.id}`, msgs);
      }
    }

    return c.json({ success: true, data: convs });
  } catch (error) {
    console.log(`Error fetching conversations: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /conversations/create
app.post('/conversations/create', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { producerId, clientName, orderTitle, orderId } = body;

    if (!producerId || !clientName) {
      return c.json({ success: false, error: 'producerId and clientName are required' }, 400);
    }

    const conv: ConversationMeta = {
      id: genId('conv'),
      producerId,
      clientName,
      clientInitial: clientName[0]?.toUpperCase() || '?',
      orderTitle: orderTitle || 'Новый диалог',
      orderId: orderId || '',
      lastMessage: '',
      lastTime: timeHHmm(),
      unread: 0,
      online: Math.random() > 0.4,
      createdAt: nowIso(),
    };

    const key = `producer-convs:${producerId}`;
    const convs: ConversationMeta[] = await kv.get(key) || [];
    convs.unshift(conv);
    await kv.set(key, convs);

    // Create empty messages array
    await kv.set(`producer-msgs:${conv.id}`, []);

    return c.json({ success: true, data: conv });
  } catch (error) {
    console.log(`Error creating conversation: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════

// GET /messages/:conversationId
app.get('/messages/:conversationId', requireAuth, async (c) => {
  try {
    const convId = c.req.param('conversationId');
    const msgs: Message[] = await kv.get(`producer-msgs:${convId}`) || [];
    return c.json({ success: true, data: msgs });
  } catch (error) {
    console.log(`Error fetching messages: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /messages/:conversationId/poll?since=<iso>
// Returns only messages after 'since' timestamp (for efficient polling)
app.get('/messages/:conversationId/poll', requireAuth, async (c) => {
  try {
    const convId = c.req.param('conversationId');
    const since = c.req.query('since') || '1970-01-01T00:00:00Z';
    const sinceTime = new Date(since).getTime();

    const msgs: Message[] = await kv.get(`producer-msgs:${convId}`) || [];
    const newMsgs = msgs.filter(m => new Date(m.timestamp).getTime() > sinceTime);

    return c.json({ success: true, data: newMsgs, total: msgs.length });
  } catch (error) {
    console.log(`Error polling messages: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /messages/send
app.post('/messages/send', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { conversationId, producerId, text, sender, attachment } = body;

    if (!conversationId || !text || !sender) {
      return c.json({ success: false, error: 'conversationId, text, and sender are required' }, 400);
    }

    const msg: Message = {
      id: genId('msg'),
      text,
      sender,
      timestamp: nowIso(),
      read: false,
      ...(attachment ? { attachment } : {}),
    };

    // Append message
    const msgKey = `producer-msgs:${conversationId}`;
    const msgs: Message[] = await kv.get(msgKey) || [];
    msgs.push(msg);
    await kv.set(msgKey, msgs);

    // Update conversation meta
    if (producerId) {
      const convKey = `producer-convs:${producerId}`;
      const convs: ConversationMeta[] = await kv.get(convKey) || [];
      const idx = convs.findIndex(c => c.id === conversationId);
      if (idx >= 0) {
        convs[idx].lastMessage = text.length > 60 ? text.slice(0, 57) + '...' : text;
        convs[idx].lastTime = timeHHmm();
        if (sender === 'client') {
          convs[idx].unread = (convs[idx].unread || 0) + 1;
        }
        await kv.set(convKey, convs);
      }
    }

    // Simulate client auto-reply after 3-8 seconds (only for producer messages)
    if (sender === 'producer') {
      setTimeout(async () => {
        try {
          const autoReplies = [
            'Отлично, спасибо!',
            'Понял, жду результат.',
            'Супер, мне нравится направление!',
            'Хорошо, договорились.',
            'Можно ещё уточнить один момент?',
            'Звучит здорово!',
            'Ок, буду на связи.',
          ];
          const reply: Message = {
            id: genId('msg'),
            text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
            sender: 'client',
            timestamp: nowIso(),
            read: false,
          };
          const currentMsgs: Message[] = await kv.get(msgKey) || [];
          currentMsgs.push(reply);
          await kv.set(msgKey, currentMsgs);

          // Update conversation meta
          if (producerId) {
            const convKey = `producer-convs:${producerId}`;
            const currentConvs: ConversationMeta[] = await kv.get(convKey) || [];
            const convIdx = currentConvs.findIndex(c => c.id === conversationId);
            if (convIdx >= 0) {
              currentConvs[convIdx].lastMessage = reply.text;
              currentConvs[convIdx].lastTime = timeHHmm();
              currentConvs[convIdx].unread = (currentConvs[convIdx].unread || 0) + 1;
              await kv.set(convKey, currentConvs);
            }
          }
        } catch (e) {
          console.log(`Auto-reply error: ${e}`);
        }
      }, 3000 + Math.random() * 5000);
    }

    return c.json({ success: true, data: msg });
  } catch (error) {
    console.log(`Error sending message: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /messages/read
app.post('/messages/read', requireAuth, async (c) => {
  try {
    const { conversationId, producerId } = await c.req.json();
    if (!conversationId) {
      return c.json({ success: false, error: 'conversationId required' }, 400);
    }

    // Mark all client messages as read
    const msgKey = `producer-msgs:${conversationId}`;
    const msgs: Message[] = await kv.get(msgKey) || [];
    let changed = false;
    for (const m of msgs) {
      if (m.sender === 'client' && !m.read) {
        m.read = true;
        changed = true;
      }
    }
    if (changed) await kv.set(msgKey, msgs);

    // Reset unread counter
    if (producerId) {
      const convKey = `producer-convs:${producerId}`;
      const convs: ConversationMeta[] = await kv.get(convKey) || [];
      const idx = convs.findIndex(c => c.id === conversationId);
      if (idx >= 0 && convs[idx].unread > 0) {
        convs[idx].unread = 0;
        await kv.set(convKey, convs);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error marking read: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ════════════════════════════════════════
// FILE UPLOAD (Supabase Storage)
// ════════════════════════════════════════

const AUDIO_BUCKET = 'make-84730125-audio-files';

// POST /upload/audio - accepts base64 audio data, stores in Supabase Storage, returns signed URL
app.post('/upload/audio', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { fileName, base64Data, contentType } = body;

    if (!fileName || !base64Data) {
      return c.json({ success: false, error: 'fileName and base64Data are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const mimeType = contentType || 'audio/webm';

    // Decode base64 to Uint8Array
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Ensure bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b: any) => b.name === AUDIO_BUCKET);
      if (!bucketExists) {
        await supabase.storage.createBucket(AUDIO_BUCKET, { public: false });
      }
    } catch (bucketErr: any) {
      console.warn('⚠️ listBuckets failed, attempting createBucket directly:', bucketErr?.message);
      try {
        await supabase.storage.createBucket(AUDIO_BUCKET, { public: false });
      } catch {
        // Bucket may already exist - ignore
      }
    }

    // Generate unique path
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 7);
    const ext = fileName.split('.').pop() || 'webm';
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `producer-chat/${timestamp}_${random}_${sanitized}`;

    // Upload
    const { data, error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(storagePath, bytes, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.log(`Upload error: ${uploadError.message}`);
      return c.json({ success: false, error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Create signed URL (1 hour expiry)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(storagePath, 3600);

    if (signedError) {
      console.log(`Signed URL error: ${signedError.message}`);
      return c.json({ success: false, error: `Signed URL failed: ${signedError.message}` }, 500);
    }

    return c.json({
      success: true,
      data: {
        url: signedData.signedUrl,
        path: storagePath,
        fileName,
        contentType: mimeType,
        size: bytes.length,
      },
    });
  } catch (error) {
    console.log(`Error uploading audio: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /upload/signed-url?path=<storagePath> - refresh signed URL for a stored file
app.get('/upload/signed-url', requireAuth, async (c) => {
  try {
    const storagePath = c.req.query('path');
    if (!storagePath) {
      return c.json({ success: false, error: 'path query param required' }, 400);
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(storagePath, 3600);

    if (error) {
      return c.json({ success: false, error: error.message }, 500);
    }
    return c.json({ success: true, data: { url: data.signedUrl } });
  } catch (error) {
    console.log(`Error getting signed URL: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ════════════════════════════════════════
// PRODUCER SETTINGS (KV Store persistence)
// ════════════════════════════════════════

interface ProducerSettings {
  emailNotifs: boolean;
  pushNotifs: boolean;
  soundNotifs: boolean;
  newOrderNotif: boolean;
  messageNotif: boolean;
  reviewNotif: boolean;
  payoutNotif: boolean;
  marketingNotif: boolean;
  workDays: boolean[];
  workStart: string;
  workEnd: string;
  timezone: string;
  autoReply: boolean;
  autoReplyText: string;
  vacationMode: boolean;
  profilePublic: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  twoFactorAuth: boolean;
  language: string;
  theme: string;
  density: string;
  minPayoutAmount: number;
  legalStatus: string;
  inn: string;
  updatedAt: string;
}

// GET /settings/:producerId
app.get('/settings/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const settings = await kv.get(`producer-settings:${producerId}`);
    return c.json({ success: true, data: settings || null });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /settings/:producerId
app.post('/settings/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const body = await c.req.json();
    const settings = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`producer-settings:${producerId}`, settings);
    return c.json({ success: true, data: settings });
  } catch (error) {
    console.log(`Error saving settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ════════════════════════════════════════
// SERVICES CRUD
// ════════════════════════════════════════

interface CustomService {
  id: string; producerId: string; title: string; type: string;
  basePrice: number; description: string; deliveryDays: number;
  revisions: number; includes: string[]; status: 'active' | 'paused';
  orders: number; rating: number; createdAt: string;
}

app.post('/services/create', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { producerId, title, type, basePrice, description, deliveryDays, revisions, includes } = body;
    if (!producerId || !title || !basePrice) return c.json({ success: false, error: 'producerId, title, basePrice required' }, 400);
    const svc: CustomService = { id: genId('svc'), producerId, title, type: type || 'mixing', basePrice: Number(basePrice), description: description || '', deliveryDays: Number(deliveryDays) || 5, revisions: Number(revisions) || 2, includes: includes || [], status: 'active', orders: 0, rating: 5.0, createdAt: nowIso() };
    const key = `producer-custom-services:${producerId}`;
    const list: CustomService[] = await kv.get(key) || [];
    list.push(svc);
    await kv.set(key, list);
    return c.json({ success: true, data: svc });
  } catch (error) { console.log(`Error creating service: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.put('/services/update/:serviceId', requireAuth, async (c) => {
  try {
    const serviceId = c.req.param('serviceId');
    const body = await c.req.json();
    const { producerId } = body;
    if (!producerId) return c.json({ success: false, error: 'producerId required' }, 400);
    const key = `producer-custom-services:${producerId}`;
    const list: CustomService[] = await kv.get(key) || [];
    const idx = list.findIndex(s => s.id === serviceId);
    if (idx < 0) return c.json({ success: false, error: 'Service not found' }, 404);
    for (const f of ['title','type','basePrice','description','deliveryDays','revisions','includes','status']) { if (body[f] !== undefined) (list[idx] as any)[f] = body[f]; }
    await kv.set(key, list);
    return c.json({ success: true, data: list[idx] });
  } catch (error) { console.log(`Error updating service: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.delete('/services/delete/:serviceId', requireAuth, async (c) => {
  try {
    const serviceId = c.req.param('serviceId');
    const producerId = c.req.query('producerId');
    if (!producerId) return c.json({ success: false, error: 'producerId required' }, 400);
    const key = `producer-custom-services:${producerId}`;
    const list: CustomService[] = await kv.get(key) || [];
    const filtered = list.filter(s => s.id !== serviceId);
    if (filtered.length === list.length) return c.json({ success: false, error: 'Not found' }, 404);
    await kv.set(key, filtered);
    return c.json({ success: true });
  } catch (error) { console.log(`Error deleting service: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/services/custom/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const list: CustomService[] = await kv.get(`producer-custom-services:${producerId}`) || [];
    return c.json({ success: true, data: list });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ════════════════════════════════════════
// PORTFOLIO CRUD
// ════════════════════════════════════════

app.post('/portfolio/create', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { producerId, title, artist, type, description } = body;
    if (!producerId || !title || !artist) return c.json({ success: false, error: 'producerId, title, artist required' }, 400);
    const entry = { id: genId('pf'), producerId, title, artist, type: type || 'Сведение', year: new Date().getFullYear(), description: description || '', createdAt: nowIso() };
    const key = `producer-custom-portfolio:${producerId}`;
    const list = await kv.get(key) || [];
    list.unshift(entry);
    await kv.set(key, list);
    return c.json({ success: true, data: entry });
  } catch (error) { console.log(`Error creating portfolio: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.delete('/portfolio/delete/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const producerId = c.req.query('producerId');
    if (!producerId) return c.json({ success: false, error: 'producerId required' }, 400);
    const key = `producer-custom-portfolio:${producerId}`;
    const list = await kv.get(key) || [];
    const filtered = (list as any[]).filter(p => p.id !== id);
    if (filtered.length === list.length) return c.json({ success: false, error: 'Not found' }, 404);
    await kv.set(key, filtered);
    return c.json({ success: true });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ════════════════════════════════════════
// PROFILE UPDATE
// ════════════════════════════════════════

app.put('/profile/update/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const body = await c.req.json();
    const existing = await kv.get(`producer-profile-edit:${producerId}`) || {};
    const updated = { ...(existing as any), ...body, updatedAt: nowIso() };
    await kv.set(`producer-profile-edit:${producerId}`, updated);
    return c.json({ success: true, data: updated });
  } catch (error) { console.log(`Error updating profile: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/profile/edits/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const edits = await kv.get(`producer-profile-edit:${producerId}`);
    return c.json({ success: true, data: edits || null });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ════════════════════════════════════════
// WALLET WITHDRAWAL
// ════════════════════════════════════════

app.post('/wallet/withdraw', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { producerId, amount, method, methodLabel } = body;
    if (!producerId || !amount || !method) return c.json({ success: false, error: 'producerId, amount, method required' }, 400);
    const wd = { id: genId('wd'), producerId, amount: Number(amount), method, methodLabel: methodLabel || method, status: 'pending', createdAt: nowIso() };
    const key = `producer-withdrawals:${producerId}`;
    const list = await kv.get(key) || [];
    (list as any[]).unshift(wd);
    await kv.set(key, list);
    return c.json({ success: true, data: wd });
  } catch (error) { console.log(`Error creating withdrawal: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/wallet/withdrawals/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const list = await kv.get(`producer-withdrawals:${producerId}`) || [];
    return c.json({ success: true, data: list });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

// ════════════════════════════════════════
// AI ASSISTANT (Producer context)
// ════════════════════════════════════════

app.post('/ai/analyze', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { producerId, context, question } = body;
    if (!producerId) return c.json({ success: false, error: 'producerId required' }, 400);

    const [convs, sessions, settings, withdrawals, customSvcs] = await Promise.all([
      kv.get(`producer-convs:${producerId}`),
      kv.get(`producer-sessions:${producerId}`),
      kv.get(`producer-settings:${producerId}`),
      kv.get(`producer-withdrawals:${producerId}`),
      kv.get(`producer-custom-services:${producerId}`),
    ]);

    const dc = {
      conversations: ((convs || []) as any[]).length,
      totalUnread: ((convs || []) as any[]).reduce((s: number, c: any) => s + (c.unread || 0), 0),
      sessions: ((sessions || []) as any[]).length,
      upcomingSessions: ((sessions || []) as any[]).filter((s: any) => s.status === 'scheduled' || s.status === 'confirmed').length,
      withdrawals: ((withdrawals || []) as any[]).length,
      customServices: ((customSvcs || []) as any[]).length,
      vacationMode: (settings as any)?.vacationMode || false,
    };

    const sysPrompt = `Ты - ассистент продюсера на платформе ПРОМО.МУЗЫКА. Анализируешь данные и даёшь рекомендации. Русский язык. Короткие тире (-), не длинные. Краткий формат с эмодзи.\n\nДанные: ${JSON.stringify(dc)}\n${context ? `Контекст: ${context}` : ''}`;

    const mistralKey = Deno.env.get('MISTRAL_API_KEY');
    if (!mistralKey) {
      return c.json({ success: true, data: { response: fallbackRecs(dc), model: 'fallback' } });
    }

    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mistralKey}` },
      body: JSON.stringify({ model: 'mistral-large-latest', messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: question || 'Проанализируй мои данные и дай рекомендации по развитию бизнеса продюсера.' }], temperature: 0.7, max_tokens: 1500 }),
    });

    if (!resp.ok) {
      console.log(`Mistral error: ${await resp.text()}`);
      return c.json({ success: true, data: { response: fallbackRecs(dc), model: 'fallback' } });
    }

    const data = await resp.json();
    const aiResp = data.choices[0].message.content;
    await kv.set(`producer-ai-last:${producerId}`, { question, response: aiResp, timestamp: nowIso() });
    return c.json({ success: true, data: { response: aiResp, model: 'mistral-large' } });
  } catch (error) { console.log(`AI error: ${error}`); return c.json({ success: false, error: String(error) }, 500); }
});

app.get('/ai/history/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const last = await kv.get(`producer-ai-last:${producerId}`);
    return c.json({ success: true, data: last || null });
  } catch (error) { return c.json({ success: false, error: String(error) }, 500); }
});

function fallbackRecs(d: any): string {
  const t: string[] = ['📊 **Обзор кабинета**\n', `- Диалогов: ${d.conversations}`, `- Непрочитанных: ${d.totalUnread}`, `- Сессий: ${d.sessions} (предстоящих: ${d.upcomingSessions})`, `- Услуг: ${d.customServices}`, '', '💡 **Рекомендации:**'];
  if (d.totalUnread > 0) t.push('- Ответьте на непрочитанные - быстрый отклик повышает рейтинг');
  if (d.customServices < 3) t.push('- Добавьте больше услуг для расширения аудитории');
  if (d.upcomingSessions < 2) t.push('- Мало сессий - активнее продвигайте услуги');
  t.push('- Регулярно обновляйте портфолио');
  if (d.vacationMode) t.push('- ⚠️ Режим отпуска включён');
  return t.join('\n');
}

// ════════════════════════════════════════
// CALENDAR SESSIONS
// ════════════════════════════════════════

// GET /calendar/:producerId
app.get('/calendar/:producerId', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const key = `producer-sessions:${producerId}`;
    let sessions: CalendarSession[] = await kv.get(key) || [];

    // Seed demo sessions if empty
    if (sessions.length === 0) {
      sessions = seedDemoSessions(producerId);
      await kv.set(key, sessions);
    }

    return c.json({ success: true, data: sessions });
  } catch (error) {
    console.log(`Error fetching calendar: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// GET /calendar/:producerId/month?year=2026&month=2
app.get('/calendar/:producerId/month', requireAuth, async (c) => {
  try {
    const producerId = c.req.param('producerId');
    const year = parseInt(c.req.query('year') || '2026');
    const month = parseInt(c.req.query('month') || '2'); // 1-based

    const key = `producer-sessions:${producerId}`;
    let sessions: CalendarSession[] = await kv.get(key) || [];

    if (sessions.length === 0) {
      sessions = seedDemoSessions(producerId);
      await kv.set(key, sessions);
    }

    // Filter by month
    const filtered = sessions.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    return c.json({ success: true, data: filtered });
  } catch (error) {
    console.log(`Error fetching month calendar: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// POST /calendar/create
app.post('/calendar/create', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { producerId, title, clientName, date, startTime, endTime, type, notes, orderId } = body;

    if (!producerId || !title || !date || !startTime || !endTime) {
      return c.json({ success: false, error: 'producerId, title, date, startTime, endTime are required' }, 400);
    }

    const TYPE_COLORS: Record<string, string> = {
      recording: '#ef4444',
      mixing: '#14b8a6',
      mastering: '#8b5cf6',
      consultation: '#f59e0b',
      other: '#6b7280',
    };

    const session: CalendarSession = {
      id: genId('session'),
      producerId,
      title,
      clientName: clientName || '',
      date,
      startTime,
      endTime,
      type: type || 'other',
      status: 'scheduled',
      notes: notes || '',
      color: TYPE_COLORS[type] || TYPE_COLORS.other,
      orderId: orderId || '',
      createdAt: nowIso(),
    };

    const key = `producer-sessions:${producerId}`;
    const sessions: CalendarSession[] = await kv.get(key) || [];
    sessions.push(session);
    await kv.set(key, sessions);

    return c.json({ success: true, data: session });
  } catch (error) {
    console.log(`Error creating session: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// PUT /calendar/update/:sessionId
app.put('/calendar/update/:sessionId', requireAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const body = await c.req.json();
    const { producerId } = body;

    if (!producerId) {
      return c.json({ success: false, error: 'producerId required' }, 400);
    }

    const key = `producer-sessions:${producerId}`;
    const sessions: CalendarSession[] = await kv.get(key) || [];
    const idx = sessions.findIndex(s => s.id === sessionId);

    if (idx < 0) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }

    // Update fields
    const updatable = ['title', 'clientName', 'date', 'startTime', 'endTime', 'type', 'status', 'notes', 'color'];
    for (const field of updatable) {
      if (body[field] !== undefined) {
        (sessions[idx] as any)[field] = body[field];
      }
    }

    await kv.set(key, sessions);
    return c.json({ success: true, data: sessions[idx] });
  } catch (error) {
    console.log(`Error updating session: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// DELETE /calendar/delete/:sessionId
app.delete('/calendar/delete/:sessionId', requireAuth, async (c) => {
  try {
    const sessionId = c.req.param('sessionId');
    const producerId = c.req.query('producerId');

    if (!producerId) {
      return c.json({ success: false, error: 'producerId query param required' }, 400);
    }

    const key = `producer-sessions:${producerId}`;
    const sessions: CalendarSession[] = await kv.get(key) || [];
    const filtered = sessions.filter(s => s.id !== sessionId);

    if (filtered.length === sessions.length) {
      return c.json({ success: false, error: 'Session not found' }, 404);
    }

    await kv.set(key, filtered);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting session: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ════════════════════════════════════════
// DEMO DATA SEEDING
// ════════════════════════════════════════

function seedDemoConversations(producerId: string): ConversationMeta[] {
  return [
    {
      id: `conv-${producerId}-1`,
      producerId,
      clientName: 'Анна Морозова',
      clientInitial: 'А',
      orderTitle: 'Сведение трека "Midnight"',
      orderId: 'order-1',
      lastMessage: 'Супер, жду первый драфт!',
      lastTime: '10:50',
      unread: 0,
      online: true,
      createdAt: '2026-02-09T10:30:00Z',
    },
    {
      id: `conv-${producerId}-2`,
      producerId,
      clientName: 'Кирилл Волков',
      clientInitial: 'К',
      orderTitle: 'Мастеринг EP "Рассвет"',
      orderId: 'order-2',
      lastMessage: 'Это именно то что нужно! Принимаю.',
      lastTime: '16:45',
      unread: 1,
      online: false,
      createdAt: '2026-02-08T14:20:00Z',
    },
    {
      id: `conv-${producerId}-3`,
      producerId,
      clientName: 'Диана Касимова',
      clientInitial: 'Д',
      orderTitle: 'Мастеринг EP - 5 треков',
      orderId: 'order-3',
      lastMessage: 'Загружаю файлы, дам знать.',
      lastTime: '09:35',
      unread: 1,
      online: true,
      createdAt: '2026-02-10T09:15:00Z',
    },
    {
      id: `conv-${producerId}-4`,
      producerId,
      clientName: 'Сандра',
      clientInitial: 'С',
      orderTitle: 'Аранжировка "Огни города"',
      orderId: 'order-4',
      lastMessage: 'Можно больше синтезаторов добавить?',
      lastTime: '18:22',
      unread: 2,
      online: false,
      createdAt: '2026-02-07T12:00:00Z',
    },
    {
      id: `conv-${producerId}-5`,
      producerId,
      clientName: 'Марк',
      clientInitial: 'М',
      orderTitle: 'Битмейкинг - 3 бита',
      orderId: 'order-5',
      lastMessage: 'Второй бит огонь, третий пока не слушал.',
      lastTime: '14:10',
      unread: 0,
      online: true,
      createdAt: '2026-02-06T11:00:00Z',
    },
  ];
}

function seedDemoMessages(convId: string): Message[] {
  const templates: Record<string, Message[]> = {
    '1': [
      { id: 'dm1-1', text: 'Привет! Хочу уточнить детали по заказу. Референсы прикреплю чуть позже.', sender: 'client', timestamp: '2026-02-09T10:30:00Z', read: true },
      { id: 'dm1-2', text: 'Добрый день! Конечно, жду референсы. Какой стиль вам ближе - чистый или с характером?', sender: 'producer', timestamp: '2026-02-09T10:35:00Z', read: true },
      { id: 'dm1-3', text: 'С характером, но без грязи. Что-то в духе альбома Midnights.', sender: 'client', timestamp: '2026-02-09T10:42:00Z', read: true, attachment: { type: 'audio', name: 'reference_track_v1.wav' } },
      { id: 'dm1-4', text: 'Отличный выбор! Понял направление. Начну работу сегодня, первый драфт будет к пятнице.', sender: 'producer', timestamp: '2026-02-09T10:48:00Z', read: true },
      { id: 'dm1-5', text: 'Супер, жду первый драфт!', sender: 'client', timestamp: '2026-02-09T10:50:00Z', read: true },
    ],
    '2': [
      { id: 'dm2-1', text: 'Привет! Послушал первый вариант, в целом нравится, но вокал немного утоплен.', sender: 'client', timestamp: '2026-02-08T14:20:00Z', read: true },
      { id: 'dm2-2', text: 'Понял, подниму вокал на 1.5-2 dB и чуть уберу реверб. Готово будет через пару часов.', sender: 'producer', timestamp: '2026-02-08T14:25:00Z', read: true },
      { id: 'dm2-3', text: 'И ещё - можно бас чуть теплее сделать? Сейчас он слишком чистый.', sender: 'client', timestamp: '2026-02-08T14:28:00Z', read: true },
      { id: 'dm2-4', text: 'Сделаю. Добавлю лёгкий сатурейшн на басовую группу.', sender: 'producer', timestamp: '2026-02-08T16:10:00Z', read: true, attachment: { type: 'audio', name: 'mix_v2_revision.wav' } },
      { id: 'dm2-5', text: 'Это именно то что нужно! Принимаю.', sender: 'client', timestamp: '2026-02-08T16:45:00Z', read: false },
    ],
    '3': [
      { id: 'dm3-1', text: 'Здравствуйте! Оставил заявку на мастеринг EP из 5 треков.', sender: 'client', timestamp: '2026-02-10T09:15:00Z', read: true },
      { id: 'dm3-2', text: 'Здравствуйте! Могу взять в работу с понедельника. Пришлите треки, я оценю объём.', sender: 'producer', timestamp: '2026-02-10T09:30:00Z', read: true },
      { id: 'dm3-3', text: 'Загружаю файлы, дам знать.', sender: 'client', timestamp: '2026-02-10T09:35:00Z', read: false },
    ],
    '4': [
      { id: 'dm4-1', text: 'Привет! Как продвигается аранжировка?', sender: 'client', timestamp: '2026-02-07T12:00:00Z', read: true },
      { id: 'dm4-2', text: 'Привет! Работаю над секцией припева, добавил живые струнные.', sender: 'producer', timestamp: '2026-02-07T12:15:00Z', read: true },
      { id: 'dm4-3', text: 'Круто! А можно послушать промежуточный вариант?', sender: 'client', timestamp: '2026-02-07T15:00:00Z', read: true },
      { id: 'dm4-4', text: 'Конечно, вот:', sender: 'producer', timestamp: '2026-02-07T16:30:00Z', read: true, attachment: { type: 'audio', name: 'arrangement_wip_v3.wav' } },
      { id: 'dm4-5', text: 'Нравится! Можно больше синтезаторов добавить?', sender: 'client', timestamp: '2026-02-07T18:22:00Z', read: false },
      { id: 'dm4-6', text: 'В каком стиле? Ретро или современные?', sender: 'producer', timestamp: '2026-02-07T18:25:00Z', read: true },
    ],
    '5': [
      { id: 'dm5-1', text: 'Йо! Первый бит получил, огонь!', sender: 'client', timestamp: '2026-02-06T11:00:00Z', read: true },
      { id: 'dm5-2', text: 'Рад что зашло! Второй будет в другом стиле - более мелодичный.', sender: 'producer', timestamp: '2026-02-06T11:10:00Z', read: true },
      { id: 'dm5-3', text: 'Отправляю второй:', sender: 'producer', timestamp: '2026-02-06T13:45:00Z', read: true, attachment: { type: 'audio', name: 'beat_02_melodic.mp3' } },
      { id: 'dm5-4', text: 'Второй бит огонь, третий пока не слушал.', sender: 'client', timestamp: '2026-02-06T14:10:00Z', read: true },
    ],
  };

  // Extract conversation number suffix
  const parts = convId.split('-');
  const num = parts[parts.length - 1];
  return templates[num] || templates['1'];
}

function seedDemoSessions(producerId: string): CalendarSession[] {
  // February 2026 demo sessions
  return [
    {
      id: `ses-${producerId}-1`,
      producerId,
      title: 'Запись вокала - Анна Морозова',
      clientName: 'Анна Морозова',
      date: '2026-02-12',
      startTime: '10:00',
      endTime: '13:00',
      type: 'recording',
      status: 'confirmed',
      notes: 'Студия A, подготовить Neumann U87',
      color: '#ef4444',
      createdAt: '2026-02-05T10:00:00Z',
    },
    {
      id: `ses-${producerId}-2`,
      producerId,
      title: 'Сведение трека "Midnight"',
      clientName: 'Анна Морозова',
      date: '2026-02-13',
      startTime: '14:00',
      endTime: '18:00',
      type: 'mixing',
      status: 'scheduled',
      notes: 'Финальный микс, 24-bit / 48kHz',
      color: '#14b8a6',
      createdAt: '2026-02-06T09:00:00Z',
    },
    {
      id: `ses-${producerId}-3`,
      producerId,
      title: 'Мастеринг EP "Рассвет"',
      clientName: 'Кирилл Волков',
      date: '2026-02-14',
      startTime: '11:00',
      endTime: '16:00',
      type: 'mastering',
      status: 'confirmed',
      notes: '5 треков, референс: Bon Iver',
      color: '#8b5cf6',
      createdAt: '2026-02-07T11:00:00Z',
    },
    {
      id: `ses-${producerId}-4`,
      producerId,
      title: 'Консультация - Диана',
      clientName: 'Диана Касимова',
      date: '2026-02-15',
      startTime: '10:00',
      endTime: '11:30',
      type: 'consultation',
      status: 'scheduled',
      notes: 'Обсуждение звучания EP, выбор стиля мастеринга',
      color: '#f59e0b',
      createdAt: '2026-02-08T15:00:00Z',
    },
    {
      id: `ses-${producerId}-5`,
      producerId,
      title: 'Запись вокала - Сандра',
      clientName: 'Сандра',
      date: '2026-02-17',
      startTime: '12:00',
      endTime: '16:00',
      type: 'recording',
      status: 'scheduled',
      notes: 'Три трека, бэк-вокал',
      color: '#ef4444',
      createdAt: '2026-02-09T08:00:00Z',
    },
    {
      id: `ses-${producerId}-6`,
      producerId,
      title: 'Сведение - Марк',
      clientName: 'Марк',
      date: '2026-02-18',
      startTime: '15:00',
      endTime: '19:00',
      type: 'mixing',
      status: 'scheduled',
      notes: 'Хип-хоп, много автотюна',
      color: '#14b8a6',
      createdAt: '2026-02-10T10:00:00Z',
    },
    {
      id: `ses-${producerId}-7`,
      producerId,
      title: 'Мастеринг сингла',
      clientName: 'Стелла',
      date: '2026-02-20',
      startTime: '10:00',
      endTime: '12:00',
      type: 'mastering',
      status: 'scheduled',
      notes: 'Электроника, для стримингов + винил',
      color: '#8b5cf6',
      createdAt: '2026-02-10T14:00:00Z',
    },
    {
      id: `ses-${producerId}-8`,
      producerId,
      title: 'Запись live-сессии',
      clientName: 'Анна Морозова',
      date: '2026-02-22',
      startTime: '11:00',
      endTime: '17:00',
      type: 'recording',
      status: 'scheduled',
      notes: 'Полный бэнд, 8 каналов',
      color: '#ef4444',
      createdAt: '2026-02-11T09:00:00Z',
    },
    {
      id: `ses-${producerId}-9`,
      producerId,
      title: 'Консультация по продакшну',
      clientName: 'Лиана',
      date: '2026-02-11',
      startTime: '16:00',
      endTime: '17:00',
      type: 'consultation',
      status: 'completed',
      color: '#f59e0b',
      createdAt: '2026-02-03T10:00:00Z',
    },
  ];
}

export default app;