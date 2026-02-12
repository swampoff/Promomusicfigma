import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Music2, Video, Calendar, FileText, Users, 
  Briefcase, DollarSign, HeadphonesIcon, Settings, LogOut, 
  X, Menu, Bell, Shield, Send, Sparkles, BarChart3, Upload
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Admin pages
import { Dashboard } from './pages/Dashboard';
import { Moderation } from './pages/Moderation';
import { TrackModeration } from './pages/TrackModeration';
import { VideoModeration } from './pages/VideoModeration';
import { ConcertModeration } from './pages/ConcertModeration';
import { NewsModeration } from './pages/NewsModeration';
import { PitchingDistribution } from './pages/PitchingDistribution';
import { FeedbackDemo } from './pages/FeedbackDemo';
import { UsersManagement } from './pages/UsersManagement';
import { PartnersManagement } from './pages/PartnersManagement';
import { Finances } from './pages/Finances';
import { Support } from './pages/Support';
import { AdminSettings } from './pages/Settings';
import { ContentOrdersAdmin } from './components/content-orders-admin';
import { AIAgentDashboard } from './components/AIAgentDashboard';
import { PublishModeration } from './pages/PublishModeration';

// Assets
import { PromoLogo } from '@/app/components/promo-logo';

interface AdminAppProps {
  onLogout: () => void;
}

export function AdminApp({ onLogout }: AdminAppProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(47); // Общее количество ожидающих модерации

  // Keyboard shortcut: ? to navigate to support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setActiveSection('support');
        setIsMobileMenuOpen(false);
        toast('Открываем раздел поддержки', { icon: '❓', duration: 2000 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, badge: null },
    { id: 'moderation', label: 'Модерация', icon: Shield, badge: 47 },
    { id: 'publish', label: 'Публикации', icon: Upload, badge: 3 },
    { id: 'ai_agent', label: 'AI Агент', icon: BarChart3, badge: null },
    { id: 'content_orders', label: 'Заказы контента', icon: Sparkles, badge: 5 },
    { id: 'pitching_distribution', label: 'Питчинг', icon: Send, badge: 3 },
    { id: 'users', label: 'Пользователи', icon: Users, badge: null },
    { id: 'partners', label: 'Партнеры', icon: Briefcase, badge: null },
    { id: 'finances', label: 'Финансы', icon: DollarSign, badge: null },
    { id: 'support', label: 'Поддержка', icon: HeadphonesIcon, badge: 12 },
    { id: 'settings', label: 'Настройки', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-slate-900/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setActiveSection('dashboard'); setIsMobileMenuOpen(false); }}
            className="hover:opacity-80 transition-opacity"
          >
            <PromoLogo size="xs" subtitle="ADMIN" subtitleColor="text-red-400/80" animated={false} glowOnHover={false} glowColor="#ef4444" title="На главную" />
          </button>

          <div className="flex items-center gap-1.5 xs:gap-2">
            {/* Pending badge */}
            {pendingCount > 0 && (
              <div className="flex items-center gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/25">
                <Bell className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-yellow-400" />
                <span className="text-[10px] xs:text-xs font-bold text-yellow-200">{pendingCount}</span>
              </div>
            )}
            {/* Admin avatar */}
            <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md shadow-red-500/20">
              <Shield className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-white" />
            </div>
            {/* Burger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 xs:w-10 xs:h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 xs:w-5 xs:h-5" /> : <Menu className="w-4 h-4 xs:w-5 xs:h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile header spacer */}
      <div className="lg:hidden h-[52px] xs:h-[58px]" />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : -288,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:translate-x-0 fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-gray-900/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10"
      >
        {/* Logo */}
        <PromoLogo
          size="md"
          subtitle="ADMIN"
          subtitleColor="text-red-400/80"
          animated={false}
          glowColor="#ef4444"
          className="mb-8"
          title="На главную"
          onClick={() => { setActiveSection('dashboard'); setIsMobileMenuOpen(false); }}
        />

        {/* Admin Badge */}
        <div className="mb-8">
          <div className="p-4 rounded-2xl backdrop-blur-md bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Администратор</div>
                <div className="text-gray-300 text-xs">admin@promo.music</div>
              </div>
            </div>
          </div>

          {/* Pending Items Badge */}
          {pendingCount > 0 && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-bold">Ожидают</span>
                </div>
                <span className="text-yellow-400 text-lg font-bold">{pendingCount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="space-y-1 mb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 text-white shadow-lg shadow-red-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-red-400' : ''} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Logout Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Выход</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="ml-0 lg:ml-72 flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'dashboard' && <Dashboard />}
            {activeSection === 'moderation' && <Moderation />}
            {activeSection === 'content_orders' && <ContentOrdersAdmin />}
            {activeSection === 'pitching_distribution' && <PitchingDistribution />}
            {activeSection === 'users' && <UsersManagement />}
            {activeSection === 'partners' && <PartnersManagement />}
            {activeSection === 'finances' && <Finances />}
            {activeSection === 'support' && <Support />}
            {activeSection === 'settings' && <AdminSettings />}
            {activeSection === 'ai_agent' && <AIAgentDashboard />}
            {activeSection === 'publish' && <PublishModeration />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
  );
}