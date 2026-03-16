/**
 * AUTH UTILITIES — Получение JWT токена из localStorage
 * Замена authClient.auth.getSession() во всех файлах
 */

export function getAccessToken(): string | null {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('access_token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
