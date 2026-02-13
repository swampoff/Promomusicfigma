/**
 * POPULAR ARTISTS API
 * Загрузка популярных артистов для лендинга
 * In-memory кэш (60с TTL) + module-level promise deduplication
 * Собственный fetch с retry + увеличенным таймаутом (cold start Edge Function)
 */

import {
  getCached, setCache, formatStat,
  type CacheEntry,
} from './api-cache';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { waitForServer } from './server-warmup';

export { formatStat };

const POPULAR_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/artist-profile/popular`;
const CACHE_KEY = 'popular-artists';
const FETCH_TIMEOUT_MS = 15_000; // 15с — Edge Function cold start может быть долгим
const MAX_RETRIES = 2;           // 1 основная попытка + 1 retry
const RETRY_DELAY_MS = 2_000;    // 2с пауза перед retry

// ── Типы ──────────────────────────────────────────────────

export interface PopularArtist {
  id: string;
  name: string;
  genre: string;
  genres: string[];
  city: string;
  listeners: number;
  plays: number;
  tracks: number;
  rating: number;
  avatarUrl: string;
  isVerified: boolean;
}

// ── In-memory кэш ────────────────────────────────────────

const cache = new Map<string, CacheEntry<PopularArtist[]>>();

// ── Promise deduplication ────────────────────────────────

let inflight: Promise<PopularArtist[]> | null = null;

// ── Фоллбэк данные ──────────────────────────────────────

const FALLBACK_ARTISTS: PopularArtist[] = [
  { id: 'artist-4', name: 'Алиса Нова', genre: 'Electronic', genres: ['Electronic', 'Synth-pop'], city: 'Москва', listeners: 28900, plays: 412000, tracks: 45, rating: 5.0, avatarUrl: '', isVerified: true },
  { id: 'artist-5', name: 'Никита Волков', genre: 'Hip-Hop', genres: ['Hip-Hop', 'Trap'], city: 'Екатеринбург', listeners: 18500, plays: 320000, tracks: 41, rating: 4.7, avatarUrl: '', isVerified: true },
  { id: 'artist-8', name: 'Кира Пламенева', genre: 'Techno', genres: ['Techno', 'House'], city: 'Москва', listeners: 15200, plays: 275000, tracks: 38, rating: 4.4, avatarUrl: '', isVerified: true },
  { id: 'artist-1', name: 'Александр Иванов', genre: 'Pop', genres: ['Pop', 'R&B'], city: 'Москва', listeners: 12500, plays: 245000, tracks: 34, rating: 4.8, avatarUrl: '', isVerified: true },
  { id: 'artist-12', name: 'София Вельвет', genre: 'R&B', genres: ['R&B', 'Soul'], city: 'Самара', listeners: 11400, plays: 215000, tracks: 25, rating: 4.8, avatarUrl: '', isVerified: true },
  { id: 'artist-10', name: 'Диана Шторм', genre: 'Pop-Rock', genres: ['Pop-Rock', 'Punk'], city: 'Краснодар', listeners: 9800, plays: 198000, tracks: 29, rating: 4.6, avatarUrl: '', isVerified: true },
  { id: 'artist-2', name: 'Мария Звёздная', genre: 'Indie', genres: ['Indie', 'Folk'], city: 'Санкт-Петербург', listeners: 8700, plays: 189000, tracks: 21, rating: 4.9, avatarUrl: '', isVerified: true },
  { id: 'artist-3', name: 'Даниил Громов', genre: 'Rock', genres: ['Rock', 'Alternative'], city: 'Казань', listeners: 6200, plays: 156000, tracks: 18, rating: 4.6, avatarUrl: '', isVerified: false },
  { id: 'artist-11', name: 'Игорь Пиксель', genre: 'Lo-Fi', genres: ['Lo-Fi', 'Chillhop'], city: 'Н. Новгород', listeners: 7300, plays: 142000, tracks: 56, rating: 4.2, avatarUrl: '', isVerified: false },
  { id: 'artist-6', name: 'Ева Луна', genre: 'Dream Pop', genres: ['Dream Pop', 'Shoegaze'], city: 'Новосибирск', listeners: 5400, plays: 134000, tracks: 14, rating: 4.5, avatarUrl: '', isVerified: true },
  { id: 'artist-7', name: 'Максим Царёв', genre: 'Jazz', genres: ['Jazz', 'Neo-Soul'], city: 'Ростов-на-Дону', listeners: 4100, plays: 98000, tracks: 27, rating: 4.9, avatarUrl: '', isVerified: false },
  { id: 'artist-9', name: 'Артём Северный', genre: 'Ambient', genres: ['Ambient', 'Post-Rock'], city: 'Мурманск', listeners: 3200, plays: 67000, tracks: 22, rating: 4.3, avatarUrl: '', isVerified: false },
];

// ── Fetch с таймаутом ────────────────────────────────────

async function fetchWithTimeout(): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(POPULAR_URL, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ── Fetch с retry ────────────────────────────────────────

async function fetchPopularArtists(): Promise<PopularArtist[]> {
  // Wait for the Edge Function to be ready (shared warmup, runs only once)
  await waitForServer();

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
      }

      const response = await fetchWithTimeout();

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (error) {
      lastError = error;

      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      const isNetwork = error instanceof TypeError;

      if ((isAbort || isNetwork) && attempt < MAX_RETRIES) {
        continue;
      }
      break;
    }
  }

  console.log('[PopularArtists] Using fallback data');
  return FALLBACK_ARTISTS;
}

// ── Public API ───────────────────────────────────────────

/**
 * Получить популярных артистов
 * Приоритет: cache → API (retry) → fallback
 * Dedup: несколько вызовов одновременно = один fetch
 * @param forceRefresh — игнорировать кэш и загрузить свежие данные
 */
export async function getPopularArtists(forceRefresh = false): Promise<PopularArtist[]> {
  if (!forceRefresh) {
    const cached = getCached(cache, CACHE_KEY);
    if (cached) return cached;
  } else {
    // Сбрасываем кэш при форсированном обновлении
    cache.delete(CACHE_KEY);
    inflight = null;
  }

  if (!inflight) {
    inflight = fetchPopularArtists().finally(() => { inflight = null; });
  }

  const data = await inflight;
  setCache(cache, CACHE_KEY, data);
  return data;
}

/** Инвалидировать кэш (например, после обновления профиля) */
export function invalidatePopularCache(): void {
  cache.delete(CACHE_KEY);
}