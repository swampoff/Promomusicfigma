/**
 * ROOT LAYOUT - wraps every route with shared providers and global UI.
 * ErrorBoundary -> AuthProvider -> Suspense -> Outlet + Toaster
 */

import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        <p className="text-white/40 text-sm font-medium">Загрузка...</p>
      </div>
    </div>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 30, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}