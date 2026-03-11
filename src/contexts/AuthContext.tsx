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
  };

  const checkSession = async () => {
    try {
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
      signIn, signUp, signOut,
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
