/**
 * SERVER WARMUP - Shared module to wait for Edge Function cold start
 * All landing API modules call `waitForServer()` before their first fetch.
 * The warmup runs ONCE per page load: it pings /health with retry + back-off.
 * Subsequent calls return immediately.
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';

const HEALTH_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/health`;
const MAX_PINGS  = 4;       // up to 4 attempts
const PING_TIMEOUT_MS = 6_000; // 6s per ping

let warmupPromise: Promise<boolean> | null = null;
let isWarm = false;

/** Single ping with timeout */
async function ping(): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
  try {
    const res = await fetch(HEALTH_URL, {
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/** Internal warmup loop */
async function doWarmup(): Promise<boolean> {
  for (let i = 0; i < MAX_PINGS; i++) {
    if (i > 0) {
      // Exponential back-off: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i - 1)));
    }
    if (await ping()) {
      isWarm = true;
      return true;
    }
  }
  // Even if all pings fail, let callers proceed so they hit their own fallback logic
  isWarm = true;
  return false;
}

/**
 * Wait until the Edge Function server is ready.
 * - First call triggers the warmup (one `/health` ping with retry).
 * - All concurrent/subsequent calls share the same promise.
 * - Resolves `true` if server responded, `false` otherwise (callers should still try).
 */
export function waitForServer(): Promise<boolean> {
  if (isWarm) return Promise.resolve(true);
  if (!warmupPromise) {
    warmupPromise = doWarmup();
  }
  return warmupPromise;
}