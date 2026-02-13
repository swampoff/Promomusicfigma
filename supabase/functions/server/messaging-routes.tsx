/**
 * MESSAGING ROUTES - Единая система личных сообщений для всех кабинетов
 * 
 * Правила коммуникации:
 * - Radio может общаться ТОЛЬКО с platform (admin) и venue
 * - Все остальные кабинеты могут общаться друг с другом
 * 
 * KV Keys:
 *   dm:conv:{conversationId}      -> DirectConversation
 *   dm:convlist:{userId}          -> string[] (conversationIds)
 *   dm:messages:{conversationId}  -> DirectMessage[]
 *   dm:unread:{userId}            -> Record<conversationId, number>
 * 
 * Endpoints:
 * GET    /conversations/:userId              - Список переписок
 * POST   /conversations                      - Создать/найти переписку
 * GET    /messages/:conversationId            - Сообщения
 * POST   /messages/:conversationId            - Отправить сообщение (+SSE)
 * PUT    /messages/:conversationId/read       - Отметить прочитанными
 * GET    /unread/:userId                      - Счётчик непрочитанных
 */

import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';
import { emitSSE } from './sse-routes.tsx';

const app = new Hono();

// ── Types ──

type CabinetRole = 'artist' | 'producer' | 'dj' | 'admin' | 'radio' | 'venue';

interface Participant {
  userId: string;
  userName: string;
  role: CabinetRole;
  avatar?: string;
}

interface DirectConversation {
  id: string;
  participants: Participant[];
  source: 'direct' | 'collab' | 'support';
  collabOfferId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: CabinetRole;
  text: string;
  attachment?: { type: string; name: string; url?: string };
  createdAt: string;
}

// ── Communication Rules ──

const ALLOWED_CONTACTS: Record<CabinetRole, CabinetRole[]> = {
  artist:   ['producer', 'dj', 'admin', 'venue'],
  producer: ['artist', 'dj', 'admin', 'venue'],
  dj:       ['artist', 'producer', 'admin', 'venue'],
  admin:    ['artist', 'producer', 'dj', 'radio', 'venue'],
  radio:    ['admin', 'venue'],
  venue:    ['artist', 'producer', 'dj', 'admin', 'radio'],
};

function canCommunicate(roleA: CabinetRole, roleB: CabinetRole): boolean {
  return ALLOWED_CONTACTS[roleA]?.includes(roleB) ?? false;
}

// ── Helpers ──

function genId(): string {
  return `dm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeConvId(userA: string, userB: string): string {
  return [userA, userB].sort().join('::');
}

const ROLE_LABELS: Record<CabinetRole, string> = {
  artist: 'Артист',
  producer: 'Продюсер',
  dj: 'DJ',
  admin: 'Платформа',
  radio: 'Радио',
  venue: 'Заведение',
};

// ── GET /conversations/:userId ──

app.get('/conversations/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const convIds: string[] = (await kv.get(`dm:convlist:${userId}`)) || [];
    const conversations: DirectConversation[] = [];

    for (const cid of convIds) {
      const conv: DirectConversation | null = await kv.get(`dm:conv:${cid}`);
      if (conv) conversations.push(conv);
    }

    // Сортировка: последнее сообщение сверху
    conversations.sort((a, b) => {
      const ta = a.lastMessageAt || a.createdAt;
      const tb = b.lastMessageAt || b.createdAt;
      return tb.localeCompare(ta);
    });

    // Непрочитанные
    const unreadMap: Record<string, number> = (await kv.get(`dm:unread:${userId}`)) || {};

    return c.json({
      success: true,
      conversations: conversations.map(conv => ({
        ...conv,
        unreadCount: unreadMap[conv.id] || 0,
      })),
    });
  } catch (err) {
    console.log('Error fetching conversations:', err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── POST /conversations ──

app.post('/conversations', async (c) => {
  try {
    const { participants, source, collabOfferId } = await c.req.json() as {
      participants: Participant[];
      source?: 'direct' | 'collab' | 'support';
      collabOfferId?: string;
    };

    if (!participants || participants.length < 2) {
      return c.json({ success: false, error: 'At least 2 participants required' }, 400);
    }

    // Enforce communication rules
    const p1 = participants[0];
    const p2 = participants[1];
    if (!canCommunicate(p1.role, p2.role)) {
      const label1 = ROLE_LABELS[p1.role] || p1.role;
      const label2 = ROLE_LABELS[p2.role] || p2.role;
      return c.json({
        success: false,
        error: `${label1} не может отправлять сообщения роли ${label2}`,
        code: 'COMMUNICATION_RESTRICTED',
      }, 403);
    }

    // Check if conversation already exists
    const convId = makeConvId(p1.userId, p2.userId);
    const existing: DirectConversation | null = await kv.get(`dm:conv:${convId}`);

    if (existing) {
      return c.json({ success: true, conversation: existing, created: false });
    }

    // Create new conversation
    const conv: DirectConversation = {
      id: convId,
      participants,
      source: source || 'direct',
      collabOfferId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`dm:conv:${convId}`, conv);

    // Add to both users' conversation lists
    for (const p of participants) {
      const listKey = `dm:convlist:${p.userId}`;
      const list: string[] = (await kv.get(listKey)) || [];
      if (!list.includes(convId)) {
        list.unshift(convId);
        await kv.set(listKey, list);
      }
    }

    return c.json({ success: true, conversation: conv, created: true });
  } catch (err) {
    console.log('Error creating conversation:', err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── GET /messages/:conversationId ──

app.get('/messages/:conversationId', async (c) => {
  const conversationId = c.req.param('conversationId');
  try {
    const messages: DirectMessage[] = (await kv.get(`dm:messages:${conversationId}`)) || [];
    return c.json({ success: true, messages });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── POST /messages/:conversationId ──

app.post('/messages/:conversationId', async (c) => {
  const conversationId = c.req.param('conversationId');
  try {
    const { senderId, senderName, senderRole, text, attachment } = await c.req.json() as {
      senderId: string;
      senderName: string;
      senderRole: CabinetRole;
      text: string;
      attachment?: { type: string; name: string; url?: string };
    };

    if (!senderId || !text) {
      return c.json({ success: false, error: 'senderId and text required' }, 400);
    }

    // Verify conversation exists
    const conv: DirectConversation | null = await kv.get(`dm:conv:${conversationId}`);
    if (!conv) {
      return c.json({ success: false, error: 'Conversation not found' }, 404);
    }

    // Verify sender is a participant
    const senderParticipant = conv.participants.find(p => p.userId === senderId);
    if (!senderParticipant) {
      return c.json({ success: false, error: 'Sender is not a participant' }, 403);
    }

    const message: DirectMessage = {
      id: genId(),
      conversationId,
      senderId,
      senderName: senderName || senderParticipant.userName,
      senderRole: senderRole || senderParticipant.role,
      text,
      attachment,
      createdAt: new Date().toISOString(),
    };

    // Save message
    const msgKey = `dm:messages:${conversationId}`;
    const messages: DirectMessage[] = (await kv.get(msgKey)) || [];
    messages.push(message);
    // Keep last 200 messages per conversation
    if (messages.length > 200) messages.splice(0, messages.length - 200);
    await kv.set(msgKey, messages);

    // Update conversation's lastMessage
    conv.lastMessage = text.length > 100 ? text.slice(0, 100) + '...' : text;
    conv.lastMessageAt = message.createdAt;
    await kv.set(`dm:conv:${conversationId}`, conv);

    // Update unread count for recipient(s)
    for (const p of conv.participants) {
      if (p.userId === senderId) continue;

      const unreadKey = `dm:unread:${p.userId}`;
      const unreadMap: Record<string, number> = (await kv.get(unreadKey)) || {};
      unreadMap[conversationId] = (unreadMap[conversationId] || 0) + 1;
      await kv.set(unreadKey, unreadMap);

      // SSE notification to recipient
      emitSSE(p.userId, {
        type: 'new_direct_message',
        data: {
          conversationId,
          messageId: message.id,
          senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          text: text.length > 80 ? text.slice(0, 80) + '...' : text,
          source: conv.source,
          collabOfferId: conv.collabOfferId,
        },
      });
    }

    return c.json({ success: true, message });
  } catch (err) {
    console.log('Error sending message:', err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── PUT /messages/:conversationId/read ──

app.put('/messages/:conversationId/read', async (c) => {
  const conversationId = c.req.param('conversationId');
  try {
    const { userId } = await c.req.json() as { userId: string };
    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    const unreadKey = `dm:unread:${userId}`;
    const unreadMap: Record<string, number> = (await kv.get(unreadKey)) || {};
    delete unreadMap[conversationId];
    await kv.set(unreadKey, unreadMap);

    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── GET /unread/:userId ──

app.get('/unread/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const unreadMap: Record<string, number> = (await kv.get(`dm:unread:${userId}`)) || {};
    const total = Object.values(unreadMap).reduce((s, n) => s + n, 0);
    return c.json({ success: true, total, byConversation: unreadMap });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── GET /rules - Communication rules (for UI) ──

app.get('/rules', (c) => {
  return c.json({
    success: true,
    rules: ALLOWED_CONTACTS,
    labels: ROLE_LABELS,
    description: 'Правила коммуникации между кабинетами',
  });
});

export default app;
