/**
 * CHAT ROUTES - In-app чат артист-модератор по заказам публикации
 * 
 * KV Keys:
 *   publish_chat:{orderId} -> ChatMessage[]
 * 
 * Endpoints:
 * GET  /messages/:orderId       - Получить сообщения чата
 * POST /messages/:orderId       - Отправить сообщение
 * GET  /unread/:userId          - Непрочитанные по всем заказам
 */

import { Hono } from 'npm:hono@4';
import * as db from './db.tsx';
import { emitSSE } from './sse-routes.tsx';

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
  createdAt: string;
}

function genId(): string {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// GET /messages/:orderId
app.get('/messages/:orderId', async (c) => {
  const orderId = c.req.param('orderId');
  try {
    const messages: ChatMessage[] = (await db.kvGet(`publish_chat:${orderId}`)) || [];
    return c.json({ success: true, messages });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// POST /messages/:orderId
app.post('/messages/:orderId', async (c) => {
  const orderId = c.req.param('orderId');
  try {
    const { senderId, senderName, senderRole, text, attachment } = await c.req.json();
    if (!senderId || !text) {
      return c.json({ success: false, error: 'senderId and text required' }, 400);
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

    const chatKey = `publish_chat:${orderId}`;
    const messages: ChatMessage[] = (await db.kvGet(chatKey)) || [];
    messages.push(message);
    await db.kvSet(chatKey, messages);

    // Определяем получателя для SSE
    // Ищем заказ чтобы узнать userId артиста
    const order: any = await db.kvGet(`publish_order:${orderId}`);
    if (order) {
      const recipientId = senderRole === 'artist' ? 'admin-moderator' : order.userId;
      emitSSE(recipientId, {
        type: 'chat_message',
        data: {
          orderId,
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

// GET /unread/:userId
app.get('/unread/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    // Получаем все заказы пользователя
    const allOrders = await db.kvGetByPrefix('publish_order:');
    const userOrderIds: string[] = [];
    
    for (const order of allOrders) {
      if (order && typeof order === 'object' && (order as any).userId === userId) {
        userOrderIds.push((order as any).id);
      }
    }

    let totalUnread = 0;
    const unreadByOrder: Record<string, number> = {};

    for (const orderId of userOrderIds) {
      const messages: ChatMessage[] = (await db.kvGet(`publish_chat:${orderId}`)) || [];
      const unread = messages.filter(m => !m.read && m.senderRole !== 'artist').length;
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
