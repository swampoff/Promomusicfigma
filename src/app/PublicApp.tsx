/**
 * PUBLIC APP - Публичная часть платформы (БЕЗ авторизации)
 * Доступна всем пользователям интернета
 * 
 * Включает:
 * - Promo.Guide (главная страница)
 * - About (о платформе)
 * - Landing page
 */

import { useState } from 'react';
import { Music, Globe, Users, Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import PromoGuideApp from '@/promo-guide/PromoGuideApp.phase1';
import { motion } from 'motion/react';

type PublicPage = 'landing' | 'guide' | 'about';

interface PublicAppProps {
  onLoginClick: () => void;
}

export function PublicApp({ onLoginClick }: PublicAppProps) {
  const [currentPage, setCurrentPage] = useState<PublicPage>('landing');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Public Header */}
      <PublicHeader
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLoginClick={onLoginClick}
      />

      {/* Content */}
      <div className="min-h-screen">
        {currentPage === 'landing' && (
          <LandingPage
            onEnterGuide={() => setCurrentPage('guide')}
            onLogin={onLoginClick}
          />
        )}
        {currentPage === 'guide' && <PromoGuideApp />}
        {currentPage === 'about' && <AboutPage />}
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}

// ==============================================
// PUBLIC HEADER
// ==============================================
function PublicHeader({ currentPage, setCurrentPage, onLoginClick }: any) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                Promo.Music
              </div>
              <div className="text-xs text-slate-400">
                Музыкальная экосистема
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              active={currentPage === 'landing'}
              onClick={() => setCurrentPage('landing')}
            >
              Главная
            </NavLink>
            <NavLink
              active={currentPage === 'guide'}
              onClick={() => setCurrentPage('guide')}
            >
              <Globe className="w-4 h-4 mr-1" />
              Promo.Guide
            </NavLink>
            <NavLink
              active={currentPage === 'about'}
              onClick={() => setCurrentPage('about')}
            >
              О платформе
            </NavLink>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onLoginClick}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Войти
            </Button>
            <Button
              onClick={onLoginClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Начать
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center text-sm font-medium transition-colors ${
        active
          ? 'text-purple-400'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// ==============================================
// LANDING PAGE
// ==============================================
function LandingPage({ onEnterGuide, onLogin }: any) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-blue-900/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

        {/* Content */}
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Музыкальная экосистема нового поколения
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              Открывай заведения
              <br />
              через <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">музыку</span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Promo.Music объединяет артистов, заведения и меломанов в единую экосистему, 
              где музыка создает связи и приводит клиентов
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onEnterGuide}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
              >
                <Globe className="w-5 h-5 mr-2" />
                Открыть Promo.Guide
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={onLogin}
                size="lg"
                variant="outline"
                className="border-white/20 text-white text-lg px-8 py-6 hover:bg-white/10"
              >
                Для артистов и заведений
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Platforms */}
      <section className="relative py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Три платформы. Одна экосистема.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Promo.Air */}
            <PlatformCard
              title="Promo.Air"
              subtitle="B2B для бизнеса"
              description="Премиальный сервис 'Аудио-Консьерж' для заведений и радиостанций"
              features={[
                'Брендированная музыка',
                'Аналитика прослушиваний',
                'Рекламные слоты',
                'Promo.Guide интеграция'
              ]}
              color="from-blue-600 to-cyan-600"
              icon="🏢"
            />

            {/* Promo.Music */}
            <PlatformCard
              title="Promo.Music"
              subtitle="B2C для артистов"
              description="Платформа с системой кураторов для попадания в реальную ротацию"
              features={[
                'Загрузка треков',
                'Система кураторов',
                'Ротация в заведениях',
                'Аналитика "где играет"'
              ]}
              color="from-purple-600 to-pink-600"
              icon="🎤"
            />

            {/* Promo.Guide */}
            <PlatformCard
              title="Promo.Guide"
              subtitle="Для меломанов"
              description="Публичная карта музыки в заведениях + социальная сеть"
              features={[
                'Открытие через музыку',
                'QR-коды со скидкой',
                'Знакомства меломанов',
                'Бесплатно для всех'
              ]}
              color="from-green-600 to-emerald-600"
              icon="🌍"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Как это работает
          </h2>

          <div className="space-y-8">
            <FlowStep
              number={1}
              title="Заведение подключается к Promo.Air"
              description="Получает брендированную музыку и попадает в Promo.Guide"
            />
            <FlowStep
              number={2}
              title="Артист загружает трек в Promo.Music"
              description="Кураторы отбирают лучшие треки для ротации в заведениях"
            />
            <FlowStep
              number={3}
              title="Трек играет в заведении"
              description="Promo.Guide показывает публично: 'Сейчас играет Miles Davis'"
            />
            <FlowStep
              number={4}
              title="Посетитель видит в Promo.Guide"
              description="Получает QR-код со скидкой, видит 'кто здесь', приходит и знакомится"
            />
            <FlowStep
              number={5}
              title="Сетевой эффект!"
              description="Venue получает клиентов, артист — промо, мы — доминацию"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Готовы присоединиться?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Начните открывать заведения через музыку прямо сейчас
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={onEnterGuide}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
            >
              <Globe className="w-5 h-5 mr-2" />
              Открыть Promo.Guide
            </Button>
            <Button
              onClick={onLogin}
              size="lg"
              variant="outline"
              className="border-white/20 text-white text-lg px-8 py-6 hover:bg-white/10"
            >
              Войти в кабинет
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlatformCard({ title, subtitle, description, features, color, icon }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <div className={`text-sm font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r ${color}`}>
        {subtitle}
      </div>
      <p className="text-slate-300 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function FlowStep({ number, title, description }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-4"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}

// ==============================================
// ABOUT PAGE
// ==============================================
function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-white mb-8">О Promo.Music</h1>
      <div className="space-y-6 text-slate-300">
        <p className="text-lg">
          Promo.Music — это музыкальная экосистема, которая объединяет артистов, 
          заведения и меломанов через силу музыки.
        </p>
        <p>
          Мы не просто сервис для бизнеса или платформа для артистов. 
          Мы создаем уникальный опыт, где музыка становится связующим звеном 
          между людьми, местами и моментами.
        </p>
        <p>
          Наша миссия — сделать музыку не просто фоном, а способом открытия 
          новых мест, знакомств с единомышленниками и продвижения талантов.
        </p>
      </div>
    </div>
  );
}

// ==============================================
// FOOTER
// ==============================================
function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-bold text-white">Promo.Music</span>
            </div>
            <p className="text-sm text-slate-400">
              Музыкальная экосистема нового поколения
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Платформы</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Promo.Air (B2B)</li>
              <li>Promo.Music (B2C)</li>
              <li>Promo.Guide (Public)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Для кого</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Заведения</li>
              <li>Радиостанции</li>
              <li>Артисты</li>
              <li>Меломаны</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>hello@promo.music</li>
              <li>Москва, Россия</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
          © 2026 Promo.Music. Все права защищены.
        </div>
      </div>
    </footer>
  );
}