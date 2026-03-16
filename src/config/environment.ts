/**
 * Environment Configuration
 * VPS backend configuration.
 * Set VITE_API_BASE_URL to point to VPS.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://promo-music.ru';

if (!API_BASE) {
  console.error('[Config] Missing VITE_API_BASE_URL env var');
}

export const config = {
  isLocal: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE as 'development' | 'production',

  // VPS API URLs
  apiBaseUrl: API_BASE,
  functionsUrl: `${API_BASE}/server`,
  storageUrl: `${API_BASE}/uploads`,

  // Service Role Key (never used on client)
  serviceRoleKey: undefined,
};

export default config;
