/**
 * useRadioProfile — общий хук для радиокабинета
 * Dedup API-вызовов через createInflightDedup + derived values
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getRadioProfile,
  getRadioStats,
  invalidateRadioCache,
  getRadioInitials,
  type RadioProfile,
  type RadioStats,
} from '@/utils/api/radio-profile';
import { safeParseArray, createInflightDedup } from '@/utils/api/api-cache';

const dedup = createInflightDedup<RadioProfile, RadioStats>();

export interface UseRadioProfileResult {
  profile: RadioProfile | null;
  stats: RadioStats | null;
  isLoading: boolean;
  /** Название станции */
  stationName: string;
  /** Инициалы (2 буквы) */
  initials: string;
  /** Город */
  city: string;
  /** Частота */
  frequency: string;
  /** Статус */
  status: string;
  /** Слушатели (форматировано) */
  listeners: string;
  /** Форматы/жанры */
  formats: string[];
  /** Перезагрузить данные */
  refresh: () => Promise<void>;
}

export function useRadioProfile(): UseRadioProfileResult {
  const [profile, setProfile] = useState<RadioProfile | null>(null);
  const [stats, setStats] = useState<RadioStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, s] = await dedup.dedup(getRadioProfile, getRadioStats);
      if (p) setProfile(p);
      if (s) setStats(s);
    } catch (error) {
      console.error('[useRadioProfile] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stationName = profile?.name || localStorage.getItem('radioName') || 'Радиостанция';
  const initials = getRadioInitials(stationName);
  const city = profile?.city || localStorage.getItem('radioCity') || '';
  const frequency = profile?.frequency || localStorage.getItem('radioFrequency') || '';
  const status = profile?.status || localStorage.getItem('radioStatus') || 'Online';
  const listeners = profile?.listeners || localStorage.getItem('radioListeners') || '0';

  let formats: string[] = profile?.formats?.length ? profile.formats : [];
  if (formats.length === 0) {
    formats = safeParseArray('radioFormats');
  }

  const refresh = useCallback(async () => {
    invalidateRadioCache();
    await load();
  }, [load]);

  return {
    profile, stats, isLoading,
    stationName, initials, city, frequency, status, listeners, formats,
    refresh,
  };
}
