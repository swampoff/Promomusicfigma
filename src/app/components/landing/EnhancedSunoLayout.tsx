/**
 * ENHANCED SUNO LAYOUT - Улучшенный layout с premium glassmorphism
 * Интегрирует все новые премиум компоненты с полной адаптивностью
 */

import { useState } from 'react';
import { Home, BarChart3, Newspaper, LogIn, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

// Импорт премиум компонентов
import { AnimatedBackground, FloatingParticles, GlassCard, GlassButton } from './GlassCard';
import { PremiumHeroBanner, CompactHeroBanner } from './PremiumHeroBanner';
import { 
  TrackTestWidget, 
  SpecialOfferWidget, 
  SubscriptionWidget, 
  HeadphonesWidget,
  TopArtistsWidget 
} from './PremiumWidgets';
import { TrackCard, CompactTrackCard } from './PremiumTrackCards';
import { ChartsSection } from './ChartsSection';
import { NewsSection } from './NewsSection';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover?: string;
  plays?: number;
  duration?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  rank?: number;
}

interface EnhancedSunoLayoutProps {
  onLogin: () => void;
}

export function EnhancedSunoLayout({ onLogin }: EnhancedSunoLayoutProps) {
  const [activeNav, setActiveNav] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock данные
  const topArtists = [
    { id: '1', name: 'DJ Smash', points: 18120, rank: 1 },
    { id: '2', name: 'Zivert', points: 17230, rank: 2 },
    { id: '3', name: 'The Weeknd', points: 16500, rank: 3 },
  ];

  const newTracks: Track[] = [
    { id: '1', title: 'Антитела', artist: 'Unknown' },
    { id: '2', title: 'Новый день', artist: 'Gim' },
    { id: '3', title: 'Птичка', artist: 'Zlava feat' },
    { id: '4', title: 'Молодость', artist: 'Ivan Alexeev' },
    { id: '5', title: 'Небо', artist: 'Zlava feat' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Анимированный фон */}
      <AnimatedBackground />

      {/* MOBILE HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="lg:hidden sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3"
      >
        <GlassCard variant="default" blur="xl" className="p-0 border-none">
          <div className="flex items-center justify-between p-2 xs:p-2.5 sm:p-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveNav('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={promoLogo} alt="Promo.music" className="h-7 xs:h-8 sm:h-10 w-auto" />
              <span className="text-sm xs:text-base sm:text-lg font-black text-[#FF577F]">Promo.music</span>
            </motion.button>
            
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2">
              <GlassButton variant="primary" size="sm" onClick={onLogin} className="text-[10px] xs:text-xs sm:text-sm px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-1.5 sm:py-2">
                <LogIn className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mr-0 xs:mr-0.5 sm:mr-1" />
                <span className="hidden xs:inline">Войти</span>
              </GlassButton>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? 'close' : 'menu'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mobileMenuOpen ? <X className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </GlassCard>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 overflow-hidden"
            >
              <GlassCard variant="gradient" blur="xl" className="p-2 xs:p-2.5 sm:p-3 space-y-1 xs:space-y-1.5 sm:space-y-2">
                {[
                  { id: 'home', icon: Home, label: 'Главная' },
                  { id: 'charts', icon: BarChart3, label: 'Чарты' },
                  { id: 'news', icon: Newspaper, label: 'Новости' },
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 xs:gap-2.5 sm:gap-3 px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl transition-all text-xs xs:text-sm sm:text-base ${
                      activeNav === item.id
                        ? 'bg-gradient-to-r from-[#FF577F] to-purple-500 shadow-lg shadow-[#FF577F]/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" />
                    <span className="font-bold">{item.label}</span>
                  </motion.button>
                ))}
              </GlassCard>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      {/* HERO BANNER - Full Width */}
      <div className="w-full hidden lg:block px-3 sm:px-4 xl:px-6 py-3 sm:py-4 xl:py-6 max-w-[2000px] mx-auto">
        <PremiumHeroBanner />
      </div>

      {/* Mobile Hero */}
      <div className="lg:hidden px-2.5 xs:px-3 sm:px-4 py-2.5 xs:py-3 sm:py-4">
        <CompactHeroBanner />
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row max-w-[2000px] mx-auto">
        {/* LEFT NAVIGATION - Desktop Only */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:flex w-60 xl:w-64 min-h-screen flex-col py-4 xl:py-6 px-3 xl:px-4 gap-3 xl:gap-4"
        >
          {/* Logo */}
          <GlassCard variant="hover" blur="lg" className="p-3 xl:p-4">
            <button 
              onClick={() => setActiveNav('home')}
              className="flex items-center gap-2.5 xl:gap-3 w-full hover:opacity-80 transition-opacity"
            >
              <img src={promoLogo} alt="Promo.music" className="h-10 xl:h-12 w-auto" />
              <span className="text-xl xl:text-2xl font-black text-[#FF577F]">Promo.music</span>
            </button>
          </GlassCard>

          {/* Navigation */}
          <GlassCard variant="gradient" blur="lg" className="p-2.5 xl:p-3 flex-1">
            <nav className="space-y-1.5 xl:space-y-2">
              {[
                { id: 'home', icon: Home, label: 'Главная' },
                { id: 'charts', icon: BarChart3, label: 'Чарты' },
                { id: 'news', icon: Newspaper, label: 'Новости' },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-2.5 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                    activeNav === item.id
                      ? 'bg-gradient-to-r from-[#FF577F] to-purple-500 shadow-lg shadow-[#FF577F]/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4.5 xl:w-5 h-4.5 xl:h-5" />
                  <span className="font-bold text-sm xl:text-base">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </GlassCard>

          {/* Login Button */}
          <GlassButton
            variant="primary"
            size="lg"
            onClick={onLogin}
            className="w-full"
            glow
          >
            <LogIn className="w-4.5 xl:w-5 h-4.5 xl:h-5 mr-1.5 xl:mr-2" />
            Войти в систему
          </GlassButton>
        </motion.aside>

        {/* LEFT WIDGETS SIDEBAR - XL+ Only */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden xl:block w-64 2xl:w-72 min-h-screen p-3 2xl:p-4 space-y-3 2xl:space-y-4"
        >
          <TrackTestWidget />
          <SpecialOfferWidget />
          <SubscriptionWidget />
          <HeadphonesWidget />
          <TopArtistsWidget artists={topArtists} />
        </motion.aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-h-screen p-2.5 xs:p-3 sm:p-4 lg:p-5 xl:p-6">
          <AnimatePresence mode="wait">
            {/* HOME */}
            {activeNav === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 xs:space-y-5 sm:space-y-6"
              >
                {/* Welcome Section */}
                <GlassCard variant="premium" blur="lg" className="p-4 xs:p-5 sm:p-6">
                  <h2 className="text-xl xs:text-2xl sm:text-3xl font-black mb-1.5 xs:mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Добро пожаловать в Promo.music
                  </h2>
                  <p className="text-xs xs:text-sm sm:text-base text-slate-400">
                    Профессиональная платформа для музыкантов с AI-агентом и интеграцией радиостанций
                  </p>
                </GlassCard>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4">
                  {[
                    { label: 'Артистов', value: '12,450', trend: '+12%' },
                    { label: 'Треков', value: '89,234', trend: '+8%' },
                    { label: 'Радиостанций', value: '156', trend: '+15%' },
                    { label: 'Прослушиваний', value: '5.2M', trend: '+24%' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <GlassCard variant="hover" blur="md" className="p-3 xs:p-3.5 sm:p-4">
                        <p className="text-[10px] xs:text-xs text-slate-400 mb-1">{ stat.label}</p>
                        <div className="flex items-baseline gap-1.5 xs:gap-2">
                          <span className="text-lg xs:text-xl sm:text-2xl font-black">{stat.value}</span>
                          <span className="text-[10px] xs:text-xs text-emerald-400 font-bold">{stat.trend}</span>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>

                {/* Featured Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
                  {/* Left: New Tracks */}
                  <GlassCard variant="gradient" blur="lg" className="p-4 xs:p-5 sm:p-6">
                    <h3 className="text-base xs:text-lg sm:text-xl font-black mb-3 xs:mb-4">🆕 Новые треки</h3>
                    <div className="space-y-1.5 xs:space-y-2">
                      {newTracks.map((track, i) => (
                        <CompactTrackCard key={track.id} track={track} />
                      ))}
                    </div>
                  </GlassCard>

                  {/* Right: Top Artists */}
                  <TopArtistsWidget artists={topArtists} />
                </div>
              </motion.div>
            )}

            {/* CHARTS */}
            {activeNav === 'charts' && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChartsSection />
              </motion.div>
            )}

            {/* NEWS */}
            {activeNav === 'news' && (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <NewsSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RIGHT SIDEBAR - 2XL+ Only */}
        <motion.aside
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden 2xl:block w-80 3xl:w-96 min-h-screen p-4 space-y-4"
        >
          <GlassCard variant="gradient" blur="lg" className="p-5 xl:p-6">
            <h3 className="text-base xl:text-lg font-black mb-4">📺 Новые клипы</h3>
            <div className="space-y-3">
              {[
                { title: 'Die With A Smile', artist: 'Lady Gaga', views: '2.3M' },
                { title: 'APT.', artist: 'ROSÉ', views: '238K' },
                { title: 'Электро', artist: 'CAP', views: '345K' },
              ].map((video, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <h4 className="text-sm font-bold truncate">{video.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">{video.artist}</span>
                    <span className="text-xs text-slate-500">{video.views}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard variant="neon" blur="lg" className="p-5 xl:p-6">
            <h3 className="text-base xl:text-lg font-black mb-4">🔥 Trending Now</h3>
            <p className="text-sm text-slate-400">
              Самые популярные треки недели
            </p>
          </GlassCard>
        </motion.aside>
      </div>
    </div>
  );
}