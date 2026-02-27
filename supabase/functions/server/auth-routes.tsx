/**
 * AUTH ROUTES
 * Регистрация, вход, VK OAuth через Supabase Auth Admin API
 */

import { Hono } from "npm:hono@4";
import { getSupabaseClient, createAnonClient } from "./supabase-client.tsx";
import * as kv from "./kv_store.tsx";
import { notifyNewUser } from "./email-helper.tsx";

const auth = new Hono();

function getAdminClient() {
  return getSupabaseClient();
}

// ── Helper: создать профиль в KV ──────────────────────────────────────────────
async function createKVProfile(userId: string, email: string, name: string, role: string, avatar?: string | null) {
  const profile = {
    userId, email,
    name: name || email.split("@")[0],
    role: role || "artist",
    avatar: avatar || null,
    bio: "", genre: "", city: "",
    socialLinks: {},
    subscribers: 0, totalPlays: 0, totalTracks: 0,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`profile:${userId}`, profile);

  const notifId = `notif_${Date.now()}`;
  await kv.set(`notification:${userId}:${notifId}`, {
    id: notifId, userId,
    type: "info",
    title: "Добро пожаловать в ПРОМО.МУЗЫКА!",
    message: "Ваш аккаунт создан. Загрузите свой первый трек и начните продвижение.",
    read: false,
    createdAt: new Date().toISOString(),
  });
  return profile;
}

// ──────────────────────────────────────────────────────────────────────
// POST /auth/signup  —  Email-регистрация
// ──────────────────────────────────────────────────────────────────────
auth.post("/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, error: "Email и пароль обязательны" }, 400);
    }
    if (password.length < 6) {
      return c.json({ success: false, error: "Пароль минимум 6 символов" }, 400);
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password,
      user_metadata: {
        name: name || email.split("@")[0],
        role: role || "artist",
        created_via: "promo_music_signup",
      },
      email_confirm: true,
    });

    if (error) {
      console.error("Auth signup error:", error);
      if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
        return c.json({ success: false, error: "Пользователь с таким email уже зарегистрирован" }, 409);
      }
      return c.json({ success: false, error: `Ошибка регистрации: ${error.message || error.msg || JSON.stringify(error)}` }, 400);
    }

    const userId = data.user.id;
    await createKVProfile(userId, email, name || email.split("@")[0], role || "artist");
    console.log(`User registered: ${email} (${userId}), role: ${role || "artist"}`);

    // Notify admin about new user
    notifyNewUser({ email, name: name || email.split("@")[0], role: role || "artist", via: "email" }).catch(() => {});

    return c.json({
      success: true,
      data: { user: { id: userId, email, name: name || email.split("@")[0], role: role || "artist" } },
    }, 201);
  } catch (error) {
    console.error("Signup route error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/signin  —  Вход через email/пароль
// ──────────────────────────────────────────────────────────────────────
auth.post("/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ success: false, error: "Email и пароль обязательны" }, 400);
    }

    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === "invalid_credentials" || error.message?.includes("Invalid login")) {
        console.warn(`Auth signin: invalid credentials for ${email}`);
      } else {
        console.error("Auth signin error:", error.message, error.code);
      }
      return c.json({ success: false, error: `Ошибка входа: ${error.message}` }, 401);
    }

    const userId = data.user.id;
    const accessToken = data.session.access_token;

    let profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      profile = {
        userId, email,
        name: data.user.user_metadata?.name || email.split("@")[0],
        role: data.user.user_metadata?.role || "artist",
        avatar: null,
        subscribers: 0, totalPlays: 0, totalTracks: 0,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`profile:${userId}`, profile);
    }
    profile.lastLoginAt = new Date().toISOString();
    await kv.set(`profile:${userId}`, profile);

    console.log(`User signed in: ${email} (${userId})`);
    return c.json({
      success: true,
      data: {
        user: { id: userId, email, name: profile.name, role: profile.role },
        accessToken, expiresAt: data.session.expires_at,
      },
    });
  } catch (error) {
    console.error("Signin route error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/vk-callback  —  VK ID OAuth: обмен code на сессию
// ──────────────────────────────────────────────────────────────────────
auth.post("/vk-callback", async (c) => {
  try {
    const { code, redirect_uri, code_verifier } = await c.req.json();
    if (!code) {
      return c.json({ success: false, error: "VK authorization code required" }, 400);
    }

    const VK_CLIENT_ID = Deno.env.get("VK_CLIENT_ID") || "";
    const VK_CLIENT_SECRET = Deno.env.get("VK_CLIENT_SECRET") || "";

    if (!VK_CLIENT_ID || !VK_CLIENT_SECRET) {
      console.error("VK_CLIENT_ID or VK_CLIENT_SECRET not set");
      return c.json({ success: false, error: "VK OAuth не настроен на сервере" }, 500);
    }

    // 1. Exchange code for access_token
    const tokenParams = new URLSearchParams({
      client_id: VK_CLIENT_ID,
      client_secret: VK_CLIENT_SECRET,
      code,
      redirect_uri: redirect_uri || "https://promofm.org/login",
      ...(code_verifier ? { code_verifier } : {}),
    });

    const tokenResp = await fetch("https://id.vk.com/oauth2/auth", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });
    const tokenData = await tokenResp.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("VK token exchange error:", tokenData);
      return c.json({ success: false, error: `VK OAuth ошибка: ${tokenData.error_description || tokenData.error || "unknown"}` }, 400);
    }

    const vkAccessToken = tokenData.access_token;
    const vkUserId = tokenData.user_id;
    const vkEmail = tokenData.email || null;

    // 2. Get VK user profile
    const profileParams = new URLSearchParams({
      access_token: vkAccessToken,
      client_id: VK_CLIENT_ID,
    });
    const profileResp = await fetch("https://id.vk.com/oauth2/user_info", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: profileParams.toString(),
    });
    const vkProfile = await profileResp.json();

    const vkName = [vkProfile.user?.first_name, vkProfile.user?.last_name].filter(Boolean).join(" ") || `VK User ${vkUserId}`;
    const vkAvatar = vkProfile.user?.avatar || null;
    const email = vkEmail || vkProfile.user?.email || null;

    console.log(`VK OAuth: user ${vkUserId}, name: ${vkName}, email: ${email}`);

    // 3. Find or create Supabase user
    const supabase = getAdminClient();

    // Search by VK ID in user_metadata
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.user_metadata?.vk_id === String(vkUserId)
    );

    if (existingUser) {
      // Existing user — generate session
      const profile = await kv.get(`profile:${existingUser.id}`);
      const role = profile?.role || existingUser.user_metadata?.role || "artist";

      // Generate a magic link token for the user (workaround for admin session creation)
      const { data: magicData, error: magicErr } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: existingUser.email!,
      });

      if (magicErr || !magicData) {
        console.error("Magic link generation error:", magicErr);
        return c.json({ success: false, error: "Ошибка создания сессии" }, 500);
      }

      // Update last login
      if (profile) {
        profile.lastLoginAt = new Date().toISOString();
        await kv.set(`profile:${existingUser.id}`, profile);
      }

      return c.json({
        success: true,
        newUser: false,
        data: {
          user: { id: existingUser.id, email: existingUser.email, name: profile?.name || vkName, role },
          // Return the hashed token for client OTP verification
          token_hash: magicData.properties?.hashed_token,
          email: existingUser.email,
        },
      });
    }

    // 4. New user — create account
    const userEmail = email || `vk${vkUserId}@promofm.org`;
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();

    const { data: newUserData, error: createErr } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: randomPassword,
      user_metadata: {
        name: vkName,
        vk_id: String(vkUserId),
        avatar: vkAvatar,
        created_via: "vk_oauth",
      },
      email_confirm: true,
    });

    if (createErr) {
      console.error("VK user creation error:", createErr);
      // User with this email may already exist but without VK link
      if (createErr.message?.includes("already") || createErr.message?.includes("exists")) {
        return c.json({ success: false, error: "Пользователь с таким email уже зарегистрирован. Войдите через email." }, 409);
      }
      return c.json({ success: false, error: `Ошибка создания аккаунта: ${createErr.message}` }, 400);
    }

    const userId = newUserData.user.id;

    // Generate magic link for new user too
    const { data: magicData2, error: magicErr2 } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: userEmail,
    });

    console.log(`VK new user created: ${userEmail} (${userId})`);

    return c.json({
      success: true,
      newUser: true,
      data: {
        user: { id: userId, email: userEmail, name: vkName, avatar: vkAvatar },
        token_hash: magicData2?.properties?.hashed_token,
        email: userEmail,
        vkProfile: { vkId: vkUserId, name: vkName, avatar: vkAvatar },
      },
    });
  } catch (error) {
    console.error("VK callback error:", error);
    return c.json({ success: false, error: `VK OAuth ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/set-role  —  Установить роль пользователя (после VK OAuth)
// ──────────────────────────────────────────────────────────────────────
auth.post("/set-role", async (c) => {
  try {
    const { userId, role } = await c.req.json();
    if (!userId || !role) {
      return c.json({ success: false, error: "userId and role are required" }, 400);
    }

    const validRoles = ["artist", "dj", "radio_station", "venue", "producer"];
    if (!validRoles.includes(role)) {
      return c.json({ success: false, error: `Недопустимая роль: ${role}` }, 400);
    }

    const supabase = getAdminClient();

    // Update user_metadata
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role },
    });

    if (updateErr) {
      console.error("Set role error:", updateErr);
      return c.json({ success: false, error: `Ошибка установки роли: ${updateErr.message}` }, 400);
    }

    // Update KV profile
    let profile = await kv.get(`profile:${userId}`);
    if (profile) {
      profile.role = role;
      profile.updatedAt = new Date().toISOString();
      await kv.set(`profile:${userId}`, profile);
    } else {
      // Create profile if missing
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user) {
        await createKVProfile(userId, user.email || "", user.user_metadata?.name || "", role, user.user_metadata?.avatar);
      }
    }

    console.log(`Role set for ${userId}: ${role}`);
    return c.json({ success: true, role });
  } catch (error) {
    console.error("Set role error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /auth/me
// ──────────────────────────────────────────────────────────────────────
auth.get("/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Authorization header required" }, 401);
    }

    const supabase = getAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ success: false, error: "Invalid or expired token" }, 401);
    }

    let profile = await kv.get(`profile:${user.id}`);

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || "User",
        role: profile?.role || user.user_metadata?.role || "artist",
        avatar: profile?.avatar || user.user_metadata?.avatar || null,
        isVerified: profile?.isVerified || false,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return c.json({ success: false, error: `Error fetching user: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/signout
// ──────────────────────────────────────────────────────────────────────
auth.post("/signout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (accessToken) {
      const supabase = getAdminClient();
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        console.log(`User signed out: ${user.email} (${user.id})`);
      }
    }
    return c.json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    console.error("Signout error:", error);
    return c.json({ success: true, message: "Signed out (with warnings)" });
  }
});

export default auth;
