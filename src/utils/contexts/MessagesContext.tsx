/**
 * MESSAGES CONTEXT - Единый контекст сообщений
 * 
 * Синхронизирует:
 * - MessagesPage (инбокс) <-> CollaborationCenter (коллаб-чат)
 * - SSE real-time входящие сообщения
 * - Серверный API для персистентности
 * 
 * Используется во всех кабинетах, адаптируется под роль.
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSSEContext } from '@/utils/contexts/SSEContext';
import {
  fetchConversations,
  fetchMessages,
  sendDirectMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
  fetchUnreadCounts,
  createOrGetConversation,
  startPresenceHeartbeat,
  stopPresenceHeartbeat,
  type DirectConversation,
  type DirectMessage,
  type CabinetRole,
  type Participant,
} from '@/utils/api/messaging-api';

// ── Public types ──

export interface MessagesContextValue {
  /** All conversations for current user */
  conversations: DirectConversation[];
  /** Messages by conversationId */
  messagesByConv: Record<string, DirectMessage[]>;
  /** Total unread count */
  unreadTotal: number;
  /** Unread by conversation */
  unreadByConv: Record<string, number>;
  /** Loading state */
  loading: boolean;
  /** Who is currently typing { conversationId -> { userName, timestamp } } */
  typingUsers: Record<string, { userName: string; ts: number }>;
  /** Send a message */
  sendMessage: (conversationId: string, text: string, attachment?: { type: string; name: string; url?: string }) => Promise<DirectMessage | null>;
  /** Edit a message (within 15 min) */
  editMsg: (messageId: string, conversationId: string, newText: string) => Promise<boolean>;
  /** Delete a message */
  deleteMsg: (conversationId: string, messageId: string) => Promise<boolean>;
  /** Mark conversation as read */
  markAsRead: (conversationId: string) => Promise<void>;
  /** Get or create a conversation (with communication rules enforced on server) */
  getOrCreateConversation: (
    otherUser: Participant,
    source?: 'direct' | 'collab' | 'support',
    collabOfferId?: string,
  ) => Promise<DirectConversation | null>;
  /** Reload conversations from server */
  refresh: () => Promise<void>;
  /** Current user info */
  currentUser: Participant;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

// ── Provider ──

interface MessagesProviderProps {
  userId: string;
  userName: string;
  userRole: CabinetRole;
  userAvatar?: string;
  children: ReactNode;
}

export function MessagesProvider({ userId, userName, userRole, userAvatar, children }: MessagesProviderProps) {
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, DirectMessage[]>>({});
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, { userName: string; ts: number }>>({});
  const sseCtx = useSSEContext();
  const initialLoadDone = useRef(false);
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const currentUser: Participant = {
    userId,
    userName,
    role: userRole,
    avatar: userAvatar,
  };

  const unreadTotal = Object.values(unreadByConv).reduce((s, n) => s + n, 0);

  // ── Load conversations from server ──

  const loadConversations = useCallback(async () => {
    try {
      const convs = await fetchConversations(userId);
      setConversations(convs);

      // Set unread from server data
      const unreadMap: Record<string, number> = {};
      for (const c of convs) {
        if (c.unreadCount && c.unreadCount > 0) {
          unreadMap[c.id] = c.unreadCount;
        }
      }
      setUnreadByConv(unreadMap);
    } catch (err) {
      console.error('[MessagesContext] Error loading conversations:', err);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadConversations();
    setLoading(false);
  }, [loadConversations]);

  // Initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    refresh();
  }, [refresh]);

  // ── Load messages for a conversation (lazy) ──

  const loadMessages = useCallback(async (conversationId: string) => {
    if (messagesByConv[conversationId]) return; // Already loaded
    try {
      const msgs = await fetchMessages(conversationId);
      setMessagesByConv(prev => ({ ...prev, [conversationId]: msgs }));
    } catch (err) {
      console.error(`[MessagesContext] Error loading messages for ${conversationId}:`, err);
    }
  }, [messagesByConv]);

  // ── Send message ──

  const sendMessage = useCallback(async (
    conversationId: string,
    text: string,
    attachment?: { type: string; name: string; url?: string },
  ): Promise<DirectMessage | null> => {
    const result = await sendDirectMessage(conversationId, {
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      text,
      attachment,
    });

    if (result.message) {
      // Optimistic update: add message to local state
      setMessagesByConv(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), result.message!],
      }));

      // Update conversation's lastMessage
      setConversations(prev => prev.map(c =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageAt: result.message!.createdAt }
          : c
      ));
    }

    return result.message;
  }, [userId, userName, userRole]);

  // ── Mark as read ──

  const markAsRead = useCallback(async (conversationId: string) => {
    setUnreadByConv(prev => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    await markConversationAsRead(conversationId, userId);
  }, [userId]);

  // ── Edit message ──

  const editMsg = useCallback(async (
    messageId: string,
    conversationId: string,
    newText: string,
  ): Promise<boolean> => {
    const result = await editMessage(messageId, conversationId, newText);
    if (result.success) {
      setMessagesByConv(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m =>
          m.id === messageId ? { ...m, text: newText, editedAt: new Date().toISOString() } : m
        ),
      }));
    }
    return result.success;
  }, []);

  // ── Delete message ──

  const deleteMsg = useCallback(async (
    conversationId: string,
    messageId: string,
  ): Promise<boolean> => {
    const result = await deleteMessage(conversationId, messageId);
    if (result.success) {
      setMessagesByConv(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m =>
          m.id === messageId ? { ...m, deleted: true, text: '[Сообщение удалено]', attachment: undefined } : m
        ),
      }));
    }
    return result.success;
  }, []);

  // ── Get or create conversation ──

  const getOrCreateConversation = useCallback(async (
    otherUser: Participant,
    source: 'direct' | 'collab' | 'support' = 'direct',
    collabOfferId?: string,
  ): Promise<DirectConversation | null> => {
    const result = await createOrGetConversation(
      [currentUser, otherUser],
      source,
      collabOfferId,
    );

    if (result.conversation) {
      // Add to local state if new
      setConversations(prev => {
        const exists = prev.find(c => c.id === result.conversation!.id);
        if (exists) return prev;
        return [result.conversation!, ...prev];
      });
    } else if (result.error) {
      console.error('[MessagesContext] Cannot create conversation:', result.error);
    }

    return result.conversation;
  }, [currentUser]);

  // ── SSE: listen for incoming messages ──

  useEffect(() => {
    if (!sseCtx) return;

    const handleNewDirectMessage = (data: any) => {
      const { conversationId, messageId, senderId, senderName, senderRole, text, source } = data;

      // Skip own messages
      if (senderId === userId) return;

      // Add message to local state
      const newMsg: DirectMessage = {
        id: messageId || `sse-${Date.now()}`,
        conversationId,
        senderId,
        senderName,
        senderRole,
        text,
        createdAt: new Date().toISOString(),
      };

      setMessagesByConv(prev => {
        const existing = prev[conversationId];
        if (!existing) return prev; // Messages not loaded yet - will appear on next load
        // Prevent duplicates
        if (existing.find(m => m.id === newMsg.id)) return prev;
        return { ...prev, [conversationId]: [...existing, newMsg] };
      });

      // Update conversation lastMessage
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === conversationId
            ? { ...c, lastMessage: text, lastMessageAt: newMsg.createdAt }
            : c
        );
        // If conversation not in list, reload
        if (!updated.find(c => c.id === conversationId)) {
          loadConversations();
        }
        return updated;
      });

      // Increment unread
      setUnreadByConv(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || 0) + 1,
      }));
    };

    // Handle collab messages (bridge from CollaborationCenter)
    const handleCollabMessage = (data: any) => {
      if (data.senderId === userId) return;
      loadConversations();
    };

    // Typing indicators: show for 3s then auto-clear
    const handleTyping = (data: any) => {
      const { conversationId, userId: typerId, userName } = data;
      if (typerId === userId) return;
      setTypingUsers(prev => ({ ...prev, [conversationId]: { userName, ts: Date.now() } }));
      // Clear after 3s
      if (typingTimersRef.current[conversationId]) clearTimeout(typingTimersRef.current[conversationId]);
      typingTimersRef.current[conversationId] = setTimeout(() => {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[conversationId];
          return next;
        });
      }, 3000);
    };

    // Read receipts
    const handleReadReceipt = (data: any) => {
      const { conversationId, readBy, readAt } = data;
      setMessagesByConv(prev => {
        const msgs = prev[conversationId];
        if (!msgs) return prev;
        return {
          ...prev,
          [conversationId]: msgs.map(m => {
            if (m.senderId === userId && (!m.readBy || !m.readBy[readBy])) {
              return { ...m, readBy: { ...m.readBy, [readBy]: readAt } };
            }
            return m;
          }),
        };
      });
    };

    // Message edited
    const handleEdited = (data: any) => {
      const { conversationId, messageId, text, editedAt } = data;
      setMessagesByConv(prev => {
        const msgs = prev[conversationId];
        if (!msgs) return prev;
        return {
          ...prev,
          [conversationId]: msgs.map(m =>
            m.id === messageId ? { ...m, text, editedAt } : m
          ),
        };
      });
    };

    // Message deleted
    const handleDeleted = (data: any) => {
      const { conversationId, messageId } = data;
      setMessagesByConv(prev => {
        const msgs = prev[conversationId];
        if (!msgs) return prev;
        return {
          ...prev,
          [conversationId]: msgs.map(m =>
            m.id === messageId ? { ...m, deleted: true, text: '[Сообщение удалено]', attachment: undefined } : m
          ),
        };
      });
    };

    sseCtx.on('new_direct_message', handleNewDirectMessage);
    sseCtx.on('collab_message', handleCollabMessage);
    sseCtx.on('typing_indicator', handleTyping);
    sseCtx.on('messages_read', handleReadReceipt);
    sseCtx.on('message_edited', handleEdited);
    sseCtx.on('message_deleted', handleDeleted);

    return () => {
      sseCtx.off('new_direct_message', handleNewDirectMessage);
      sseCtx.off('collab_message', handleCollabMessage);
      sseCtx.off('typing_indicator', handleTyping);
      sseCtx.off('messages_read', handleReadReceipt);
      sseCtx.off('message_edited', handleEdited);
      sseCtx.off('message_deleted', handleDeleted);
    };
  }, [sseCtx, userId, loadConversations]);

  // ── Online presence heartbeat ──
  useEffect(() => {
    if (!userId) return;
    startPresenceHeartbeat();
    return () => stopPresenceHeartbeat();
  }, [userId]);

  return (
    <MessagesContext.Provider value={{
      conversations,
      messagesByConv,
      unreadTotal,
      unreadByConv,
      loading,
      typingUsers,
      sendMessage,
      editMsg,
      deleteMsg,
      markAsRead,
      getOrCreateConversation,
      refresh,
      currentUser,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

// ── Hook ──

export function useMessages(): MessagesContextValue | null {
  return useContext(MessagesContext);
}

/**
 * Non-null hook - throws if used outside provider
 */
export function useMessagesRequired(): MessagesContextValue {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error('useMessagesRequired must be used within a MessagesProvider');
  }
  return ctx;
}
