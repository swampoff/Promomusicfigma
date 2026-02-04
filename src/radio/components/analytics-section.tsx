/**
 * ANALYTICS SECTION - Аналитика радиостанции
 * Детальная статистика заявок, финансов, контента и производительности
 * 
 * Функционал:
 * - Общая сводка (KPI cards)
 * - Графики доходов и заявок
 * - Финансовая аналитика с разбивкой
 * - Статистика по артистам и заведениям
 * - Почасовая аналитика контента
 * - Рейтинги и производительность
 * - Экспорт отчетов
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Music, Building2,
  Calendar, Clock, Award, Target, BarChart3, PieChart, LineChart,
  Download, Filter, RefreshCw, Eye, Star, Zap, AlertCircle,
  CheckCircle, XCircle, Activity, Globe, MapPin, Radio
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  Line, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { AnalyticsExportModal } from '@/components/analytics-export-modal';
import { exportRadioAnalytics } from '@/utils/analytics-export';

type TimePeriod = 'today' | 'week' | 'month' | 'year';
type ChartType = 'revenue' | 'requests' | 'listeners' | 'content';

export function AnalyticsSection() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [activeChart, setActiveChart] = useState<ChartType>('revenue');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Mock данные - в реальности будут из API
  const stats = {
    // Финансы
    revenue: {
      total: 125000,
      growth: 24.5,
      station: 106250,  // 85%
      platform: 18750,  // 15%
      trend: 'up' as const
    },
    // Заявки
    requests: {
      total: 48,
      pending: 12,
      approved: 32,
      rejected: 4,
      approvalRate: 88.9,
      avgModerationTime: 45 // минуты
    },
    // Аудитория
    listeners: {
      total: 145000,
      growth: 18.2,
      unique: 42000,
      avgSessionTime: 1850, // секунды
      peakListeners: 3200
    },
    // Контент
    content: {
      totalPlays: 1250,
      artistPlays: 820,
      venuePlays: 430,
      impressions: 385000,
      engagementRate: 76.5
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Аналитика 📊
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Полная статистика работы радиостанции
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Period Selector */}
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <PeriodButton
              label="Сегодня"
              active={timePeriod === 'today'}
              onClick={() => setTimePeriod('today')}
            />
            <PeriodButton
              label="Неделя"
              active={timePeriod === 'week'}
              onClick={() => setTimePeriod('week')}
            />
            <PeriodButton
              label="Месяц"
              active={timePeriod === 'month'}
              onClick={() => setTimePeriod('month')}
            />
            <PeriodButton
              label="Год"
              active={timePeriod === 'year'}
              onClick={() => setTimePeriod('year')}
            />
          </div>

          {/* Action Buttons */}
          <button className="p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-sm sm:text-base" onClick={() => setIsExportModalOpen(true)}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Экспорт</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          label="Доход"
          value={`₽${stats.revenue.total.toLocaleString()}`}
          growth={stats.revenue.growth}
          trend={stats.revenue.trend}
          icon={DollarSign}
          color="green"
          subtitle={`Ваша доля: ₽${stats.revenue.station.toLocaleString()}`}
        />
        <KPICard
          label="Заявки"
          value={stats.requests.total}
          growth={12.3}
          trend="up"
          icon={Music}
          color="blue"
          subtitle={`${stats.requests.approved} одобрено`}
        />
        <KPICard
          label="Слушатели"
          value={`${(stats.listeners.total / 1000).toFixed(0)}K`}
          growth={stats.listeners.growth}
          trend="up"
          icon={Users}
          color="purple"
          subtitle={`${stats.listeners.unique.toLocaleString()} уникальных`}
        />
        <KPICard
          label="Вовлеченность"
          value={`${stats.content.engagementRate}%`}
          growth={5.2}
          trend="up"
          icon={Activity}
          color="amber"
          subtitle={`${stats.content.totalPlays} проигрываний`}
        />
      </div>

      {/* Chart Selector */}
      <div className="flex flex-wrap gap-2">
        <ChartButton
          label="Доход"
          icon={DollarSign}
          active={activeChart === 'revenue'}
          onClick={() => setActiveChart('revenue')}
        />
        <ChartButton
          label="Заявки"
          icon={BarChart3}
          active={activeChart === 'requests'}
          onClick={() => setActiveChart('requests')}
        />
        <ChartButton
          label="Аудитория"
          icon={Users}
          active={activeChart === 'listeners'}
          onClick={() => setActiveChart('listeners')}
        />
        <ChartButton
          label="Контент"
          icon={PieChart}
          active={activeChart === 'content'}
          onClick={() => setActiveChart('content')}
        />
      </div>

      {/* Main Chart */}
      <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
        {activeChart === 'revenue' && <RevenueChart period={timePeriod} />}
        {activeChart === 'requests' && <RequestsChart period={timePeriod} />}
        {activeChart === 'listeners' && <ListenersChart period={timePeriod} />}
        {activeChart === 'content' && <ContentChart />}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Financial Breakdown */}
        <DetailedFinancialCard stats={stats} />

        {/* Requests Breakdown */}
        <RequestsBreakdownCard stats={stats} />

        {/* Top Performance */}
        <TopPerformanceCard />

        {/* Recent Activity */}
        <RecentActivityCard />
      </div>

      {/* Hourly Content Analytics */}
      <HourlyContentCard />

      {/* Export Modal */}
      <AnalyticsExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={(format) => {
          exportRadioAnalytics(format, {
            period: getPeriodLabel(timePeriod),
            stats: stats,
            campaigns: [
              { name: 'DJ Alexey', type: 'Артист', revenue: '₽25,000', plays: 180, roi: '245%' },
              { name: 'Sunset Lounge', type: 'Заведение', revenue: '₽15,000', plays: 70, roi: '228%' }
            ]
          });
        }}
        type="radio"
      />
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface KPICardProps {
  label: string;
  value: string | number;
  growth: number;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: 'green' | 'blue' | 'purple' | 'amber';
  subtitle?: string;
}

function KPICard({ label, value, growth, trend, icon: Icon, color, subtitle }: KPICardProps) {
  const colorClasses = {
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 sm:p-5 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
        <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
          {growth > 0 ? '+' : ''}{growth}%
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs sm:text-sm opacity-80 mb-1">{label}</p>
      {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
    </motion.div>
  );
}

interface PeriodButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function PeriodButton({ label, active, onClick }: PeriodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
        active
          ? 'bg-indigo-500 text-white'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

interface ChartButtonProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}

function ChartButton({ label, icon: Icon, active, onClick }: ChartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
        active
          ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Revenue Chart
function RevenueChart({ period }: { period: TimePeriod }) {
  const data = period === 'week' ? [
    { name: 'Пн', revenue: 15000, payout: 12750, fee: 2250 },
    { name: 'Вт', revenue: 18000, payout: 15300, fee: 2700 },
    { name: 'Ср', revenue: 22000, payout: 18700, fee: 3300 },
    { name: 'Чт', revenue: 19000, payout: 16150, fee: 2850 },
    { name: 'Пт', revenue: 25000, payout: 21250, fee: 3750 },
    { name: 'Сб', revenue: 28000, payout: 23800, fee: 4200 },
    { name: 'Вс', revenue: 24000, payout: 20400, fee: 3600 },
  ] : [
    { name: 'Янв', revenue: 85000, payout: 72250, fee: 12750 },
    { name: 'Фев', revenue: 92000, payout: 78200, fee: 13800 },
    { name: 'Мар', revenue: 105000, payout: 89250, fee: 15750 },
    { name: 'Апр', revenue: 98000, payout: 83300, fee: 14700 },
    { name: 'Май', revenue: 112000, payout: 95200, fee: 16800 },
    { name: 'Июн', revenue: 125000, payout: 106250, fee: 18750 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График доходов</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Общий доход"
          />
          <Line type="monotone" dataKey="payout" stroke="#10b981" name="Ваша доля (85%)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Requests Chart
function RequestsChart({ period }: { period: TimePeriod }) {
  const data = period === 'week' ? [
    { name: 'Пн', artist: 5, venue: 3, approved: 6, rejected: 2 },
    { name: 'Вт', artist: 7, venue: 4, approved: 9, rejected: 2 },
    { name: 'Ср', artist: 6, venue: 5, approved: 8, rejected: 3 },
    { name: 'Чт', artist: 8, venue: 3, approved: 9, rejected: 2 },
    { name: 'Пт', artist: 9, venue: 6, approved: 12, rejected: 3 },
    { name: 'Сб', artist: 7, venue: 4, approved: 9, rejected: 2 },
    { name: 'Вс', artist: 6, venue: 3, approved: 7, rejected: 2 },
  ] : [
    { name: 'Янв', artist: 120, venue: 45, approved: 140, rejected: 25 },
    { name: 'Фев', artist: 135, venue: 52, approved: 158, rejected: 29 },
    { name: 'Мар', artist: 145, venue: 58, approved: 172, rejected: 31 },
    { name: 'Апр', artist: 138, venue: 55, approved: 165, rejected: 28 },
    { name: 'Май', artist: 152, venue: 62, approved: 182, rejected: 32 },
    { name: 'Июн', artist: 165, venue: 68, approved: 198, rejected: 35 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График заявок</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBar data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Bar dataKey="artist" fill="#6366f1" name="Артисты" />
          <Bar dataKey="venue" fill="#8b5cf6" name="Заведения" />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}

// Listeners Chart
function ListenersChart({ period }: { period: TimePeriod }) {
  const data = period === 'week' ? [
    { name: 'Пн', listeners: 18000, unique: 5200 },
    { name: 'Вт', listeners: 19500, unique: 5600 },
    { name: 'Ср', listeners: 21000, unique: 6100 },
    { name: 'Чт', listeners: 20500, unique: 5900 },
    { name: 'Пт', listeners: 24000, unique: 6800 },
    { name: 'Сб', listeners: 26000, unique: 7200 },
    { name: 'Вс', listeners: 22000, unique: 6300 },
  ] : [
    { name: 'Янв', listeners: 95000, unique: 28000 },
    { name: 'Фев', listeners: 102000, unique: 31000 },
    { name: 'Мар', listeners: 115000, unique: 35000 },
    { name: 'Апр', listeners: 108000, unique: 33000 },
    { name: 'Май', listeners: 125000, unique: 38000 },
    { name: 'Июн', listeners: 145000, unique: 42000 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График аудитории</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLine data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="listeners" stroke="#8b5cf6" strokeWidth={2} name="Всего слушателей" />
          <Line type="monotone" dataKey="unique" stroke="#06b6d4" strokeWidth={2} name="Уникальные" />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}

// Content Chart (Pie)
function ContentChart() {
  const data = [
    { name: 'Артисты', value: 820, color: '#6366f1' },
    { name: 'Заведения', value: 430, color: '#8b5cf6' },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Распределение контента</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <ResponsiveContainer width="100%" height={250}>
          <RechartsPie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPie>
        </ResponsiveContainer>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
            <div>
              <p className="text-white font-medium">Артисты</p>
              <p className="text-sm text-slate-400">820 проигрываний (65.6%)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <div>
              <p className="text-white font-medium">Заведения</p>
              <p className="text-sm text-slate-400">430 проигрываний (34.4%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detailed Financial Card
function DetailedFinancialCard({ stats }: any) {
  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-400" />
        Детальная финансовая статистика
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm sm:text-base">Общий доход</span>
          <span className="text-white font-bold text-base sm:text-lg">₽{stats.revenue.total.toLocaleString()}</span>
        </div>
        <div className="h-px bg-white/10"></div>
        
        <div className="flex items-center justify-between">
          <span className="text-green-300 text-sm sm:text-base">Ваша доля (85%)</span>
          <span className="text-green-300 font-bold text-base sm:text-lg">₽{stats.revenue.station.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Комиссия платформы (15%)</span>
          <span className="text-slate-400 font-medium text-sm">₽{stats.revenue.platform.toLocaleString()}</span>
        </div>
        
        <div className="h-px bg-white/10"></div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-slate-400 mb-1">От артистов</p>
            <p className="text-white font-bold">₽85,000</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-slate-400 mb-1">От заведений</p>
            <p className="text-white font-bold">₽40,000</p>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium text-sm">Рост +{stats.revenue.growth}%</span>
          </div>
          <p className="text-xs text-green-200/60">По сравнению с прошлым периодом</p>
        </div>
      </div>
    </div>
  );
}

// Requests Breakdown Card
function RequestsBreakdownCard({ stats }: any) {
  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        Статистика заявок
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-300 mb-1">На модерации</p>
            <p className="text-2xl font-bold text-white">{stats.requests.pending}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-xs text-green-300 mb-1">Одобрено</p>
            <p className="text-2xl font-bold text-white">{stats.requests.approved}</p>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Процент одобрения</span>
            <span className="text-green-400 font-bold">{stats.requests.approvalRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: `${stats.requests.approvalRate}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 text-sm">Среднее время модерации</span>
          </div>
          <span className="text-white font-bold">{stats.requests.avgModerationTime} мин</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-blue-500/10 text-blue-300 text-center">
            <Music className="w-4 h-4 mx-auto mb-1" />
            32 артиста
          </div>
          <div className="p-2 rounded bg-purple-500/10 text-purple-300 text-center">
            <Building2 className="w-4 h-4 mx-auto mb-1" />
            16 заведений
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Performance Card
function TopPerformanceCard() {
  const topClients = [
    { name: 'DJ Alexey', type: 'artist', revenue: 25000, plays: 180, rating: 4.9 },
    { name: 'Sunset Lounge Bar', type: 'venue', revenue: 15000, plays: 70, rating: 4.8 },
    { name: 'Urban Club Moscow', type: 'venue', revenue: 35000, plays: 35, rating: 4.5 },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" />
        Топ клиентов
      </h3>
      
      <div className="space-y-3">
        {topClients.map((client, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {client.type === 'artist' ? <Music className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{client.name}</p>
              <p className="text-xs text-slate-400">{client.plays} проигрываний</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-indigo-400 font-bold text-sm">₽{client.revenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                {client.rating}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Activity Card
function RecentActivityCard() {
  const activities = [
    { type: 'approved', text: 'Одобрена заявка от DJ Alexey', time: '5 мин назад', icon: CheckCircle, color: 'text-green-400' },
    { type: 'new', text: 'Новая заявка от Jazz Corner Cafe', time: '15 мин назад', icon: AlertCircle, color: 'text-amber-400' },
    { type: 'completed', text: 'Завершена кампания Italiano Trattoria', time: '1 час назад', icon: Award, color: 'text-purple-400' },
    { type: 'rejected', text: 'Отклонена заявка из-за качества аудио', time: '2 часа назад', icon: XCircle, color: 'text-red-400' },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        Последняя активность
      </h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <activity.icon className={`w-5 h-5 ${activity.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">{activity.text}</p>
              <p className="text-xs text-slate-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hourly Content Card
function HourlyContentCard() {
  const hourlyData = [
    { hour: '00:00', plays: 45, listeners: 850 },
    { hour: '04:00', plays: 22, listeners: 420 },
    { hour: '08:00', plays: 78, listeners: 1580 },
    { hour: '12:00', plays: 105, listeners: 2200 },
    { hour: '16:00', plays: 92, listeners: 1920 },
    { hour: '20:00', plays: 128, listeners: 3200 },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-purple-400" />
        Почасовая аналитика
      </h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <RechartsLine data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="hour" stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="plays" stroke="#8b5cf6" strokeWidth={2} name="Проигрывания" />
          <Line type="monotone" dataKey="listeners" stroke="#06b6d4" strokeWidth={2} name="Слушатели" />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}

// Helper function to get period label
function getPeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'today':
      return 'Сегодня';
    case 'week':
      return 'Неделя';
    case 'month':
      return 'Месяц';
    case 'year':
      return 'Год';
    default:
      return 'Неделя';
  }
}