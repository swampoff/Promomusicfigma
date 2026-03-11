import config from '@/config/environment';
/**
 * MESSAGING API - Клиентский wrapper для единой системы сообщений
 *
 * Supports: conversations, messages (CRUD), typing, presence, read receipts
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const BASE = `${config.functionsUrl}/api/messaging`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
    'Content-Type': 'application/json',
    ...(session ? { 'X-User-Id': session.user.id } : {}),
  };
}

export type CabinetRole = 'artist' | 'producer' | 'dj' | 'admin' | 'radio' | 'venue';

export interface Participant {
  userId: string;
  userName: string;
  role: CabinetRole;
  avatar?: string;
}

export interface DirectConversation {
  id: string;
  participants: Participant[];
  source: 'direct' | 'collab' | 'support';
  collabOfferId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  unreadCount?: number;
}

export interface DirectMessage {
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
  readBy?: Record<string, string>; // userId -> readAt
}

export interface CommunicationRules {
  rules: Record<CabinetRole, CabinetRole[]>;
  labels: Record<CabinetRole, string>;
}

async function apiCall<T>(method: string, path: string, body?: any): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const opts: RequestInit = { method, headers: await getAuthHeaders() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `HTTP ${res.status}` };
    }
    return { success: true, data: json };
  } catch (err) {
    console.error(`Messaging API error [${path}]:`, err);
    return { success: false, error: String(err) };
  }
}

// ── Conversations ──

export async function fetchConversations(userId: string): Promise<DirectConversation[]> {
  const res = await apiCall<any>('GET', `/conversations/${userId}`);
  return (res.data as any)?.conversations || [];
}

export async function createOrGetConversation(
  participants: Participant[],
  source: 'direct' | 'collab' | 'support' = 'direct',
  collabOfferId?: string,
): Promise<{ conversation: DirectConversation | null; created: boolean; error?: string }> {
  const res = await apiCall<any>('POST', '/conversations', { participants, source, collabOfferId });
  if (!res.success) return { conversation: null, created: false, error: res.error };
  return {
    conversation: (res.data as any)?.conversation || null,
    created: (res.data as any)?.created || false,
  };
}

// ── Messages ──

export async function fetchMessages(conversationId: string, options?: { limit?: number; before?: string }): Promise<DirectMessage[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.before) params.set('before', options.before);
  const qs = params.toString() ? `?${params}` : '';
  const res = await apiCall<any>('GET', `/messages/${conversationId}${qs}`);
  return (res.data as any)?.messages || [];
}

export async function sendDirectMessage(
  conversationId: string,
  data: {
    senderId: string;
    senderName: string;
    senderRole: CabinetRole;
    text: string;
    attachment?: { type: string; name: string; url?: string };
  },
): Promise<{ message: DirectMessage | null; error?: string }> {
  const res = await apiCall<any>('POST', `/messages/${conversationId}`, data);
  if (!res.success) return { message: null, error: res.error };
  return { message: (res.data as any)?.message || null };
}

export async function editMessage(
  messageId: string,
  conversationId: string,
  text: string,
): Promise<{ success: boolean; error?: string }> {
  return apiCall('PUT', `/messages/${messageId}/edit`, { conversationId, text });
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
): Promise<{ success: boolean; error?: string }> {
  return apiCall('DELETE', `/messages/${conversationId}/${messageId}`);
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const res = await apiCall<any>('PUT', `/messages/${conversationId}/read`, { userId });
  return res.success;
}

// ── Typing ──

let _typingTimeout: ReturnType<typeof setTimeout> | null = null;

/** Send typing indicator (debounced: max once per 2s) */
export function sendTypingIndicator(conversationId: string): void {
  if (_typingTimeout) return; // Already sent recently
  _typingTimeout = setTimeout(() => { _typingTimeout = null; }, 2000);
  apiCall('POST', `/typing/${conversationId}`, {}).catch(() => {});
}

// ── Online Presence ──

let _presenceInterval: ReturnType<typeof setInterval> | null = null;

/** Start heartbeat (every 60s) to keep online status */
export function startPresenceHeartbeat(): void {
  if (_presenceInterval) return;
  const beat = () => apiCall('POST', '/presence', { status: 'online' }).catch(() => {});
  beat(); // immediate first beat
  _presenceInterval = setInterval(beat, 60_000);
}

/** Stop heartbeat when component unmounts or user logs out */
export function stopPresenceHeartbeat(): void {
  if (_presenceInterval) {
    clearInterval(_presenceInterval);
    _presenceInterval = null;
  }
  // Send offline status
  apiCall('POST', '/presence', { status: 'offline' }).catch(() => {});
}

/** Check if a specific user is online */
export async function checkPresence(userId: string): Promise<{ status: 'online' | 'offline'; lastSeen: string | null }> {
  const res = await apiCall<any>('GET', `/presence/${userId}`);
  return {
    status: (res.data as any)?.status || 'offline',
    lastSeen: (res.data as any)?.lastSeen || null,
  };
}

// ── Unread ──

export async function fetchUnreadCounts(userId: string): Promise<{ total: number; byConversation: Record<string, number> }> {
  const res = await apiCall<any>('GET', `/unread/${userId}`);
  if (!res.success) return { total: 0, byConversation: {} };
  return {
    total: (res.data as any)?.total || 0,
    byConversation: (res.data as any)?.byConversation || {},
  };
}

// ── Rules ──

export async function fetchCommunicationRules(): Promise<CommunicationRules | null> {
  const res = await apiCall<any>('GET', '/rules');
  if (!res.success) return null;
  return {
    rules: (res.data as any)?.rules || {},
    labels: (res.data as any)?.labels || {},
  };
}
