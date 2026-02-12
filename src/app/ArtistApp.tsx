import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Music2, Video, Calendar, FileText, FlaskConical,
  Rocket, TrendingUp, Wallet, Settings, LogOut, X, Menu, Coins, DollarSign,
  HelpCircle, MapPin, Star, BadgeCheck, Upload, Bell
} from 'lucide-react';

// Components
import { HomePage } from '@/app/components/home-page';
import { TracksPage } from '@/app/components/tracks-page';
import { VideoPage } from '@/app/components/video-page';
import { MyConcertsPage } from '@/app/components/my-concerts-page';
import { NewsPage } from '@/app/components/news-page';
import TrackTestPage from '@/app/pages/TrackTestPage';
import { PitchingPage } from '@/app/components/pitching-page';
import { AnalyticsPage } from '@/app/components/analytics-page';
import { PaymentsPage } from '@/app/components/payments-page';
import { FinancesPage } from '@/app/components/finances-page';
import { SettingsPage } from '@/app/components/settings-page';
import { PricingPage } from '@/app/components/pricing-page';
import { SupportPage } from '@/app/components/support-page';
import { CoinsModal } from '@/app/components/coins-modal';
import { PublishWizard } from '@/app/components/publish-wizard';
import { PublishOrdersPage } from '@/app/components/publish-orders-page';
import { ArtistNotificationCenter } from '@/app/components/artist-notification-center';
import { NotificationHistoryPage } from '@/app/components/notification-history-page';
import { Toaster } from 'sonner';
import { PromotedConcert } from '@/app/components/promoted-concerts-sidebar';

// Hooks & API
import { useArtistProfile } from '@/utils/hooks/useArtistProfile';
import { getPromotedConcerts } from '@/utils/api/concerts';
import { getInitials } from '@/utils/api/artist-profile';

// Assets
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

interface ArtistAppProps {
  onLogout: () => void;
}

export default function ArtistApp({ onLogout }: ArtistAppProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coinsBalance, setCoinsBalance] = useState(1250);
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [promotedConcerts, setPromotedConcerts] = useState<PromotedConcert[]>([]);
  const [showPublishWizard, setShowPublishWizard] = useState(false);
  const [publishWizardType, setPublishWizardType] = useState<'video' | 'concert' | undefined>(undefined);

  // Единый хук — загружает профиль и статистику, кэширует, дедуплицирует
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
    { id: 'notifications', icon: Bell, label: 'Уведомления' },
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

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage promotedConcerts={promotedConcerts} onNavigate={setActiveSection} />;
      case 'publish':
        return <PublishOrdersPage onPublish={() => { setPublishWizardType(undefined); setShowPublishWizard(true); }} />;
      case 'notifications':
        return <NotificationHistoryPage onNavigateToOrder={handleNotificationNavigate} />;
      case 'tracks':
        return <TracksPage />;
      case 'video':
        return <VideoPage />;
      case 'concerts':
        return <MyConcertsPage />;
      case 'news':
        return <NewsPage />;
      case 'track-test':
        return <TrackTestPage />;
      case 'pitching':
        return <PitchingPage userCoins={coinsBalance} onCoinsUpdate={setCoinsBalance} />;
      case 'pricing':
        return <PricingPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'payments':
        return <FinancesPage />;
      case 'support':
        return <SupportPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage promotedConcerts={promotedConcerts} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-gray-900/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveSection('home'); setIsSidebarOpen(false); }}
            className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={promoLogo} alt="Promo.music" className="h-8 xs:h-10 w-auto object-contain" />
            <div className="flex flex-col -space-y-0.5">
              <span className="text-[18px] xs:text-[22px] font-black tracking-tight leading-none bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent">
                PROMO
              </span>
              <span className="text-[9px] xs:text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">
                MUSIC
              </span>
            </div>
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
        className={`fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-gray-900/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <button
          onClick={() => { setActiveSection('home'); setIsSidebarOpen(false); }}
          className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity cursor-pointer group"
        >
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
            <img src={promoLogo} alt="promo.music" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col -space-y-0.5">
            <span className="text-[22px] font-black tracking-tight leading-none bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent">
              PROMO
            </span>
            <span className="text-[9px] font-bold text-white/60 tracking-[0.2em] uppercase">
              MUSIC
            </span>
          </div>
        </button>

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

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выход</span>
        </button>
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
            {renderContent()}
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

      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
  );
}