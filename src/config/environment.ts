/**
 * Environment Configuration
 * Читает credentials из VITE_* переменных окружения
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

const isLocalDocker =
  supabaseUrl.includes('localhost') ||
  import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

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

export default config;
