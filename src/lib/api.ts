/**
 * AUTH CLIENT - SINGLETON EXPORT
 * Реэкспортирует singleton из @/utils/auth/client
 */
import { authClient, getAuthClient } from '@/utils/auth/client';

export const api = authClient;
export { authClient, getAuthClient };

export const getCurrentUser = async () => {
  const { data: { user }, error } = await authClient.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await authClient.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

export const getAccessToken = async () => {
  const session = await getCurrentSession();
  return session?.access_token || null;
};
