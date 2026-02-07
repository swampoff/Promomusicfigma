#!/usr/bin/env node
/**
 * Pre-build script — автоматически исправляет файлы, которые Figma Make перезаписывает.
 * Vercel запускает это перед каждым билдом: node scripts/pre-build.js && npm run build
 *
 * Figma Make перезаписывает:
 * 1. vite.config.ts — убирает figmaAssetPlugin
 * 2. src/config/environment.ts — возвращает хардкод-ключи
 * 3. src/utils/supabase/info.tsx — возвращает хардкод-ключи
 * 4. src/contexts/AuthContext.tsx — возвращает demo mode
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function writeFile(relPath, content) {
  const fullPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`[pre-build] patched: ${relPath}`);
}

// 1. vite.config.ts — добавляем figmaAssetPlugin если его нет
const viteConfigPath = path.join(ROOT, 'vite.config.ts');
const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
if (!viteConfig.includes('figmaAssetPlugin')) {
  writeFile('vite.config.ts', `import { defineConfig, Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Resolve Figma Make asset imports (figma:asset/...) to src/assets/...
function figmaAssetPlugin(): Plugin {
  return {
    name: 'figma-asset-resolve',
    resolveId(source) {
      if (source.startsWith('figma:asset/')) {
        const filename = source.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`);
} else {
  console.log('[pre-build] vite.config.ts — OK (figmaAssetPlugin present)');
}

// 2. src/config/environment.ts — всегда перезаписываем (безопасная версия)
writeFile('src/config/environment.ts', `/**
 * Environment Configuration
 * Читает credentials из VITE_* переменных окружения
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

const isLocalDocker =
  supabaseUrl.includes('localhost') ||
  import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

export const config = {
  isLocal: isLocalDocker,
  isProduction: !isLocalDocker,
  mode: isLocalDocker ? 'local' : 'production',
  supabaseUrl,
  supabaseAnonKey,
  projectId: projectId || supabaseUrl.replace('https://', '').split('.')[0],
  functionsUrl: \`\${supabaseUrl}/functions/v1\`,
  storageUrl: \`\${supabaseUrl}/storage/v1\`,
};

export default config;
`);

// 3. src/utils/supabase/info.tsx — всегда перезаписываем
writeFile('src/utils/supabase/info.tsx', `/**
 * Supabase project info — читается из environment config
 * Все 38+ файлов импортируют отсюда, API экспорта сохранён
 */
import config from '@/config/environment';

export const projectId = config.projectId;
export const publicAnonKey = config.supabaseAnonKey;
`);

// 4. src/contexts/AuthContext.tsx — убираем demo mode, фиксим импорт
const authPath = path.join(ROOT, 'src/contexts/AuthContext.tsx');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf-8');
  if (authContent.includes('demo-user-123') || authContent.includes("from '/utils/supabase/info'")) {
    writeFile('src/contexts/AuthContext.tsx', `/**
 * AUTH CONTEXT
 * Управление авторизацией пользователя
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface AuthContextType {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((user: { id: string; email?: string; user_metadata?: Record<string, any> } | null) => {
    if (user) {
      setUserId(user.id);
      setUserEmail(user.email || null);
      setUserName(user.user_metadata?.name || null);
    } else {
      setUserId(null);
      setUserEmail(null);
      setUserName(null);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch(
      \`https://\${projectId}.supabase.co/functions/v1/make-server-84730125/auth/signup\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${publicAnonKey}\`,
        },
        body: JSON.stringify({ email, password, name }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Sign up failed');
    }

    await signIn(email, password);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userEmail,
        userName,
        isAuthenticated: !!userId,
        isLoading,
        signIn,
        signUp,
        signOut,
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
`);
  } else {
    console.log('[pre-build] AuthContext.tsx — OK (no demo mode)');
  }
}

console.log('[pre-build] done!');
