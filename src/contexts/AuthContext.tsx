/**
 * AUTH CONTEXT
 * Управление авторизацией через свой JWT + PostgreSQL
 * БЕЗ Supabase — все через VPS API
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
  signUp: (email: string, password: string, name: string, role?: UserRole, consentPersonalData?: boolean, consentNewsletter?: boolean) => Promise<SignUpResult>;
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
    localStorage.removeItem('artistProfileId');
    // Clean up legacy auth keys
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') || key === 'promofm-auth-token') {
        localStorage.removeItem(key);
      }
    }
  };

  const checkSession = async () => {
    try {
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

      // No valid token — demo mode
      enterDemoMode();
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

  const setAuthFromResponse = (userData: any, token: string) => {
    setUserId(userData.id);
    setUserEmail(userData.email || null);
    setUserName(userData.name || null);
    setUserRole(userData.role || 'artist');
    setAccessToken(token);
    setIsDemoMode(false);
    localStorage.setItem('access_token', token);
    localStorage.setItem('artistProfileId', userData.id);
    localStorage.setItem('userRole', userData.role || 'artist');
    localStorage.setItem('userName', userData.name || '');
  };

  const signUp = useCallback(async (
    email: string, password: string, name: string, role: UserRole = 'artist', consentPersonalData = false, consentNewsletter = false
  ): Promise<SignUpResult> => {
    try {
      const res = await fetch(`${SERVER_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, consentPersonalData, consentNewsletter }),
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
      const res = await fetch(`${SERVER_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const errMsg = data.error || 'Ошибка входа';
        if (errMsg.includes('не подтверждён') || data.requiresVerification) {
          return { success: false, error: 'Email не подтверждён. Проверьте почту.', requiresVerification: true };
        }
        if (errMsg.includes('Invalid login') || errMsg.includes('Неверный')) {
          return { success: false, error: 'Неверный email или пароль' };
        }
        return { success: false, error: errMsg };
      }

      if (data.data?.accessToken && data.data?.user) {
        setAuthFromResponse(data.data.user, data.data.accessToken);
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
    const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
    const deviceId = crypto.randomUUID();
    sessionStorage.setItem('vk_code_verifier', codeVerifier);
    sessionStorage.setItem('vk_device_id', deviceId);

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

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
        headers: { 'Content-Type': 'application/json' },
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

      // Server returns JWT directly
      if (data.data?.accessToken && data.data?.user) {
        setAuthFromResponse(data.data.user, data.data.accessToken);
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
