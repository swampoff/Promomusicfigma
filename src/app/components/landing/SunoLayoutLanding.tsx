/**
 * SUNO LAYOUT LANDING - Четырехколоночная структура
 * 1. Левая навигация (240px): Логотип Promo.Music, меню, вход
 * 2. Виджеты (256px): Тест трека, Спецпредложения, Подписка, Наушники, Топ артистов
 * 3. Центр (flex-1): Hero баннер + Музыкальные чарты TOP 20
 * 4. Правая (350px): Новинки, Новые клипы, Лидеры недели, Скоро
 */

import { useState, useRef } from 'react';
import { Play, Music, TrendingUp, Sparkles, BarChart3, ChevronRight, Crown, Gift, Headphones, ArrowUp, ArrowDown, Home, Radio, Newspaper, LogIn, Zap, Target, Users, Menu, X, Heart, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/app/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';
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
}

interface SunoLayoutLandingProps {
  onLogin: () => void;
}

export function SunoLayoutLanding({ onLogin }: SunoLayoutLandingProps) {
  const [activeNav, setActiveNav] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Autoplay plugin для карусели
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  // Hero баннеры
  const banners = [
    {
      id: '1',
      icon: Zap,
      title: 'Продвигай музыку',
      subtitle: 'быстрее звука',
      description: 'AI-агент автоматизирует создание промо-материалов, текстов и стратегий продвижения для вашей музыки',
      button: 'Начать продвижение',
    },
    {
      id: '2',
      icon: Target,
      title: 'Попади в ТОП',
      subtitle: 'радиостанций',
      description: 'Прямая интеграция с радиостанциями - отправляй треки напрямую в эфир и отслеживай статистику',
      button: 'Смотреть радио',
    },
    {
      id: '3',
      icon: Users,
      title: 'Монетизируй',
      subtitle: 'свою музыку',
      description: 'Партнерская программа и система тарифов помогут зарабатывать на своём творчестве',
      button: 'Узнать больше',
    },
  ];

  // Mock данные для TOP 20
  const chartsData: Track[] = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', trend: 'up', trendValue: 3 },
    { id: '2', title: 'Stay', artist: 'The Kid LAROI', duration: '2:21', trend: 'down', trendValue: 1 },
    { id: '3', title: 'Easy On Me', artist: 'Adele', duration: '3:44', trend: 'down', trendValue: 1 },
    { id: '4', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', trend: 'up', trendValue: 2 },
    { id: '5', title: 'INDUSTRY BABY', artist: 'Lil Nas X & J...', duration: '3:32', trend: 'up', trendValue: 3 },
    { id: '6', title: 'Shivers', artist: 'Ed Sheeran', duration: '3:27', trend: 'down', trendValue: 1 },
    { id: '7', title: 'Cold Heart', artist: 'Elton John, Dua...', duration: '3:22', trend: 'up', trendValue: 2 },
    { id: '8', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:36', trend: 'up', trendValue: 4 },
    { id: '9', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', trend: 'down', trendValue: 2 },
    { id: '10', title: 'Peaches', artist: 'Justin Bieber', duration: '3:18', trend: 'up', trendValue: 1 },
    { id: '11', title: 'Good 4 U', artist: 'Olivia Rodrigo', duration: '2:58', trend: 'up', trendValue: 5 },
    { id: '12', title: 'Montero', artist: 'Lil Nas X', duration: '2:17', trend: 'down', trendValue: 3 },
    { id: '13', title: 'Drivers License', artist: 'Olivia Rodrigo', duration: '4:02', trend: 'up', trendValue: 2 },
    { id: '14', title: 'Butter', artist: 'BTS', duration: '2:44', trend: 'down', trendValue: 1 },
    { id: '15', title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', duration: '3:28', trend: 'up', trendValue: 3 },
    { id: '16', title: 'Astronaut In The Ocean', artist: 'Masked Wolf', duration: '2:12', trend: 'up', trendValue: 2 },
    { id: '17', title: 'Deja Vu', artist: 'Olivia Rodrigo', duration: '3:35', trend: 'down', trendValue: 1 },
    { id: '18', title: 'Beggin', artist: 'Måneskin', duration: '3:31', trend: 'up', trendValue: 4 },
    { id: '19', title: 'Bad Habits', artist: 'Ed Sheeran', duration: '3:50', trend: 'up', trendValue: 2 },
    { id: '20', title: 'Happier Than Ever', artist: 'Billie Eilish', duration: '4:58', trend: 'down', trendValue: 1 },
  ];

  const newTracks = [
    { id: '1', title: 'Антитела', artist: 'Unknown' },
    { id: '2', title: 'Новый день', artist: 'Gim' },
    { id: '3', title: 'Птичка', artist: 'Zlava feat' },
    { id: '4', title: 'Молодость', artist: 'Ivan Alexeev' },
    { id: '5', title: 'Небо', artist: 'Zlava feat' },
  ];

  const newVideos = [
    { id: '1', title: 'Die With A Smile', artist: 'Lady Gaga & Bru...', views: '2.3M', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
    { id: '2', title: 'APT.', artist: 'ROSÉ & Bruno M...', views: '238', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400' },
    { id: '3', title: 'Электро', artist: 'CAP', views: '345', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400' },
  ];

  const topArtists = [
    { id: '1', name: 'DJ Smash', points: 18120 },
    { id: '2', name: 'Zivert', points: 17230 },
    { id: '3', name: 'The Weeknd', points: 16500 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* MOBILE HEADER - только на мобильных */}
      <header className="lg:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setActiveNav('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={promoLogo} alt="Promo.Music Logo" className="h-8 xs:h-10 w-auto object-contain" />
            <span className="text-base xs:text-lg font-display font-black text-[#FF577F]">
              Promo.Music
            </span>
          </button>
          
          <div className="flex items-center gap-1.5 xs:gap-2">
            <Button
              size="sm"
              onClick={onLogin}
              className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-[10px] xs:text-xs shadow-md shadow-[#FF577F]/10"
            >
              <LogIn className="w-3 h-3 xs:w-3.5 xs:h-3.5 mr-0.5 xs:mr-1" />
              <span className="hidden xs:inline">Войти</span>
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/5 p-3 xs:p-4 space-y-1.5 xs:space-y-2"
          >
            <button
              onClick={() => { setActiveNav('home'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'home'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Главная</span>
            </button>
            <button
              onClick={() => { setActiveNav('charts'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'charts'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Чарты</span>
            </button>
            <button
              onClick={() => { setActiveNav('news'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'news'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Newspaper className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Новости</span>
            </button>
          </motion.nav>
        )}
      </header>

      {/* HERO BANNER - Full Width Top */}
      <div className="w-full border-b border-white/5">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="relative h-[250px] xs:h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px] bg-gradient-to-br from-[#FF577F]/20 via-[#3E4C5E]/30 to-[#FF577F]/10">
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-center px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 max-w-7xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 xs:py-1.5 sm:px-4 sm:py-2 mb-3 xs:mb-4 sm:mb-6 rounded-full bg-white/10 backdrop-blur-md border border-[#FF577F]/30 text-[10px] xs:text-xs sm:text-sm w-fit">
                      <banner.icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-[#FF577F]" />
                      <span>Новая функция</span>
                    </div>
                    <h2 className="text-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-2 xs:mb-3 sm:mb-4 max-w-3xl leading-[1.1]">
                      {banner.title}<br />
                      <span className="text-[#FF577F]">
                        {banner.subtitle}
                      </span>
                    </h2>
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 mb-3 xs:mb-4 sm:mb-8 max-w-2xl leading-relaxed">
                      {banner.description}
                    </p>
                    <Button
                      size="lg"
                      className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 xs:px-6 sm:px-10 py-3 xs:py-4 sm:py-7 rounded-full text-xs xs:text-sm sm:text-lg w-fit shadow-md shadow-[#FF577F]/10"
                    >
                      {banner.button}
                      <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 ml-1 xs:ml-2" />
                    </Button>
                  </div>
                  
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,87,127,0.15)_0%,transparent_50%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(62,76,94,0.2)_0%,transparent_50%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,87,127,0.1)_0%,transparent_70%)]" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex left-2 sm:left-4 md:left-8" />
          <CarouselNext className="hidden sm:flex right-2 sm:right-4 md:right-8" />
        </Carousel>
      </div>

      {/* 4 COLUMNS LAYOUT - адаптивный */}
      <div className="flex flex-col lg:flex-row">
        {/* LEFT NAVIGATION - скрыта на мобильных, показана на десктопах */}
        <aside className="hidden lg:flex w-60 min-h-screen bg-black border-r border-white/5 flex-col py-6 px-4">
          {/* Logo with text */}
          <button 
            onClick={() => setActiveNav('home')}
            className="mb-8 px-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              <img src={promoLogo} alt="Promo.Music Logo" className="h-12 w-auto object-contain" />
              <span className="text-2xl font-display font-black text-[#FF577F]">
                Promo.Music
              </span>
            </div>
          </button>

          {/* Navigation Buttons with text */}
          <nav className="flex-1 flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNav('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeNav === 'home'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-bold">Главная</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNav('charts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeNav === 'charts'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-bold">Чарты</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNav('news')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeNav === 'news'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Newspaper className="w-5 h-5" />
              <span className="font-bold">Новости</span>
            </motion.button>
          </nav>

          {/* Login Button with text */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#FF577F] hover:bg-[#FF4D7D] shadow-md shadow-[#FF577F]/10 transition-all"
          >
            <LogIn className="w-5 h-5" />
            <span className="font-bold">Войти</span>
          </motion.button>
        </aside>

        {/* LEFT SIDEBAR - 256px */}
        <aside className="hidden xl:block w-64 min-h-screen border-r border-white/5 p-4 space-y-4 overflow-y-auto scrollbar-hide">
          {/* Test Track Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, rotate: 1 }}
            className="rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-6 relative overflow-hidden cursor-pointer"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 opacity-20"
            >
              <Music className="w-32 h-32 absolute -top-10 -right-10" />
            </motion.div>
            <Music className="w-12 h-12 mb-4 text-white/90 relative z-10" />
            <h3 className="text-xl font-black mb-2 relative z-10 font-display">Тест трека</h3>
            <p className="text-sm text-white/80 mb-4 leading-relaxed relative z-10">
              Получи экспертную оценку своей музыки
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm"
                className="bg-white text-purple-600 hover:bg-white/90 font-bold px-6 py-2 rounded-full text-sm relative z-10"
              >
                Узнать больше
              </Button>
            </motion.div>
          </motion.div>

          {/* Скоро - События */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#FF577F]" />
              <h4 className="text-sm font-bold">Скоро</h4>
            </div>
            
            <div className="space-y-2">
              {/* AI-чарт обновление */}
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1">AI-чарт обновление</p>
                    <p className="text-xs text-slate-400">Пт, 12:00</p>
                  </div>
                </div>
              </motion.div>

              {/* Новый подкаст */}
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <Radio className="w-5 h-5 text-[#FF577F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1">Новый подкаст</p>
                    <p className="text-xs text-slate-400">Сб, 18:00</p>
                  </div>
                </div>
              </motion.div>

              {/* Премьера */}
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-teal-500/30 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1">Премьера. Zivert</p>
                    <p className="text-xs text-slate-400">Пт, 21:00</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Жанры */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-4 h-4 text-[#FF577F]" />
              <h4 className="text-sm font-bold">Жанры</h4>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['Pop', 'Rock', 'Electronic', 'Hip Hop', 'R&B', 'Indie', 'Jazz', 'Classical'].map((genre, index) => (
                <motion.button
                  key={genre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-[#FF577F] rounded-full transition-colors border border-white/10 hover:border-[#FF577F]"
                >
                  {genre}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Top Artists */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown className="w-4 h-4 text-yellow-500" />
              </motion.div>
              Топ артистов
            </h4>
            
            <div className="space-y-2">
              {topArtists.map((artist, index) => (
                <motion.div 
                  key={artist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.03, x: 5 }}
                  className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-white/5"
                >
                  <span className="text-slate-500 font-bold font-mono w-4">{index + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-[#FF577F] flex items-center justify-center text-xs font-bold shadow-md shadow-[#FF577F]/10">
                    {artist.name.charAt(0)}
                  </div>
                  <span className="flex-1 font-semibold truncate">{artist.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </aside>

        {/* CENTER - HER Banner + CHARTS */}
        <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-hide">
          {/* Условный рендеринг для разных разделов */}
          {activeNav === 'home' && (
            <>
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 xs:mb-6 sm:mb-8"
          >
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 xs:mb-3 text-display">
              Музыкальные чарты
            </h1>
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mt-3 xs:mt-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 bg-[#FF577F] rounded-full shadow-md shadow-[#FF577F]/10"
              >
                <span className="text-[10px] xs:text-xs sm:text-sm font-tech">TOP</span>
                <span className="text-lg xs:text-xl sm:text-2xl font-black font-mono">20</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs xs:text-sm text-slate-400"
              >
                🔥 <span className="hidden xs:inline">Обновлено сегодня</span><span className="xs:hidden">Сегодня</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Charts List */}
          <div className="space-y-1">
            {chartsData.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-[#FF577F]/20"
              >
                {/* Position */}
                <div className="w-6 sm:w-8 text-center">
                  <span className="text-base sm:text-lg font-black text-slate-500 group-hover:hidden font-mono">{index + 1}</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Play className="w-4 sm:w-5 h-4 sm:h-5 text-[#FF577F] hidden group-hover:block mx-auto" />
                  </motion.div>
                </div>

                {/* Trend - скрыт на мобильных */}
                <div className="hidden sm:flex items-center gap-1 w-12">
                  {track.trend === 'up' && (
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                  {track.trend === 'down' && (
                    <motion.div
                      animate={{ y: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowDown className="w-4 h-4 text-red-500" />
                    </motion.div>
                  )}
                  <span className={`text-xs font-bold font-mono ${track.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {track.trendValue}
                  </span>
                </div>

                {/* Cover */}
                <motion.div 
                  whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-[#3E4C5E]/30 flex items-center justify-center flex-shrink-0 border border-[#FF577F]/20"
                >
                  <Music className="w-4 h-4 sm:w-6 sm:h-6 text-[#FF577F]" />
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base text-white font-bold truncate group-hover:text-[#FF577F] transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 truncate font-medium">{track.artist}</p>
                </div>

                {/* Duration */}
                <div className="hidden md:block text-xs text-slate-500 font-mono w-12 text-right">
                  {track.duration}
                </div>

                {/* Charts Icon - скрыт на мобильных */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="hidden lg:block"
                >
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </motion.div>

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF577F] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md shadow-[#FF577F]/10 flex-shrink-0"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white ml-0.5" fill="white" />
                </motion.button>

                {/* Share & Donate - доступны на всех экранах */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button 
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      scale: {
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut"
                      }
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 hover:from-pink-500/40 hover:to-red-500/40 flex items-center justify-center transition-all border border-pink-500/30 hover:border-pink-500"
                    title="Задонатить"
                  >
                    <Heart className="w-4 h-4 text-pink-400" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    whileTap={{ scale: 0.9, rotate: -15 }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 flex items-center justify-center transition-all border border-blue-500/30 hover:border-blue-500"
                    title="Поделиться"
                  >
                    <Share2 className="w-4 h-4 text-blue-400" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <Button
              size="lg"
              className="bg-white/5 hover:bg-[#FF577F] text-white font-bold px-8 py-6 rounded-full transition-all border border-white/10 hover:border-[#FF577F]"
            >
              Показать ее
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          {/* NEW НОВИНКИ - Показываем на всех экранах */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 xs:mt-10 sm:mt-12 xl:hidden"
          >
            <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black flex items-center gap-2 xs:gap-3">
                <span className="text-[#FF577F] text-2xl xs:text-3xl">▶</span>
                <span className="bg-gradient-to-r from-[#FF577F] to-purple-500 text-transparent bg-clip-text font-black">NEW</span>
                <span className="hidden xs:inline">Новинки</span>
              </h2>
              <span className="text-xs xs:text-sm text-slate-500 font-medium">5 треков</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 xs:gap-3">
              {newTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-[#FF577F]/20"
                >
                  <span className="text-[#FF577F] font-bold text-base xs:text-lg w-5 xs:w-6 font-mono">{index + 1}</span>
                  <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-[#FF577F]/20">
                    <Music className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs xs:text-sm font-bold truncate">{track.title}</p>
                    <p className="text-[10px] xs:text-xs text-slate-400 truncate font-medium">{track.artist}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#FF577F] flex items-center justify-center shadow-md shadow-[#FF577F]/10 flex-shrink-0"
                  >
                    <Play className="w-3 h-3 xs:w-4 xs:h-4 text-white ml-0.5" fill="white" />
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* CTA - Попасть в Новинки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="mt-4 xs:mt-5 sm:mt-6 bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-2xl p-4 xs:p-5 sm:p-6 cursor-pointer"
            >
              <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <TrendingUp className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                <h4 className="text-base xs:text-lg font-bold">Попасть в Новинки</h4>
              </div>
              <p className="text-xs xs:text-sm text-slate-400 mb-3 xs:mb-4 leading-relaxed">
                Загрузи трек и получи статистику на платформе
              </p>
              <Button className="w-full bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold rounded-full py-4 xs:py-5 sm:py-6 text-xs xs:text-sm shadow-md shadow-[#FF577F]/10">
                Загрузить трек ~ 5 000 ₽
              </Button>
            </motion.div>
          </motion.div>

          {/* НОВЫЕ КЛИПЫ - Показываем на всех экранах */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mt-8 xs:mt-10 sm:mt-12 xl:hidden"
          >
            <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black flex items-center gap-2 xs:gap-3">
                <Play className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                <span>Новые клипы</span>
              </h2>
              <button className="text-xs xs:text-sm text-[#FF577F] hover:text-[#FF4D7D] flex items-center gap-1 font-semibold">
                <span className="hidden xs:inline">Все клипы</span> →
              </button>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
              {newVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-xl overflow-hidden mb-2 xs:mb-3 aspect-video bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-1.5 xs:bottom-2 right-1.5 xs:right-2 text-[10px] xs:text-xs bg-black/80 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md font-mono backdrop-blur-sm">
                      {video.views}
                    </div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-full bg-[#FF577F]/80 backdrop-blur-md flex items-center justify-center shadow-md shadow-[#FF577F]/10">
                        <Play className="w-5 h-5 xs:w-6 xs:h-6 text-white ml-0.5" fill="white" />
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-xs xs:text-sm font-bold truncate">{video.title}</p>
                  <p className="text-[10px] xs:text-xs text-slate-400 truncate font-medium">{video.artist}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
            </>
          )}

          {/* CHARTS SECTION */}
          {activeNav === 'charts' && <ChartsSection />}

          {/* NEWS SECTION */}
          {activeNav === 'news' && <NewsSection />}
        </main>

        {/* RIGHT SIDEBAR - 350px, скрыта на средних экранах */}
        <aside className="hidden xl:block w-[350px] min-h-screen border-l border-white/5 p-6 space-y-6 overflow-y-auto scrollbar-hide">
          {/* PROMO.FM сейчас - Статистика */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#FF577F]/10 to-[#3E4C5E]/10 border border-white/10 rounded-2xl p-5"
          >
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#FF577F]" />
              PROMO.FM сейчас
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400">Пользователи</span>
                </div>
                <span className="text-lg font-black font-mono text-blue-400">12,432</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Онлайн</span>
                </div>
                <span className="text-lg font-black font-mono text-green-400">45,234</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#FF577F]" />
                  <span className="text-xs text-slate-400">Треков в чарте</span>
                </div>
                <span className="text-lg font-black font-mono text-[#FF577F]">1,234</span>
              </div>
            </div>
          </motion.div>

          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* AI-ЧАРТ: Новинки недели */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text font-black">AI-ЧАРТ:</span>
                <span>Новинки недели</span>
              </h3>
              <button className="text-xs text-[#FF577F] hover:text-[#FF4D7D] flex items-center gap-1 font-semibold">
                обновить
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              AI анализирует Spotify, Apple, Яндекс и VK — выбирает топ треки
            </p>

            <div className="space-y-2">
              {[
                { id: '1', title: 'Luthor', artist: 'Kendrick Lamar & SZA', rating: 9.8, status: 'Выпущен', color: 'purple' },
                { id: '2', title: 'APT.', artist: 'ROSÉ & Bruno Mars', rating: 9.5, status: 'Выпущен', color: 'blue' },
                { id: '3', title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', rating: 9.2, status: 'Стабильно', color: 'cyan' },
                { id: '4', title: 'Плюкала', artist: 'Unknown Artist', rating: 9.0, status: 'Растет', color: 'green' },
              ].map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/10"
                >
                  <span className="text-slate-500 font-bold text-sm w-5 font-mono">{index + 1}</span>
                  
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{track.title}</p>
                    <p className="text-xs text-slate-400 truncate font-medium">{track.artist}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-black font-mono text-[#FF577F]">{track.rating}<span className="text-xs text-slate-500">/10</span></span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      track.status === 'Выпущен' ? 'bg-purple-500/20 text-purple-400' :
                      track.status === 'Стабильно' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {track.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF577F]/20 transition-colors flex items-center justify-center gap-2 font-bold text-sm"
            >
              Весь чарт TOP 50
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* NEW Новинки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="text-[#FF577F]">▶</span>
                <span className="bg-gradient-to-r from-[#FF577F] to-purple-500 text-transparent bg-clip-text font-black">NEW</span>
                <span>Новинки</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">5 треков</span>
            </div>

            <div className="space-y-2">
              {newTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/10"
                >
                  <span className="text-[#FF577F] font-bold text-sm w-5 font-mono">{index + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-[#FF577F]/20">
                    <Music className="w-5 h-5 text-[#FF577F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{track.title}</p>
                    <p className="text-xs text-slate-400 truncate font-medium">{track.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Новые клипы */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-[#FF577F]" />
                Новые клипы
              </h3>
              <button className="text-xs text-[#FF577F] hover:text-[#FF4D7D] flex items-center gap-1 font-semibold">
                Все клипы →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {newVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative rounded-xl overflow-hidden mb-2 aspect-video bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 right-2 text-xs bg-black/80 px-2 py-0.5 rounded-md font-mono backdrop-blur-sm">
                      {video.views}
                    </div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FF577F]/80 backdrop-blur-md flex items-center justify-center shadow-lg shadow-[#FF577F]/50">
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-xs font-bold truncate">{video.title}</p>
                  <p className="text-xs text-slate-400 truncate font-medium">{video.artist}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Разделитель */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Попасть в Новинки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-2xl p-5 cursor-pointer"
          >
            <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#FF577F]" />
              Попасть в Новинки
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Загрузи трек и получи статистику на платформе
            </p>
            <Button className="w-full bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold rounded-full py-6 shadow-md shadow-[#FF577F]/10">
              Загрузить трек ~ 5 000 ₽
            </Button>
          </motion.div>
        </aside>
      </div>

      {/* FOOTER - Full Width */}
      <footer className="w-full border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-16 py-8 xs:py-10 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8 sm:gap-12 mb-6 xs:mb-8 sm:mb-10">
            {/* Logo & Description */}
            <div className="col-span-2 lg:col-span-1 mb-4 lg:mb-0">
              <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                <img src={promoLogo} alt="Promo.Music Logo" className="h-10 xs:h-12 w-auto object-contain" />
                <span className="text-lg xs:text-xl font-display font-black text-[#FF577F]">
                  Promo.Music
                </span>
              </div>
              <p className="text-xs xs:text-sm text-slate-400 leading-relaxed max-w-xs">
                Маркетинговая экосистема для музыкантов enterprise-уровня
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs xs:text-sm font-bold mb-3 xs:mb-4">Продукт</h4>
              <ul className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Тест трека</li>
                <li className="hover:text-white transition-colors cursor-pointer">AI-агент</li>
                <li className="hover:text-white transition-colors cursor-pointer">Радиостанции</li>
                <li className="hover:text-white transition-colors cursor-pointer">Аналитика</li>
                <li className="hover:text-white transition-colors cursor-pointer">Тарифы</li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs xs:text-sm font-bold mb-3 xs:mb-4">Ресурсы</h4>
              <ul className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">Promo.Guide</li>
                <li className="hover:text-white transition-colors cursor-pointer">Блог</li>
                <li className="hover:text-white transition-colors cursor-pointer">Поддержка</li>
                <li className="hover:text-white transition-colors cursor-pointer">Документация</li>
                <li className="hover:text-white transition-colors cursor-pointer">API</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs xs:text-sm font-bold mb-3 xs:mb-4">Компания</h4>
              <ul className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">О нас</li>
                <li className="hover:text-white transition-colors cursor-pointer">Карьера</li>
                <li className="hover:text-white transition-colors cursor-pointer">Новости</li>
                <li className="hover:text-white transition-colors cursor-pointer">Партнеры</li>
                <li className="hover:text-white transition-colors cursor-pointer">Контакты</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 xs:pt-7 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 xs:gap-4">
            <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 text-center sm:text-left">
              © 2026 Promo.Music. Все права защищены.
            </p>
            <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4 sm:gap-6 text-[10px] xs:text-xs sm:text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}