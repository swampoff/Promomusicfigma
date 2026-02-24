/**
 * FloatingCtaBar - Плавающая панель регистрации
 * Появляется после прокрутки страницы вниз (~400px)
 * Glassmorphism-дизайн, анимации Motion, dismissible
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ChevronRight, Music, Zap } from 'lucide-react';

interface FloatingCtaBarProps {
  onLogin: () => void;
  /** Если активен плеер - панель поднимается выше */
  hasPlayer?: boolean;
}

export function FloatingCtaBar({ onLogin, hasPlayer = false }: FloatingCtaBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Показываем после 400px скролла
      if (scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 right-0 z-[100] px-3 xs:px-4 sm:px-6 lg:px-8"
          style={{ bottom: hasPlayer ? 76 : 16 }}
        >
          {/* Outer glow */}
          <div className="max-w-3xl mx-auto lg:ml-64 xl:ml-72 2xl:ml-[calc(18rem+15rem)]">
            <div className="relative rounded-2xl overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF577F] via-purple-500 to-orange-500 opacity-30" />
              
              {/* Main content */}
              <div className="relative m-[1px] rounded-2xl bg-[#0a0a14]/85 backdrop-blur-2xl border border-white/[0.08]">
                {/* Animated background glow */}
                <motion.div
                  animate={{ opacity: [0.03, 0.08, 0.03] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF577F]/20 via-purple-500/10 to-orange-500/20"
                />

                <div className="relative z-10 px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 flex items-center gap-3 xs:gap-4">
                  {/* Icon */}
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="hidden xs:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#FF577F] to-purple-600 items-center justify-center shadow-lg shadow-[#FF577F]/25 flex-shrink-0"
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-black text-white truncate"
                        style={{ fontSize: '14px' }}
                      >
                        Начни продвижение бесплатно
                      </span>
                      <motion.span
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30"
                      >
                        <Zap className="w-3 h-3 text-green-400" />
                        <span className="text-[10px] font-bold text-green-400">БЕСПЛАТНО</span>
                      </motion.span>
                    </div>
                    <div
                      className="text-slate-400 leading-tight hidden xs:block truncate"
                      style={{ fontSize: '11px' }}
                    >
                      Загрузи трек, попади в чарты и на радио - первый трек без оплаты
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0"
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={onLogin}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogin(); }}
                      className="flex items-center gap-1.5 xs:gap-2 px-4 xs:px-5 sm:px-7 py-2.5 xs:py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#FF577F] to-[#FF3366] hover:from-[#FF4D7D] hover:to-[#FF2255] shadow-lg shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-all cursor-pointer select-none"
                      style={{ fontSize: '13px' }}
                    >
                      <Music className="w-4 h-4 text-white" />
                      <span className="font-black text-white whitespace-nowrap">
                        <span className="hidden sm:inline">Зарегистрироваться</span>
                        <span className="sm:hidden">Начать</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/70" />
                    </div>
                  </motion.div>

                  {/* Close button */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDismissed(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDismissed(true); }}
                    className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-slate-400" />
                  </motion.div>
                </div>

                {/* Animated bottom progress line */}
                <div className="h-[2px] bg-white/[0.03] overflow-hidden">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#FF577F]/60 to-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
