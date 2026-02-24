/**
 * FOR ENGINEERS PAGE - Премиум страница для звукоинженеров
 * Тестирование микса, мастеринга и технического качества с профессиональными инструментами
 */

import { motion, useInView } from 'motion/react';
import { Gauge, TrendingUp, Users, BarChart3, Zap, Sliders, Target, Sparkles, Activity, Headphones, PlayCircle, Star, CheckCircle2, ArrowRight, Clock, Banknote, Award, RefreshCw, Loader2, Coins, FlaskConical } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRef, useState } from 'react';
const engineerHeroImage = 'https://images.unsplash.com/photo-1767570928868-6f7b41b94502?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb3VuZCUyMGVuZ2luZWVyJTIwbWl4aW5nJTIwYm9hcmQlMjBzdHVkaW98ZW58MXx8fHwxNzcxNzg1NTYwfDA&ixlib=rb-4.1.0&q=80&w=1080';
import { useProducerServices, useProducerProfiles } from '@/hooks/useLandingData';

interface ForEngineersPageProps {
  onGetStarted: () => void;
}

// ─── Service type labels ───
const SVC_TYPE_LABELS: Record<string, string> = {
  mixing: 'Сведение', mastering: 'Мастеринг', arrangement: 'Аранжировка',
  vocal_recording: 'Запись вокала', ghost_production: 'Гост-продакшн',
  beatmaking: 'Битмейкинг', sound_design: 'Саунд-дизайн',
  consultation: 'Консультация', session_musician: 'Сессионный музыкант',
};

// ─── Live Services Marketplace Section ───
function ServicesMarketplace({ onGetStarted }: { onGetStarted: () => void }) {
  const { data: services, isLoading: svcLoading } = useProducerServices({ limit: 6 });
  const { data: producers, isLoading: prodLoading } = useProducerProfiles({ limit: 6 });
  const [activeType, setActiveType] = useState<string | null>(null);

  const isLoading = svcLoading || prodLoading;
  const filteredServices = activeType
    ? (services || []).filter(s => s.type === activeType)
    : (services || []);

  // Get unique service types for filter tabs
  const serviceTypes = Array.from(new Set((services || []).map(s => s.type)));

  // Don't render if no data and not loading
  if (!isLoading && (!services || services.length === 0) && (!producers || producers.length === 0)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8 sm:mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF577F]/10 border border-[#FF577F]/20 rounded-full text-xs font-bold text-[#FF577F] mb-4">
          <Zap className="w-3 h-3" /> МАРКЕТПЛЕЙС УСЛУГ - LIVE DATA
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
          Найдите <span className="text-[#FF577F]">инженера</span> для вашего проекта
        </h2>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Профессиональные услуги звукоинженеров и продюсеров с реальными рейтингами и отзывами
        </p>
      </motion.div>

      {/* Filter Tabs */}
      {serviceTypes.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveType(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !activeType ? 'bg-[#FF577F] text-white shadow-lg shadow-[#FF577F]/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Все
          </button>
          {serviceTypes.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type === activeType ? null : type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeType === type ? 'bg-[#FF577F] text-white shadow-lg shadow-[#FF577F]/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {SVC_TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#FF577F] animate-spin" />
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && filteredServices.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {filteredServices.map((svc, idx) => {
            const producer = producers?.find(p => p.userId === svc.producerId);
            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-[#FF577F]/30 transition-all overflow-hidden group"
              >
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF577F]/20 to-[#FF577F]/5 border border-[#FF577F]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Sliders className="w-5 h-5 text-[#FF577F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{svc.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#FF577F]/10 border border-[#FF577F]/20 text-[#FF577F] rounded-full">
                          {SVC_TYPE_LABELS[svc.type] || svc.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {svc.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{svc.description}</p>
                  )}
                </div>

                {/* Stats Row */}
                <div className="px-5 py-3 flex items-center gap-3 text-[10px] text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-white">{svc.rating}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {svc.orders} заказов
                  </span>
                  {svc.deliveryDays > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {svc.deliveryDays} дн.
                    </span>
                  )}
                  {svc.revisions > 0 && (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      {svc.revisions} правок
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">от</p>
                    <p className="text-lg font-black text-[#FF577F]">
                      {svc.basePrice.toLocaleString('ru-RU')} <span className="text-xs font-normal text-slate-400">P</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Продюсер</p>
                    <p className="text-xs font-bold text-white">{svc.producer}</p>
                    {producer && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Award className="w-2.5 h-2.5 text-teal-400" />
                        <span className="text-[9px] text-teal-400">{producer.experienceYears} лет опыта</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Producers Row */}
      {!isLoading && producers && producers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Топ-инженеры платформы</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {producers.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center hover:border-[#FF577F]/20 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF577F]/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-black text-white">{p.producerName[0]}</span>
                </div>
                <p className="text-xs font-bold text-white truncate">{p.producerName}</p>
                <p className="text-[10px] text-slate-500 truncate">{p.city}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold text-white">{p.averageRating}</span>
                  <span className="text-[9px] text-slate-500">({p.reviewCount})</span>
                </div>
                <div className="flex flex-wrap gap-0.5 justify-center mt-1.5">
                  {p.specializations.slice(0, 2).map(s => (
                    <span key={s} className="text-[8px] px-1 py-0.5 bg-[#FF577F]/10 text-[#FF577F] rounded">
                      {SVC_TYPE_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <Button
          onClick={onGetStarted}
          className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-5 rounded-full text-sm group"
        >
          Смотреть все услуги
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </div>
  );
}

export function ForEngineersPage({ onGetStarted }: ForEngineersPageProps) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const [selectedMetric, setSelectedMetric] = useState<'lufs' | 'dr' | 'spectrum'>('lufs');

  const features = [
    {
      icon: Gauge,
      title: 'Тест микса и мастера',
      description: 'Профессиональная оценка качества',
      benefits: [
        'Тест на критически настроенных слушателях',
        'Оценка баланса частот',
        'Проверка стереопанорамы',
        'Сравнение до/после мастеринга'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Activity,
      title: 'Технические метрики',
      description: 'Глубокий анализ сигнала',
      benefits: [
        'LUFS, True Peak, Dynamic Range',
        'Спектральный анализ RMS',
        'Phase correlation meter',
        'Transient response analysis'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Reference Matching',
      description: 'Сравнение с эталонами',
      benefits: [
        'Match EQ с reference треками',
        'Loudness matching анализ',
        'Частотный баланс vs. reference',
        'Стерео ширина comparison'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Blind Test',
      description: 'Слепое тестирование версий',
      benefits: [
        'Сравнение до 10 версий микса',
        'Тест на профессиональных инженерах',
        'Детальный feedback по частотам',
        'Выбор лучшей версии аудиторией'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const realCases = [
    {
      engineer: 'Андрей Субботин',
      project: 'Полина Гагарина - "Кукушка" (Master)',
      versions: 5,
      winner: 'Version 4',
      before: {
        lufs: '-8.2 LUFS',
        dr: 'DR6',
        rating: 3.9
      },
      after: {
        lufs: '-10.5 LUFS',
        dr: 'DR9',
        rating: 4.4
      },
      improvement: '+28% слушаемость',
      insight: 'Blind test показал: версия с меньшим brick-wall limiting звучит на 34% лучше для критичной аудитории',
      icon: Gauge,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      engineer: 'Максим Лапшин',
      project: 'Miyagi & Andy Panda - "Kosandra" (Mix)',
      versions: 5,
      winner: 'Version 4',
      before: {
        lufs: '-6.8 LUFS',
        dr: 'DR5',
        rating: 3.5
      },
      after: {
        lufs: '-9.2 LUFS',
        dr: 'DR8',
        rating: 4.2
      },
      improvement: '+22% улучшение',
      insight: 'Reference matching с хитами жанра: добавление пространства в средних частотах дало +0.8 балла',
      icon: Target,
      color: 'from-purple-400 to-pink-500'
    },
    {
      engineer: 'Дмитрий Носков',
      project: 'Тима Белорусских - "Незабудка" (Master)',
      versions: 4,
      winner: 'Version 3',
      before: {
        lufs: '-7.1 LUFS',
        dr: 'DR4',
        rating: 3.7
      },
      after: {
        lufs: '-11.3 LUFS',
        dr: 'DR10',
        rating: 4.3
      },
      improvement: '+35% качество',
      insight: 'Слепой тест инженеров: версия с динамикой набрала 64% голосов. Трек стал рассматриваться для Apple Music плейлистов',
      icon: Activity,
      color: 'from-green-400 to-emerald-500'
    }
  ];

  const metricsDemo = {
    lufs: {
      title: 'LUFS Meter',
      current: '-10.2',
      target: '-9.0 to -14.0',
      status: 'optimal',
      bars: [12, 15, 18, 22, 19, 16, 14, 17, 20, 18, 15, 13]
    },
    dr: {
      title: 'Dynamic Range',
      current: 'DR9',
      target: 'DR7-DR12',
      status: 'good',
      bars: [8, 9, 11, 10, 9, 12, 10, 8, 9, 11, 10, 9]
    },
    spectrum: {
      title: 'Frequency Balance',
      current: 'Balanced',
      target: 'Reference Match',
      status: 'excellent',
      bars: [5, 8, 12, 15, 18, 20, 22, 20, 18, 15, 12, 8]
    }
  };

  const technicalTools = [
    {
      icon: Gauge,
      title: 'LUFS Meter',
      description: 'Integrated, Short-term, Momentary',
      badge: 'EBU R128',
      specs: ['±0.1 LU accuracy', 'True Peak detection', 'Multi-standard support']
    },
    {
      icon: Activity,
      title: 'Spectrum Analyzer',
      description: 'FFT анализ 20Hz-20kHz',
      badge: '8192 FFT',
      specs: ['1/3 октавный режим', 'RMS & Peak detection', 'Waterfall display']
    },
    {
      icon: Sliders,
      title: 'Phase Meter',
      description: 'Correlation & Goniometer',
      badge: 'L-R-M-S',
      specs: ['Mono compatibility', 'Stereo width analyzer', 'Phase coherence']
    },
    {
      icon: BarChart3,
      title: 'Dynamic Range',
      description: 'DR, Crest Factor, RMS',
      badge: 'PLR',
      specs: ['DR Database compare', 'Peak vs. RMS ratio', 'Loudness history']
    }
  ];

  const stats = [
    { label: 'Звукоинженеров', value: '320+', icon: Users, growth: '+34%' },
    { label: 'Выполненных заказов', value: '1,800+', icon: Gauge, growth: '+41%' },
    { label: 'Средний рейтинг', value: '4.8', icon: Star, growth: '+0.3' },
    { label: 'Средний доход', value: '+42%', icon: TrendingUp, growth: '+8%' }
  ];

  const freeAdvantages = [
    { icon: CheckCircle2, text: 'Бесплатная регистрация и профиль' },
    { icon: Users, text: 'Доступ к маркетплейсу заказов' },
    { icon: Star, text: 'Рейтинг и отзывы клиентов' },
    { icon: Sliders, text: 'Неограниченное количество услуг' },
    { icon: Headphones, text: 'Портфолио с примерами до/после' },
    { icon: TrendingUp, text: 'Аналитика заказов и дохода' },
  ];

  const workflows = [
    {
      step: '1',
      title: 'Экспорт версий',
      description: 'Bounce несколько вариантов микса/мастера',
      icon: Sliders
    },
    {
      step: '2',
      title: 'Blind Test Setup',
      description: 'Настройте слепой тест для аудитории',
      icon: Target
    },
    {
      step: '3',
      title: 'Технический анализ',
      description: 'Автоматический анализ всех метрик',
      icon: Activity
    },
    {
      step: '4',
      title: 'Отчет и решение',
      description: 'Получите данные и выберите лучшую версию',
      icon: Gauge
    }
  ];

  const testimonials = [
    {
      name: 'Андрей Субботин',
      role: 'Mastering Engineer',
      avatar: '🎚️',
      text: 'Blind test помог выбрать лучший мастер из 5 версий. Клиент остался доволен, трек заметно выделяется на фоне конкурентов.',
      rating: 5,
      verified: true
    },
    {
      name: 'Максим Лапшин',
      role: 'Mixing Engineer',
      avatar: '🎛️',
      text: 'Технические метрики на уровне профессиональных VST плагинов. Reference matching - очень полезная фича для финализации миксов.',
      rating: 5,
      verified: true
    },
    {
      name: 'Дмитрий Носков',
      role: 'Studio Owner',
      avatar: '🏢',
      text: 'Использую для QA всех мастеров перед отдачей клиентам. Количество доработок сократилось втрое.',
      rating: 5,
      verified: true
    }
  ];

  const engineerBenefits = [
    { icon: CheckCircle2, text: 'Бесплатная регистрация' },
    { icon: CheckCircle2, text: 'Портфолио до/после' },
    { icon: CheckCircle2, text: 'Гибкие цены и сроки' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12 sm:pb-16 md:pb-20">
      
      {/* HERO IMAGE SECTION */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[65vh] xl:h-[70vh] max-h-[700px] overflow-hidden bg-[#0a0a14]">
        {/* Animated ambient glows — studio teal & warm tones */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/3 w-[500px] h-[350px] bg-teal-500 rounded-full"
            style={{ filter: 'blur(130px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.3, 0.18] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/3 right-1/4 w-[400px] h-[300px] bg-orange-500 rounded-full"
            style={{ filter: 'blur(110px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[350px] h-[250px] bg-[#FF577F] rounded-full"
            style={{ filter: 'blur(100px)' }}
          />
        </div>

        {/* Mixing console image — dark bg blends via lighten */}
        <motion.img
          src={engineerHeroImage}
          alt="Студия звукозаписи - микшерный пульт"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: [1, 1.012, 1] }}
          transition={{
            opacity: { duration: 1.4, ease: 'easeOut' },
            scale: { duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'lighten' }}
        />

        {/* LED indicator sparkle particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`led-${i}`}
            className={`absolute rounded-full ${
              i % 4 === 0 ? 'bg-green-400' : i % 4 === 1 ? 'bg-amber-300' : i % 4 === 2 ? 'bg-red-400' : 'bg-teal-400'
            }`}
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${12 + i * 7.5}%`,
              bottom: `${18 + (i % 4) * 12}%`,
            }}
            animate={{
              y: [0, -20 - i * 3, 0],
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.3, 0.5],
            }}
            transition={{
              duration: 2.2 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Animated EQ bars watermark */}
        <div className="absolute top-8 right-6 sm:top-12 sm:right-12 flex items-end gap-0.5 h-12 sm:h-16 opacity-[0.06]">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`eq-${i}`}
              animate={{ height: [`${30 + i * 5}%`, `${60 + (i % 3) * 15}%`, `${30 + i * 5}%`] }}
              transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 sm:w-2 bg-white rounded-t"
            />
          ))}
        </div>

        {/* Edge fades */}
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-[#0a0a14] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-40 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

        {/* Floating badge + title on image */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-teal-500/20 mb-4">
              <Gauge className="w-4 h-4 text-teal-400" />
              <span className="text-xs sm:text-sm font-bold text-white/90">Для звукоинженеров</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black leading-tight max-w-3xl">
              Монетизируй{' '}
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-[#FF577F] via-teal-400 to-[#FF577F] bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                свой звук
              </motion.span>
            </h1>
            <div className="mt-4 sm:mt-5 max-w-2xl bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3 sm:px-5 sm:py-4 relative overflow-hidden">
              {/* Animated EQ bars inside card */}
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-end gap-[3px] h-8 sm:h-10 opacity-30">
                {[40, 70, 55, 85, 60, 45, 75].map((h, i) => (
                  <motion.div
                    key={`eq-card-${i}`}
                    animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`, `${h * 0.9}%`, `${h * 0.4}%`] }}
                    transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                    className="w-[3px] sm:w-1 rounded-full bg-gradient-to-t from-[#FF577F] to-teal-400"
                  />
                ))}
              </div>
              {/* Subtle glow accent */}
              <motion.div
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500 rounded-full pointer-events-none"
                style={{ filter: 'blur(30px)' }}
              />
              <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed pr-10 sm:pr-16">
                Предлагай услуги сведения и мастеринга, находи клиентов и строй репутацию. Становись экспертом музыкального бизнеса, принимай участие в тестировании треков, получай бонусы и зарабатывай на своем опыте
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="group mt-5 px-6 py-3 bg-gradient-to-r from-[#FF577F] to-teal-500 rounded-xl font-bold text-base shadow-lg shadow-[#FF577F]/30 hover:shadow-[#FF577F]/50 transition-all inline-flex items-center gap-2"
            >
              <Gauge className="w-5 h-5" /> Создать профиль <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* CTA row */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <Button 
              onClick={onGetStarted}
              className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full text-base sm:text-lg group w-full sm:w-auto"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Создать профиль
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white/20 hover:bg-white/10 font-bold px-8 py-6 rounded-full text-base sm:text-lg w-full sm:w-auto"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Смотреть демо
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
            {engineerBenefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-1.5"
              >
                <benefit.icon className="w-3.5 h-3.5 text-[#FF577F]" />
                <span>{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS WITH GROWTH */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group"
            >
              <stat.icon className="w-10 h-10 mx-auto mb-3 text-[#FF577F] group-hover:scale-110 transition-transform" />
              <div className="text-3xl sm:text-4xl font-black text-[#FF577F] mb-2">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-400 mb-2">{stat.label}</div>
              <div className="inline-flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="w-3 h-3" />
                {stat.growth}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══ SERVICES MARKETPLACE (LIVE API DATA) ═══ */}
      <ServicesMarketplace onGetStarted={onGetStarted} />

      {/* ═══ EXPERT TRACK TESTING — EARN BY REVIEWING ═══ */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-bold text-teal-400 mb-4">
            <FlaskConical className="w-3 h-3" /> ЗАРАБАТЫВАЙ НА ЭКСПЕРТИЗЕ
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Тестируй <span className="text-[#FF577F]">треки</span> - получай бонусы
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Оценивайте треки артистов как эксперт. За каждую рецензию - монеты и рост рейтинга на платформе
          </p>
        </motion.div>

        {/* How it works - 3 step cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {[
            {
              step: '1',
              icon: Headphones,
              title: 'Прослушайте трек',
              desc: 'Выберите трек из очереди на тестирование и внимательно прослушайте, анализируя каждый аспект',
              color: 'from-[#FF577F] to-rose-600',
            },
            {
              step: '2',
              icon: Sliders,
              title: 'Оцените по 5 критериям',
              desc: 'Сведение и мастеринг, аранжировка, оригинальность, коммерческий потенциал и общая оценка от 1 до 10',
              color: 'from-teal-500 to-emerald-500',
            },
            {
              step: '3',
              icon: Coins,
              title: 'Получите награду',
              desc: '50 монет за каждую рецензию, +0.05 к рейтингу. Растущие вознаграждения по мере набора экспертизы',
              color: 'from-amber-500 to-orange-500',
            },
          ].map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-[#FF577F]/20 transition-all relative overflow-hidden group"
            >
              <motion.div
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${s.color} rounded-full pointer-events-none`}
                style={{ filter: 'blur(40px)' }}
              />
              <div className={`relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <s.icon className="w-7 h-7 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black text-[#FF577F]">ШАГ {s.step}</span>
                </div>
                <h3 className="text-xl font-black mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Expert tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 flex items-end gap-1 h-16 opacity-[0.08]">
            {[35, 60, 45, 80, 50, 40, 70, 55].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`] }}
                transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#FF577F] to-teal-400"
              />
            ))}
          </div>

          <div className="relative z-10">
            <h3 className="text-lg sm:text-xl font-black text-white mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Уровни экспертизы
            </h3>
            <p className="text-sm text-slate-400 mb-6">Чем больше рецензий - тем выше награды</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { level: 'Новичок', emoji: '🌱', range: '0-4 рецензий', coins: '50', rating: '+0.05' },
                { level: 'Эксперт', emoji: '⭐', range: '5-19 рецензий', coins: '75', rating: '+0.08' },
                { level: 'Мастер', emoji: '🏆', range: '20-49 рецензий', coins: '100', rating: '+0.10' },
                { level: 'Гуру', emoji: '👑', range: '50+ рецензий', coins: '150', rating: '+0.15' },
              ].map((tier, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  className={`p-4 rounded-xl border transition-all ${
                    idx === 0
                      ? 'bg-[#FF577F]/10 border-[#FF577F]/30'
                      : 'bg-white/5 border-white/10 hover:border-[#FF577F]/20'
                  }`}
                >
                  <div className="text-2xl mb-2">{tier.emoji}</div>
                  <h4 className="text-sm font-black text-white">{tier.level}</h4>
                  <p className="text-[10px] text-slate-500 mb-3">{tier.range}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-bold">{tier.coins}</span>
                      <span className="text-slate-500">монет/рецензия</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{tier.rating}</span>
                      <span className="text-slate-500">к рейтингу</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#FF577F] to-teal-500 hover:from-[#FF4D7D] hover:to-teal-400 font-bold px-8 py-5 rounded-full text-sm group shadow-lg shadow-[#FF577F]/20"
          >
            <FlaskConical className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Начать тестировать треки
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-slate-500 mt-3">Первые 5 рецензий бесплатно. Мгновенное начисление монет.</p>
        </motion.div>
      </div>

      {/* INTERACTIVE METRICS DEMO */}
      <div className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Технический <span className="text-[#FF577F]">анализ</span> в реальном времени
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Профессиональные метрики для вашего трека
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          {/* Metric Selector */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            {Object.keys(metricsDemo).map((key) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMetric(key as any)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedMetric === key
                    ? 'bg-[#FF577F] shadow-lg shadow-[#FF577F]/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {metricsDemo[key as keyof typeof metricsDemo].title}
              </motion.button>
            ))}
          </div>

          {/* Metric Display */}
          <motion.div
            key={selectedMetric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 rounded-2xl p-8 border border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-5xl font-black text-[#FF577F] mb-2">
                  {metricsDemo[selectedMetric].current}
                </div>
                <div className="text-sm text-slate-400">
                  Target: {metricsDemo[selectedMetric].target}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                metricsDemo[selectedMetric].status === 'excellent' ? 'bg-green-500/20 text-green-400' :
                metricsDemo[selectedMetric].status === 'optimal' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {metricsDemo[selectedMetric].status.toUpperCase()}
              </div>
            </div>

            {/* Visual Bars */}
            <div className="flex items-end justify-between gap-2 h-32">
              {metricsDemo[selectedMetric].bars.map((height, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${height * 4}px` }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="flex-1 bg-gradient-to-t from-[#FF577F] to-[#FF6B8F] rounded-t"
                />
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <Activity className="w-4 h-4" />
              <span>Real-time analysis • Precision: ±0.1 dB</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* REAL CASE STUDIES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Реальные <span className="text-[#FF577F]">кейсы</span> инженеров
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Профессиональные результаты с конкретными метриками
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {realCases.map((caseStudy, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all group"
            >
              {/* Engineer Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${caseStudy.color} flex items-center justify-center`}>
                  <caseStudy.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{caseStudy.engineer}</h3>
                  <p className="text-xs text-slate-400">{caseStudy.project}</p>
                </div>
              </div>

              {/* Blind Test Info */}
              <div className="bg-black/30 rounded-xl p-3 mb-4 border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Версий протестировано:</span>
                  <span className="font-bold">{caseStudy.versions}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Победитель:</span>
                  <span className="font-bold text-[#FF577F]">{caseStudy.winner}</span>
                </div>
              </div>

              {/* Technical Metrics Comparison */}
              <div className="space-y-4 mb-6">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-slate-500 mb-3">До оптимизации</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">LUFS:</span>
                      <span className="font-bold">{caseStudy.before.lufs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Dynamic Range:</span>
                      <span className="font-bold">{caseStudy.before.dr}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Rating:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{caseStudy.before.rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-[#FF577F]" />
                </div>

                <div className="bg-gradient-to-br from-[#FF577F]/20 to-[#FF6B8F]/10 rounded-xl p-4 border border-[#FF577F]/30">
                  <div className="text-xs text-[#FF577F] font-bold mb-3">После оптимизации</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">LUFS:</span>
                      <span className="font-bold text-[#FF577F]">{caseStudy.after.lufs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Dynamic Range:</span>
                      <span className="font-bold text-[#FF577F]">{caseStudy.after.dr}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Rating:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#FF577F]">{caseStudy.after.rating}</span>
                        <Star className="w-3 h-3 fill-[#FF577F] text-[#FF577F]" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#FF577F]/20">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-400">{caseStudy.improvement}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insight */}
              <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 italic">{caseStudy.insight}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TECHNICAL TOOLS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Технические метрики
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Профессиональная измерительная система
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {technicalTools.map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group"
            >
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 rounded-full bg-[#FF577F]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <tool.icon className="w-7 h-7 text-[#FF577F]" />
                </div>
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-[#FF577F] text-white text-[9px] font-bold rounded-full">
                  {tool.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{tool.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{tool.description}</p>
              <div className="space-y-1">
                {tool.specs.map((spec, sIdx) => (
                  <div key={sIdx} className="text-[10px] text-slate-500 flex items-center gap-1 justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Профессиональный тулкит
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Инструменты для звукоинженеров
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-[#FF577F]/30 transition-all"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2 text-sm text-slate-300">
                    <Sparkles className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* WORKFLOW */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Workflow для инженеров
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            От микса до финального мастера
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflows.map((workflow, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 * idx }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF577F] to-[#FF6B8F] flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                  {workflow.step}
                </div>
                <workflow.icon className="w-8 h-8 text-[#FF577F] mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{workflow.title}</h3>
                <p className="text-sm text-slate-400">{workflow.description}</p>
              </div>
              {idx < workflows.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#FF577F] to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* FREE CTA - Бесплатная модель для инженеров */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Начните <span className="text-[#FF577F]">бесплатно</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Регистрация, профиль и доступ к маркетплейсу - без подписок и скрытых платежей.
            Платформа берёт 10% комиссию только с выполненных заказов.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#FF577F]/30 shadow-lg shadow-[#FF577F]/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF3366] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black">Бесплатный аккаунт</h3>
              <p className="text-sm text-slate-400">Всё что нужно для старта</p>
            </div>
            <div className="ml-auto">
              <span className="text-3xl font-black text-[#FF577F]">0 ₽</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {freeAdvantages.map((adv, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * idx }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
              >
                <adv.icon className="w-5 h-5 text-[#FF577F] flex-shrink-0" />
                <span className="text-sm text-slate-200">{adv.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-[#FF577F] hover:bg-[#FF4D7D] font-bold py-6 px-8 rounded-xl text-base"
            >
              Создать профиль бесплатно
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-slate-500 sm:ml-4">
              Комиссия 10% только с оплаченных заказов
            </p>
          </div>
        </motion.div>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Отзывы инженеров
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FF577F] text-[#FF577F]" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 rounded-2xl p-8 border border-[#FF577F]/30 text-center relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-40 h-40 opacity-5"
          >
            <Gauge className="w-full h-full" />
          </motion.div>
          
          <Headphones className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Профессиональный звук начинается здесь
          </h3>
          <p className="text-slate-300 mb-6">
            14 дней бесплатно. Без привязки карты.
          </p>
          <Button 
            onClick={onGetStarted}
            className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full group"
          >
            <Gauge className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Начать сейчас
          </Button>
        </motion.div>
      </div>

    </div>
  );
}