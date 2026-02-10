/**
 * FOR ENGINEERS PAGE - Премиум страница для звукоинженеров
 * Тестирование микса, мастеринга и технического качества с профессиональными инструментами
 */

import { motion, useInView } from 'motion/react';
import { Gauge, TrendingUp, Users, BarChart3, Zap, Sliders, Target, Sparkles, Activity, Headphones, PlayCircle, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRef, useState } from 'react';
import engineerHeroImage from "figma:asset/ffd89139da5a78e0ea3373aa0ffef87a1e63a3d3.png";

interface ForEngineersPageProps {
  onGetStarted: () => void;
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
    { label: 'Мастеров протестировано', value: '1,800+', icon: Gauge, growth: '+41%' },
    { label: 'Accuracy Rate', value: '84%', icon: Target, growth: '+4%' },
    { label: 'Avg. improvement', value: '+11%', icon: TrendingUp, growth: '+8%' }
  ];

  const pricing = [
    {
      name: 'Engineer Basic',
      price: '$59',
      period: '/месяц',
      description: 'Для фрилансеров',
      features: [
        '15 тестов в месяц',
        'Базовые технические метрики',
        'Blind test 2 версии',
        '50 респондентов',
        'Email поддержка'
      ],
      popular: false
    },
    {
      name: 'Engineer Pro',
      price: '$149',
      period: '/месяц',
      description: 'Для профессиональных инженеров',
      features: [
        '50 тестов в месяц',
        'Полные технические метрики',
        'Blind test до 5 версий',
        '200 респондентов',
        'Reference matching',
        'Спектральный анализ',
        'Приоритетная поддержка'
      ],
      popular: true
    },
    {
      name: 'Studio Mastering',
      price: '$499',
      period: '/месяц',
      description: 'Для мастеринг-студий',
      features: [
        'Неограниченные тесты',
        'Профессиональный тул-сет',
        'Blind test до 10 версий',
        'Профи-аудитория инженеров',
        'White-label отчеты для клиентов',
        'API для автоматизации',
        'Персональный менеджер'
      ],
      popular: false
    }
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
    { icon: CheckCircle2, text: 'Пробный период 14 дней' },
    { icon: CheckCircle2, text: 'Без кредитной карты' },
    { icon: CheckCircle2, text: 'Экспорт в PDF/CSV' },
    { icon: CheckCircle2, text: 'Онлайн-консультация' }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">
      
      {/* HERO IMAGE SECTION */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden bg-black">
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
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />
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
              <span className="text-sm font-bold text-white/90">Для звукоинженеров</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black leading-tight max-w-3xl">
              Идеальный{' '}
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-[#FF577F] via-teal-400 to-[#FF577F] bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                звук
              </motion.span>{' '}
              с данными
            </h1>
          </motion.div>
        </div>
      </section>

      {/* TEXT + CTA SECTION */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Тестируйте микс и мастеринг, получайте технические метрики и feedback профи
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button 
                onClick={onGetStarted}
                className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full text-base sm:text-lg group"
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Начать бесплатно
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white/20 hover:bg-white/10 font-bold px-8 py-6 rounded-full text-base sm:text-lg"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Смотреть демо
              </Button>
            </div>
            {/* Benefits badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-400">
              {engineerBenefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="flex items-center gap-1.5"
                >
                  <benefit.icon className="w-4 h-4 text-[#FF577F]" />
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
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

      {/* PRICING */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Тарифы для инженеров
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Профессиональные планы
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border transition-all ${
                plan.popular 
                  ? 'border-[#FF577F] shadow-lg shadow-[#FF577F]/20' 
                  : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="inline-block px-3 py-1 bg-[#FF577F] rounded-full text-xs font-bold mb-4">
                  ПОПУЛЯРНЫЙ
                </div>
              )}
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-[#FF577F]">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={onGetStarted}
                className={`w-full font-bold py-6 rounded-xl ${
                  plan.popular 
                    ? 'bg-[#FF577F] hover:bg-[#FF4D7D]' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Выбрать план
              </Button>
            </motion.div>
          ))}
        </div>
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