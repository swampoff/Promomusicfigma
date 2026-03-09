/**
 * AUTH CONTEXT
 * Управление авторизацией пользователя через Supabase Auth
 * Поддержка реальной и демо авторизации
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

interface AuthContextType {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: UserRole;
  accessToken: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  setDemoMode: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

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

    return () => {
      subscription.unsubscribe();
    };
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
    } catch (error) {
      console.error('Auth session check error:', error);
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

  /**
   * Регистрация нового пользователя.
   * НЕ выполняет автоматический вход — требуется подтверждение email.
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: UserRole = 'artist'
  ): Promise<SignUpResult> => {
    try {
      const response = await fetch(`${SERVER_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Ошибка регистрации' };
      }

      return {
        success: true,
        emailVerificationRequired: result.emailVerificationRequired ?? true,
        accountStatus: result.accountStatus ?? 'active',
        message: result.message,
      };

    } catch (error: any) {
      return { success: false, error: `Ошибка сети: ${error.message}` };
    }
  }, []);

  /**
   * Вход через Supabase Auth + серверная синхронизация
   */
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMsg = error.message;
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = 'Неверный email или пароль';
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMsg = 'Email не подтверждён. Проверьте почту.';
        }
        return { success: false, error: errorMsg };
      }

      if (data.session?.user) {
        setUserId(data.session.user.id);
        setUserEmail(data.session.user.email || null);
        setUserName(data.session.user.user_metadata?.name || null);
        setUserRole(data.session.user.user_metadata?.role || 'artist');
        setAccessToken(data.session.access_token);
        setIsDemoMode(false);

        // Серверная синхронизация (fire and forget)
        fetch(`${SERVER_BASE}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }).catch(err => console.warn('Server signin sync failed:', err));

        return { success: true };
      }

      return { success: false, error: 'Неизвестная ошибка входа' };
    } catch (error: any) {
      return { success: false, error: `Ошибка сети: ${error.message}` };
    }
  }, []);

  /**
   * Запрос сброса пароля
   */
  const requestPasswordReset = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${SERVER_BASE}/auth/request-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Ошибка отправки' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: `Ошибка сети: ${error.message}` };
    }
  }, []);

  /**
   * Повторная отправка письма для подтверждения email
   */
  const resendVerification = useCallback(async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${SERVER_BASE}/auth/resend-verification-by-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Ошибка отправки' };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: `Ошибка сети: ${error.message}` };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (accessToken) {
        fetch(`${SERVER_BASE}/auth/signout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }).catch(() => {});
      }

      await supabase.auth.signOut();
      clearAuthState();
      enterDemoMode();
    } catch (error) {
      console.error('Sign out error:', error);
      clearAuthState();
      enterDemoMode();
    }
  }, [accessToken]);

  const setDemoModeCallback = useCallback(() => {
    enterDemoMode();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        userEmail,
        userName,
        userRole,
        accessToken,
        isAuthenticated: !!userId && !isDemoMode && !!accessToken,
        isDemoMode,
        isLoading,
        signIn,
        signUp,
        signOut,
        setDemoMode: setDemoModeCallback,
        requestPasswordReset,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
