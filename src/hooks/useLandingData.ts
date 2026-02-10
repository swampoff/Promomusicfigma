/**
 * HOOK: useLandingData
 * React hook для загрузки данных лендинга из Supabase KV через API
 * Кэширование, loading states, error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as landingApi from '@/utils/api/landing-data';
import type {
  PopularArtistEntry,
  LandingArtist,
  LandingTrack,
  WeeklyChart,
  LandingNews,
  LandingConcert,
  PlatformStats,
  SearchResults,
  MarketplaceBeat,
  ProducerService,
  PortfolioItem,
} from '@/utils/api/landing-data';

// Re-export types for convenience
export type {
  PopularArtistEntry,
  LandingArtist,
  LandingTrack,
  WeeklyChart,
  LandingNews,
  LandingConcert,
  PlatformStats,
  SearchResults,
  MarketplaceBeat,
  ProducerService,
  PortfolioItem,
};

interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Популярные артисты
 */
export function usePopularArtists() {
  const [state, setState] = useState<DataState<PopularArtistEntry[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getPopularArtists();
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load artists' }));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Профиль артиста
 */
export function useArtistProfile(idOrSlug: string | null) {
  const [state, setState] = useState<DataState<LandingArtist>>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!idOrSlug) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    landingApi.getArtist(idOrSlug).then(result => {
      if (cancelled) return;
      if (result.success && result.data) {
        setState({ data: result.data, isLoading: false, error: null });
      } else {
        setState({ data: null, isLoading: false, error: result.error || 'Artist not found' });
      }
    });

    return () => { cancelled = true; };
  }, [idOrSlug]);

  return state;
}

/**
 * Еженедельный чарт
 */
export function useWeeklyChart() {
  const [state, setState] = useState<DataState<WeeklyChart>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getWeeklyChart();
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load chart' }));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Новые треки
 */
export function useNewTracks(limit = 10) {
  const [state, setState] = useState<DataState<LandingTrack[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState(prev => ({ ...prev, isLoading: true }));

    landingApi.getNewTracks(limit).then(result => {
      if (cancelled) return;
      if (result.success && result.data) {
        setState({ data: result.data, isLoading: false, error: null });
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load tracks' }));
      }
    });

    return () => { cancelled = true; };
  }, [limit]);

  return state;
}

/**
 * Трендовые треки
 */
export function useTrendingTracks(limit = 10) {
  const [state, setState] = useState<DataState<LandingTrack[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState(prev => ({ ...prev, isLoading: true }));

    landingApi.getTrendingTracks(limit).then(result => {
      if (cancelled) return;
      if (result.success && result.data) {
        setState({ data: result.data, isLoading: false, error: null });
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load trending tracks' }));
      }
    });

    return () => { cancelled = true; };
  }, [limit]);

  return state;
}

/**
 * Публичные новости
 */
export function useLandingNews(limit = 6) {
  const [state, setState] = useState<DataState<LandingNews[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getNews({ limit });
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load news' }));
    }
  }, [limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Предстоящие концерты
 */
export function useLandingConcerts(limit = 6) {
  const [state, setState] = useState<DataState<LandingConcert[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getConcerts({ limit });
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load concerts' }));
    }
  }, [limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Статистика платформы
 */
export function usePlatformStats() {
  const [state, setState] = useState<DataState<PlatformStats>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    landingApi.getPlatformStats().then(result => {
      if (cancelled) return;
      if (result.success && result.data) {
        setState({ data: result.data, isLoading: false, error: null });
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load stats' }));
      }
    });

    return () => { cancelled = true; };
  }, []);

  return state;
}

/**
 * Поиск (debounced)
 */
export function useSearch(query: string, debounceMs = 300) {
  const [state, setState] = useState<DataState<SearchResults>>({
    data: null,
    isLoading: false,
    error: null,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query || query.length < 2) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    timeoutRef.current = setTimeout(async () => {
      const result = await landingApi.search(query);
      if (result.success && result.data) {
        setState({ data: result.data, isLoading: false, error: null });
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Search failed' }));
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, debounceMs]);

  return state;
}

/**
 * Биты маркетплейса
 */
export function useBeats(params?: { genre?: string; sort?: string; limit?: number }) {
  const [state, setState] = useState<DataState<MarketplaceBeat[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const genre = params?.genre;
  const sort = params?.sort;
  const limit = params?.limit;

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getBeats({ genre, sort, limit });
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load beats' }));
    }
  }, [genre, sort, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Услуги продюсеров
 */
export function useProducerServices(params?: { type?: string; limit?: number }) {
  const [state, setState] = useState<DataState<ProducerService[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const type = params?.type;
  const limit = params?.limit;

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getProducerServices({ type, limit });
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load services' }));
    }
  }, [type, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/**
 * Портфолио до/после
 */
export function usePortfolio() {
  const [state, setState] = useState<DataState<PortfolioItem[]>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await landingApi.getPortfolio();
    if (result.success && result.data) {
      setState({ data: result.data, isLoading: false, error: null });
    } else {
      setState(prev => ({ ...prev, isLoading: false, error: result.error || 'Failed to load portfolio' }));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}