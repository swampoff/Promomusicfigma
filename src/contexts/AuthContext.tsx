/**
 * AUTH CONTEXT
 * Управление авторизацией пользователя через Supabase Auth
 * Поддержка реальной и демо авторизации
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '/utils/supabase/info';

type UserRole = 'artist' | 'dj' | 'admin' | 'radio_station' | 'venue' | 'producer';

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
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('artist');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Слушаем изменения auth-состояния от Supabase
  useEffect(() => {
    // Проверить активную сессию при загрузке
    checkSession();

    // Подписка на auth events
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
        console.log('[Auth] Session restored for:', session.user.email);
      } else {
        // Нет активной сессии - включаем демо-режим
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
    setUserId('demo-user-123');
    setUserEmail('demo@promo.music');
    setUserName('Demo Artist');
    setUserRole('artist');
    setAccessToken(null);
    setIsDemoMode(true);
  };

  /**
   * Регистрация нового пользователя
   * Использует серверный endpoint с admin API
   */
  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: UserRole = 'artist'
  ): Promise<{ success: boolean; error?: string }> => {
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
        const errorMsg = result.error || 'Ошибка регистрации';
        console.error('Sign up error:', errorMsg);
        return { success: false, error: errorMsg };
      }

      // После успешной регистрации - автоматический вход
      const signInResult = await signIn(email, password);
      return signInResult;

    } catch (error: any) {
      console.error('Sign up network error:', error);
      return { success: false, error: `Ошибка сети при регистрации: ${error.message}` };
    }
  }, []);

  /**
   * Вход в систему через Supabase Auth
   * Клиентский вход + серверная синхронизация профиля
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
        console.error('Sign in error:', error);
        let errorMsg = error.message;
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = 'Неверный email или пароль';
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMsg = 'Email не подтверждён';
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

        console.log('[Auth] Signed in:', email);
        return { success: true };
      }

      return { success: false, error: 'Неизвестная ошибка входа' };
    } catch (error: any) {
      console.error('Sign in network error:', error);
      return { success: false, error: `Ошибка сети при входе: ${error.message}` };
    }
  }, []);

  /**
   * Выход из системы
   */
  const signOut = useCallback(async () => {
    try {
      // Серверный signout (fire and forget)
      if (accessToken) {
        fetch(`${SERVER_BASE}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }).catch(() => {});
      }

      await supabase.auth.signOut();
      clearAuthState();

      // Переход в демо-режим после выхода
      enterDemoMode();

      console.log('[Auth] Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      clearAuthState();
      enterDemoMode();
    }
  }, [accessToken]);

  /**
   * Явный переход в демо-режим
   */
  const setDemoMode = useCallback(() => {
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
        isAuthenticated: !!userId && !isDemoMode,
        isDemoMode,
        isLoading,
        signIn,
        signUp,
        signOut,
        setDemoMode,
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