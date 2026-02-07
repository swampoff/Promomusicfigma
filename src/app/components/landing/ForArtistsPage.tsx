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
      description: 'Отслеживайте где ваша музыка играет прямо сейчас. Интеграция с 50+ заведений через Promo.Air и публичная карта в Promo.Guide.',
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF577F] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3E4C5E] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF577F]/20 to-purple-500/20 rounded-full border border-[#FF577F]/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#FF577F]" />
              <span className="text-sm font-semibold text-white/90">Платформа №1 для профессиональных артистов</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Всё для развития
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent">
                вашей карьеры
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Профессиональная платформа с полным набором инструментов для артистов.<br/>
              Твоя музыка в 50+ заведений через Promo.Air и на карте Promo.Guide
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] rounded-2xl font-bold text-lg shadow-lg shadow-[#FF577F]/30 hover:shadow-[#FF577F]/50 transition-all flex items-center gap-3"
              >
                Начать бесплатно
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Смотреть демо
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center group hover:bg-white/10 transition-all"
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-[#FF577F] group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Мощные инструменты
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Всё необходимое для профессионального развития в одной платформе
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl backdrop-blur-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                       style={{
                         background: `linear-gradient(135deg, ${feature.color.split(' ')[1].replace('to-', '')}15, transparent)`
                       }} />
                  
                  {/* Border */}
                  <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-white/20 transition-colors" />

                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>

                    {/* Features List */}
                    <ul className="space-y-3">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} />
                          <span className="text-sm text-gray-300">{item}</span>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Как это работает
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Простой путь от загрузки трека до успешного релиза
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#FF577F]/50 to-transparent -z-10" />
                  )}

                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all h-full">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF6B8F] flex items-center justify-center font-black text-lg shadow-lg shadow-[#FF577F]/30">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 ml-8 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-[#FF577F]" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-black mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Выберите тариф
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Гибкие тарифы для артистов любого уровня
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative group ${plan.popular ? 'lg:scale-105' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#FF577F] to-[#FF6B8F] rounded-full text-xs font-bold z-10 shadow-lg shadow-[#FF577F]/30">
                      Популярный
                    </div>
                  )}

                  {/* Card */}
                  <div className={`relative h-full bg-gradient-to-br ${plan.color} backdrop-blur-xl rounded-3xl p-6 border ${plan.borderColor} hover:scale-105 transition-all`}>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" />
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF577F] via-[#FF6B8F] to-[#3E4C5E]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20" />
            
            {/* Content */}
            <div className="relative p-12 text-center">
              <Rocket className="w-16 h-16 mx-auto mb-6 text-white" />
              <h2 className="text-4xl font-black mb-4 text-white">
                Готовы начать?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к растущей сети артистов, которые используют promo.music для развития карьеры
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-white text-[#FF577F] rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Начать бесплатно
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  Связаться с нами
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <Shield className="w-6 h-6 text-[#FF577F]" />
              <span className="text-sm text-gray-400">
                Безопасные платежи через проверенные системы
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Award className="w-6 h-6 text-[#FF577F]" />
              <span className="text-sm text-gray-400">
                Поддержка 24/7 для всех пользователей
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Zap className="w-6 h-6 text-[#FF577F]" />
              <span className="text-sm text-gray-400">
                Регулярные обновления и новые функции
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}