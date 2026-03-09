/**
 * AUTH CONTEXT
 * Управление авторизацией пользователя через Supabase
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface SignUpResult {
  emailVerificationRequired: boolean;
  accountStatus: 'active' | 'pending';
  message?: string;
}

interface AuthContextType {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = \`https://\${projectId}.supabase.co/functions/v1/server\`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((user: { id: string; email?: string; user_metadata?: Record<string, any> } | null) => {
    if (user) {
      setUserId(user.id);
      setUserEmail(user.email || null);
      setUserName(user.user_metadata?.name || null);
      setUserRole(user.user_metadata?.role || null);
    } else {
      setUserId(null);
      setUserEmail(null);
      setUserName(null);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser]);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(\`\${API_BASE}/auth/signin\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || 'Ошибка входа');
      (error as any).status = response.status;
      (error as any).accountStatus = data.accountStatus;
      throw error;
    }

    // Sign in via Supabase client to establish session
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Sync role to localStorage for RootApp
    if (data.data?.user?.role) {
      localStorage.setItem('userRole', data.data.user.role);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'artist'): Promise<SignUpResult> => {
    const response = await fetch(\`\${API_BASE}/auth/signup\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }

    return {
      emailVerificationRequired: data.emailVerificationRequired ?? true,
      accountStatus: data.accountStatus ?? 'active',
      message: data.message,
    };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
  };

  const requestPasswordReset = async (email: string) => {
    const response = await fetch(\`\${API_BASE}/auth/request-reset\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка отправки');
    }
  };

  const resendVerification = async (email: string) => {
    const response = await fetch(\`\${API_BASE}/auth/resend-verification-by-email\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${publicAnonKey}\`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка отправки');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userEmail,
        userName,
        userRole,
        isAuthenticated: !!userId,
        isLoading,
        signIn,
        signUp,
        signOut,
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
