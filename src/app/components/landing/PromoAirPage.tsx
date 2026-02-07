/**
 * PROMO.AIR PAGE - B2B Аудиобрендирование для заведений
 * Премиум-сервис создания радиостанций для ресторанов, магазинов, отелей
 */

import { motion } from 'motion/react';
import { 
  Radio, Store, Coffee, Hotel, Dumbbell, Building2, Music,
  BarChart3, CheckCircle2, Zap, Crown, ArrowRight, Play,
  Headphones, Volume2, Settings, Globe, Star, Award,
  TrendingUp, Users, Target, Sparkles
} from 'lucide-react';

interface PromoAirPageProps {
  onGetStarted: () => void;
}

export function PromoAirPage({ onGetStarted }: PromoAirPageProps) {
  
  const features = [
    {
      icon: Music,
      title: 'Кастомные плейлисты',
      description: 'Уникальная музыкальная атмосфера, идеально подобранная под концепцию вашего заведения и время суток.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Volume2,
      title: 'Аудиореклама и объявления',
      description: 'Брендированные рекламные блоки, объявления акций и специальных предложений в эфире вашего заведения.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Аналитика прослушиваний',
      description: 'Детальная статистика: какая музыка играет, когда, реакция гостей. Данные для оптимизации атмосферы.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Globe,
      title: 'Публичность в Promo.Guide',
      description: 'Ваше заведение появляется на публичной карте с информацией "Сейчас играет". Привлекайте новых гостей!',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const businessTypes = [
    {
      icon: Coffee,
      title: 'Рестораны & Кафе',
      description: 'Создайте уникальную атмосферу для каждого времени дня',
      count: '20+'
    },
    {
      icon: Store,
      title: 'Ритейл & Магазины',
      description: 'Увеличьте продажи с правильной фоновой музыкой',
      count: '15+'
    },
    {
      icon: Hotel,
      title: 'Отели & СПА',
      description: 'Премиальное звуковое сопровождение для гостей',
      count: '10+'
    },
    {
      icon: Dumbbell,
      title: 'Фитнес-клубы',
      description: 'Мотивирующие плейлисты для тренировок',
      count: '5+'
    },
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      icon: Sparkles,
      price: '$99',
      period: '/месяц',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      features: [
        'Готовые плейлисты по жанрам',
        'Базовая аналитика',
        'Email поддержка',
        'Аудиореклама 2 слота/час'
      ],
      popular: false
    },
    {
      name: 'Premium',
      icon: Crown,
      price: '$299',
      period: '/месяц',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      features: [
        'Кастомные плейлисты под заведение',
        'Продвинутая аналитика',
        'Приоритетная поддержка 24/7',
        'Featured в Promo.Guide',
        'Неограниченная аудиореклама',
        'QR-коды со скидками для гостей'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Building2,
      price: '$999',
      period: '/месяц',
      color: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      features: [
        'Всё из Premium +',
        'Персональный музыкальный консьерж',
        'Top-1 позиция в Promo.Guide',
        'Интеграция с CRM системой',
        'Брендированное мобильное приложение',
        'Многозонное управление',
        'API доступ'
      ],
      popular: false
    },
  ];

  const stats = [
    { icon: Store, value: '50+', label: 'Подключенных заведений' },
    { icon: Users, value: '10K+', label: 'Гостей в месяц' },
    { icon: Music, value: '5K+', label: 'Треков в каталоге' },
    { icon: TrendingUp, value: '25%', label: 'Рост продаж' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section with Glassmorphism */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
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
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white/90">B2B Аудиобрендирование</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                Promo
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                .Air
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Премиальный сервис создания радиостанций для вашего бизнеса.<br/>
              Уникальная музыкальная атмосфера + аудиобрендирование.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-3"
              >
                Подключить заведение
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 backdrop-blur-xl rounded-2xl font-bold text-lg border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Демо для бизнеса
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
                  <Icon className="w-10 h-10 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business Types Section */}
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
                Для любого бизнеса
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Растущая сеть из 50+ заведений
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessTypes.map((type, index) => {
              const Icon = type.icon;
              return (
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
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-2xl font-black mb-2">{type.count}</div>
                    <h3 className="text-lg font-black mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </div>
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
                Что вы получите?
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Полный пакет для создания уникальной аудио-атмосферы
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

      {/* Pricing Section */}
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
                Тарифные планы
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Выберите подходящий план для вашего бизнеса
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600" />
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            
            {/* Content */}
            <div className="relative p-12 text-center">
              <Headphones className="w-16 h-16 mx-auto mb-6 text-white" />
              <h2 className="text-4xl font-black mb-4 text-white">
                Готовы создать уникальную атмосферу?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к растущей сети заведений, которые создают уникальную аудио-идентичность с Promo.Air
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-4 bg-white text-blue-500 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
              >
                Начать сейчас
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}