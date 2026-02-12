/**
 * FOR ARTISTS PAGE - Страница "Для артистов"
 * Полное описание всех функций и возможностей платформы promo.music
 */

import { motion } from 'motion/react';
import { 
  TrendingUp, Users, Radio, TestTube, Sparkles, Crown, DollarSign,
  BarChart3, Music, Video, Globe, Target, Rocket, Shield, Award,
  Zap, Heart, MessageSquare, Calendar, Megaphone, Image, Mic, 
  LineChart, Coins, Star, Gift, CheckCircle2, ArrowRight,
  Play, Eye, Share2, Download, Activity, MapPin
} from 'lucide-react';

const artistHeroImage = 'https://images.unsplash.com/photo-1601814924207-dc1ee8e9e979?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

interface ForArtistsPageProps {
  onGetStarted: () => void;
}

export function ForArtistsPage({ onGetStarted }: ForArtistsPageProps) {
  
  // Основные возможности платформы
  const mainFeatures = [
    {
      icon: BarChart3,
      title: 'Продвинутая аналитика',
      description: 'Полная статистика прослушиваний, доходов, географии аудитории в реальном времени. Отслеживайте рост по всем платформам.',
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Real-time статистика прослушиваний',
        'География слушателей по странам',
        'Динамика роста аудитории',
        'Отчёты по доходам и платформам',
        'Экспорт данных в Excel/CSV'
      ]
    },
    {
      icon: TestTube,
      title: 'Тест трека',
      description: 'Революционная система профессиональной оценки треков экспертами индустрии. Получите детальный фидбек от продюсеров, A&R и диджеев.',
      color: 'from-purple-500 to-pink-500',
      features: [
        'Оценка от реальных экспертов',
        'Детальный анализ по 10+ критериям',
        'Рекомендации по улучшению',
        'Сравнение с топ-треками',
        'Прогноз коммерческого успеха'
      ]
    },
    {
      icon: Image,
      title: 'Баннерная реклама',
      description: 'Размещайте баннеры на главной странице, в каталогах и профилях. Таргетированная реклама с детальной статистикой.',
      color: 'from-green-500 to-emerald-500',
      features: [
        'Размещение на главной странице',
        'Таргетинг по жанрам и регионам',
        'Статистика показов и кликов',
        'A/B тестирование креативов',
        'Гибкие форматы баннеров'
      ]
    },
    {
      icon: Radio,
      title: 'Питчинг радиостанциям',
      description: 'Отправляйте треки напрямую на радиостанции и в плейлисты. Прямой контакт с кураторами и программными директорами.',
      color: 'from-yellow-500 to-orange-500',
      features: [
        'База 50+ радиостанций',
        'Прямые контакты с кураторами',
        'Трекинг статуса заявок',
        'Автоматические рекомендации',
        'Аналитика эфирного времени'
      ]
    },
    {
      icon: Megaphone,
      title: 'Маркетинг и продвижение',
      description: 'Комплексные инструменты для продвижения: новости, пресс-релизы, email-кампании, партнёрская программа.',
      color: 'from-pink-500 to-rose-500',
      features: [
        'Публикация новостей',
        'Email-рассылки подписчикам',
        'Партнёрская программа',
        'Промо-коды и акции',
        'Интеграция с соцсетями'
      ]
    },
    {
      icon: Calendar,
      title: 'Система концертов',
      description: 'Управление турами, продажа билетов, продвижение концертов на главной странице платформы.',
      color: 'from-indigo-500 to-blue-500',
      features: [
        'Календарь концертов',
        'Интеграция с билетными системами',
        'Продвижение на главной',
        'Аналитика продаж билетов',
        'Уведомления фанатам'
      ]
    },
    {
      icon: MapPin,
      title: 'Где играет мой трек',
      description: 'Отслеживайте где ваша музыка играет прямо сейчас. Интеграция с 50+ заведений через Promo.air и публичная карта в Promo.guide.',
      color: 'from-teal-500 to-cyan-500',
      features: [
        'Real-time трекинг: где играет сейчас',
        'Карта всех заведений',
        'Уведомления когда трек в эфире',
        'Статистика по городам и заведениям',
        'Делитесь в соцсетях'
      ]
    },
  ];

  // Тарифные планы
  const pricingPlans = [
    {
      name: 'Spark',
      icon: Sparkles,
      price: '2500₽',
      period: '/месяц',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      features: [
        'Базовая аналитика',
        '5 тестов треков/месяц',
        'Загрузка до 20 треков',
        'Базовая поддержка',
        'Скидка 20% на услуги'
      ],
      popular: false
    },
    {
      name: 'Start',
      icon: Star,
      price: '10000₽',
      period: '/месяц',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      features: [
        'Продвинутая аналитика',
        '15 тестов треков/месяц',
        'Загрузка до 50 треков',
        'Приоритетная поддержка',
        'Скидка 30% на услуги'
      ],
      popular: false
    },
    {
      name: 'Pro',
      icon: TrendingUp,
      price: '35000₽',
      period: '/месяц',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      features: [
        'Полная аналитика + экспорт',
        '30 тестов треков/месяц',
        'Безлимитная загрузка треков',
        'Баннеры со скидкой 40%',
        'Партнёрская программа',
        'VIP поддержка',
        'Скидка 40% на услуги'
      ],
      popular: true
    },
    {
      name: 'Elite',
      icon: Crown,
      price: '100000₽',
      period: '/месяц',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      features: [
        'Всё из Pro +',
        'Безлимит тестов треков',
        'Персональный менеджер',
        'Приоритет в плейлистах',
        'Баннеры со скидкой 50%',
        'Расширенная партнёрка',
        'Доступ к закрытым event',
        'Скидка 50% на услуги'
      ],
      popular: false
    },
  ];

  // Статистика платформы
  const stats = [
    { icon: Users, value: '1K+', label: 'Активных артистов' },
    { icon: Music, value: '5K+', label: 'Треков в каталоге' },
    { icon: Radio, value: '50+', label: 'Радиостанций' },
    { icon: Globe, value: '15+', label: 'Стран' },
  ];

  // Процесс работы
  const workflow = [
    {
      step: '01',
      icon: Music,
      title: 'Загрузите треки',
      description: 'Загружайте треки, видео, обложки. Все форматы поддерживаются.'
    },
    {
      step: '02',
      icon: TestTube,
      title: 'Получите фидбек',
      description: 'Отправьте трек на тест экспертам и получите профессиональную оценку.'
    },
    {
      step: '03',
      icon: Rocket,
      title: 'Запустите промо',
      description: 'Используйте баннеры, питчинг, рассылки для продвижения.'
    },
    {
      step: '04',
      icon: BarChart3,
      title: 'Анализируйте результаты',
      description: 'Отслеживайте статистику в реальном времени и корректируйте стратегию.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* HERO IMAGE SECTION */}
      <section className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[65vh] xl:h-[70vh] max-h-[700px] overflow-hidden bg-black">
        {/* Animated ambient glows - neon blue/purple cyberpunk tones */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.38, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-[300px] sm:w-[400px] xl:w-[500px] h-[250px] sm:h-[320px] xl:h-[400px] bg-blue-500 rounded-full"
            style={{ filter: 'blur(140px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/3 right-1/3 w-[280px] sm:w-[360px] xl:w-[450px] h-[220px] sm:h-[280px] xl:h-[350px] bg-purple-600 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            className="absolute top-1/3 right-1/4 w-[220px] sm:w-[280px] xl:w-[350px] h-[180px] sm:h-[220px] xl:h-[280px] bg-[#FF577F] rounded-full"
            style={{ filter: 'blur(110px)' }}
          />
        </div>

        {/* Cyberpunk artist image - dark bg blends via lighten */}
        <motion.img
          src={artistHeroImage}
          alt="Кибер-артистка на сцене"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: [1, 1.015, 1] }}
          transition={{
            opacity: { duration: 1.4, ease: 'easeOut' },
            scale: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'lighten' }}
        />

        {/* Stage light sparkle particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className={`absolute rounded-full ${
              i % 4 === 0 ? 'bg-cyan-400' : i % 4 === 1 ? 'bg-blue-400' : i % 4 === 2 ? 'bg-purple-400' : 'bg-[#FF577F]'
            }`}
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${10 + i * 8}%`,
              top: `${15 + (i % 5) * 12}%`,
            }}
            animate={{
              y: [0, -30 - i * 4, 0],
              opacity: [0, 0.9, 0],
              scale: [0.4, 1.5, 0.4],
            }}
            transition={{
              duration: 2.5 + i * 0.35,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Rotating ring watermark (matching VR visor ring) */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-6 right-6 sm:top-10 sm:right-10 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.05]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 4" />
          </svg>
        </motion.div>

        {/* Edge fades */}
        <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-52 bg-gradient-to-t from-gray-900 via-black/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF577F]/40 to-transparent" />

        {/* Floating badge + title on image */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-[#FF577F]/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-bold text-white/90">Платформа №1 для профессиональных артистов</span>
            </motion.div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight max-w-4xl">
              <span className="block text-white/90">Всё для развития</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-[#FF577F] via-cyan-400 to-[#FF577F] bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                вашей карьеры
              </motion.span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* TEXT + CTA SECTION */}
      <section className="relative py-8 sm:py-12 lg:py-10 px-3 sm:px-5 lg:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 lg:mb-8 leading-relaxed">
              Профессиональная платформа с полным набором инструментов для артистов.<br className="hidden sm:block" />
              Твоя музыка в 50+ заведений через Promo.air и на карте Promo.guide
            </p>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center mb-4 lg:mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="group px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg shadow-lg shadow-[#FF577F]/30 hover:shadow-[#FF577F]/50 transition-all flex items-center gap-2 lg:gap-3"
              >
                Начать бесплатно
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 lg:px-8 py-3 lg:py-4 bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 lg:gap-3"
              >
                <Play className="w-4 h-4 lg:w-5 lg:h-5" />
                Смотреть демо
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 px-3 sm:px-5 lg:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            {stats.map((stat, index) => {
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
                  <Icon className="w-8 h-8 lg:w-10 lg:h-10 mx-auto mb-2 lg:mb-3 text-[#FF577F] group-hover:scale-110 transition-transform" />
                  <div className="text-2xl lg:text-3xl font-black mb-0.5 lg:mb-1">{stat.value}</div>
                  <div className="text-xs lg:text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-12 lg:py-16 xl:py-20 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-14 xl:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black mb-3 lg:mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Мощные инструменты
              </span>
            </h2>
            <p className="text-base lg:text-lg xl:text-xl text-gray-400 max-w-2xl mx-auto">
              Всё необходимое для профессионального развития в одной платформе
            </p>
          </motion.div>

          <div className="grid xl:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl xl:rounded-3xl backdrop-blur-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl xl:rounded-3xl"
                       style={{
                         background: `linear-gradient(135deg, ${feature.color.split(' ')[1].replace('to-', '')}15, transparent)`
                       }} />
                  
                  {/* Border */}
                  <div className="absolute inset-0 rounded-2xl xl:rounded-3xl border border-white/10 group-hover:border-white/20 transition-colors" />

                  {/* Content */}
                  <div className="relative p-5 lg:p-6 xl:p-8">
                    {/* Icon */}
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-xl xl:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 xl:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl lg:text-2xl font-black mb-2 lg:mb-3">{feature.title}</h3>
                    <p className="text-sm lg:text-base text-gray-400 mb-4 xl:mb-6 leading-relaxed">{feature.description}</p>

                    {/* Features List */}
                    <ul className="space-y-2 xl:space-y-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 xl:gap-3">
                          <CheckCircle2 className={`w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0 mt-0.5 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                          <span className="text-xs lg:text-sm text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-16 xl:py-20 px-3 sm:px-5 lg:px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-14 xl:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black mb-3 lg:mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Как это работает
              </span>
            </h2>
            <p className="text-base lg:text-lg xl:text-xl text-gray-400 max-w-2xl mx-auto">
              Простой путь от загрузки трека до успешного релиза
            </p>
          </motion.div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 xl:gap-6">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  {/* Connector Line (except last item) */}
                  {index < workflow.length - 1 && (
                    <div className="hidden xl:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#FF577F]/50 to-transparent -z-10" />
                  )}

                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 border border-white/10 hover:bg-white/10 transition-all h-full">
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 lg:-top-4 lg:-left-4 w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF6B8F] flex items-center justify-center font-black text-sm lg:text-lg shadow-lg shadow-[#FF577F]/30">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-lg lg:rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-3 lg:mb-4 ml-6 lg:ml-8 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-[#FF577F]" />
                    </div>

                    {/* Content */}
                    <h3 className="text-base lg:text-lg xl:text-xl font-black mb-1.5 lg:mb-2">{step.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 lg:py-16 xl:py-20 px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 lg:mb-14 xl:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black mb-3 lg:mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Выберите тариф
              </span>
            </h2>
            <p className="text-base lg:text-lg xl:text-xl text-gray-400 max-w-2xl mx-auto">
              Гибкие тарифы для артистов любого уровня
            </p>
          </motion.div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 xl:gap-5">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative group ${plan.popular ? 'xl:scale-105' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] rounded-full text-xs font-bold z-10 shadow-lg shadow-[#FF577F]/30">
                      Популярный
                    </div>
                  )}

                  {/* Card */}
                  <div className={`relative h-full bg-gradient-to-br ${plan.color} backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${plan.borderColor} hover:scale-105 transition-all`}>
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-lg sm:text-2xl font-black mb-1 sm:mb-2">{plan.name}</h3>

                    {/* Price */}
                    <div className="mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-4xl font-black">{plan.price}</span>
                      <span className="text-xs sm:text-base text-gray-400">{plan.period}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-green-400" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={onGetStarted}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] hover:shadow-lg hover:shadow-[#FF577F]/30'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      Выбрать план
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Price Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 mt-8"
          >
            * Все цены указаны в российских рублях. Доступна оплата по подписке и разовые платежи.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 xl:py-20 px-3 sm:px-5 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl xl:rounded-3xl"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F] via-[#FF6B8F] to-[#3E4C5E]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />
            
            {/* Content */}
            <div className="relative p-8 lg:p-10 xl:p-12 text-center">
              <Rocket className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 mx-auto mb-4 xl:mb-6 text-white" />
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black mb-3 lg:mb-4 text-white">
                Готовы начать?
              </h2>
              <p className="text-base lg:text-lg xl:text-xl text-white/90 mb-6 xl:mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к растущей сети артистов, которые используют Promo.music для развития карьеры
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-[#FF577F] rounded-xl xl:rounded-2xl font-bold text-base lg:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Начать бесплатно
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 lg:px-8 py-3 lg:py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl xl:rounded-2xl font-bold text-base lg:text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  Связаться с нами
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 lg:py-10 xl:py-12 px-3 sm:px-5 lg:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF577F] shrink-0" />
              <span className="text-xs lg:text-sm text-gray-400">
                Безопасные платежи
              </span>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
              <Award className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF577F] shrink-0" />
              <span className="text-xs lg:text-sm text-gray-400">
                Поддержка 24/7
              </span>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
              <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-[#FF577F] shrink-0" />
              <span className="text-xs lg:text-sm text-gray-400">
                Регулярные обновления
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}