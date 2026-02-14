/**
 * MARKETPLACE ADMIN - Маркетплейс-сделки и комиссии платформы
 * Загружает данные из /api/marketplace/admin/*
 * Adaptive: 320px → 4K
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, TrendingUp, Music, Package, Briefcase,
  Loader2, RefreshCw, Filter, ArrowUpDown,
  Percent, CheckCircle2, Clock, Store, ShoppingCart,
  User, Calendar, ChevronDown, X, Wallet,
  Headphones, Radio, FlaskConical, CreditCard, Heart,
} from 'lucide-react';
import {
  fetchMarketplaceAdminStats,
  fetchMarketplaceAdminTransactions,
  type MarketplaceAdminStats,
  type MarketplaceTransaction,
} from '@/utils/api/marketplace';

/* ═══════════════════════════════════════ */
/* HELPERS                                 */
/* ═══════════════════════════════════════ */

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Music; color: string; bg: string }> = {
  marketplace_beat: { label: 'Биты', icon: Music, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  marketplace_service: { label: 'Услуги', icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  marketplace_digital: { label: 'Товары', icon: Package, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  dj_booking: { label: 'DJ-букинг', icon: Headphones, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  radio_venue: { label: 'Радио-реклама', icon: Radio, color: 'text-green-400', bg: 'bg-green-500/10' },
  track_test: { label: 'Тест трека', icon: FlaskConical, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  subscription: { label: 'Подписки', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  donation: { label: 'Донаты', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  // Fallback для обратной совместимости (старые маркетплейс-записи)
  beat: { label: 'Бит', icon: Music, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  service: { label: 'Услуга', icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  digital_good: { label: 'Товар', icon: Package, color: 'text-pink-400', bg: 'bg-pink-500/10' },
};

/* ═══════════════════════════════════════ */
/* MAIN COMPONENT                          */
/* ═══════════════════════════════════════ */

export function MarketplaceAdmin() {
  const [stats, setStats] = useState<MarketplaceAdminStats | null>(null);
  const [transactions, setTransactions] = useState<MarketplaceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsResult, txResult] = await Promise.all([
        fetchMarketplaceAdminStats(),
        fetchMarketplaceAdminTransactions(typeFilter || undefined),
      ]);
      setStats(statsResult);
      setTransactions(txResult.transactions);
    } catch (err) {
      console.error('MarketplaceAdmin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [typeFilter]);

  const sortedTx = [...transactions].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return sortDesc ? tb - ta : ta - tb;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-white">Доходы платформы</h2>
          <p className="text-sm text-gray-500">Все сделки, комиссии и каналы монетизации</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-400 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </motion.button>
      </div>

      {/* Stats cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-20 mb-2" />
              <div className="h-7 bg-white/5 rounded w-28" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Store}
            label="Оборот"
            value={`${formatPrice(stats.totalRevenue)} ₽`}
            color="text-white"
            bg="bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border-indigo-500/20"
          />
          <StatCard
            icon={Percent}
            label="Комиссия (10%)"
            value={`${formatPrice(stats.totalCommission)} ₽`}
            color="text-emerald-400"
            bg="bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-500/20"
          />
          <StatCard
            icon={Wallet}
            label="Баланс платформы"
            value={`${formatPrice(stats.platformBalance)} ₽`}
            color="text-amber-400"
            bg="bg-gradient-to-br from-amber-500/15 to-orange-500/15 border-amber-500/20"
          />
          <StatCard
            icon={ShoppingCart}
            label="Сделки"
            value={String(stats.totalTransactions)}
            color="text-purple-400"
            bg="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border-purple-500/20"
          />
        </div>
      ) : null}

      {/* Breakdown by type */}
      {stats && stats.byType.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stats.byType.map(item => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.beat;
            const Icon = conf.icon;
            return (
              <div key={item.type} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${conf.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
                  </div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-black text-white">{formatPrice(item.revenue)} ₽</p>
                    <p className="text-[10px] text-gray-500">{item.count} сделок</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{formatPrice(item.commission)} ₽</p>
                    <p className="text-[10px] text-gray-500">комиссия</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters + table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b border-white/10 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          {['', 'marketplace_beat', 'marketplace_service', 'marketplace_digital', 'dj_booking', 'track_test', 'radio_venue'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                typeFilter === t
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
              }`}
            >
              {t === '' ? 'Все' : TYPE_CONFIG[t]?.label || t}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white transition-all"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortDesc ? 'Новые' : 'Старые'}
          </button>
        </div>

        {/* Transactions */}
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : sortedTx.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="w-10 h-10 mx-auto mb-3 text-gray-700" />
            <p className="text-sm font-bold text-gray-500">Сделок пока нет</p>
            <p className="text-xs text-gray-600 mt-1">Совершите покупку на маркетплейсе</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedTx.map(tx => {
              const conf = TYPE_CONFIG[tx.type] || TYPE_CONFIG.beat;
              const Icon = conf.icon;
              const isExpanded = expandedTx === tx.id;

              return (
                <div key={tx.id}>
                  <button
                    onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${conf.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${conf.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{tx.itemTitle}</p>
                      <p className="text-[10px] text-gray-500">
                        {tx.producerName} → {tx.buyerName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{formatPrice(tx.totalPrice)} ₽</p>
                      <p className="text-[10px] text-emerald-400">+{formatPrice(tx.commission)} ₽</p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-[10px] text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <DetailCell label="Тип" value={conf.label} />
                          <DetailCell label="Сумма" value={`${formatPrice(tx.totalPrice)} ₽`} />
                          <DetailCell label="Комиссия" value={`${formatPrice(tx.commission)} ₽`} accent />
                          <DetailCell label="Выплата" value={`${formatPrice(tx.producerPayout)} ₽`} />
                          <DetailCell label="Продавец" value={tx.producerName} />
                          <DetailCell label="Покупатель" value={tx.buyerName} />
                          <DetailCell label="Дата" value={formatDate(tx.createdAt)} />
                          <DetailCell label="Статус" value={tx.status === 'completed' ? 'Завершена' : tx.status} />
                          {tx.orderId && <DetailCell label="Заказ" value={tx.orderId.slice(0, 16)} />}
                          {tx.contractId && <DetailCell label="Контракт" value={tx.contractId.slice(0, 16)} />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* SUB-COMPONENTS                          */
/* ═══════════════════════════════════════ */

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${bg}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </motion.div>
  );
}

function DetailCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 bg-white/[0.03] rounded-lg">
      <p className="text-[9px] text-gray-600 mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${accent ? 'text-emerald-400' : 'text-white'} truncate`}>{value}</p>
    </div>
  );
}