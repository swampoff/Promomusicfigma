/**
 * DJ APP - Главный файл кабинета диджея
 * Sidebar навигация + роутинг разделов
 * 
 * Цветовая схема: Purple → Violet (фирменный цвет DJ-раздела)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Headphones, Calendar, User, DollarSign,
  BarChart3, Settings, LogOut, X, Menu, Coins, Music,
  Users, Radio, Bell, HelpCircle, Disc3, Zap, Share2
} from 'lucide-react';

// DJ Components
import { DjDashboardHome } from '@/dj/components/DjDashboardHome';
import { DjProfileEditor } from '@/dj/components/DjProfileEditor';
import { DjMixManager } from '@/dj/components/DjMixManager';
import { DjBookingsManager } from '@/dj/components/DjBookingsManager';
import { DjFinances } from '@/dj/components/DjFinances';
import { DjAnalytics } from '@/dj/components/DjAnalytics';
import { DjEvents } from '@/dj/components/DjEvents';
import { DjPromotion } from '@/dj/components/DjPromotion';
import { DjCollaborations } from '@/dj/components/DjCollaborations';
import { DjNotifications } from '@/dj/components/DjNotifications';
import { DjSupport } from '@/dj/components/DjSupport';
import { DjSettings } from '@/dj/components/DjSettings';

// Shared
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

interface DjAppProps {
  onLogout: () => void;
}

export default function DjApp({ onLogout }: DjAppProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [coinsBalance] = useState(850);

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

  // Menu structure
  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Обзор' },
    { id: 'profile', icon: User, label: 'Профиль' },
    { id: 'mixes', icon: Headphones, label: 'Миксы' },
    { id: 'bookings', icon: Calendar, label: 'Букинги' },
    { id: 'events', icon: Music, label: 'События' },
    { id: 'promotion', icon: Radio, label: 'Продвижение' },
    { id: 'collaborations', icon: Users, label: 'Коллаборации' },
    { id: 'analytics', icon: BarChart3, label: 'Аналитика' },
    { id: 'finances', icon: DollarSign, label: 'Финансы' },
    { id: 'notifications', icon: Bell, label: 'Уведомления' },
    { id: 'support', icon: HelpCircle, label: 'Поддержка' },
    { id: 'settings', icon: Settings, label: 'Настройки' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DjDashboardHome onNavigate={setActiveSection} />;
      case 'profile':
        return <DjProfileEditor />;
      case 'mixes':
        return <DjMixManager />;
      case 'bookings':
        return <DjBookingsManager />;
      case 'finances':
        return <DjFinances />;
      case 'analytics':
        return <DjAnalytics />;
      case 'events':
        return <DjEvents />;
      case 'promotion':
        return <DjPromotion />;
      case 'collaborations':
        return <DjCollaborations />;
      case 'notifications':
        return <DjNotifications />;
      case 'support':
        return <DjSupport />;
      case 'settings':
        return <DjSettings />;
      default:
        return <DjDashboardHome onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900 relative">
      {/* Animated background — Purple/Violet DJ theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveSection('home'); setIsSidebarOpen(false); }}
            className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={promoLogo} alt="Promo.music" className="h-8 xs:h-10 w-auto object-contain" />
            <div className="flex flex-col -space-y-0.5">
              <span className="text-[18px] xs:text-[22px] font-black tracking-tight leading-none bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                PROMO
              </span>
              <span className="text-[9px] xs:text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">
                DJ STUDIO
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 xs:gap-2">
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
        className={`fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-gray-900/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10 transition-transform duration-300 scrollbar-hide ${
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
            <span className="text-[22px] font-black tracking-tight leading-none bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              PROMO
            </span>
            <span className="text-[9px] font-bold text-white/60 tracking-[0.2em] uppercase">
              DJ STUDIO
            </span>
          </div>
        </button>

        {/* DJ Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
              <Disc3 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate">{djData.name}</div>
              <div className="text-gray-400 text-sm truncate">{djData.email}</div>
            </div>
          </div>

          {/* Coins Balance */}
          <button className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" />
                <span className="text-purple-100 font-semibold">{coinsBalance}</span>
              </div>
              <span className="text-purple-200 text-sm group-hover:scale-105 transition-transform">
                Promo-коины
              </span>
            </div>
          </button>
        </motion.div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {item.id === 'bookings' && (
                  <span className="ml-auto px-1.5 py-0.5 bg-red-500/80 rounded-full text-[10px] font-bold">2</span>
                )}
                {item.id === 'notifications' && (
                  <span className="ml-auto px-1.5 py-0.5 bg-purple-500/80 rounded-full text-[10px] font-bold">4</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Referral Banner */}
        <div className="mt-6 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-purple-300">Пригласи друга</span>
          </div>
          <p className="text-[10px] text-gray-400">Получи 5000₽ за каждого приглашённого DJ</p>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выход</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 relative z-0 min-h-screen p-3 md:p-6 lg:p-8">
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
    </div>
  );
}