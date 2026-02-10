/**
 * FOR TV CHANNELS PAGE - Страница "Телеканалам"
 * Coming Soon placeholder с hero-секцией
 */

import { motion } from 'motion/react';
import { Tv, Music, BarChart3, ArrowRight, Sparkles, Globe, Shield, Zap, Film, Radio } from 'lucide-react';

interface ForTVPageProps {
  onGetStarted: () => void;
}

export function ForTVPage({ onGetStarted }: ForTVPageProps) {
  const features = [
    {
      icon: Music,
      title: 'Музыкальный контент',
      description: 'Лицензированная музыка для эфира, заставок, промо-роликов и шоу. Прямой доступ к каталогу артистов.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Film,
      title: 'Видеоклипы',
      description: 'Эксклюзивные премьеры клипов, лайв-выступления и backstage-контент от артистов платформы.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Аналитика эфира',
      description: 'Детальная статистика использования контента, рейтинги музыкальных блоков и предпочтения аудитории.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Globe,
      title: 'Партнёрский профиль',
      description: 'Публичная страница канала в каталоге Promo.music с логотипом, программой и контактами для артистов.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'API-интеграция',
      description: 'Автоматическая подгрузка контента в ваши системы вещания и MAM через открытый API.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Shield,
      title: 'Правовая защита',
      description: 'Полностью лицензированный контент. Все права очищены, готовые договоры и отчётность для ВГТРК.',
      color: 'from-indigo-500 to-violet-500',
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
            className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-blue-600 rounded-full"
            style={{ filter: 'blur(140px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-cyan-500 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
        </div>

        {/* Floating TV scan lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`scan-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
            style={{ top: `${15 + i * 10}%` }}
            animate={{ opacity: [0, 0.4, 0], x: ['-100%', '0%', '100%'] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* TV watermark */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-8 right-6 sm:top-12 sm:right-12 w-20 h-20 sm:w-28 sm:h-28"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-white">
            <rect x="15" y="25" width="70" height="45" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="25" y="75" width="50" height="5" rx="2" fill="currentColor" opacity="0.5" />
            <line x1="35" y1="25" x2="50" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="65" y1="25" x2="50" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </motion.div>

        {/* Edge fades */}
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-44 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* Badge + Title */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-cyan-500/20 mb-4">
              <Tv className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white/90">Для телеканалов</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight max-w-4xl">
              <span className="block text-white/90">Музыка и контент</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                для вашего эфира
              </motion.span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="relative py-10 sm:py-16 px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-300">Coming Soon</span>
            </div>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed px-2 xs:px-4">
              Готовим уникальные решения для телеканалов: лицензированная музыка, видеоклипы, аналитика и API-интеграция.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 xs:gap-3 px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl xs:rounded-2xl font-bold text-sm xs:text-base sm:text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            >
              <Tv className="w-4 h-4 xs:w-5 xs:h-5" />
              Оставить заявку
              <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 xs:py-12 sm:py-16 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black mb-3 xs:mb-4">
            Что мы готовим
          </h2>
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Полный набор инструментов для работы с музыкальным контентом в эфире
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-5 xs:p-6 border border-white/10 hover:border-cyan-500/30 transition-all group"
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