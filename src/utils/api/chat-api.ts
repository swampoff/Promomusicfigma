import config from '@/config/environment';
/**
 * CHAT API - In-app чат артист-модератор по заказам публикации
 *
 * Supports: messages CRUD, mark-as-read, typing indicators
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const BASE = `${config.functionsUrl}/api/chat`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
    'Content-Type': 'application/json',
    ...(session ? { 'X-User-Id': session.user.id } : {}),
  };
}

export interface ChatMessage {
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

export async function fetchChatMessages(orderId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${BASE}/messages/${orderId}`, { headers: await getAuthHeaders() });
    const json = await res.json();
    return json?.messages || [];
  } catch (err) {
    console.error('Chat API fetch error:', err);
    return [];
  }
}

export async function sendChatMessage(orderId: string, data: {
  senderId: string;
  senderName: string;
  senderRole: 'artist' | 'moderator';
  text: string;
}): Promise<ChatMessage | null> {
  try {
    const res = await fetch(`${BASE}/messages/${orderId}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json?.message || null;
  } catch (err) {
    console.error('Chat API send error:', err);
    return null;
  }
}

/** Mark all unread messages in an order chat as read */
export async function markChatAsRead(orderId: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/messages/${orderId}/read`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
    });
    const json = await res.json();
    return json?.success || false;
  } catch (err) {
    console.error('Chat API mark-read error:', err);
    return false;
  }
}

/** Send typing indicator for an order chat (debounced: max once per 2s) */
let _chatTypingTimeout: ReturnType<typeof setTimeout> | null = null;
export function sendChatTypingIndicator(orderId: string, senderName: string, senderRole: 'artist' | 'moderator'): void {
  if (_chatTypingTimeout) return;
  _chatTypingTimeout = setTimeout(() => { _chatTypingTimeout = null; }, 2000);
  (async () => {
    try {
      await fetch(`${BASE}/typing/${orderId}`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ senderName, senderRole }),
      });
    } catch { /* ignore typing failures */ }
  })();
}

export async function fetchUnreadChats(userId: string): Promise<{ totalUnread: number; unreadByOrder: Record<string, number> }> {
  try {
    const res = await fetch(`${BASE}/unread/${userId}`, { headers: await getAuthHeaders() });
    const json = await res.json();
    return { totalUnread: json?.totalUnread || 0, unreadByOrder: json?.unreadByOrder || {} };
  } catch (err) {
    console.error('Chat API unread error:', err);
    return { totalUnread: 0, unreadByOrder: {} };
  }
}
