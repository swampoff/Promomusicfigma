/**
 * APP.TSX - Main entry component for Figma Make
 * Uses React.lazy() for code splitting to avoid loading ALL 250+ modules at once.
 * Only the active view's dependency tree is loaded on demand.
 * Retry wrapper auto-reloads on transient network failures.
 */

import { lazy, Suspense, useState, useCallback } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

// =====================================================
// RETRY WRAPPER - Prevents white screen on transient network errors
// On failure: waits 1.5s then retries once; if still failing, reloads the page
// =====================================================
function lazyRetry<T extends { default: any }>(
  factory: () => Promise<T>,
): React.LazyExoticComponent<T['default']> {
  return lazy(() =>
    factory().catch(() =>
      new Promise<T>((resolve, reject) => {
        setTimeout(() => {
          factory().then(resolve).catch(() => {
            // Second attempt failed - force full reload so Vite re-serves assets
            window.location.reload();
            reject(new Error('Dynamic import failed after retry'));
          });
        }, 1500);
      }),
    ),
  );
}

// =====================================================
// LAZY IMPORTS - Each app loads its dependency tree on demand
// This prevents Vite from resolving all 250+ files during initial import
// =====================================================

// Named exports need .then() wrapper for React.lazy
const PublicApp = lazyRetry(() =>
  import('@/app/PublicApp').then(m => ({ default: m.PublicApp }))
);

const UnifiedLogin = lazyRetry(() =>
  import('@/app/components/unified-login').then(m => ({ default: m.UnifiedLogin }))
);

// Default exports work directly with React.lazy
const ArtistApp = lazyRetry(() => import('@/app/ArtistApp'));
const RadioApp = lazyRetry(() => import('@/radio/RadioApp'));
const VenueApp = lazyRetry(() => import('@/venue/VenueApp'));
const DjApp = lazyRetry(() => import('@/dj/DjApp'));

// Named export
const AdminApp = lazyRetry(() =>
  import('@/admin/AdminApp').then(m => ({ default: m.AdminApp }))
);

// Context providers - SubscriptionProvider and DataProvider only for dashboard
const SubscriptionProvider = lazyRetry(() =>
  import('@/contexts/SubscriptionContext').then(m => ({ default: m.SubscriptionProvider }))
);
const DataProvider = lazyRetry(() =>
  import('@/contexts/DataContext').then(m => ({ default: m.DataProvider }))
);

// =====================================================
// LOADING SPINNER
// =====================================================
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
        <p className="text-white/40 text-sm font-medium tracking-wide">Загрузка...</p>
      </div>
    </div>
  );
}

// =====================================================
// DASHBOARD VIEW - Separated to keep App component clean
// =====================================================
function DashboardView({ 
  userRole, 
  onLogout 
}: { 
  userRole: 'artist' | 'admin' | 'radio_station' | 'venue' | 'dj';
  onLogout: () => void;
}) {
  const renderApp = () => {
    switch (userRole) {
      case 'admin':
        return <AdminApp onLogout={onLogout} />;
      case 'radio_station':
        return <RadioApp onLogout={onLogout} />;
      case 'venue':
        return <VenueApp onLogout={onLogout} />;
      case 'dj':
        return <DjApp onLogout={onLogout} />;
      default:
        return <ArtistApp onLogout={onLogout} />;
    }
  };

  return (
    <SubscriptionProvider>
      <DataProvider>
        {renderApp()}
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </DataProvider>
    </SubscriptionProvider>
  );
}

// =====================================================
// MAIN APP COMPONENT
// =====================================================
type View = 'public' | 'login' | 'dashboard';
type UserRole = 'artist' | 'admin' | 'radio_station' | 'venue' | 'dj';

export default function App() {
  const [view, setView] = useState<View>(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return isAuth ? 'dashboard' : 'public';
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('userRole') as UserRole) || 'artist';
  });

  const handleLoginSuccess = useCallback((role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setView('dashboard');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setView('public');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  }, []);

  const handleShowLogin = useCallback(() => {
    setView('login');
  }, []);

  const handleBackToHome = useCallback(() => {
    setView('public');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          {view === 'public' ? (
            <>
              <PublicApp onLoginClick={handleShowLogin} />
              <Toaster position="top-right" theme="dark" richColors closeButton />
            </>
          ) : (view === 'login' || !isAuthenticated) ? (
            <>
              <UnifiedLogin onLoginSuccess={handleLoginSuccess} onBackToHome={handleBackToHome} />
              <Toaster position="top-right" theme="dark" richColors closeButton />
            </>
          ) : (
            <DashboardView userRole={userRole} onLogout={handleLogout} />
          )}
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}