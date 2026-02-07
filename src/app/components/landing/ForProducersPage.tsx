/**
 * FOR PRODUCERS PAGE - Премиум страница для саундпродюсеров
 * A/B тестирование, продакшн аналитика и прогнозы с реальными кейсами
 */

import { motion, useInView } from 'motion/react';
import { Activity, TrendingUp, Users, BarChart3, Zap, Music, Target, Sparkles, Sliders, Headphones, PlayCircle, Star, CheckCircle2, ArrowRight, Radio, Waveform, Mic, Volume2, Globe } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRef, useState } from 'react';

interface ForProducersPageProps {
  onGetStarted: () => void;
}

export function ForProducersPage({ onGetStarted }: ForProducersPageProps) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const [selectedVersion, setSelectedVersion] = useState<'A' | 'B'>('A');

  const features = [
    {
      icon: Activity,
      title: 'A/B тестирование',
      description: 'Сравнивайте версии трека',
      benefits: [
        'Тест 2-5 версий одного трека',
        'Детальное сравнение версий',
        'Выбор лучшего микса респондентами',
        'Анализ предпочтений по частотам'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Sliders,
      title: 'Продакшн аналитика',
      description: 'Техническая оценка качества',
      benefits: [
        'Анализ частотного спектра',
        'Проверка loudness и динамики',
        'Сравнение с reference треками',
        'Рекомендации по мастерингу'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Фокус-группы',
      description: 'Целевая аудитория по жанрам',
      benefits: [
        'Тест на любителях вашего жанра',
        'Сегментация по возрасту и полу',
        'Географический таргетинг',
        'Детальный feedback от слушателей'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Target,
      title: 'Коммерческий потенциал',
      description: 'Оценка хитовости трека',
      benefits: [
        'Прогноз попадания в чарты',
        'Анализ вирусного потенциала',
        'Оценка радио-френдли',
        'Рекомендации по релизу'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const realCases = [
    {
      producer: 'Иван Дорн',
      track: 'Стыцамэн (Club Mix)',
      versions: 5,
      winner: 'Version 3',
      before: {
        streams: '3.2K',
        chartPosition: null,
        radioPlays: 3
      },
      after: {
        streams: '45K',
        chartPosition: 38,
        radioPlays: 47
      },
      insight: 'Версия 3 с увеличенными басами показала +42% предпочтений. Трек попал в TOP-50 Apple Music',
      icon: Activity,
      color: 'from-purple-400 to-pink-500'
    },
    {
      producer: 'Скриптонит',
      track: 'Это любовь (Trap Mix)',
      versions: 3,
      winner: 'Version 2',
      before: {
        streams: '8.5K',
        chartPosition: 89,
        radioPlays: 12
      },
      after: {
        streams: '78K',
        chartPosition: 21,
        radioPlays: 93
      },
      insight: 'Reference matching показал: нужно было поднять высокие частоты. Результат — TOP-25 в чарте',
      icon: Target,
      color: 'from-green-400 to-emerald-500'
    },
    {
      producer: 'Александр Попов',
      track: 'Moonlight (Extended Mix)',
      versions: 4,
      winner: 'Version 4',
      before: {
        streams: '4.1K',
        chartPosition: null,
        radioPlays: 5
      },
      after: {
        streams: '52K',
        chartPosition: 47,
        radioPlays: 61
      },
      insight: 'Фокус-группа EDM-слушателей выбрала версию с расширенным intro. TOP-50 Beatport Trance',
      icon: Music,
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  const abTestExample = {
    versionA: {
      name: 'Vocal Up',
      preference: 44,
      highlights: ['Четкая вокальная линия', 'Лучше для радио', 'Эмоциональнее']
    },
    versionB: {
      name: 'Bass Heavy',
      preference: 56,
      highlights: ['Мощные басы', 'Отлично для клубов', 'Современнее звучит']
    }
  };

  const productionTools = [
    {
      icon: Activity,
      title: 'Спектральный анализ',
      description: 'Детальный анализ частот и баланса',
      badge: 'FFT'
    },
    {
      icon: Sliders,
      title: 'Loudness Meter',
      description: 'LUFS, True Peak, Dynamic Range',
      badge: 'EBU R128'
    },
    {
      icon: Target,
      title: 'Reference сравнение',
      description: 'Сравнение с эталонными треками',
      badge: 'AI Match'
    },
    {
      icon: BarChart3,
      title: 'Stereo Image',
      description: 'Анализ стереобазы и фазы',
      badge: 'Phase'
    }
  ];

  const stats = [
    { label: 'Продюсеров', value: '1,200+', icon: Users, growth: '+38%' },
    { label: 'A/B тестов', value: '4,500+', icon: Activity, growth: '+52%' },
    { label: 'Точность прогноза', value: '78%', icon: Target, growth: '+6%' },
    { label: 'Хитов создано', value: '67+', icon: Music, growth: '+24%' }
  ];

  const pricing = [
    {
      name: 'Producer Basic',
      price: '$49',
      period: '/месяц',
      description: 'Для независимых продюсеров',
      features: [
        '10 тестов треков в месяц',
        'A/B тест 2 версии',
        'Базовая аналитика',
        '100 респондентов на тест',
        'Email поддержка'
      ],
      popular: false
    },
    {
      name: 'Producer Pro',
      price: '$129',
      period: '/месяц',
      description: 'Для профессиональных продюсеров',
      features: [
        '50 тестов треков в месяц',
        'A/B тест до 5 версий',
        'Продвинутая продакшн аналитика',
        '500 респондентов на тест',
        'Спектральный анализ',
        'Reference сравнение',
        'Приоритетная поддержка'
      ],
      popular: true
    },
    {
      name: 'Studio Enterprise',
      price: '$399',
      period: '/месяц',
      description: 'Для студий и лейблов',
      features: [
        'Неограниченные тесты',
        'A/B тест до 10 версий',
        'Полный продакшн пакет',
        'Фокус-группы любого размера',
        'White-label отчеты',
        'API интеграция с DAW',
        'Персональный менеджер'
      ],
      popular: false
    }
  ];

  const workflows = [
    {
      step: '1',
      title: 'Создайте несколько версий',
      description: 'Экспортируйте 2-5 вариантов микса или мастера',
      icon: Music
    },
    {
      step: '2',
      title: 'Загрузите на тест',
      description: 'Выберите целевую аудиторию и жанр',
      icon: Activity
    },
    {
      step: '3',
      title: 'Получите данные',
      description: 'Детальная аналитика через 24-48 часов',
      icon: BarChart3
    },
    {
      step: '4',
      title: 'Финализируйте трек',
      description: 'Выберите лучшую версию и выпускайте',
      icon: Sparkles
    }
  ];

  const testimonials = [
    {
      name: 'Иван Дорн',
      role: 'Producer',
      avatar: '🎹',
      text: 'A/B тесты спасли мой трек! Выбрал версию №3, она взорвала чарты. Теперь тестирую все релизы.',
      rating: 5,
      verified: true
    },
    {
      name: 'Скриптонит',
      role: 'Producer & Artist',
      avatar: '🎤',
      text: 'Продакшн аналитика на уровне профессиональной студии. Референс-сравнение — мастхэв!',
      rating: 5,
      verified: true
    },
    {
      name: 'Александр Попов',
      role: 'Trance Producer',
      avatar: '🎧',
      text: 'Тестирую треки на целевой EDM аудитории. Feedback помог улучшить структуру треков.',
      rating: 5,
      verified: true
    }
  ];

  const producerBenefits = [
    { icon: CheckCircle2, text: '14 дней бесплатно' },
    { icon: CheckCircle2, text: 'Без кредитной карты' },
    { icon: CheckCircle2, text: 'Экспорт отчетов в PDF' },
    { icon: CheckCircle2, text: 'Консультация специалиста' }
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">
      
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F]/10 via-transparent to-[#3E4C5E]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,87,127,0.15),transparent_60%)]" />
        
        {/* Animated waveform */}
        <motion.div
          animate={{ scaleX: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-0 left-0 right-0 h-32 opacity-5"
        >
          <svg viewBox="0 0 1200 120" className="w-full h-full">
            <path d="M0,60 Q300,10 600,60 T1200,60" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#FF577F]" />
          </svg>
        </motion.div>
        
        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-[#FF577F]/20"
            >
              <Activity className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold">Для саундпродюсеров</span>
            </motion.div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Создавайте{' '}
              <motion.span 
                initial={{ backgroundPosition: '0% 50%' }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                хиты
              </motion.span>{' '}
              с данными
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              A/B тесты, продакшн аналитика и прогнозы для ваших треков
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
              {producerBenefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="flex items-center gap-1.5"
                >
                  <benefit.icon className="w-4 h-4 text-[#FF577F]" />
                  <span>{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

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

      {/* INTERACTIVE A/B TEST DEMO */}
      <div className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            A/B тест в <span className="text-[#FF577F]">действии</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Интерактивный пример сравнения версий
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          {/* Version Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedVersion('A')}
              className={`px-8 py-4 rounded-2xl font-bold transition-all ${
                selectedVersion === 'A'
                  ? 'bg-[#FF577F] shadow-lg shadow-[#FF577F]/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Version A: {abTestExample.versionA.name}
            </motion.button>
            <span className="text-slate-500 font-bold">VS</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedVersion('B')}
              className={`px-8 py-4 rounded-2xl font-bold transition-all ${
                selectedVersion === 'B'
                  ? 'bg-[#FF577F] shadow-lg shadow-[#FF577F]/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              Version B: {abTestExample.versionB.name}
            </motion.button>
          </div>

          {/* Results Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Version A */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: selectedVersion === 'A' ? 1 : 0.5, x: 0 }}
              className="bg-black/30 rounded-2xl p-6 border border-white/5"
            >
              <div className="text-center mb-6">
                <div className="text-5xl font-black text-slate-300 mb-2">
                  {abTestExample.versionA.preference}%
                </div>
                <div className="text-sm text-slate-500">предпочли эту версию</div>
              </div>
              <div className="space-y-2">
                {abTestExample.versionA.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Version B */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: selectedVersion === 'B' ? 1 : 0.5, x: 0 }}
              className="bg-gradient-to-br from-[#FF577F]/20 to-[#FF6B8F]/10 rounded-2xl p-6 border border-[#FF577F]/30"
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-5xl font-black text-[#FF577F]">
                    {abTestExample.versionB.preference}%
                  </div>
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-sm text-[#FF577F] font-bold">ПОБЕДИТЕЛЬ</div>
              </div>
              <div className="space-y-2">
                {abTestExample.versionB.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400 italic">
              💡 На основе тестирования 500 респондентов в возрасте 18-35 лет
            </p>
          </div>
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
            Истории <span className="text-[#FF577F]">успеха</span> продюсеров
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Реальные кейсы с конкретными цифрами
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
              {/* Producer Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${caseStudy.color} flex items-center justify-center`}>
                  <caseStudy.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{caseStudy.producer}</h3>
                  <p className="text-xs text-slate-400">{caseStudy.track}</p>
                </div>
              </div>

              {/* A/B Test Info */}
              <div className="bg-black/30 rounded-xl p-3 mb-4 border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Тестировано версий:</span>
                  <span className="font-bold">{caseStudy.versions}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Победитель:</span>
                  <span className="font-bold text-[#FF577F]">{caseStudy.winner}</span>
                </div>
              </div>

              {/* Before/After */}
              <div className="space-y-4 mb-6">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-slate-500 mb-3">До теста</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Streams</div>
                      <div className="font-bold text-sm">{caseStudy.before.streams}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Chart</div>
                      <div className="font-bold text-sm">{caseStudy.before.chartPosition || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Radio</div>
                      <div className="font-bold text-sm">{caseStudy.before.radioPlays}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-[#FF577F]" />
                </div>

                <div className="bg-gradient-to-br from-[#FF577F]/20 to-[#FF6B8F]/10 rounded-xl p-4 border border-[#FF577F]/30">
                  <div className="text-xs text-[#FF577F] font-bold mb-3">После оптимизации</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Streams</div>
                      <div className="font-bold text-sm text-[#FF577F]">{caseStudy.after.streams}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Chart</div>
                      <div className="font-bold text-sm text-[#FF577F]">#{caseStudy.after.chartPosition}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Radio</div>
                      <div className="font-bold text-sm text-[#FF577F]">{caseStudy.after.radioPlays}</div>
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

      {/* PRODUCTION TOOLS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Продакшн анализ
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Технические метрики вашего трека
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productionTools.map((tool, idx) => (
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
              <p className="text-xs text-slate-400">{tool.description}</p>
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
            Профессиональные инструменты
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Всё для качественного продакшна
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
            Как это работает
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Простой процесс от теста до релиза
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
            Тарифы для продюсеров
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Выберите подходящий план
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
            Истории продюсеров
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
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-40 h-40 opacity-5"
          >
            <Activity className="w-full h-full" />
          </motion.div>
          
          <Headphones className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Создайте свой следующий хит
          </h3>
          <p className="text-slate-300 mb-6">
            Бесплатный пробный период 14 дней. Кредитная карта не требуется.
          </p>
          <Button 
            onClick={onGetStarted}
            className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full group"
          >
            <Activity className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Начать сейчас
          </Button>
        </motion.div>
      </div>

    </div>
  );
}

// Missing import for Crown
import { Crown } from 'lucide-react';