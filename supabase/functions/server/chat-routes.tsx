/**
 * CHAT ROUTES - In-app чат артист-модератор по заказам публикации
 *
 * KV Keys:
 *   publish_chat:{orderId} -> ChatMessage[]
 *
 * Endpoints:
 * GET  /messages/:orderId       - Получить сообщения чата
 * POST /messages/:orderId       - Отправить сообщение
 * PUT  /messages/:orderId/read  - Пометить прочитанными
 * GET  /unread/:userId          - Непрочитанные по всем заказам
 * POST /typing/:orderId         - Typing indicator (SSE)
 */

import { Hono } from 'npm:hono@4';
import { publishChatsStore, publishOrdersStore } from './db.tsx';
import { emitSSE } from './sse-routes.tsx';
import { requireAuth } from './auth-middleware.tsx';
import { getSupabaseClient } from './supabase-client.tsx';

// ── Auth Helper ──

async function getAuthUser(c: any) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);
  return error ? null : user;
}

const app = new Hono();

interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'artist' | 'moderator';
  text: string;
  attachment?: { type: string; name: string; url?: string };
  read: boolean;
  readAt?: string;
  createdAt: string;
  editedAt?: string;
}

function genId(): string {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// GET /messages/:orderId
app.get('/messages/:orderId', requireAuth, async (c) => {
  const orderId = c.req.param('orderId');
  try {
    const messages: ChatMessage[] = (await publishChatsStore.get(orderId)) || [];
    return c.json({ success: true, messages });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// POST /messages/:orderId
app.post('/messages/:orderId', requireAuth, async (c) => {
  const orderId = c.req.param('orderId');
  try {
    const { senderId, senderName, senderRole, text, attachment } = await c.req.json();
    if (!senderId || !text) {
      return c.json({ success: false, error: 'senderId and text required' }, 400);
    }

    // Prevent spoofing: senderId must match authenticated user
    const authUserId = c.get('userId');
    if (authUserId !== senderId) {
      return c.json({ success: false, error: 'Access denied: senderId does not match authenticated user' }, 403);
    }

    const message: ChatMessage = {
      id: genId(),
      orderId,
      senderId,
      senderName: senderName || (senderRole === 'moderator' ? 'Модератор' : 'Артист'),
      senderRole: senderRole || 'artist',
      text,
      attachment,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const messages: ChatMessage[] = (await publishChatsStore.get(orderId)) || [];
    messages.push(message);
    // Cap at 500 messages per order
    if (messages.length > 500) messages.splice(0, messages.length - 500);
    await publishChatsStore.set(orderId, messages);

    // Определяем получателя для SSE
    const order: any = await publishOrdersStore.get(orderId);
    if (order) {
      const recipientId = senderRole === 'artist' ? 'admin-moderator' : order.userId;
      emitSSE(recipientId, {
        type: 'chat_message',
        data: {
          orderId,
          messageId: message.id,
          senderName: message.senderName,
          senderRole,
          text: text.length > 80 ? text.slice(0, 80) + '...' : text,
          message: `Новое сообщение по заказу "${order.title || orderId}"`,
        },
      });
    }

    return c.json({ success: true, message });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// PUT /messages/:orderId/read — Mark messages as read by the current user
app.put('/messages/:orderId/read', requireAuth, async (c) => {
  const orderId = c.req.param('orderId');
  const authUserId = c.get('userId');
  try {
    const messages: ChatMessage[] = (await publishChatsStore.get(orderId)) || [];
    const now = new Date().toISOString();
    let marked = 0;

    for (const msg of messages) {
      // Mark as read only messages NOT sent by the reader
      if (!msg.read && msg.senderId !== authUserId) {
        msg.read = true;
        msg.readAt = now;
        marked++;
      }
    }

    if (marked > 0) {
      await publishChatsStore.set(orderId, messages);

      // Notify sender that messages were read
      const order: any = await publishOrdersStore.get(orderId);
      if (order) {
        // Find who sent the unread messages to notify them
        const lastUnreadSender = messages.find(m => m.readAt === now)?.senderId;
        if (lastUnreadSender) {
          emitSSE(lastUnreadSender, {
            type: 'messages_read',
            data: { orderId, readBy: authUserId, count: marked },
          });
        }
      }
    }

    return c.json({ success: true, marked });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// POST /typing/:orderId — Typing indicator via SSE
app.post('/typing/:orderId', requireAuth, async (c) => {
  const orderId = c.req.param('orderId');
  const authUserId = c.get('userId');
  try {
    const { senderName, senderRole } = await c.req.json();

    const order: any = await publishOrdersStore.get(orderId);
    if (order) {
      const recipientId = senderRole === 'artist' ? 'admin-moderator' : order.userId;
      emitSSE(recipientId, {
        type: 'typing_indicator',
        data: {
          orderId,
          userId: authUserId,
          senderName: senderName || 'Пользователь',
          senderRole: senderRole || 'artist',
        },
      });
    }

    return c.json({ success: true });
  } catch {
    return c.json({ success: true }); // Don't fail on typing indicators
  }
});

// GET /unread/:userId
app.get('/unread/:userId', requireAuth, async (c) => {
  const userId = c.req.param('userId');
  const authUserId = c.get('userId');
  if (authUserId !== userId) {
    return c.json({ success: false, error: 'Access denied: not resource owner' }, 403);
  }
  try {
    const allOrders = await publishOrdersStore.getAll();
    const userOrderIds: string[] = [];

    for (const order of allOrders) {
      if (order && typeof order === 'object' && (order as any).userId === userId) {
        userOrderIds.push((order as any).id);
      }
    }

    let totalUnread = 0;
    const unreadByOrder: Record<string, number> = {};

    for (const orderId of userOrderIds) {
      const messages: ChatMessage[] = (await publishChatsStore.get(orderId)) || [];
      const unread = messages.filter(m => !m.read && m.senderId !== userId).length;
      if (unread > 0) {
        unreadByOrder[orderId] = unread;
        totalUnread += unread;
      }
    }

    return c.json({ success: true, totalUnread, unreadByOrder });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

export default app;
