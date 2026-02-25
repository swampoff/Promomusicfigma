/**
 * Supabase connection info — reads from environment config.
 * SECURITY: No hardcoded keys.
 */
import config from '@/config/environment';

export const projectId = config.projectId;
export const publicAnonKey = config.supabaseAnonKey;
export const supabaseUrl = config.supabaseUrl;
