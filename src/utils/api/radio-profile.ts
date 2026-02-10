/**
 * RADIO STATION PROFILE API
 * Загрузка и обновление профиля радиостанции из Supabase/KV
 * Кэш, fetch и утилиты — из общего api-cache.ts
 */

import {
  getCached, setCache, createCacheStore, apiFetch,
  safeParseArray,
} from './api-cache';

const API_PREFIX = '/api/radio-profile';

// ── Типы ──────────────────────────────────────────────────

export interface RadioSocials {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
}

export interface RadioProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  frequency: string;
  formats: string[];
  listeners: string;
  status: string;
  description: string;
  founded: string;
  phone: string;
  website: string;
  address: string;
  streamUrl: string;
  backupStreamUrl: string;
  bitrate: string;
  audioFormat: string;
  socials: RadioSocials;
  tracksInRotation: number;
  partners: number;
  monthlyReach: string;
  totalArtistRequests: number;
  totalAdSlots: number;
  revenue: number;
  createdAt: string;
}

export interface RadioStats {
  listeners: string;
  tracksInRotation: number;
  partners: number;
  monthlyReach: string;
  totalArtistRequests: number;
  totalAdSlots: number;
  revenue: number;
}

// ── Кэш (module-level) ──────────────────────────────────

const cache = createCacheStore<RadioProfile, RadioStats>();

export function invalidateRadioCache(radioId?: string): void {
  if (radioId) {
    cache.profile.delete(radioId);
    cache.stats.delete(radioId);
  } else {
    cache.profile.clear();
    cache.stats.clear();
  }
}

// ── Утилиты ──────────────────────────────────────────────

function resolveRadioId(radioId?: string): string | null {
  return radioId || localStorage.getItem('radioProfileId') || null;
}

export function getRadioInitials(name: string): string {
  if (!name || !name.trim()) return 'FM';
  return name.trim().slice(0, 2).toUpperCase();
}

// ── Фоллбэк ─────────────────────────────────────────────

const EMPTY_SOCIALS: RadioSocials = {
  instagram: '', facebook: '', twitter: '', youtube: '',
};

function getLocalFallback(): RadioProfile | null {
  const id = localStorage.getItem('radioProfileId');
  const name = localStorage.getItem('radioName');
  if (!id || !name) return null;

  const city = localStorage.getItem('radioCity') || '';
  const frequency = localStorage.getItem('radioFrequency') || '';
  const formats = safeParseArray('radioFormats');
  const listeners = localStorage.getItem('radioListeners') || '0';
  const status = localStorage.getItem('radioStatus') || 'Online';

  return {
    id,
    name,
    email: '',
    city,
    country: 'Россия',
    frequency,
    formats,
    listeners,
    status,
    description: '',
    founded: '',
    phone: '',
    website: '',
    address: '',
    streamUrl: '',
    backupStreamUrl: '',
    bitrate: '320 kbps',
    audioFormat: 'MP3',
    socials: { ...EMPTY_SOCIALS },
    tracksInRotation: 0,
    partners: 0,
    monthlyReach: '0',
    totalArtistRequests: 0,
    totalAdSlots: 0,
    revenue: 0,
    createdAt: '',
  };
}

// ── API ──────────────────────────────────────────────────

/**
 * Загрузить полный профиль радиостанции
 */
export async function getRadioProfile(radioId?: string): Promise<RadioProfile | null> {
  const id = resolveRadioId(radioId);
  if (!id) {
    console.warn('[RadioProfileAPI] No radio ID available');
    return getLocalFallback();
  }

  const cached = getCached(cache.profile, id);
  if (cached) return cached;

  try {
    const response = await apiFetch(API_PREFIX, `/profile/${id}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const profile = result.data as RadioProfile;
        setCache(cache.profile, id, profile);
        console.log(`[RadioProfile] Loaded from ${result.source}: ${profile.name}`);
        return profile;
      }
    }
    console.warn('[RadioProfileAPI] API returned non-ok, using localStorage fallback');
  } catch (error) {
    console.warn('[RadioProfileAPI] Network error, using localStorage fallback:', error);
  }

  return getLocalFallback();
}

/**
 * Обновить профиль радиостанции
 */
export async function updateRadioProfile(
  radioId: string,
  updates: Partial<RadioProfile>,
): Promise<RadioProfile | null> {
  try {
    const response = await apiFetch(API_PREFIX, `/profile/${radioId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const profile = result.data as RadioProfile;
        invalidateRadioCache(radioId);
        setCache(cache.profile, radioId, profile);
        console.log(`[RadioProfile] Updated: ${profile.name}`);
        return profile;
      }
    }

    const errorBody = await response.text().catch(() => 'unknown');
    console.error(`[RadioProfileAPI] Update failed (${response.status}): ${errorBody}`);
    return null;
  } catch (error) {
    console.error('[RadioProfileAPI] Network error during update:', error);
    return null;
  }
}

/**
 * Получить статистику радиостанции
 */
export async function getRadioStats(radioId?: string): Promise<RadioStats | null> {
  const id = resolveRadioId(radioId);
  if (!id) return null;

  const cached = getCached(cache.stats, id);
  if (cached) return cached;

  try {
    const response = await apiFetch(API_PREFIX, `/profile/${id}/stats`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const stats = result.data as RadioStats;
        setCache(cache.stats, id, stats);
        return stats;
      }
    }
  } catch {
    // fallback below
  }

  const profileCached = getCached(cache.profile, id);
  if (profileCached) {
    return {
      listeners: profileCached.listeners,
      tracksInRotation: profileCached.tracksInRotation,
      partners: profileCached.partners,
      monthlyReach: profileCached.monthlyReach,
      totalArtistRequests: profileCached.totalArtistRequests,
      totalAdSlots: profileCached.totalAdSlots,
      revenue: profileCached.revenue,
    };
  }

  return null;
}
