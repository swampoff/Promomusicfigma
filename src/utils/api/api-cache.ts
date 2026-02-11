/**
 * SHARED API CACHE & UTILITIES
 * Общая инфраструктура кэширования, fetch-обёртка и хелперы
 * Используется artist-profile, radio-profile и другими API-модулями
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';
import { waitForServer } from './server-warmup';

// ── Константы ─────────────────────────────────────────────

export const CACHE_TTL_MS = 60_000; // 1 минута
const FETCH_TIMEOUT_MS = 8_000;
const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// ── In-memory кэш ────────────────────────────────────────

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/** Получить из кэша (null если TTL истёк) */
export function getCached<T>(store: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = store.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  if (entry) store.delete(key);
  return null;
}

/** Записать в кэш */
export function setCache<T>(store: Map<string, CacheEntry<T>>, key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

/** Создать пару Map'ов для profile + stats кэша */
export function createCacheStore<P, S>() {
  return {
    profile: new Map<string, CacheEntry<P>>(),
    stats: new Map<string, CacheEntry<S>>(),
  };
}

// ── Authenticated fetch ──────────────────────────────────

/**
 * Общий fetch с авторизацией и таймаутом
 * @param apiPrefix — путь относительно сервера, напр. "/api/artist-profile"
 * @param path — конкретный endpoint, напр. "/profile/abc123"
 */
export async function apiFetch(
  apiPrefix: string,
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  // Wait for server to be ready on first real fetch
  await waitForServer();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(`${SERVER_BASE}${apiPrefix}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ── localStorage хелперы ─────────────────────────────────

/** Безопасный JSON.parse массива из localStorage */
export function safeParseArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Форматирование ───────────────────────────────────────

/** 245000 → "245K", 1200000 → "1.2M" */
export function formatStat(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

/** Инициалы: "Иван Петров" → "ИП" */
export function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Парсинг "1.2M" → 1200000, "680K" → 680000 */
export function parseListenerString(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[,\s]/g, '');
  if (cleaned.endsWith('M')) return parseFloat(cleaned) * 1_000_000;
  if (cleaned.endsWith('K')) return parseFloat(cleaned) * 1_000;
  return parseInt(cleaned, 10) || 0;
}

// ── Promise deduplication ────────────────────────────────

/**
 * Фабрика module-level dedup для пары profile + stats запросов
 * Несколько компонентов, вызывающих один хук одновременно,
 * получат один и тот же in-flight promise
 */
export function createInflightDedup<P, S>() {
  let inflightProfile: Promise<P | null> | null = null;
  let inflightStats: Promise<S | null> | null = null;

  return {
    dedup(
      getProfile: () => Promise<P | null>,
      getStats: () => Promise<S | null>,
    ): Promise<[P | null, S | null]> {
      if (!inflightProfile) {
        inflightProfile = getProfile().finally(() => { inflightProfile = null; });
      }
      if (!inflightStats) {
        inflightStats = getStats().finally(() => { inflightStats = null; });
      }
      return Promise.all([inflightProfile, inflightStats]);
    },
  };
}