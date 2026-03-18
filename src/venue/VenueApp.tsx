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

import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music, Home, Calendar, Radio, Star, BarChart3, Building2,
  Bell, Menu, X, LogOut, ChevronLeft, ChevronRight, Settings, Play,
  UserCheck, TrendingUp, Camera, MessageSquare
} from 'lucide-react';
import { VenuePlayerProvider, useVenuePlayer } from './contexts/VenuePlayerContext';
import { VenuePlayer } from './components/venue-player';
import { PromoLogo } from '@/app/components/promo-logo';
import { UnifiedFooter } from '@/app/components/unified-footer';
import { SSEProvider } from '@/utils/contexts/SSEContext';
import { SSEStatusIndicator } from '@/app/components/sse-status-indicator';
import { SSEPushHandler } from '@/app/components/sse-push-handler';
import { MessagesProvider, useMessages } from '@/utils/contexts/MessagesContext';
import { toast } from 'sonner';
import { useCabinetSection } from '@/app/hooks/useCabinetSection';
import { OnboardingWizard } from '@/app/components/onboarding/OnboardingWizard';
import { UniversalOnboardingTour } from '@/app/components/onboarding/UniversalOnboardingTour';
import { useAuth } from "@/contexts/AuthContext";

type VenueSection = 
  | 'dashboard'
  | 'radio-brand'
  | 'booking'
  | 'radio-integration'
  | 'subscription'
  | 'analytics'
  | 'messages'
  | 'profile'
  | 'notifications';

export default function VenueApp() {
  // ── ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN ──
  const { userRole: _gRole, isAuthenticated: _gAuth, isDemoMode: _gDemo, isLoading: _gLoad, userId: _gUserId, userEmail: _gEmail, userName: _gName } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useCabinetSection('venue', 'dashboard');

  // Sync userId to localStorage
  useEffect(() => {
    if (_gUserId && !_gDemo) {
      localStorage.setItem('venueProfileId', _gUserId);
    }
  }, [_gUserId, _gDemo]);

  // Auth guard redirect
  useEffect(() => {
    if (!_gLoad && (!_gAuth || _gDemo || _gRole !== 'venue')) {
      navigate('/login', { replace: true });
    }
  }, [_gLoad, _gAuth, _gDemo, _gRole, navigate]);

  // ── CONDITIONAL RETURNS (after all hooks) ──
  if (_gLoad) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF577F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!_gAuth || _gDemo || _gRole !== 'venue') return null;

  return (
    <VenuePlayerProvider>
      <SSEProvider userId={_gUserId || 'venue-1'}>
        <MessagesProvider userId={_gUserId || 'venue-1'} userName={localStorage.getItem('venueName') || _gName || 'Заведение'} userRole="venue">
          <VenueAppContent 
            onLogout={() => navigate('/')} 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <VenuePlayer onPlayerClick={() => setActiveSection('radio-brand')} />
        </MessagesProvider>
      </SSEProvider>
    </VenuePlayerProvider>
  );
}

interface VenueAppContentProps {
  onLogout: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

function VenueAppContent({ onLogout, activeSection, setActiveSection }: VenueAppContentProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const msgCtx = useMessages();
  const unreadMessages = msgCtx?.unreadTotal || 0;

  // Keyboard shortcut: ? to navigate to notifications
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setActiveSection('notifications');
        setSidebarOpen(false);
        toast('Открываем уведомления', { icon: '❓', duration: 2000 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const venueName = localStorage.getItem('venueName') || 'Заведение';
  const [venueData, setVenueData] = useState({
    name: venueName,
    type: localStorage.getItem('venueType') || '',
    address: localStorage.getItem('venueAddress') || '',
    initials: venueName.substring(0, 2).toUpperCase(),
    logoUrl: undefined as string | undefined,
    subscriptionPlan: '',
    subscriptionStatus: 'active'
  });

  const player = useVenuePlayer();
  
  // ДИНАМИЧЕСКИЙ СТАТУС НА ОСНОВЕ ПЛЕЕРА
  const venueStatus = player.isPlaying 
    ? 'В сети'
    : 'Не в сети';

  // Callback для обновления профиля из VenueProfileSection
  const handleProfileUpdate = (updatedProfile: any) => {
    setVenueData(prev => ({
      ...prev,
      name: updatedProfile.venueName || prev.name,
      logoUrl: updatedProfile.logoUrl || prev.logoUrl,
      initials: updatedProfile.venueName?.substring(0, 2).toUpperCase() || prev.initials
    }));
  };

  // Функция для загрузки аватара через клик на фото
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Не открываем профиль при клике на аватар
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Проверка размера (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      // Проверка типа
      if (!file.type.startsWith('image/')) {
        toast.error('Можно загружать только изображения');
        return;
      }

      // Читаем файл как Data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Обновляем аватар
        setVenueData(prev => ({
          ...prev,
          logoUrl: imageUrl
        }));
        
        // TODO: В production загружать на сервер
        // const { data, error } = await authClient.storage
        //   .from('venue-images')
        //   .upload(`${venueId}/logo-${Date.now()}.${file.name.split('.').pop()}`, file);
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  interface MenuItem {
    id: VenueSection;
    icon: any;
    label: string;
    badge?: string | number;
  }

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: Home, label: 'Главная' },
    { id: 'radio-brand', icon: Music, label: 'Музыка', badge: player.isPlaying ? 'Воспроизведение' : undefined },
    { id: 'booking', icon: UserCheck, label: 'Букинг артистов' },
    { id: 'radio-integration', icon: Radio, label: 'Радио' },
    { id: 'subscription', icon: Star, label: 'Подписка' },
    { id: 'analytics', icon: BarChart3, label: 'Аналитика' },
    { id: 'messages', icon: MessageSquare, label: 'Сообщения', badge: unreadMessages > 0 ? unreadMessages : undefined },
    { id: 'notifications', icon: Bell, label: 'Уведомления' },
    { id: 'profile', icon: Building2, label: 'Профиль' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-indigo-950 to-[#0a0a14] relative">
      <SSEPushHandler role="venue" />
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
          >
            <PromoLogo size="xs" subtitle="ПЛОЩАДКА" subtitleColor="text-indigo-300" animated={false} glowOnHover={false} glowColor="#6366f1" title="На главную" />
          </button>

          <div className="flex items-center gap-1.5 xs:gap-2">
            {/* SSE Status */}
            <SSEStatusIndicator connectedColor="bg-indigo-400" />
            {/* Venue avatar */}
            <button
              onClick={() => { setActiveSection('profile'); setSidebarOpen(false); }}
              className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs xs:text-sm font-bold shadow-md shadow-indigo-500/20 overflow-hidden"
            >
              {venueData.logoUrl ? (
                <img src={venueData.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                venueData.initials
              )}
            </button>
            {/* Burger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile header spacer */}
      <div className="lg:hidden h-[52px] xs:h-[58px]" />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-[#0a0a14]/95 lg:bg-[#0a0a14]/90 border-r border-white/10 overflow-y-auto z-[100] lg:z-10 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo - клик переводит на главную */}
        <PromoLogo
          size="md"
          subtitle="ПЛОЩАДКА"
          subtitleColor="text-indigo-300"
          animated={false}
          glowColor="#6366f1"
          className="mb-8"
          title="На главную"
          onClick={() => navigate('/')}
        />

        {/* Venue Profile Card */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setActiveSection('profile');
            setSidebarOpen(false);
          }}
          className="w-full mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            {/* Аватар с возможностью клика для загрузки фото */}
            <div 
              onClick={handleAvatarClick}
              className="relative group/avatar cursor-pointer"
              title="Нажмите, чтобы изменить фото"
            >
              {venueData.logoUrl ? (
                <img 
                  src={venueData.logoUrl} 
                  alt={venueData.name} 
                  className="w-12 h-12 rounded-xl object-cover transition-opacity group-hover/avatar:opacity-80" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg transition-opacity group-hover/avatar:opacity-80">
                  {venueData.initials}
                </div>
              )}
              {/* Иконка камеры при hover */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="text-white font-semibold truncate">{venueData.name}</div>
              <div className="text-gray-400 text-sm truncate">{venueData.type}</div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              venueStatus === 'В сети'
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                venueStatus === 'В сети' ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
              {venueStatus}
            </div>
            <SSEStatusIndicator connectedColor="bg-indigo-400" showLabel labelConnectedColor="text-indigo-400" />
          </div>

          {player.isPlaying && (
            <div className="mt-2 text-xs text-slate-400 truncate">
              🎵 {player.currentPlaylist?.title || player.currentTrack?.title}
            </div>
          )}
        </motion.button>

        {/* Navigation */}
        <nav className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
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
                {venueData.subscriptionPlan || 'Нет подписки'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{venueData.subscriptionPlan ? 'Активна' : 'Выберите тариф'}</p>
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
      <div className="lg:ml-72 relative z-0 pb-24 p-3 xs:p-4 md:p-0 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <Outlet context={{ handleProfileUpdate }} />
          </motion.div>
        </AnimatePresence>
        <UnifiedFooter />
      </div>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        role="venue"
        onComplete={(data) => {
          if (data.name) localStorage.setItem('venueName', data.name);
          if (data.city) localStorage.setItem('venueCity', data.city);
        }}
      />

      {/* Onboarding Tour */}
      <UniversalOnboardingTour
        role="venue"
        onNavigate={(section) => { setActiveSection(section); setSidebarOpen(false); }}
      />
    </div>
  );
}