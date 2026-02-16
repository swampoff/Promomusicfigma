/**
 * AUTH ROUTES
 * Регистрация и управление пользователями через Supabase Auth Admin API
 */

import { Hono } from 'npm:hono@4';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const auth = new Hono();

/**
 * Получить Supabase admin клиент (с service_role_key)
 */
function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key);
}

/**
 * POST /auth/signup
 * Создание нового пользователя через Supabase Auth Admin API
 */
auth.post('/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400);
    }

    const supabase = getAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name || email.split('@')[0],
        role: role || 'artist',
        created_via: 'promo_music_signup',
      },
      // Automatically confirm since email server is not configured
      email_confirm: true,
    });

    if (error) {
      console.error('Auth signup error:', error);

      // Friendly error messages
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        return c.json({ success: false, error: 'Пользователь с таким email уже зарегистрирован' }, 409);
      }

      return c.json({ success: false, error: `Ошибка регистрации: ${error.message}` }, 400);
    }

    // Save user profile to KV for fast access
    const userId = data.user.id;
    const profile = {
      userId,
      email,
      name: name || email.split('@')[0],
      role: role || 'artist',
      avatar: null,
      bio: '',
      genre: '',
      city: '',
      socialLinks: {},
      subscribers: 0,
      totalPlays: 0,
      totalTracks: 0,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, profile);

    // Create initial notification
    const notifId = `notif_${Date.now()}`;
    await kv.set(`notification:${userId}:${notifId}`, {
      id: notifId,
      userId,
      type: 'info',
      title: 'Добро пожаловать в Promo.music!',
      message: 'Ваш аккаунт создан. Загрузите свой первый трек и начните продвижение.',
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`User registered: ${email} (${userId}), role: ${role || 'artist'}`);

    return c.json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          name: profile.name,
          role: profile.role,
        },
      },
    }, 201);

  } catch (error) {
    console.error('Signup route error:', error);
    return c.json({ success: false, error: `Ошибка сервера при регистрации: ${error}` }, 500);
  }
});

/**
 * POST /auth/signin
 * Вход через Supabase Auth (для серверной валидации)
 * Основной вход делается напрямую через Supabase SDK на клиенте,
 * этот endpoint для дополнительной серверной логики
 */
auth.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(url, anonKey);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Auth signin error:', error);
      return c.json({ success: false, error: `Ошибка входа: ${error.message}` }, 401);
    }

    const userId = data.user.id;
    const accessToken = data.session.access_token;

    // Load or create profile from KV
    let profile = await kv.get(`profile:${userId}`);

    if (!profile) {
      profile = {
        userId,
        email,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: data.user.user_metadata?.role || 'artist',
        avatar: null,
        subscribers: 0,
        totalPlays: 0,
        totalTracks: 0,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`profile:${userId}`, profile);
    }

    // Update last login
    profile.lastLoginAt = new Date().toISOString();
    await kv.set(`profile:${userId}`, profile);

    console.log(`User signed in: ${email} (${userId})`);

    return c.json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          name: profile.name,
          role: profile.role,
        },
        accessToken,
        expiresAt: data.session.expires_at,
      },
    });

  } catch (error) {
    console.error('Signin route error:', error);
    return c.json({ success: false, error: `Ошибка сервера при входе: ${error}` }, 500);
  }
});

/**
 * GET /auth/me
 * Получить текущего пользователя по access_token
 */
auth.get('/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ success: false, error: 'Authorization header required' }, 401);
    }

    const supabase = getAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }

    // Get profile from KV
    let profile = await kv.get(`profile:${user.id}`);

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'User',
        role: profile?.role || user.user_metadata?.role || 'artist',
        avatar: profile?.avatar || null,
        isVerified: profile?.isVerified || false,
      },
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return c.json({ success: false, error: `Error fetching user: ${error}` }, 500);
  }
});

/**
 * POST /auth/signout
 * Серверный signout (для очистки серверного состояния)
 */
auth.post('/signout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken) {
      const supabase = getAdminClient();
      // Get user to log the signout
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      if (user) {
        console.log(`User signed out: ${user.email} (${user.id})`);
      }
    }

    return c.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    return c.json({ success: true, message: 'Signed out (with warnings)' });
  }
});

export default auth;