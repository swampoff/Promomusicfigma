/**
 * DJ MARKETPLACE API — Frontend → Backend integration
 * Fetches DJ profiles, mixes, reviews, calendar from the server
 * Falls back to empty data on errors
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/dj-marketplace`;

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...(options?.headers || {}),
      },
    });
    const json = await res.json();
    if (!json.success) {
      console.error(`DJ Marketplace API error (${path}):`, json.error);
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(`DJ Marketplace API network error (${path}):`, err);
    return null;
  }
}

export interface DjProfile {
  id: string;
  name: string;
  photo: string;
  city: string;
  genres: string[];
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  experience: string;
  verified: boolean;
  available: boolean;
  topGenre: string;
  completedGigs: number;
  bio: string;
  tags: string[];
}

export interface DjMix {
  id: string;
  title: string;
  genre: string;
  duration: string;
  plays: number;
  likes: number;
}

export interface DjReview {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  eventType: string;
}

export interface DjCalendarDay {
  date: string;
  dayOfWeek: string;
  dayNum: number;
  month: string;
  available: boolean;
}

export interface DjListFilters {
  city?: string;
  genre?: string;
  verified?: boolean;
  available?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
  sort?: 'rating' | 'price_asc' | 'price_desc' | 'popularity';
}

/**
 * Fetch all DJs with optional filters
 */
export async function fetchDjList(filters?: DjListFilters): Promise<DjProfile[]> {
  const params = new URLSearchParams();
  if (filters?.city) params.set('city', filters.city);
  if (filters?.genre) params.set('genre', filters.genre);
  if (filters?.verified) params.set('verified', 'true');
  if (filters?.available) params.set('available', 'true');
  if (filters?.price_min) params.set('price_min', String(filters.price_min));
  if (filters?.price_max) params.set('price_max', String(filters.price_max));
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);

  const queryStr = params.toString();
  const data = await apiFetch(`/djs${queryStr ? `?${queryStr}` : ''}`);
  return data || [];
}

/**
 * Fetch a single DJ profile
 */
export async function fetchDjProfile(id: string): Promise<DjProfile | null> {
  return await apiFetch(`/djs/${id}`);
}

/**
 * Fetch DJ mixes
 */
export async function fetchDjMixes(id: string): Promise<DjMix[]> {
  const data = await apiFetch(`/djs/${id}/mixes`);
  return data || [];
}

/**
 * Fetch DJ reviews
 */
export async function fetchDjReviews(id: string): Promise<DjReview[]> {
  const data = await apiFetch(`/djs/${id}/reviews`);
  return data || [];
}

/**
 * Fetch DJ calendar
 */
export async function fetchDjCalendar(id: string): Promise<DjCalendarDay[]> {
  const data = await apiFetch(`/djs/${id}/calendar`);
  return data || [];
}

/**
 * Submit a booking request
 */
export async function submitBookingRequest(djId: string, booking: {
  clientName: string;
  clientEmail: string;
  eventDate: string;
  eventType: string;
  message: string;
}): Promise<{ id: string } | null> {
  return await apiFetch(`/djs/${djId}/book`, {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}

/**
 * Seed marketplace data (called once on init)
 */
export async function seedMarketplace(): Promise<boolean> {
  const data = await apiFetch('/seed', { method: 'POST' });
  return !!data;
}
