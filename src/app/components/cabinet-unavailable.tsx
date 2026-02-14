/**
 * CABINET UNAVAILABLE - Temporary message for blocked cabinet access
 * Показывает, что кабинеты временно недоступны
 */

import { useNavigate } from 'react-router';
import { Lock, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { PromoLogo } from './promo-logo';

export function CabinetUnavailable() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#14142d] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <PromoLogo className="h-8" />
          </div>

          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-3">
            Кабинеты временно недоступны
          </h1>

          {/* Message */}
          <p className="text-white/60 text-center mb-8 leading-relaxed">
            В данный момент доступ к личным кабинетам закрыт. 
            Мы работаем над улучшением системы авторизации.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              На главную
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full bg-white/5 hover:bg-white/10 text-white/80 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-white/40 text-center text-sm mt-6">
          Следите за обновлениями на нашем сайте
        </p>
      </motion.div>
    </div>
  );
}
