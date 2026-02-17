/**
 * PUBLIC LAYOUT - Sidebar navigation matching the landing page layout
 * Fixed left sidebar (desktop) + mobile header with burger menu
 * PageBanner auto-rendered for each public route
 * Used by all public routes except the landing page itself
 */

import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music, LogIn, ChevronDown, ChevronRight, Home, Users, Sparkles, Store,
  TestTube, MapPin, Radio, Calendar, BarChart3, Newspaper,
  Disc3, Mic2, Headphones, Tv, Video, ShoppingBag,
  Mail, Heart, X, Menu, Search, Building2, HelpCircle, CreditCard,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { PromoLogo } from '@/app/components/promo-logo';
import { PageBanner } from '@/app/components/page-banner';
import { SearchOverlay } from '@/app/components/landing/SearchOverlay';
import { UnifiedFooter } from '@/app/components/unified-footer';

/** Map internal search nav keys to React Router URLs */
const NAV_KEY_TO_URL: Record<string, string> = {
  'for-artists': '/for-artists', 'for-djs': '/for-djs', 'for-producers': '/for-producers',
  'for-engineers': '/for-engineers', 'for-business-radio': '/for-business', 'for-tv': '/for-tv',
  'for-labels': '/for-labels', 'for-media': '/for-media', 'for-bloggers': '/for-bloggers',
  'for-venues': '/for-venues',
  'promo-air': '/promo-air', 'promo-lab': '/promo-lab', 'promo-guide': '/promo-guide',
  'charts': '/charts', 'news': '/news', 'concerts': '/concerts', 'marketplace': '/marketplace',
  'djs': '/djs', 'pricing': '/pricing', 'faq': '/faq',
  'support': '/support-info', 'docs': '/docs', 'contacts': '/contact',
  'privacy': '/privacy', 'terms': '/user-agreement', 'consent': '/consent', 'careers': '/careers', 'partners': '/partners',
  'investors': '/investors',
};

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [artistsSubmenuOpen, setArtistsSubmenuOpen] = useState(false);
  const [partnersSubmenuOpen, setPartnersSubmenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const p = location.pathname;
    if (['/for-artists', '/for-djs', '/for-producers', '/for-engineers'].some(x => p.startsWith(x))) {
      setArtistsSubmenuOpen(true);
    }
    if (['/for-business', '/for-tv', '/for-labels', '/for-media', '/for-bloggers'].some(x => p.startsWith(x))) {
      setPartnersSubmenuOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Cmd+K / Ctrl+K keyboard shortcut for search
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

  const isActive = (path: string) => {
    // Exact match or detail page child match (e.g. /concerts matches /concerts/some-id)
    if (location.pathname === path) return true;
    // For content routes: highlight parent when on detail sub-route
    if (path === '/concerts' && location.pathname.startsWith('/concerts/')) return true;
    if (path === '/news' && location.pathname.startsWith('/news/')) return true;
    if (path === '/djs' && location.pathname.startsWith('/djs/')) return true;
    if (path === '/profile' && location.pathname.startsWith('/profile/')) return true;
    return false;
  };
  const isActiveGroup = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));

  const navTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navBtnClass = (active: boolean, customActive?: string) =>
    `w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-2.5 rounded-xl transition-all ${
      active
        ? (customActive || 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10')
        : 'bg-white/5 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ═══ MOBILE HEADER ═══ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-black/85 backdrop-blur-xl border-b border-white/5 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <PromoLogo
            size="xs"
            animated={false}
            glowOnHover={false}
            subtitle="МУЗЫКА"
            onClick={() => { navTo('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            title="На главную"
            customClasses={{
              logo: 'h-8 xs:h-10 w-auto',
              promo: 'text-[18px] xs:text-[22px]',
              subtitle: 'text-[9px] xs:text-[10px]',
              gap: 'gap-1.5 xs:gap-2',
            }}
          />
          <div className="flex items-center gap-1.5 xs:gap-2">
            <Button
              size="sm"
              onClick={() => navTo('/login')}
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
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 p-3 xs:p-4 space-y-1.5 xs:space-y-2 shadow-2xl shadow-black/50 max-h-[75vh] overflow-y-auto"
            >
              <button onClick={() => navTo('/')} className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${location.pathname === '/' ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10' : 'bg-white/5 hover:bg-white/10'}`}>
                <Home className="w-4 h-4 xs:w-5 xs:h-5" />
                <span className="font-bold">Главная</span>
              </button>

              {/* Артистам dropdown */}
              <div>
                <button
                  onClick={() => setArtistsSubmenuOpen(!artistsSubmenuOpen)}
                  className={`w-full flex items-center justify-between gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                    isActiveGroup(['/for-artists', '/for-djs', '/for-producers', '/for-engineers'])
                      ? 'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 xs:gap-3">
                    <Users className="w-4 h-4 xs:w-5 xs:h-5" />
                    <span className="font-bold">Артистам</span>
                  </div>
                  <motion.div animate={{ rotate: artistsSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                {artistsSubmenuOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 ml-2 xs:ml-3 p-2 xs:p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] space-y-1 xs:space-y-1.5">
                    {[
                      { path: '/for-artists', icon: Music, label: 'Артистам', desc: 'Продвижение музыки', color: 'from-pink-500 to-rose-500' },
                      { path: '/for-djs', icon: Disc3, label: 'DJs', desc: 'Миксы и сеты', color: 'from-violet-500 to-purple-500' },
                      { path: '/for-producers', icon: Mic2, label: 'Саундпродюсеры', desc: 'Биты и продакшн', color: 'from-emerald-500 to-green-500' },
                      { path: '/for-engineers', icon: Headphones, label: 'Звукоинженеры', desc: 'Сведение и мастеринг', color: 'from-blue-500 to-indigo-500' },
                    ].map((item, idx) => (
                      <motion.button
                        key={item.path}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.25 }}
                        onClick={() => navTo(item.path)}
                        className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg transition-all text-left ${
                          isActive(item.path) ? `bg-gradient-to-r ${item.color} shadow-md` : 'hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive(item.path) ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-80`}`}>
                          <item.icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs xs:text-sm font-semibold truncate block ${isActive(item.path) ? 'text-white' : 'text-white/90'}`}>{item.label}</span>
                          <p className={`text-[10px] xs:text-[11px] truncate leading-tight mt-0.5 ${isActive(item.path) ? 'text-white/70' : 'text-slate-500'}`}>{item.desc}</p>
                        </div>
                        <ChevronRight className={`w-3 h-3 shrink-0 ${isActive(item.path) ? 'text-white/60' : 'text-white/20'}`} />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Партнёрам dropdown */}
              <div>
                <button
                  onClick={() => setPartnersSubmenuOpen(!partnersSubmenuOpen)}
                  className={`w-full flex items-center justify-between gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${
                    isActiveGroup(['/for-business', '/for-tv', '/for-labels', '/for-media', '/for-bloggers'])
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
                  <motion.div animate={{ rotate: partnersSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                {partnersSubmenuOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 ml-2 xs:ml-3 p-2 xs:p-2.5 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] space-y-1 xs:space-y-1.5">
                    <motion.button initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} onClick={() => navTo('/for-business')}
                      className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg transition-all text-left ${isActive('/for-business') ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md' : 'hover:bg-white/[0.06]'}`}
                    >
                      <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive('/for-business') ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-indigo-500 opacity-80'}`}>
                        <Radio className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs xs:text-sm font-semibold truncate block ${isActive('/for-business') ? 'text-white' : 'text-white/90'}`}>Радиостанциям</span>
                        <p className={`text-[10px] xs:text-[11px] truncate leading-tight mt-0.5 ${isActive('/for-business') ? 'text-white/70' : 'text-slate-500'}`}>Ротация и эфир</p>
                      </div>
                    </motion.button>
                    <div className="flex items-center gap-2 my-1.5 px-2">
                      <div className="flex-1 h-px bg-white/[0.06]" />
                      <span className="text-[8px] xs:text-[9px] font-bold text-white/25 uppercase tracking-wider">Скоро</span>
                      <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>
                    {[
                      { path: '/for-tv', icon: Tv, label: 'Телеканалам', desc: 'Контент для эфира', color: 'from-cyan-500 to-blue-500' },
                      { path: '/for-labels', icon: Disc3, label: 'Лейблам', desc: 'Управление ростером', color: 'from-amber-500 to-orange-500' },
                      { path: '/for-media', icon: Newspaper, label: 'СМИ', desc: 'Пресс-материалы', color: 'from-rose-500 to-pink-500' },
                      { path: '/for-bloggers', icon: Video, label: 'Блогерам', desc: 'Музыка и коллабы', color: 'from-fuchsia-500 to-violet-500' },
                    ].map((item, idx) => (
                      <motion.button key={item.path} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + idx * 0.04 }}
                        onClick={() => navTo(item.path)}
                        className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg transition-all text-left ${isActive(item.path) ? `bg-gradient-to-r ${item.color} shadow-md` : 'hover:bg-white/[0.06]'}`}
                      >
                        <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive(item.path) ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-50`}`}>
                          <item.icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs xs:text-sm font-semibold truncate ${isActive(item.path) ? 'text-white' : 'text-white/60'}`}>{item.label}</span>
                            <span className="shrink-0 text-[8px] xs:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 leading-none">СКОРО</span>
                          </div>
                          <p className={`text-[10px] xs:text-[11px] truncate leading-tight mt-0.5 ${isActive(item.path) ? 'text-white/70' : 'text-slate-500'}`}>{item.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Products + Content + Company */}
              {[
                { path: '/promo-air', icon: Store, label: 'ПРОМО.ЭИР' },
                { path: '/promo-lab', icon: TestTube, label: 'ПРОМО.ЛАБ' },
                { path: '/promo-guide', icon: MapPin, label: 'ПРОМО.ГИД' },
                { path: '/concerts', icon: Calendar, label: 'Концерты' },
                { path: '/djs', icon: Disc3, label: 'Каталог DJs' },
                { path: '/marketplace', icon: ShoppingBag, label: 'Маркетплейс' },
                { path: '/charts', icon: BarChart3, label: 'Чарты' },
                { path: '/news', icon: Newspaper, label: 'Новости' },
                { path: '/for-venues', icon: Building2, label: 'Заведениям' },
                { path: '/pricing', icon: CreditCard, label: 'Тарифы' },
                { path: '/about', icon: Heart, label: 'О нас' },
                { path: '/faq', icon: HelpCircle, label: 'FAQ' },
                { path: '/contact', icon: Mail, label: 'Контакты' },
              ].map((item) => (
                <button key={item.path} onClick={() => navTo(item.path)}
                  className={`w-full flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl transition-all text-sm xs:text-base ${isActive(item.path) ? 'bg-[#FF577F] shadow-md shadow-[#FF577F]/10' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <item.icon className="w-4 h-4 xs:w-5 xs:h-5" />
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile header spacer */}
      <div className="lg:hidden h-[52px] xs:h-[58px]" />

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside className="hidden lg:flex w-60 xl:w-64 2xl:w-72 fixed top-0 left-0 h-screen bg-black/80 backdrop-blur-xl border-r border-white/5 flex-col py-5 xl:py-6 px-3 xl:px-4 z-[130]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FF577F]/5 to-transparent pointer-events-none" />

        {/* Logo */}
        <PromoLogo
          size="md"
          animated={false}
          subtitle="МУЗЫКА"
          className="relative mb-5 xl:mb-8 px-1 xl:px-2"
          customClasses={{
            logo: 'h-9 xl:h-12 w-auto',
            promo: 'text-[22px] xl:text-[28px]',
            subtitle: 'text-[10px] xl:text-xs',
            gap: 'gap-2 xl:gap-3',
          }}
          onClick={() => { navTo('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          title="На главную"
        />

        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 xl:py-2.5 mb-2 xl:mb-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/20 transition-all group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" />
          <span className="text-[12px] xl:text-[13px] text-slate-500 group-hover:text-slate-300 font-medium transition-colors">Поиск...</span>
          <span className="ml-auto text-[9px] xl:text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 xl:gap-2 overflow-y-auto scrollbar-hide pr-0.5">
          {/* Главная */}
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
            onClick={() => { navTo('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={navBtnClass(location.pathname === '/')}
          >
            <Home className="w-4 h-4 xl:w-5 xl:h-5" />
            <span className="text-[13px] xl:text-sm font-bold">Главная</span>
          </motion.button>

          {/* Артистам dropdown */}
          <div>
            <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
              onClick={() => setArtistsSubmenuOpen(!artistsSubmenuOpen)}
              className={navBtnClass(
                isActiveGroup(['/for-artists', '/for-djs', '/for-producers', '/for-engineers']),
                'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
              )}
            >
              <div className="flex items-center gap-2 xl:gap-3 flex-1">
                <Users className="w-4 h-4 xl:w-5 xl:h-5" />
                <span className="text-[13px] xl:text-sm font-bold">Артистам</span>
              </div>
              <motion.div animate={{ rotate: artistsSubmenuOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                <ChevronDown className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              </motion.div>
            </motion.button>
            {artistsSubmenuOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                className="mt-1.5 xl:mt-2 p-1.5 xl:p-2 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] space-y-0.5 xl:space-y-1"
              >
                {[
                  { path: '/for-artists', icon: Music, label: 'Артистам', desc: 'Продвижение музыки', color: 'from-pink-500 to-rose-500' },
                  { path: '/for-djs', icon: Disc3, label: 'DJs', desc: 'Миксы и сеты', color: 'from-violet-500 to-purple-500' },
                  { path: '/for-producers', icon: Mic2, label: 'Продюсерам', desc: 'Биты и продакшн', color: 'from-emerald-500 to-green-500' },
                  { path: '/for-engineers', icon: Headphones, label: 'Инженерам', desc: 'Сведение и мастеринг', color: 'from-blue-500 to-indigo-500' },
                ].map((item, idx) => (
                  <motion.button key={item.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.2 }} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navTo(item.path)}
                    className={`group w-full flex items-center gap-2 xl:gap-2.5 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all text-left ${isActive(item.path) ? `bg-gradient-to-r ${item.color} shadow-md` : 'hover:bg-white/[0.05]'}`}
                  >
                    <div className={`w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive(item.path) ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-70 group-hover:opacity-100`}`}>
                      <item.icon className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] xl:text-[13px] font-semibold truncate block leading-tight ${isActive(item.path) ? 'text-white' : 'text-white/85 group-hover:text-white'}`}>{item.label}</span>
                      <p className={`text-[9px] xl:text-[10px] truncate leading-tight mt-0.5 ${isActive(item.path) ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-500'}`}>{item.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Партнёрам dropdown */}
          <div>
            <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
              onClick={() => setPartnersSubmenuOpen(!partnersSubmenuOpen)}
              className={navBtnClass(
                isActiveGroup(['/for-business', '/for-tv', '/for-labels', '/for-media', '/for-bloggers']),
                'bg-gradient-to-r from-[#FF577F] to-[#FF577F]/80 shadow-md shadow-[#FF577F]/20'
              )}
            >
              <div className="flex items-center gap-2 xl:gap-3 flex-1">
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
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                className="mt-1.5 xl:mt-2 p-1.5 xl:p-2 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06]"
              >
                <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navTo('/for-business')}
                  className={`group w-full flex items-center gap-2 xl:gap-2.5 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all text-left ${isActive('/for-business') ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md' : 'hover:bg-white/[0.05]'}`}
                >
                  <div className={`w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg flex items-center justify-center shrink-0 ${isActive('/for-business') ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-indigo-500 opacity-70 group-hover:opacity-100'}`}>
                    <Radio className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[11px] xl:text-[13px] font-semibold truncate block leading-tight ${isActive('/for-business') ? 'text-white' : 'text-white/85 group-hover:text-white'}`}>Радиостанциям</span>
                    <p className={`text-[9px] xl:text-[10px] truncate leading-tight mt-0.5 ${isActive('/for-business') ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-500'}`}>Ротация и эфир</p>
                  </div>
                </motion.button>
                <div className="flex items-center gap-2 my-1.5 xl:my-2 px-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                  <span className="text-[8px] xl:text-[9px] font-bold text-white/25 uppercase tracking-wider shrink-0">Скоро</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
                </div>
                <div className="space-y-0.5 xl:space-y-1">
                  {[
                    { path: '/for-tv', icon: Tv, label: 'Телеканалам', desc: 'Контент для эфира', color: 'from-cyan-500 to-blue-500' },
                    { path: '/for-labels', icon: Disc3, label: 'Лейблам', desc: 'Управление ростером', color: 'from-amber-500 to-orange-500' },
                    { path: '/for-media', icon: Newspaper, label: 'СМИ', desc: 'Пресс-материалы', color: 'from-rose-500 to-pink-500' },
                    { path: '/for-bloggers', icon: Video, label: 'Блогерам', desc: 'Музыка и коллабы', color: 'from-fuchsia-500 to-violet-500' },
                  ].map((item, idx) => (
                    <motion.button key={item.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.04, duration: 0.2 }} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                      onClick={() => navTo(item.path)}
                      className={`group w-full flex items-center gap-2 xl:gap-2.5 px-2 xl:px-2.5 py-1.5 xl:py-2 rounded-lg transition-all text-left ${isActive(item.path) ? `bg-gradient-to-r ${item.color} shadow-md` : 'hover:bg-white/[0.05]'}`}
                    >
                      <div className={`w-6 h-6 xl:w-7 xl:h-7 rounded-md xl:rounded-lg flex items-center justify-center shrink-0 transition-all ${isActive(item.path) ? 'bg-white/20' : `bg-gradient-to-br ${item.color} opacity-50 group-hover:opacity-80`}`}>
                        <item.icon className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-[11px] xl:text-[13px] font-semibold truncate leading-tight ${isActive(item.path) ? 'text-white' : 'text-white/60 group-hover:text-white/85'}`}>{item.label}</span>
                          <span className={`shrink-0 text-[7px] xl:text-[8px] font-bold px-1 xl:px-1.5 py-px rounded-full leading-none ${isActive(item.path) ? 'bg-white/20 text-white/80' : 'bg-white/[0.06] text-white/30'}`}>СКОРО</span>
                        </div>
                        <p className={`text-[9px] xl:text-[10px] truncate leading-tight mt-0.5 ${isActive(item.path) ? 'text-white/70' : 'text-slate-600 group-hover:text-slate-500'}`}>{item.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Продукты ── */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-0.5">
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
            <span className="text-[8px] xl:text-[9px] font-bold text-white/20 uppercase tracking-widest shrink-0">Продукты</span>
            <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
          </div>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/promo-air')} className={navBtnClass(isActive('/promo-air'))}>
            <Store className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">ПРОМО.ЭИР</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/promo-lab')} className={navBtnClass(isActive('/promo-lab'))}>
            <TestTube className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">ПРОМО.ЛАБ</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/promo-guide')} className={navBtnClass(isActive('/promo-guide'))}>
            <MapPin className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">ПРОМО.ГИД</span>
          </motion.button>

          {/* ── Контент ── */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-0.5">
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
            <span className="text-[8px] xl:text-[9px] font-bold text-white/20 uppercase tracking-widest shrink-0">Контент</span>
            <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
          </div>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/concerts')} className={navBtnClass(isActive('/concerts'))}>
            <Calendar className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">Концерты</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/djs')} className={navBtnClass(isActive('/djs'))}>
            <Disc3 className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">Каталог DJs</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/marketplace')} className={navBtnClass(isActive('/marketplace'), 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/10')}>
            <ShoppingBag className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">Маркетплейс</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/charts')} className={navBtnClass(isActive('/charts'))}>
            <BarChart3 className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">Чарты</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/news')} className={navBtnClass(isActive('/news'))}>
            <Newspaper className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">Новости</span>
          </motion.button>

          {/* ── Компания ── */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-0.5">
            <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
            <span className="text-[8px] xl:text-[9px] font-bold text-white/20 uppercase tracking-widest shrink-0">Компания</span>
            <div className="flex-1 h-px bg-gradient-to-l from-white/[0.06] to-transparent" />
          </div>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/about')} className={navBtnClass(isActive('/about'))}>
            <Heart className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">О нас</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/faq')} className={navBtnClass(isActive('/faq'))}>
            <HelpCircle className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">FAQ</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }} onClick={() => navTo('/contact')} className={navBtnClass(isActive('/contact'))}>
            <Mail className="w-4 h-4 xl:w-5 xl:h-5" /><span className="text-[13px] xl:text-sm font-bold">Контакты</span>
          </motion.button>
        </nav>

        {/* Login Button */}
        <div className="relative shrink-0">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4 xl:mb-5" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navTo('/login')}
            className="w-full flex items-center justify-center gap-2 xl:gap-3 px-3 xl:px-4 py-3 xl:py-3.5 rounded-xl bg-gradient-to-r from-[#FF577F] to-[#FF3366] hover:from-[#FF4D7D] hover:to-[#FF2255] shadow-lg shadow-[#FF577F]/20 transition-all border border-[#FF577F]/50"
          >
            <LogIn className="w-4 h-4 xl:w-5 xl:h-5" />
            <span className="text-[13px] xl:text-sm font-bold">Войти</span>
          </motion.button>
        </div>
      </aside>

      {/* ═══ CONTENT ═══ */}
      <div className="lg:ml-60 xl:ml-64 2xl:ml-72">
        <main className="min-h-screen">
          <PageBanner pathname={location.pathname} onNavigate={navTo} />
          <Outlet />
        </main>

        {/* ── FOOTER ── */}
        <UnifiedFooter />
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onArtistClick={(id) => {
          navigate(`/profile/${id}`);
          setSearchOpen(false);
        }}
        onNavigate={(page) => {
          const url = NAV_KEY_TO_URL[page] || `/${page}`;
          navigate(url);
          setSearchOpen(false);
        }}
      />
    </div>
  );
}