/**
 * SUPABASE CLIENT SINGLETON
 * Единственный экземпляр клиента для всего приложения
 * Предотвращает Multiple GoTrueClient instances warning
 * 
 * ⚠️ ВАЖНО: Переэкспортируем существующий singleton из utils!
 */

import { supabase, getSupabaseClient } from '@/utils/supabase/client';

// Экспортируем существующий singleton (НЕ создаем новый!)
export { supabase, getSupabaseClient };