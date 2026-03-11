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

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio, Search, Filter, MapPin, Users, Star, TrendingUp, 
  Clock, DollarSign, Calendar, Play, Pause, Volume2, 
  BarChart3, Eye, ExternalLink, Check, X, AlertCircle,
  Zap, Target, Globe, Headphones, Music, ChevronRight,
  Download, Upload, Send, Info, Shield
} from 'lucide-react';
import {
  fetchRadioCatalog,
  fetchRadioCampaigns,
  createRadioCampaign,
  updateRadioCampaign,
  cancelRadioCampaign,
  fetchCampaignStatus,
} from '@/utils/api/venue-cabinet';
import type { CampaignStatus } from '@/utils/api/venue-cabinet';

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
  const [stations, setStations] = useState<RadioStation[]>([]);

  // Кампании
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoadingStations(true);
      try {
        const data = await fetchRadioCatalog();
        if (data && data.length > 0) {
          setStations(data as unknown as RadioStation[]);
        }
      } catch (error) {
        console.error('Error loading radio catalog:', error);
      } finally {
        setLoadingStations(false);
      }
    };

    const loadCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const data = await fetchRadioCampaigns();
        if (data && data.length > 0) {
          setCampaigns(data as unknown as Campaign[]);
        }
      } catch (error) {
        console.error('Error loading radio campaigns:', error);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    loadCatalog();
    loadCampaigns();
  }, []);

  const handlePurchaseCampaign = async (data: { audioFile: File | null; selectedSlots: TimeSlot[] }) => {
    if (!selectedStation || !selectedPackage) return;
    try {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + selectedPackage.durationDays);

      const campaign = await createRadioCampaign({
        stationId: selectedStation.id,
        stationName: selectedStation.stationName,
        packageType: selectedPackage.type,
        audioUrl: data.audioFile?.name || '',
        startDate: now.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        targetPlays: selectedPackage.playsPerDay * selectedPackage.durationDays,
        budget: selectedPackage.price,
        timeSlots: data.selectedSlots as any[],
      });

      if (campaign) {
        setCampaigns(prev => [...prev, campaign as unknown as Campaign]);
        toast.success('Рекламная кампания создана');
      } else {
        toast.error('Не удалось создать кампанию');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Ошибка при создании кампании');
    } finally {
      setShowPurchaseModal(false);
      setSelectedPackage(null);
      setSelectedStation(null);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      const result = await cancelRadioCampaign(campaignId);
      if (result) {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'cancelled' as CampaignStatus } : c));
        toast.success('Кампания отменена');
        setSelectedCampaign(null);
      } else {
        toast.error('Не удалось отменить кампанию');
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast.error('Ошибка при отмене кампании');
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const result = await updateRadioCampaign(campaignId, { status: 'paused' } as any);
      if (result) {
        setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'paused' as CampaignStatus } : c));
        toast.success('Кампания приостановлена');
      } else {
        toast.error('Не удалось приостановить кампанию');
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
      toast.error('Ошибка при приостановке');
    }
  };

  const handleViewCampaignStatus = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignStatus(null);
    setLoadingStatus(true);
    try {
      const status = await fetchCampaignStatus(campaign.id);
      setCampaignStatus(status);
    } catch (error) {
      console.warn('[Radio] Status API unavailable:', (error as Error).message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const reloadCampaigns = useCallback(async () => {
    try {
      const data = await fetchRadioCampaigns();
      if (data && data.length > 0) {
        setCampaigns(data as unknown as Campaign[]);
      }
    } catch (error) {
      console.error('Error reloading campaigns:', error);
    }
  }, []);

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
    <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
          Реклама на радио 📻
        </h2>
        <p className="text-xs xs:text-sm sm:text-base text-slate-400">
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
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewStatus={handleViewCampaignStatus}
                  onPause={handlePauseCampaign}
                  onCancel={handleCancelCampaign}
                />
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
            onSubmit={handlePurchaseCampaign}
          />
        )}
      </AnimatePresence>

      {/* Campaign Detail / Status Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <CampaignDetailModal
            campaign={selectedCampaign}
            status={campaignStatus}
            loading={loadingStatus}
            onClose={() => { setSelectedCampaign(null); setCampaignStatus(null); }}
            onCancel={handleCancelCampaign}
            onPause={handlePauseCampaign}
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
  onViewStatus?: (campaign: Campaign) => void;
  onPause?: (id: string) => void;
  onCancel?: (id: string) => void;
}

function CampaignCard({ campaign, onViewStatus, onPause, onCancel }: CampaignCardProps) {
  const getStatusBadge = (status: CampaignStatus) => {
    const badges = {
      draft: { label: 'Черновик', color: 'bg-slate-500/20 text-slate-300' },
      pending: { label: 'На модерации', color: 'bg-amber-500/20 text-amber-300' },
      active: { label: 'Активна', color: 'bg-green-500/20 text-green-300' },
      paused: { label: 'Приостановлен', color: 'bg-blue-500/20 text-blue-300' },
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
            {campaign.startDate} - {campaign.endDate}
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

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
        <button
          onClick={() => onViewStatus?.(campaign)}
          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Статус
        </button>

        {['pending', 'active'].includes(campaign.status) && (
          <button
            onClick={() => onPause?.(campaign.id)}
            className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" />
            Пауза
          </button>
        )}

        {['pending', 'paused', 'draft'].includes(campaign.status) && (
          <button
            onClick={() => onCancel?.(campaign.id)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Отменить
          </button>
        )}

        {campaign.status === 'completed' && (
          <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-sm flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Завершена
          </span>
        )}
      </div>
    </motion.div>
  );
}

function AnalyticsView({ campaigns }: { campaigns: Campaign[] }) {
  const totalPlays = campaigns.reduce((sum, c) => sum + c.totalPlays, 0);
  const targetPlays = campaigns.reduce((sum, c) => sum + c.targetPlays, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const avgCTR = campaigns.length > 0
    ? (campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length)
    : 0;
  const completionRate = targetPlays > 0 ? Math.round((totalPlays / targetPlays) * 100) : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;

  if (campaigns.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Нет данных для аналитики</h3>
        <p className="text-slate-400">Создайте рекламную кампанию, чтобы увидеть статистику</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20">
          <p className="text-sm text-indigo-300 mb-1">Воспроизведения</p>
          <p className="text-2xl font-bold text-white">{totalPlays.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">из {targetPlays.toLocaleString()} целевых</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <p className="text-sm text-purple-300 mb-1">Бюджет / Потрачено</p>
          <p className="text-2xl font-bold text-white">₽{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">из ₽{totalBudget.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <p className="text-sm text-green-300 mb-1">Показы</p>
          <p className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">CTR: {avgCTR.toFixed(2)}%</p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
          <p className="text-sm text-amber-300 mb-1">Выполнение</p>
          <p className="text-2xl font-bold text-white">{completionRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{completedCampaigns} завершено, {activeCampaigns} активно</p>
        </div>
      </div>

      {/* Per-campaign breakdown */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-medium">По кампаниям</h3>
        </div>
        <div className="divide-y divide-white/5">
          {campaigns.map(c => {
            const cProgress = c.targetPlays > 0 ? Math.round((c.totalPlays / c.targetPlays) * 100) : 0;
            return (
              <div key={c.id} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{c.stationName}</p>
                  <p className="text-slate-400 text-xs">{c.startDate} — {c.endDate}</p>
                </div>
                <div className="w-24 text-right">
                  <p className="text-white text-sm font-medium">₽{c.budget.toLocaleString()}</p>
                </div>
                <div className="w-20">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${Math.min(cProgress, 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 text-center">{cProgress}%</p>
                </div>
                <div className="w-16 text-right">
                  <p className="text-xs text-slate-400">{c.impressions}</p>
                  <p className="text-xs text-slate-500">показов</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Campaign Detail Modal
function CampaignDetailModal({ campaign, status, loading, onClose, onCancel, onPause }: {
  campaign: Campaign;
  status: CampaignStatus | null;
  loading: boolean;
  onClose: () => void;
  onCancel: (id: string) => void;
  onPause: (id: string) => void;
}) {
  const radioStatus = status?.radioStatus;
  const pricing = status?.pricing;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Ожидает модерации', color: 'text-amber-300' },
    approved: { label: 'Одобрена радиостанцией', color: 'text-green-300' },
    rejected: { label: 'Отклонена', color: 'text-red-300' },
    in_progress: { label: 'В эфире', color: 'text-blue-300' },
    completed: { label: 'Завершена', color: 'text-purple-300' },
    cancelled: { label: 'Отменена', color: 'text-red-400' },
    active: { label: 'Активна', color: 'text-green-300' },
    paused: { label: 'Приостановлена', color: 'text-blue-300' },
    draft: { label: 'Черновик', color: 'text-slate-300' },
  };

  const rs = radioStatus?.status ? statusLabels[radioStatus.status] : null;
  const vs = statusLabels[campaign.status] || { label: campaign.status, color: 'text-slate-300' };

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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Кампания: {campaign.stationName}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Venue-side status */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Ваш статус</span>
            <span className={`text-sm font-medium ${vs.color}`}>{vs.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Период</span>
            <span className="text-sm text-white">{campaign.startDate} — {campaign.endDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Прогресс</span>
            <span className="text-sm text-white">{campaign.totalPlays} / {campaign.targetPlays} воспроизведений</span>
          </div>
        </div>

        {/* Radio-side status */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <h4 className="text-white font-medium text-sm mb-2">Статус на радиостанции</h4>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-500 border-t-indigo-400 rounded-full animate-spin" />
              Загрузка...
            </div>
          ) : radioStatus ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Решение станции</span>
                <span className={`text-sm font-medium ${rs?.color || 'text-slate-300'}`}>{rs?.label || radioStatus.status}</span>
              </div>
              {radioStatus.reviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Рассмотрено</span>
                  <span className="text-sm text-white">{new Date(radioStatus.reviewedAt).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
              {radioStatus.completedPlays > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Выходы в эфир</span>
                  <span className="text-sm text-white">{radioStatus.completedPlays}</span>
                </div>
              )}
              {radioStatus.impressions > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Показы</span>
                  <span className="text-sm text-white">{radioStatus.impressions.toLocaleString()}</span>
                </div>
              )}
              {radioStatus.rejectionReason && (
                <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-300">Причина отказа: {radioStatus.rejectionReason}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Данные со стороны радиостанции недоступны</p>
          )}
        </div>

        {/* Pricing breakdown */}
        {pricing && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-white font-medium text-sm mb-2">Расчёт стоимости</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Базовая стоимость</span>
              <span className="text-sm text-white">₽{pricing.baseAmount.toLocaleString()}</span>
            </div>
            {pricing.discountAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">Скидка</span>
                <span className="text-sm text-green-400">−₽{pricing.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-sm text-slate-300 font-medium">Итого к оплате</span>
              <span className="text-sm text-white font-bold">₽{pricing.paymentAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Комиссия платформы ({Math.round(pricing.commissionRate * 100)}%)</span>
              <span className="text-slate-500">₽{pricing.commissionAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {['pending', 'active', 'paused', 'draft'].includes(campaign.status) && (
          <div className="flex gap-3">
            {['pending', 'active'].includes(campaign.status) && (
              <button
                onClick={() => onPause(campaign.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-300 font-medium hover:bg-blue-500/30 transition-colors text-sm"
              >
                Приостановить
              </button>
            )}
            {['pending', 'paused', 'draft'].includes(campaign.status) && (
              <button
                onClick={() => onCancel(campaign.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-300 font-medium hover:bg-red-500/30 transition-colors text-sm"
              >
                Отменить кампанию
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
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
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl"
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
        className="w-full max-w-lg p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl"
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