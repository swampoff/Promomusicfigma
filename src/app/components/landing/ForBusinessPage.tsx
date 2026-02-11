/**
 * FOR BUSINESS PAGE — Страница "Радиостанциям"
 * Единая страница для радиостанций (заведения перенесены в PromoAirPage)
 * МАКСИМАЛЬНЫЙ АДАПТИВ: 320px → 4K
 */

import { motion } from 'motion/react';
import { 
  Radio, Music,
  BarChart3, CheckCircle2, Zap, Crown, ArrowRight,
  Globe, Shield,
  TrendingUp, Users, Rocket,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
const stellaImage = 'https://images.unsplash.com/photo-1574626549037-97386088c7cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

interface ForBusinessPageProps {
  onGetStarted: () => void;
  initialTab?: 'radio' | 'venues';
}

export function ForBusinessPage({ onGetStarted }: ForBusinessPageProps) {

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
      description: 'Ваша радиостанция в каталоге Promo.music с логотипом, описанием, контактами. Привлекайте новых слушателей и рекламодателей.',
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

  const radioPricing = {
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
  };

  const radioStats = [
    { icon: Radio, value: '12+', label: 'Радиостанций', color: 'text-blue-400' },
    { icon: Music, value: '2.5K+', label: 'Треков в базе', color: 'text-purple-400' },
    { icon: Users, value: '150K+', label: 'Слушателей', color: 'text-pink-400' },
    { icon: TrendingUp, value: '24/7', label: 'Работаем', color: 'text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">
      
      {/* HERO IMAGE SECTION */}
      <section className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[75vh] overflow-hidden bg-black">
        {/* Animated ambient glows — purple/violet radio studio tones */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-purple-600 rounded-full"
            style={{ filter: 'blur(140px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/4 right-1/3 w-[450px] h-[350px] bg-[#FF577F] rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.28, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            className="absolute top-1/2 right-1/4 w-[350px] h-[280px] bg-indigo-500 rounded-full"
            style={{ filter: 'blur(110px)' }}
          />
        </div>

        {/* Stella — radio host image with multiply blend (white bg → transparent) */}
        <motion.img
          src={stellaImage}
          alt="Стелла - ведущая на радио"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: [1, 1.01, 1] }}
          transition={{
            opacity: { duration: 1.4, ease: 'easeOut' },
            scale: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
          className="absolute inset-0 w-full h-full object-contain object-center sm:object-[center_30%]"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Dark vignette overlay for contrast */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center 40%, transparent 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%)',
          }}
        />

        {/* Radio wave sparkle particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-[#FF577F]' : 'bg-indigo-400'
            }`}
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${8 + i * 9}%`,
              top: `${20 + (i % 4) * 14}%`,
            }}
            animate={{
              y: [0, -25 - i * 3, 0],
              opacity: [0, 0.85, 0],
              scale: [0.4, 1.4, 0.4],
            }}
            transition={{
              duration: 2.5 + i * 0.35,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Animated radio wave watermark */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-8 right-6 sm:top-12 sm:right-12 w-20 h-20 sm:w-28 sm:h-28"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <circle cx="50" cy="70" r="8" fill="currentColor" />
            <path d="M30,55 Q50,25 70,55" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20,45 Q50,5 80,45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10,38 Q50,-10 90,38" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>

        {/* Edge fades */}
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

        {/* Floating badge + title + Stella name */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-purple-500/20 mb-4">
                <Radio className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white/90">Для радиостанций</span>
              </div>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight max-w-4xl">
                <span className="block text-white/90">Качественный контент</span>
                <motion.span
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="bg-gradient-to-r from-[#FF577F] via-purple-400 to-[#FF577F] bg-clip-text text-transparent bg-[length:200%_auto]"
                >
                  для вашего эфира
                </motion.span>
              </h1>
            </div>

            {/* Stella name label */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 px-4 py-2.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div>
                <div className="text-sm sm:text-base font-bold text-white">Стелла</div>
                <div className="text-xs text-slate-400">Ведущая на радио</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TEXT + CTA SECTION */}
      <section className="relative py-10 sm:py-16 px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-6 xs:mb-8 max-w-4xl mx-auto leading-relaxed px-2 xs:px-4">
              Получайте треки от артистов, монетизируйте эфир и управляйте контентом с полной аналитикой.
              <span className="hidden sm:inline"> Всё бесплатно для радиостанций.</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 xs:gap-3 px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 bg-[#FF577F] rounded-xl xs:rounded-2xl font-bold text-sm xs:text-base sm:text-lg shadow-lg shadow-[#FF577F]/30 hover:shadow-[#FF577F]/50 transition-all"
            >
              <Radio className="w-4 h-4 xs:w-5 xs:h-5" />
              Подключить станцию
              <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6"
        >
          {radioStats.map((stat, idx) => (
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
            Возможности для радиостанций
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Всё необходимое для монетизации эфира и работы с артистами
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
          {radioFeatures.map((feature, idx) => (
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

      {/* PRICING SECTION */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 xs:mb-10 sm:mb-12"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4 px-2 xs:px-0">
            Полностью бесплатно
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Все функции платформы доступны радиостанциям без оплаты
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`relative bg-gradient-to-br ${radioPricing.color} backdrop-blur-sm rounded-2xl xs:rounded-3xl p-6 xs:p-7 sm:p-8 border-2 ${radioPricing.borderColor} ring-2 ring-[#FF577F] ring-offset-2 ring-offset-black`}
          >
            <div className="absolute -top-3 xs:-top-4 left-1/2 -translate-x-1/2 px-3 xs:px-4 py-1 bg-[#FF577F] rounded-full text-xs xs:text-sm font-bold">
              Бесплатно
            </div>
            
            <div className="flex items-center gap-2 xs:gap-3 mb-5 xs:mb-6">
              <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 xs:w-6 xs:h-6 text-[#FF577F]" />
              </div>
              <div>
                <h3 className="text-xl xs:text-2xl font-black">{radioPricing.name}</h3>
              </div>
            </div>

            <div className="mb-5 xs:mb-6">
              <div className="text-4xl xs:text-5xl font-black mb-1">{radioPricing.price}</div>
              <div className="text-sm text-slate-400">Навсегда, без скрытых платежей</div>
            </div>

            <div className="space-y-2.5 xs:space-y-3 mb-6 xs:mb-8">
              {radioPricing.features.map((feature, featureIdx) => (
                <div key={featureIdx} className="flex items-start gap-2 xs:gap-3">
                  <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5 text-[#FF577F] flex-shrink-0 mt-0.5" />
                  <span className="text-xs xs:text-sm text-slate-300 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={onGetStarted}
              className="w-full py-5 xs:py-6 rounded-xl font-bold text-sm xs:text-base bg-[#FF577F] hover:bg-[#FF4D7D] transition-all"
            >
              Подключить станцию
              <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 ml-2" />
            </Button>
          </motion.div>
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
              Зарегистрируйте радиостанцию и получайте качественный музыкальный контент для эфира бесплатно
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 xs:gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-8 xs:px-10 py-5 xs:py-6 rounded-full text-base xs:text-lg shadow-lg shadow-[#FF577F]/30"
              >
                <Rocket className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
                Подключить станцию
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