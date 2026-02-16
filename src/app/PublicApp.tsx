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
import { useNavigate } from 'react-router';

type PublicPage = 'landing' | 'about';

// ── Route component: Landing page (/) ──
export function PublicLanding() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black">
      <SunoLayoutLanding onLogin={() => navigate('/login')} />
    </div>
  );
}

// ── Route component: About page (/about) ──
export function PublicAbout() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black">
      <PublicHeader
        currentPage="about"
        setCurrentPage={(page) => navigate(page === 'landing' ? '/' : `/${page}`)}
        onLoginClick={() => navigate('/login')}
      />
      <div className="min-h-screen">
        <AboutPage />
      </div>
      <PublicFooter />
    </div>
  );
}

// ── Legacy wrapper (kept for backward compatibility) ──
interface PublicAppProps {
  onLoginClick?: () => void;
}

export function PublicApp({ onLoginClick }: PublicAppProps) {
  const navigate = useNavigate();
  const handleLogin = onLoginClick || (() => navigate('/login'));
  const [currentPage, setCurrentPage] = useState<PublicPage>('landing');

  const handlePageChange = (page: PublicPage) => {
    if (page === 'landing') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {currentPage === 'landing' ? (
        // Классический Suno Layout
        <SunoLayoutLanding onLogin={handleLogin} />
      ) : (
        // Другие страницы с общим header/footer
        <>
          <PublicHeader
            currentPage={currentPage}
            setCurrentPage={handlePageChange}
            onLoginClick={handleLogin}
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
  const navigate = useNavigate();
  const navTo = (path: string) => navigate(path);
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Main Grid - Простой */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Platforms */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Платформы</h3>
            <ul className="space-y-2">
              {[
                { label: 'Promo.air', path: '/promo-air' },
                { label: 'Promo.music', path: '/' },
                { label: 'Promo.guide', path: '/promo-guide' },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navTo(item.path)} className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Продукт</h3>
            <ul className="space-y-2">
              {[
                { label: 'Артистам', path: '/for-artists' },
                { label: 'Чарты', path: '/charts' },
                { label: 'Документация', path: '/docs' },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navTo(item.path)} className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Компания</h3>
            <ul className="space-y-2">
              {[
                { label: 'О нас', path: '/about' },
                { label: 'Карьера', path: '/careers' },
                { label: 'Партнёры', path: '/partners' },
                { label: 'Инвесторам', path: '/investors' },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navTo(item.path)} className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Поддержка</h3>
            <ul className="space-y-2">
              {[
                { label: 'Помощь', path: '/support-info' },
                { label: 'Документация', path: '/docs' },
                { label: 'Контакты', path: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => navTo(item.path)} className="text-sm text-slate-500 hover:text-white transition-colors">
                    {item.label}
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF577F] to-[#FF3366] flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Promo.music</span>
          </div>
          
          {/* Legal links */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <button onClick={() => navTo('/privacy')} className="hover:text-white transition-colors">Конфиденциальность</button>
            <button onClick={() => navTo('/user-agreement')} className="hover:text-white transition-colors">Соглашение</button>
            <button onClick={() => navTo('/consent')} className="hover:text-white transition-colors">Обработка данных</button>
            <button onClick={() => navTo('/offer')} className="hover:text-white transition-colors">Оферта</button>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-slate-500">
            &copy; 2026 Promo.music. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}