/**
 * SERVICE ORDERS PANEL - Lifecycle UI для заказов услуг маркетплейса
 * 
 * Lifecycle: pending → accepted → in_progress → revision → completed → reviewed
 * Роли: producer (управляет статусами) / client (отслеживает)
 * API: /api/marketplace/orders, /api/marketplace/orders/:id/status
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock, CheckCircle2, XCircle, Play, RotateCcw, Star,
  Loader2, ChevronRight, Briefcase,
  Calendar, Banknote, Timer, Package,
} from 'lucide-react';
import {
  fetchMyOrders, updateOrderStatus,
  fetchContract, updateMilestoneStatus,
  type ServiceOrder,
  type ServiceContract,
  type Milestone,
} from '@/utils/api/marketplace';

/* ═══════════════════════════════════════ */
/* TYPES & CONSTANTS                       */
/* ═══════════════════════════════════════ */

type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'revision' | 'completed' | 'reviewed';

interface StatusConfig {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof Clock;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: 'Ожидает подтверждения',
    shortLabel: 'Ожидание',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: Clock,
  },
  accepted: {
    label: 'Принят',
    shortLabel: 'Принят',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Отклонён',
    shortLabel: 'Отклонён',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: XCircle,
  },
  in_progress: {
    label: 'В работе',
    shortLabel: 'В работе',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: Play,
  },
  revision: {
    label: 'На ревизии',
    shortLabel: 'Ревизия',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    icon: RotateCcw,
  },
  completed: {
    label: 'Завершён',
    shortLabel: 'Готово',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  reviewed: {
    label: 'Оценён',
    shortLabel: 'Оценён',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    icon: Star,
  },
};

// Pipeline steps (excluding rejected/reviewed which are terminal)
const PIPELINE_STEPS: OrderStatus[] = ['pending', 'accepted', 'in_progress', 'completed'];

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  normal: { label: 'Обычная', color: 'text-gray-400' },
  fast: { label: 'Быстрая (x1.5)', color: 'text-amber-400' },
  urgent: { label: 'Срочная (x2)', color: 'text-red-400' },
};

/* ═══════════════════════════════════════ */
/* HELPERS                                 */
/* ═══════════════════════════════════════ */

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

/* ═══════════════════════════════════════ */
/* MAIN COMPONENT                          */
/* ═══════════════════════════════════════ */

interface ServiceOrdersPanelProps {
  /** ID текущего пользователя (demo) */
  userId?: string;
  /** Роль: producer - управляет заказами, client - отслеживает */
  role?: 'client' | 'producer';
}

export function ServiceOrdersPanel({ userId = 'demo-user', role = 'client' }: ServiceOrdersPanelProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders(userId, role);
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load marketplace orders:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (filter === 'active') return !['completed', 'reviewed', 'rejected'].includes(o.status);
      if (filter === 'completed') return ['completed', 'reviewed'].includes(o.status);
      if (filter === 'cancelled') return o.status === 'rejected';
      return true;
    });
  }, [orders, filter]);

  const activeCount = orders.filter(o => !['completed', 'reviewed', 'rejected'].includes(o.status)).length;
  const completedCount = orders.filter(o => ['completed', 'reviewed'].includes(o.status)).length;

  return (
    <div className="pb-12">
      {/* Header + filters */}
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
            {[
              { label: 'Всего заказов', value: orders.length, icon: Package, color: 'text-purple-400' },
              { label: 'Активные', value: activeCount, icon: Play, color: 'text-cyan-400' },
              { label: 'Завершённые', value: completedCount, icon: CheckCircle2, color: 'text-emerald-400' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center"
              >
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <p className="text-lg font-black text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { key: 'all' as const, label: `Все (${orders.length})` },
              { key: 'active' as const, label: `Активные (${activeCount})` },
              { key: 'completed' as const, label: `Завершённые (${completedCount})` },
              ...(orders.some(o => o.status === 'rejected') ? [{ key: 'cancelled' as const, label: 'Отклонённые' }] : []),
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  filter === f.key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                }`}
              >{f.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="px-3 sm:px-5 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded w-full" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">Нет заказов</h3>
              <p className="text-sm text-gray-600">
                {filter === 'all'
                  ? 'Заказы появятся здесь после оформления'
                  : 'В этой категории пока нет заказов'}
              </p>
            </motion.div>
          ) : (
            filtered.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                index={idx}
                role={role}
                isExpanded={expandedOrderId === order.id}
                onToggleExpand={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                onStatusChange={async (newStatus, progress, message) => {
                  const result = await updateOrderStatus(order.id, order.producerId, newStatus, progress, message);
                  if (result) {
                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...result } : o));
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* ORDER CARD                              */
/* ═══════════════════════════════════════ */

function OrderCard({ order, index, role, isExpanded, onToggleExpand, onStatusChange }: {
  order: ServiceOrder;
  index: number;
  role: 'client' | 'producer';
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: string, progress?: number, message?: string) => Promise<void>;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [progressInput, setProgressInput] = useState(order.progress || 0);
  const [statusMessage, setStatusMessage] = useState('');

  const status = (order.status || 'pending') as OrderStatus;
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const urgency = URGENCY_LABELS[order.urgency || 'normal'] || URGENCY_LABELS.normal;
  const deadlineDays = daysUntil(order.deadline);

  const handleAction = async (newStatus: string, progress?: number) => {
    setActionLoading(newStatus);
    try {
      await onStatusChange(newStatus, progress, statusMessage || undefined);
      setStatusMessage('');
    } finally {
      setActionLoading(null);
    }
  };

  // Determine which actions are available based on current status and role
  const actions = useMemo(() => {
    if (role !== 'producer') return [];
    const acts: Array<{ status: string; label: string; icon: typeof Play; color: string; destructive?: boolean }> = [];

    switch (status) {
      case 'pending':
        acts.push({ status: 'accepted', label: 'Принять заказ', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' });
        acts.push({ status: 'rejected', label: 'Отклонить', icon: XCircle, color: 'from-red-500 to-red-600', destructive: true });
        break;
      case 'accepted':
        acts.push({ status: 'in_progress', label: 'Начать работу', icon: Play, color: 'from-purple-500 to-indigo-500' });
        break;
      case 'in_progress':
        acts.push({ status: 'completed', label: 'Завершить', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' });
        acts.push({ status: 'revision', label: 'На ревизию', icon: RotateCcw, color: 'from-orange-500 to-amber-500' });
        break;
      case 'revision':
        acts.push({ status: 'in_progress', label: 'Вернуть в работу', icon: Play, color: 'from-purple-500 to-indigo-500' });
        acts.push({ status: 'completed', label: 'Завершить', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' });
        break;
    }
    return acts;
  }, [status, role]);

  // Pipeline step index
  const isTerminal = status === 'rejected' || status === 'completed' || status === 'reviewed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white/[0.03] backdrop-blur-sm rounded-xl border transition-all overflow-hidden ${
        isExpanded ? `${config.borderColor} shadow-lg` : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Main row (always visible) */}
      <button onClick={onToggleExpand} className="w-full text-left p-4 flex items-center gap-3">
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className={`text-sm font-bold ${status === 'rejected' ? 'text-gray-500 line-through' : 'text-white'} truncate`}>
              {order.serviceTitle}
            </p>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
              {config.shortLabel}
            </span>
            {order.urgency && order.urgency !== 'normal' && (
              <span className={`text-[9px] font-bold ${urgency.color}`}>{urgency.label}</span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            {role === 'producer' ? (
              <>Клиент: <span className="text-gray-400">{order.clientName}</span></>
            ) : (
              <>Исполнитель: <span className="text-gray-400">{order.producerName}</span></>
            )}
            <span className="mx-1.5 text-gray-700">-</span>
            {timeAgo(order.createdAt)}
          </p>
        </div>

        {/* Price + progress */}
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-black ${status === 'rejected' ? 'text-gray-600 line-through' : 'text-white'}`}>
            {formatPrice(order.price)} ₽
          </p>
          {!isTerminal && order.progress > 0 && (
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${
                  status === 'revision' ? 'bg-orange-500' : 'bg-purple-500'
                }`} style={{ width: `${order.progress}%` }} />
              </div>
              <span className="text-[10px] text-gray-500">{order.progress}%</span>
            </div>
          )}
        </div>

        {/* Expand arrow */}
        <ChevronRight className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
              {/* Pipeline timeline */}
              <OrderPipeline currentStatus={status} />

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <DetailCell icon={Calendar} label="Создан" value={formatDate(order.createdAt)} />
                <DetailCell icon={Timer} label="Срок" value={order.deliveryDays ? `${order.deliveryDays} дн.` : '-'} />
                <DetailCell
                  icon={Calendar}
                  label="Дедлайн"
                  value={order.deadline ? formatDate(order.deadline) : 'Не установлен'}
                  highlight={deadlineDays !== null && deadlineDays <= 2 && deadlineDays >= 0 ? 'warning' : deadlineDays !== null && deadlineDays < 0 ? 'danger' : undefined}
                />
                <DetailCell
                  icon={Banknote}
                  label="Выплата"
                  value={`${formatPrice(order.producerPayout || 0)} ₽`}
                  sublabel={`Комиссия: ${formatPrice(order.commission || 0)} ₽`}
                />
              </div>

              {/* Message from client */}
              {order.message && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Сообщение от клиента</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{order.message}</p>
                </div>
              )}

              {/* Progress slider (producer, in_progress/revision) */}
              {role === 'producer' && (status === 'in_progress' || status === 'revision') && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Прогресс выполнения</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0} max={100} step={5}
                      value={progressInput}
                      onChange={e => setProgressInput(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-sm font-black text-white w-10 text-right">{progressInput}%</span>
                    {progressInput !== order.progress && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction(status, progressInput)}
                        disabled={actionLoading !== null}
                        className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 hover:bg-purple-500/30 transition-all"
                      >
                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Сохранить'}
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* Status message input (producer) */}
              {role === 'producer' && actions.length > 0 && (
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Комментарий к статусу (необязательно)</p>
                  <input
                    type="text" value={statusMessage} onChange={e => setStatusMessage(e.target.value)}
                    placeholder="Информация для клиента..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              )}

              {/* Action buttons (producer) */}
              {actions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {actions.map(act => (
                    <motion.button
                      key={act.status}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(act.status)}
                      disabled={actionLoading !== null}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                        act.destructive
                          ? 'bg-white/5 border border-red-500/20 text-red-400 hover:bg-red-500/10'
                          : `bg-gradient-to-r ${act.color} text-white shadow-sm`
                      }`}
                    >
                      {actionLoading === act.status ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <act.icon className="w-3.5 h-3.5" />
                      )}
                      {act.label}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Client view: read-only status info */}
              {role === 'client' && !isTerminal && (
                <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                  <p className={`text-xs font-bold ${config.color} flex items-center gap-1.5`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {getClientStatusMessage(status)}
                  </p>
                </div>
              )}

              {/* Completed info */}
              {status === 'completed' && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-400">Заказ завершён</p>
                    <p className="text-[10px] text-gray-500">
                      {(order as any).completedAt ? `Выполнен ${formatDate((order as any).completedAt)}` : 'Работа выполнена'}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejected info */}
              {status === 'rejected' && (
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-400">Заказ отклонён</p>
                    <p className="text-[10px] text-gray-500">{(order as any).statusMessage || 'Исполнитель не может принять заказ'}</p>
                  </div>
                </div>
              )}

              {/* Contract milestones section */}
              {['accepted', 'in_progress', 'revision', 'completed'].includes(status) && (
                <ContractSection orderId={order.id} role={role} userId={order.producerId} clientId={order.clientId} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════ */
/* ORDER PIPELINE (Visual timeline)        */
/* ═══════════════════════════════════════ */

function OrderPipeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const isRejected = currentStatus === 'rejected';
  const isRevision = currentStatus === 'revision';

  // Determine which step we're on
  const getCurrentIdx = () => {
    if (isRejected) return -1;
    if (isRevision) return 2; // revision is between in_progress and completed
    const idx = PIPELINE_STEPS.indexOf(currentStatus);
    return idx >= 0 ? idx : PIPELINE_STEPS.length; // reviewed = after completed
  };

  const currentIdx = getCurrentIdx();

  return (
    <div className="relative">
      {/* Main pipeline */}
      <div className="flex items-center gap-0">
        {PIPELINE_STEPS.map((step, idx) => {
          const conf = STATUS_CONFIG[step];
          const StepIcon = conf.icon;
          const isPast = idx < currentIdx;
          const isCurrent = idx === currentIdx && !isRejected;

          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? `${conf.bgColor} ${conf.borderColor} ${conf.color} ring-2 ring-offset-1 ring-offset-[#0a0a14] ring-purple-500/30`
                    : isPast
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-gray-600'
                }`}>
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className={`text-[9px] font-bold mt-1 ${
                  isCurrent ? conf.color : isPast ? 'text-emerald-400' : 'text-gray-600'
                }`}>
                  {conf.shortLabel}
                </span>
              </div>

              {/* Connector line (except after last) */}
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                      isPast || (isCurrent && idx < PIPELINE_STEPS.length - 1)
                        ? 'bg-emerald-500'
                        : 'bg-transparent'
                    }`}
                    style={{ width: isPast ? '100%' : isCurrent ? '50%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Revision indicator */}
      {isRevision && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3 text-orange-400" />
          <span className="text-[10px] font-bold text-orange-400">Ревизия - возврат на доработку</span>
        </motion.div>
      )}

      {/* Rejected indicator */}
      {isRejected && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center justify-center gap-1.5"
        >
          <XCircle className="w-3 h-3 text-red-400" />
          <span className="text-[10px] font-bold text-red-400">Заказ отклонён исполнителем</span>
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* DETAIL CELL                             */
/* ═══════════════════════════════════════ */

function DetailCell({ icon: Icon, label, value, sublabel, highlight }: {
  icon: typeof Clock; label: string; value: string; sublabel?: string;
  highlight?: 'warning' | 'danger';
}) {
  return (
    <div className={`p-2.5 rounded-xl ${
      highlight === 'danger' ? 'bg-red-500/5 border border-red-500/10' :
      highlight === 'warning' ? 'bg-amber-500/5 border border-amber-500/10' :
      'bg-white/5'
    }`}>
      <Icon className={`w-3.5 h-3.5 mb-1 ${
        highlight === 'danger' ? 'text-red-400' :
        highlight === 'warning' ? 'text-amber-400' :
        'text-gray-500'
      }`} />
      <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${
        highlight === 'danger' ? 'text-red-400' :
        highlight === 'warning' ? 'text-amber-400' :
        'text-white'
      }`}>{value}</p>
      {sublabel && <p className="text-[9px] text-gray-600 mt-0.5">{sublabel}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* HELPERS                                 */
/* ═══════════════════════════════════════ */

function getClientStatusMessage(status: OrderStatus): string {
  switch (status) {
    case 'pending': return 'Ваш заказ ожидает подтверждения исполнителем';
    case 'accepted': return 'Заказ принят. Исполнитель скоро приступит к работе';
    case 'in_progress': return 'Исполнитель работает над вашим заказом';
    case 'revision': return 'Заказ отправлен на доработку';
    default: return '';
  }
}

/* ═══════════════════════════════════════ */
/* CONTRACT SECTION                        */
/* ═══════════════════════════════════════ */

function ContractSection({ orderId, role, userId, clientId }: { orderId: string; role: 'client' | 'producer'; userId: string; clientId: string }) {
  const [contract, setContract] = useState<ServiceContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchContract(orderId).then(data => {
      setContract(data || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  const handleMilestoneAction = async (milestoneId: string, action: 'start' | 'submit' | 'approve' | 'revision') => {
    const actorId = (action === 'approve' || action === 'revision') ? clientId : userId;
    setActionLoading(milestoneId);
    try {
      const result = await updateMilestoneStatus(orderId, milestoneId, action, actorId);
      if (result) setContract(result);
    } catch (err) {
      console.error('Milestone action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-3 bg-white/5 rounded-xl animate-pulse">
        <div className="h-3 bg-white/5 rounded w-32 mb-2" />
        <div className="h-8 bg-white/5 rounded w-full" />
      </div>
    );
  }

  if (!contract) return null;

  const MILESTONE_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Ожидание', color: 'text-gray-400', bg: 'bg-gray-500/10' },
    in_progress: { label: 'В работе', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    submitted: { label: 'На проверке', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    approved: { label: 'Одобрен', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    revision: { label: 'Доработка', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  };

  return (
    <div className="p-3 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-xl border border-purple-500/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
          Контракт - {contract.milestones.length} этапов
        </p>
        <p className="text-[10px] text-gray-500">
          Оплачено: <span className="text-white font-bold">{formatPrice(contract.paidAmount)}</span> / {formatPrice(contract.totalAmount)} ₽
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${contract.totalAmount > 0 ? (contract.paidAmount / contract.totalAmount) * 100 : 0}%` }}
        />
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {contract.milestones.map((m, idx) => {
          const msConf = MILESTONE_STATUS_LABELS[m.status] || MILESTONE_STATUS_LABELS.pending;
          const isActive = actionLoading === m.id;

          // Available actions
          const msActions: Array<{ action: 'start' | 'submit' | 'approve' | 'revision'; label: string; color: string }> = [];
          if (role === 'producer') {
            if (m.status === 'pending' || m.status === 'revision') msActions.push({ action: 'start', label: 'Начать', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' });
            if (m.status === 'in_progress') msActions.push({ action: 'submit', label: 'Сдать', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' });
          }
          if (role === 'client' && m.status === 'submitted') {
            msActions.push({ action: 'approve', label: 'Принять', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' });
            msActions.push({ action: 'revision', label: 'Доработать', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' });
          }

          return (
            <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02]">
              {/* Step number */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                m.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : m.status === 'submitted'
                  ? 'bg-amber-500/20 text-amber-400'
                  : m.status === 'in_progress'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-white/5 text-gray-500'
              }`}>
                {m.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{m.title}</p>
                {m.description && <p className="text-[10px] text-gray-500 truncate">{m.description}</p>}
              </div>

              {/* Amount */}
              <p className="text-xs font-bold text-white flex-shrink-0">{formatPrice(m.amount)} ₽</p>

              {/* Status badge */}
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${msConf.bg} ${msConf.color}`}>
                {msConf.label}
              </span>

              {/* Actions */}
              {msActions.map(a => (
                <button
                  key={a.action}
                  onClick={() => handleMilestoneAction(m.id, a.action)}
                  disabled={isActive}
                  className={`text-[9px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 transition-all disabled:opacity-50 ${a.color}`}
                >
                  {isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : a.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}