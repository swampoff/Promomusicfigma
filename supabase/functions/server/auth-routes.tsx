/**
 * AUTH ROUTES
 * Регистрация, вход, VK OAuth, сброс пароля, верификация email
 * PostgreSQL + bcrypt + JWT (БЕЗ Supabase)
 */

import { Hono } from "npm:hono@4";
import bcrypt from "npm:bcryptjs";
import jwt from "npm:jsonwebtoken";
import pg from "npm:pg";
import { upsertNotification } from './db.tsx';
import { vpsGetProfile, vpsSaveProfile, vpsStoreToken, vpsGetToken, vpsUseToken } from './vps-userdata.tsx';
import { notifyNewUser, sendPasswordResetEmail, sendVerificationEmail, sendAccountApprovedEmail, sendAccountRejectedEmail } from "./email-helper.tsx";
import { requireAuth, requireAdmin } from './auth-middleware.tsx';

const PARTNER_ROLES = ['dj', 'radio_station', 'radio', 'venue', 'producer'];

const JWT_SECRET = Deno.env.get('JWT_SECRET') || '';
const JWT_EXPIRES_IN = '7d';

// ── PostgreSQL pool ──
const { Pool } = pg;
let pool: InstanceType<typeof Pool> | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: Deno.env.get('DATABASE_URL'),
    });
  }
  return pool;
}

async function query(sql: string, params?: any[]) {
  const client = await getPool().connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

// ── JWT helpers ──

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function tokenExpiresAt(): number {
  return Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
}

function verifyToken(token: string): { sub: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

const auth = new Hono();

// ── Helper: создать профиль на VPS (152-ФЗ) ──
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
    isEmailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const accountStatus = PARTNER_ROLES.includes(role || 'artist') ? 'pending' : 'active';
  await vpsSaveProfile(userId, { email, name: profile.name, role: profile.role, avatar: profile.avatar, accountStatus });

  const notifId = `notif_${Date.now()}`;
  await upsertNotification(userId, notifId, {
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

    const userRole = role || "artist";
    const isPartner = PARTNER_ROLES.includes(userRole);
    const accountStatus = isPartner ? 'pending' : 'active';
    const userName = name || email.split("@")[0];

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user into PostgreSQL
    let userId: string;
    try {
      const result = await query(
        `INSERT INTO users (email, password_hash, name, role, account_status, created_via)
         VALUES ($1, $2, $3, $4, $5, 'email')
         RETURNING id`,
        [email, passwordHash, userName, userRole, accountStatus]
      );
      userId = result.rows[0].id;
    } catch (err: any) {
      if (err.code === '23505') { // unique_violation
        return c.json({ success: false, error: "Пользователь с таким email уже зарегистрирован" }, 409);
      }
      console.error("DB insert user error:", err);
      return c.json({ success: false, error: `Ошибка регистрации: ${err.message}` }, 400);
    }

    await createKVProfile(userId, email, userName, userRole);
    console.log(`User registered: ${email} (${userId}), role: ${userRole}, status: ${accountStatus}`);

    // Notify admin about new user
    notifyNewUser({ email, name: userName, role: userRole, via: "email", needsApproval: isPartner }).catch(() => {});

    // Send verification email via Resend
    const verificationToken = crypto.randomUUID();
    await vpsStoreToken(userId, verificationToken, "email_verify", 24);
    sendVerificationEmail(email, userName, verificationToken).catch((e) => {
      console.warn("Verification email send failed:", e);
    });

    return c.json({
      success: true,
      emailVerificationRequired: true,
      accountStatus: isPartner ? 'pending' : 'active',
      message: isPartner ? 'Заявка отправлена на модерацию. Мы уведомим вас после рассмотрения.' : undefined,
      data: { user: { id: userId, email, name: userName, role: userRole } },
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

    // Find user in PostgreSQL
    const result = await query(
      `SELECT id, email, password_hash, name, role, account_status, email_verified, avatar
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Ошибка входа: Invalid login credentials" }, 401);
    }

    const user = result.rows[0];

    // Check email verification
    if (!user.email_verified) {
      return c.json({ success: false, error: "Email не подтверждён. Проверьте почту.", requiresVerification: true }, 401);
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn(`Auth signin: invalid credentials for ${email}`);
      return c.json({ success: false, error: "Ошибка входа: Invalid login credentials" }, 401);
    }

    // Check account status
    if (user.account_status === 'pending') {
      return c.json({ success: false, error: 'Ваш аккаунт на модерации. Мы уведомим вас после рассмотрения.', accountStatus: 'pending' }, 403);
    }
    if (user.account_status === 'rejected') {
      return c.json({ success: false, error: 'Ваша заявка отклонена. Свяжитесь с поддержкой.', accountStatus: 'rejected' }, 403);
    }

    // Generate JWT
    const accessToken = signToken({ id: user.id, email: user.email, role: user.role });

    // Update last sign in
    await query(`UPDATE users SET last_sign_in_at = NOW() WHERE id = $1`, [user.id]);

    // Update VPS profile
    let profile = await vpsGetProfile(user.id);
    if (!profile) {
      profile = {
        userId: user.id, email,
        name: user.name || email.split("@")[0],
        role: user.role || "artist",
        avatar: user.avatar,
        subscribers: 0, totalPlays: 0, totalTracks: 0,
        isEmailVerified: user.email_verified,
        createdAt: new Date().toISOString(),
      };
      await vpsSaveProfile(user.id, profile);
    } else {
      profile.lastLoginAt = new Date().toISOString();
      await vpsSaveProfile(user.id, profile);
    }

    console.log(`User signed in: ${email} (${user.id})`);
    return c.json({
      success: true,
      data: {
        user: { id: user.id, email, name: profile.name || user.name, role: user.role, isEmailVerified: user.email_verified, accountStatus: user.account_status },
        accessToken, expiresAt: tokenExpiresAt(),
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
    const { code, redirect_uri, code_verifier, device_id } = await c.req.json();
    if (!code) {
      return c.json({ success: false, error: "VK authorization code required" }, 400);
    }

    const VK_CLIENT_ID = Deno.env.get("VK_CLIENT_ID") || "";
    const VK_CLIENT_SECRET = Deno.env.get("VK_CLIENT_SECRET") || "";

    if (!VK_CLIENT_ID || !VK_CLIENT_SECRET) {
      console.error("VK_CLIENT_ID or VK_CLIENT_SECRET not set");
      return c.json({ success: false, error: "VK OAuth не настроен на сервере" }, 500);
    }

    // 1. Exchange code for access_token via VK ID
    const tokenBody: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: VK_CLIENT_ID,
      client_secret: VK_CLIENT_SECRET,
      code,
      redirect_uri: redirect_uri || "https://promofm.org/login",
    };
    if (device_id) tokenBody.device_id = device_id;
    if (code_verifier) tokenBody.code_verifier = code_verifier;

    const tokenParams = new URLSearchParams(tokenBody);
    console.log(`VK token exchange: client_id=${VK_CLIENT_ID}, redirect_uri=${tokenBody.redirect_uri}, device_id=${device_id || 'none'}`);

    const tokenResp = await fetch("https://id.vk.com/oauth2/auth", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });
    const tokenText = await tokenResp.text();
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      console.error("VK token response not JSON:", tokenResp.status, tokenText.substring(0, 300));
      return c.json({ success: false, error: "VK OAuth: неожиданный ответ от VK (" + tokenResp.status + ")" }, 502);
    }

    if (tokenData.error || !tokenData.access_token) {
      console.error("VK token exchange error:", JSON.stringify(tokenData));
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

    // 3. Find existing user by vk_id in PostgreSQL
    const existing = await query(`SELECT * FROM users WHERE vk_id = $1`, [String(vkUserId)]);

    if (existing.rows.length > 0) {
      const existingUser = existing.rows[0];
      let profile = await vpsGetProfile(existingUser.id);
      const role = profile?.role || existingUser.role || "artist";

      // Update avatar from VK if changed
      if (profile && vkAvatar && profile.avatar !== vkAvatar) {
        profile.avatar = vkAvatar;
        profile.updatedAt = new Date().toISOString();
      }

      // Generate JWT
      const accessToken = signToken({ id: existingUser.id, email: existingUser.email, role });

      // Update last login
      await query(`UPDATE users SET last_sign_in_at = NOW() WHERE id = $1`, [existingUser.id]);
      if (profile) {
        profile.lastLoginAt = new Date().toISOString();
        await vpsSaveProfile(existingUser.id, profile);
      }

      return c.json({
        success: true,
        newUser: false,
        data: {
          user: { id: existingUser.id, email: existingUser.email, name: profile?.name || vkName, role },
          accessToken,
        },
      });
    }

    // 4. New user — create account in PostgreSQL
    const userEmail = email || `vk${vkUserId}@promofm.org`;
    const randomPassword = crypto.randomUUID() + crypto.randomUUID();
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    let userId: string;
    try {
      const result = await query(
        `INSERT INTO users (email, password_hash, name, role, avatar, vk_id, email_verified, account_status, created_via)
         VALUES ($1, $2, $3, 'artist', $4, $5, true, 'active', 'vk_oauth')
         RETURNING id`,
        [userEmail, passwordHash, vkName, vkAvatar, String(vkUserId)]
      );
      userId = result.rows[0].id;
    } catch (err: any) {
      if (err.code === '23505') {
        // Email already exists — try to link VK to existing account
        const existingByEmail = await query(`SELECT * FROM users WHERE email = $1`, [userEmail]);
        if (existingByEmail.rows.length > 0) {
          const eu = existingByEmail.rows[0];
          await query(`UPDATE users SET vk_id = $1, avatar = COALESCE($2, avatar), updated_at = NOW() WHERE id = $3`, [String(vkUserId), vkAvatar, eu.id]);
          const accessToken = signToken({ id: eu.id, email: userEmail, role: eu.role || "artist" });
          const profile = await vpsGetProfile(eu.id);
          return c.json({
            success: true,
            newUser: false,
            data: {
              user: { id: eu.id, email: userEmail, name: profile?.name || vkName, role: profile?.role || "artist" },
              accessToken,
            },
          });
        }
        return c.json({ success: false, error: "Пользователь с таким email уже зарегистрирован. Войдите через email." }, 409);
      }
      console.error("VK user creation error:", err);
      return c.json({ success: false, error: `Ошибка создания аккаунта: ${err.message}` }, 400);
    }

    // Create profile for new VK user
    await createKVProfile(userId, userEmail, vkName, "artist", vkAvatar);

    // Generate JWT
    const accessToken = signToken({ id: userId, email: userEmail, role: "artist" });

    console.log(`VK new user created: ${userEmail} (${userId})`);

    // Notify admin
    notifyNewUser({ email: userEmail, name: vkName, role: "artist", via: "vk_oauth" }).catch(() => {});

    return c.json({
      success: true,
      newUser: true,
      data: {
        user: { id: userId, email: userEmail, name: vkName, avatar: vkAvatar, role: "artist" },
        accessToken,
      },
    });
  } catch (error) {
    console.error("VK callback error:", error);
    return c.json({ success: false, error: `VK OAuth ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/set-role  —  Установить роль пользователя
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

    // Update role in PostgreSQL
    const result = await query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [role, userId]
    );
    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Пользователь не найден" }, 404);
    }

    // Update VPS profile
    let profile = await vpsGetProfile(userId);
    if (profile) {
      profile.role = role;
      profile.updatedAt = new Date().toISOString();
      await vpsSaveProfile(userId, profile);
    } else {
      const user = result.rows[0];
      await createKVProfile(userId, user.email, user.name, role, user.avatar);
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

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return c.json({ success: false, error: "Invalid or expired token" }, 401);
    }

    const result = await query(`SELECT * FROM users WHERE id = $1`, [decoded.sub]);
    if (result.rows.length === 0) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    const user = result.rows[0];

    let profile = await vpsGetProfile(user.id);

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.name || "User",
        role: profile?.role || user.role || "artist",
        avatar: profile?.avatar || user.avatar || null,
        isVerified: profile?.isVerified || false,
        isEmailVerified: user.email_verified || false,
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
      const decoded = verifyToken(accessToken);
      if (decoded) {
        console.log(`User signed out: ${decoded.email} (${decoded.sub})`);
      }
    }
    return c.json({ success: true, message: "Signed out successfully" });
  } catch (error) {
    console.error("Signout error:", error);
    return c.json({ success: true, message: "Signed out (with warnings)" });
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/request-reset  —  Запрос сброса пароля
// ──────────────────────────────────────────────────────────────────────
auth.post("/request-reset", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ success: false, error: "Email обязателен" }, 400);
    }

    const result = await query(`SELECT id, email, name FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return c.json({ success: true, message: "Если аккаунт с таким email существует, мы отправили письмо для сброса пароля." });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = crypto.randomUUID();
    await vpsStoreToken(user.id, resetToken, "password_reset", 1);

    // Send reset email
    const profile = await vpsGetProfile(user.id);
    const userName = profile?.name || user.name || email.split("@")[0];
    await sendPasswordResetEmail(email, userName, resetToken);

    console.log(`Password reset email sent to: ${email}`);
    return c.json({ success: true, message: "Если аккаунт с таким email существует, мы отправили письмо для сброса пароля." });
  } catch (error) {
    console.error("Request reset error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/reset-password  —  Сброс пароля по токену
// ──────────────────────────────────────────────────────────────────────
auth.post("/reset-password", async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    if (!token || !newPassword) {
      return c.json({ success: false, error: "Токен и новый пароль обязательны" }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ success: false, error: "Пароль минимум 6 символов" }, 400);
    }

    // Verify token
    const resetData = await vpsGetToken(token);
    if (!resetData) {
      return c.json({ success: false, error: "Недействительная или истёкшая ссылка сброса пароля" }, 400);
    }

    if (new Date() > new Date(resetData.expiresAt)) {
      await vpsUseToken(token);
      return c.json({ success: false, error: "Ссылка для сброса пароля истекла. Запросите новую." }, 400);
    }

    if (resetData.usedAt) {
      return c.json({ success: false, error: "Эта ссылка уже была использована." }, 400);
    }

    // Update password in PostgreSQL
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, resetData.userId]);

    // Mark token as used
    await vpsUseToken(token);

    console.log(`Password reset completed for user: ${resetData.userId}`);
    return c.json({ success: true, message: "Пароль успешно обновлён. Теперь вы можете войти с новым паролем." });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/verify-email  —  Подтверждение email по токену
// ──────────────────────────────────────────────────────────────────────
auth.post("/verify-email", async (c) => {
  try {
    const { token } = await c.req.json();
    if (!token) {
      return c.json({ success: false, error: "Токен верификации обязателен" }, 400);
    }

    const verifyData = await vpsGetToken(token);
    if (!verifyData) {
      return c.json({ success: false, error: "Недействительная или истёкшая ссылка подтверждения" }, 400);
    }

    if (new Date() > new Date(verifyData.expiresAt)) {
      await vpsUseToken(token);
      return c.json({ success: false, error: "Ссылка для подтверждения истекла. Запросите новую." }, 400);
    }

    // Update email_verified in PostgreSQL
    await query(`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1`, [verifyData.userId]);

    // Update VPS profile
    const profile = await vpsGetProfile(verifyData.userId);
    if (profile) {
      profile.isEmailVerified = true;
      profile.emailVerifiedAt = new Date().toISOString();
      profile.updatedAt = new Date().toISOString();
      await vpsSaveProfile(verifyData.userId, profile);
    }

    await vpsUseToken(token);

    console.log(`Email verified for user: ${verifyData.userId}`);
    return c.json({ success: true, message: "Email успешно подтверждён!" });
  } catch (error) {
    console.error("Verify email error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/resend-verification  —  Повторная отправка (авторизован)
// ──────────────────────────────────────────────────────────────────────
auth.post("/resend-verification", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Authorization header required" }, 401);
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return c.json({ success: false, error: "Invalid or expired token" }, 401);
    }

    const result = await query(`SELECT id, email, email_verified, name FROM users WHERE id = $1`, [decoded.sub]);
    if (result.rows.length === 0) {
      return c.json({ success: false, error: "User not found" }, 404);
    }
    const user = result.rows[0];

    if (user.email_verified) {
      return c.json({ success: true, message: "Email уже подтверждён" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomUUID();
    await vpsStoreToken(user.id, verificationToken, "email_verify", 24);

    const profile = await vpsGetProfile(user.id);
    const userName = profile?.name || user.name || user.email.split("@")[0];
    await sendVerificationEmail(user.email, userName, verificationToken);

    console.log(`Verification email resent to: ${user.email}`);
    return c.json({ success: true, message: "Письмо с подтверждением отправлено повторно" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /auth/verify-email-page?token=...  —  Страница подтверждения
// ──────────────────────────────────────────────────────────────────────
auth.get("/verify-email-page", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.redirect("https://promofm.org/login?error=missing_token");
  }

  const verifyData = await vpsGetToken(token);
  if (!verifyData || new Date() > new Date(verifyData.expiresAt)) {
    return c.redirect("https://promofm.org/login?error=invalid_token");
  }

  // Update email_verified in PostgreSQL
  await query(`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1`, [verifyData.userId]);

  // Update VPS profile
  const profile = await vpsGetProfile(verifyData.userId);
  if (profile) {
    profile.isEmailVerified = true;
    profile.emailVerifiedAt = new Date().toISOString();
    profile.updatedAt = new Date().toISOString();
    await vpsSaveProfile(verifyData.userId, profile);
  }

  await vpsUseToken(token);
  console.log(`Email verified via page for user: ${verifyData.userId}`);

  return c.redirect("https://promofm.org/login?verified=true");
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/resend-verification-by-email  —  Повторная отправка по email
// ──────────────────────────────────────────────────────────────────────
auth.post("/resend-verification-by-email", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ success: false, error: "Email обязателен" }, 400);
    }

    const result = await query(`SELECT id, email, email_verified, name FROM users WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return c.json({ success: true, message: "Если аккаунт существует, письмо отправлено" });
    }

    const user = result.rows[0];
    if (user.email_verified) {
      return c.json({ success: false, error: "Email уже подтверждён. Попробуйте войти." }, 400);
    }

    const verificationToken = crypto.randomUUID();
    await vpsStoreToken(user.id, verificationToken, "email_verify", 24);

    const profile = await vpsGetProfile(user.id);
    const userName = profile?.name || user.name || email.split("@")[0];
    await sendVerificationEmail(email, userName, verificationToken);

    console.log(`Verification email resent (by email) to: ${email}`);
    return c.json({ success: true, message: "Письмо отправлено" });
  } catch (error) {
    console.error("Resend verification by email error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/change-password  —  Смена пароля (авторизован)
// ──────────────────────────────────────────────────────────────────────
auth.post("/change-password", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ success: false, error: "Authorization required" }, 401);
    }

    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return c.json({ success: false, error: "Недействительная сессия. Войдите снова." }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return c.json({ success: false, error: "Текущий и новый пароль обязательны" }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ success: false, error: "Пароль минимум 6 символов" }, 400);
    }

    // Get current password hash
    const result = await query(`SELECT id, password_hash FROM users WHERE id = $1`, [decoded.sub]);
    if (result.rows.length === 0) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return c.json({ success: false, error: "Неверный текущий пароль" }, 400);
    }

    // Update password
    const newHash = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, decoded.sub]);

    console.log(`Password changed for user: ${decoded.sub}`);
    return c.json({ success: true, message: "Пароль успешно изменён" });
  } catch (error) {
    console.error("Change password error:", error);
    return c.json({ success: false, error: `Ошибка сервера: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// GET /auth/admin/pending-users  —  Список заявок на модерацию
// ──────────────────────────────────────────────────────────────────────
auth.get("/admin/pending-users", requireAuth, requireAdmin, async (c) => {
  try {
    const result = await query(
      `SELECT id, email, name, role, created_at FROM users WHERE account_status = 'pending' ORDER BY created_at DESC`
    );
    const pending = result.rows.map((u: any) => ({
      userId: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at,
    }));
    return c.json({ success: true, data: pending });
  } catch (error) {
    return c.json({ success: false, error: `Ошибка: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/admin/approve-user  —  Одобрить заявку
// ──────────────────────────────────────────────────────────────────────
auth.post("/admin/approve-user", requireAuth, requireAdmin, async (c) => {
  try {
    const { userId } = await c.req.json();
    if (!userId) return c.json({ success: false, error: "userId обязателен" }, 400);

    const result = await query(
      `UPDATE users SET account_status = 'active', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId]
    );
    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Пользователь не найден" }, 404);
    }

    const user = result.rows[0];

    // Email notification
    sendAccountApprovedEmail(user.email || '', user.name || '').catch(() => {});

    // In-app notification
    const notifId = `notif_approved_${Date.now()}`;
    await upsertNotification(userId, notifId, {
      id: notifId, userId,
      type: "info",
      title: "Аккаунт одобрен!",
      message: "Ваша заявка одобрена. Теперь вы можете войти и пользоваться всеми функциями.",
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`Admin approved user: ${userId} (${user.email})`);
    return c.json({ success: true, message: "Пользователь одобрен" });
  } catch (error) {
    return c.json({ success: false, error: `Ошибка: ${error}` }, 500);
  }
});

// ──────────────────────────────────────────────────────────────────────
// POST /auth/admin/reject-user  —  Отклонить заявку
// ──────────────────────────────────────────────────────────────────────
auth.post("/admin/reject-user", requireAuth, requireAdmin, async (c) => {
  try {
    const { userId, reason } = await c.req.json();
    if (!userId) return c.json({ success: false, error: "userId обязателен" }, 400);

    const result = await query(
      `UPDATE users SET account_status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [userId]
    );
    if (result.rows.length === 0) {
      return c.json({ success: false, error: "Пользователь не найден" }, 404);
    }

    const user = result.rows[0];

    // Email notification
    sendAccountRejectedEmail(user.email || '', user.name || '', reason || '').catch(() => {});

    // In-app notification
    const notifId = `notif_rejected_${Date.now()}`;
    await upsertNotification(userId, notifId, {
      id: notifId, userId,
      type: "info",
      title: "Заявка отклонена",
      message: reason ? `Причина: ${reason}` : "Ваша заявка отклонена. Свяжитесь с поддержкой для уточнения.",
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`Admin rejected user: ${userId} (${user.email}), reason: ${reason}`);
    return c.json({ success: true, message: "Заявка отклонена" });
  } catch (error) {
    return c.json({ success: false, error: `Ошибка: ${error}` }, 500);
  }
});

export default auth;
