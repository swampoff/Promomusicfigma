/**
 * PUBLISH API - Клиентские функции для публикации контента
 * Взаимодействие с publish-routes.tsx
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/publish`;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      console.error(`Publish API error [${res.status}]: ${err.error}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Publish API fetch error:', err);
    return null;
  }
}

// ── Types ────────────────────────────────────────────────

export type PublishType = 'video' | 'concert';
export type PublishPlan = 'free' | 'standard' | 'premium';
export type PublishStatus =
  | 'draft' | 'pending_review' | 'in_review' | 'revision'
  | 'approved' | 'pending_payment' | 'paid' | 'published'
  | 'rejected' | 'cancelled';

export interface PublishOrder {
  id: string;
  userId: string;
  type: PublishType;
  status: PublishStatus;
  title: string;
  description: string;
  plan: PublishPlan;
  price: number;
  currency: string;
  // Video
  videoUrl?: string;
  videoSource?: 'file' | 'link';
  videoCategory?: string;
  thumbnailUrl?: string;
  tags?: string[];
  // Concert
  eventDate?: string;
  eventTime?: string;
  city?: string;
  venueName?: string;
  venueAddress?: string;
  ticketPriceMin?: number;
  ticketPriceMax?: number;
  ticketUrl?: string;
  posterUrl?: string;
  genre?: string;
  // Moderation
  moderatorComment?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface PricingPlan {
  price: number;
  label: string;
  features: string[];
}

export interface PricingData {
  video: Record<PublishPlan, PricingPlan>;
  concert: Record<PublishPlan, PricingPlan>;
}

// ── API Functions ────────────────────────────────────────

export async function fetchPricing(): Promise<PricingData | null> {
  const res = await apiFetch<{ success: boolean; pricing: PricingData }>('/pricing');
  return res?.pricing || null;
}

export async function createPublishOrder(data: {
  userId: string;
  type: PublishType;
  title: string;
  description?: string;
  plan?: PublishPlan;
  [key: string]: any;
}): Promise<PublishOrder | null> {
  const res = await apiFetch<{ success: boolean; order: PublishOrder }>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res?.order || null;
}

export async function fetchUserOrders(userId: string): Promise<PublishOrder[]> {
  const res = await apiFetch<{ success: boolean; orders: PublishOrder[] }>(
    `/orders?userId=${encodeURIComponent(userId)}`
  );
  return res?.orders || [];
}

export async function fetchOrder(orderId: string): Promise<PublishOrder | null> {
  const res = await apiFetch<{ success: boolean; order: PublishOrder }>(`/orders/${orderId}`);
  return res?.order || null;
}

export async function updateOrder(
  orderId: string,
  data: Partial<PublishOrder>
): Promise<PublishOrder | null> {
  const res = await apiFetch<{ success: boolean; order: PublishOrder }>(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res?.order || null;
}

export async function submitForReview(orderId: string): Promise<PublishOrder | null> {
  const res = await apiFetch<{ success: boolean; order: PublishOrder }>(
    `/orders/${orderId}/submit`,
    { method: 'PUT' }
  );
  return res?.order || null;
}

export async function payOrder(
  orderId: string,
  paymentMethod: string = 'card'
): Promise<PublishOrder | null> {
  const res = await apiFetch<{ success: boolean; order: PublishOrder }>(
    `/orders/${orderId}/pay`,
    { method: 'PUT', body: JSON.stringify({ paymentMethod }) }
  );
  return res?.order || null;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const res = await apiFetch<{ success: boolean }>(`/orders/${orderId}`, {
    method: 'DELETE',
  });
  return res?.success || false;
}

// ── Status helpers ───────────────────────────────────────

export const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: 'Черновик',
  pending_review: 'На модерации',
  in_review: 'Проверяется',
  revision: 'На доработке',
  approved: 'Одобрено',
  pending_payment: 'Ожидает оплаты',
  paid: 'Оплачено',
  published: 'Опубликовано',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
};

export const STATUS_COLORS: Record<PublishStatus, string> = {
  draft: 'text-slate-400 bg-slate-500/20',
  pending_review: 'text-amber-400 bg-amber-500/20',
  in_review: 'text-blue-400 bg-blue-500/20',
  revision: 'text-orange-400 bg-orange-500/20',
  approved: 'text-green-400 bg-green-500/20',
  pending_payment: 'text-purple-400 bg-purple-500/20',
  paid: 'text-green-400 bg-green-500/20',
  published: 'text-emerald-400 bg-emerald-500/20',
  rejected: 'text-red-400 bg-red-500/20',
  cancelled: 'text-slate-400 bg-slate-500/20',
};

// ── Admin API Functions ─────────────────────────────────

export async function fetchAllOrders(): Promise<PublishOrder[]> {
  const res = await apiFetch<{ success: boolean; orders: PublishOrder[] }>('/admin/all');
  return res?.orders || [];
}

export async function fetchOrderStats(): Promise<Record<string, number> | null> {
  const res = await apiFetch<{ success: boolean; stats: Record<string, number> }>('/admin/stats');
  return res?.stats || null;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  comment?: string,
  reason?: string,
): Promise<PublishOrder | null> {
  const res = await apiFetch<{ success: boolean; order: PublishOrder }>(
    `/orders/${orderId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status, comment, reason }),
    },
  );
  return res?.order || null;
}

export interface BatchStatusResult {
  id: string;
  success: boolean;
  order?: PublishOrder;
  error?: string;
}

export interface BatchStatusResponse {
  results: BatchStatusResult[];
  summary: { total: number; succeeded: number; failed: number };
}

export async function batchUpdateOrderStatus(
  orderIds: string[],
  status: string,
  comment?: string,
  reason?: string,
): Promise<BatchStatusResponse | null> {
  const res = await apiFetch<{ success: boolean } & BatchStatusResponse>(
    '/admin/batch-status',
    {
      method: 'PUT',
      body: JSON.stringify({ orderIds, status, comment, reason }),
    },
  );
  if (!res) return null;
  return { results: res.results, summary: res.summary };
}

// ── Artist Notifications ────────────────────────────────

export interface PublishNotification {
  id: string;
  type: string;
  orderId: string;
  orderTitle: string;
  newStatus: string;
  message: string;
  comment?: string;
  read: boolean;
  createdAt: string;
}

export async function fetchArtistNotifications(
  userId: string,
): Promise<{ notifications: PublishNotification[]; unreadCount: number }> {
  const res = await apiFetch<{
    success: boolean;
    notifications: PublishNotification[];
    unreadCount: number;
  }>(`/notifications/${encodeURIComponent(userId)}`);
  return {
    notifications: res?.notifications || [],
    unreadCount: res?.unreadCount || 0,
  };
}

export async function markNotificationsRead(
  userId: string,
  notificationIds?: string[],
): Promise<boolean> {
  const res = await apiFetch<{ success: boolean }>(
    `/notifications/${encodeURIComponent(userId)}/read`,
    {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    },
  );
  return res?.success || false;
}

// ── Email Notification Preferences ──────────────────────

export interface EmailNotificationPrefs {
  email: string;
  onApproved: boolean;
  onPublished: boolean;
  onRevision: boolean;
  onRejected: boolean;
  updatedAt: string;
}

export async function fetchEmailPreferences(
  userId: string,
): Promise<EmailNotificationPrefs | null> {
  const res = await apiFetch<{
    success: boolean;
    prefs: EmailNotificationPrefs;
  }>(`/email-prefs/${encodeURIComponent(userId)}`);
  return res?.prefs || null;
}

export async function updateEmailPreferences(
  userId: string,
  prefs: Partial<EmailNotificationPrefs>,
): Promise<EmailNotificationPrefs | null> {
  const res = await apiFetch<{
    success: boolean;
    prefs: EmailNotificationPrefs;
  }>(`/email-prefs/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify(prefs),
  });
  return res?.prefs || null;
}