/**
 * ROOT APP - Главный файл приложения с роутингом
 * 
 * АРХИТЕКТУРА:
 * 1. Публичная часть (БЕЗ авторизации) → PublicApp → Promo.Guide
 * 2. Приватная часть (С авторизацией) → По ролям: Artist, Venue, Radio, Admin
 */

import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { DataProvider } from '@/contexts/DataContext';
import { UnifiedLogin } from '@/app/components/unified-login';
import { PublicApp } from '@/app/PublicApp';
import ArtistApp from '@/app/ArtistApp';
import { AdminApp } from '@/admin/AdminApp';
import RadioApp from '@/radio/RadioApp';
import VenueApp from '@/venue/VenueApp';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';

export default function App() {
  // View state: 'public' = Promo.Guide (без логина), 'login' = форма логина, 'dashboard' = кабинет
  const [view, setView] = useState<'public' | 'login' | 'dashboard'>(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return isAuth ? 'dashboard' : 'public';
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    if (import.meta.env.DEV) {
      console.log('🔐 Initial auth state:', auth);
    }
    return auth;
  });
  
  const [userRole, setUserRole] = useState<'artist' | 'admin' | 'radio_station' | 'venue'>(() => {
    const role = (localStorage.getItem('userRole') as 'artist' | 'admin' | 'radio_station' | 'venue') || 'artist';
    if (import.meta.env.DEV) {
      console.log('👤 Initial user role:', role);
    }
    return role;
  });

  // Handle login success
  const handleLoginSuccess = (role: 'artist' | 'admin' | 'radio_station' | 'venue') => {
    if (import.meta.env.DEV) {
      console.log('✅ Login success, role:', role);
    }
    setIsAuthenticated(true);
    setUserRole(role);
    setView('dashboard');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
  };

  // Handle logout
  const handleLogout = () => {
    if (import.meta.env.DEV) {
      console.log('👋 Logout triggered');
    }
    setIsAuthenticated(false);
    setView('public');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  // Handle login click from public
  const handleShowLogin = () => {
    setView('login');
  };

  // Handle back to home from login
  const handleBackToHome = () => {
    setView('public');
  };

  if (import.meta.env.DEV) {
    console.log('🎯 Current state - View:', view, 'Auth:', isAuthenticated, 'Role:', userRole);
  }

  // PUBLIC VIEW (без авторизации) - Promo.Guide
  if (view === 'public') {
    if (import.meta.env.DEV) {
      console.log('🌍 Showing PublicApp (Promo.Guide)');
    }
    return (
      <ErrorBoundary>
        <PublicApp onLoginClick={handleShowLogin} />
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </ErrorBoundary>
    );
  }

  // LOGIN VIEW
  if (view === 'login' || !isAuthenticated) {
    if (import.meta.env.DEV) {
      console.log('🔒 Showing login screen');
    }
    return (
      <ErrorBoundary>
        <UnifiedLogin onLoginSuccess={handleLoginSuccess} onBackToHome={handleBackToHome} />
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </ErrorBoundary>
    );
  }

  // DASHBOARD VIEW (авторизованные пользователи) - Route based on role
  if (import.meta.env.DEV) {
    console.log('🚀 Rendering app for role:', userRole);
  }
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <DataProvider>
            {userRole === 'admin' ? (
              <>
                {import.meta.env.DEV && console.log('🔵 Loading AdminApp')}
                <AdminApp onLogout={handleLogout} />
              </>
            ) : userRole === 'radio_station' ? (
              <>
                {import.meta.env.DEV && console.log('🎙️ Loading RadioApp')}
                <RadioApp onLogout={handleLogout} />
              </>
            ) : userRole === 'venue' ? (
              <>
                {import.meta.env.DEV && console.log('📍 Loading VenueApp')}
                <VenueApp onLogout={handleLogout} />
              </>
            ) : (
              <>
                {import.meta.env.DEV && console.log('🟢 Loading ArtistApp')}
                <ArtistApp onLogout={handleLogout} />
              </>
            )}
            <Toaster position="top-right" theme="dark" richColors closeButton />
          </DataProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}