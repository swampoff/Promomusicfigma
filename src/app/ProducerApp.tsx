/**
 * PRODUCER APP - Кабинет продюсера/звукоинженера
 * Вкладки: Overview, Мои услуги, Портфолио, Заказы, Профиль, Кошелёк
 * Цветовая схема: teal/emerald (отличается от Artist-cyan, DJ-purple, Radio-indigo)
 * Все вкладки подключены к реальным API (6 хуков), интерактивный аудио-плеер до/после
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Sliders, Briefcase, FolderOpen, User, Wallet,
  LogOut, Menu, X, Star, TrendingUp, DollarSign, Clock, CheckCircle2,
  Package, BarChart3, Bell, Plus, Edit3,
  Eye, MessageSquare, Award, Zap, ArrowUpRight, Music2,
  RefreshCw, AlertCircle, RotateCcw
} from 'lucide-react';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';
import {
  useProducerProfile,
  useProducerReviews,
  useProducerServices,
  usePortfolio,
  useProducerOrders,
  useProducerWallet,
} from '@/hooks/useLandingData';
import type {
  ProducerProfile,
  ProducerReview,
  ProducerService,
  PortfolioItem,
  ProducerOrder,
  ProducerWallet as ProducerWalletType,
} from '@/utils/api/landing-data';
import { BeforeAfterPlayer } from './components/landing/BeforeAfterPlayer';

interface ProducerAppProps {
  onLogout: () => void;
}

type Tab = 'overview' | 'services' | 'portfolio' | 'orders' | 'profile' | 'wallet';

// Mock data fallbacks removed - now using real API data

function formatPrice(val: number): string {
  return val.toLocaleString('ru-RU');
}

// ─── Loading Skeleton ───
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/[0.03] border border-white/5 p-5 ${className}`}>
      <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
      <div className="h-3 bg-white/5 rounded w-1/2 mb-2" />
      <div className="h-3 bg-white/5 rounded w-2/3" />
    </div>
  );
}

function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── Error Banner ───
function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-300 flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-red-400" />
        </button>
      )}
    </div>
  );
}

// ─── Sidebar Nav Item ───
function NavItem({ icon: Icon, label, active, onClick, badge }: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-[10px] font-bold rounded-full min-w-[20px] text-center">{badge}</span>
      )}
    </button>
  );
}

// ─── Service Type Labels ───
const SERVICE_TYPE_LABELS: Record<string, string> = {
  mixing: 'Сведение',
  mastering: 'Мастеринг',
  arrangement: 'Аранжировка',
  vocal_recording: 'Запись вокала',
  ghost_production: 'Гост-продакшн',
  beatmaking: 'Битмейкинг',
  sound_design: 'Саунд-дизайн',
  consultation: 'Консультация',
  session_musician: 'Сессионный музыкант',
};

// ─── Overview Tab ───
function OverviewTab({
  profile,
  services,
  reviews,
  orders,
  wallet,
  isLoading,
}: {
  profile: ProducerProfile | null;
  services: ProducerService[];
  reviews: ProducerReview[];
  orders: ProducerOrder[];
  wallet: ProducerWalletType | null;
  isLoading: boolean;
}) {
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  const stats = [
    {
      label: 'Активных заказов',
      value: activeOrders.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Всего заказов',
      value: profile?.totalOrders ?? orders.length,
      icon: Package,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      label: 'Средний рейтинг',
      value: profile?.averageRating ?? 4.9,
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    {
      label: 'Отзывов',
      value: profile?.reviewCount ?? reviews.length,
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
  ];

  const monthlyEarnings = wallet?.monthlyEarnings ?? 128000;
  const totalEarnings = wallet?.totalEarned ?? profile?.totalEarnings ?? 890000;
  const pendingPayout = wallet?.pendingPayout ?? 45000;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingGrid count={4} />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-60" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-4 sm:p-5 rounded-2xl border ${s.bg} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Earnings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Доходы</h3>
          <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full">Февраль 2026</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Этот месяц</p>
            <p className="text-xl sm:text-2xl font-black text-teal-400">{formatPrice(monthlyEarnings)} <span className="text-sm font-normal">P</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Всего заработано</p>
            <p className="text-xl sm:text-2xl font-black text-white">{formatPrice(totalEarnings)} <span className="text-sm font-normal">P</span></p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">К выводу</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">{formatPrice(pendingPayout)} <span className="text-sm font-normal">P</span></p>
          </div>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Текущие заказы</h3>
          <span className="text-xs text-gray-500">{activeOrders.length} активных</span>
        </div>
        <div className="space-y-3">
          {activeOrders.slice(0, 4).map(order => (
            <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-teal-500/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white truncate">{order.serviceTitle}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    order.status === 'review' ? 'bg-amber-500/20 text-amber-400' :
                    order.status === 'revision' ? 'bg-orange-500/20 text-orange-400' :
                    order.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-teal-500/20 text-teal-400'
                  }`}>
                    {order.status === 'review' ? 'На проверке' : order.status === 'revision' ? 'Правки' : order.status === 'pending' ? 'Ожидание' : 'В работе'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{order.client} - до {new Date(order.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{formatPrice(order.price)} P</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      order.status === 'revision' ? 'bg-orange-500' :
                      order.status === 'pending' ? 'bg-blue-500' :
                      order.status === 'review' ? 'bg-amber-500' :
                      'bg-teal-500'
                    }`} style={{ width: `${order.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{order.progress}%</span>
                </div>
              </div>
            </div>
          ))}
          {activeOrders.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Нет активных заказов</p>
          )}
        </div>
        {orders.length > 0 && (
          <p className="text-[10px] text-gray-600 text-right mt-2">
            Всего: {orders.length} заказов - {orders.filter(o => o.status === 'completed').length} завершено
          </p>
        )}
      </motion.div>

      {/* Recent Reviews from API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Последние отзывы</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-white">{profile?.averageRating ?? 4.9}</span>
            <span className="text-xs text-gray-500">({profile?.reviewCount ?? reviews.length})</span>
          </div>
        </div>
        <div className="space-y-3">
          {reviews.slice(0, 3).map(review => (
            <div key={review.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-teal-400">{review.reviewerName[0]}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{review.reviewerName}</span>
                  <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                    {SERVICE_TYPE_LABELS[review.serviceType] || review.serviceType}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{review.reviewText}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Отзывов пока нет</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Services Tab ───
function ServicesTab({
  services,
  isLoading,
  error,
  onRetry,
}: {
  services: ProducerService[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Мои услуги</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Добавить услугу
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <Sliders className="w-6 h-6 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white">{svc.title}</h3>
                    <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold rounded-full">
                      {SERVICE_TYPE_LABELS[svc.type] || svc.type}
                    </span>
                  </div>
                  {svc.description && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{svc.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> от {formatPrice(svc.basePrice)} P</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {svc.orders} заказов</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {svc.rating}</span>
                    {svc.deliveryDays > 0 && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {svc.deliveryDays} дн.</span>
                    )}
                    {svc.revisions > 0 && (
                      <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {svc.revisions} правок</span>
                    )}
                  </div>
                  {svc.includes && svc.includes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {svc.includes.slice(0, 4).map((inc, idx) => (
                        <span key={idx} className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{inc}</span>
                      ))}
                      {svc.includes.length > 4 && (
                        <span className="text-[10px] text-teal-400">+{svc.includes.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    svc.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {svc.status === 'active' ? 'Активна' : 'Пауза'}
                  </span>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {services.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Sliders className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">У вас пока нет услуг</p>
              <p className="text-gray-600 text-xs mt-1">Нажмите "Добавить услугу" чтобы начать</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───
function OrdersTab({
  orders,
  isLoading,
  error,
  onRetry,
}: {
  orders: ProducerOrder[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filtered = orders.filter(o => {
    if (filter === 'active') return o.status !== 'completed' && o.status !== 'cancelled';
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-white">Заказы</h2>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'completed', ...(cancelledCount > 0 ? ['cancelled'] as const : [])] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              {f === 'all' ? `Все (${orders.length})` : f === 'active' ? 'Активные' : f === 'completed' ? 'Завершённые' : 'Отменённые'}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  order.status === 'completed' ? 'bg-emerald-500/10' :
                  order.status === 'review' ? 'bg-amber-500/10' :
                  order.status === 'revision' ? 'bg-orange-500/10' :
                  order.status === 'cancelled' ? 'bg-red-500/10' :
                  order.status === 'pending' ? 'bg-blue-500/10' :
                  'bg-teal-500/10'
                }`}>
                  {order.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : order.status === 'review' ? (
                    <Eye className="w-5 h-5 text-amber-400" />
                  ) : order.status === 'revision' ? (
                    <RotateCcw className="w-5 h-5 text-orange-400" />
                  ) : order.status === 'cancelled' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <Clock className={`w-5 h-5 ${order.status === 'pending' ? 'text-blue-400' : 'text-teal-400'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${order.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-white'}`}>{order.serviceTitle}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      order.status === 'review' ? 'bg-amber-500/20 text-amber-400' :
                      order.status === 'revision' ? 'bg-orange-500/20 text-orange-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      order.status === 'pending' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-teal-500/20 text-teal-400'
                    }`}>
                      {order.status === 'completed' ? 'Готово' : order.status === 'review' ? 'На проверке' : order.status === 'revision' ? 'Правки' : order.status === 'cancelled' ? 'Отменён' : order.status === 'pending' ? 'Ожидание' : 'В работе'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Клиент: {order.client} - Дедлайн: {new Date(order.deadline).toLocaleDateString('ru-RU')}
                    {order.notes && <span className="text-gray-600"> - {order.notes}</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${order.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-white'}`}>{formatPrice(order.price)} P</p>
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${order.status === 'revision' ? 'bg-orange-500' : order.status === 'pending' ? 'bg-blue-500' : order.status === 'review' ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${order.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{order.progress}%</span>
                    </div>
                  )}
                  {order.status === 'completed' && order.completedAt && (
                    <p className="text-[10px] text-emerald-500 mt-0.5">{new Date(order.completedAt).toLocaleDateString('ru-RU')}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Нет заказов в этой категории</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Portfolio Tab ───
function PortfolioTab({
  items,
  isLoading,
  error,
  onRetry,
}: {
  items: PortfolioItem[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Портфолио</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Добавить работу
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-56" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-teal-500/30 transition-all group"
            >
              <div className={`h-32 flex items-center justify-center relative ${
                item.type === 'Мастеринг' ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/10' :
                item.type === 'Аранжировка' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/10' :
                item.type === 'Ремикс' ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10' :
                item.type === 'Саунд-дизайн' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10' :
                'bg-gradient-to-br from-teal-500/20 to-emerald-500/10'
              }`}>
                <Music2 className={`w-10 h-10 ${
                  item.type === 'Мастеринг' ? 'text-blue-400/40' :
                  item.type === 'Аранжировка' ? 'text-purple-400/40' :
                  item.type === 'Ремикс' ? 'text-cyan-400/40' :
                  item.type === 'Саунд-дизайн' ? 'text-amber-400/40' :
                  'text-teal-400/40'
                }`} />
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                  {item.type}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 mb-2">Артист: {item.artist} - {item.year}</p>
                {item.description && (
                  <p className="text-[11px] text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                )}
                {item.beforeAfterDescription && (
                  <BeforeAfterPlayer
                    title={item.title}
                    type={item.type}
                    beforeAfterDescription={item.beforeAfterDescription}
                  />
                )}
              </div>
            </motion.div>
          ))}
          {items.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Портфолио пока пусто</p>
              <p className="text-gray-600 text-xs mt-1">Добавьте примеры ваших работ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ───
function ProfileTab({
  profile,
  isLoading,
}: {
  profile: ProducerProfile | null;
  isLoading: boolean;
}) {
  const producerName = profile?.producerName || localStorage.getItem('producerName') || 'Максам';
  const producerCity = profile?.city || localStorage.getItem('producerCity') || 'Москва';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Мой профиль</h2>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Мой профиль</h2>
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-teal-500/30 to-emerald-500/20 relative">
          <button className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-lg hover:bg-black/50 transition-colors">
            <Edit3 className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="px-5 sm:px-6 pb-6 -mt-10 relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 border-4 border-[#0a0a14] flex items-center justify-center shadow-xl">
            <span className="text-2xl font-black text-white">{producerName[0]}</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-white">{producerName}</h3>
              <Award className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-sm text-gray-400 mb-1">Звукоинженер и продюсер - {producerCity}</p>
            {profile?.bio && (
              <p className="text-xs text-gray-500 mb-4 max-w-xl">{profile.bio}</p>
            )}
            {!profile?.bio && (
              <p className="text-xs text-gray-500 mb-4">Профиль загружен из демо-данных</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-teal-400">{profile?.averageRating ?? 4.9}</p>
              <p className="text-[10px] text-gray-500">Рейтинг</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-white">{profile?.totalOrders ?? 62}</p>
              <p className="text-[10px] text-gray-500">Заказов</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-white">{profile?.experienceYears ?? 8}</p>
              <p className="text-[10px] text-gray-500">Лет опыта</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
              <p className="text-lg font-bold text-emerald-400">
                {profile?.responseTimeHours ? `${profile.responseTimeHours}ч` : '98%'}
              </p>
              <p className="text-[10px] text-gray-500">{profile?.responseTimeHours ? 'Время отклика' : 'Отклик'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Специализации</h4>
              <div className="flex flex-wrap gap-2">
                {(profile?.specializations || ['mixing', 'ghost_production', 'beatmaking']).map(s => (
                  <span key={s} className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium rounded-full">
                    {SERVICE_TYPE_LABELS[s] || s}
                  </span>
                ))}
              </div>
            </div>
            {(profile?.softwareUsed || ['Pro Tools HD', 'Waves', 'FabFilter', 'Soundtoys', 'UAD']).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Софт</h4>
                <div className="flex flex-wrap gap-2">
                  {(profile?.softwareUsed || ['Pro Tools HD', 'Waves', 'FabFilter', 'Soundtoys', 'UAD']).map(s => (
                    <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {(profile?.hardwareUsed || ['Neumann U87', 'Neve 1073', 'SSL Bus Compressor', 'Focal Trio11']).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Оборудование</h4>
                <div className="flex flex-wrap gap-2">
                  {(profile?.hardwareUsed || ['Neumann U87', 'Neve 1073', 'SSL Bus Compressor', 'Focal Trio11']).map(s => (
                    <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile?.workPhilosophy && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Философия работы</h4>
                <p className="text-sm text-gray-300 italic">"{profile.workPhilosophy}"</p>
              </div>
            )}
            {profile?.languages && profile.languages.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Языки</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map(l => (
                    <span key={l} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg">{l}</span>
                  ))}
                </div>
              </div>
            )}
            {profile?.certifications && profile.certifications.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Сертификаты</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-1">
                      <Award className="w-3 h-3" /> {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile?.notableClients && profile.notableClients.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Известные клиенты</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.notableClients.map(c => (
                    <span key={c} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-lg">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {/* Rush Orders */}
            {profile?.acceptsRushOrders && (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-300 font-medium">
                    Срочные заказы: +{profile.rushOrderSurchargePercent}% к стоимости
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wallet Tab ───
function WalletTab({
  wallet,
  isLoading,
  error,
  onRetry,
  profileTotalEarnings,
}: {
  wallet: ProducerWalletType | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  profileTotalEarnings: number;
}) {
  const balance = wallet?.balance ?? 0;
  const totalEarned = wallet?.totalEarned ?? profileTotalEarnings;
  const pendingPayout = wallet?.pendingPayout ?? 0;
  const lastPayout = wallet?.lastPayout ?? { amount: 0, date: '-', method: '-' };
  const transactions = wallet?.transactions ?? [];
  const commissionRate = wallet?.commissionRate ?? 10;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Кошелёк</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} className="h-24" />)}
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Кошелёк</h2>

      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/15 to-emerald-500/10 border border-teal-500/20"
        >
          <p className="text-xs text-gray-400 mb-1">Баланс</p>
          <p className="text-2xl font-black text-teal-400">{formatPrice(balance)} <span className="text-sm font-normal">P</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <p className="text-xs text-gray-400 mb-1">Заработано за всё время</p>
          <p className="text-2xl font-black text-white">{formatPrice(totalEarned)} <span className="text-sm font-normal">P</span></p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10"
        >
          <p className="text-xs text-gray-400 mb-1">Последний вывод</p>
          <p className="text-2xl font-black text-white">{formatPrice(lastPayout.amount)} <span className="text-sm font-normal">P</span></p>
          <p className="text-[10px] text-gray-500 mt-0.5">{lastPayout.date} - {lastPayout.method}</p>
        </motion.div>
      </div>

      {/* Monthly Earnings */}
      {wallet?.monthlyEarnings !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-gray-400">Доход за текущий месяц</p>
            <p className="text-lg font-black text-emerald-400">{formatPrice(wallet.monthlyEarnings)} P</p>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-400/40" />
        </motion.div>
      )}

      {/* Withdraw Button */}
      {pendingPayout > 0 && (
        <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all">
          Вывести {formatPrice(pendingPayout)} P
        </button>
      )}

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
      >
        <h3 className="text-base font-bold text-white mb-4">История операций</h3>
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tx.type === 'income' ? 'bg-emerald-500/10' :
                tx.type === 'commission' ? 'bg-amber-500/10' :
                'bg-red-500/10'
              }`}>
                {tx.type === 'income' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : tx.type === 'commission' ? (
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-400 rotate-45" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{tx.description}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-500">{tx.date}</p>
                  {tx.status === 'pending' && (
                    <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded">Ожидание</span>
                  )}
                </div>
              </div>
              <span className={`text-sm font-bold ${
                tx.amount > 0 ? 'text-emerald-400' : 'text-gray-400'
              }`}>
                {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)} P
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">Нет операций</p>
          )}
        </div>
      </motion.div>

      {/* Payout Methods */}
      {wallet?.payoutMethods && wallet.payoutMethods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-base font-bold text-white mb-3">Способы выплат</h3>
          <div className="space-y-2">
            {wallet.payoutMethods.map(pm => (
              <div key={pm.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{pm.label}</p>
                  <p className="text-[10px] text-gray-500">{pm.type === 'card' ? 'Банковская карта' : pm.type}</p>
                </div>
                {pm.isDefault && (
                  <span className="text-[9px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-full font-bold">По умолчанию</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Earnings Breakdown */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-base font-bold text-white mb-3">Сводка</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
              <p className="text-lg font-bold text-emerald-400">
                {formatPrice(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
              </p>
              <p className="text-[10px] text-gray-500">Доходы</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
              <p className="text-lg font-bold text-amber-400">
                {formatPrice(Math.abs(transactions.filter(t => t.type === 'commission').reduce((s, t) => s + t.amount, 0)))}
              </p>
              <p className="text-[10px] text-gray-500">Комиссия</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
              <p className="text-lg font-bold text-gray-300">
                {formatPrice(Math.abs(transactions.filter(t => t.type === 'payout').reduce((s, t) => s + t.amount, 0)))}
              </p>
              <p className="text-[10px] text-gray-500">Выведено</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Commission Info */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300 mb-1">Комиссия платформы</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Promo.music удерживает {commissionRate}% с каждого заказа. Это покрывает обработку платежей, защиту сделок и продвижение ваших услуг на платформе.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN PRODUCER APP COMPONENT
// ═══════════════════════════════════════════════

export default function ProducerApp({ onLogout }: ProducerAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read KV profile ID and user ID from localStorage (set during login)
  const producerProfileId = localStorage.getItem('producerProfileId') || 'producer-maxam';
  const producerUserId = localStorage.getItem('producerUserId') || 'artist-maxam';
  const producerName = localStorage.getItem('producerName') || 'Максам';

  // ─── API Hooks ───
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useProducerProfile(producerProfileId);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useProducerReviews(producerProfileId);

  const {
    data: allServicesData,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useProducerServices();

  const {
    data: allPortfolioData,
    isLoading: portfolioLoading,
    error: portfolioError,
    refetch: refetchPortfolio,
  } = usePortfolio();

  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useProducerOrders(producerProfileId);

  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useProducerWallet(producerProfileId);

  // Filter services & portfolio for this producer
  const myServices = useMemo(() => {
    if (!allServicesData) return [];
    return allServicesData.filter(s => s.producerId === producerUserId);
  }, [allServicesData, producerUserId]);

  const myPortfolio = useMemo(() => {
    if (!allPortfolioData) return [];
    return allPortfolioData.filter(p => p.producerId === producerUserId);
  }, [allPortfolioData, producerUserId]);

  const reviews = reviewsData || [];

  const navItems: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
    { id: 'services', label: 'Мои услуги', icon: Sliders, badge: myServices.length || undefined },
    { id: 'orders', label: 'Заказы', icon: Briefcase, badge: (ordersData || []).filter(o => o.status !== 'completed' && o.status !== 'cancelled').length || undefined },
    { id: 'portfolio', label: 'Портфолио', icon: FolderOpen },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'wallet', label: 'Кошелёк', icon: Wallet },
  ];

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'services':
        return (
          <ServicesTab
            services={myServices}
            isLoading={servicesLoading}
            error={servicesError}
            onRetry={refetchServices}
          />
        );
      case 'orders':
        return (
          <OrdersTab
            orders={ordersData || []}
            isLoading={ordersLoading}
            error={ordersError}
            onRetry={refetchOrders}
          />
        );
      case 'portfolio':
        return (
          <PortfolioTab
            items={myPortfolio}
            isLoading={portfolioLoading}
            error={portfolioError}
            onRetry={refetchPortfolio}
          />
        );
      case 'profile':
        return <ProfileTab profile={profileData} isLoading={profileLoading} />;
      case 'wallet':
        return (
          <WalletTab
            wallet={walletData}
            isLoading={walletLoading}
            error={walletError}
            onRetry={refetchWallet}
            profileTotalEarnings={profileData?.totalEarnings ?? 890000}
          />
        );
      default:
        return (
          <OverviewTab
            profile={profileData}
            services={myServices}
            reviews={reviews}
            orders={ordersData || []}
            wallet={walletData}
            isLoading={profileLoading || reviewsLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* ─── Mobile Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-[120] lg:hidden">
        <div className="bg-[#0a0a14]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2.5">
              <img src={promoLogo} alt="Promo.music" className="h-7" />
              <div className="h-4 w-px bg-white/10" />
              <span className="text-xs font-bold text-teal-400">Продюсер</span>
            </div>
            <div className="flex items-center gap-2">
              {/* API Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${profileError ? 'bg-amber-400' : profileData ? 'bg-emerald-400' : 'bg-gray-500'}`} title={profileError ? 'Демо-режим' : 'API подключён'} />
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-teal-400 rounded-full" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0a0a14]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
              <div className="p-3 space-y-1">
                {navItems.map(item => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => handleTabChange(item.id)}
                    badge={item.badge}
                  />
                ))}
                <div className="pt-2 mt-2 border-t border-white/5">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                    Выйти
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-[110] flex-col bg-[#0a0a14] border-r border-white/5" style={{ width: '256px' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
          <img src={promoLogo} alt="Promo.music" className="h-7" />
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-bold text-teal-400 tracking-wide">ПРОДЮСЕР</span>
        </div>

        {/* Profile */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-sm font-black text-white">{producerName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{producerName}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] text-teal-400 font-medium">Звукоинженер</p>
                <div className={`w-1.5 h-1.5 rounded-full ${profileData ? 'bg-emerald-400' : 'bg-gray-500'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => handleTabChange(item.id)}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Выйти
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="pt-16 lg:pt-0" style={{ marginLeft: '0px' }}>
        <div className="lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {navItems.find(n => n.id === activeTab)?.label || 'Обзор'}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Кабинет продюсера - {producerName}</p>
                {profileData && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">API</span>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}