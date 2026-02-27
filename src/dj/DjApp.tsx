/**
 * DJ APP - Главный файл кабинета диджея
 * Sidebar навигация + роутинг разделов
 * 
 * Цветовая схема: Purple → Violet (фирменный цвет DJ-раздела)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Headphones, Calendar, User, DollarSign,
  BarChart3, Settings, LogOut, X, Menu, Coins, Music,
  Users, Radio, FlaskConical
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

// Shared
import { PromoLogo } from '@/app/components/promo-logo';
import { UnifiedFooter } from '@/app/components/unified-footer';
import { SSEProvider } from '@/utils/contexts/SSEContext';
import { SSEStatusIndicator } from '@/app/components/sse-status-indicator';
import { SSEPushHandler } from '@/app/components/sse-push-handler';
import { ArtistNotificationCenter } from '@/app/components/artist-notification-center';
import { MessagesProvider, useMessages } from '@/utils/contexts/MessagesContext';
import { useNavigate, Outlet } from 'react-router';
import { useCabinetSection } from '@/app/hooks/useCabinetSection';
import { OnboardingWizard } from '@/app/components/onboarding/OnboardingWizard';
import { UniversalOnboardingTour } from '@/app/components/onboarding/UniversalOnboardingTour';
import { useAuth } from "@/contexts/AuthContext";

// ── Tiny sync bridge: reads MessagesContext unreadTotal for sidebar badge ──
function UnreadMessagesSync({ onCount }: { onCount: (n: number) => void }) {
  const msgCtx = useMessages();
  useEffect(() => {
    if (msgCtx) onCount(msgCtx.unreadTotal);
  }, [msgCtx?.unreadTotal, onCount]);
  return null;
}

export default function DjApp() {
  // ── SECURITY: Auth guard — only dj role can access ──
  const { userRole: _gRole, isAuthenticated: _gAuth, isDemoMode: _gDemo, isLoading: _gLoad } = useAuth();
  const _gNav = useNavigate();

  useEffect(() => {
    if (!_gLoad && (!_gAuth || _gDemo || _gRole !== 'dj')) {
      _gNav('/', { replace: true });
    }
  }, [_gLoad, _gAuth, _gDemo, _gRole, _gNav]);

  if (_gLoad) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF577F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!_gAuth || _gDemo || _gRole !== 'dj') return null;

  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useCabinetSection('dj', 'home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coinsBalance] = useState(850);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // DJ User data — читаем из localStorage (каждый DJ уникальный!)
  const djProfileId = localStorage.getItem('djProfileId') || 'dj-1';
  const djName = localStorage.getItem('djName') || 'DJ';
  const djCity = localStorage.getItem('djCity') || '';

  const djData = {
    name: djName,
    email: `${djName.toLowerCase().replace(/\s+/g, '').replace('dj', '')}@promo.fm`,
    initials: djName.slice(0, 2).toUpperCase(),
    city: djCity,
    profileId: djProfileId,
  };

  // Keyboard shortcut: ? to navigate to support (inside settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        sessionStorage.setItem('promo_dj_settings_tab', 'support');
        setActiveSection('settings');
        setIsSidebarOpen(false);
        toast('Открываем раздел поддержки', { icon: '❓', duration: 2000 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Menu structure
  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Обзор' },
    { id: 'profile', icon: User, label: 'Профиль' },
    { id: 'mixes', icon: Headphones, label: 'Миксы' },
    { id: 'bookings', icon: Calendar, label: 'Букинги' },
    { id: 'events', icon: Music, label: 'События' },
    { id: 'promotion', icon: Radio, label: 'Продвижение' },
    { id: 'collaborations', icon: Users, label: 'Коллаборации' },
    { id: 'track-test', icon: FlaskConical, label: 'Тест трека' },
    { id: 'analytics', icon: BarChart3, label: 'Аналитика' },
    { id: 'finances', icon: DollarSign, label: 'Финансы' },
    { id: 'settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <SSEProvider userId={djData.profileId}>
    <MessagesProvider userId={djData.profileId} userName={djData.name} userRole="dj">
    <UnreadMessagesSync onCount={setUnreadMessages} />
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0a1628] to-[#0a0a14] relative">
      {/* Animated background — Purple/Violet DJ theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* SSE Push Notification Handler */}
      <SSEPushHandler role="dj" />

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
          >
            <PromoLogo size="xs" subtitle="DJ СТУДИЯ" promoGradient="from-purple-400 via-violet-400 to-purple-400" animated={false} glowOnHover={false} glowColor="#8b5cf6" title="На главную" />
          </button>

          <div className="flex items-center gap-1.5 xs:gap-2">
            <SSEStatusIndicator connectedColor="bg-purple-400" />
            {/* Notification bell (mobile) */}
            <ArtistNotificationCenter
              userId={djData.profileId}
              onNavigateToOrder={(orderId) => { sessionStorage.setItem('promo_dj_settings_tab', 'notifications'); setActiveSection('settings'); setIsSidebarOpen(false); }}
              onNavigateToHistory={() => { sessionStorage.setItem('promo_dj_settings_tab', 'notifications'); setActiveSection('settings'); setIsSidebarOpen(false); }}
              compact
              unreadMessages={unreadMessages}
            />
            {/* DJ avatar */}
            <button
              onClick={() => { setActiveSection('profile'); setIsSidebarOpen(false); }}
              className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs xs:text-sm font-bold shadow-md shadow-purple-500/20"
            >
              {djData.initials}
            </button>
            {/* Burger */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {isSidebarOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile header spacer */}
      <div className="lg:hidden h-[52px] xs:h-[58px]" />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-[#0a0a14]/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <PromoLogo
          size="md"
          subtitle="DJ СТУДИЯ"
          promoGradient="from-purple-400 via-violet-400 to-purple-400"
          animated={false}
          glowColor="#8b5cf6"
          className="mb-8"
          title="На главную"
          onClick={() => navigate('/')}
        />

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {djData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">{djData.name}</div>
              <div className="text-gray-400 text-sm truncate">{djData.email}</div>
              {djData.city && (
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                  <SSEStatusIndicator connectedColor="bg-purple-400" showLabel labelConnectedColor="text-purple-400" />
                </div>
              )}
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-purple-400" />
              <span className="text-purple-100 font-semibold">{coinsBalance.toLocaleString()}</span>
            </div>
            <span className="text-purple-200 text-sm">Монеты</span>
          </div>
        </motion.div>

        {/* Desktop Notification Bell */}
        <div className="hidden lg:flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer">
          <ArtistNotificationCenter
            userId={djData.profileId}
            onNavigateToOrder={(orderId) => { sessionStorage.setItem('promo_dj_settings_tab', 'notifications'); setActiveSection('settings'); setIsSidebarOpen(false); }}
            onNavigateToHistory={() => { sessionStorage.setItem('promo_dj_settings_tab', 'notifications'); setActiveSection('settings'); setIsSidebarOpen(false); }}
            unreadMessages={unreadMessages}
          />
          <span className="text-sm text-slate-400">Уведомления и сообщения</span>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                whileHover={!isActive ? { x: 4 } : {}}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: isActive ? 0 : 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="flex-shrink-0 relative"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="djActiveMenuIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex-shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </motion.div>
          <span className="font-medium">Выход</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 relative z-0 min-h-screen p-3 xs:p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet context={{ navigateSection: setActiveSection, setUnreadMessages }} />
          </motion.div>
        </AnimatePresence>
        <UnifiedFooter />
      </div>

      <Toaster position="top-right" theme="dark" richColors closeButton />

      {/* Onboarding Wizard (первый вход после регистрации) */}
      <OnboardingWizard
        role="dj"
        onComplete={(data) => {
          if (data.name) localStorage.setItem('djName', data.name);
          if (data.city) localStorage.setItem('djCity', data.city);
        }}
      />

      {/* Onboarding Tour (первый визит в кабинет) */}
      <UniversalOnboardingTour
        role="dj"
        onNavigate={(section) => { setActiveSection(section); setIsSidebarOpen(false); }}
      />
    </div>
    </MessagesProvider>
    </SSEProvider>
  );
}