/**
 * CURRENT USER HOOK
 * Получение ID и роли текущего пользователя из Supabase-сессии.
 *
 * SECURITY: роль берётся ТОЛЬКО из JWT (user_metadata),
 * а НЕ из localStorage — чтобы исключить подмену на клиенте.
 */

import { useAuth } from '@/contexts/AuthContext';

export function useCurrentUser() {
  const { userId, userRole, userName, isDemoMode } = useAuth();

  return {
    userId: userId || 'unknown',
    userRole: userRole || 'artist',
    userName: userName || 'User',
    isArtist: (userRole || 'artist') === 'artist',
    isAdmin: userRole === 'admin',
    isDemoMode,
  };
}
