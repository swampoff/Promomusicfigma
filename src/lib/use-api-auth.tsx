/**
 * USE API AUTH - Общий хук авторизации для API-запросов
 * 
 * Приоритет:
 * 1. Supabase access_token (реальный пользователь) → Authorization: Bearer {token}
 * 2. publicAnonKey + X-User-Id header (демо/обратная совместимость)
 * 
 * Используется во всех кабинетах: Artist, DJ, Radio, Venue, Producer
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { publicAnonKey } from '/utils/supabase/info';

/**
 * Возвращает функцию getAuthHeaders() и метаданные авторизации.
 * 
 * Использование:
 * ```tsx
 * const { getAuthHeaders, userId, isDemoMode } = useApiAuth();
 * 
 * const res = await fetch(url, { headers: getAuthHeaders() });
 * const res = await fetch(url, { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body });
 * ```
 */
export function useApiAuth() {
  const { accessToken, userId, isDemoMode, userName } = useAuth();

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      // Реальный пользователь - отправляем его Supabase access token
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      // Демо/неавторизованный - publicAnonKey + X-User-Id
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
      if (userId) headers['X-User-Id'] = userId;
    }
    return headers;
  }, [accessToken, userId]);

  return useMemo(() => ({
    getAuthHeaders,
    userId,
    isDemoMode,
    userName,
    accessToken,
    isAuthenticated: !!accessToken,
  }), [getAuthHeaders, userId, isDemoMode, userName, accessToken]);
}
