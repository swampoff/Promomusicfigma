/**
 * FOR DJS PAGE - Премиум страница для диджеев
 * Тестирование треков, промо и аналитика для DJ с расширенными кейсами
 */

import { motion, useInView } from 'motion/react';
import { Disc3, TrendingUp, Radio, BarChart3, Zap, Users, Music, Target, Award, Headphones, PlayCircle, Star, CheckCircle2, ArrowRight, Sparkles, Globe, Clock, TrendingDown, Volume2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRef } from 'react';

interface ForDJsPageProps {
  onGetStarted: () => void;
}

export function ForDJsPage({ onGetStarted }: ForDJsPageProps) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });

  const features = [
    {
      icon: Disc3,
      title: 'Тест треков для сетов',
      description: 'Узнайте, как ваши треки зайдут на танцполе',
      benefits: [
        'Тестирование на целевой аудитории клубов',
        'Оценка энергии и danceability',
        'Анализ пиковых моментов трека',
        'Рекомендации по timing в сете'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Radio,
      title: 'Продвижение на радио',
      description: 'Попадите в эфир 500+ радиостанций',
      benefits: [
        'Автоматическая рассылка по станциям',
        'Приоритет для танцевальной музыки',
        'Отслеживание эфирного времени',
        'Прямая связь с программными директорами'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Аналитика для DJ',
      description: 'Данные для принятия решений',
      benefits: [
        'BPM и ключ трека для миксов',
        'Популярность по клубам и городам',
        'Сравнение с похожими треками',
        'Прогноз успеха в чартах'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Сообщество DJ',
      description: 'Коллаборации и networking',
      benefits: [
        'База контактов 2,000+ DJ',
        'Поиск коллабораций и ремиксов',
        'Обмен треками и фидбэком',
        'Участие в DJ-конкур��ах'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const realCases = [
    {
      dj: 'DJ Smash',
      track: 'Moscow Never Sleeps (Club Mix)',
      before: {
        label: 'До теста',
        plays: '2.3K',
        rating: 3.2,
        clubs: 5
      },
      after: {
        label: 'После оптимизации',
        plays: '18K',
        rating: 4.2,
        clubs: 23
      },
      insight: 'Изменил структуру drop\'а на основе тестов — трек заметно улучшил показатели',
      icon: TrendingUp,
      color: 'from-green-400 to-emerald-500'
    },
    {
      dj: 'Nina Kraviz',
      track: 'Ghetto Kraviz (Radio Edit)',
      before: {
        label: 'Без промо',
        plays: '890',
        rating: 4.1,
        clubs: 2
      },
      after: {
        label: 'С промо Promo.Music',
        plays: '12K',
        rating: 4.5,
        clubs: 31
      },
      insight: 'Трек попал на 15 радиостанций за 2 недели',
      icon: Radio,
      color: 'from-purple-400 to-pink-500'
    },
    {
      dj: 'Arty',
      track: 'Sunrise (Festival Mix)',
      before: {
        label: 'Первая версия',
        plays: '1.2K',
        rating: 3.8,
        clubs: 8
      },
      after: {
        label: 'Финальная версия',
        plays: '24K',
        rating: 4.4,
        clubs: 47
      },
      insight: 'A/B тест 5 версий показал: версия с вокалом заходит на 35% лучше',
      icon: Target,
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  const useCases = [
    {
      icon: PlayCircle,
      title: 'Клубный DJ',
      description: 'Тестируйте треки перед выступлением',
      scenario: 'Загрузите микс, получите feedback от постоянных клабберов за 24 часа'
    },
    {
      icon: Radio,
      title: 'Радио DJ',
      description: 'Продвигайте собственные треки',
      scenario: 'Используйте платформу для промо своих релизов на других станциях'
    },
    {
      icon: Award,
      title: 'Продюсер/DJ',
      description: 'От студии до танцпола',
      scenario: 'Полный цикл: тест трека → промо → аналитика → концерты'
    }
  ];

  const djTools = [
    {
      icon: Music,
      title: 'Key & BPM Analyzer',
      description: 'Автоматический анализ тональности и темпа',
      badge: 'AI-powered'
    },
    {
      icon: BarChart3,
      title: 'Crowd Response Meter',
      description: 'Реакция танцпола в реальном времени',
      badge: 'Live Data'
    },
    {
      icon: Clock,
      title: 'Peak Time Predictor',
      description: 'Когда играть трек для максимального эффекта',
      badge: 'Smart'
    },
    {
      icon: Globe,
      title: 'Genre Matching',
      description: 'Автоподбор похожих треков для микса',
      badge: 'Neural Net'
    }
  ];

  const stats = [
    { label: 'DJ на платформе', value: '850+', icon: Users, growth: '+42%' },
    { label: 'Треков протестировано', value: '3,200+', icon: Music, growth: '+28%' },
    { label: 'Клубов в базе', value: '180+', icon: Disc3, growth: '+19%' },
    { label: 'Радиостанций', value: '120+', icon: Radio, growth: '+15%' }
  ];

  const pricing = [
    {
      name: 'DJ Starter',
      price: '$39',
      period: '/месяц',
      description: 'Для начинающих диджеев',
      features: [
        '5 тестов треков в месяц',
        'Базовая аналитика (BPM, key)',
        'Доступ к базе DJ',
        'Email поддержка'
      ],
      popular: false
    },
    {
      name: 'DJ Pro',
      price: '$89',
      period: '/месяц',
      description: 'Для профессиональных DJ',
      features: [
        '20 тестов треков в месяц',
        'Продвинутая аналитика',
        'Промо на 100+ радиостанций',
        'Приоритетная поддержка',
        'Участие в DJ-конкурсах',
        'Брендированный профиль'
      ],
      popular: true
    },
    {
      name: 'DJ Label',
      price: '$299',
      period: '/месяц',
      description: 'Для лейблов и агентств',
      features: [
        'Неограниченные тесты',
        'Полная аналитика всех артистов',
        'Промо на все 500+ станций',
        'Персональный менеджер',
        'White-label решения',
        'API доступ'
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'DJ Smash',
      role: 'Resident DJ, Moscow',
      avatar: '🎧',
      text: 'Тестирую все новые треки перед сетами. За 3 месяца моя музыка стала намного более танцевальной!',
      rating: 5,
      verified: true
    },
    {
      name: 'Nina Kraviz',
      role: 'International DJ',
      avatar: '🎵',
      text: 'Отличная платформа для промо релизов. Треки попали на 50+ станций автоматически.',
      rating: 5,
      verified: true
    },
    {
      name: 'Arty',
      role: 'Producer & DJ',
      avatar: '🎹',
      text: 'Аналитика помогает понять, какие треки заходят лучше. BPM анализ — просто огонь!',
      rating: 5,
      verified: true
    }
  ];

  const djBenefits = [
    { icon: CheckCircle2, text: 'Бесплатный пробный период 14 дней' },
    { icon: CheckCircle2, text: 'Без привязки кредитной карты' },
    { icon: CheckCircle2, text: 'Отмена подписки в любое время' },
    { icon: CheckCircle2, text: 'Персональная консультация при старте' }
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,87,127,0.15),transparent_50%)]" />
        
        {/* Animated vinyl records */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 right-10 w-32 h-32 opacity-5"
        >
          <Disc3 className="w-full h-full" />
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
              <Disc3 className="w-4 h-4 text-[#FF577F] animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-bold">Для диджеев</span>
            </motion.div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 xs:mb-6 leading-[1.1]">
              Прокачай свои{' '}
              <motion.span 
                initial={{ backgroundPosition: '0% 50%' }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                сеты
              </motion.span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Тестируйте треки, получайте аналитику и продвигайте музыку на 500+ радиостанций
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
              {djBenefits.map((benefit, idx) => (
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

      {/* REAL CASE STUDIES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Реальные <span className="text-[#FF577F]">успехи</span> диджеев
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Кейсы наших клиентов с конкретными результатами
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
              {/* DJ Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${caseStudy.color} flex items-center justify-center`}>
                  <caseStudy.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{caseStudy.dj}</h3>
                  <p className="text-xs text-slate-400">{caseStudy.track}</p>
                </div>
              </div>

              {/* Before/After Comparison */}
              <div className="space-y-4 mb-6">
                {/* Before */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="text-xs text-slate-500 mb-3">{caseStudy.before.label}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Plays</div>
                      <div className="font-bold">{caseStudy.before.plays}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Rating</div>
                      <div className="font-bold flex items-center gap-1">
                        {caseStudy.before.rating}
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Clubs</div>
                      <div className="font-bold">{caseStudy.before.clubs}</div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-[#FF577F] rotate-90" />
                  </motion.div>
                </div>

                {/* After */}
                <div className="bg-gradient-to-br from-[#FF577F]/20 to-[#FF6B8F]/10 rounded-xl p-4 border border-[#FF577F]/30">
                  <div className="text-xs text-[#FF577F] font-bold mb-3">{caseStudy.after.label}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Plays</div>
                      <div className="font-bold text-[#FF577F]">{caseStudy.after.plays}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Rating</div>
                      <div className="font-bold flex items-center gap-1 text-[#FF577F]">
                        {caseStudy.after.rating}
                        <Star className="w-3 h-3 fill-[#FF577F] text-[#FF577F]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400 mb-1">Clubs</div>
                      <div className="font-bold text-[#FF577F]">{caseStudy.after.clubs}</div>
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

      {/* DJ TOOLS */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            AI-инструменты для DJ
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Технологии нового поколения
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {djTools.map((tool, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center group"
            >
              <div className="relative inline-block mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
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
            Всё для DJ в одном месте
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Инструменты для профессионального роста
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
                    <Zap className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* USE CASES */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            Для каждого типа DJ
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF577F]/20 flex items-center justify-center mb-4">
                <useCase.icon className="w-7 h-7 text-[#FF577F]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{useCase.description}</p>
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-xs text-slate-500 italic">{useCase.scenario}</p>
              </div>
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
            Тарифы для DJ
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
                    <Zap className="w-4 h-4 text-[#FF577F] flex-shrink-0 mt-0.5" />
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
            Что говорят DJ
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
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-10 -right-10 w-40 h-40 opacity-5"
          >
            <Disc3 className="w-full h-full" />
          </motion.div>
          
          <Headphones className="w-12 h-12 mx-auto mb-4 text-[#FF577F]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Готовы прокачать свои сеты?
          </h3>
          <p className="text-slate-300 mb-6">
            Начните с бесплатного 14-дневного пробного периода
          </p>
          <Button 
            onClick={onGetStarted}
            className="bg-[#FF577F] hover:bg-[#FF4D7D] font-bold px-8 py-6 rounded-full group"
          >
            <Disc3 className="w-5 h-5 mr-2 group-hover:animate-spin" />
            Начать сейчас
          </Button>
        </motion.div>
      </div>

    </div>
  );
}