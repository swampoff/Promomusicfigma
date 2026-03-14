/**
 * AUTH CONTEXT
 * Управление авторизацией через Supabase Auth
 * Демо-режим для незалогиненных, реальная авторизация через Edge Functions
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

type UserRole = 'artist' | 'dj' | 'admin' | 'radio_station' | 'venue' | 'producer';

interface SignUpResult {
  success: boolean;
  error?: string;
  emailVerificationRequired?: boolean;
  accountStatus?: 'active' | 'pending';
  message?: string;
}

interface SignInResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

interface VkAuthResult {
  success: boolean;
  error?: string;
  newUser?: boolean;
}

interface AuthContextType {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: UserRole;
  accessToken: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<SignUpResult>;
  signInWithVK: () => void;
  handleVKCallback: (code: string, deviceId: string) => Promise<VkAuthResult>;
  signOut: () => Promise<void>;
  setDemoMode: () => void;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import config from '@/config/environment';
const SERVER_BASE = config.functionsUrl;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('artist');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          setUserEmail(session.user.email || null);
          setUserName(session.user.user_metadata?.name || null);
          setUserRole(session.user.user_metadata?.role || 'artist');
          setAccessToken(session.access_token);
          setIsDemoMode(false);
        } else if (event === 'SIGNED_OUT') {
          clearAuthState();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAccessToken(session.access_token);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const clearAuthState = () => {
    setUserId(null);
    setUserEmail(null);
    setUserName(null);
    setUserRole('artist');
    setAccessToken(null);
    setIsDemoMode(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  };

  const checkSession = async () => {
    try {
      // 1. Check our own JWT first (VPS auth)
      const savedToken = localStorage.getItem('access_token');
      if (savedToken) {
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          // Check expiry
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            setUserId(payload.sub);
            setUserEmail(payload.email || null);
            setUserName(localStorage.getItem('userName') || payload.email?.split('@')[0] || null);
            setUserRole((localStorage.getItem('userRole') as UserRole) || payload.role || 'artist');
            setAccessToken(savedToken);
            setIsDemoMode(false);
            setIsLoading(false);
            return;
          } else {
            // Token expired — clean up
            localStorage.removeItem('access_token');
          }
        } catch { /* invalid token, continue */ }
      }

      // 2. Fallback: check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        setUserName(session.user.user_metadata?.name || null);
        setUserRole(session.user.user_metadata?.role || 'artist');
        setAccessToken(session.access_token);
        setIsDemoMode(false);
      } else {
        enterDemoMode();
      }
    } catch {
      enterDemoMode();
    } finally {
      setIsLoading(false);
    }
  };

  const enterDemoMode = () => {
    setUserId(null);
    setUserEmail(null);
    setUserName(null);
    setUserRole('artist');
    setAccessToken(null);
    setIsDemoMode(true);
  };

  const signUp = useCallback(async (
    email: string, password: string, name: string, role: UserRole = 'artist'
  ): Promise<SignUpResult> => {
    try {
      const res = await fetch(`${SERVER_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Ошибка регистрации' };
      }
      return {
        success: true,
        emailVerificationRequired: data.emailVerificationRequired ?? true,
        accountStatus: data.accountStatus ?? 'active',
        message: data.message,
      };
    } catch (err: any) {
      return { success: false, error: `Ошибка сети: ${err.message}` };
    }
  }, []);

  const signIn = useCallback(async (
    email: string, password: string
  ): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message;
        if (msg.includes('Email not confirmed')) {
          return { success: false, error: 'Email не подтверждён. Проверьте почту.', requiresVerification: true };
        }
        if (msg.includes('Invalid login credentials')) {
          return { success: false, error: 'Неверный email или пароль' };
        }
        return { success: false, error: msg };
      }
      if (data.session?.user) {
        setUserId(data.session.user.id);
        setUserEmail(data.session.user.email || null);
        setUserName(data.session.user.user_metadata?.name || null);
        setUserRole(data.session.user.user_metadata?.role || 'artist');
        setAccessToken(data.session.access_token);
        localStorage.setItem('access_token', data.session.access_token);
        localStorage.setItem('userRole', data.session.user.user_metadata?.role || 'artist');
        localStorage.setItem('userName', data.session.user.user_metadata?.name || '');
        setIsDemoMode(false);
        // Server sync (fire and forget)
        fetch(`${SERVER_BASE}/auth/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ email, password }),
        }).catch(() => {});
        return { success: true };
      }
      return { success: false, error: 'Неизвестная ошибка' };
    } catch (err: any) {
      return { success: false, error: `Ошибка сети: ${err.message}` };
    }
  }, []);

  const verifyEmail = useCallback(async (
    token: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${SERVER_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Недействительная ссылка' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `Ошибка сети: ${err.message}` };
    }
  }, []);

  const requestPasswordReset = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${SERVER_BASE}/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Ошибка' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `Ошибка сети: ${err.message}` };
    }
  }, []);

  const resendVerification = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${SERVER_BASE}/auth/resend-verification-by-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Ошибка' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: `Ошибка сети: ${err.message}` };
    }
  }, []);

  // ── VK OAuth ──
  const VK_APP_ID = import.meta.env.VITE_VK_APP_ID || '';
  const VK_REDIRECT_URI = `${window.location.origin}/login`;

  const signInWithVK = useCallback(async () => {
    // Generate PKCE code_verifier and S256 challenge
    const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
    const deviceId = crypto.randomUUID();
    sessionStorage.setItem('vk_code_verifier', codeVerifier);
    sessionStorage.setItem('vk_device_id', deviceId);

    // S256: code_challenge = base64url(sha256(code_verifier))
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    // Build VK ID OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: VK_APP_ID,
      redirect_uri: VK_REDIRECT_URI,
      scope: 'vkid.personal_info email',
      state: 'vk_auth',
      code_challenge: codeChallenge,
      code_challenge_method: 's256',
      device_id: deviceId,
    });

    window.location.href = `https://id.vk.com/authorize?${params.toString()}`;
  }, []);

  const handleVKCallback = useCallback(async (code: string, deviceId: string): Promise<VkAuthResult> => {
    try {
      const codeVerifier = sessionStorage.getItem('vk_code_verifier') || '';
      sessionStorage.removeItem('vk_code_verifier');
      sessionStorage.removeItem('vk_device_id');

      const selectedRole = sessionStorage.getItem('vk_selected_role') || 'artist';
      const res = await fetch(`${SERVER_BASE}/auth/vk-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({
          code,
          redirect_uri: VK_REDIRECT_URI,
          code_verifier: codeVerifier,
          device_id: deviceId,
          role: selectedRole,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Ошибка VK авторизации' };
      }

      // Use JWT token from our backend
      if (data.data?.accessToken) {
        localStorage.setItem('access_token', data.data.accessToken);
        setAccessToken(data.data.accessToken);
        const userData = data.data.user;
        if (userData) {
          setUserId(userData.id);
          setUserEmail(userData.email || null);
          setUserName(userData.name || null);
          setUserRole(userData.role || 'artist');
          localStorage.setItem('artistProfileId', userData.id);
          localStorage.setItem('userRole', userData.role || 'artist');
          localStorage.setItem('userName', userData.name || '');
        }
        return { success: true, newUser: data.newUser };
      }

      return { success: false, error: 'Не удалось создать сессию' };
    } catch (err: any) {
      return { success: false, error: `Ошибка сети: ${err.message}` };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (accessToken) {
        fetch(`${SERVER_BASE}/auth/signout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});
      }
      await supabase.auth.signOut();
      clearAuthState();
      enterDemoMode();
    } catch {
      clearAuthState();
      enterDemoMode();
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{
      userId, userEmail, userName, userRole, accessToken,
      isAuthenticated: !!userId && !isDemoMode && !!accessToken,
      isDemoMode, isLoading,
      signIn, signUp, signInWithVK, handleVKCallback, signOut,
      setDemoMode: useCallback(() => enterDemoMode(), []),
      verifyEmail, requestPasswordReset, resendVerification,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
