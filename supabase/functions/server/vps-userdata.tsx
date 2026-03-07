/**
 * VPS UserData API Client
 * Обращается к FastAPI на российском VPS (152-ФЗ)
 * Заменяет KV-вызовы для личных данных пользователей
 */

const VPS_URL = Deno.env.get("VPS_USERDATA_URL") || "https://mail.promofm.org/userdata";
const VPS_KEY = Deno.env.get("VPS_INTERNAL_KEY") || "";

const headers = () => ({
  "Content-Type": "application/json",
  "X-Internal-Key": VPS_KEY,
});

// ── Profiles ──

export async function vpsGetProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${VPS_URL}/profile/${userId}`, { headers: headers() });
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
    const res = await fetch(`${VPS_URL}/profile`, {
      method: "POST",
      headers: headers(),
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
    const res = await fetch(`${VPS_URL}/profile/${userId}`, {
      method: "PUT",
      headers: headers(),
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
    await fetch(`${VPS_URL}/profile/${userId}`, {
      method: "DELETE",
      headers: headers(),
    });
  } catch (err) {
    console.error(`[vps] deleteProfile error:`, err);
  }
}

export async function vpsListProfiles(role?: string): Promise<Record<string, unknown>[]> {
  try {
    const params = role ? `?role=${role}&limit=500` : "?limit=500";
    const res = await fetch(`${VPS_URL}/profiles${params}`, { headers: headers() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`[vps] listProfiles error:`, err);
    return [];
  }
}

// ── Verification / Reset Tokens ──

export async function vpsStoreToken(
  userId: string,
  token: string,
  type: string = "email_verify",
  expiresInHours: number = 24,
): Promise<void> {
  try {
    const expires = new Date(Date.now() + expiresInHours * 3600_000).toISOString();
    const res = await fetch(`${VPS_URL}/token`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ user_id: userId, token, type, expires_at: expires }),
    });
    if (!res.ok) {
      console.error(`[vps] storeToken: ${res.status}`);
    }
  } catch (err) {
    console.error(`[vps] storeToken error:`, err);
  }
}

export async function vpsGetToken(token: string): Promise<{ userId: string; type: string; expiresAt: string; createdAt: string; [k: string]: unknown } | null> {
  try {
    const res = await fetch(`${VPS_URL}/token/${token}`, { headers: headers() });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data;
    if (!data) return null;
    return {
      userId: data.user_id,
      type: data.type,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      usedAt: data.used_at,
    };
  } catch (err) {
    console.error(`[vps] getToken error:`, err);
    return null;
  }
}

export async function vpsUseToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${VPS_URL}/token/${token}/use`, {
      method: "POST",
      headers: headers(),
    });
    const json = await res.json();
    return json.used === true;
  } catch (err) {
    console.error(`[vps] useToken error:`, err);
    return false;
  }
}

// ── Auth Logs ──

export async function vpsLogAuth(action: string, userId?: string, ip?: string, ua?: string): Promise<void> {
  try {
    await fetch(`${VPS_URL}/auth-log`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ user_id: userId, action, ip_address: ip, user_agent: ua }),
    });
  } catch { /* fire and forget */ }
}
