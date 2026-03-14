/**
 * AUTH CLIENT — drop-in replacement for Supabase SDK
 * Provides the same supabase.auth.* API but uses our VPS backend
 * No external dependencies — pure fetch + localStorage
 */

import config from '@/config/environment';

const STORAGE_KEY = `promofm-auth-token`;
const API = config.functionsUrl; // https://promo-music.ru/server

// ── Types ──

interface Session {
  access_token: string;
  expires_at: number;
  user: AuthUser;
}

interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    role?: string;
    avatar?: string;
    accountStatus?: string;
  };
}

type AuthChangeCallback = (event: string, session: Session | null) => void;

// ── Internal state ──

let currentSession: Session | null = null;
let listeners: AuthChangeCallback[] = [];

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    // Check expiration
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  currentSession = session;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function notifyListeners(event: string, session: Session | null) {
  for (const cb of listeners) {
    try { cb(event, session); } catch {}
  }
}

// Initialize from localStorage
currentSession = loadSession();

// ── Auth object (Supabase-compatible API) ──

const auth = {
  async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
    if (!currentSession) {
      currentSession = loadSession();
    }
    return { data: { session: currentSession }, error: null };
  },

  async getUser(): Promise<{ data: { user: AuthUser | null }; error: null }> {
    if (!currentSession) currentSession = loadSession();
    return { data: { user: currentSession?.user || null }, error: null };
  },

  async signInWithPassword(opts: { email: string; password: string }): Promise<{ data: any; error: any }> {
    try {
      const res = await fetch(`${API}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: opts.email, password: opts.password }),
      });
      const json = await res.json();

      if (!json.success || !json.data) {
        return { data: null, error: { message: json.error || 'Ошибка входа', code: 'invalid_credentials' } };
      }

      const session: Session = {
        access_token: json.data.accessToken,
        expires_at: json.data.expiresAt || (Date.now() / 1000 + 7 * 24 * 3600),
        user: {
          id: json.data.user.id,
          email: json.data.user.email,
          user_metadata: {
            name: json.data.user.name,
            role: json.data.user.role,
            avatar: json.data.user.avatar,
            accountStatus: json.data.user.accountStatus,
          },
        },
      };

      saveSession(session);
      notifyListeners('SIGNED_IN', session);

      return {
        data: {
          user: session.user,
          session: session,
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Ошибка сети' } };
    }
  },

  async signUp(opts: { email: string; password: string; options?: { data?: any } }): Promise<{ data: any; error: any }> {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: opts.email,
          password: opts.password,
          name: opts.options?.data?.name,
          role: opts.options?.data?.role,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        return { data: null, error: { message: json.error || 'Ошибка регистрации' } };
      }

      return {
        data: {
          user: json.data?.user ? {
            id: json.data.user.id,
            email: json.data.user.email,
            user_metadata: {
              name: json.data.user.name,
              role: json.data.user.role,
            },
          } : null,
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async signOut(): Promise<{ error: null }> {
    saveSession(null);
    notifyListeners('SIGNED_OUT', null);
    // Also clear legacy keys
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    }
    return { error: null };
  },

  onAuthStateChange(callback: AuthChangeCallback): { data: { subscription: { unsubscribe: () => void } } } {
    listeners.push(callback);

    // Fire initial event if session exists
    if (currentSession) {
      setTimeout(() => callback('INITIAL_SESSION', currentSession), 0);
    }

    return {
      data: {
        subscription: {
          unsubscribe() {
            listeners = listeners.filter(cb => cb !== callback);
          },
        },
      },
    };
  },

  // Helper used by some admin routes
  admin: {
    async updateUserById(_id: string, _updates: any) {
      // Not needed on frontend — admin ops go through API
      return { data: null, error: { message: 'Admin operations not supported on client' } };
    },
    async createUser(_opts: any) {
      return { data: null, error: { message: 'Admin operations not supported on client' } };
    },
  },
};

// ── Export as drop-in replacement ──

export const supabase = { auth };
export const getSupabaseClient = () => ({ auth });
