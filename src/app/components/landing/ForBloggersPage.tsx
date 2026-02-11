/**
 * FOR BLOGGERS PAGE - Страница "Блогерам"
 * Coming Soon placeholder с hero-секцией
 */

import { motion } from 'motion/react';
import { Video, Music, BarChart3, ArrowRight, Sparkles, DollarSign, Shield, Heart, Camera, Share2 } from 'lucide-react';

interface ForBloggersPageProps {
  onGetStarted: () => void;
}

export function ForBloggersPage({ onGetStarted }: ForBloggersPageProps) {
  const features = [
    {
      icon: Music,
      title: 'Бесплатная музыка',
      description: 'Лицензированные треки для ваших видео без страха страйков. Полная библиотека под все жанры и настроения.',
      color: 'from-fuchsia-500 to-pink-500',
    },
    {
      icon: Camera,
      title: 'Контент с артистами',
      description: 'Коллаборации, интервью, челленджи с артистами платформы. Готовые форматы контента для вашего канала.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: DollarSign,
      title: 'Монетизация',
      description: 'Партнёрская программа с выплатами за продвижение артистов. Спецпроекты, промокоды и реферальные бонусы.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Heart,
      title: 'Рост аудитории',
      description: 'Кросс-промо с артистами, упоминания на платформе, рекомендации в каталоге блогеров Promo.music.',
      color: 'from-red-500 to-rose-500',
    },
    {
      icon: BarChart3,
      title: 'Аналитика влияния',
      description: 'Отслеживайте эффективность промо: клики, подписки, прослушивания. Доказывайте свою ценность артистам.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Share2,
      title: 'Эксклюзивный доступ',
      description: 'Ранние прослушивания, закулисье, пресс-релизы и VIP-доступ на мероприятия артистов платформы.',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-12 sm:pb-16 md:pb-20">
      {/* HERO SECTION */}
      <section className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[60vh] overflow-hidden bg-black">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-fuchsia-600 rounded-full"
            style={{ filter: 'blur(140px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-violet-500 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
        </div>

        {/* Play button watermark */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[280px] sm:h-[280px]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <rect x="5" y="15" width="90" height="55" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="40,30 65,42.5 40,55" fill="currentColor" />
            <rect x="10" y="76" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="10" y="82" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
            <circle cx="85" cy="80" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M83,80 L85,78 L87,80" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`blog-${i}`}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-fuchsia-400' : i % 3 === 1 ? 'bg-violet-400' : 'bg-pink-400'
            }`}
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${12 + i * 10}%`,
              top: `${25 + (i % 4) * 12}%`,
            }}
            animate={{ y: [0, -20 - i * 3, 0], opacity: [0, 0.8, 0], scale: [0.4, 1.3, 0.4] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
          />
        ))}

        {/* Edge fades */}
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />

        {/* Badge + Title */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-fuchsia-500/20 mb-4">
              <Video className="w-4 h-4 text-fuchsia-400" />
              <span className="text-sm font-bold text-white/90">Для блогеров</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight max-w-4xl">
              <span className="block text-white/90">Музыка и коллабы</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                для вашего контента
              </motion.span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="relative py-10 sm:py-16 px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <span className="text-sm font-bold text-fuchsia-300">Coming Soon</span>
            </div>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed px-2 xs:px-4">
              Готовим инструменты для блогеров: бесплатная музыка, коллаборации с артистами и партнёрская программа.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 xs:gap-3 px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-xl xs:rounded-2xl font-bold text-sm xs:text-base sm:text-lg shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all"
            >
              <Video className="w-4 h-4 xs:w-5 xs:h-5" />
              Оставить заявку
              <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4">Что мы готовим</h2>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">Возможности для музыкальных блогеров и контент-мейкеров</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-5 xs:p-6 border border-white/10 hover:border-fuchsia-500/30 transition-all group"
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
    </div>
  );
}