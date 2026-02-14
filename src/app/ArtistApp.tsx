import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Music2, Video, Calendar, FileText, FlaskConical,
  Rocket, TrendingUp, Wallet, Settings, LogOut, X, Menu, Coins, DollarSign,
  HelpCircle, MapPin, Star, BadgeCheck, Upload, Bell, Handshake, Search,
  MessageSquare
} from 'lucide-react';

// Components (layout-level only - section components moved to pages/artist-pages.tsx)
import { CoinsModal } from '@/app/components/coins-modal';
import { PublishWizard } from '@/app/components/publish-wizard';
import { ArtistNotificationCenter } from '@/app/components/artist-notification-center';
import { GlobalSearch, useGlobalSearch } from '@/app/components/global-search';
import { OnboardingTour } from '@/app/components/onboarding-tour';
import { Toaster, toast } from 'sonner';
import { PromotedConcert } from '@/app/components/promoted-concerts-sidebar';

// Hooks & API
import { useArtistProfile } from '@/utils/hooks/useArtistProfile';
import { getPromotedConcerts } from '@/utils/api/concerts';
import { getInitials } from '@/utils/api/artist-profile';
import { SSEProvider } from '@/utils/contexts/SSEContext';
import { SSEStatusIndicator } from '@/app/components/sse-status-indicator';
import { SSEPushHandler } from '@/app/components/sse-push-handler';
import { isPushSupported, requestPushPermission } from '@/utils/push-notifications';
import { MessagesProvider, useMessages } from '@/utils/contexts/MessagesContext';
import { DataProvider } from '@/contexts/DataContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { useCabinetSection } from '@/app/hooks/useCabinetSection';

// Assets - unified logo component
import { PromoLogo } from '@/app/components/promo-logo';

// ── Tiny sync bridge: reads MessagesContext unreadTotal and reports to parent ──
function UnreadMessagesSync({ onCount }: { onCount: (n: number) => void }) {
  const msgCtx = useMessages();
  useEffect(() => {
    if (msgCtx) onCount(msgCtx.unreadTotal);
  }, [msgCtx?.unreadTotal, onCount]);
  return null;
}

export default function ArtistApp() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useCabinetSection('artist', 'home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coinsBalance, setCoinsBalance] = useState(1250);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [promotedConcerts, setPromotedConcerts] = useState<PromotedConcert[]>([]);
  const [showPublishWizard, setShowPublishWizard] = useState(false);
  const [publishWizardType, setPublishWizardType] = useState<'video' | 'concert' | undefined>(undefined);

  // Unread messages count for sidebar badge
  const [unreadMessages, setUnreadMessages] = useState(0); // synced from MessagesContext via UnreadMessagesSync

  // Message context for navigating from collabs to messages
  const [messageContext, setMessageContext] = useState<{ userId: string; userName: string } | null>(null);

  // Tour restart
  const [forceTour, setForceTour] = useState(false);

  // Detect mobile for onboarding tour spotlight
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    setIsMobileView(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileView(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Единый хук - загружает профиль и статистику, кэширует, дедуплицирует
  const { profile, firstName, initials, city, genres } = useArtistProfile();

  // Derived user data (мемоизировано, localStorage читается один раз при инициализации)
  const userData = useMemo(() => {
    const name = profile?.fullName || localStorage.getItem('artistName') || 'Артист';
    const email = profile?.email || `${name.toLowerCase().replace(/\s+/g, '.')}@promo.fm`;

    return {
      name,
      email,
      city: profile?.city || city,
      genres: profile?.genres?.length ? profile.genres : genres,
      rating: profile?.rating ?? 0,
      bio: profile?.bio || '',
      isVerified: profile?.isVerified ?? false,
      initials: getInitials(name),
    };
  }, [profile, city, genres]);

  // ID артиста для уведомлений
  const artistUserId = useMemo(() => {
    return profile?.id || localStorage.getItem('artistProfileId') || 'demo-artist';
  }, [profile?.id]);

  // Навигация к заказу из уведомления
  const handleNotificationNavigate = (orderId: string) => {
    setActiveSection('publish');
    setIsSidebarOpen(false);
  };

  // Обновить баланс из профиля (один раз)
  useEffect(() => {
    if (profile?.coinsBalance && profile.coinsBalance > 0) {
      setCoinsBalance(profile.coinsBalance);
    }
  }, [profile?.coinsBalance]);

  // Загрузка промо-концертов
  useEffect(() => {
    getPromotedConcerts()
      .then(setPromotedConcerts)
      .catch((err) => console.error('Failed to load promoted concerts:', err));
  }, []);

  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Главная' },
    { id: 'publish', icon: Upload, label: 'Мои публикации' },
    { id: 'messages', icon: MessageSquare, label: 'Сообщения' },
    { id: 'collaboration', icon: Handshake, label: 'Коллаборации' },
    { id: 'tracks', icon: Music2, label: 'Мои треки' },
    { id: 'video', icon: Video, label: 'Мои видео' },
    { id: 'concerts', icon: Calendar, label: 'Мои концерты' },
    { id: 'news', icon: FileText, label: 'Мои новости' },
    { id: 'track-test', icon: FlaskConical, label: 'Тест трека' },
    { id: 'pitching', icon: Rocket, label: 'Продвижение' },
    { id: 'pricing', icon: DollarSign, label: 'Тарифы' },
    { id: 'analytics', icon: TrendingUp, label: 'Аналитика' },
    { id: 'payments', icon: Wallet, label: 'Финансы' },
    { id: 'support', icon: HelpCircle, label: 'Поддержка' },
    { id: 'settings', icon: Settings, label: 'Настройки' },
  ];

  // Global Search (Cmd+K)
  const globalSearch = useGlobalSearch();

  // Request push permission once
  useEffect(() => {
    if (isPushSupported()) {
      const timer = setTimeout(() => requestPushPermission(), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard shortcut: ? to restart tour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return;
      // Ignore if any modal is open
      if (globalSearch.isOpen || showCoinsModal || showPublishWizard) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setForceTour(true);
        toast('Запускаем обзорный тур по платформе', { icon: '✨', duration: 2500 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearch.isOpen, showCoinsModal, showPublishWizard]);

  return (
    <DataProvider>
    <SubscriptionProvider>
    <SSEProvider userId={artistUserId}>
    <MessagesProvider userId={artistUserId} userName={userData.name} userRole="artist">
    <UnreadMessagesSync onCount={setUnreadMessages} />
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-purple-900 to-[#0a0a14] relative">
      {/* SSE Push Notification Handler (subscribes to SSE context events) */}
      <SSEPushHandler role="artist" />
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveSection('home'); setIsSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="hover:opacity-80 transition-opacity"
          >
            <PromoLogo size="xs" subtitle="MUSIC" animated={false} glowOnHover={false} title="На главную" />
          </button>

          <div className="flex items-center gap-1.5 xs:gap-2">
            {/* Coins badge */}
            <button
              onClick={() => setShowCoinsModal(true)}
              className="flex items-center gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 hover:border-yellow-500/40 transition-colors"
            >
              <Coins className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-yellow-400" />
              <span className="text-[10px] xs:text-xs font-bold text-yellow-200">{coinsBalance.toLocaleString()}</span>
            </button>
            {/* Notification bell (mobile) */}
            <ArtistNotificationCenter
              userId={artistUserId}
              onNavigateToOrder={handleNotificationNavigate}
              onNavigateToHistory={() => { setActiveSection('notifications'); setIsSidebarOpen(false); }}
              compact
            />
            {/* User avatar */}
            <button
              onClick={() => { setActiveSection('settings'); setIsSidebarOpen(false); }}
              className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs xs:text-sm font-bold shadow-md shadow-cyan-500/20"
            >
              {userData.initials}
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
          subtitle="MUSIC"
          animated={false}
          className="mb-8"
          title="На главную"
          onClick={() => { setActiveSection('home'); setIsSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {userData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold truncate">{userData.name}</span>
                {userData.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                )}
              </div>
              {userData.city && (
                <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{userData.city}</span>
                  <SSEStatusIndicator connectedColor="bg-cyan-400" showLabel labelConnectedColor="text-cyan-400" />
                </div>
              )}
            </div>
          </div>

          {/* Rating + Genres */}
          {(userData.rating > 0 || userData.genres.length > 0) && (
            <div className="mb-3 space-y-2">
              {userData.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-300 text-sm font-semibold">{userData.rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-xs">/ 5.0</span>
                </div>
              )}
              {userData.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {userData.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/15 text-cyan-300 rounded-md border border-cyan-500/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Coins Balance */}
          <button
            onClick={() => setShowCoinsModal(true)}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-100 font-semibold">{coinsBalance.toLocaleString()}</span>
              </div>
              <span className="text-yellow-200 text-sm group-hover:scale-105 transition-transform">
                Купить
              </span>
            </div>
          </button>
        </motion.div>

        {/* Publish CTA Button */}
        <button
          onClick={() => {
            setPublishWizardType(undefined);
            setShowPublishWizard(true);
            setIsSidebarOpen(false);
          }}
          className="w-full mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-400 text-white font-bold shadow-lg shadow-[#FF577F]/20 transition-all duration-300 group"
        >
          <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Опубликовать</span>
        </button>

        {/* Desktop Notification Bell */}
        <div className="hidden lg:flex items-center gap-3 mb-4 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <ArtistNotificationCenter
            userId={artistUserId}
            onNavigateToOrder={handleNotificationNavigate}
            onNavigateToHistory={() => { setActiveSection('notifications'); setIsSidebarOpen(false); }}
          />
          <span className="text-sm text-slate-400">Уведомления</span>
        </div>

        {/* Quick Search Button */}
        <button
          onClick={globalSearch.open}
          className="w-full mb-4 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors group"
        >
          <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
          <span className="flex-1 text-sm text-slate-500 text-left">Поиск...</span>
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-slate-600 font-mono">⌘K</kbd>
        </button>

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
                data-tour-step={item.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
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
                <span className="font-medium">{item.label}</span>
                {item.id === 'messages' && unreadMessages > 0 && isActive && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                    {unreadMessages}
                  </span>
                )}
                {isActive && !(item.id === 'messages' && unreadMessages > 0) && (
                  <motion.div
                    layoutId="activeMenuIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {!isActive && item.id === 'messages' && unreadMessages > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20">
                    {unreadMessages}
                  </span>
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
      <div className="lg:ml-72 relative z-0 min-h-screen p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet context={{
              promotedConcerts,
              navigateSection: setActiveSection,
              coinsBalance,
              setCoinsBalance,
              openPublishWizard: (type?: 'video' | 'concert') => { setPublishWizardType(type); setShowPublishWizard(true); },
              handleNotificationNavigate,
              artistUserId,
              userData,
              messageContext,
              setMessageContext,
              setUnreadMessages,
              setForceTour,
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Coins Modal */}
      <AnimatePresence>
        {showCoinsModal && (
          <CoinsModal
            isOpen={showCoinsModal}
            balance={coinsBalance}
            onClose={() => setShowCoinsModal(false)}
            onBalanceUpdate={(newBalance) => {
              setCoinsBalance(newBalance);
              setShowCoinsModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Publish Wizard */}
      <AnimatePresence>
        {showPublishWizard && (
          <PublishWizard
            isOpen={showPublishWizard}
            initialType={publishWizardType}
            onClose={() => setShowPublishWizard(false)}
          />
        )}
      </AnimatePresence>

      {/* Global Search (Cmd+K) */}
      <GlobalSearch
        isOpen={globalSearch.isOpen}
        onClose={globalSearch.close}
        onNavigate={(section) => { setActiveSection(section); setIsSidebarOpen(false); }}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        onNavigate={setActiveSection}
        isMobile={isMobileView}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        forceShow={forceTour}
        onComplete={() => setForceTour(false)}
      />

      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
    </MessagesProvider>
    </SSEProvider>
    </SubscriptionProvider>
    </DataProvider>
  );
}