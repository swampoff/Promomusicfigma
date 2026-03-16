/**
 * SERVER WARMUP - No-op for VPS deployment
 * The server is always running on our VPS, no cold start needed.
 * This module is kept for backward compatibility with imports.
 */
export function waitForServer(): Promise<boolean> {
  return Promise.resolve(true);
}
