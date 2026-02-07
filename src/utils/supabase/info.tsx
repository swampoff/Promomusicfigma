/**
 * Supabase project info — читается из environment config
 * Все 38+ файлов импортируют отсюда, API экспорта сохранён
 */
import config from '@/config/environment';

export const projectId = config.projectId;
export const publicAnonKey = config.supabaseAnonKey;
