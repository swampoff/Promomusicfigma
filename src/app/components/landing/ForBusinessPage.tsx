/**
 * FOR BUSINESS PAGE - Страница "Для бизнеса"
 * Объединяет два B2B направления: Радиостанции и Заведения
 * МАКСИМАЛЬНЫЙ АДАПТИВ: 320px → 4K
 */

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { 
  Radio, Store, Coffee, Hotel, Dumbbell, Building2, Music,
  BarChart3, CheckCircle2, Zap, Crown, ArrowRight, Play,
  Headphones, Volume2, Settings, Globe, Star, Award,
  TrendingUp, Users, Target, Sparkles, Mic2, Waves,
  Calendar, DollarSign, Gift, Shield, Activity, Eye,
  MessageSquare, Heart, Share2, Rocket, TestTube
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ForBusinessPageProps {
  onGetStarted: () => void;
  initialTab?: 'radio' | 'venues';
}

export function ForBusinessPage({ onGetStarted, initialTab = 'radio' }: ForBusinessPageProps) {
  const [activeTab, setActiveTab] = useState<'radio' | 'venues'>(initialTab);

  // Обновляем activeTab когда меняется initialTab
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Радиостанции - преимущества
  const radioFeatures = [
    {
      icon: Music,
      title: 'Монетизация эфира',
      description: 'Зарабатывайте на размещении рекламы и спонсорства. Качественный музыкальный контент от артистов бесплатно. Прозрачная финансовая модель.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Прямая связь с артистами',
      description: 'Артисты отправляют треки для промо в вашем эфире бесплатно. Система модерации, рейтинги, автоматические рекомендации под ваш формат.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Детальная аналитика',
      description: 'Статистика эфирного времени, прослушиваний, популярных треков. Экспорт отчётов для рекламодателей и спонсоров вашей станции.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Globe,
      title: 'Публичный профиль станции',
      description: 'Ваша радиостанция в каталоге Promo.Music с логотипом, описанием, контактами. Привлекайте новых слушателей и рекламодателей.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'API и автоматизация',
      description: 'Интеграция с вашей системой вещания через API. Автоматическая ротация треков, формирование плейлистов по времени суток.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Shield,
      title: 'Правовая безопасность',
      description: 'Все треки юридически чисты, права проверены. Лицензионные соглашения с артистами, полная защита от претензий РАО.',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  // Заведения - преимущества
  const venuesFeatures = [
    {
      icon: Music,
      title: 'Кастомные плейлисты',
      description: 'Музыкальная атмосфера под ваш бизнес: для кафе, ресторана, магазина, отеля, салона, фитнес-клуба. Разные плейлисты по времени суток.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Volume2,
      title: 'Брендированная аудиореклама',
      description: 'Создавайте рекламные блоки и объявления для ваших гостей: акции, новинки меню, специальные предложения. Без внешней рекламы!',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Аналитика и статистика',
      description: 'Какая музыка играет, когда, сколько времени. Реакция гостей, популярные треки. Данные для оптимизации музыкальной атмосферы.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Globe,
      title: 'Заведение на карте',
      description: 'Ваше заведение на публичной карте Promo.Music с информацией "Сейчас играет". Привлекайте меломанов и новых гостей!',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: DollarSign,
      title: 'Легальная музыка без проблем',
      description: 'Вся музыка лицензирована, никаких проблем с РАО и авторскими правами. Фиксированная ежемесячная оплата, без скрытых платежей.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Settings,
      title: 'Управление в один клик',
      description: 'Простая панель управления: меняйте музыку, громкость, плейлисты через веб-интерфейс или мобильное приложение. Без IT-специалиста.',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  // Радиостанции - тарифы (все бесплатно!)
  const radioPricing = [
    {
      name: 'Бесплатно навсегда',
      icon: Crown,
      price: '$0',
      period: '',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      features: [
        'Полный доступ ко всем функциям',
        'Неограниченный приём треков от артистов',
        'Детальная аналитика эфирного времени',
        'Публичный профиль станции с логотипом',
        'API для интеграции с вашей системой',
        'Техническая поддержка 24/7',
        'Доступ к библиотеке промо-треков',
        'Без комиссий и скрытых платежей'
      ],
      popular: true
    }
  ];

  // Заведения - тарифы
  const venuesPricing = [
    {
      name: 'Basic',
      icon: Sparkles,
      price: '$99',
      period: '/месяц',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      features: [
        'Готовые плейлисты по жанрам',
        'Базовая аналитика воспроизведений',
        'Email поддержка в будние дни',
        'Брендированная аудиореклама (2 слота/час)',
        '1 точка вещания (одно заведение)'
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
        'Кастомные плейлисты под ваш бизнес',
        'Детальная аналитика + рекомендации',
        'Поддержка 24/7 в чате и по телефону',
        'Безлимитная аудиореклама и объявления',
        'До 3 точек вещания',
        'Заведение на публичной карте'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      icon: Building2,
      price: 'Индивидуально',
      period: '',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      features: [
        'Всё из Premium для всех точек',
        'Неограниченное количество заведений',
        'Персональный музыкальный куратор',
        'Белый лейбл решение (ваш бренд)',
        'API для интеграции с вашей CRM',
        'Договор с SLA и юридическими гарантиями'
      ],
      popular: false
    }
  ];

  // Типы заведений
  const businessTypes = [
    {
      icon: Coffee,
      title: 'Рестораны & Кафе',
      description: 'Создайте уникальную атмосферу для каждого времени дня',
      count: '120+',
      gradient: 'from-amber-500/10 to-orange-500/10'
    },
    {
      icon: Store,
      title: 'Ритейл & Магазины',
      description: 'Увеличьте продажи с правильной фоновой музыкой',
      count: '85+',
      gradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      icon: Hotel,
      title: 'Отели & СПА',
      description: 'Премиальное звуковое сопровождение для гостей',
      count: '45+',
      gradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      icon: Dumbbell,
      title: 'Фитнес-клубы',
      description: 'Мотивирующие плейлисты для тренировок',
      count: '30+',
      gradient: 'from-green-500/10 to-emerald-500/10'
    },
  ];

  // Статистика для радиостанций
  const radioStats = [
    {
      icon: Radio,
      value: '12+',
      label: 'Радиостанций',
      color: 'text-blue-400'
    },
    {
      icon: Music,
      value: '2.5K+',
      label: 'Треков в базе',
      color: 'text-purple-400'
    },
    {
      icon: Users,
      value: '150K+',
      label: 'Слушателей',
      color: 'text-pink-400'
    },
    {
      icon: TrendingUp,
      value: '24/7',
      label: 'Работаем',
      color: 'text-green-400'
    }
  ];

  // Статистика для заведений
  const venuesStats = [
    {
      icon: Building2,
      value: '280+',
      label: 'Заведений',
      color: 'text-blue-400'
    },
    {
      icon: Globe,
      value: '8+',
      label: 'Стран',
      color: 'text-purple-400'
    },
    {
      icon: Music,
      value: '24/7',
      label: 'Музыка',
      color: 'text-pink-400'
    },
    {
      icon: Heart,
      value: '92%',
      label: 'Довольных клиентов',
      color: 'text-green-400'
    }
  ];

  const currentFeatures = activeTab === 'radio' ? radioFeatures : venuesFeatures;
  const currentPricing = activeTab === 'radio' ? radioPricing : venuesPricing;
  const currentStats = activeTab === 'radio' ? radioStats : venuesStats;

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
        
        <div className="relative max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 mb-4 xs:mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-[#FF577F]/20">
              <Zap className="w-3 h-3 xs:w-4 xs:h-4 text-[#FF577F]" />
              <span className="text-xs xs:text-sm font-bold">B2B Solutions</span>
            </div>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 xs:mb-6 leading-[1.1] px-2 xs:px-0">
              <span className="block mb-2">Монетизация музыки</span>
              <span className="block bg-gradient-to-r from-[#FF577F] via-[#FF6B8F] to-[#FF577F] bg-clip-text text-transparent">
                для вашего бизнеса
              </span>
            </h1>
            
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-6 xs:mb-8 max-w-4xl mx-auto leading-relaxed px-2 xs:px-4">
              Радиостанции получают качественный контент и монетизацию. Заведения получают идеальную музыкальную атмосферу.
              <span className="hidden sm:inline"> Присоединяйтесь к крупнейшей музыкальной B2B платформе.</span>
            </p>

            {/* TAB SWITCHER */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-2 xs:gap-3 sm:gap-4 mb-6 xs:mb-8 px-2 xs:px-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('radio')}
                className={`flex items-center justify-center gap-2 xs:gap-3 px-5 xs:px-6 sm:px-8 py-3 xs:py-3.5 sm:py-4 rounded-xl xs:rounded-2xl font-bold text-sm xs:text-base sm:text-lg transition-all ${
                  activeTab === 'radio'
                    ? 'bg-[#FF577F] shadow-lg shadow-[#FF577F]/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Radio className="w-4 h-4 xs:w-5 xs:h-5" />
                <span>Радиостанциям</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('venues')}
                className={`flex items-center justify-center gap-2 xs:gap-3 px-5 xs:px-6 sm:px-8 py-3 xs:py-3.5 sm:py-4 rounded-xl xs:rounded-2xl font-bold text-sm xs:text-base sm:text-lg transition-all ${
                  activeTab === 'venues'
                    ? 'bg-[#FF577F] shadow-lg shadow-[#FF577F]/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Building2 className="w-4 h-4 xs:w-5 xs:h-5" />
                <span>Заведениям</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* STATS SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6"
        >
          {currentStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all"
            >
              <stat.icon className={`w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 mb-2 xs:mb-3 sm:mb-4 ${stat.color}`} />
              <div className="text-2xl xs:text-3xl sm:text-4xl font-black mb-1 xs:mb-2">{stat.value}</div>
              <div className="text-xs xs:text-sm text-slate-400 leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8 xs:mb-10 sm:mb-12"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4 px-2 xs:px-0">
            {activeTab === 'radio' ? 'Возможности для радиостанций' : 'Возможности для заведений'}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            {activeTab === 'radio' 
              ? 'Всё необходимое для монетизации эфира и работы с артистами'
              : 'Профессиональное аудиобрендирование для вашего бизнеса'
            }
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
          {currentFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-5 xs:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all group"
            >
              <div className={`w-12 h-12 xs:w-14 xs:h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 xs:mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
              </div>
              <h3 className="text-lg xs:text-xl font-bold mb-2 xs:mb-3">{feature.title}</h3>
              <p className="text-sm xs:text-base text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BUSINESS TYPES (только для заведений) */}
      {activeTab === 'venues' && (
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 xs:mb-10 sm:mb-12"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4 px-2 xs:px-0">
              Для любого типа бизнеса
            </h2>
            <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
              Работаем с кафе, ресторанами, магазинами, отелями и фитнес-клубами
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-5 sm:gap-6">
            {businessTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-gradient-to-br ${type.gradient} backdrop-blur-sm rounded-xl xs:rounded-2xl p-5 xs:p-6 border border-white/10 hover:border-[#FF577F]/30 transition-all text-center`}
              >
                <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 xs:mb-4">
                  <type.icon className="w-7 h-7 xs:w-8 xs:h-8 text-[#FF577F]" />
                </div>
                <div className="text-xl xs:text-2xl font-black text-[#FF577F] mb-1 xs:mb-2">{type.count}</div>
                <h3 className="text-base xs:text-lg font-bold mb-1.5 xs:mb-2">{type.title}</h3>
                <p className="text-xs xs:text-sm text-slate-400 leading-relaxed">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* PRICING SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 xs:mb-10 sm:mb-12"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4 px-2 xs:px-0">
            {activeTab === 'radio' ? 'Полностью бесплатно' : 'Прозрачные тарифы'}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            {activeTab === 'radio'
              ? 'Все функции платформы доступны радиостанциям без оплаты'
              : 'Выберите план, который подходит вашему бизнесу'
            }
          </p>
        </motion.div>

        <div className={`grid gap-5 xs:gap-6 lg:gap-8 ${activeTab === 'radio' ? 'md:grid-cols-1 max-w-2xl mx-auto' : 'md:grid-cols-3'}`}>
          {currentPricing.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -10 }}
              className={`relative bg-gradient-to-br ${plan.color} backdrop-blur-sm rounded-2xl xs:rounded-3xl p-6 xs:p-7 sm:p-8 border-2 ${plan.borderColor} ${
                plan.popular ? 'ring-2 ring-[#FF577F] ring-offset-2 ring-offset-black' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 xs:-top-4 left-1/2 -translate-x-1/2 px-3 xs:px-4 py-1 bg-[#FF577F] rounded-full text-xs xs:text-sm font-bold">
                  Популярный
                </div>
              )}
              
              <div className="flex items-center gap-2 xs:gap-3 mb-5 xs:mb-6">
                <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <plan.icon className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
                </div>
                <div>
                  <h3 className="text-xl xs:text-2xl font-black">{plan.name}</h3>
                </div>
              </div>

              <div className="mb-5 xs:mb-6">
                <div className="text-4xl xs:text-5xl font-black mb-1">{plan.price}</div>
                {plan.period && <div className="text-sm xs:text-base text-slate-400">{plan.period}</div>}
              </div>

              <div className="space-y-2.5 xs:space-y-3 mb-6 xs:mb-8">
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-2 xs:gap-3">
                    <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-[#FF577F] flex-shrink-0 mt-0.5" />
                    <span className="text-xs xs:text-sm text-slate-300 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={onGetStarted}
                className={`w-full py-5 xs:py-6 rounded-xl font-bold text-sm xs:text-base ${
                  plan.popular
                    ? 'bg-[#FF577F] hover:bg-[#FF4D7D]'
                    : 'bg-white/10 hover:bg-white/20'
                } transition-all`}
              >
                Начать
                <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl xs:rounded-3xl bg-gradient-to-br from-[#FF577F]/20 via-[#3E4C5E]/20 to-[#FF577F]/20 border border-[#FF577F]/30 p-6 xs:p-8 sm:p-12 lg:p-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,87,127,0.2),transparent_70%)]" />
          
          <div className="relative z-10">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4 px-2">
              Готовы начать?
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-slate-300 mb-6 xs:mb-8 max-w-2xl mx-auto px-2 leading-relaxed">
              {activeTab === 'radio' 
                ? 'Зарегистрируйте радиостанцию и получайте качественный музыкальный контент для эфира бесплатно'
                : 'Подключите заведение к Promo.Air и создайте идеальную музыкальную атмосферу'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 xs:gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-8 xs:px-10 py-5 xs:py-6 rounded-full text-base xs:text-lg shadow-lg shadow-[#FF577F]/30"
              >
                <Rocket className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
                Начать прямо сейчас
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/20 hover:bg-white/10 font-bold px-8 xs:px-10 py-5 xs:py-6 rounded-full text-base xs:text-lg"
              >
                <MessageSquare className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
                Связаться с нами
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}