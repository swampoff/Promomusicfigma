/**
 * PRODUCER ANALYTICS TAB
 * Графики доходов, популярных услуг, статистика по клиентам
 * Использует recharts для визуализации
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Banknote, BarChart3,
  Calendar, ArrowUpRight, Star, Eye, Repeat,
} from 'lucide-react';
import type { ProducerOrder, ProducerService, ProducerReview } from '@/utils/api/landing-data';

interface ProducerAnalyticsProps {
  orders: ProducerOrder[];
  services: ProducerService[];
  reviews: ProducerReview[];
  isLoading: boolean;
}

function formatPrice(val: number): string {
  return val.toLocaleString('ru-RU');
}

// ─── Custom Tooltip ───
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#12122a]/95 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {formatPrice(p.value)} P
        </p>
      ))}
    </div>
  );
}

export function ProducerAnalytics({ orders, services, reviews, isLoading }: ProducerAnalyticsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Generate monthly income data from real orders
  const incomeData = useMemo(() => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const commissionRate = 0.1;
    const monthMap: Record<number, number> = {};
    orders.forEach(o => {
      if (!o.deadline) return;
      const d = new Date(o.deadline);
      const m = d.getMonth();
      if (o.status === 'completed' || o.status === 'review') {
        monthMap[m] = (monthMap[m] || 0) + o.price;
      }
    });
    return months.map((m, i) => {
      const income = monthMap[i] || 0;
      return {
        name: m,
        income,
        commission: Math.round(income * commissionRate),
        net: Math.round(income * (1 - commissionRate)),
      };
    });
  }, [orders]);

  // Service breakdown pie chart
  const SERVICE_LABELS: Record<string, string> = {
    mixing: 'Сведение',
    mastering: 'Мастеринг',
    arrangement: 'Аранжировка',
    vocal_recording: 'Запись вокала',
    ghost_production: 'Гост-продакшн',
    beatmaking: 'Битмейкинг',
    sound_design: 'Саунд-дизайн',
    consultation: 'Консультация',
  };

  const serviceBreakdown = useMemo(() => {
    const countMap: Record<string, number> = {};
    orders.forEach(o => {
      const type = o.serviceType || 'mixing';
      countMap[type] = (countMap[type] || 0) + 1;
    });
    // If no orders, use service types
    if (Object.keys(countMap).length === 0) {
      services.forEach(s => {
        countMap[s.type] = (countMap[s.type] || 0) + (s.orders || 1);
      });
    }
    return Object.entries(countMap).map(([type, count]) => ({
      name: SERVICE_LABELS[type] || type,
      value: count,
    }));
  }, [orders, services]);

  const PIE_COLORS = ['#14b8a6', '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const statusMap: Record<string, number> = {
      pending: 0, in_progress: 0, review: 0, revision: 0, completed: 0, cancelled: 0,
    };
    orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
    return [
      { name: 'Ожидание', value: statusMap.pending, color: '#3b82f6' },
      { name: 'В работе', value: statusMap.in_progress, color: '#14b8a6' },
      { name: 'На проверке', value: statusMap.review, color: '#f59e0b' },
      { name: 'Правки', value: statusMap.revision, color: '#f97316' },
      { name: 'Готово', value: statusMap.completed, color: '#10b981' },
      { name: 'Отменён', value: statusMap.cancelled, color: '#ef4444' },
    ].filter(s => s.value > 0);
  }, [orders]);

  // Weekly orders chart — computed from real orders by day of week
  const weeklyData = useMemo(() => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const dayMap: Record<number, number> = {};
    orders.forEach(o => {
      if (!o.deadline) return;
      const d = new Date(o.deadline).getDay();
      const dow = d === 0 ? 6 : d - 1; // Convert Sunday=0 to Monday-first
      dayMap[dow] = (dayMap[dow] || 0) + 1;
    });
    return days.map((d, i) => ({
      name: d,
      orders: dayMap[i] || 0,
      views: 0,
    }));
  }, [orders]);

  // KPIs
  const totalRevenue = incomeData.reduce((s, d) => s + d.income, 0);
  const avgOrderValue = orders.length > 0
    ? Math.round(orders.reduce((s, o) => s + o.price, 0) / orders.length)
    : 0;
  const completionRate = orders.length > 0
    ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)
    : 0;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '-';
  // Compute unique and repeat clients from orders
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>();
    orders.forEach(o => { if (o.client) clients.add(o.client); });
    return clients.size;
  }, [orders]);
  const repeatClients = useMemo(() => {
    const clientCounts: Record<string, number> = {};
    orders.forEach(o => { if (o.client) clientCounts[o.client] = (clientCounts[o.client] || 0) + 1; });
    const total = Object.keys(clientCounts).length;
    if (total === 0) return 0;
    const repeat = Object.values(clientCounts).filter(c => c > 1).length;
    return Math.round((repeat / total) * 100);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-4 xs:space-y-5 sm:space-y-6">
        <h2 className="text-lg xs:text-xl font-bold text-white">Аналитика</h2>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/5 p-5 h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 xs:gap-3">
        <h2 className="text-lg xs:text-xl font-bold text-white">Аналитика</h2>
        <div className="flex gap-1.5 bg-white/5 rounded-xl p-1 border border-white/10">
          {([
            { id: 'week', label: 'Неделя' },
            { id: 'month', label: 'Месяц' },
            { id: 'quarter', label: 'Квартал' },
            { id: 'year', label: 'Год' },
          ] as const).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p.id
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Годовой доход', value: `${formatPrice(totalRevenue)} P`, icon: Banknote, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', trend: '0', up: true },
          { label: 'Средний чек', value: `${formatPrice(avgOrderValue)} P`, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', trend: '0', up: true },
          { label: 'Завершение', value: `${completionRate}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', trend: '0', up: true },
          { label: 'Рейтинг', value: String(avgRating), icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', trend: '0', up: true },
          { label: 'Повторные', value: `${repeatClients}%`, icon: Repeat, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', trend: '0', up: true },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`p-4 rounded-2xl border ${kpi.bg} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              {kpi.trend !== '0' && (
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {kpi.trend}
                </span>
              )}
            </div>
            <p className="text-lg sm:text-xl font-black text-white">{kpi.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Income Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Динамика доходов</h3>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400" /> Доход</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Чистый</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Комиссия</span>
          </div>
        </div>
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={incomeData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Доход" stroke="#14b8a6" fill="url(#gradIncome)" strokeWidth={2} />
              <Area type="monotone" dataKey="net" name="Чистый" stroke="#10b981" fill="url(#gradNet)" strokeWidth={1.5} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="commission" name="Комиссия" stroke="#f59e0b" fill="none" strokeWidth={1} strokeDasharray="2 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two-column: Service Breakdown + Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Service Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-base font-bold text-white mb-4">Популярные услуги</h3>
          {serviceBreakdown.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(18,18,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value: string) => <span className="text-gray-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-8">Нет данных об услугах</p>
          )}
        </motion.div>

        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-base font-bold text-white mb-4">Заказы по статусам</h3>
          {ordersByStatus.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(18,18,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value} шт.`, 'Заказов']}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-8">Нет заказов для анализа</p>
          )}
        </motion.div>
      </div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Активность за неделю</h3>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400" /> Заказы</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Просмотры</span>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Заказы" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="views" name="Просмотры" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Client Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-500/20 rounded-2xl p-5"
      >
        <h3 className="text-base font-bold text-white mb-4">Показатели</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Уникальных клиентов', value: String(uniqueClients), icon: Users, color: 'text-teal-400' },
            { label: 'Всего заказов', value: String(orders.length), icon: Eye, color: 'text-blue-400' },
            { label: 'Завершённых', value: String(orders.filter(o => o.status === 'completed').length), icon: Calendar, color: 'text-amber-400' },
            { label: 'Повторных клиентов', value: `${repeatClients}%`, icon: ArrowUpRight, color: 'text-emerald-400' },
          ].map((item, i) => (
            <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <item.icon className={`w-4 h-4 ${item.color} mb-2`} />
              <p className="text-lg font-black text-white">{item.value}</p>
              <p className="text-[10px] text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}