/**
 * Environment Configuration
 * Все credentials читаются из переменных окружения (VITE_*)
 * Локально — из .env файла, на Vercel — из Environment Variables
 */

const isLocalDocker =
  import.meta.env.VITE_SUPABASE_URL?.includes('localhost') ||
  import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or Vercel dashboard.'
  );
}

export const config = {
  isLocal: isLocalDocker,
  isProduction: !isLocalDocker,
  mode: isLocalDocker ? 'local' : 'production',

  supabaseUrl,
  supabaseAnonKey,
  projectId: projectId || supabaseUrl.replace('https://', '').split('.')[0],

  functionsUrl: `${supabaseUrl}/functions/v1`,
  storageUrl: `${supabaseUrl}/storage/v1`,
};

if (import.meta.env.DEV) {
  console.log('Environment Configuration:', {
    mode: config.mode,
    supabaseUrl: config.supabaseUrl,
    projectId: config.projectId,
  });
}

export default config;
