/**
 * RESOLVE USER ID - Единый хелпер авторизации для всех серверных маршрутов
 *
 * Приоритет:
 * 1. Supabase Auth token из Authorization header (реальный пользователь)
 * 2. X-User-Id header (обратная совместимость / тесты)
 * 3. Fallback на демо-пользователя (если передан)
 *
 * Используется во всех кабинетах: Artist, DJ, Radio, Venue, Producer, Admin
 */

import { getSupabaseClient } from './supabase-client.tsx';

/**
 * Получить userId из Hono context
 * @param c - Hono context
 * @param demoFallback - ID демо-пользователя для неавторизованных запросов
 */
export async function resolveUserId(c: any, demoFallback: string): Promise<string> {
  // 1. Supabase auth token
  const authHeader = c.req.header('Authorization');
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) return user.id;
    } catch {
      // Auth failed, fall through
    }
  }

  // 2. X-User-Id header (обратная совместимость)
  const headerUserId = c.req.header('X-User-Id');
  if (headerUserId) return headerUserId;

  // 3. Demo fallback
  return demoFallback;
}
