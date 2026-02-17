/**
 * ARTIST DATA ROUTES - CRUD for tracks, videos, news, donations, coins, profile, stats
 * All data stored in KV Store with user-scoped keys
 * Авторизация через resolveUserId (Supabase auth → X-User-Id → demo fallback)
 */

import { Hono } from "npm:hono@4";
import * as kv from "./kv_store.tsx";
import { resolveUserId } from "./resolve-user-id.tsx";

const app = new Hono();

// ── Helper ──
function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Демо artist ID для неавторизованных пользователей
const DEMO_ARTIST_USER_ID = 'demo-user';

async function getUserId(c: any): Promise<string> {
  return resolveUserId(c, DEMO_ARTIST_USER_ID);
}

// ═══════════════════════════════════════
// TRACKS
// ═══════════════════════════════════════

app.get("/tracks", async (c) => {
  const userId = await getUserId(c);
  try {
    const tracks = await kv.getByPrefix(`tracks:${userId}:`);
    const list = (tracks || []).map((t: any) => (typeof t === "string" ? JSON.parse(t) : t));
    return c.json({ success: true, data: list });
  } catch (e) {
    console.log("Error fetching tracks:", e);
    return c.json({ success: true, data: [] });
  }
});

app.get("/tracks/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  try {
    const track = await kv.get(`tracks:${userId}:${id}`);
    if (!track) return c.json({ success: false, error: "Track not found" }, 404);
    return c.json({ success: true, data: typeof track === "string" ? JSON.parse(track) : track });
  } catch (e) {
    return c.json({ success: false, error: String(e) }, 500);
  }
});

app.post("/tracks", async (c) => {
  const userId = await getUserId(c);
  const body = await c.req.json();
  const id = body.id || generateId("track");
  const now = new Date().toISOString();
  const track = {
    id,
    plays: 0,
    likes: 0,
    downloads: 0,
    ...body,
    userId,
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  await kv.set(`tracks:${userId}:${id}`, track);
  return c.json({ success: true, data: track });
});

app.put("/tracks/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await kv.get(`tracks:${userId}:${id}`);
  const prev = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : {};
  const track = { ...prev, ...body, id, userId, updatedAt: new Date().toISOString() };
  await kv.set(`tracks:${userId}:${id}`, track);
  return c.json({ success: true, data: track });
});

app.delete("/tracks/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  await kv.del(`tracks:${userId}:${id}`);
  return c.json({ success: true });
});

// ═══════════════════════════════════════
// VIDEOS
// ═══════════════════════════════════════

app.get("/videos", async (c) => {
  const userId = await getUserId(c);
  try {
    const videos = await kv.getByPrefix(`videos:${userId}:`);
    const list = (videos || []).map((v: any) => (typeof v === "string" ? JSON.parse(v) : v));
    return c.json({ success: true, data: list });
  } catch (e) {
    return c.json({ success: true, data: [] });
  }
});

app.post("/videos", async (c) => {
  const userId = await getUserId(c);
  const body = await c.req.json();
  const id = body.id || generateId("video");
  const now = new Date().toISOString();
  const video = {
    id,
    views: 0,
    likes: 0,
    ...body,
    userId,
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  await kv.set(`videos:${userId}:${id}`, video);
  return c.json({ success: true, data: video });
});

app.put("/videos/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await kv.get(`videos:${userId}:${id}`);
  const prev = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : {};
  const video = { ...prev, ...body, id, userId, updatedAt: new Date().toISOString() };
  await kv.set(`videos:${userId}:${id}`, video);
  return c.json({ success: true, data: video });
});

app.delete("/videos/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  await kv.del(`videos:${userId}:${id}`);
  return c.json({ success: true });
});

// ═══════════════════════════════════════
// NEWS
// ═══════════════════════════════════════

app.get("/news", async (c) => {
  const userId = await getUserId(c);
  try {
    const news = await kv.getByPrefix(`news:${userId}:`);
    const list = (news || []).map((n: any) => (typeof n === "string" ? JSON.parse(n) : n));
    return c.json({ success: true, data: list });
  } catch (e) {
    return c.json({ success: true, data: [] });
  }
});

app.post("/news", async (c) => {
  const userId = await getUserId(c);
  const body = await c.req.json();
  const id = body.id || generateId("news");
  const now = new Date().toISOString();
  const article = {
    id,
    likes: 0,
    comments: 0,
    ...body,
    userId,
    createdAt: body.createdAt || now,
    updatedAt: now,
  };
  await kv.set(`news:${userId}:${id}`, article);
  return c.json({ success: true, data: article });
});

app.put("/news/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await kv.get(`news:${userId}:${id}`);
  const prev = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : {};
  const article = { ...prev, ...body, id, userId, updatedAt: new Date().toISOString() };
  await kv.set(`news:${userId}:${id}`, article);
  return c.json({ success: true, data: article });
});

app.delete("/news/:id", async (c) => {
  const userId = await getUserId(c);
  const id = c.req.param("id");
  await kv.del(`news:${userId}:${id}`);
  return c.json({ success: true });
});

// ═══════════════════════════════════════
// DONATIONS
// ═══════════════════════════════════════

app.get("/donations", async (c) => {
  const userId = await getUserId(c);
  try {
    const donations = await kv.getByPrefix(`donations:${userId}:`);
    const list = (donations || []).map((d: any) => (typeof d === "string" ? JSON.parse(d) : d));
    return c.json({ success: true, data: list });
  } catch (e) {
    return c.json({ success: true, data: [] });
  }
});

app.post("/donations", async (c) => {
  const userId = await getUserId(c);
  const body = await c.req.json();
  const id = body.id || generateId("donation");
  const now = new Date().toISOString();
  const donation = {
    id,
    status: "completed",
    ...body,
    artistId: body.artistId || userId,
    createdAt: body.createdAt || now,
  };
  await kv.set(`donations:${userId}:${id}`, donation);
  return c.json({ success: true, data: donation });
});

// ═══════════════════════════════════════
// COINS
// ═══════════════════════════════════════

app.get("/coins/balance", async (c) => {
  const userId = await getUserId(c);
  try {
    const balance = await kv.get(`coins:balance:${userId}`);
    const val = balance ? (typeof balance === "string" ? JSON.parse(balance) : balance) : { balance: 1250, userId };
    return c.json({ success: true, data: val });
  } catch (e) {
    return c.json({ success: true, data: { balance: 1250, userId } });
  }
});

app.get("/coins/transactions", async (c) => {
  const userId = await getUserId(c);
  try {
    const txns = await kv.getByPrefix(`coins:txn:${userId}:`);
    const list = (txns || []).map((t: any) => (typeof t === "string" ? JSON.parse(t) : t));
    return c.json({ success: true, data: list });
  } catch (e) {
    return c.json({ success: true, data: [] });
  }
});

app.post("/coins/transactions", async (c) => {
  const userId = await getUserId(c);
  const body = await c.req.json();
  const id = body.id || generateId("cointxn");
  const now = new Date().toISOString();
  const txn = {
    id,
    userId,
    type: "spend",
    ...body,
    createdAt: body.createdAt || now,
  };
  await kv.set(`coins:txn:${userId}:${id}`, txn);

  // Update balance
  const existing = await kv.get(`coins:balance:${userId}`);
  const prev = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : { balance: 1250, userId };
  const delta = txn.type === "spend" ? -(txn.amount || 0) : (txn.amount || 0);
  const newBalance = { balance: Math.max(0, (prev.balance || 1250) + delta), userId };
  await kv.set(`coins:balance:${userId}`, newBalance);

  return c.json({ success: true, data: { transaction: txn, balance: newBalance.balance } });
});

// ═══════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════

app.get("/profile", async (c) => {
  const userId = await getUserId(c);
  try {
    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      const defaultProfile = {
        userId,
        name: "Артист",
        subscribers: 0,
        totalPlays: 0,
        totalTracks: 0,
      };
      return c.json({ success: true, data: defaultProfile });
    }
    return c.json({ success: true, data: typeof profile === "string" ? JSON.parse(profile) : profile });
  } catch (e) {
    return c.json({ success: true, data: { userId, name: "Артист", subscribers: 0, totalPlays: 0, totalTracks: 0 } });
  }
});

app.put("/profile", async (c) => {
  const userId = await getUserId(c);
  const body = await c.req.json();
  const existing = await kv.get(`profile:${userId}`);
  const prev = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : {};
  const profile = { ...prev, ...body, userId, updatedAt: new Date().toISOString() };
  await kv.set(`profile:${userId}`, profile);
  return c.json({ success: true, data: profile });
});

// ═══════════════════════════════════════
// STATS / DASHBOARD
// ═══════════════════════════════════════

app.get("/stats/dashboard", async (c) => {
  const userId = await getUserId(c);
  try {
    const tracks = await kv.getByPrefix(`tracks:${userId}:`);
    const list = (tracks || []).map((t: any) => (typeof t === "string" ? JSON.parse(t) : t));
    const donations = await kv.getByPrefix(`donations:${userId}:`);
    const donList = (donations || []).map((d: any) => (typeof d === "string" ? JSON.parse(d) : d));
    const balanceRaw = await kv.get(`coins:balance:${userId}`);
    const balance = balanceRaw ? (typeof balanceRaw === "string" ? JSON.parse(balanceRaw) : balanceRaw) : { balance: 1250 };

    const stats = {
      totalPlays: list.reduce((s: number, t: any) => s + (t.plays || 0), 0),
      totalLikes: list.reduce((s: number, t: any) => s + (t.likes || 0), 0),
      totalDownloads: list.reduce((s: number, t: any) => s + (t.downloads || 0), 0),
      tracksCount: list.length,
      coinsBalance: balance.balance || 1250,
      donationsCount: donList.length,
      totalDonations: donList.reduce((s: number, d: any) => s + (d.amount || 0), 0),
      updatedAt: new Date().toISOString(),
    };
    return c.json({ success: true, data: stats });
  } catch (e) {
    return c.json({
      success: true,
      data: {
        totalPlays: 0, totalLikes: 0, totalDownloads: 0, tracksCount: 0,
        coinsBalance: 1250, donationsCount: 0, totalDonations: 0,
        updatedAt: new Date().toISOString(),
      },
    });
  }
});

export default app;