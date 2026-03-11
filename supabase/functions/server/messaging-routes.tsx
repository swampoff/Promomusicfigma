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
 *   dm:online:{userId}            -> { lastSeen: string }
 *
 * Endpoints:
 * GET    /conversations/:userId              - Список переписок
 * POST   /conversations                      - Создать/найти переписку
 * GET    /messages/:conversationId            - Сообщения (с пагинацией)
 * POST   /messages/:conversationId            - Отправить сообщение (+SSE)
 * PUT    /messages/:conversationId/read       - Отметить прочитанными (+SSE receipt)
 * PUT    /messages/:messageId/edit            - Редактировать сообщение
 * DELETE /messages/:conversationId/:messageId - Удалить сообщение
 * POST   /typing/:conversationId             - Typing indicator via SSE
 * GET    /unread/:userId                      - Счётчик непрочитанных
 * POST   /presence                            - Heartbeat online/offline
 * GET    /presence/:userId                    - Проверить статус пользователя
 * GET    /rules                               - Правила коммуникации
 */

import { Hono } from 'npm:hono@4';
import { dmConvListStore, dmConversationsStore, dmMessagesStore, dmUnreadCountsStore, dmOnlineStore } from './db.tsx';
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
  editedAt?: string;
  deleted?: boolean;
  readBy?: Record<string, string>; // userId -> readAt timestamp
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

app.get('/conversations/:userId', requireAuth, async (c) => {
  const userId = c.req.param('userId');
  const authUserId = c.get('userId');
  if (authUserId !== userId) {
    return c.json({ success: false, error: 'Access denied: not resource owner' }, 403);
  }
  try {
    const convIds: string[] = (await dmConvListStore.get(userId)) || [];
    const conversations: DirectConversation[] = [];

    for (const cid of convIds) {
      const conv: DirectConversation | null = await dmConversationsStore.get(cid);
      if (conv) conversations.push(conv);
    }

    // Сортировка: последнее сообщение сверху
    conversations.sort((a, b) => {
      const ta = a.lastMessageAt || a.createdAt;
      const tb = b.lastMessageAt || b.createdAt;
      return tb.localeCompare(ta);
    });

    // Непрочитанные
    const unreadMap: Record<string, number> = (await dmUnreadCountsStore.get(userId)) || {};

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

app.post('/conversations', requireAuth, async (c) => {
  try {
    const { participants, source, collabOfferId } = await c.req.json() as {
      participants: Participant[];
      source?: 'direct' | 'collab' | 'support';
      collabOfferId?: string;
    };

    if (!participants || participants.length < 2) {
      return c.json({ success: false, error: 'At least 2 participants required' }, 400);
    }

    // Verify auth user is one of the participants (the initiator)
    const authUserId = c.get('userId');
    const isParticipant = participants.some(p => p.userId === authUserId);
    if (!isParticipant) {
      return c.json({ success: false, error: 'Access denied: you must be a participant' }, 403);
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
    const existing: DirectConversation | null = await dmConversationsStore.get(convId);

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

    await dmConversationsStore.set(convId, conv);

    // Add to both users' conversation lists
    for (const p of participants) {
      const list: string[] = (await dmConvListStore.get(p.userId)) || [];
      if (!list.includes(convId)) {
        list.unshift(convId);
        await dmConvListStore.set(p.userId, list);
      }
    }

    return c.json({ success: true, conversation: conv, created: true });
  } catch (err) {
    console.log('Error creating conversation:', err);
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── GET /messages/:conversationId ──

app.get('/messages/:conversationId', requireAuth, async (c) => {
  const conversationId = c.req.param('conversationId');
  const authUserId = c.get('userId');
  try {
    const conv: DirectConversation | null = await dmConversationsStore.get(conversationId);
    if (!conv) {
      return c.json({ success: false, error: 'Conversation not found' }, 404);
    }
    if (!conv.participants.some(p => p.userId === authUserId)) {
      return c.json({ success: false, error: 'Access denied: not a participant' }, 403);
    }

    const allMessages: DirectMessage[] = (await dmMessagesStore.get(conversationId)) || [];

    // Pagination: ?limit=50&before=messageId (load older messages)
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
    const before = c.req.query('before');

    // Filter out deleted messages (show as "[удалено]" stub)
    const visibleMessages = allMessages.map(m =>
      m.deleted ? { ...m, text: '[Сообщение удалено]', attachment: undefined } : m
    );

    let messages: DirectMessage[];
    if (before) {
      const idx = visibleMessages.findIndex(m => m.id === before);
      const start = Math.max(0, idx - limit);
      messages = visibleMessages.slice(start, idx);
    } else {
      // Last N messages
      messages = visibleMessages.slice(-limit);
    }

    return c.json({
      success: true,
      messages,
      total: allMessages.length,
      hasMore: allMessages.length > limit,
    });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── POST /messages/:conversationId ──

app.post('/messages/:conversationId', requireAuth, async (c) => {
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

    // Prevent spoofing: senderId must match authenticated user
    const authUserId = c.get('userId');
    if (authUserId !== senderId) {
      return c.json({ success: false, error: 'Access denied: senderId does not match authenticated user' }, 403);
    }

    // Verify conversation exists
    const conv: DirectConversation | null = await dmConversationsStore.get(conversationId);
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
    const messages: DirectMessage[] = (await dmMessagesStore.get(conversationId)) || [];
    messages.push(message);
    // Keep last 200 messages per conversation
    if (messages.length > 200) messages.splice(0, messages.length - 200);
    await dmMessagesStore.set(conversationId, messages);

    // Update conversation's lastMessage
    conv.lastMessage = text.length > 100 ? text.slice(0, 100) + '...' : text;
    conv.lastMessageAt = message.createdAt;
    await dmConversationsStore.set(conversationId, conv);

    // Update unread count for recipient(s)
    for (const p of conv.participants) {
      if (p.userId === senderId) continue;

      const unreadMap: Record<string, number> = (await dmUnreadCountsStore.get(p.userId)) || {};
      unreadMap[conversationId] = (unreadMap[conversationId] || 0) + 1;
      await dmUnreadCountsStore.set(p.userId, unreadMap);

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

app.put('/messages/:conversationId/read', requireAuth, async (c) => {
  const conversationId = c.req.param('conversationId');
  try {
    const { userId } = await c.req.json() as { userId: string };
    if (!userId) {
      return c.json({ success: false, error: 'userId required' }, 400);
    }

    const authUserId = c.get('userId');
    if (authUserId !== userId) {
      return c.json({ success: false, error: 'Access denied: cannot mark read for another user' }, 403);
    }

    // Clear unread counter
    const unreadMap: Record<string, number> = (await dmUnreadCountsStore.get(userId)) || {};
    delete unreadMap[conversationId];
    await dmUnreadCountsStore.set(userId, unreadMap);

    // Mark individual messages with readBy timestamp
    const messages: DirectMessage[] = (await dmMessagesStore.get(conversationId)) || [];
    const now = new Date().toISOString();
    let updated = false;
    for (const msg of messages) {
      if (msg.senderId !== userId && (!msg.readBy || !msg.readBy[userId])) {
        if (!msg.readBy) msg.readBy = {};
        msg.readBy[userId] = now;
        updated = true;
      }
    }
    if (updated) {
      await dmMessagesStore.set(conversationId, messages);
    }

    // SSE: notify sender that their messages were read
    const conv: DirectConversation | null = await dmConversationsStore.get(conversationId);
    if (conv) {
      for (const p of conv.participants) {
        if (p.userId !== userId) {
          emitSSE(p.userId, {
            type: 'messages_read',
            data: { conversationId, readBy: userId, readAt: now },
          });
        }
      }
    }

    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── GET /unread/:userId ──

app.get('/unread/:userId', requireAuth, async (c) => {
  const userId = c.req.param('userId');
  const authUserId = c.get('userId');
  if (authUserId !== userId) {
    return c.json({ success: false, error: 'Access denied: not resource owner' }, 403);
  }
  try {
    const unreadMap: Record<string, number> = (await dmUnreadCountsStore.get(userId)) || {};
    const total = Object.values(unreadMap).reduce((s, n) => s + n, 0);
    return c.json({ success: true, total, byConversation: unreadMap });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── PUT /messages/:messageId/edit — Edit a sent message ──

app.put('/messages/:messageId/edit', requireAuth, async (c) => {
  try {
    const messageId = c.req.param('messageId');
    const authUserId = c.get('userId');
    const { conversationId, text } = await c.req.json() as { conversationId: string; text: string };

    if (!conversationId || !text?.trim()) {
      return c.json({ success: false, error: 'conversationId and text required' }, 400);
    }

    const messages: DirectMessage[] = (await dmMessagesStore.get(conversationId)) || [];
    const msg = messages.find(m => m.id === messageId);
    if (!msg) {
      return c.json({ success: false, error: 'Message not found' }, 404);
    }
    if (msg.senderId !== authUserId) {
      return c.json({ success: false, error: 'Can only edit your own messages' }, 403);
    }
    // Only allow edit within 15 minutes
    const age = Date.now() - new Date(msg.createdAt).getTime();
    if (age > 15 * 60 * 1000) {
      return c.json({ success: false, error: 'Can only edit messages within 15 minutes' }, 400);
    }

    msg.text = text.trim();
    msg.editedAt = new Date().toISOString();
    await dmMessagesStore.set(conversationId, messages);

    // SSE: notify participants about edit
    const conv: DirectConversation | null = await dmConversationsStore.get(conversationId);
    if (conv) {
      for (const p of conv.participants) {
        if (p.userId !== authUserId) {
          emitSSE(p.userId, {
            type: 'message_edited',
            data: { conversationId, messageId, text: msg.text, editedAt: msg.editedAt },
          });
        }
      }
    }

    return c.json({ success: true, message: msg });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── DELETE /messages/:conversationId/:messageId — Soft-delete a message ──

app.delete('/messages/:conversationId/:messageId', requireAuth, async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const messageId = c.req.param('messageId');
    const authUserId = c.get('userId');

    const messages: DirectMessage[] = (await dmMessagesStore.get(conversationId)) || [];
    const msg = messages.find(m => m.id === messageId);
    if (!msg) {
      return c.json({ success: false, error: 'Message not found' }, 404);
    }
    if (msg.senderId !== authUserId) {
      return c.json({ success: false, error: 'Can only delete your own messages' }, 403);
    }

    msg.deleted = true;
    msg.text = '';
    msg.attachment = undefined;
    await dmMessagesStore.set(conversationId, messages);

    // SSE: notify participants
    const conv: DirectConversation | null = await dmConversationsStore.get(conversationId);
    if (conv) {
      for (const p of conv.participants) {
        if (p.userId !== authUserId) {
          emitSSE(p.userId, {
            type: 'message_deleted',
            data: { conversationId, messageId },
          });
        }
      }
    }

    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: String(err) }, 500);
  }
});

// ── POST /typing/:conversationId — Typing indicator via SSE ──

app.post('/typing/:conversationId', requireAuth, async (c) => {
  const conversationId = c.req.param('conversationId');
  const authUserId = c.get('userId');
  try {
    const conv: DirectConversation | null = await dmConversationsStore.get(conversationId);
    if (!conv) return c.json({ success: true });

    const sender = conv.participants.find(p => p.userId === authUserId);
    if (!sender) return c.json({ success: true });

    for (const p of conv.participants) {
      if (p.userId !== authUserId) {
        emitSSE(p.userId, {
          type: 'typing_indicator',
          data: {
            conversationId,
            userId: authUserId,
            userName: sender.userName,
            userRole: sender.role,
          },
        });
      }
    }

    return c.json({ success: true });
  } catch {
    return c.json({ success: true }); // Never fail on typing
  }
});

// ── POST /presence — Online heartbeat ──

app.post('/presence', requireAuth, async (c) => {
  const authUserId = c.get('userId');
  try {
    const { status } = await c.req.json().catch(() => ({ status: 'online' }));
    const now = new Date().toISOString();

    await dmOnlineStore.set(authUserId, {
      userId: authUserId,
      status: status || 'online',
      lastSeen: now,
    });

    return c.json({ success: true });
  } catch {
    return c.json({ success: true });
  }
});

// ── GET /presence/:userId — Check user online status ──

app.get('/presence/:userId', async (c) => {
  const userId = c.req.param('userId');
  try {
    const data: any = await dmOnlineStore.get(userId);
    if (!data) {
      return c.json({ success: true, status: 'offline', lastSeen: null });
    }

    // Consider online if heartbeat within last 2 minutes
    const lastSeenMs = new Date(data.lastSeen).getTime();
    const isOnline = Date.now() - lastSeenMs < 2 * 60 * 1000;

    return c.json({
      success: true,
      status: isOnline ? 'online' : 'offline',
      lastSeen: data.lastSeen,
    });
  } catch {
    return c.json({ success: true, status: 'offline', lastSeen: null });
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
