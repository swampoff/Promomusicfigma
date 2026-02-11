/**
 * PUBLIC APP - Публичная часть платформы (БЕЗ авторизации)
 * Доступна всем пользователям интернета
 * 
 * Включает:
 * - Landing page (главная страница)
 * - About (о платформе)
 * 
 * ВАЖНО: Promo.guide и Promo.air - отдельные платформы
 */

import { useState } from 'react';
import { Music, LogIn } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { SunoLayoutLanding } from '@/app/components/landing/SunoLayoutLanding';
import { motion } from 'motion/react';

type PublicPage = 'landing' | 'about';

interface PublicAppProps {
  onLoginClick: () => void;
}

export function PublicApp({ onLoginClick }: PublicAppProps) {
  const [currentPage, setCurrentPage] = useState<PublicPage>('landing');

  return (
    <div className="min-h-screen bg-black">
      {currentPage === 'landing' ? (
        // Классический Suno Layout
        <SunoLayoutLanding onLogin={onLoginClick} />
      ) : (
        // Другие страницы с общим header/footer
        <>
          <PublicHeader
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onLoginClick={onLoginClick}
          />
          <div className="min-h-screen">
            {currentPage === 'about' && <AboutPage />}
          </div>
          <PublicFooter />
        </>
      )}
    </div>
  );
}

// ==============================================
// HEADER - Suno Style
// ==============================================
function PublicHeader({
  currentPage,
  setCurrentPage,
  onLoginClick,
}: {
  currentPage: PublicPage;
  setCurrentPage: (page: PublicPage) => void;
  onLoginClick: () => void;
}) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo - Минималистичный */}
        <motion.button
          onClick={() => setCurrentPage('landing')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white hidden sm:block">
            Promo.music
          </span>
        </motion.button>

        {/* Navigation - Постая */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'landing', label: 'Главная' },
            { id: 'about', label: 'О платформе' },
          ].map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentPage(item.id as PublicPage)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                currentPage === item.id
                  ? 'text-white bg-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>

        {/* Login Button - Акцентный */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onLoginClick}
            className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white border-0 px-6 sm:px-8 py-2 sm:py-2.5 font-bold rounded-full shadow-lg shadow-orange-500/30"
          >
            <LogIn className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Войти</span>
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}

// ==============================================
// ABOUT PAGE
// ==============================================
function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-white mb-8">О Promo.music</h1>
      <div className="space-y-6 text-slate-300">
        <p className="text-lg">
          Promo.music - это музыкальная экосистема, которая объединяет артистов, 
          заведения и меломанов через силу музыки.
        </p>
        <p>
          Мы не просто сервис для бизнеса или платформа для артистов. 
          Мы создаем уникальный опыт, где музыка становится связующим звеном 
          между людьми, местами и моментами.
        </p>
        <p>
          Наша миссия - сделать музыку не просто фоном, а способом открытия 
          новых мест, знакомств с единомышленниками и продвижения талантов.
        </p>
      </div>
    </div>
  );
}

// ==============================================
// FOOTER - Suno Style (минималистичный)
// ==============================================
function PublicFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Main Grid - Простой */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Platforms */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Платформы</h3>
            <ul className="space-y-2">
              {['Promo.air', 'Promo.music', 'Promo.guide'].map((item) => (
                <li key={item}>
                  <button className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Продукт</h3>
            <ul className="space-y-2">
              {['Функции', 'Тарифы', 'API'].map((item) => (
                <li key={item}>
                  <button className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Компания</h3>
            <ul className="space-y-2">
              {['О нас', 'Блог', 'Карьера'].map((item) => (
                <li key={item}>
                  <button className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Поддержка</h3>
            <ul className="space-y-2">
              {['Помощь', 'Документация', 'Контакты'].map((item) => (
                <li key={item}>
                  <button className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar - Минималистичный */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Promo.music</span>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-slate-500">
            © 2026 Promo.music. Все права защищены.
          </div>
          
          {/* Social */}
          <div className="flex items-center gap-4">
            {['Twitter', 'Instagram', 'Telegram'].map((social) => (
              <button
                key={social}
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                {social}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}