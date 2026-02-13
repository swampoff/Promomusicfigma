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
  markConversationAsRead,
  fetchUnreadCounts,
  createOrGetConversation,
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
  /** Send a message */
  sendMessage: (conversationId: string, text: string, attachment?: { type: string; name: string; url?: string }) => Promise<DirectMessage | null>;
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
  const sseCtx = useSSEContext();
  const initialLoadDone = useRef(false);

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
      // When a collab message comes in via SSE, we check if there's
      // a corresponding DM conversation and update it
      if (data.senderId === userId) return;
      // The collab_message event might have offerId - we can find matching conv
      // For now, just trigger a conversation reload to pick up any synced messages
      loadConversations();
    };

    sseCtx.on('new_direct_message', handleNewDirectMessage);
    sseCtx.on('collab_message', handleCollabMessage);

    return () => {
      sseCtx.off('new_direct_message', handleNewDirectMessage);
      sseCtx.off('collab_message', handleCollabMessage);
    };
  }, [sseCtx, userId, loadConversations]);

  return (
    <MessagesContext.Provider value={{
      conversations,
      messagesByConv,
      unreadTotal,
      unreadByConv,
      loading,
      sendMessage,
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
