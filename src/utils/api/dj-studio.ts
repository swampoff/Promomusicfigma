/**
 * DJ STUDIO API CLIENT
 * Frontend API client for DJ cabinet operations:
 * - Profile (GET/PUT)
 * - Events (CRUD)
 * - Collaborations (GET/POST + accept/decline)
 * - Notifications (GET + mark read)
 * - Plans & Subscriptions
 */

import { projectId, publicApiKey } from '@/utils/auth/info';
import { authClient } from '@/utils/auth/client';
import { config } from '@/config/environment';

const BASE_URL = `${config.functionsUrl}/api/dj-studio`;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await authClient.auth.getSession()).data.session?.access_token || publicApiKey}`,
        ...(options?.headers || {}),
      },
    });
    const json = await res.json();
    if (!json.success) {
      console.error(`DJ Studio API error (${path}):`, json.error);
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(`DJ Studio API network error (${path}):`, err);
    return null;
  }
}

// ── Profile ──

export interface DjStudioProfile {
  djName?: string;
  bio?: string;
  bioShort?: string;
  city?: string;
  country?: string;
  genres?: string[];
  specializations?: string[];
  availableForTravel?: boolean;
  travelRegions?: string[];
  verified?: boolean;
  // booking
  openForBookings?: boolean;
  ratePerHour?: number;
  ratePerEvent?: number;
  minBookingHours?: number;
  maxBookingHours?: number;
  equipmentIncluded?: boolean;
  depositRequired?: boolean;
  depositPercentage?: number;
  advanceNoticeDays?: number;
  cancellationPolicy?: string;
  workingDays?: string[];
  // contacts
  contacts?: Record<string, string>;
  contactPersons?: Array<{ id: string; role: string; name: string; phone: string }>;
  // equipment
  equipmentList?: Array<{ id: string; name: string; type: string; count: number }>;
  // portfolio
  portfolioCategories?: any[];
  // pricing
  pricingRules?: any[];
  addonsList?: any[];
  faqList?: any[];
  // settings
  generalSettings?: any[];
  workingHours?: any;
  integrations?: any[];
  [key: string]: any;
}

export async function fetchDjStudioProfile(): Promise<DjStudioProfile | null> {
  return apiFetch<DjStudioProfile>('/profile');
}

export async function saveDjStudioProfile(data: DjStudioProfile): Promise<DjStudioProfile | null> {
  return apiFetch<DjStudioProfile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Events ──

export interface DjStudioEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  type: 'club' | 'festival' | 'private' | 'stream';
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  capacity: number;
  ticketsSold?: number;
  djId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchDjEvents(): Promise<DjStudioEvent[]> {
  const data = await apiFetch<DjStudioEvent[]>('/events');
  return data || [];
}

export async function createDjEvent(event: Omit<DjStudioEvent, 'id' | 'djId' | 'createdAt' | 'updatedAt'>): Promise<DjStudioEvent | null> {
  return apiFetch<DjStudioEvent>('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function updateDjEvent(eventId: string, data: Partial<DjStudioEvent>): Promise<DjStudioEvent | null> {
  return apiFetch<DjStudioEvent>(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDjEvent(eventId: string): Promise<boolean> {
  const result = await apiFetch<any>(`/events/${eventId}`, { method: 'DELETE' });
  return result !== null;
}

// ── Collaborations ──

export interface DjStudioCollab {
  id: string;
  djName: string;
  djCity: string;
  genres: string[];
  rating: number;
  type: 'b2b' | 'remix' | 'event' | 'mentorship';
  message: string;
  date: string;
  status: 'incoming' | 'outgoing' | 'active' | 'completed' | 'pending' | 'accepted' | 'declined';
  djId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchDjCollaborations(): Promise<DjStudioCollab[]> {
  const data = await apiFetch<DjStudioCollab[]>('/collaborations');
  return data || [];
}

export async function createDjCollaboration(collab: Partial<DjStudioCollab>): Promise<DjStudioCollab | null> {
  return apiFetch<DjStudioCollab>('/collaborations', {
    method: 'POST',
    body: JSON.stringify(collab),
  });
}

export async function acceptDjCollaboration(collabId: string): Promise<DjStudioCollab | null> {
  return apiFetch<DjStudioCollab>(`/collaborations/${collabId}/accept`, { method: 'PUT' });
}

export async function declineDjCollaboration(collabId: string): Promise<DjStudioCollab | null> {
  return apiFetch<DjStudioCollab>(`/collaborations/${collabId}/decline`, { method: 'PUT' });
}

// ── Notifications ──

export interface DjStudioNotification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'message' | 'system' | 'collab';
  title: string;
  description: string;
  time: string;
  read: boolean;
  createdAt?: string;
}

export async function fetchDjNotifications(): Promise<DjStudioNotification[]> {
  const data = await apiFetch<DjStudioNotification[]>('/notifications');
  return data || [];
}

export async function markDjNotificationsRead(ids?: string[]): Promise<boolean> {
  const result = await apiFetch<any>('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
  return result !== null;
}

// ── Plans & Subscription ──

export interface DjPlan {
  id: string;
  name: string;
  price: number;
  priceYear: number;
  currency: string;
  description: string;
  features: string[];
  limits: { mixes: number; events: number; analytics: string };
  popular: boolean;
  color: string;
}

export interface DjSubscription {
  djId: string;
  planId: string;
  planName: string;
  status: string;
  price: number;
  currency: string;
  interval: string;
  startDate: string;
  endDate: string | null;
  limits: { mixes: number; events: number; analytics: string };
}

export async function fetchDjPlans(): Promise<DjPlan[]> {
  const data = await apiFetch<DjPlan[]>('/plans');
  return data || [];
}

export async function fetchDjSubscription(djId: string): Promise<DjSubscription | null> {
  return apiFetch<DjSubscription>(`/subscription/${djId}`);
}

export async function changeDjSubscription(djId: string, planId: string, interval: 'month' | 'year' = 'month'): Promise<DjSubscription | null> {
  return apiFetch<DjSubscription>(`/subscription/${djId}/change`, {
    method: 'POST',
    body: JSON.stringify({ planId, interval }),
  });
}
