/**
 * Environment Configuration
 * Reads Supabase credentials from environment variables (Vite).
 * Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in .env or Vercel dashboard.
 */

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!PROJECT_ID || !ANON_KEY) {
  console.error('[Config] Missing VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_ANON_KEY env vars');
}

export const config = {
  isLocal: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE as 'development' | 'production',

  supabaseUrl: `https://${PROJECT_ID}.supabase.co`,
  supabaseAnonKey: ANON_KEY,
  projectId: PROJECT_ID,

  // Service Role Key (never used on client)
  serviceRoleKey: undefined,

  functionsUrl: `https://${PROJECT_ID}.supabase.co/functions/v1`,
  storageUrl: `https://${PROJECT_ID}.supabase.co/storage/v1`,
};

export default config;
