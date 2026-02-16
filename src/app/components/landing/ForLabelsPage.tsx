/**
 * FOR LABELS PAGE - Страница "Лейблам"
 * Скоро - placeholder с hero-секцией
 */

import { motion } from 'motion/react';
import { Disc3, Music, BarChart3, ArrowRight, Sparkles, Users, Shield, TrendingUp, Award, Banknote } from 'lucide-react';

interface ForLabelsPageProps {
  onGetStarted: () => void;
}

export function ForLabelsPage({ onGetStarted }: ForLabelsPageProps) {
  const features = [
    {
      icon: Users,
      title: 'Управление артистами',
      description: 'Единая панель для управления ростером артистов. Статистика, контракты, планирование релизов в одном месте.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: TrendingUp,
      title: 'Продвижение каталога',
      description: 'Массовый питчинг треков на радиостанции, плейлисты и в заведения через Promo.air. Автоматические кампании.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Аналитика лейбла',
      description: 'Сводная аналитика по всем артистам: доходы, прослушивания, география, сравнение эффективности.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Banknote,
      title: 'Монетизация',
      description: 'Прозрачное распределение доходов, автоматические выплаты артистам, финансовые отчёты и прогнозы.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Award,
      title: 'A&R инструменты',
      description: 'Скаутинг талантов на платформе, аналитика потенциала артистов, автоматические рекомендации подписания.',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Shield,
      title: 'Права и лицензии',
      description: 'Управление правами на весь каталог, автоматическое оформление лицензий, контроль использования треков.',
      color: 'from-indigo-500 to-violet-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white pb-12 sm:pb-16 md:pb-20">
      {/* HERO SECTION */}
      <section className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[60vh] overflow-hidden bg-black">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-amber-600 rounded-full"
            style={{ filter: 'blur(140px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-1/4 right-1/3 w-[400px] h-[300px] bg-orange-500 rounded-full"
            style={{ filter: 'blur(120px)' }}
          />
        </div>

        {/* Vinyl grooves watermark */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] opacity-[0.04]"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full text-white">
            <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="30" fill="currentColor" opacity="0.3" />
            <circle cx="100" cy="100" r="5" fill="currentColor" />
          </svg>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`lbl-${i}`}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'bg-amber-400' : i % 3 === 1 ? 'bg-orange-400' : 'bg-yellow-400'
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        {/* Badge + Title */}
        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-amber-500/20 mb-4">
              <Disc3 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white/90">Для лейблов</span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight max-w-4xl">
              <span className="block text-white/90">Управляйте ростером</span>
              <motion.span
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                на одной платформе
              </motion.span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Скоро */}
      <section className="relative py-10 sm:py-16 px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">Скоро</span>
            </div>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed px-2 xs:px-4">
              Создаём мощные инструменты для лейблов: управление ростером, массовое продвижение, аналитика и A&R.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 xs:gap-3 px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl xs:rounded-2xl font-bold text-sm xs:text-base sm:text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
            >
              <Disc3 className="w-4 h-4 xs:w-5 xs:h-5" />
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
          <p className="text-sm xs:text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-4">Инструменты для эффективного управления лейблом</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl xs:rounded-2xl p-5 xs:p-6 border border-white/10 hover:border-amber-500/30 transition-all group"
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