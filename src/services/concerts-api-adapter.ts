/**
 * Concerts API Adapter
 * 
 * Все запросы идут напрямую к /api/concerts backend.
 * Mock данные полностью убраны — используется только реальный API.
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';
import type { TourDate, CreateTourDateInput, UpdateTourDateInput } from '@/types/database';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/api/concerts`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token || publicAnonKey;
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || json.message || `HTTP ${res.status}` };
    }
    // Normalise: backend may return { data: ... } or raw array/object
    const payload = json.data !== undefined ? json.data : json;
    return { success: true, data: payload as T };
  } catch (err: any) {
    console.error(`Concerts API error (${path}):`, err);
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Unified API Adapter — real backend only
 */
export const concertsApiAdapter = {
  /**
   * Получить все концерты (публичные)
   */
  async getAll() {
    return apiFetch<TourDate[]>('/public');
  },

  /**
   * Получить концерт по ID
   */
  async getById(id: string) {
    return apiFetch<TourDate>(`/${id}`);
  },

  /**
   * Создать концерт
   */
  async create(data: CreateTourDateInput) {
    return apiFetch<TourDate>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Обновить концерт
   */
  async update(id: string, data: UpdateTourDateInput) {
    return apiFetch<TourDate>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Удалить концерт
   */
  async delete(id: string) {
    return apiFetch<void>(`/${id}`, { method: 'DELETE' });
  },

  /**
   * Отправить на модерацию
   */
  async submit(id: string) {
    return apiFetch<TourDate>(`/${id}/submit`, { method: 'POST' });
  },

  /**
   * Продвинуть концерт
   */
  async promote(id: string, days: number = 7) {
    return apiFetch<TourDate>(`/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },
};

/**
 * Hook для проверки статуса backend
 */
export async function useBackendStatus() {
  try {
    const result = await concertsApiAdapter.getAll();
    return {
      isPostgres: result.success,
      backendType: result.success ? 'Postgres' : 'Unavailable',
      message: result.success
        ? 'Подключено к Postgres'
        : 'Backend недоступен: ' + (result.error || 'unknown'),
    };
  } catch {
    return {
      isPostgres: false,
      backendType: 'Unavailable',
      message: 'Backend недоступен',
    };
  }
}
