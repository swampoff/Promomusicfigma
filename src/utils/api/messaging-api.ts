/**
 * MESSAGING API - Клиентский wrapper для единой системы сообщений
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/messaging`;

const headers = () => ({
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

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
}

export interface CommunicationRules {
  rules: Record<CabinetRole, CabinetRole[]>;
  labels: Record<CabinetRole, string>;
}

async function apiCall<T>(method: string, path: string, body?: any): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const opts: RequestInit = { method, headers: headers() };
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

export async function fetchMessages(conversationId: string): Promise<DirectMessage[]> {
  const res = await apiCall<any>('GET', `/messages/${conversationId}`);
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

export async function markConversationAsRead(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const res = await apiCall<any>('PUT', `/messages/${conversationId}/read`, { userId });
  return res.success;
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
