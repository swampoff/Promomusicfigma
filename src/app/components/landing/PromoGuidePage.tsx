/**
 * PROMO.GUIDE (ТЕСТ ТРЕКА) - Профессиональная оценка треков
 * Получи фидбек от экспертов индустрии перед релизом
 */

import { motion } from 'motion/react';
import { 
  TestTube, Star, Award, TrendingUp, CheckCircle2, Users,
  BarChart3, Zap, Target, Music, Headphones, Eye,
  ArrowRight, Play, Sparkles, Crown, LineChart, Activity,
  MessageSquare, FileText, Radio, Globe, ThumbsUp
} from 'lucide-react';

interface PromoGuidePageProps {
  onGetStarted: () => void;
}

export function PromoGuidePage({ onGetStarted }: PromoGuidePageProps) {
  
  const features = [
    {
      icon: Users,
      title: 'Оценка реальных экспертов',
      description: 'Продюсеры, A&R, диджеи и музыкальные кураторы с опытом 10+ лет дают детальный фидбек по вашему треку.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Анализ по 10+ критериям',
      description: 'Production quality, коммерческий потенциал, оригинальность, микс, мастеринг, мелодия, аранжировка и другое.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageSquare,
      title: 'Рекомендации по улучшению',
      description: 'Конкретные советы что исправить, куда питчить трек, какие платформы и жанровые плейлисты подходят.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: TrendingUp,
      title: 'Прогноз успеха',
      description: 'AI-алгоритм анализирует трек и прогнозирует коммерческий потенциал на основе данных тысяч релизов.',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const experts = [
    {
      name: 'Алекс Морозов',
      role: 'Продюсер, 15+ лет',
      expertise: 'Electronic, House, Techno',
      tracks: 150,
      avatar: '🎛️'
    },
    {
      name: 'Мария Соколова',
      role: 'A&R, Warner Music',
      expertise: 'Pop, R&B, Indie',
      tracks: 230,
      avatar: '🎤'
    },
    {
      name: 'Дмитрий Волков',
      role: 'Радио DJ, Kiss FM',
      expertise: 'Hip-Hop, Rap, Trap',
      tracks: 180,
      avatar: '📻'
    },
    {
      name: 'Елена Петрова',
      role: 'Playlist Curator',
      expertise: 'All Genres',
      tracks: 310,
      avatar: '🎵'
    },
  ];

  const pricingPlans = [
    {
      name: 'Быстрая оценка',
      icon: Zap,
      price: '₽499',
      period: '/трек',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      features: [
        'Оценка 1 эксперта',
        'Анализ по 5 критериям',
        'Результат за 24 часа',
        'Текстовый фидбек'
      ],
      popular: false
    },
    {
      name: 'Профессиональная',
      icon: Crown,
      price: '₽1,499',
      period: '/трек',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      features: [
        'Оценка 3 экспертов',
        'Анализ по 10+ критериям',
        'Результат за 48 часов',
        'Детальный отчёт PDF',
        'Сравнение с топ-треками',
        'Рекомендации по питчингу'
      ],
      popular: true
    },
    {
      name: 'Premium',
      icon: Award,
      price: '₽3,999',
      period: '/трек',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      features: [
        'Оценка 5+ экспертов',
        'Полный профессиональный аудит',
        'Результат за 72 часа',
        'Видео-разбор от продюсера',
        'AI-прогноз коммерческого успеха',
        'Персональная консультация 30 мин',
        'Рекомендации лейблов'
      ],
      popular: false
    },
  ];

  const stats = [
    { icon: TestTube, value: '500+', label: 'Треков протестировано' },
    { icon: Users, value: '50+', label: 'Экспертов в базе' },
    { icon: Star, value: '4.9/5', label: 'Средняя оценка' },
    { icon: TrendingUp, value: '85%', label: 'Точность прогнозов' },
  ];

  const howItWorks = [
    {
      step: '01',
      icon: Music,
      title: 'Загрузи трек',
      description: 'WAV или MP3, до 10 минут'
    },
    {
      step: '02',
      icon: Target,
      title: 'Выбери план',
      description: 'От быстрой оценки до премиум-аудита'
    },
    {
      step: '03',
      icon: Users,
      title: 'Эксперты слушают',
      description: 'Профессионалы анализируют твой трек'
    },
    {
      step: '04',
      icon: FileText,
      title: 'Получи фидбек',
      description: 'Детальный отчёт с рекомендациями'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section with Glassmorphism */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6"
            >
              <TestTube className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white/90">Профессиональная оценка треков</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Тест трека
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                от экспертов
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Получи профессиональный фидбек от продюсеров, A&R и диджеев<br/>
              перед релизом. Узнай коммерческий потенциал своего трека.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-3"
              >
                Протестировать трек
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Примеры отчётов
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
                  <Icon className="w-10 h-10 mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
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
                Что входит в оценку?
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Профессиональный анализ всех аспектов вашего трека
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
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
                  {/* Glassmorphism Card */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl" />
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                       style={{
                         background: `linear-gradient(135deg, ${feature.color.split(' ')[1].replace('to-', '')}15, transparent)`
                       }} />
                  
                  <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-white/20 transition-colors" />

                  {/* Content */}
                  <div className="relative p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experts Section */}
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
                Наши эксперты
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Профессионалы с опытом в индустрии
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experts.map((expert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Glassmorphism Card */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl" />
                <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors" />

                {/* Content */}
                <div className="relative p-6 text-center">
                  <div className="text-6xl mb-4">{expert.avatar}</div>
                  <h3 className="text-lg font-black mb-1">{expert.name}</h3>
                  <p className="text-sm text-purple-400 mb-2">{expert.role}</p>
                  <p className="text-xs text-gray-500 mb-3">{expert.expertise}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <TestTube className="w-3 h-3" />
                    <span>{expert.tracks} треков оценено</span>
                  </div>
                </div>
              </motion.div>
            ))}
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
                Тарифные планы
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Выберите подходящий уровень оценки
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
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
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold z-10 shadow-lg shadow-purple-500/30">
                      Популярный
                    </div>
                  )}

                  {/* Card */}
                  <div className={`relative h-full bg-gradient-to-br ${plan.color} backdrop-blur-xl rounded-3xl p-8 border ${plan.borderColor} hover:scale-105 transition-all`}>
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30'
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
              4 простых шага до профессионального фидбека
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => {
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
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent -z-10" />
                  )}

                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all h-full">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-black text-lg shadow-lg shadow-purple-500/30">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 ml-8 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-purple-400" />
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            
            {/* Content */}
            <div className="relative p-12 text-center">
              <TestTube className="w-16 h-16 mx-auto mb-6 text-white" />
              <h2 className="text-4xl font-black mb-4 text-white">
                Готов узнать потенциал своего трека?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Получи профессиональный фидбек от экспертов индустрии и выпусти трек с уверенностью
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-purple-500 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
              >
                Протестировать трек
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <p className="mt-6 text-sm text-white/70">
                * Первый тест со скидкой 50% для новых пользователей
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
