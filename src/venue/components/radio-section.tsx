/**
 * RADIO SECTION - Реклама на радиостанциях для заведений
 * Enterprise-система покупки рекламы на радиостанциях
 * 
 * Функционал:
 * - Каталог радиостанций (FM, Online, AM)
 * - Фильтры по жанрам, регионам, аудитории
 * - Рекламные пакеты (5/10/15/30 сек)
 * - Временные слоты (утро/день/вечер/прайм)
 * - Покупка и управление кампаниями
 * - Аналитика и статистика
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio, Search, Filter, MapPin, Users, Star, TrendingUp, 
  Clock, DollarSign, Calendar, Play, Pause, Volume2, 
  BarChart3, Eye, ExternalLink, Check, X, AlertCircle,
  Zap, Target, Globe, Headphones, Music, ChevronRight,
  Download, Upload, Send, Info, Shield
} from 'lucide-react';

type Tab = 'catalog' | 'my-campaigns' | 'analytics';
type StationType = 'all' | 'online' | 'fm' | 'am' | 'dab';
type Genre = 'all' | 'pop' | 'rock' | 'electronic' | 'hip_hop' | 'jazz' | 'mixed';
type AudienceSize = 'all' | 'small' | 'medium' | 'large' | 'very_large' | 'massive';
type AdPackageType = 'slot_5sec' | 'slot_10sec' | 'slot_15sec' | 'slot_30sec';
type TimeSlot = 'morning' | 'day' | 'evening' | 'night' | 'prime_time' | 'any_time';
type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';

interface RadioStation {
  id: string;
  stationName: string;
  slug: string;
  type: 'online' | 'fm' | 'am' | 'dab';
  primaryGenre: string;
  logoUrl?: string;
  country: string;
  city: string;
  listenersCount: number;
  monthlyListeners: number;
  audienceSize: 'small' | 'medium' | 'large' | 'very_large' | 'massive';
  rating: number;
  frequency?: string; // "100.5 FM"
  broadcastUrl?: string;
  description: string;
  verified: boolean;
  adPackages: AdPackage[];
}

interface AdPackage {
  id: string;
  type: AdPackageType;
  duration: number; // seconds
  price: number;
  currency: string;
  timeSlots: TimeSlot[];
  playsPerDay: number;
  durationDays: number;
  description: string;
  features: string[];
}

interface Campaign {
  id: string;
  stationId: string;
  stationName: string;
  packageType: AdPackageType;
  status: CampaignStatus;
  audioUrl: string;
  startDate: string;
  endDate: string;
  totalPlays: number;
  targetPlays: number;
  budget: number;
  spent: number;
  impressions: number;
  ctr: number; // Click-through rate
  timeSlots: TimeSlot[];
}

export function RadioSection() {
  const [activeTab, setActiveTab] = useState<Tab>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [stationType, setStationType] = useState<StationType>('all');
  const [genre, setGenre] = useState<Genre>('all');
  const [audienceSize, setAudienceSize] = useState<AudienceSize>('all');
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<AdPackage | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Mock данные радиостанций
  const [stations] = useState<RadioStation[]>([
    {
      id: 'station1',
      stationName: 'Hit FM',
      slug: 'hit-fm',
      type: 'fm',
      primaryGenre: 'Pop',
      country: 'RU',
      city: 'Москва',
      frequency: '107.4 FM',
      listenersCount: 85000,
      monthlyListeners: 2500000,
      audienceSize: 'very_large',
      rating: 4.8,
      verified: true,
      description: 'Топовые хиты и новинки поп-музыки. Аудитория 18-35 лет.',
      broadcastUrl: 'https://stream.hit.fm/moscow',
      adPackages: [
        {
          id: 'pkg1',
          type: 'slot_15sec',
          duration: 15,
          price: 15000,
          currency: 'RUB',
          timeSlots: ['morning', 'day', 'evening'],
          playsPerDay: 10,
          durationDays: 7,
          description: 'Стандартный пакет на неделю',
          features: ['10 выходов в день', 'Все время суток', 'Гарантированный прайм-тайм']
        },
        {
          id: 'pkg2',
          type: 'slot_30sec',
          duration: 30,
          price: 35000,
          currency: 'RUB',
          timeSlots: ['prime_time'],
          playsPerDay: 5,
          durationDays: 7,
          description: 'Premium пакет в прайм-тайм',
          features: ['5 выходов в прайм', 'Пиковая аудитория', 'Отчет по статистике']
        }
      ]
    },
    {
      id: 'station2',
      stationName: 'Electronic Waves',
      slug: 'electronic-waves',
      type: 'online',
      primaryGenre: 'Electronic',
      country: 'RU',
      city: 'Санкт-Петербург',
      listenersCount: 12000,
      monthlyListeners: 350000,
      audienceSize: 'large',
      rating: 4.6,
      verified: true,
      description: 'Электронная музыка 24/7. Молодая аудитория клубной сцены.',
      broadcastUrl: 'https://stream.electronicwaves.fm',
      adPackages: [
        {
          id: 'pkg3',
          type: 'slot_10sec',
          duration: 10,
          price: 5000,
          currency: 'RUB',
          timeSlots: ['evening', 'night'],
          playsPerDay: 15,
          durationDays: 7,
          description: 'Вечерний пакет для клубов',
          features: ['15 выходов в день', 'Вечер и ночь', 'Клубная аудитория']
        }
      ]
    },
    {
      id: 'station3',
      stationName: 'Jazz Cafe Radio',
      slug: 'jazz-cafe',
      type: 'online',
      primaryGenre: 'Jazz',
      country: 'RU',
      city: 'Москва',
      listenersCount: 5000,
      monthlyListeners: 150000,
      audienceSize: 'medium',
      rating: 4.9,
      verified: false,
      description: 'Уютный джаз для кафе и ресторанов. Премиальная аудитория.',
      broadcastUrl: 'https://stream.jazzcafe.fm',
      adPackages: [
        {
          id: 'pkg4',
          type: 'slot_15sec',
          duration: 15,
          price: 8000,
          currency: 'RUB',
          timeSlots: ['day', 'evening'],
          playsPerDay: 8,
          durationDays: 14,
          description: 'Дневной пакет на 2 недели',
          features: ['8 выходов в день', 'День и вечер', 'Премиум аудитория']
        }
      ]
    },
    {
      id: 'station4',
      stationName: 'Rock Power 103',
      slug: 'rock-power',
      type: 'fm',
      primaryGenre: 'Rock',
      country: 'RU',
      city: 'Екатеринбург',
      frequency: '103.1 FM',
      listenersCount: 45000,
      monthlyListeners: 1300000,
      audienceSize: 'large',
      rating: 4.7,
      verified: true,
      description: 'Классический и альтернативный рок. Мужская аудитория 25-45 лет.',
      broadcastUrl: 'https://stream.rockpower.fm',
      adPackages: [
        {
          id: 'pkg5',
          type: 'slot_30sec',
          duration: 30,
          price: 25000,
          currency: 'RUB',
          timeSlots: ['morning', 'evening'],
          playsPerDay: 6,
          durationDays: 7,
          description: 'Утро + вечер',
          features: ['6 выходов в день', 'Drive time', 'Широкий охват']
        }
      ]
    }
  ]);

  // Mock данные кампаний
  const [campaigns] = useState<Campaign[]>([
    {
      id: 'camp1',
      stationId: 'station1',
      stationName: 'Hit FM',
      packageType: 'slot_15sec',
      status: 'active',
      audioUrl: 'https://example.com/ad1.mp3',
      startDate: '2026-02-01',
      endDate: '2026-02-07',
      totalPlays: 42,
      targetPlays: 70,
      budget: 15000,
      spent: 9000,
      impressions: 126000,
      ctr: 0.8,
      timeSlots: ['morning', 'day', 'evening']
    },
    {
      id: 'camp2',
      stationId: 'station2',
      stationName: 'Electronic Waves',
      packageType: 'slot_10sec',
      status: 'completed',
      audioUrl: 'https://example.com/ad2.mp3',
      startDate: '2026-01-15',
      endDate: '2026-01-21',
      totalPlays: 105,
      targetPlays: 105,
      budget: 5000,
      spent: 5000,
      impressions: 180000,
      ctr: 1.2,
      timeSlots: ['evening', 'night']
    }
  ]);

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = stationType === 'all' || station.type === stationType;
    const matchesGenre = genre === 'all' || station.primaryGenre.toLowerCase() === genre.toLowerCase();
    const matchesAudience = audienceSize === 'all' || station.audienceSize === audienceSize;
    return matchesSearch && matchesType && matchesGenre && matchesAudience;
  });

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
    avgCTR: campaigns.length > 0 
      ? (campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(2)
      : '0.00'
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Реклама на радио 📻
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Покупайте рекламу на популярных радиостанциях и привлекайте клиентов
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <TabButton
          active={activeTab === 'catalog'}
          onClick={() => setActiveTab('catalog')}
          icon={Radio}
          label="Каталог радиостанций"
        />
        <TabButton
          active={activeTab === 'my-campaigns'}
          onClick={() => setActiveTab('my-campaigns')}
          icon={Target}
          label="Мои кампании"
          badge={stats.activeCampaigns}
        />
        <TabButton
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          icon={BarChart3}
          label="Аналитика"
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Search & Filters */}
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию или городу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={stationType}
                  onChange={(e) => setStationType(e.target.value as StationType)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
                >
                  <option value="all">Все типы</option>
                  <option value="online">Online радио</option>
                  <option value="fm">FM радио</option>
                  <option value="am">AM радио</option>
                  <option value="dab">DAB радио</option>
                </select>

                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
                >
                  <option value="all">Все жанры</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="electronic">Electronic</option>
                  <option value="hip_hop">Hip-Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="mixed">Mixed</option>
                </select>

                <select
                  value={audienceSize}
                  onChange={(e) => setAudienceSize(e.target.value as AudienceSize)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
                >
                  <option value="all">Любая аудитория</option>
                  <option value="small">Малая (&lt; 1K)</option>
                  <option value="medium">Средняя (1K-10K)</option>
                  <option value="large">Большая (10K-100K)</option>
                  <option value="very_large">Очень большая (100K-1M)</option>
                  <option value="massive">Массовая (&gt; 1M)</option>
                </select>
              </div>
            </div>

            {/* Stations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredStations.map(station => (
                <StationCard
                  key={station.id}
                  station={station}
                  onClick={() => setSelectedStation(station)}
                />
              ))}
            </div>

            {filteredStations.length === 0 && (
              <div className="py-12 text-center">
                <Radio className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Радиостанции не найдены</h3>
                <p className="text-slate-400">Попробуйте изменить фильтры поиска</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'my-campaigns' && (
          <motion.div
            key="my-campaigns"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Всего кампаний"
                value={stats.totalCampaigns}
                icon={Target}
                color="blue"
              />
              <StatCard
                label="Активных"
                value={stats.activeCampaigns}
                icon={Zap}
                color="green"
              />
              <StatCard
                label="Потрачено"
                value={`₽${stats.totalSpent.toLocaleString()}`}
                icon={DollarSign}
                color="purple"
              />
              <StatCard
                label="Показы"
                value={stats.totalImpressions.toLocaleString()}
                icon={Eye}
                color="amber"
              />
            </div>

            {/* Campaigns List */}
            <div className="space-y-3">
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {campaigns.length === 0 && (
              <div className="py-12 text-center">
                <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Нет рекламных кампаний</h3>
                <p className="text-slate-400 mb-6">Начните с выбора радиостанции в каталоге</p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Перейти в каталог
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <AnalyticsView campaigns={campaigns} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Station Detail Modal */}
      <AnimatePresence>
        {selectedStation && (
          <StationDetailModal
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
            onSelectPackage={(pkg) => {
              setSelectedPackage(pkg);
              setShowPurchaseModal(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && selectedPackage && selectedStation && (
          <PurchaseModal
            station={selectedStation}
            package={selectedPackage}
            onClose={() => {
              setShowPurchaseModal(false);
              setSelectedPackage(null);
            }}
            onSubmit={(data) => {
              console.log('Purchase:', data);
              setShowPurchaseModal(false);
              setSelectedPackage(null);
              setSelectedStation(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon: Icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

interface StationCardProps {
  station: RadioStation;
  onClick: () => void;
}

function StationCard({ station, onClick }: StationCardProps) {
  const getTypeBadge = (type: string) => {
    const badges = {
      online: { label: 'Online', color: 'bg-blue-500/20 text-blue-300' },
      fm: { label: 'FM', color: 'bg-green-500/20 text-green-300' },
      am: { label: 'AM', color: 'bg-amber-500/20 text-amber-300' },
      dab: { label: 'DAB', color: 'bg-purple-500/20 text-purple-300' }
    };
    return badges[type as keyof typeof badges] || badges.online;
  };

  const getAudienceSizeLabel = (size: string) => {
    const labels = {
      small: '< 1K',
      medium: '1K-10K',
      large: '10K-100K',
      very_large: '100K-1M',
      massive: '> 1M'
    };
    return labels[size as keyof typeof labels] || size;
  };

  const typeBadge = getTypeBadge(station.type);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          {station.logoUrl ? (
            <img src={station.logoUrl} alt={station.stationName} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <Radio className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold truncate">{station.stationName}</h3>
                {station.verified && (
                  <Shield className="w-4 h-4 text-green-400 flex-shrink-0" title="Verified" />
                )}
              </div>
              <p className="text-slate-400 text-sm line-clamp-1">
                {station.description}
              </p>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">{station.rating}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge.color}`}>
              {typeBadge.label}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
              {station.primaryGenre}
            </span>
            {station.frequency && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                {station.frequency}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {station.city}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {getAudienceSizeLabel(station.audienceSize)}
            </span>
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {station.listenersCount.toLocaleString()}
            </span>
          </div>

          {/* Packages count */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {station.adPackages.length} рекламных пакета
            </span>
            <span className="text-sm text-indigo-400 font-medium flex items-center gap-1">
              Подробнее
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'amber';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400',
    green: 'from-green-500/10 to-green-600/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br border ${colorClasses[color]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
}

function CampaignCard({ campaign }: CampaignCardProps) {
  const getStatusBadge = (status: CampaignStatus) => {
    const badges = {
      draft: { label: 'Черновик', color: 'bg-slate-500/20 text-slate-300' },
      pending: { label: 'На модерации', color: 'bg-amber-500/20 text-amber-300' },
      active: { label: 'Активна', color: 'bg-green-500/20 text-green-300' },
      paused: { label: 'Приостановлена', color: 'bg-blue-500/20 text-blue-300' },
      completed: { label: 'Завершена', color: 'bg-purple-500/20 text-purple-300' },
      cancelled: { label: 'Отменена', color: 'bg-red-500/20 text-red-300' }
    };
    return badges[status];
  };

  const statusBadge = getStatusBadge(campaign.status);
  const progress = (campaign.totalPlays / campaign.targetPlays) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-medium">{campaign.stationName}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {campaign.startDate} — {campaign.endDate}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Прогресс воспроизведений</span>
          <span className="text-white font-medium">
            {campaign.totalPlays} / {campaign.targetPlays}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xl font-bold text-white">{campaign.impressions.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Показы</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xl font-bold text-white">₽{campaign.spent.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Потрачено</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-xl font-bold text-white">{campaign.ctr}%</p>
          <p className="text-xs text-slate-400">CTR</p>
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsView({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Детальная аналитика</h3>
        <p className="text-slate-400 mb-6">Графики и отчеты (в разработке)</p>
        
        {campaigns.length > 0 && (
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((sum, c) => sum + c.totalPlays, 0)}
              </p>
              <p className="text-sm text-slate-400">Всего воспроизведений</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">
                ₽{campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
              </p>
              <p className="text-sm text-slate-400">Общий бюджет</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Station Detail Modal
function StationDetailModal({ station, onClose, onSelectPackage }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{station.stationName}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Station Info */}
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 mb-4">{station.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">Тип</p>
              <p className="text-white font-medium">{station.type.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Жанр</p>
              <p className="text-white font-medium">{station.primaryGenre}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Слушателей</p>
              <p className="text-white font-medium">{station.listenersCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Рейтинг</p>
              <p className="text-white font-medium flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {station.rating}
              </p>
            </div>
          </div>
        </div>

        {/* Ad Packages */}
        <div>
          <h4 className="text-white font-semibold mb-4">Рекламные пакеты</h4>
          <div className="space-y-3">
            {station.adPackages.map((pkg: AdPackage) => (
              <div key={pkg.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="text-white font-medium mb-1">
                      {pkg.duration} секунд
                    </h5>
                    <p className="text-slate-400 text-sm">{pkg.description}</p>
                  </div>
                  <p className="text-2xl font-bold text-indigo-400">
                    ₽{pkg.price.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs">
                    {pkg.playsPerDay} выходов/день
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
                    {pkg.durationDays} дней
                  </span>
                </div>

                <ul className="space-y-1 mb-4">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Купить пакет
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Purchase Modal
function PurchaseModal({ station, package: pkg, onClose, onSubmit }: any) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(['any_time']);

  const timeSlots = [
    { value: 'morning', label: 'Утро (06:00-12:00)' },
    { value: 'day', label: 'День (12:00-18:00)' },
    { value: 'evening', label: 'Вечер (18:00-00:00)' },
    { value: 'night', label: 'Ночь (00:00-06:00)' },
    { value: 'prime_time', label: 'Прайм-тайм' },
    { value: 'any_time', label: 'Любое время' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Купить рекламу</h3>

        <div className="space-y-4 mb-6">
          {/* Station Info */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Радиостанция</p>
            <p className="text-white font-medium">{station.stationName}</p>
          </div>

          {/* Package Info */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Пакет</p>
            <p className="text-white font-medium">{pkg.duration} секунд - ₽{pkg.price.toLocaleString()}</p>
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-white font-medium mb-2">
              Загрузить аудио файл
            </label>
            <div className="p-6 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-500/50 transition-all text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-2">
                {audioFile ? audioFile.name : 'Перетащите файл или нажмите для выбора'}
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="inline-block px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm cursor-pointer transition-all"
              >
                Выбрать файл
              </label>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-white font-medium mb-2">
              Временные слоты
            </label>
            <div className="space-y-2">
              {timeSlots.map(slot => (
                <label key={slot.value} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedSlots.includes(slot.value as TimeSlot)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSlots([...selectedSlots, slot.value as TimeSlot]);
                      } else {
                        setSelectedSlots(selectedSlots.filter(s => s !== slot.value));
                      }
                    }}
                    className="w-5 h-5"
                  />
                  <span className="text-white">{slot.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => onSubmit({ audioFile, selectedSlots })}
            disabled={!audioFile}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Купить за ₽{pkg.price.toLocaleString()}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}