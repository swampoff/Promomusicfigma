/**
 * VPS UserData API Client
 * Обращается к FastAPI на российском VPS (152-ФЗ)
 * С KV-fallback для токенов верификации при недоступности VPS
 */

import { verificationTokensStore } from './db.tsx';

const VPS_URL = Deno.env.get("VPS_USERDATA_URL") || "https://mail.promofm.org/userdata";
const VPS_KEY = Deno.env.get("VPS_INTERNAL_KEY") || "";
const VPS_TIMEOUT = 5000; // 5 seconds timeout for VPS calls

const hdrs = () => ({
  "Content-Type": "application/json",
  "X-Internal-Key": VPS_KEY,
});

/** Fetch with timeout */
async function fetchWithTimeout(url: string, opts: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeout || VPS_TIMEOUT);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Profiles ──

export async function vpsGetProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetchWithTimeout(`${VPS_URL}/profile/${userId}`, { headers: hdrs() });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`[vps] getProfile ${userId}: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error(`[vps] getProfile error:`, err);
    return null;
  }
}

export async function vpsSaveProfile(userId: string, data: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetchWithTimeout(`${VPS_URL}/profile`, {
      method: "POST",
      headers: hdrs(),
      body: JSON.stringify({ id: userId, ...data }),
    });
    if (!res.ok) {
      console.error(`[vps] saveProfile ${userId}: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error(`[vps] saveProfile error:`, err);
  }
}

export async function vpsUpdateProfile(userId: string, updates: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetchWithTimeout(`${VPS_URL}/profile/${userId}`, {
      method: "PUT",
      headers: hdrs(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      console.error(`[vps] updateProfile ${userId}: ${res.status}`);
    }
  } catch (err) {
    console.error(`[vps] updateProfile error:`, err);
  }
}

export async function vpsDeleteProfile(userId: string): Promise<void> {
  try {
    await fetchWithTimeout(`${VPS_URL}/profile/${userId}`, {
      method: "DELETE",
      headers: hdrs(),
    });
  } catch (err) {
    console.error(`[vps] deleteProfile error:`, err);
  }
}

export async function vpsListProfiles(role?: string): Promise<Record<string, unknown>[]> {
  try {
    const params = role ? `?role=${role}&limit=500` : "?limit=500";
    const res = await fetchWithTimeout(`${VPS_URL}/profiles${params}`, { headers: hdrs() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`[vps] listProfiles error:`, err);
    return [];
  }
}

// ── Verification / Reset Tokens (VPS + KV fallback) ──

export async function vpsStoreToken(
  userId: string,
  token: string,
  type: string = "email_verify",
  expiresInHours: number = 24,
): Promise<void> {
  const expires = new Date(Date.now() + expiresInHours * 3600_000).toISOString();

  // Always store in KV as fallback
  try {
    await verificationTokensStore.set(token, {
      id: token,
      user_id: userId,
      type,
      expires_at: expires,
      created_at: new Date().toISOString(),
      source: 'kv_fallback',
    });
    console.log(`[vps] Token stored in KV: ${token.slice(0, 8)}... for ${userId.slice(0, 8)}...`);
  } catch (kvErr) {
    console.error(`[vps] KV storeToken error:`, kvErr);
  }

  // Also try VPS (non-blocking)
  try {
    const res = await fetchWithTimeout(`${VPS_URL}/token`, {
      method: "POST",
      headers: hdrs(),
      body: JSON.stringify({ user_id: userId, token, type, expires_at: expires }),
    });
    if (!res.ok) {
      console.error(`[vps] storeToken VPS: ${res.status}`);
    } else {
      console.log(`[vps] Token also stored on VPS`);
    }
  } catch (err) {
    console.warn(`[vps] VPS unreachable for storeToken, KV fallback active`);
  }
}

export async function vpsGetToken(token: string): Promise<{ userId: string; type: string; expiresAt: string; createdAt: string; [k: string]: unknown } | null> {
  // Try VPS first
  try {
    const res = await fetchWithTimeout(`${VPS_URL}/token/${token}`, { headers: hdrs() });
    if (res.ok) {
      const json = await res.json();
      const data = json.data;
      if (data) {
        return {
          userId: data.user_id,
          type: data.type,
          expiresAt: data.expires_at,
          createdAt: data.created_at,
          usedAt: data.used_at,
        };
      }
    }
  } catch (err) {
    console.warn(`[vps] VPS unreachable for getToken, trying KV fallback`);
  }

  // KV fallback
  try {
    const kvData = await verificationTokensStore.get(token) as any;
    if (kvData && kvData.user_id) {
      // Check expiration
      if (new Date() > new Date(kvData.expires_at)) {
        console.log(`[vps] KV token expired`);
        return null;
      }
      return {
        userId: kvData.user_id,
        type: kvData.type,
        expiresAt: kvData.expires_at,
        createdAt: kvData.created_at,
      };
    }
  } catch (kvErr) {
    console.error(`[vps] KV getToken error:`, kvErr);
  }

  return null;
}

export async function vpsUseToken(token: string): Promise<boolean> {
  // Try VPS first
  try {
    const res = await fetchWithTimeout(`${VPS_URL}/token/${token}/use`, {
      method: "POST",
      headers: hdrs(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.used === true) return true;
    }
  } catch (err) {
    console.warn(`[vps] VPS unreachable for useToken, trying KV`);
  }

  // KV fallback — mark as used by deleting
  try {
    const kvData = await verificationTokensStore.get(token) as any;
    if (kvData && kvData.user_id) {
      // Mark used in KV
      await verificationTokensStore.set(token, { ...kvData, used_at: new Date().toISOString() });
      return true;
    }
  } catch (kvErr) {
    console.error(`[vps] KV useToken error:`, kvErr);
  }

  return false;
}

// ── Auth Logs ──

export async function vpsLogAuth(action: string, userId?: string, ip?: string, ua?: string): Promise<void> {
  try {
    await fetchWithTimeout(`${VPS_URL}/auth-log`, {
      method: "POST",
      headers: hdrs(),
      body: JSON.stringify({ user_id: userId, action, ip_address: ip, user_agent: ua }),
    });
  } catch { /* fire and forget */ }
}
