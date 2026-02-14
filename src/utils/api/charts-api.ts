/**
 * CHARTS AGGREGATION API CLIENT
 * Клиент для работы с агрегацией внешних чартов
 */

import { apiFetch } from './api-cache';

const API_PREFIX = '/api/charts';

// ─── Types ───────────────────────────────────────────

export interface ExternalChartTrack {
  position: number;
  previousPosition: number;
  title: string;
  artist: string;
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
}

export interface ExternalChartData {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  tracks: ExternalChartTrack[];
  fetchedAt: string;
  parsedBy: 'mistral' | 'fallback';
  error?: string;
}

export interface ChartSourceInfo {
  id: string;
  name: string;
  url: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  maxTracks: number;
  hasCachedData: boolean;
  tracksCount: number;
  lastFetched: string | null;
  parsedBy: string | null;
}

export interface AggregationResult {
  sourceId: string;
  sourceName: string;
  tracksFound: number;
  parsedBy: string;
  error?: string;
}

export interface AggregationStatus {
  timestamp: string;
  sourcesProcessed: number;
  totalTracks: number;
  results: AggregationResult[];
}

// ─── API Functions ───────────────────────────────────

/** Получить конфигурацию всех источников чартов */
export async function getChartSources(): Promise<ChartSourceInfo[]> {
  try {
    const res = await apiFetch(API_PREFIX, '/sources');
    if (!res.ok) {
      console.error('Failed to fetch chart sources:', res.status);
      return [];
    }
    const data = await res.json();
    return data.success ? (data.data || []) : [];
  } catch (error) {
    console.error('Error fetching chart sources:', error);
    return [];
  }
}

/** Получить все кэшированные чарты */
export async function getAllCharts(): Promise<ExternalChartData[]> {
  try {
    const res = await apiFetch(API_PREFIX, '/all');
    if (!res.ok) {
      console.error('Failed to fetch all charts:', res.status);
      return [];
    }
    const data = await res.json();
    return data.success ? (data.data || []) : [];
  } catch (error) {
    console.error('Error fetching all charts:', error);
    return [];
  }
}

/** Получить данные конкретного чарта */
export async function getChartSource(sourceId: string): Promise<ExternalChartData | null> {
  try {
    const res = await apiFetch(API_PREFIX, `/source/${sourceId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`Error fetching chart ${sourceId}:`, error);
    return null;
  }
}

/** Запустить агрегацию чартов */
export async function aggregateCharts(sourceIds?: string[]): Promise<{
  success: boolean;
  results?: AggregationResult[];
  error?: string;
}> {
  try {
    const res = await apiFetch(API_PREFIX, '/aggregate', {
      method: 'POST',
      body: JSON.stringify(sourceIds ? { sourceIds } : {}),
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, error: data.error || 'Aggregation failed' };
    }
    return { success: true, results: data.data?.results || [] };
  } catch (error) {
    console.error('Error aggregating charts:', error);
    return { success: false, error: String(error) };
  }
}

/** Получить статус последней агрегации */
export async function getAggregationStatus(): Promise<AggregationStatus | null> {
  try {
    const res = await apiFetch(API_PREFIX, '/aggregation-status');
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching aggregation status:', error);
    return null;
  }
}
