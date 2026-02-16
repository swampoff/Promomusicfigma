/**
 * FOR BUSINESS PAGE - Страница "Для радиостанций"
 * ОТЛИЧИЯ ОТ ДРУГИХ СТРАНИЦ:
 * - Горизонтальный таймлайн подключения станции (вместо grid-шагов)
 * - Секция "Без платформы vs С платформой" (сравнительная таблица)
 * - Animated radio wave SVG watermark
 * - Бесплатная модель (один бесплатный тариф-карточка)
 * - Compact "что получают артисты" секция (value for artists = value for radio)
 * - Калькулятор монетизации эфира (интерактивный)
 * - Live-данные о радиостанциях-партнёрах (API)
 * - Testimonials от радиостанций
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Radio, Music, BarChart3, CheckCircle2, Zap, Crown, ArrowRight,
  Globe, Shield, TrendingUp, Users, Play,
  MessageSquare, Wifi, Podcast, Activity, Star,
  FileText, Settings, X, Check, Award,
  Layers, Volume2, Send, Minus, Plus, Banknote,
  Loader2, MapPin
} from 'lucide-react';
import radioHeroImage from 'figma:asset/0b4ae0d95b5c0202cc4c28a035ce984a54ded32a.png';
import * as landingApi from '@/utils/api/landing-data';
import type { RadioPartner } from '@/utils/api/landing-data';

interface ForBusinessPageProps {
  onGetStarted: () => void;
  initialTab?: 'radio' | 'venues';
}

export function ForBusinessPage({ onGetStarted }: ForBusinessPageProps) {

  /* ═══════ INTERACTIVE MONETIZATION CALCULATOR ═══════ */
  const [adSlotsPerDay, setAdSlotsPerDay] = useState(8);
  const [avgSlotPrice, setAvgSlotPrice] = useState(3000);
  const [sponsoredTracksPerMonth, setSponsoredTracksPerMonth] = useState(10);
  const [avgSponsorPrice, setAvgSponsorPrice] = useState(5000);
  const [regionKey, setRegionKey] = useState<string>('million');

  const REGIONS = [
    { key: 'moscow', label: 'Москва', coeff: 1.5, desc: 'x1.5' },
    { key: 'spb', label: 'Санкт-Петербург', coeff: 1.3, desc: 'x1.3' },
    { key: 'million', label: 'Миллионники', coeff: 1.0, desc: 'x1.0' },
    { key: 'region', label: 'Регионы', coeff: 0.7, desc: 'x0.7' },
  ];

  const regionCoeff = REGIONS.find(r => r.key === regionKey)?.coeff ?? 1.0;

  const calcAdRevenue = Math.round(adSlotsPerDay * avgSlotPrice * 30 * regionCoeff);
  const calcSponsorRevenue = Math.round(sponsoredTracksPerMonth * avgSponsorPrice * regionCoeff);
  const calcTotalMonthly = calcAdRevenue + calcSponsorRevenue;
  const calcYearly = calcTotalMonthly * 12;

  /* ═══════ LIVE RADIO PARTNERS ═══════ */
  const [radioPartners, setRadioPartners] = useState<RadioPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);

  const fetchPartners = useCallback(async () => {
    setPartnersLoading(true);
    try {
      const result = await landingApi.getRadioPartners();
      if (result.success && result.data) {
        setRadioPartners(result.data);
      }
    } catch (e) {
      console.error('Error fetching radio partners:', e);
    }
    setPartnersLoading(false);
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const totalAudience = radioPartners.reduce((s, r) => s + (r.audienceSize || 0), 0);

  /* ═══════ DATA ═══════ */

  const comparisonRows = [
    { feature: 'Поиск контента', without: 'Самостоятельный поиск треков', with: 'Артисты присылают контент бесплатно', advantage: true },
    { feature: 'Модерация', without: 'Ручная проверка каждого трека', with: 'Система рейтингов и автофильтрации', advantage: true },
    { feature: 'Аналитика', without: 'Нет данных об эфире', with: 'Детальная статистика по трекам и слушателям', advantage: true },
    { feature: 'Монетизация', without: 'Только прямые рекламодатели', with: 'Рекламные слоты + спонсорство от артистов', advantage: true },
    { feature: 'Правовая защита', without: 'Риски претензий РАО', with: 'Все треки лицензионно чисты', advantage: true },
    { feature: 'Профиль станции', without: 'Только свой сайт', with: 'Публичный профиль в каталоге Promo.music', advantage: true },
    { feature: 'Интеграция', without: 'Ручной импорт треков', with: 'API + автоматическая ротация', advantage: true },
    { feature: 'Стоимость', without: 'Платные библиотеки', with: 'Полностью бесплатно', advantage: true },
  ];

  const timelineSteps = [
    { icon: FileText, label: 'Регистрация', sub: 'Профиль станции' },
    { icon: Settings, label: 'Настройка', sub: 'Формат, жанры, регион' },
    { icon: Send, label: 'Приём треков', sub: 'Артисты присылают' },
    { icon: Radio, label: 'В эфир', sub: 'Треки в ротации' },
    { icon: BarChart3, label: 'Аналитика', sub: 'Статистика и доход' },
  ];

  const coreFeatures = [
    {
      icon: Music,
      title: 'Монетизация эфира',
      points: ['Рекламные слоты по времени суток', 'Спонсорские интеграции', 'Прозрачная финансовая модель', 'Автоматические выплаты'],
      accent: 'cyan',
    },
    {
      icon: Users,
      title: 'Прямая связь с артистами',
      points: ['Артисты присылают треки бесплатно', 'Система модерации и рейтингов', 'Рекомендации под формат', 'Чат с артистами'],
      accent: 'teal',
    },
    {
      icon: BarChart3,
      title: 'Детальная аналитика',
      points: ['Статистика эфирного времени', 'Популярные треки и жанры', 'Отчёты для рекламодателей', 'Экспорт данных'],
      accent: 'blue',
    },
    {
      icon: Zap,
      title: 'Автоматизация ротации',
      points: ['API для системы вещания', 'Плейлисты по времени суток', 'Авто-подбор по формату', 'Интеграция с Promo.air'],
      accent: 'indigo',
    },
  ];

  const extraTools = [
    { icon: Globe, label: 'Публичный профиль' },
    { icon: Shield, label: 'Правовая защита' },
    { icon: Podcast, label: 'Подкасты' },
    { icon: Layers, label: 'Плейлисты' },
    { icon: MessageSquare, label: 'Чат' },
    { icon: Activity, label: 'Real-time эфир' },
    { icon: Volume2, label: 'Promo.air' },
    { icon: Award, label: 'Рейтинг станции' },
  ];

  const radioStats = [
    { icon: Radio, value: '500+', label: 'Радиостанций', color: 'text-purple-400' },
    { icon: Music, value: '5K+', label: 'Треков в базе', color: 'text-violet-400' },
    { icon: Users, value: '150K+', label: 'Слушателей', color: 'text-indigo-400' },
    { icon: TrendingUp, value: '24/7', label: 'Работаем', color: 'text-fuchsia-400' },
  ];

  const accentColor = (a: string) => {
    const map: Record<string, string> = {
      cyan: 'from-purple-500 to-violet-500',
      teal: 'from-violet-500 to-fuchsia-500',
      blue: 'from-indigo-500 to-purple-500',
      indigo: 'from-fuchsia-500 to-indigo-500',
    };
    return map[a] || map.cyan;
  };

  const accentText = (a: string) => {
    const map: Record<string, string> = {
      cyan: 'text-purple-400',
      teal: 'text-violet-400',
      blue: 'text-indigo-400',
      indigo: 'text-fuchsia-400',
    };
    return map[a] || map.cyan;
  };

  /* ═══════ RENDER ═══════ */

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">

      {/* ═══════ HERO IMAGE ═══════ */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[65vh] xl:h-[70vh] max-h-[700px] overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] xl:w-[500px] h-[250px] sm:h-[300px] xl:h-[350px] bg-purple-600 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-1/3 right-1/4 w-[250px] sm:w-[350px] xl:w-[400px] h-[200px] sm:h-[250px] xl:h-[300px] bg-violet-600 rounded-full"
            style={{ filter: 'blur(100px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute bottom-1/4 left-1/4 w-[220px] sm:w-[300px] xl:w-[350px] h-[180px] sm:h-[220px] xl:h-[250px] bg-indigo-500 rounded-full"
            style={{ filter: 'blur(110px)' }}
          />
        </div>

        <motion.img
          src={radioHeroImage}
          alt="Радио на Promo.music"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: [1, 1.01, 1] }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeOut' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 50%', mixBlendMode: 'lighten' }}
        />

        {/* Radio wave particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className={`absolute rounded-full ${i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-violet-400' : 'bg-indigo-400'}`}
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${10 + i * 10}%`,
              bottom: `${20 + (i % 3) * 15}%`,
            }}
            animate={{ y: [0, -35 - i * 4, 0], opacity: [0, 0.8, 0], scale: [0.5, 1.4, 0.5] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
          />
        ))}

        {/* Animated radio wave watermark */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-6 right-6 sm:top-10 sm:right-10 w-16 h-16 sm:w-24 sm:h-24"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <circle cx="50" cy="70" r="8" fill="currentColor" />
            <path d="M30,55 Q50,25 70,55" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20,45 Q50,5 80,45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10,38 Q50,-10 90,38" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>

        <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-52 bg-gradient-to-t from-[#0a0a14] via-black/90 to-transparent" />

        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-3 sm:px-5 lg:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-purple-500/20 mb-4">
              <Radio className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white/90">Бесплатно для радиостанций</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl xl:text-6xl font-black leading-tight max-w-3xl">
              <span className="block text-white/90">Качественный контент</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                для вашего эфира
              </motion.span>
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group mt-5 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2"
            >
              <Radio className="w-5 h-5" /> Подключить станцию <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA + QUICK BENEFITS ═══════ */}
      <section className="relative py-8 sm:py-10 px-3 sm:px-5 lg:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-5 leading-relaxed">
              Получайте треки от артистов, монетизируйте эфир и управляйте контентом с полной аналитикой.
              Все функции платформы доступны бесплатно для радиостанций.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
                className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2">
                Подключить станцию <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-xl font-bold text-base border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2">
                <Play className="w-4 h-4" /> Смотреть демо
              </motion.button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
              {['Полностью бесплатно', 'Без скрытых платежей', 'API-интеграция', 'Поддержка 24/7'].map((t, i) => (
                <span key={i} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-purple-400" />{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            {radioStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-5 border border-white/10 text-center group hover:bg-white/10 transition-all"
                >
                  <Icon className={`w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-2 lg:mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-2xl lg:text-3xl font-black mb-0.5 lg:mb-1">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ HORIZONTAL CONNECTION TIMELINE (уникальный) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-6">
          Путь к <span className="text-purple-400">подключению</span>
        </motion.h2>

        {/* Desktop: horizontal line with dots */}
        <div className="hidden sm:block relative">
          <div className="absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-purple-500/40 via-violet-500/30 to-purple-500/40" />
          <div className="flex justify-between px-[5%]">
            {timelineSteps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center text-center w-[18%]"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/20 relative z-10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">{s.label}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">{s.sub}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="sm:hidden space-y-3">
          {timelineSteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">{s.label}</span>
                  <span className="text-xs text-gray-500 ml-2">{s.sub}</span>
                </div>
                {i < timelineSteps.length - 1 && <ArrowRight className="w-3 h-3 text-purple-500/40 ml-auto" />}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE (уникальная секция) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-black mb-1">
            Без платформы <span className="text-gray-500">vs</span> <span className="text-purple-400">С PROMO.MUSIC</span>
          </h2>
          <p className="text-xs text-gray-500">Почему радиостанции выбирают нас</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr,1fr,1fr] text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
            <div className="px-3 py-2.5 lg:px-4" />
            <div className="px-3 py-2.5 lg:px-4 text-center text-gray-600">Без платформы</div>
            <div className="px-3 py-2.5 lg:px-4 text-center text-purple-400">PROMO.MUSIC</div>
          </div>
          {/* Rows */}
          {comparisonRows.map((row, i) => (
            <div key={i} className={`grid grid-cols-[1fr,1fr,1fr] text-[10px] lg:text-xs items-center ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} ${i < comparisonRows.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="px-3 py-2 lg:px-4 lg:py-3 font-bold text-white/80">{row.feature}</div>
              <div className="px-3 py-2 lg:px-4 lg:py-3 text-center text-gray-600 flex items-center justify-center gap-1">
                <X className="w-3 h-3 text-red-500/50 hidden sm:block" />
                <span className="line-clamp-2">{row.without}</span>
              </div>
              <div className="px-3 py-2 lg:px-4 lg:py-3 text-center text-purple-300 flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-green-400 flex-shrink-0 hidden sm:block" />
                <span className="line-clamp-2">{row.with}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════ CORE FEATURES - ZIGZAG LAYOUT (уникальный) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-6">
          Что внутри <span className="text-purple-400">кабинета радиостанции</span>
        </motion.h2>

        <div className="space-y-3 lg:space-y-4">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * idx }}
                className="bg-white/[0.04] backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/20 transition-all overflow-hidden"
              >
                <div className={`flex flex-col sm:flex-row ${!isEven ? 'sm:flex-row-reverse' : ''} items-stretch`}>
                  {/* Icon block */}
                  <div className={`flex items-center justify-center p-4 sm:p-5 sm:w-[140px] lg:w-[160px] bg-gradient-to-br ${accentColor(feat.accent)} flex-shrink-0`}>
                    <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-3 sm:p-4 lg:p-5">
                    <h3 className="text-sm lg:text-base font-black text-white mb-2">{feat.title}</h3>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {feat.points.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[10px] lg:text-xs text-gray-300">
                          <CheckCircle2 className={`w-3 h-3 flex-shrink-0 mt-0.5 ${accentText(feat.accent)}`} />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ EXTRA TOOLS - COMPACT PILLS (уникальный) ═══════ */}
      <section className="py-4 sm:py-6 px-3 sm:px-5 lg:px-6">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xs text-gray-500 text-center mb-3">И ещё 8 инструментов:</motion.p>
        <div className="flex flex-wrap justify-center gap-2">
          {extraTools.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.04 * i }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] lg:text-xs font-medium text-gray-300 hover:border-purple-500/30 hover:text-purple-300 transition-all cursor-default"
              >
                <Icon className="w-3 h-3 text-purple-400" />
                {t.label}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ VALUE FOR ARTISTS (что это даёт артистам) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-purple-500/20">
          <h3 className="text-base lg:text-lg font-black text-white mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-purple-400" />
            Ценность для обеих сторон
          </h3>

          <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
            {/* Для радиостанции */}
            <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-purple-400">Для радиостанции</span>
              </div>
              <div className="space-y-1.5">
                {['Бесплатный контент от артистов', 'Монетизация через рекламные слоты', 'Аналитика эфира и аудитории', 'Публичный профиль в каталоге'].map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px] lg:text-xs text-gray-300">
                    <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Для артиста */}
            <div className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF577F] to-pink-500 flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-[#FF577F]">Для артиста</span>
              </div>
              <div className="space-y-1.5">
                {['Попадание на 500+ радиостанций', 'Трекинг ротаций в реальном времени', 'Рост аудитории через эфир', 'Статистика прослушиваний'].map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px] lg:text-xs text-gray-300">
                    <CheckCircle2 className="w-3 h-3 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════ FREE PRICING (уникальная - бесплатный тариф) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-5">
          Тариф для <span className="text-purple-400">радиостанций</span>
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-500/[0.08] to-violet-500/[0.08] backdrop-blur-sm rounded-2xl p-5 lg:p-6 border-2 border-purple-500/30 ring-2 ring-purple-500/10 ring-offset-2 ring-offset-[#0a0a14]">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg shadow-purple-500/20">
              Бесплатно навсегда
            </span>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-white">Полный доступ</div>
                <div className="text-xs text-gray-400">Без скрытых платежей и комиссий</div>
              </div>
            </div>

            <div className="mb-5">
              <span className="text-4xl sm:text-5xl font-black text-white">0 ₽</span>
              <span className="text-sm text-gray-400 ml-1">навсегда</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-5">
              {[
                'Полный доступ ко всем функциям',
                'Неограниченный приём треков',
                'Детальная аналитика эфира',
                'Публичный профиль станции',
                'API для интеграции',
                'Техническая поддержка 24/7',
                'Библиотека промо-треков',
                'Без комиссий'
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] lg:text-xs text-gray-300">
                  <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-base shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-5 h-5" />
              Подключить станцию
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ═══════ MONETIZATION CALCULATOR (уникальная секция) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-purple-500/20">
          <h3 className="text-base lg:text-lg font-black text-white mb-4 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-purple-400" />
            Калькулятор монетизации эфира
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Ad slots per day */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Рекламных слотов в день</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setAdSlotsPerDay(Math.max(1, adSlotsPerDay - 1))} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-2xl font-black text-purple-400 w-8 text-center">{adSlotsPerDay}</span>
                <button onClick={() => setAdSlotsPerDay(Math.min(30, adSlotsPerDay + 1))} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Avg slot price */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Средняя цена слота (₽)</label>
              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={avgSlotPrice}
                onChange={e => setAvgSlotPrice(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>500</span>
                <span className="text-sm font-bold text-white">{avgSlotPrice.toLocaleString()} ₽</span>
                <span>10K</span>
              </div>
            </div>
            {/* Sponsored tracks per month */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Спонсорских треков / мес</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setSponsoredTracksPerMonth(Math.max(0, sponsoredTracksPerMonth - 1))} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-2xl font-black text-purple-400 w-8 text-center">{sponsoredTracksPerMonth}</span>
                <button onClick={() => setSponsoredTracksPerMonth(Math.min(50, sponsoredTracksPerMonth + 1))} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Avg sponsor price */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Цена размещения трека (₽)</label>
              <input
                type="range"
                min={1000}
                max={20000}
                step={1000}
                value={avgSponsorPrice}
                onChange={e => setAvgSponsorPrice(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                <span>1K</span>
                <span className="text-sm font-bold text-white">{avgSponsorPrice.toLocaleString()} ₽</span>
                <span>20K</span>
              </div>
            </div>
          </div>

          {/* Region selector */}
          <div className="mb-4">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Региональный коэффициент</label>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRegionKey(r.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold transition-all ${
                    regionKey === r.key
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  {r.label} <span className={regionKey === r.key ? 'text-purple-400' : 'text-gray-600'}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-[10px] text-gray-500 mb-0.5">Реклама / мес</div>
              <div className="text-sm lg:text-base font-black text-white">{(calcAdRevenue / 1000).toFixed(0)}K ₽</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <div className="text-[10px] text-gray-500 mb-0.5">Спонсоры / мес</div>
              <div className="text-sm lg:text-base font-black text-white">{(calcSponsorRevenue / 1000).toFixed(0)}K ₽</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20">
              <div className="text-[10px] text-gray-500 mb-0.5">Итого / мес</div>
              <div className="text-sm lg:text-base font-black text-purple-400">{(calcTotalMonthly / 1000).toFixed(0)}K ₽</div>
            </div>
            <div className="bg-purple-500/15 rounded-xl p-3 text-center border border-purple-500/25">
              <div className="text-[10px] text-gray-500 mb-0.5">В год</div>
              <div className="text-sm lg:text-base font-black text-purple-300">{(calcYearly / 1000000).toFixed(1)}M ₽</div>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 text-center mt-3">Расчёт приблизительный. Доход зависит от аудитории, региона и формата станции.</p>
        </motion.div>
      </section>

      {/* ═══════ LIVE RADIO PARTNERS (live-данные с сервера) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-1">
          Станции на <span className="text-purple-400">платформе</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xs text-gray-500 text-center mb-5">
          {partnersLoading ? 'Загрузка...' : `${radioPartners.length} станций - суммарная аудитория ${(totalAudience / 1000000).toFixed(1)}M слушателей`}
        </motion.p>

        {partnersLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : radioPartners.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {radioPartners.map((station, i) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * i }}
                className="bg-white/[0.04] rounded-xl p-3 lg:p-4 border border-white/10 hover:border-purple-500/20 transition-all group"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  {station.logoUrl ? (
                    <img src={station.logoUrl} alt={station.stationName} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center ring-2 ring-purple-500/20">
                      <Radio className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{station.stationName}</span>
                      {station.isOnline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{station.city}</span>
                      {station.frequency && <span className="text-gray-600">- {station.frequency}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-[9px] lg:text-[10px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">{station.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {station.formats.slice(0, 2).map((f, fi) => (
                      <span key={fi} className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{f}</span>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" />
                    {station.audienceSize >= 1000000
                      ? `${(station.audienceSize / 1000000).toFixed(1)}M`
                      : `${(station.audienceSize / 1000).toFixed(0)}K`}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 text-xs">
            Данные о станциях загружаются после инициализации платформы
          </div>
        )}
      </section>

      {/* ═══════ TESTIMONIALS (уникальная секция) ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl sm:text-2xl font-black text-center mb-5">
          Что говорят <span className="text-purple-400">радиостанции</span>
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: 'Radio Wave FM', city: 'Москва', text: 'Артисты присылают треки бесплатно, аналитика помогает выбирать лучшее для нашей аудитории.', tracks: 120, rating: 4.9 },
            { name: 'Coastal FM', city: 'Геленджик', text: 'Интеграция по API заняла один день. Теперь треки автоматически попадают в нашу ротацию.', tracks: 85, rating: 5.0 },
            { name: 'Urban Radio', city: 'Краснодар', text: 'Монетизация через рекламные слоты работает отлично. Рекламодатели видят нашу статистику.', tracks: 200, rating: 4.8 },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 * i }}
              className="bg-white/[0.04] rounded-xl p-3 lg:p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-[9px] text-gray-600 ml-1.5">{t.city}</span>
                </div>
              </div>
              <p className="text-[10px] lg:text-xs text-gray-400 italic mb-2 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 text-[9px] text-gray-500">
                <span className="font-bold text-white">{t.tracks} треков</span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{t.rating}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-6 sm:py-10 px-3 sm:px-5 lg:px-6 pb-12 sm:pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-br from-purple-500/15 to-violet-500/15 backdrop-blur-sm rounded-xl lg:rounded-2xl p-5 lg:p-8 border border-purple-500/20 text-center relative overflow-hidden">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 -right-10 w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <circle cx="50" cy="70" r="8" fill="currentColor" />
              <path d="M30,55 Q50,25 70,55" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M20,45 Q50,5 80,45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </motion.div>
          <Radio className="w-10 h-10 mx-auto mb-3 text-purple-400" />
          <h3 className="text-xl sm:text-2xl font-black mb-2">Готовы подключить станцию?</h3>
          <p className="text-xs lg:text-sm text-gray-400 mb-5 max-w-md mx-auto">
            Зарегистрируйтесь и начните получать качественный музыкальный контент для эфира бесплатно.
          </p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGetStarted}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all inline-flex items-center gap-2">
            <Radio className="w-5 h-5" /> Подключить станцию
          </motion.button>

          {/* Social links */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[
              { label: 'VK', short: 'VK', href: 'https://vk.com/promofm', color: 'hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-400' },
              { label: 'Telegram', short: 'TG', href: 'https://t.me/promofm', color: 'hover:bg-sky-500/20 hover:border-sky-500/30 hover:text-sky-400' },
              { label: 'YouTube', short: 'YT', href: 'https://youtube.com/@promofm7379?si=Kz4vu-pa0USE1lK_', color: 'hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400' },
              { label: 'Instagram', short: 'IG', href: 'https://www.instagram.com/promo_fm?igsh=aHc1MjNuM3EzYmt6&utm_source=qr', color: 'hover:bg-pink-500/20 hover:border-pink-500/30 hover:text-pink-400' },
            ].map((s) => (
              <a
                key={s.short}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-400 transition-all ${s.color}`}
              >
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}