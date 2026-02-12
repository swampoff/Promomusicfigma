/**
 * SUNO LAYOUT LANDING - Четырехколоночная структура
 * 1. Левая навигация (240px): Логотип Promo.music, меню, вход
 * 2. Виджеты (256px): Тест трека, Спецпредложения, Подписка, Наушники, Топ артистов
 * 3. Центр (flex-1): Hero баннер + Музыкальные чарты TOP 20
 * 4. Правая (350px): Новинки, Новые клипы, Лидеры недели, Скоро
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Play, Music, TrendingUp, Sparkles, BarChart3, ChevronRight, Crown, Headphones, ArrowUp, ArrowDown, Home, Radio, Newspaper, LogIn, Zap, Target, Users, Menu, X, Heart, Share2, Calendar, TestTube, Store, MapPin, ChevronDown, Disc3, Mic2, Tv, Video, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
// Carousel moved to HeroBannerCarousel component
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';
// Eagerly loaded — shown on home page
import { ChartsSection } from './ChartsSection';
import { NewsSection } from './NewsSection';
import { ConcertsSection } from './ConcertsSection';
// Lazy-loaded sub-pages — only fetched when user navigates to them
const ForArtistsPage = lazy(() => import('./ForArtistsPage').then(m => ({ default: m.ForArtistsPage })));
const PromoAirPage = lazy(() => import('./PromoAirPage').then(m => ({ default: m.PromoAirPage })));
const PromoGuidePage = lazy(() => import('./PromoGuidePage').then(m => ({ default: m.PromoGuidePage })));
const PromoLabPage = lazy(() => import('./PromoLabPage').then(m => ({ default: m.PromoLabPage })));
const ForBusinessPage = lazy(() => import('./ForBusinessPage').then(m => ({ default: m.ForBusinessPage })));
const SupportPage = lazy(() => import('./SupportPage').then(m => ({ default: m.SupportPage })));
const DocsPage = lazy(() => import('./DocsPage').then(m => ({ default: m.DocsPage })));
const ContactsPage = lazy(() => import('./ContactsPage').then(m => ({ default: m.ContactsPage })));
const PrivacyPage = lazy(() => import('./PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./TermsPage').then(m => ({ default: m.TermsPage })));
const CareersPage = lazy(() => import('./CareersPage').then(m => ({ default: m.CareersPage })));
const PartnersPage = lazy(() => import('./PartnersPage').then(m => ({ default: m.PartnersPage })));
const ForDJsPage = lazy(() => import('./ForDJsPage').then(m => ({ default: m.ForDJsPage })));
const ForProducersPage = lazy(() => import('./ForProducersPage').then(m => ({ default: m.ForProducersPage })));
const ForEngineersPage = lazy(() => import('./ForEngineersPage').then(m => ({ default: m.ForEngineersPage })));
const ForTVPage = lazy(() => import('./ForTVPage').then(m => ({ default: m.ForTVPage })));
const ForLabelsPage = lazy(() => import('./ForLabelsPage').then(m => ({ default: m.ForLabelsPage })));
const ForMediaPage = lazy(() => import('./ForMediaPage').then(m => ({ default: m.ForMediaPage })));
const ForBloggersPage = lazy(() => import('./ForBloggersPage').then(m => ({ default: m.ForBloggersPage })));
const DjMarketplacePage = lazy(() => import('./DjMarketplacePage').then(m => ({ default: m.DjMarketplacePage })));
const ArtistPublicProfile = lazy(() => import('./ArtistPublicProfile').then(m => ({ default: m.ArtistPublicProfile })));

import { GenreIcon, GENRE_COLORS } from '@/app/components/genre-icon';
import { getPromotedConcerts } from '@/utils/api/concerts';
import { TrackSubmitModal } from './TrackSubmitModal';
import { GlobalPlayer } from './GlobalPlayer';
import { GlassTelegram, GlassVK, GlassYoutube } from './GlassSocialIcons';
import { PopularArtists } from './PopularArtists';
import { HeroBannerCarousel, createDefaultBanners } from './HeroBannerCarousel';
import { SearchOverlay } from './SearchOverlay';
import { usePlatformStats } from '@/hooks/useLandingData';

type SubmitService = 'test' | 'novelty' | 'promo';

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
  const [artistsSubmenuOpen, setArtistsSubmenuOpen] = useState(false);
  const [partnersSubmenuOpen, setPartnersSubmenuOpen] = useState(false);
  const [upcomingConcerts, setUpcomingConcerts] = useState<any[]>([]);
  const [isLoadingConcerts, setIsLoadingConcerts] = useState(true);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackModalService, setTrackModalService] = useState<SubmitService | undefined>(undefined);
  const [playerTrack, setPlayerTrack] = useState<Track | null>(null);
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null);
  const [activeArtistName, setActiveArtistName] = useState<string>('');

  const [searchOpen, setSearchOpen] = useState(false);

  // Platform stats from API
  const { data: platformStats } = usePlatformStats();
  const liveArtists = platformStats?.totalArtists ?? 156;
  const liveTracks = platformStats?.totalTracks ?? 218;
  const livePlays = platformStats?.totalPlays ?? 3250000;

  /** Navigation history back stack for artist profiles */
  const [navHistory, setNavHistory] = useState<Array<{ nav: string; artistId: string | null; artistName: string }>>([]);

  const playTrack = (track: Track) => {
    setPlayerTrack(track);
  };

  /** Navigate to public artist profile (with back stack) */
  const handleArtistClick = (artistId: string, artistName: string) => {
    // Push current state onto history stack before navigating
    setNavHistory(prev => [...prev, { nav: activeNav, artistId: activeArtistId, artistName: activeArtistName }]);
    setActiveArtistId(artistId);
    setActiveArtistName(artistName);
    setActiveNav('artist-profile');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Navigate back — pop from history or go home */
  const handleArtistBack = () => {
    setNavHistory(prev => {
      const stack = [...prev];
      const last = stack.pop();
      if (last) {
        setActiveNav(last.nav);
        setActiveArtistId(last.artistId);
        setActiveArtistName(last.artistName);
      } else {
        setActiveNav('home');
        setActiveArtistId(null);
        setActiveArtistName('');
      }
      return stack;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Navigate to artist by name (from player) — find matching artist */
  const handleArtistClickByName = (artistName: string) => {
    // Map known artist names to IDs for navigation
    const nameToId: Record<string, string> = {
      'Алиса Нова': 'artist-4',
      'Александр Иванов': 'artist-1',
      'Мария Звёздная': 'artist-2',
      'Даниил Громов': 'artist-3',
      'Никита Волков': 'artist-5',
      'Ева Луна': 'artist-6',
      'Максим Царёв': 'artist-7',
      'Кира Пламенева': 'artist-8',
      'Артём Северный': 'artist-9',
      'Диана Шторм': 'artist-10',
      'Игорь Пиксель': 'artist-11',
      'София Вельвет': 'artist-12',
    };
    const id = nameToId[artistName];
    if (id) {
      handleArtistClick(id, artistName);
    }
  };

  const playNextTrack = () => {
    if (!playerTrack) return;
    const allTracks = [...chartsData, ...newTracks.map(t => ({ ...t, duration: '3:00' }))];
    const idx = allTracks.findIndex(t => t.id === playerTrack.id);
    const next = allTracks[(idx + 1) % allTracks.length];
    if (next) setPlayerTrack(next);
  };

  const playPrevTrack = () => {
    if (!playerTrack) return;
    const allTracks = [...chartsData, ...newTracks.map(t => ({ ...t, duration: '3:00' }))];
    const idx = allTracks.findIndex(t => t.id === playerTrack.id);
    const prev = allTracks[(idx - 1 + allTracks.length) % allTracks.length];
    if (prev) setPlayerTrack(prev);
  };

  const openTrackModal = (service?: SubmitService) => {
    setTrackModalService(service);
    setTrackModalOpen(true);
  };
  
  // (Autoplay перенесён в HeroBannerCarousel)



  // Cmd+K / Ctrl+K для открытия поиска
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Автоматически открываем подменю "Артистам" если активен один из подразделов
  useEffect(() => {
    if (activeNav === 'for-artists' || activeNav === 'for-djs' || activeNav === 'for-producers' || activeNav === 'for-engineers') {
      setArtistsSubmenuOpen(true);
    }
    if (activeNav === 'for-business-radio' || activeNav === 'for-tv' || activeNav === 'for-labels' || activeNav === 'for-media' || activeNav === 'for-bloggers') {
      setPartnersSubmenuOpen(true);
    }
  }, [activeNav]);

  // Load promoted concerts on mount
  useEffect(() => {
    const loadConcerts = async () => {
      try {
        setIsLoadingConcerts(true);
        const concerts = await getPromotedConcerts();
        setUpcomingConcerts(concerts.slice(0, 4)); // Max 4 for carousel
        console.log('🎪 Loaded concerts for landing:', concerts.length);
      } catch (error) {
        console.error('Failed to load concerts:', error);
      } finally {
        setIsLoadingConcerts(false);
      }
    };

    loadConcerts();
  }, []);

  // Hero баннеры (Figma-style: полноширинный фон + text overlay)
  const heroBanners = createDefaultBanners({
    openTrackModal,
    navigateToArtists: () => { setActiveNav('for-artists'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    navigateToCharts: () => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  });

  // Данные для TOP 20 - артисты из демо-пула Promo.music
  const chartsData: Track[] = [
    { id: 'c1', title: 'Цифровой сон', artist: 'Алиса Нова', duration: '3:42', trend: 'up', trendValue: 5 },
    { id: 'c2', title: 'Улица зовёт', artist: 'Никита Волков', duration: '3:18', trend: 'up', trendValue: 3 },
    { id: 'c3', title: 'Новый рассвет', artist: 'Александр Иванов', duration: '3:55', trend: 'up', trendValue: 2 },
    { id: 'c4', title: 'Бункер 303', artist: 'Кира Пламенева', duration: '4:12', trend: 'up', trendValue: 4 },
    { id: 'c5', title: 'Бархатная ночь', artist: 'София Вельвет', duration: '3:38', trend: 'down', trendValue: 1 },
    { id: 'c6', title: 'Стена огня', artist: 'Даниил Громов', duration: '3:22', trend: 'up', trendValue: 3 },
    { id: 'c7', title: 'Электрическое сердце', artist: 'Диана Шторм', duration: '3:15', trend: 'up', trendValue: 2 },
    { id: 'c8', title: 'Дождливый понедельник', artist: 'Мария Звёздная', duration: '4:05', trend: 'down', trendValue: 1 },
    { id: 'c9', title: 'Neon Pulse', artist: 'Алиса Нова', duration: '3:30', trend: 'up', trendValue: 4 },
    { id: 'c10', title: 'Midnight Blues', artist: 'Максим Царёв', duration: '3:48', trend: 'up', trendValue: 1 },
    { id: 'c11', title: 'Облачный замок', artist: 'Ева Луна', duration: '4:20', trend: 'up', trendValue: 5 },
    { id: 'c12', title: 'Ленивое утро', artist: 'Игорь Пиксель', duration: '2:55', trend: 'down', trendValue: 2 },
    { id: 'c13', title: 'Басы качают', artist: 'Никита Волков', duration: '2:48', trend: 'up', trendValue: 3 },
    { id: 'c14', title: 'Северное сияние', artist: 'Артём Северный', duration: '5:10', trend: 'up', trendValue: 2 },
    { id: 'c15', title: 'Танцуй до утра', artist: 'Кира Пламенева', duration: '3:35', trend: 'up', trendValue: 3 },
    { id: 'c16', title: 'Мятеж', artist: 'Даниил Громов', duration: '3:08', trend: 'down', trendValue: 1 },
    { id: 'c17', title: 'Исповедь', artist: 'София Вельвет', duration: '4:15', trend: 'up', trendValue: 4 },
    { id: 'c18', title: 'Анархия весна', artist: 'Диана Шторм', duration: '2:42', trend: 'up', trendValue: 2 },
    { id: 'c19', title: 'Ретро-будущее', artist: 'Алиса Нова', duration: '3:50', trend: 'up', trendValue: 2 },
    { id: 'c20', title: 'Без тебя', artist: 'Александр Иванов', duration: '3:44', trend: 'down', trendValue: 1 },
  ];

  const newTracks = [
    { id: 'n1', title: 'Синтез', artist: 'Алиса Нова' },
    { id: 'n2', title: 'Акварель', artist: 'Мария Звёздная' },
    { id: 'n3', title: 'На вершине', artist: 'Никита Волков' },
    { id: 'n4', title: 'Полёт во сне', artist: 'Ева Луна' },
    { id: 'n5', title: 'Свобода', artist: 'Даниил Громов' },
  ];

  const newVideos = [
    { id: 'v1', title: 'Цифровой сон (клип)', artist: 'Алиса Нова', views: '412K', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' },
    { id: 'v2', title: 'Улица зовёт (клип)', artist: 'Никита Волков', views: '320K', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400' },
    { id: 'v3', title: 'Стробоскоп (live)', artist: 'Кира Пламенева', views: '275K', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400' },
  ];

  const topArtists = [
    { id: 'artist-4', name: 'Алиса Нова', points: 41200 },
    { id: 'artist-5', name: 'Никита Волков', points: 32000 },
    { id: 'artist-8', name: 'Кира Пламенева', points: 27500 },
  ];



  return (
    <div className="min-h-screen bg-black text-white">
      {/* MOBILE HEADER - только на мобильных */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-black/85 backdrop-blur-xl border-b border-white/5 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { setActiveNav('home'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity"
          >
            <img src={promoLogo} alt="Promo.music Logo" className="h-8 xs:h-10 w-auto object-contain" />
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
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Поиск"
            >
              <Search className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-slate-300" />
            </button>
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
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 p-3 xs:p-4 space-y-1.5 xs:space-y-2 shadow-2xl shadow-black/50"
          >
            <button
              onClick={() => { setActiveNav('home'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'home'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Главная</span>
            </button>
            {/* Артистам - premium dropdown */}
            <div>
              <button
                onClick={() => setArtistsSubmenuOpen(!artistsSubmenuOpen)}
                className={`w-full flex items-center justify-between gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                  activeNav === 'for-artists' || activeNav === 'for-djs' || activeNav === 'for-producers' || activeNav === 'for-engineers'
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <Users className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className="font-bold">Артистам</span>
                </div>
                <motion.div animate={{ rotate: artistsSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
              {artistsSubmenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-2 ml-2 xs:ml-3 p-2 xs:p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] space-y-1 xs:space-y-1.5"
                >
                  {[
                    { key: 'for-artists', icon: Music, label: 'Артистам', desc: 'Продвижение музыки', color: 'from-pink-500 to-rose-500' },
                    { key: 'for-djs', icon: Disc3, label: 'DJs', desc: 'Миксы и сеты', color: 'from-violet-500 to-purple-500' },
                    { key: 'for-producers', icon: Mic2, label: 'Саундпродюсеры', desc: 'Биты и продакшн', color: 'from-emerald-500 to-green-500' },
                    { key: 'for-engineers', icon: Headphones, label: 'Звукоинженеры', desc: 'Сведение и мастеринг', color: 'from-blue-500 to-indigo-500' },
                  ].map((item, idx) => (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.25 }}
                      onClick={() => { setActiveNav(item.key); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg transition-all text-left ${
                        activeNav === item.key
                          ? `bg-gradient-to-r ${item.color} shadow-md`
                          : 'hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        activeNav === item.key ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-80`
                      }`}>
                        <item.icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs xs:text-sm font-semibold truncate block ${activeNav === item.key ? 'text-white' : 'text-white/90'}`}>
                          {item.label}
                        </span>
                        <p className={`text-[10px] xs:text-[11px] truncate leading-tight mt-0.5 ${activeNav === item.key ? 'text-white/70' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className={`w-3 h-3 shrink-0 transition-all ${activeNav === item.key ? 'text-white/60' : 'text-white/20'}`} />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
            {/* Партнёрам - premium dropdown */}
            <div>
              <button
                onClick={() => setPartnersSubmenuOpen(!partnersSubmenuOpen)}
                className={`w-full flex items-center justify-between gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                  activeNav === 'for-business-radio' || activeNav === 'for-tv' || activeNav === 'for-labels' || activeNav === 'for-media' || activeNav === 'for-bloggers'
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 xs:w-5 xs:h-5" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <span className="font-bold">Партнёрам</span>
                </div>
                <motion.div animate={{ rotate: partnersSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
              {partnersSubmenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-2 ml-2 xs:ml-3 p-2 xs:p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] space-y-1 xs:space-y-1.5"
                >
                  {[
                    { key: 'for-business-radio', icon: Radio, label: 'Радиостанциям', desc: 'Ротация и эфир', color: 'from-purple-500 to-indigo-500', live: true },
                    { key: 'for-tv', icon: Tv, label: 'Телеканалам', desc: 'Контент для эфира', color: 'from-cyan-500 to-blue-500', live: false },
                    { key: 'for-labels', icon: Disc3, label: 'Лейблам', desc: 'Управление ростером', color: 'from-amber-500 to-orange-500', live: false },
                    { key: 'for-media', icon: Newspaper, label: 'СМИ', desc: 'Пресс-материалы', color: 'from-rose-500 to-pink-500', live: false },
                    { key: 'for-bloggers', icon: Video, label: 'Блогерам', desc: 'Музыка и коллабы', color: 'from-fuchsia-500 to-violet-500', live: false },
                  ].map((item, idx) => (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.25 }}
                      onClick={() => { setActiveNav(item.key); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg transition-all text-left ${
                        activeNav === item.key
                          ? `bg-gradient-to-r ${item.color} shadow-md`
                          : 'hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        activeNav === item.key ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-80`
                      }`}>
                        <item.icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs xs:text-sm font-semibold truncate ${activeNav === item.key ? 'text-white' : 'text-white/90'}`}>
                            {item.label}
                          </span>
                          {!item.live && (
                            <span className="shrink-0 text-[8px] xs:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 leading-none">
                              SOON
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] xs:text-[11px] truncate leading-tight mt-0.5 ${activeNav === item.key ? 'text-white/70' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className={`w-3 h-3 shrink-0 transition-all ${activeNav === item.key ? 'text-white/60' : 'text-white/20'}`} />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
            {/* Promo.Air */}
            <button
              onClick={() => { setActiveNav('promo-air'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'promo-air'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Store className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Promo.air</span>
            </button>
            {/* Promo.Lab */}
            <button
              onClick={() => { setActiveNav('promo-lab'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'promo-lab'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <TestTube className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Promo.Lab</span>
            </button>
            {/* Promo.Guide */}
            <button
              onClick={() => { setActiveNav('promo-guide'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'promo-guide'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <MapPin className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Promo.guide</span>
            </button>
            <button
              onClick={() => { setActiveNav('concerts'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'concerts'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">Концерты</span>
            </button>
            <button
              onClick={() => { setActiveNav('dj-marketplace'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                activeNav === 'dj-marketplace'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 shadow-md shadow-purple-500/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Disc3 className="w-4 h-4 xs:w-5 xs:h-5" />
              <span className="font-bold">DJ Каталог</span>
            </button>
            <button
              onClick={() => { setActiveNav('charts'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
              onClick={() => { setActiveNav('news'); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

      {/* Mobile header spacer */}
      <div className="lg:hidden h-[52px] xs:h-[58px]" />

      {/* Desktop content offset for fixed sidebar */}
      <div className="lg:ml-60 xl:ml-64 2xl:ml-72">

      {/* HERO BANNER — Figma-style: полноширинный фон + text overlay */}
      <HeroBannerCarousel banners={heroBanners} className="border-b border-white/5" />

      {/* === MOBILE WIDGETS — только на маленьких экранах === */}
      {activeNav === 'home' && (
        <div className="xl:hidden border-b border-white/5">
          {/* Mini Stats Row */}
          <div className="grid grid-cols-3 gap-px bg-white/5">
            {[
              { label: 'Онлайн', value: '347', color: 'text-green-400', dot: true },
              { label: 'Треков', value: String(liveTracks), color: 'text-[#FF577F]' },
              { label: 'Артистов', value: String(liveArtists), color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-black px-3 xs:px-4 py-2.5 xs:py-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  {stat.dot && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  <span className={`text-base xs:text-lg font-black font-mono ${stat.color}`}>{stat.value}</span>
                </div>
                <span className="text-[9px] xs:text-[10px] text-slate-600 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Horizontal Genre Carousel */}
          <div className="py-2.5 xs:py-3 overflow-hidden">
            <div className="flex gap-1.5 xs:gap-2 px-3 xs:px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {['Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Indie', 'Jazz', 'Classical', 'Afrobeat'].map(genre => {
                const colors = GENRE_COLORS[genre];
                return (
                  <button
                    key={genre}
                    onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); toast.info(`Фильтр: ${genre}`); }}
                    className={`flex-shrink-0 snap-start flex items-center gap-1 xs:gap-1.5 px-3 xs:px-3.5 py-1.5 xs:py-2 rounded-full border transition-all text-xs font-bold whitespace-nowrap ${
                      colors
                        ? `${colors.bg} ${colors.border} ${colors.text} hover:shadow-md ${colors.glow}`
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <GenreIcon genre={genre} size={14} />
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="px-3 xs:px-4 pb-3 xs:pb-4 flex gap-2 xs:gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveNav('promo-lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex-1 flex items-center justify-center gap-1.5 xs:gap-2 px-3 py-2.5 xs:py-3 rounded-xl bg-gradient-to-r from-purple-500/15 to-[#FF577F]/15 border border-purple-500/20 hover:border-purple-400/40 transition-all"
            >
              <TestTube className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
              <span className="text-[10px] xs:text-xs font-bold">Promo.Lab</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveNav('promo-guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex-1 flex items-center justify-center gap-1.5 xs:gap-2 px-3 py-2.5 xs:py-3 rounded-xl bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-500/20 hover:border-blue-400/40 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-400" />
              <span className="text-[10px] xs:text-xs font-bold">Promo.guide</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => openTrackModal('novelty')}
              className="flex-1 flex items-center justify-center gap-1.5 xs:gap-2 px-3 py-2.5 xs:py-3 rounded-xl bg-gradient-to-r from-[#FF577F]/15 to-orange-500/15 border border-[#FF577F]/20 hover:border-[#FF577F]/40 transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#FF577F]" />
              <span className="text-[10px] xs:text-xs font-bold">Загрузить</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* 4 COLUMNS LAYOUT - адаптивный */}
      <div className="flex flex-col lg:flex-row">
        {/* LEFT NAVIGATION - скрыта на мобильных, показана на десктопах */}
        <aside className="hidden lg:flex w-60 xl:w-64 2xl:w-72 fixed top-0 left-0 h-screen bg-black/80 backdrop-blur-xl border-r border-white/5 flex-col py-5 xl:py-6 px-3 xl:px-4 z-[130]">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FF577F]/5 to-transparent pointer-events-none" />
          
          {/* Logo with text */}
          <button 
            onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="relative mb-5 xl:mb-8 px-1 xl:px-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2 xl:gap-3">
              <img src={promoLogo} alt="Promo.music Logo" className="h-9 xl:h-12 w-auto object-contain" />
              <div className="flex flex-col -space-y-1">
                <span className="text-[22px] xl:text-[28px] font-black tracking-tight leading-none bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent">
                  PROMO
                </span>
                <span className="text-[10px] xl:text-xs font-bold text-white/60 tracking-[0.2em] uppercase">
                  MUSIC
                </span>
              </div>
            </div>
          </button>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-2.5 mb-2 xl:mb-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/20 transition-all group"
          >
            <Search className="w-4 h-4 xl:w-4.5 xl:h-4.5 text-slate-400 group-hover:text-pink-400 transition-colors" />
            <span className="text-[12px] xl:text-[13px] text-slate-500 group-hover:text-slate-300 font-medium transition-colors">Поиск...</span>
            <span className="ml-auto text-[9px] xl:text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
          </button>

          {/* Navigation Buttons with text */}
          <nav className="flex-1 flex flex-col gap-2 xl:gap-2.5 overflow-y-auto scrollbar-hide pr-0.5">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'home'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Главная</span>
            </motion.button>

            {/* Артистам - premium dropdown */}
            <div>
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setArtistsSubmenuOpen(!artistsSubmenuOpen)}
                className={`w-full flex items-center justify-between gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                  activeNav === 'for-artists' || activeNav === 'for-djs' || activeNav === 'for-producers' || activeNav === 'for-engineers'
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 xl:gap-3">
                  <Users className="w-4 h-4 xl:w-5 xl:h-5" />
                  <span className="text-[13px] xl:text-sm font-bold">Артистам</span>
                </div>
                <motion.div animate={{ rotate: artistsSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  <ChevronDown className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </motion.div>
              </motion.button>
              {artistsSubmenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="mt-1.5 xl:mt-2 p-1.5 xl:p-2 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] space-y-0.5 xl:space-y-1"
                >
                  {[
                    { key: 'for-artists', icon: Music, label: 'Артистам', desc: 'Продвижение музыки', color: 'from-pink-500 to-rose-500' },
                    { key: 'for-djs', icon: Disc3, label: 'DJs', desc: 'Миксы и сеты', color: 'from-violet-500 to-purple-500' },
                    { key: 'for-producers', icon: Mic2, label: 'Продюсерам', desc: 'Биты и продакшн', color: 'from-emerald-500 to-green-500' },
                    { key: 'for-engineers', icon: Headphones, label: 'Инженерам', desc: 'Сведение и мастеринг', color: 'from-blue-500 to-indigo-500' },
                  ].map((item, idx) => (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setActiveNav(item.key); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`group w-full flex items-center gap-2 xl:gap-2.5 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all text-left ${
                        activeNav === item.key
                          ? `bg-gradient-to-r ${item.color} shadow-md`
                          : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className={`w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        activeNav === item.key ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-70 group-hover:opacity-100`
                      }`}>
                        <item.icon className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] xl:text-[13px] font-semibold truncate block leading-tight ${activeNav === item.key ? 'text-white' : 'text-white/85 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                        <p className={`text-[9px] xl:text-[10px] truncate leading-tight mt-0.5 ${activeNav === item.key ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Партнёрам - premium dropdown */}
            <div>
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPartnersSubmenuOpen(!partnersSubmenuOpen)}
                className={`w-full flex items-center justify-between gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                  activeNav === 'for-business-radio' || activeNav === 'for-tv' || activeNav === 'for-labels' || activeNav === 'for-media' || activeNav === 'for-bloggers'
                    ? 'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 xl:gap-3">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 xl:w-5 xl:h-5" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-[13px] xl:text-sm font-bold">Партнёрам</span>
                </div>
                <motion.div animate={{ rotate: partnersSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                  <ChevronDown className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </motion.div>
              </motion.button>
              {partnersSubmenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="mt-1.5 xl:mt-2 p-1.5 xl:p-2 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]"
                >
                  {/* Live item - Радиостанциям */}
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setActiveNav('for-business-radio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`group w-full flex items-center gap-2 xl:gap-2.5 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all text-left ${
                      activeNav === 'for-business-radio'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md'
                        : 'hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className={`w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      activeNav === 'for-business-radio' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-indigo-500 opacity-70 group-hover:opacity-100'
                    }`}>
                      <Radio className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] xl:text-[13px] font-semibold truncate block leading-tight ${activeNav === 'for-business-radio' ? 'text-white' : 'text-white/85 group-hover:text-white'}`}>
                        Радиостанциям
                      </span>
                      <p className={`text-[9px] xl:text-[10px] truncate leading-tight mt-0.5 ${activeNav === 'for-business-radio' ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-500'}`}>
                        Ротация и эфир
                      </p>
                    </div>
                  </motion.button>

                  {/* Separator between live and coming soon */}
                  <div className="flex items-center gap-2 my-1.5 xl:my-2 px-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                    <span className="text-[8px] xl:text-[9px] font-bold text-white/25 uppercase tracking-wider shrink-0">Coming soon</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
                  </div>

                  {/* Coming soon items */}
                  <div className="space-y-0.5 xl:space-y-1">
                    {[
                      { key: 'for-tv', icon: Tv, label: 'Телеканалам', desc: 'Контент для эфира', color: 'from-cyan-500 to-blue-500' },
                      { key: 'for-labels', icon: Disc3, label: 'Лейблам', desc: 'Управление ростером', color: 'from-amber-500 to-orange-500' },
                      { key: 'for-media', icon: Newspaper, label: 'СМИ', desc: 'Пресс-материалы', color: 'from-rose-500 to-pink-500' },
                      { key: 'for-bloggers', icon: Video, label: 'Блогерам', desc: 'Музыка и коллабы', color: 'from-fuchsia-500 to-violet-500' },
                    ].map((item, idx) => (
                      <motion.button
                        key={item.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + idx * 0.04, duration: 0.2 }}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setActiveNav(item.key); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`group w-full flex items-center gap-2 xl:gap-2.5 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all text-left ${
                          activeNav === item.key
                            ? `bg-gradient-to-r ${item.color} shadow-md`
                            : 'hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          activeNav === item.key ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-50 group-hover:opacity-80`
                        }`}>
                          <item.icon className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className={`text-[11px] xl:text-[13px] font-semibold truncate leading-tight ${activeNav === item.key ? 'text-white' : 'text-white/60 group-hover:text-white/85'}`}>
                              {item.label}
                            </span>
                            <span className={`shrink-0 text-[7px] xl:text-[8px] font-bold px-1 xl:px-1.5 py-px rounded-full leading-none ${
                              activeNav === item.key ? 'bg-white/20 text-white/80' : 'bg-white/[0.06] text-white/30'
                            }`}>
                              SOON
                            </span>
                          </div>
                          <p className={`text-[9px] xl:text-[10px] truncate leading-tight mt-0.5 ${activeNav === item.key ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-500'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Separator - Products */}
            <div className="flex items-center gap-2 px-2 pt-1 pb-0.5">
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              <span className="text-[8px] xl:text-[9px] font-bold text-white/20 uppercase tracking-widest shrink-0">Продукты</span>
              <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
            </div>

            {/* Promo.Air */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('promo-air'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'promo-air'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Store className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Promo.air</span>
            </motion.button>

            {/* Promo.Lab */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('promo-lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'promo-lab'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <TestTube className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Promo.Lab</span>
            </motion.button>

            {/* Promo.Guide */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('promo-guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'promo-guide'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <MapPin className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Promo.guide</span>
            </motion.button>

            {/* Separator - Content */}
            <div className="flex items-center gap-2 px-2 pt-1 pb-0.5">
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
              <span className="text-[8px] xl:text-[9px] font-bold text-white/20 uppercase tracking-widest shrink-0">Контент</span>
              <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('concerts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'concerts'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Концерты</span>
            </motion.button>

            {/* DJ Marketplace */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('dj-marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'dj-marketplace'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 shadow-md shadow-purple-500/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Disc3 className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">DJ Каталог</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'charts'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Чарты</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveNav('news'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-xl transition-all ${
                activeNav === 'news'
                  ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Newspaper className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Новости</span>
            </motion.button>
          </nav>

          {/* Login Button with text */}
          <div className="relative shrink-0">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 xl:mb-5" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 xl:gap-3 px-3 xl:px-4 py-3 xl:py-3.5 rounded-xl bg-gradient-to-r from-[#FF577F] to-[#FF3366] hover:from-[#FF4D7D] hover:to-[#FF2255] shadow-lg shadow-[#FF577F]/20 transition-all border border-[#FF577F]/50"
            >
              <LogIn className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className="text-[13px] xl:text-sm font-bold">Войти</span>
            </motion.button>
          </div>
        </aside>

        {/* LEFT SIDEBAR - Widgets (only 2xl+, prevents content squeeze at xl) */}
        <aside className="hidden 2xl:block w-60 sticky top-0 h-screen border-r border-white/5 p-3 space-y-3 overflow-y-auto scrollbar-hide">
          {/* Test Track Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl bg-gradient-to-br from-purple-600 via-[#FF577F] to-orange-500 p-[1px] relative overflow-hidden cursor-pointer group"
            onClick={() => { setActiveNav('promo-lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="rounded-2xl bg-[#0a0d14]/90 backdrop-blur-xl p-5 relative overflow-hidden">
              {/* Animated glow */}
              <motion.div
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-[#FF577F]/10 to-transparent"
              />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-[#FF577F] flex items-center justify-center mb-3 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                  <TestTube className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-black mb-1 tracking-tight">Promo.Lab</h3>
                <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                  AI + эксперты оценят трек за 2–72 ч
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm"
                    className="w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-white font-bold px-5 py-2.5 rounded-xl text-xs backdrop-blur-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#FF577F]" />
                    Узнать потенциал
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Promo.Guide Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl bg-gradient-to-br from-purple-600 via-violet-500 to-blue-600 p-[1px] relative overflow-hidden cursor-pointer group"
            onClick={() => { setActiveNav('promo-guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="rounded-2xl bg-[#0a0d14]/90 backdrop-blur-xl p-5 relative overflow-hidden">
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-transparent"
              />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-black mb-1 tracking-tight">Promo.guide</h3>
                <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                  «Shazam наоборот» - скоро бета
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm"
                    className="w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-white font-bold px-5 py-2.5 rounded-xl text-xs backdrop-blur-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                    Узнать больше
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Promo.Air Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 p-[1px] relative overflow-hidden cursor-pointer group"
            onClick={() => { setActiveNav('promo-air'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="rounded-2xl bg-[#0a0d14]/90 backdrop-blur-xl p-5 relative overflow-hidden">
              <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent"
              />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-black mb-1 tracking-tight">Promo.air</h3>
                <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                  Единое радио для вашего заведения
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm"
                    className="w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-white font-bold px-5 py-2.5 rounded-xl text-xs backdrop-blur-sm"
                  >
                    <Radio className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                    Подключить
                  </Button>
                </motion.div>
              </div>
            </div>
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
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => { setActiveNav('news'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); toast.info('Премьера Zivert - скоро на Promo.music!'); }}
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
              {['Pop', 'Rock', 'Electronic', 'Hip-Hop', 'R&B', 'Indie', 'Jazz', 'Classical'].map((genre, index) => {
                const colors = GENRE_COLORS[genre];
                return (
                  <motion.button
                    key={genre}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); toast.info(`Фильтр: ${genre}`); }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all border flex items-center gap-1.5 ${
                      colors
                        ? `${colors.bg} ${colors.border} ${colors.text} hover:shadow-md ${colors.glow}`
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <GenreIcon genre={genre} size={14} />
                    {genre}
                  </motion.button>
                );
              })}
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
              <Crown className="w-4 h-4 text-yellow-500" />
              Топ артистов
            </h4>
            
            <div className="space-y-2">
              {topArtists.map((artist, index) => (
                <motion.div 
                  key={artist.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                  onClick={() => handleArtistClick(artist.id, artist.name)}
                  className="flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg hover:bg-white/5 group"
                >
                  <span className={`font-bold font-mono w-4 ${
                    index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-400' : 'text-amber-600'
                  }`}>{index + 1}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/15' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-400/10 text-black' :
                    'bg-gradient-to-br from-[#FF577F] to-purple-500 shadow-[#FF577F]/10'
                  }`}>
                    {artist.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold truncate block text-sm">{artist.name}</span>
                    <span className="text-[10px] text-slate-600 font-mono">{artist.points.toLocaleString()} pts</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </aside>

        {/* CENTER - Main Content */}
        <main className={`flex-1 min-w-0 lg:min-w-[520px] p-3 xs:p-4 sm:p-6 lg:p-6 xl:p-8 overflow-y-auto scrollbar-hide ${playerTrack ? 'pb-20 sm:pb-24' : ''}`}>
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 xs:mb-3 text-display">
                  Музыкальные чарты
                </h1>
                <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mt-3 xs:mt-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 bg-gradient-to-r from-[#FF577F] to-[#FF3366] rounded-full shadow-lg shadow-[#FF577F]/20"
                  >
                    <span className="text-[10px] xs:text-xs sm:text-sm font-tech">TOP</span>
                    <span className="text-lg xs:text-xl sm:text-2xl font-black font-mono">20</span>
                  </motion.div>
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="hidden xs:inline">Обновлено сегодня</span><span className="xs:hidden">Live</span>
                  </div>
                </div>
              </div>
              {/* Right decorative stats */}
              <div className="hidden sm:flex items-center gap-4 mt-2">
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-0.5">Всего треков</div>
                  <div className="text-lg font-black font-mono text-[#FF577F]">{liveTracks}</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-0.5">Артистов</div>
                  <div className="text-lg font-black font-mono text-purple-400">{liveArtists}</div>
                </div>
              </div>
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
                whileHover={{ x: 4 }}
                onClick={() => playTrack(track)}
                className={`group flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer border ${
                  playerTrack?.id === track.id ? 'border-[#FF577F]/30 bg-[#FF577F]/[0.05]' :
                  index === 0 ? 'border-yellow-500/10 bg-gradient-to-r from-yellow-500/[0.03] to-transparent hover:border-yellow-500/25' :
                  index < 3 ? 'border-white/5 hover:border-[#FF577F]/20' :
                  'border-transparent hover:border-[#FF577F]/20'
                }`}
              >
                {/* Position */}
                <div className="w-6 sm:w-8 text-center relative">
                  <span className={`text-base sm:text-lg font-black group-hover:opacity-0 transition-opacity duration-200 font-mono ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-amber-600' :
                    'text-slate-500'
                  }`}>{index + 1}</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 ease-out">
                    <Play className="w-4 sm:w-5 h-4 sm:h-5 text-[#FF577F]" />
                  </div>
                </div>

                {/* Trend - скрыт на мобильных */}
                <div className="hidden sm:flex items-center gap-1 w-12">
                  {track.trend === 'up' && (
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    >
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    </motion.div>
                  )}
                  {track.trend === 'down' && (
                    <motion.div
                      animate={{ y: [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
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
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-500/40 to-amber-500/40 border border-yellow-500/40 shadow-md shadow-yellow-500/10' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300/20 to-slate-400/20 border border-slate-400/30' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600/30 to-orange-600/30 border border-amber-600/30' :
                    'bg-gradient-to-br from-[#FF577F]/30 to-[#3E4C5E]/30 border border-[#FF577F]/20'
                  }`}
                >
                  <Music className={`w-4 h-4 sm:w-6 sm:h-6 ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-amber-500' :
                    'text-[#FF577F]'
                  }`} />
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base text-white font-bold truncate group-hover:text-[#FF577F] transition-colors">
                    {track.title}
                  </h4>
                  <button onClick={(e) => { e.stopPropagation(); handleArtistClickByName(track.artist); }} className="text-xs sm:text-sm text-slate-400 truncate font-medium hover:text-[#FF577F] transition-colors text-left block w-full">{track.artist}</button>
                </div>

                {/* Duration */}
                <div className="hidden md:block text-xs text-slate-500 font-mono w-12 text-right">
                  {track.duration}
                </div>

                {/* Charts Icon - скрыт на мобильных */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="hidden lg:block"
                >
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </motion.div>

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF577F] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md shadow-[#FF577F]/10 flex-shrink-0"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white ml-0.5" fill="white" />
                </motion.button>

                {/* Share & Donate - доступны на всех экранах */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 hover:from-pink-500/40 hover:to-red-500/40 flex items-center justify-center transition-colors duration-200 border border-pink-500/30 hover:border-pink-500"
                    title="Задонатить"
                  >
                    <Heart className="w-4 h-4 text-pink-400" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 flex items-center justify-center transition-colors duration-200 border border-blue-500/30 hover:border-blue-500"
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
              onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-white/5 hover:bg-gradient-to-r hover:from-[#FF577F] hover:to-[#FF3366] text-white font-bold px-10 py-6 rounded-full transition-all border border-white/10 hover:border-[#FF577F]/50 hover:shadow-lg hover:shadow-[#FF577F]/15"
            >
              Весь чарт TOP 50
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
                  whileHover={{ y: -3 }}
                  transition={{ delay: 0.7 + index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                  className="flex items-center gap-2 xs:gap-3 p-3 xs:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200 cursor-pointer border border-transparent hover:border-[#FF577F]/20"
                >
                  <span className="text-[#FF577F] font-bold text-base xs:text-lg w-5 xs:w-6 font-mono">{index + 1}</span>
                  <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-[#FF577F]/20">
                    <Music className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs xs:text-sm font-bold truncate">{track.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleArtistClickByName(track.artist); }} className="text-[10px] xs:text-xs text-slate-400 truncate font-medium hover:text-[#FF577F] transition-colors text-left w-full block">{track.artist}</button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={(e) => { e.stopPropagation(); playTrack({ id: track.id, title: track.title, artist: track.artist, duration: '3:20' }); }}
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
              className="mt-4 xs:mt-5 sm:mt-6 relative overflow-hidden bg-gradient-to-br from-[#FF577F]/[0.08] to-purple-500/[0.08] backdrop-blur-xl border border-[#FF577F]/15 rounded-2xl p-4 xs:p-5 sm:p-6 cursor-pointer group"
            >
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF577F]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                  <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-lg shadow-[#FF577F]/20">
                    <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                  </div>
                  <h4 className="text-sm xs:text-base font-black tracking-tight">Попасть в Новинки</h4>
                </div>
                <p className="text-[11px] xs:text-xs text-slate-500 mb-3 xs:mb-4 leading-relaxed">
                  Загрузи трек - после модерации он появится в разделе «Новинки»
                </p>
                <Button
                  onClick={() => openTrackModal('novelty')}
                  className="w-full bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold rounded-full py-4 xs:py-5 sm:py-6 text-xs xs:text-sm shadow-lg shadow-[#FF577F]/15"
                >
                  Загрузить трек
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* POPULAR ARTISTS - Горизонтальная карусель */}
          <PopularArtists onArtistClick={handleArtistClick} />

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
              <button
                onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-xs xs:text-sm text-[#FF577F] hover:text-[#FF4D7D] flex items-center gap-1 font-semibold"
              >
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
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-full bg-[#FF577F]/80 backdrop-blur-md flex items-center justify-center shadow-lg shadow-[#FF577F]/20 scale-75 group-hover:scale-100 transition-transform duration-300 ease-out">
                        <Play className="w-5 h-5 xs:w-6 xs:h-6 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs xs:text-sm font-bold truncate">{video.title}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleArtistClickByName(video.artist); }} className="text-[10px] xs:text-xs text-slate-400 truncate font-medium hover:text-[#FF577F] transition-colors text-left w-full block">{video.artist}</button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ПРЕДСТОЯЩИЕ КОНЦЕРТЫ - Карусель */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-8 xs:mt-10 sm:mt-12 xl:hidden"
          >
            <div className="flex items-center justify-between mb-4 xs:mb-5 sm:mb-6">
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black flex items-center gap-2 xs:gap-3">
                <Calendar className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                <span>Предстоящие концерты</span>
              </h2>
              <button
                onClick={() => { setActiveNav('concerts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-xs xs:text-sm text-[#FF577F] hover:text-[#FF4D7D] flex items-center gap-1 font-semibold"
              >
                <span className="hidden xs:inline">Все концерты</span> →
              </button>
            </div>

            {/* Horizontal Scroll Carousel */}
            <div className="relative">
              {isLoadingConcerts ? (
                <div className="flex gap-3 xs:gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-[280px] xs:w-[320px] sm:w-[360px]">
                      <div className="aspect-[4/5] rounded-2xl bg-white/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : upcomingConcerts.length > 0 ? (
                <div className="flex gap-3 xs:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
                  {upcomingConcerts.map((concert, index) => (
                  <motion.div
                    key={concert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.05 }}
                    className="group cursor-pointer flex-shrink-0 w-[280px] xs:w-[320px] sm:w-[360px] snap-start"
                  >
                    <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/5] bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20">
                      <img 
                        src={concert.banner || concert.image || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'} 
                        alt={concert.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      
                      {/* Date Badge */}
                      <div className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-[#FF577F]/80 backdrop-blur-md text-center border border-[#FF577F]/50">
                        <div className="text-xl font-black text-white leading-none mb-1">
                          {new Date(concert.date).getDate()}
                        </div>
                        <div className="text-[10px] text-white/90 uppercase font-bold">
                          {new Date(concert.date).toLocaleDateString('ru-RU', { month: 'short' })}
                        </div>
                      </div>

                      {/* Views Badge */}
                      <div className="absolute top-3 left-3 text-xs bg-black/80 px-2 py-1 rounded-lg font-mono backdrop-blur-sm">
                        👁️ {concert.views || '0'}
                      </div>

                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-base xs:text-lg font-black text-white mb-2 line-clamp-1">
                          {concert.title}
                        </h3>
                        <p className="text-xs xs:text-sm text-slate-300 mb-3 line-clamp-1">
                          {concert.type || concert.artist || 'Концерт'}
                        </p>

                        {/* Details */}
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-2 text-xs text-white/90">
                            <Target className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{concert.city} • {concert.venue}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/90">
                            <Music className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{concert.time}</span>
                          </div>
                        </div>

                        {/* Price Button */}
                        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
                          <span className="text-xs font-bold text-white">
                            {concert.price || `от ${concert.ticketPriceFrom || '0'} ₽`}
                          </span>
                          <ChevronRight className="w-4 h-4 text-[#FF577F] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">Пока нет предстоящих концертов</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════ */}
          {/* CTA БЛОК - Призыв к действию для артистов      */}
          {/* ═══════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-10 xs:mt-12 sm:mt-16"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6 xs:mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF577F] to-orange-500 flex items-center justify-center shadow-lg shadow-[#FF577F]/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl xs:text-2xl sm:text-3xl font-black">Начни продвижение</h2>
                <p className="text-xs xs:text-sm text-slate-500">Выбери что хочешь сделать - мы поможем</p>
              </div>
            </div>

            {/* CTA Cards Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
              {/* 1. Разместить видео */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={onLogin}
                className="relative group text-left overflow-hidden rounded-2xl border border-[#FF577F]/20 hover:border-[#FF577F]/50 bg-gradient-to-br from-[#FF577F]/[0.06] to-pink-600/[0.03] p-4 xs:p-5 sm:p-6 transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#FF577F]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-gradient-to-br from-[#FF577F] to-pink-600 flex items-center justify-center mb-3 xs:mb-4 shadow-lg shadow-[#FF577F]/25 group-hover:shadow-[#FF577F]/40 transition-shadow">
                    <Video className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
                  </div>
                  <h3 className="text-base xs:text-lg font-black mb-1.5 text-white group-hover:text-[#FF577F] transition-colors">Разместить видео</h3>
                  <p className="text-[11px] xs:text-xs text-slate-500 leading-relaxed mb-3 xs:mb-4">Загрузи клип или live-видео. После модерации - публикация на платформе и продвижение</p>
                  <div className="flex items-center gap-1.5 text-[#FF577F] text-xs xs:text-sm font-bold">
                    <span>Загрузить</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>

              {/* 2. Анонсировать концерт */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={onLogin}
                className="relative group text-left overflow-hidden rounded-2xl border border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/[0.06] to-amber-600/[0.03] p-4 xs:p-5 sm:p-6 transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-3 xs:mb-4 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
                    <Calendar className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
                  </div>
                  <h3 className="text-base xs:text-lg font-black mb-1.5 text-white group-hover:text-orange-400 transition-colors">Анонсировать концерт</h3>
                  <p className="text-[11px] xs:text-xs text-slate-500 leading-relaxed mb-3 xs:mb-4">Создай событие, настрой продажу билетов. Продвижение на главной и в соцсетях</p>
                  <div className="flex items-center gap-1.5 text-orange-400 text-xs xs:text-sm font-bold">
                    <span>Создать событие</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>

              {/* 3. Продвинуть трек */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => openTrackModal('promo')}
                className="relative group text-left overflow-hidden rounded-2xl border border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-500/[0.06] to-violet-600/[0.03] p-4 xs:p-5 sm:p-6 transition-all duration-300"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-3 xs:mb-4 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                    <TrendingUp className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
                  </div>
                  <h3 className="text-base xs:text-lg font-black mb-1.5 text-white group-hover:text-purple-400 transition-colors">Продвинуть трек</h3>
                  <p className="text-[11px] xs:text-xs text-slate-500 leading-relaxed mb-3 xs:mb-4">Запусти промо-кампанию. Попади в чарты, на радио и в плейлисты заведений</p>
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs xs:text-sm font-bold">
                    <span>Запустить промо</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            </div>

            {/* Bottom CTA Banner - Полный цикл */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="mt-4 xs:mt-5 sm:mt-6 relative overflow-hidden rounded-2xl border border-white/10 hover:border-[#FF577F]/30 bg-gradient-to-r from-[#FF577F]/[0.05] via-purple-500/[0.05] to-orange-500/[0.05] p-4 xs:p-5 sm:p-6 group cursor-pointer transition-all duration-300"
              onClick={onLogin}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF577F]/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#FF577F]/20 text-[#FF577F] text-[10px] xs:text-xs font-bold">Модерация 24ч</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] xs:text-xs font-bold">Безопасная оплата</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] xs:text-xs font-bold">Аналитика</span>
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-black text-white mb-1">Полный цикл: загрузка - модерация - оплата - публикация</h3>
                  <p className="text-[10px] xs:text-xs text-slate-500">Зарегистрируйся и начни продвижение за 5 минут. Первый трек - бесплатно</p>
                </div>
                <Button
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); onLogin(); }}
                  className="bg-gradient-to-r from-[#FF577F] to-orange-500 hover:from-[#FF4D7D] hover:to-orange-400 text-white font-black px-6 xs:px-8 py-3 xs:py-4 rounded-full text-xs xs:text-sm shadow-lg shadow-[#FF577F]/15 whitespace-nowrap flex-shrink-0"
                >
                  Начать бесплатно
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>

            </>
          )}

          {/* CHARTS SECTION */}
          {activeNav === 'charts' && <ChartsSection />}

          {/* NEWS SECTION */}
          {activeNav === 'news' && <NewsSection />}

          {/* CONCERTS SECTION */}
          {activeNav === 'concerts' && <ConcertsSection />}

          {/* LAZY-LOADED SUB-PAGES — wrapped in Suspense */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#FF577F] animate-spin" />
                <p className="text-white/30 text-xs font-medium">Загрузка...</p>
              </div>
            </div>
          }>
            {activeNav === 'for-artists' && <ForArtistsPage onGetStarted={onLogin} />}
            {activeNav === 'for-business-radio' && (
              <ForBusinessPage onGetStarted={onLogin} initialTab="radio" />
            )}
            {activeNav === 'promo-air' && <PromoAirPage onGetStarted={onLogin} />}
            {activeNav === 'promo-lab' && <PromoLabPage onGetStarted={onLogin} onTestTrack={() => openTrackModal('test')} />}
            {activeNav === 'promo-guide' && <PromoGuidePage onGetStarted={onLogin} />}
            {activeNav === 'support' && <SupportPage onGetStarted={onLogin} />}
            {activeNav === 'docs' && <DocsPage />}
            {activeNav === 'contacts' && <ContactsPage />}
            {activeNav === 'privacy' && <PrivacyPage />}
            {activeNav === 'terms' && <TermsPage />}
            {activeNav === 'careers' && <CareersPage />}
            {activeNav === 'partners' && <PartnersPage />}
            {activeNav === 'for-djs' && <ForDJsPage onGetStarted={onLogin} />}
            {activeNav === 'dj-marketplace' && <DjMarketplacePage onGetStarted={onLogin} />}
            {activeNav === 'for-producers' && <ForProducersPage onGetStarted={onLogin} />}
            {activeNav === 'for-engineers' && <ForEngineersPage onGetStarted={onLogin} />}
            {activeNav === 'for-tv' && <ForTVPage onGetStarted={onLogin} />}
            {activeNav === 'for-labels' && <ForLabelsPage onGetStarted={onLogin} />}
            {activeNav === 'for-media' && <ForMediaPage onGetStarted={onLogin} />}
            {activeNav === 'for-bloggers' && <ForBloggersPage onGetStarted={onLogin} />}
            {activeNav === 'artist-profile' && activeArtistId && (
              <ArtistPublicProfile
                artistId={activeArtistId}
                artistName={activeArtistName}
                onBack={handleArtistBack}
                onPlayTrack={(track) => playTrack({ ...track, plays: 0, trend: 'up', trendValue: 0 })}
                onArtistNavigate={handleArtistClick}
              />
            )}
          </Suspense>
        </main>

        {/* RIGHT SIDEBAR - адаптивная ширина, скрыта до xl */}
        <aside className={`hidden xl:block w-[280px] 2xl:w-[340px] sticky top-0 h-screen border-l border-white/5 p-4 2xl:p-5 space-y-4 2xl:space-y-5 overflow-y-auto scrollbar-hide ${playerTrack ? 'pb-24' : ''}`}>
          {/* PROMO.FM сейчас - Статистика */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-[#FF577F]/10 via-[#3E4C5E]/10 to-purple-500/5 border border-white/10 rounded-2xl p-5 overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF577F]/5 rounded-full blur-2xl" />
            
            <h3 className="relative text-sm font-bold mb-5 flex items-center gap-2">
              <div className="relative">
                <Radio className="w-4 h-4 text-[#FF577F]" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              PROMO.FM сейчас
            </h3>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between group/stat">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-400">Пользователи</span>
                </div>
                <span className="text-lg font-black font-mono text-blue-400">2,841</span>
              </div>
              
              <div className="flex items-center justify-between group/stat">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Онлайн</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-green-500/70">live</span>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-green-400">347</span>
              </div>
              
              <div className="flex items-center justify-between group/stat">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF577F]/10 flex items-center justify-center">
                    <Music className="w-4 h-4 text-[#FF577F]" />
                  </div>
                  <span className="text-xs text-slate-400">Треков в чарте</span>
                </div>
                <span className="text-lg font-black font-mono text-[#FF577F]">{liveTracks}</span>
              </div>

              {/* Mini progress bars */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Активность</span>
                  <span>87%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '87%' }}
                    transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#FF577F] to-purple-500"
                  />
                </div>
              </div>

              {/* Mini soundwave visualization */}
              <div className="pt-3 flex items-end gap-[3px] justify-center h-8">
                {[30, 60, 40, 70, 50, 80, 35, 65, 45, 55, 75, 40, 60, 50, 70].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`, `${h * 0.8}%`, `${h * 0.3}%`] }}
                    transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[3px] rounded-full bg-gradient-to-t from-[#FF577F]/40 to-[#FF577F]/80"
                    style={{ minHeight: '2px' }}
                  />
                ))}
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
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text font-black">AI-ЧАРТ</span>
              </h3>
              <button
                onClick={() => toast.info('AI-чарт обновляется автоматически каждую пятницу')}
                className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold px-2 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
              >
                <Zap className="w-3 h-3" />
                обновить
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              AI анализирует Spotify, Apple, Яндекс и VK - выбирает топ
            </p>

            <div className="space-y-2">
              {[
                { id: 'ai1', title: 'Цифровой сон', artist: 'Алиса Нова', rating: 9.8, status: 'Выпущен', color: 'purple' },
                { id: 'ai2', title: 'Бархатная ночь', artist: 'София Вельвет', rating: 9.5, status: 'Выпущен', color: 'blue' },
                { id: 'ai3', title: 'Облачный замок', artist: 'Ева Луна', rating: 9.2, status: 'Стабильно', color: 'cyan' },
                { id: 'ai4', title: 'Улица зовёт', artist: 'Никита Волков', rating: 9.0, status: 'Растет', color: 'green' },
              ].map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/10"
                >
                  <span className="text-slate-500 font-bold text-sm w-5 font-mono">{index + 1}</span>
                  
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{track.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleArtistClickByName(track.artist); }} className="text-xs text-slate-400 truncate font-medium hover:text-[#FF577F] transition-colors text-left w-full block">{track.artist}</button>
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
              onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
                  whileHover={{ x: 4 }}
                  className="group/track flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-[#FF577F]/10"
                >
                  <span className="text-[#FF577F] font-bold text-sm w-5 font-mono">{index + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 border border-[#FF577F]/20">
                    <Music className="w-5 h-5 text-[#FF577F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{track.title}</p>
                    <button onClick={(e) => { e.stopPropagation(); handleArtistClickByName(track.artist); }} className="text-xs text-slate-400 truncate font-medium hover:text-[#FF577F] transition-colors text-left w-full block">{track.artist}</button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={(e) => { e.stopPropagation(); playTrack({ id: track.id, title: track.title, artist: track.artist, duration: '3:20' }); }}
                    className="w-8 h-8 rounded-full bg-[#FF577F] flex items-center justify-center opacity-0 group-hover/track:opacity-100 transition-opacity duration-200 shadow-md shadow-[#FF577F]/10 flex-shrink-0"
                  >
                    <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                  </motion.button>
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
              <button
                onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-xs text-[#FF577F] hover:text-[#FF4D7D] flex items-center gap-1 font-semibold"
              >
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
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-[#FF577F]/80 backdrop-blur-md flex items-center justify-center shadow-lg shadow-[#FF577F]/20 scale-75 group-hover:scale-100 transition-transform duration-300 ease-out">
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold truncate">{video.title}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleArtistClickByName(video.artist); }} className="text-xs text-slate-400 truncate font-medium hover:text-[#FF577F] transition-colors text-left w-full block">{video.artist}</button>
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
            className="relative overflow-hidden bg-gradient-to-br from-[#FF577F]/[0.08] to-purple-500/[0.08] backdrop-blur-xl border border-[#FF577F]/15 rounded-2xl p-5 cursor-pointer group"
          >
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#FF577F]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF577F] to-purple-500 flex items-center justify-center shadow-md shadow-[#FF577F]/20">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-black tracking-tight">Попасть в Новинки</h4>
              </div>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Загрузи трек - после модерации он появится в «Новинках»
              </p>
              <Button
                onClick={() => openTrackModal('novelty')}
                className="w-full bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold rounded-full py-6 shadow-lg shadow-[#FF577F]/15"
              >
                Загрузить трек
              </Button>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* FOOTER - Full Width */}
      <footer className={`w-full bg-black relative ${playerTrack ? 'pb-16 sm:pb-[72px]' : ''}`}>
        {/* Gradient top border */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#FF577F]/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 xs:px-6 sm:px-8 lg:px-16 py-10 xs:py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8 sm:gap-12 mb-8 xs:mb-10 sm:mb-12">
            {/* Logo & Description */}
            <div className="col-span-2 lg:col-span-1 mb-4 lg:mb-0">
              <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                <img src={promoLogo} alt="Promo.music Logo" className="h-10 xs:h-12 w-auto object-contain" />
                <div className="flex flex-col -space-y-0.5">
                  <span className="text-[22px] xs:text-[26px] font-black tracking-tight leading-none bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent">
                    PROMO
                  </span>
                  <span className="text-[10px] xs:text-xs font-bold text-white/60 tracking-[0.2em] uppercase">
                    MUSIC
                  </span>
                </div>
              </div>
              <p className="text-xs xs:text-sm text-slate-400 leading-relaxed max-w-xs mb-5">
                Маркетинговая экосистема для музыкантов. Продвигай музыку, попадай в ротацию, расти.
              </p>
              {/* Social links — glass icons from Figma */}
              <div className="flex items-center gap-2.5">
                <GlassTelegram />
                <GlassVK />
                <GlassYoutube />
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs xs:text-sm font-bold mb-3 xs:mb-4">Продукт</h4>
              <ul className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm text-slate-400">
                <li>
                  <button onClick={() => { setActiveNav('for-business-radio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Радиостанциям
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('promo-air'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Promo.air
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('promo-lab'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Promo.lab
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('promo-guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Promo.guide
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('for-tv'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Телеканалам
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('for-labels'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Лейблам
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('for-media'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    СМИ
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('for-bloggers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Блогерам
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('charts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Чарты
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('concerts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Концерты
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs xs:text-sm font-bold mb-3 xs:mb-4">Ресурсы</h4>
              <ul className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm text-slate-400">
                <li>
                  <button onClick={() => { setActiveNav('promo-guide'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Promo.guide
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('news'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Блог
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('support'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Поддержка
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('docs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Документация
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('docs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    API
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs xs:text-sm font-bold mb-3 xs:mb-4">Компания</h4>
              <ul className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm text-slate-400">
                <li>
                  <button onClick={() => { setActiveNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    О нас
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('careers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Карьера
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('news'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Новости
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('partners'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Партнеры
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveNav('contacts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">
                    Контакты
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 xs:pt-7 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 xs:gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500">
                © 2026 Promo.music. Все права защищены.
              </p>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-500/60">Все системы работают</span>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4 sm:gap-6 text-[10px] xs:text-xs sm:text-sm text-slate-500">
              <button 
                onClick={() => { setActiveNav('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                Политика конфиденциальности
              </button>
              <button 
                onClick={() => { setActiveNav('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                Условия использования
              </button>
            </div>
          </div>
        </div>
      </footer>
      </div> {/* close lg:ml-60 margin wrapper */}

      {/* Track Submit Modal */}
      <TrackSubmitModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialService={trackModalService}
      />

      {/* Global Audio Player */}
      <GlobalPlayer
        track={playerTrack}
        playlist={chartsData}
        onClose={() => setPlayerTrack(null)}
        onNext={playNextTrack}
        onPrev={playPrevTrack}
        onPlayTrack={playTrack}
        onArtistClick={handleArtistClickByName}
      />

      {/* Bottom spacer for player */}
      {playerTrack && <div className="h-14 sm:h-[68px]" />}

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onArtistClick={(id, name) => {
          handleArtistClickByName(name);
          setSearchOpen(false);
        }}
        onNavigate={(page) => {
          setActiveNav(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setSearchOpen(false);
        }}
      />
    </div>
  );
}