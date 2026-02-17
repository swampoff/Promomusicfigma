/**
 * PUBLIC PAGES - Thin wrappers for standalone public routes
 * Each component renders a lazy-loaded landing sub-page
 * with route-level Suspense handled by React Router
 */

import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Music, Users, Building2, Headphones, Radio, Mic2, Globe, Zap, Shield,
  TrendingUp, Heart, Star, ArrowRight, Disc3, Calendar, BarChart3, Sparkles,
  Target, Award, MapPin, Store, TestTube, ChevronRight, LogIn,
} from 'lucide-react';
import { aboutImage as aboutHeroImg } from '@/app/assets/banners';

// ── Eagerly loaded pages (small, no props) ──
import { ContactsPage as ContactsContent } from '@/app/components/landing/ContactsPage';
import { PrivacyPage as PrivacyContent } from '@/app/components/landing/PrivacyPage';
import { OfferPage as OfferContent } from '@/app/components/landing/OfferPage';
import { UserAgreementPage as UserAgreementContent } from '@/app/components/landing/UserAgreementPage';
import { ConsentPage as ConsentContent } from '@/app/components/landing/ConsentPage';
import { DocsPage as DocsContent } from '@/app/components/landing/DocsPage';
import { CareersPage as CareersContent } from '@/app/components/landing/CareersPage';
import { PartnersPage as PartnersContent } from '@/app/components/landing/PartnersPage';

// ── Eagerly loaded pages (with onGetStarted) ──
import { ForArtistsPage } from '@/app/components/landing/ForArtistsPage';
import { ForDJsPage } from '@/app/components/landing/ForDJsPage';
import { ForProducersPage } from '@/app/components/landing/ForProducersPage';
import { ForEngineersPage } from '@/app/components/landing/ForEngineersPage';
import { ForBusinessPage } from '@/app/components/landing/ForBusinessPage';
import { ForTVPage } from '@/app/components/landing/ForTVPage';
import { ForLabelsPage } from '@/app/components/landing/ForLabelsPage';
import { ForMediaPage } from '@/app/components/landing/ForMediaPage';
import { ForBloggersPage } from '@/app/components/landing/ForBloggersPage';
import { PromoAirPage } from '@/app/components/landing/PromoAirPage';
import { PromoLabPage } from '@/app/components/landing/PromoLabPage';
import { PromoGuidePage } from '@/app/components/landing/PromoGuidePage';
import { SupportPage as SupportContent } from '@/app/components/landing/SupportPage';
import { MarketplacePage } from '@/app/components/landing/MarketplacePage';
import { ArtistPublicProfile } from '@/app/components/landing/ArtistPublicProfile';

// ── New page imports ──
import { PricingPage } from '@/app/components/landing/PricingPage';
import { DjCatalogPage } from '@/app/components/landing/DjCatalogPage';
import { DjProfilePage, type DjProfileData } from '@/app/components/landing/DjProfilePage';
import { NewsDetailPage } from '@/app/components/landing/NewsDetailPage';
import { ConcertDetailPage } from '@/app/components/landing/ConcertDetailPage';
import { ForVenuesPage } from '@/app/components/landing/ForVenuesPage';
import { FaqPage } from '@/app/components/landing/FaqPage';
import { InvestorsPage } from '@/app/components/landing/InvestorsPage';

// ── Content sections (no props) ──
import { ChartsSection } from '@/app/components/landing/ChartsSection';
import { ConcertsSection } from '@/app/components/landing/ConcertsSection';
import { NewsSection } from '@/app/components/landing/NewsSection';

// ═══════════════════════════════════════════
// Helper: wraps page content in a styled container
// ═══════════════════════════════════════════

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-72px)]">
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════
// "FOR X" PAGES
// ═══════════════════════════════════════════

export function ForArtistsRoute() {
  const navigate = useNavigate();
  return <PageShell><ForArtistsPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForDJsRoute() {
  const navigate = useNavigate();
  return <PageShell><ForDJsPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForProducersRoute() {
  const navigate = useNavigate();
  return <PageShell><ForProducersPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForEngineersRoute() {
  const navigate = useNavigate();
  return <PageShell><ForEngineersPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForBusinessRoute() {
  const navigate = useNavigate();
  return <PageShell><ForBusinessPage onGetStarted={() => navigate('/login')} initialTab="radio" /></PageShell>;
}

export function ForTVRoute() {
  const navigate = useNavigate();
  return <PageShell><ForTVPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForLabelsRoute() {
  const navigate = useNavigate();
  return <PageShell><ForLabelsPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForMediaRoute() {
  const navigate = useNavigate();
  return <PageShell><ForMediaPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForBloggersRoute() {
  const navigate = useNavigate();
  return <PageShell><ForBloggersPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function ForVenuesRoute() {
  const navigate = useNavigate();
  return <PageShell><ForVenuesPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

// ═══════════════════════════════════════════
// PRODUCT PAGES
// ═══════════════════════════════════════════

export function PromoAirRoute() {
  const navigate = useNavigate();
  return <PageShell><PromoAirPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function PromoLabRoute() {
  const navigate = useNavigate();
  return <PageShell><PromoLabPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function PromoGuideRoute() {
  const navigate = useNavigate();
  return <PageShell><PromoGuidePage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function PricingRoute() {
  const navigate = useNavigate();
  return <PageShell><PricingPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function DjCatalogRoute() {
  const navigate = useNavigate();
  return <PageShell><DjCatalogPage onDjClick={(djId) => navigate(`/djs/${djId}`)} onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function DjPublicProfileRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dj, setDj] = useState<DjProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    import('@/utils/api/dj-marketplace').then(({ fetchDjProfile }) => {
      fetchDjProfile(id).then(data => {
        if (data) setDj(data as DjProfileData);
        setLoading(false);
      });
    });
  }, [id]);

  if (!id) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32 text-white/40">DJ не найден</div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32 text-white/40">Загрузка...</div>
      </PageShell>
    );
  }

  if (!dj) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-32 text-white/40">
          <div className="text-lg font-bold mb-2">DJ не найден</div>
          <button onClick={() => navigate('/djs')} className="text-sm text-purple-400 hover:text-purple-300">
            Вернуться в каталог
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <DjProfilePage dj={dj} onBack={() => {
        if (window.history.state?.idx > 0) navigate(-1);
        else navigate('/djs');
      }} onBook={() => navigate('/login')} />
    </PageShell>
  );
}

export function FaqRoute() {
  const navigate = useNavigate();
  return <PageShell><FaqPage onGetStarted={() => navigate('/support-info')} /></PageShell>;
}

export function InvestorsRoute() {
  const navigate = useNavigate();
  return <PageShell><InvestorsPage onGetStarted={() => navigate('/login')} /></PageShell>;
}

// ═══════════════════════════════════════════
// CONTENT PAGES
// ═══════════════════════════════════════════

export function ChartsRoute() {
  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ChartsSection />
      </div>
    </PageShell>
  );
}

export function ConcertsRoute() {
  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ConcertsSection />
      </div>
    </PageShell>
  );
}

export function NewsRoute() {
  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <NewsSection />
      </div>
    </PageShell>
  );
}

export function MarketplaceRoute() {
  const navigate = useNavigate();
  return <PageShell><MarketplacePage onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function NewsDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32 text-white/40">
          Новость не найдена
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <NewsDetailPage
        newsId={id}
        onBack={() => {
          if (window.history.state?.idx > 0) navigate(-1);
          else navigate('/news');
        }}
      />
    </PageShell>
  );
}

export function ConcertDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32 text-white/40">
          Концерт не найден
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ConcertDetailPage
        concertId={id}
        onBack={() => {
          if (window.history.state?.idx > 0) navigate(-1);
          else navigate('/concerts');
        }}
      />
    </PageShell>
  );
}

// ═══════════════════════════════════════════
// ARTIST PUBLIC PROFILE
// ═══════════════════════════════════════════

export function ArtistProfileRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32 text-white/40">
          Артист не найден
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ArtistPublicProfile
        artistId={id}
        onBack={() => navigate(-1)}
        onPlayTrack={() => {}}
        onArtistNavigate={(artistId, artistName) => navigate(`/profile/${artistId}`)}
      />
    </PageShell>
  );
}

// ═══════════════════════════════════════════
// INFO PAGES
// ═══════════════════════════════════════════

export function ContactRoute() {
  return <PageShell><ContactsContent /></PageShell>;
}

export function PrivacyRoute() {
  return <PageShell><PrivacyContent /></PageShell>;
}

export function OfferRoute() {
  return <PageShell><OfferContent /></PageShell>;
}

export function SupportInfoRoute() {
  const navigate = useNavigate();
  return <PageShell><SupportContent onGetStarted={() => navigate('/login')} /></PageShell>;
}

export function TermsRoute() {
  return <Navigate to="/user-agreement" replace />;
}

export function UserAgreementRoute() {
  return <PageShell><UserAgreementContent /></PageShell>;
}

export function ConsentRoute() {
  return <PageShell><ConsentContent /></PageShell>;
}

export function DocsRoute() {
  return <PageShell><DocsContent /></PageShell>;
}

export function CareersRoute() {
  return <PageShell><CareersContent /></PageShell>;
}

export function PartnersRoute() {
  return <PageShell><PartnersContent /></PageShell>;
}

// ═══════════════════════════════════════════
// ABOUT PAGE - Beautiful glassmorphism design
// ═══════════════════════════════════════════

const STATS = [
  { value: '10K+', label: 'Артистов', icon: Music },
  { value: '500+', label: 'Заведений', icon: Building2 },
  { value: '50K+', label: 'Слушателей', icon: Headphones },
  { value: '100+', label: 'Радиостанций', icon: Radio },
];

const VALUES = [
  {
    icon: Heart,
    title: 'Для музыкантов',
    desc: 'Мы создаём инструменты, которые помогают артистам продвигать свою музыку, находить аудиторию и зарабатывать.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Building2,
    title: 'Для бизнеса',
    desc: 'Заведения получают легальную музыку, персонализированные плейлисты и аналитику предпочтений гостей.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Для сообщества',
    desc: 'ПРОМО.ГИД позволяет слушателям открывать новую музыку через любимые места и делиться впечатлениями.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Технологии',
    desc: 'Анализ треков, умные рекомендации, real-time аналитика и автоматическое программирование эфира.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Лицензирование',
    desc: 'Полностью легальное использование музыки с прозрачной системой роялти и отчётности.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Globe,
    title: 'Экосистема',
    desc: 'Единая платформа, объединяющая артистов, продюсеров, DJs, радиостанции, заведения и слушателей.',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

const PRODUCTS = [
  {
    name: 'ПРОМО.МУЗЫКА',
    desc: 'Маркетинговая платформа для артистов - продвижение, аналитика, монетизация',
    icon: Music,
    color: 'from-[#FF577F] to-[#FF3366]',
    path: '/',
  },
  {
    name: 'ПРОМО.ЭИР',
    desc: 'Единое радио для заведений с легальной музыкой и умным программированием',
    icon: Store,
    color: 'from-blue-500 to-cyan-500',
    path: '/promo-air',
  },
  {
    name: 'ПРОМО.ГИД',
    desc: 'Shazam наоборот - узнайте, какая музыка играет в вашем любимом месте',
    icon: MapPin,
    color: 'from-violet-500 to-indigo-500',
    path: '/promo-guide',
  },
  {
    name: 'ПРОМО.ЛАБ',
    desc: 'Эксперты оценят ваш трек перед релизом - тест-драйв для музыки',
    icon: TestTube,
    color: 'from-purple-500 to-pink-500',
    path: '/promo-lab',
  },
];

const TIMELINE = [
  { year: '2024', title: 'Идея', desc: 'Концепция экосистемы, объединяющей музыкантов и бизнес' },
  { year: '2025', title: 'Запуск', desc: 'Бета-версия ПРОМО.МУЗЫКА и ПРОМО.ЭИР для первых партнёров' },
  { year: '2026', title: 'Рост', desc: 'Открытие платформы, запуск ПРОМО.ГИД и ПРОМО.ЛАБ' },
  { year: '2027', title: 'Масштаб', desc: 'Международная экспансия и новые продукты экосистемы' },
];

export function AboutRoute() {
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="relative">
        {/* ── Full-width Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full overflow-hidden"
        >
          <img
            src={aboutHeroImg}
            alt="О нас - ПРОМО.МУЗЫКА"
            className="w-full h-auto block"
          />
        </motion.div>

        {/* ── Mission Section ── */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF577F]/10 border border-[#FF577F]/20 text-[#FF577F] text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Наша миссия
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-6">
                Музыка - не фон.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">
                  Музыка - связь.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Мы создаём экосистему, где каждый трек находит своего слушателя, каждый артист - свою аудиторию,
                а каждое заведение - свой уникальный саундтрек.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-16 sm:mb-20">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                  className="relative group"
                >
                  <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-5 sm:p-6 text-center hover:bg-white/[0.06] hover:border-[#FF577F]/20 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#FF3366]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF577F]" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values Grid ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3">
                Что мы делаем
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="group rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 sm:p-6 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <v.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products Ecosystem ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF577F]/[0.02] to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3">
                Наши продукты
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Четыре продукта, объединённые общей экосистемой
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {PRODUCTS.map((p, i) => (
                <motion.button
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(p.path)}
                  className="group relative rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] p-6 sm:p-7 text-left hover:border-white/15 transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${p.color} opacity-[0.04] group-hover:opacity-[0.08] rounded-bl-full transition-opacity`} />
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <p.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      {p.name}
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3">
                Наш путь
              </h2>
            </motion.div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#FF577F]/40 via-white/10 to-transparent" />

              <div className="space-y-6 sm:space-y-8">
                {TIMELINE.map((t, i) => (
                  <motion.div
                    key={t.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                    className="relative pl-16 sm:pl-20"
                  >
                    {/* Dot */}
                    <div className={`absolute left-[18px] sm:left-[26px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                      i === 2 ? 'bg-[#FF577F] border-[#FF577F] shadow-md shadow-[#FF577F]/30' : 'bg-black border-white/20'
                    }`} />
                    <div className="text-xs font-bold text-[#FF577F] mb-1">{t.year}</div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">{t.title}</h3>
                    <p className="text-sm text-slate-400">{t.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF577F] to-[#FF3366] opacity-10" />
              <div className="absolute inset-0 border border-[#FF577F]/20 rounded-2xl" />
              <div className="relative p-8 sm:p-10 text-center">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
                  Присоединяйтесь к экосистеме
                </h2>
                <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-md mx-auto">
                  Начните продвигать свою музыку или подключите заведение к ПРОМО.ЭИР уже сегодня
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white font-bold text-sm shadow-xl shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-shadow"
                >
                  <LogIn className="w-4 h-4" />
                  Начать бесплатно
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}