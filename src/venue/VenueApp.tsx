/**
 * VENUE APP - Кабинет заведения
 * Enterprise-модуль для управления заведением (ресторан, бар, кафе и т.д.)
 * 
 * Функционал:
 * - Управление музыкой и плейлистами
 * - Подписки и платежи
 * - Букинг артистов/DJ
 * - Интеграция с радио
 * - Модерация контента
 * - Аналитика посещаемости
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music, Home, Calendar, Radio, Star, BarChart3, Building2,
  Bell, Menu, X, LogOut, ChevronLeft, ChevronRight, Settings, Play,
  UserCheck, TrendingUp
} from 'lucide-react';
import { WorkspaceSwitcher } from '@/app/components/workspace-switcher';
import { VenuePlayerProvider } from './contexts/VenuePlayerContext';
import { VenuePlayer } from './components/venue-player';
import { PROMO_LOGO } from '@/constants/assets';

// Import sections
import { VenueDashboard } from '@/venue/components/venue-dashboard';
import { RadioBrand } from '@/venue/components/radio-brand';
import { SubscriptionSection } from '@/venue/components/subscription-section';
import { NotificationsSection } from '@/venue/components/notifications-section';
import { BookingSection } from '@/venue/components/booking-section';
import { RadioSection } from '@/venue/components/radio-section';
import { AnalyticsSection } from '@/venue/components/analytics-section';
// import { VenueProfileSection } from '@/venue/components/venue-profile-section';

type VenueSection = 
  | 'dashboard'
  | 'radio-brand'
  | 'booking'
  | 'radio-integration'
  | 'subscription'
  | 'analytics'
  | 'profile'
  | 'notifications';

interface VenueAppProps {
  onLogout: () => void;
}

export default function VenueApp({ onLogout }: VenueAppProps) {
  const [activeSection, setActiveSection] = useState<VenueSection>('dashboard');

  return (
    <VenuePlayerProvider>
      <VenueAppContent 
        onLogout={onLogout} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <VenuePlayer onPlayerClick={() => setActiveSection('radio-brand')} />
    </VenuePlayerProvider>
  );
}

interface VenueAppContentProps {
  onLogout: () => void;
  activeSection: VenueSection;
  setActiveSection: (section: VenueSection) => void;
}

function VenueAppContent({ onLogout, activeSection, setActiveSection }: VenueAppContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock данные заведения (потом заменить на реальные из Supabase)
  const venueData = {
    name: 'Sunset Lounge Bar',
    type: 'Бар',
    address: 'Москва, ул. Тверская, 15',
    status: 'Online',
    isPlaying: true,
    currentPlaylist: 'Вечерний джаз',
    initials: 'SL',
    logoUrl: undefined,
    subscriptionPlan: 'Профессиональный',
    subscriptionStatus: 'active'
  };

  interface MenuItem {
    id: VenueSection;
    icon: any;
    label: string;
    badge?: string | number;
  }

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: Home, label: 'Главная' },
    { id: 'radio-brand', icon: Music, label: 'Музыка', badge: 'Playing' },
    { id: 'booking', icon: UserCheck, label: 'Букинг артистов' },
    { id: 'radio-integration', icon: Radio, label: 'Радио' },
    { id: 'subscription', icon: Star, label: 'Подписка' },
    { id: 'analytics', icon: BarChart3, label: 'Аналитика' },
    { id: 'notifications', icon: Bell, label: 'Уведомления', badge: 3 },
    { id: 'profile', icon: Building2, label: 'Профиль' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <VenueDashboard />;
      case 'radio-brand':
        return <RadioBrand />;
      case 'booking':
        return <BookingSection />;
      case 'radio-integration':
        return <RadioSection />;
      case 'subscription':
        return <SubscriptionSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'profile':
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-4">Профиль заведения</h2>
            <p className="text-slate-400">Настройки профиля...</p>
          </div>
        );
      case 'notifications':
        return <NotificationsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[150] w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

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
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
            <img src={PROMO_LOGO} alt="promo.music" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">PROMO.MUSIC</h1>
            <p className="text-xs text-indigo-300">Venue Cabinet</p>
          </div>
        </div>

        {/* Venue Profile Card */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setActiveSection('profile');
            setIsSidebarOpen(false);
          }}
          className="w-full mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            {venueData.logoUrl ? (
              <img src={venueData.logoUrl} alt={venueData.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {venueData.initials}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <div className="text-white font-semibold truncate">{venueData.name}</div>
              <div className="text-gray-400 text-sm truncate">{venueData.type}</div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              venueData.status === 'Online' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                venueData.status === 'Online' ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
              {venueData.status}
            </div>
            
            {venueData.isPlaying && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                <Play className="w-3 h-3" />
                Playing
              </div>
            )}
          </div>

          {venueData.isPlaying && (
            <div className="mt-2 text-xs text-slate-400 truncate">
              🎵 {venueData.currentPlaylist}
            </div>
          )}
        </motion.button>

        {/* Workspace Switcher */}
        <div className="mb-6">
          <WorkspaceSwitcher 
            currentWorkspace="venue" 
            onSwitch={() => {}} 
          />
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  item.badge === 'Playing'
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Subscription Status */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">
                {venueData.subscriptionPlan}
              </span>
            </div>
            <p className="text-xs text-slate-400">Активна до 03.03.2026</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}