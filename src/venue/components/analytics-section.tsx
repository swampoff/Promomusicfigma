/**
 * VENUE ANALYTICS SECTION - Аналитика заведения
 * Детальная статистика рекламных кампаний, эффективности и ROI
 * 
 * Функционал:
 * - Общая сводка (KPI cards)
 * - Графики затрат и охватов
 * - Сравнение радиостанций
 * - Эффективность кампаний
 * - ROI и конверсии
 * - Рекомендации
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Radio, Target,
  Calendar, Clock, Award, BarChart3, PieChart, LineChart,
  Download, RefreshCw, Eye, Star, Zap, AlertCircle,
  CheckCircle, Activity, MapPin, Play, TrendingDown as Decrease
} from 'lucide-react';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Line, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

import { fetchAnalyticsOverview, fetchCampaigns, fetchSpendingHistory, fetchROIData, fetchRadioCompare } from '@/utils/api/venue-cabinet';
import type { VenueCampaign } from '@/utils/api/venue-cabinet';

type TimePeriod = 'today' | 'week' | 'month' | 'year';
type ChartType = 'spending' | 'campaigns' | 'reach' | 'roi';

export function AnalyticsSection() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [activeChart, setActiveChart] = useState<ChartType>('spending');

  // Defaults with API override
  const [stats, setStats] = useState({
    spending: { total: 0, growth: 0, thisMonth: 0, lastMonth: 0, trend: 'down' as const },
    campaigns: { active: 0, total: 0, completed: 0, successRate: 0, avgDuration: 14 },
    reach: { totalImpressions: 0, uniqueListeners: 0, growth: 0, avgPerCampaign: 53125 },
    performance: { avgROI: 0, completionRate: 0, engagementRate: 0, conversionRate: 0 },
  });

  // Load from API on mount
  useEffect(() => {
    fetchAnalyticsOverview(timePeriod).then((data) => {
      if (data) {
        setStats({
          spending: {
            total: data.spending?.total || 85000,
            growth: data.spending?.growth || -5.2,
            thisMonth: data.spending?.thisMonth || 85000,
            lastMonth: 0,
            trend: (data.spending?.growth || 0) < 0 ? 'down' : 'up',
          },
          campaigns: {
            active: data.campaigns?.active || 3,
            total: data.campaigns?.total || 8,
            completed: data.campaigns?.completed || 5,
            successRate: data.campaigns?.successRate || 87.5,
            avgDuration: 14,
          },
          reach: {
            totalImpressions: data.reach?.totalImpressions || 425000,
            uniqueListeners: data.reach?.uniqueListeners || 58000,
            growth: data.reach?.growth || 32.5,
            avgPerCampaign: data.reach?.avgPerCampaign || 53125,
          },
          performance: {
            avgROI: data.performance?.avgROI || 245,
            completionRate: 0,
            engagementRate: data.performance?.engagementRate || 82.3,
            conversionRate: data.performance?.conversionRate || 4.2,
          },
        });
      }
    }).catch(console.error);
  }, [timePeriod]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4">
        <div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
            Аналитика 📊
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-slate-400">
            Эффективность рекламных кампаний и ROI
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 sm:gap-3">
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
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all text-sm sm:text-base">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Отчет</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        <KPICard
          label="Затраты"
          value={`₽${stats.spending.total.toLocaleString()}`}
          growth={stats.spending.growth}
          trend={stats.spending.trend}
          icon={DollarSign}
          color="blue"
          subtitle="на рекламу"
          invertTrend={true}
        />
        <KPICard
          label="Кампании"
          value={stats.campaigns.active}
          growth={12.5}
          trend="up"
          icon={Radio}
          color="purple"
          subtitle={`${stats.campaigns.total} всего`}
        />
        <KPICard
          label="Охват"
          value={`${(stats.reach.totalImpressions / 1000).toFixed(0)}K`}
          growth={stats.reach.growth}
          trend="up"
          icon={Users}
          color="green"
          subtitle={`${stats.reach.uniqueListeners.toLocaleString()} уникальных`}
        />
        <KPICard
          label="ROI"
          value={`${stats.performance.avgROI}%`}
          growth={18.5}
          trend="up"
          icon={TrendingUp}
          color="amber"
          subtitle="средний возврат"
        />
      </div>

      {/* Chart Selector */}
      <div className="flex flex-wrap gap-2">
        <ChartButton
          label="Затраты"
          icon={DollarSign}
          active={activeChart === 'spending'}
          onClick={() => setActiveChart('spending')}
        />
        <ChartButton
          label="Кампании"
          icon={BarChart3}
          active={activeChart === 'campaigns'}
          onClick={() => setActiveChart('campaigns')}
        />
        <ChartButton
          label="Охват"
          icon={Users}
          active={activeChart === 'reach'}
          onClick={() => setActiveChart('reach')}
        />
        <ChartButton
          label="ROI"
          icon={TrendingUp}
          active={activeChart === 'roi'}
          onClick={() => setActiveChart('roi')}
        />
      </div>

      {/* Main Chart */}
      <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
        {activeChart === 'spending' && <SpendingChart period={timePeriod} />}
        {activeChart === 'campaigns' && <CampaignsChart period={timePeriod} />}
        {activeChart === 'reach' && <ReachChart period={timePeriod} />}
        {activeChart === 'roi' && <ROIChart period={timePeriod} />}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Campaigns */}
        <ActiveCampaignsCard />

        {/* Radio Stations Comparison */}
        <RadioStationsCard />

        {/* Performance Metrics */}
        <PerformanceMetricsCard stats={stats} />

        {/* Recommendations */}
        <RecommendationsCard />
      </div>

      {/* ROI Breakdown */}
      <ROIBreakdownCard />
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
  invertTrend?: boolean; // Для затрат - снижение это хорошо
}

function KPICard({ label, value, growth, trend, icon: Icon, color, subtitle, invertTrend = false }: KPICardProps) {
  const colorClasses = {
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  const isGoodTrend = invertTrend ? trend === 'down' : trend === 'up';
  const trendColor = isGoodTrend ? 'text-green-400' : 'text-red-400';
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 sm:p-5 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
        <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${trendColor}`}>
          <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          {Math.abs(growth)}%
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

// Spending Chart
function SpendingChart({ period }: { period: TimePeriod }) {
  const data = period === 'month' ? [
    { name: 'Нед 1', spending: 18000, budget: 25000 },
    { name: 'Нед 2', spending: 22000, budget: 25000 },
    { name: 'Нед 3', spending: 25000, budget: 25000 },
    { name: 'Нед 4', spending: 20000, budget: 25000 },
  ] : [
    { name: 'Янв', spending: 65000, budget: 80000 },
    { name: 'Фев', spending: 72000, budget: 80000 },
    { name: 'Мар', spending: 78000, budget: 80000 },
    { name: 'Апр', spending: 75000, budget: 80000 },
    { name: 'Май', spending: 82000, budget: 80000 },
    { name: 'Июн', spending: 85000, budget: 80000 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График затрат на рекламу</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="spending"
            stroke="#6366f1"
            fillOpacity={1}
            fill="url(#colorSpending)"
            name="Затраты"
          />
          <Line type="monotone" dataKey="budget" stroke="#f59e0b" strokeDasharray="5 5" name="Бюджет" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Campaigns Chart
function CampaignsChart({ period }: { period: TimePeriod }) {
  const data = period === 'month' ? [
    { name: 'Нед 1', active: 2, completed: 1 },
    { name: 'Нед 2', active: 0, completed: 2 },
    { name: 'Нед 3', active: 0, completed: 1 },
    { name: 'Нед 4', active: 0, completed: 2 },
  ] : [
    { name: 'Янв', active: 5, completed: 3 },
    { name: 'Фев', active: 6, completed: 4 },
    { name: 'Мар', active: 7, completed: 0 },
    { name: 'Апр', active: 6, completed: 4 },
    { name: 'Май', active: 7, completed: 6 },
    { name: 'Июн', active: 8, completed: 0 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График кампаний</h3>
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
          <Bar dataKey="active" fill="#8b5cf6" name="Активные" />
          <Bar dataKey="completed" fill="#10b981" name="Завершенные" />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}

// Reach Chart
function ReachChart({ period }: { period: TimePeriod }) {
  const data = period === 'month' ? [
    { name: 'Нед 1', impressions: 85000, unique: 12000 },
    { name: 'Нед 2', impressions: 105000, unique: 15000 },
    { name: 'Нед 3', impressions: 115000, unique: 16500 },
    { name: 'Нед 4', impressions: 120000, unique: 14500 },
  ] : [
    { name: 'Янв', impressions: 285000, unique: 38000 },
    { name: 'Фев', impressions: 315000, unique: 42000 },
    { name: 'Мар', impressions: 355000, unique: 48000 },
    { name: 'Апр', impressions: 340000, unique: 45000 },
    { name: 'Май', impressions: 385000, unique: 52000 },
    { name: 'Июн', impressions: 425000, unique: 58000 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График охватов</h3>
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
          <Line type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={2} name="Показы" />
          <Line type="monotone" dataKey="unique" stroke="#06b6d4" strokeWidth={2} name="Уникальные" />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}

// ROI Chart
function ROIChart({ period }: { period: TimePeriod }) {
  const data = period === 'month' ? [
    { name: 'Нед 1', roi: 220, target: 200 },
    { name: 'Нед 2', roi: 235, target: 200 },
    { name: 'Нед 3', roi: 250, target: 200 },
    { name: 'Нед 4', roi: 245, target: 200 },
  ] : [
    { name: 'Янв', roi: 185, target: 200 },
    { name: 'Фев', roi: 205, target: 200 },
    { name: 'Мар', roi: 225, target: 200 },
    { name: 'Апр', roi: 215, target: 200 },
    { name: 'Май', roi: 240, target: 200 },
    { name: 'Июн', roi: 245, target: 200 },
  ];

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">График ROI (%)</h3>
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
          <Line type="monotone" dataKey="roi" stroke="#f59e0b" strokeWidth={3} name="ROI" />
          <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Целевой ROI" />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}

// Active Campaigns Card
function ActiveCampaignsCard() {
  const [campaigns, setCampaigns] = useState<any[]>([
    { id: 1, station: 'PROMO.FM Radio', package: '15sec', plays: 85, target: 120, roi: 245, status: 'active' },
    { id: 2, station: 'Rock Wave 101.3', package: '10sec', plays: 110, target: 150, roi: 228, status: 'active' },
    { id: 3, station: 'Jazz Club FM', package: '5sec', plays: 45, target: 60, roi: 215, status: 'active' },
  ]);

  useEffect(() => {
    fetchCampaigns().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.filter((c: VenueCampaign) => c.status === 'active').slice(0, 5).map((c: VenueCampaign, i: number) => ({
          id: c.id || i + 1,
          station: c.radioStation || c.name,
          package: '15sec',
          plays: Math.round(c.impressions / 1000) || 85,
          target: 120,
          roi: Math.round((c.impressions / Math.max(c.totalSpent, 1)) * 100) || 200,
          status: c.status,
        }));
        if (mapped.length > 0) setCampaigns(mapped);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Radio className="w-5 h-5 text-purple-400" />
        Активные кампании
      </h3>
      
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-3 sm:p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm sm:text-base truncate">{campaign.station}</h4>
                <p className="text-xs text-slate-400">{campaign.package} • {campaign.plays}/{campaign.target} выходов</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold text-sm">ROI {campaign.roi}%</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs">
                  Активна
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                style={{ width: `${(campaign.plays / campaign.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Radio Stations Card
function RadioStationsCard() {
  const [stations, setStations] = useState([
    { name: 'PROMO.FM Radio', campaigns: 5, roi: 245, reach: 125000, score: 9.2 },
    { name: 'Rock Wave 101.3', campaigns: 3, roi: 228, reach: 98000, score: 8.8 },
    { name: 'Jazz Club FM', campaigns: 2, roi: 215, reach: 52000, score: 8.5 },
  ]);

  useEffect(() => {
    fetchRadioCompare().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((r: any) => ({
          name: r.name || r.stationName || 'Radio',
          campaigns: r.campaigns || 0,
          roi: r.roi || 0,
          reach: r.reach || r.impressions || 0,
          score: r.score || Math.min(10, (r.roi || 0) / 30),
        }));
        if (mapped.length > 0) setStations(mapped);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        Радиостанции
      </h3>
      
      <div className="space-y-3">
        {stations.map((station, index) => (
          <div key={index} className="p-3 sm:p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm sm:text-base truncate">{station.name}</h4>
                <p className="text-xs text-slate-400">{station.campaigns} кампаний • {(station.reach / 1000).toFixed(0)}K охват</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white font-bold text-sm">{station.score}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">ROI:</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                  style={{ width: `${Math.min((station.roi / 300) * 100, 100)}%` }}
                />
              </div>
              <span className="text-green-400 font-bold text-sm">{station.roi}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Performance Metrics Card
function PerformanceMetricsCard({ stats }: any) {
  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-400" />
        Эффективность
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Досматриваемость</span>
            <span className="text-white font-bold">{stats.performance.completionRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
              style={{ width: `${stats.performance.completionRate}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Вовлеченность</span>
            <span className="text-white font-bold">{stats.performance.engagementRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${stats.performance.engagementRate}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Конверсия</span>
            <span className="text-white font-bold">{stats.performance.conversionRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: `${stats.performance.conversionRate * 10}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Общий балл</span>
            <span className="text-2xl font-bold text-purple-400">8.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recommendations Card
function RecommendationsCard() {
  const recommendations = [
    { text: 'PROMO.FM показывает лучший ROI 245%', icon: TrendingUp, color: 'text-green-400' },
    { text: 'Попробуйте 15-сек формат - выше вовлеченность', icon: Target, color: 'text-blue-400' },
    { text: 'Утренние часы (8-10) дают больше охвата', icon: Clock, color: 'text-amber-400' },
  ];

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/30">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-400" />
        Рекомендации
      </h3>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
            <rec.icon className={`w-5 h-5 ${rec.color} flex-shrink-0 mt-0.5`} />
            <p className="text-white text-sm">{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ROI Breakdown Card
function ROIBreakdownCard() {
  return (
    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Разбивка ROI по кампаниям</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-green-400 font-medium text-sm">Высокий ROI</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">245%</p>
          <p className="text-xs text-slate-400">PROMO.FM Radio</p>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-blue-400 font-medium text-sm">Средний ROI</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">228%</p>
          <p className="text-xs text-slate-400">Rock Wave 101.3</p>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-amber-400 font-medium text-sm">Целевой ROI</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">200%</p>
          <p className="text-xs text-slate-400">Минимальный порог</p>
        </div>
      </div>
    </div>
  );
}