/**
 * PRODUCER STUDIO API CLIENT
 * Клиент для сообщений и календаря продюсера (KV Store)
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/producer-studio`;

const headers = () => ({
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
});

// ════════════════════════════════════════
// TYPES
// ════════════════════════════════════════

export interface Message {
  id: string;
  text: string;
  sender: 'producer' | 'client';
  timestamp: string;
  read: boolean;
  attachment?: { type: 'audio' | 'image' | 'file'; name: string };
}

export interface ConversationMeta {
  id: string;
  producerId: string;
  clientName: string;
  clientInitial: string;
  orderTitle: string;
  orderId: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
  createdAt: string;
}

export interface CalendarSession {
  id: string;
  producerId: string;
  title: string;
  clientName: string;
  clientId?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'recording' | 'mixing' | 'mastering' | 'consultation' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  color?: string;
  orderId?: string;
  createdAt: string;
}

type ApiResult<T> = { success: true; data: T } | { success: false; error: string };

async function apiCall<T>(method: string, path: string, body?: any): Promise<ApiResult<T>> {
  try {
    const opts: RequestInit = { method, headers: headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || `HTTP ${res.status}` };
    }
    return { success: true, data: json.data };
  } catch (err) {
    console.error(`Producer Studio API error [${path}]:`, err);
    return { success: false, error: String(err) };
  }
}

// ════════════════════════════════════════
// CONVERSATIONS
// ════════════════════════════════════════

export const fetchConversations = (producerId: string) =>
  apiCall<ConversationMeta[]>('GET', `/conversations/${producerId}`);

export const createConversation = (data: {
  producerId: string;
  clientName: string;
  orderTitle?: string;
  orderId?: string;
}) => apiCall<ConversationMeta>('POST', '/conversations/create', data);

// ════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════

export const fetchMessages = (conversationId: string) =>
  apiCall<Message[]>('GET', `/messages/${conversationId}`);

export const pollMessages = (conversationId: string, since: string) =>
  apiCall<Message[]>('GET', `/messages/${conversationId}/poll?since=${encodeURIComponent(since)}`);

export const sendMessage = (data: {
  conversationId: string;
  producerId: string;
  text: string;
  sender: 'producer' | 'client';
  attachment?: { type: 'audio' | 'image' | 'file'; name: string };
}) => apiCall<Message>('POST', '/messages/send', data);

export const markRead = (data: { conversationId: string; producerId: string }) =>
  apiCall<void>('POST', '/messages/read', data);

// ════════════════════════════════════════
// CALENDAR
// ════════════════════════════════════════

export const fetchCalendarSessions = (producerId: string) =>
  apiCall<CalendarSession[]>('GET', `/calendar/${producerId}`);

export const fetchCalendarMonth = (producerId: string, year: number, month: number) =>
  apiCall<CalendarSession[]>('GET', `/calendar/${producerId}/month?year=${year}&month=${month}`);

export const createSession = (data: {
  producerId: string;
  title: string;
  clientName?: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  notes?: string;
  orderId?: string;
}) => apiCall<CalendarSession>('POST', '/calendar/create', data);

export const updateSession = (sessionId: string, data: {
  producerId: string;
  title?: string;
  clientName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  status?: string;
  notes?: string;
}) => apiCall<CalendarSession>('PUT', `/calendar/update/${sessionId}`, data);

export const deleteSession = (sessionId: string, producerId: string) =>
  apiCall<void>('DELETE', `/calendar/delete/${sessionId}?producerId=${encodeURIComponent(producerId)}`);

// ════════════════════════════════════════
// FILE UPLOAD
// ════════════════════════════════════════

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  contentType: string;
  size: number;
}

export const uploadAudio = (data: {
  fileName: string;
  base64Data: string;
  contentType?: string;
}) => apiCall<UploadResult>('POST', '/upload/audio', data);

export const getSignedUrl = (storagePath: string) =>
  apiCall<{ url: string }>('GET', `/upload/signed-url?path=${encodeURIComponent(storagePath)}`);

// ════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════

export interface ProducerSettingsData {
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
  updatedAt?: string;
}

export const fetchSettings = (producerId: string) =>
  apiCall<ProducerSettingsData | null>('GET', `/settings/${producerId}`);

export const saveSettings = (producerId: string, data: Partial<ProducerSettingsData>) =>
  apiCall<ProducerSettingsData>('POST', `/settings/${producerId}`, data);

// ════════════════════════════════════════
// SERVICES CRUD
// ════════════════════════════════════════

export const createService = (data: {
  producerId: string; title: string; type?: string;
  basePrice: number; description?: string; deliveryDays?: number;
}) => apiCall<any>('POST', '/services/create', data);

export const updateService = (serviceId: string, data: { producerId: string; [key: string]: any }) =>
  apiCall<any>('PUT', `/services/update/${serviceId}`, data);

export const deleteService = (serviceId: string, producerId: string) =>
  apiCall<void>('DELETE', `/services/delete/${serviceId}?producerId=${encodeURIComponent(producerId)}`);

export const fetchCustomServices = (producerId: string) =>
  apiCall<any[]>('GET', `/services/custom/${producerId}`);

// ════════════════════════════════════════
// PORTFOLIO CRUD
// ════════════════════════════════════════

export const createPortfolioEntry = (data: {
  producerId: string; title: string; artist: string;
  type?: string; description?: string;
}) => apiCall<any>('POST', '/portfolio/create', data);

export const deletePortfolioEntry = (id: string, producerId: string) =>
  apiCall<void>('DELETE', `/portfolio/delete/${id}?producerId=${encodeURIComponent(producerId)}`);

// ════════════════════════════════════════
// PROFILE UPDATE
// ════════════════════════════════════════

export const updateProfile = (producerId: string, data: Record<string, any>) =>
  apiCall<any>('PUT', `/profile/update/${producerId}`, data);

export const fetchProfileEdits = (producerId: string) =>
  apiCall<any>('GET', `/profile/edits/${producerId}`);

// ════════════════════════════════════════
// WALLET WITHDRAWAL
// ════════════════════════════════════════

export const createWithdrawal = (data: {
  producerId: string; amount: number; method: string; methodLabel?: string;
}) => apiCall<any>('POST', '/wallet/withdraw', data);

export const fetchWithdrawals = (producerId: string) =>
  apiCall<any[]>('GET', `/wallet/withdrawals/${producerId}`);

// ════════════════════════════════════════
// AI ASSISTANT
// ════════════════════════════════════════

export const aiAnalyze = (data: {
  producerId: string; question?: string; context?: string;
}) => apiCall<{ response: string; model: string }>('POST', '/ai/analyze', data);

export const fetchAiHistory = (producerId: string) =>
  apiCall<{ question: string; response: string; timestamp: string } | null>('GET', `/ai/history/${producerId}`);