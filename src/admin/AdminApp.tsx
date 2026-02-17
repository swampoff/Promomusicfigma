import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, Newspaper,
  Briefcase, DollarSign, HeadphonesIcon, Settings, LogOut, 
  X, Menu, Bell, Shield, Send, Sparkles, BarChart3, Upload, MessageSquare, FlaskConical, Store, ListMusic, Activity
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Assets
import { PromoLogo } from '@/app/components/promo-logo';
import { UnifiedFooter } from '@/app/components/unified-footer';
import { SSEProvider } from '@/utils/contexts/SSEContext';
import { SSEStatusIndicator } from '@/app/components/sse-status-indicator';
import { SSEPushHandler } from '@/app/components/sse-push-handler';
import { MessagesProvider, useMessages } from '@/utils/contexts/MessagesContext';
import { DataProvider } from '@/contexts/DataContext';
import { useCabinetSection } from '@/app/hooks/useCabinetSection';

// ── Tiny sync bridge: reads MessagesContext unreadTotal for sidebar badge ──
function UnreadMessagesSync({ onCount }: { onCount: (n: number) => void }) {
  const msgCtx = useMessages();
  useEffect(() => {
    if (msgCtx) onCount(msgCtx.unreadTotal);
  }, [msgCtx?.unreadTotal, onCount]);
  return null;
}

export function AdminApp() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useCabinetSection('admin', 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(47);
  const [unreadMessages, setUnreadMessages] = useState(0);

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
    { id: 'ai_agent', label: 'Новости', icon: Newspaper, badge: null },
    { id: 'content_orders', label: 'Заказы контента', icon: Sparkles, badge: 5 },
    { id: 'pitching_distribution', label: 'Питчинг', icon: Send, badge: 3 },
    { id: 'track_test', label: 'Тест трека', icon: FlaskConical, badge: null },
    { id: 'messages', label: 'Сообщения', icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : null },
    { id: 'users', label: 'Пользователи', icon: Users, badge: null },
    { id: 'partners', label: 'Партнеры', icon: Briefcase, badge: null },
    { id: 'marketplace', label: 'Доходы', icon: Store, badge: null },
    { id: 'finances', label: 'Финансы', icon: DollarSign, badge: null },
    { id: 'charts_management', label: 'Чарты', icon: ListMusic, badge: null },
    { id: 'content_health', label: 'Здоровье контента', icon: Activity, badge: null },
    { id: 'support', label: 'Поддержка', icon: HeadphonesIcon, badge: 12 },
    { id: 'settings', label: 'Настройки', icon: Settings, badge: null },
  ];

  return (
    <DataProvider>
    <SSEProvider userId="admin-1">
    <MessagesProvider userId="admin-1" userName="Администратор" userRole="admin">
    <UnreadMessagesSync onCount={setUnreadMessages} />
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-purple-900 to-[#0a0a14] relative">
      <SSEPushHandler role="admin" />
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-[120] bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/10 px-3 xs:px-4 py-2.5 xs:py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
          >
            <PromoLogo size="xs" subtitle="АДМИН" subtitleColor="text-red-400/80" animated={false} glowOnHover={false} glowColor="#ef4444" title="На главную" />
          </button>

          <div className="flex items-center gap-1.5 xs:gap-2">
            {/* SSE Status */}
            <SSEStatusIndicator connectedColor="bg-red-400" />
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
      <div
        className={`fixed left-0 top-0 h-screen w-72 p-6 backdrop-blur-xl bg-[#0a0a14]/95 lg:bg-white/5 border-r border-white/10 overflow-y-auto z-[100] lg:z-10 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <PromoLogo
          size="md"
          subtitle="АДМИН"
          subtitleColor="text-red-400/80"
          animated={false}
          glowColor="#ef4444"
          className="mb-8"
          title="На главную"
          onClick={() => navigate('/')}
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
                <SSEStatusIndicator connectedColor="bg-red-400" showLabel labelConnectedColor="text-red-400" />
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
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Выход</span>
          </button>
        </div>
      </div>

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
            <Outlet context={{ setUnreadMessages }} />
          </motion.div>
        </AnimatePresence>
        <UnifiedFooter />
      </main>

      {/* Toast Notifications */}
      <Toaster position="top-right" theme="dark" richColors closeButton />
    </div>
    </MessagesProvider>
    </SSEProvider>
    </DataProvider>
  );
}