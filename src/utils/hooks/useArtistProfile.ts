/**
 * useArtistProfile — общий хук для загрузки профиля артиста
 * Dedup API-вызовов через createInflightDedup + derived values
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getArtistProfile,
  getArtistStats,
  invalidateProfileCache,
  type ArtistProfile,
  type ArtistStats,
} from '@/utils/api/artist-profile';
import { getInitials, safeParseArray, createInflightDedup } from '@/utils/api/api-cache';

const dedup = createInflightDedup<ArtistProfile, ArtistStats>();

export interface UseArtistProfileResult {
  profile: ArtistProfile | null;
  stats: ArtistStats | null;
  isLoading: boolean;
  /** Имя для приветствия (первое слово) */
  firstName: string;
  /** Инициалы (2 буквы) */
  initials: string;
  /** Город из профиля или localStorage */
  city: string;
  /** Жанры из профиля или localStorage */
  genres: string[];
  /** Перезагрузить данные (инвалидирует кэш) */
  refresh: () => Promise<void>;
}

export function useArtistProfile(): UseArtistProfileResult {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, s] = await dedup.dedup(getArtistProfile, getArtistStats);
      if (p) setProfile(p);
      if (s) setStats(s);
    } catch (error) {
      console.error('[useArtistProfile] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fullName = profile?.fullName || localStorage.getItem('artistName') || '';
  const firstName = fullName.split(/\s+/)[0] || '';
  const initials = getInitials(fullName);
  const city = profile?.city || localStorage.getItem('artistCity') || '';

  let genres: string[] = profile?.genres?.length ? profile.genres : [];
  if (genres.length === 0) {
    genres = safeParseArray('artistGenres');
  }

  const refresh = useCallback(async () => {
    invalidateProfileCache();
    await load();
  }, [load]);

  return { profile, stats, isLoading, firstName, initials, city, genres, refresh };
}