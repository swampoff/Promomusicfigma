/**
 * Environment Configuration
 * Now supports both Supabase (legacy) and VPS (new) backend.
 * Set VITE_API_BASE_URL to point to VPS.
 */

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const API_BASE = import.meta.env.VITE_API_BASE_URL || `https://${PROJECT_ID}.supabase.co`;

if (!API_BASE) {
  console.error('[Config] Missing VITE_API_BASE_URL env var');
}

export const config = {
  isLocal: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE as 'development' | 'production',

  // Legacy Supabase compat fields (used by supabase SDK client)
  supabaseUrl: `https://${PROJECT_ID}.supabase.co`,
  supabaseAnonKey: ANON_KEY,
  projectId: PROJECT_ID,

  // VPS API URLs — these are what the frontend actually calls
  apiBaseUrl: API_BASE,
  functionsUrl: `${API_BASE}/server`,
  storageUrl: `${API_BASE}/uploads`,

  // Service Role Key (never used on client)
  serviceRoleKey: undefined,
};

export default config;
