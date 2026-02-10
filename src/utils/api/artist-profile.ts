/**
 * ARTIST PROFILE API
 * Загрузка и обновление профиля артиста из Supabase
 * Кэш, fetch и утилиты — из общего api-cache.ts
 */

import {
  getCached, setCache, createCacheStore, apiFetch,
  safeParseArray, formatStat, getInitials,
} from './api-cache';

const API_PREFIX = '/api/artist-profile';

// ── Re-export общих утилит (чтобы не ломать внешние импорты) ──
export { formatStat, getInitials };

// ── Типы ──────────────────────────────────────────────────

export interface ArtistSocials {
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
  spotify: string;
  appleMusic: string;
}

export interface ArtistProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  location: string;
  city: string;
  country: string;
  website: string;
  phone: string;
  genres: string[];
  rating: number;
  totalPlays: number;
  totalFollowers: number;
  totalConcerts: number;
  totalTracks: number;
  coinsBalance: number;
  isVerified: boolean;
  socials: ArtistSocials;
  careerStart: string;
  label: string;
  manager: string;
  bookingEmail: string;
  languages: string[];
  createdAt: string;
}

export interface ArtistStats {
  totalPlays: number;
  totalFollowers: number;
  totalConcerts: number;
  coinsBalance: number;
}

// ── Кэш (module-level) ──────────────────────────────────

const cache = createCacheStore<ArtistProfile, ArtistStats>();

/** Инвалидировать кэш профиля (после сохранения) */
export function invalidateProfileCache(artistId?: string): void {
  if (artistId) {
    cache.profile.delete(artistId);
    cache.stats.delete(artistId);
  } else {
    cache.profile.clear();
    cache.stats.clear();
  }
}

// ── Утилиты ──────────────────────────────────────────────

function resolveArtistId(artistId?: string): string | null {
  return artistId || localStorage.getItem('artistProfileId') || null;
}

// ── Фоллбэк ─────────────────────────────────────────────

const EMPTY_SOCIALS: ArtistSocials = {
  instagram: '', twitter: '', facebook: '',
  youtube: '', spotify: '', appleMusic: '',
};

function getLocalFallback(): ArtistProfile | null {
  const id = localStorage.getItem('artistProfileId');
  const name = localStorage.getItem('artistName');
  if (!id || !name) return null;

  const genres = safeParseArray('artistGenres');
  const city = localStorage.getItem('artistCity') || 'Москва';

  return {
    id,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@promo.fm`,
    username: name.toLowerCase().replace(/\s+/g, '_'),
    fullName: name,
    bio: '',
    avatarUrl: '',
    location: `${city}, Россия`,
    city,
    country: 'Россия',
    website: '',
    phone: '',
    genres,
    rating: 0,
    totalPlays: 0,
    totalFollowers: 0,
    totalConcerts: 0,
    totalTracks: 0,
    coinsBalance: 0,
    isVerified: false,
    socials: { ...EMPTY_SOCIALS },
    careerStart: '',
    label: '',
    manager: '',
    bookingEmail: '',
    languages: ['Русский'],
    createdAt: '',
  };
}

// ── API ──────────────────────────────────────────────────

/**
 * Загрузить полный профиль артиста
 * Приоритет: cache → API → localStorage fallback
 */
export async function getArtistProfile(artistId?: string): Promise<ArtistProfile | null> {
  const id = resolveArtistId(artistId);
  if (!id) {
    console.warn('[ArtistProfileAPI] No artist ID available');
    return getLocalFallback();
  }

  const cached = getCached(cache.profile, id);
  if (cached) return cached;

  try {
    const response = await apiFetch(API_PREFIX, `/profile/${id}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const profile = result.data as ArtistProfile;
        setCache(cache.profile, id, profile);
        console.log(`[ArtistProfile] Loaded from ${result.source}: ${profile.fullName}`);
        return profile;
      }
    }
    console.warn('[ArtistProfileAPI] API returned non-ok, using localStorage fallback');
  } catch (error) {
    console.warn('[ArtistProfileAPI] Network error, using localStorage fallback:', error);
  }

  return getLocalFallback();
}

/**
 * Обновить профиль артиста и инвалидировать кэш
 */
export async function updateArtistProfile(
  artistId: string,
  updates: Partial<ArtistProfile>,
): Promise<ArtistProfile | null> {
  try {
    const response = await apiFetch(API_PREFIX, `/profile/${artistId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const profile = result.data as ArtistProfile;
        invalidateProfileCache(artistId);
        setCache(cache.profile, artistId, profile);
        console.log(`[ArtistProfile] Updated: ${profile.fullName}`);
        return profile;
      }
    }

    const errorBody = await response.text().catch(() => 'unknown');
    console.error(`[ArtistProfileAPI] Update failed (${response.status}): ${errorBody}`);
    return null;
  } catch (error) {
    console.error('[ArtistProfileAPI] Network error during update:', error);
    return null;
  }
}

/**
 * Получить статистику артиста
 * Приоритет: cache → API → profile data → null
 */
export async function getArtistStats(artistId?: string): Promise<ArtistStats | null> {
  const id = resolveArtistId(artistId);
  if (!id) return null;

  const cached = getCached(cache.stats, id);
  if (cached) return cached;

  try {
    const response = await apiFetch(API_PREFIX, `/profile/${id}/stats`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const stats = result.data as ArtistStats;
        setCache(cache.stats, id, stats);
        return stats;
      }
    }
  } catch {
    // Fallback ниже
  }

  const profileCached = getCached(cache.profile, id);
  if (profileCached) {
    return {
      totalPlays: profileCached.totalPlays,
      totalFollowers: profileCached.totalFollowers,
      totalConcerts: profileCached.totalConcerts,
      coinsBalance: profileCached.coinsBalance,
    };
  }

  return null;
}
