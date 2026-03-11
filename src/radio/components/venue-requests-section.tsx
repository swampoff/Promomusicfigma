import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Play, Pause, CheckCircle, XCircle, Clock, Calendar, 
  DollarSign, Eye, Download, Upload, AlertCircle, Music, Volume2,
  Users, MapPin, Star, TrendingUp, Filter, Search, MoreVertical,
  Edit, Trash2, Send, MessageSquare, FileText, BarChart3, Zap,
  Shield, Award, RefreshCw, ExternalLink, ChevronDown, ChevronRight, X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchVenueRequests,
  approveVenueRequest,
  rejectVenueRequest,
  startVenueRequestBroadcast,
  completeVenueRequest,
} from '@/utils/api/radio-cabinet';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
type TimeSlot = 'morning' | 'day' | 'evening' | 'night' | 'prime_time' | 'any_time';
type VenueType = 'bar' | 'restaurant' | 'club' | 'cafe' | 'hotel' | 'other';

interface VenueAdRequest {
  id: string;
  venueId: string;
  venueName: string;
  venueType: VenueType;
  venueCity: string;
  venuePhone?: string;
  venueRating?: number;
  
  // Рекламная кампания
  packageId: string;
  packageType: '5sec' | '10sec' | '15sec' | '30sec';
  duration: number; // секунды
  audioUrl: string;
  audioFileName: string;
  audioDuration: number;
  
  // Параметры
  timeSlots: TimeSlot[];
  playsPerDay: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  
  // Финансы
  totalPrice: number;
  stationPayout: number; // 85%
  platformFee: number;    // 15%
  
  // Статистика
  totalPlays: number;
  targetPlays: number;
  completedPlays: number;
  impressions: number;
  
  // Статус и модерация
  status: RequestStatus;
  moderationNote?: string;
  rejectionReason?: string;
  
  // Метаданные
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
type SortBy = 'date' | 'price' | 'venue' | 'progress';

export function VenueRequestsSection() {
  const [requests, setRequests] = useState<VenueAdRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VenueAdRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load venue requests from API
  useEffect(() => {
    setIsLoading(true);
    fetchVenueRequests()
      .then((apiData) => {
        if (apiData && apiData.length > 0) {
          const mapped: VenueAdRequest[] = apiData.map((r) => ({
            ...r,
            venueType: (r.venueType || 'other') as VenueType,
            packageType: (r.packageType || '15sec') as VenueAdRequest['packageType'],
            status: (r.status || 'pending') as RequestStatus,
            timeSlots: (r.timeSlots || []) as TimeSlot[],
          }));
          setRequests(mapped);
        }
        // If API returns empty, show empty state (no mock data)
      })
      .catch((err) => {
        console.error('Error loading venue requests from API:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Фильтрация и сортировка
  const filteredRequests = requests
    .filter(req => {
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      const matchesSearch = req.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           req.venueCity.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'price':
          return b.totalPrice - a.totalPrice;
        case 'venue':
          return a.venueName.localeCompare(b.venueName);
        case 'progress':
          const progressA = (a.completedPlays / a.targetPlays) * 100;
          const progressB = (b.completedPlays / b.targetPlays) * 100;
          return progressB - progressA;
        default:
          return 0;
      }
    });

  // Статистика
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalRevenue: requests
      .filter(r => r.status !== 'rejected' && r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.stationPayout, 0),
    totalImpressions: requests.reduce((sum, r) => sum + r.impressions, 0),
  };

  // Обработчики
  const handleApprove = async (request: VenueAdRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'approved' as RequestStatus, approvedAt: new Date().toISOString() }
        : r
    ));
    toast.success(`Заявка от "${request.venueName}" одобрена`);
    setShowDetailModal(false);
    approveVenueRequest(request.id).catch((err) => {
      console.error('Error approving venue request:', err);
    });
  };

  const handleReject = async (request: VenueAdRequest, reason: string) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'rejected' as RequestStatus, rejectionReason: reason, reviewedAt: new Date().toISOString() }
        : r
    ));
    toast.error(`Заявка от "${request.venueName}" отклонена`);
    setShowDetailModal(false);
    rejectVenueRequest(request.id, reason).catch((err) => {
      console.error('Error rejecting venue request:', err);
    });
  };

  const handleStartBroadcast = async (request: VenueAdRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'in_progress' as RequestStatus }
        : r
    ));
    toast.success(`Трансляция рекламы "${request.venueName}" запущена`);
    startVenueRequestBroadcast(request.id).catch((err) => {
      console.error('Error starting broadcast:', err);
    });
  };

  const handleCompleteBroadcast = async (request: VenueAdRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'completed' as RequestStatus, completedAt: new Date().toISOString() }
        : r
    ));
    toast.success(`Трансляция рекламы "${request.venueName}" завершена`);
    completeVenueRequest(request.id).catch((err) => {
      console.error('Error completing broadcast:', err);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
          Заявки заведений 🏢
        </h2>
        <p className="text-xs xs:text-sm sm:text-base text-slate-400">
          Управляйте рекламными заявками от баров, клубов и ресторанов
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
        <StatCard
          label="Всего заявок"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="На модерации"
          value={stats.pending}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Активных"
          value={stats.inProgress}
          icon={Zap}
          color="green"
        />
        <StatCard
          label="Доход"
          value={`₽${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Filters & Search */}
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
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Все"
            count={stats.total}
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          />
          <FilterButton
            label="На модерации"
            count={stats.pending}
            active={filterStatus === 'pending'}
            onClick={() => setFilterStatus('pending')}
            color="amber"
          />
          <FilterButton
            label="Одобренные"
            count={stats.approved}
            active={filterStatus === 'approved'}
            onClick={() => setFilterStatus('approved')}
            color="green"
          />
          <FilterButton
            label="В процессе"
            count={stats.inProgress}
            active={filterStatus === 'in_progress'}
            onClick={() => setFilterStatus('in_progress')}
            color="blue"
          />
          <FilterButton
            label="Завершенные"
            count={stats.completed}
            active={filterStatus === 'completed'}
            onClick={() => setFilterStatus('completed')}
            color="purple"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none"
          >
            <option value="date">По дате</option>
            <option value="price">По цене</option>
            <option value="venue">По названию</option>
            <option value="progress">По прогрессу</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Заявок не найдено</h3>
            <p className="text-slate-400">
              {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Пока нет заявок от заведений'}
            </p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onView={() => {
                setSelectedRequest(request);
                setShowDetailModal(true);
              }}
              onApprove={() => handleApprove(request)}
              onReject={(reason) => handleReject(request, reason)}
              playingAudio={playingAudioId === request.id}
              onPlayAudio={() => setPlayingAudioId(playingAudioId === request.id ? null : request.id)}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <RequestDetailModal
            request={selectedRequest}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedRequest(null);
            }}
            onApprove={() => handleApprove(selectedRequest)}
            onReject={(reason) => handleReject(selectedRequest, reason)}
            onStartBroadcast={() => handleStartBroadcast(selectedRequest)}
            onCompleteBroadcast={() => handleCompleteBroadcast(selectedRequest)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

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

interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

function FilterButton({ label, count, active, onClick, color = 'blue' }: FilterButtonProps) {
  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-500/20 text-blue-300',
    green: 'border-green-500/30 bg-green-500/20 text-green-300',
    purple: 'border-purple-500/30 bg-purple-500/20 text-purple-300',
    amber: 'border-amber-500/30 bg-amber-500/20 text-amber-300',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg transition-all ${
        active
          ? `${colorClasses[color]} border`
          : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {count > 0 && (
        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

interface RequestCardProps {
  request: VenueAdRequest;
  onView: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  playingAudio: boolean;
  onPlayAudio: () => void;
}

function RequestCard({ request, onView, onApprove, onReject, playingAudio, onPlayAudio }: RequestCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);

  const getStatusBadge = (status: RequestStatus) => {
    const badges = {
      pending: { label: 'На модерации', color: 'bg-amber-500/20 text-amber-300', icon: Clock },
      approved: { label: 'Одобрена', color: 'bg-green-500/20 text-green-300', icon: CheckCircle },
      rejected: { label: 'Отклонена', color: 'bg-red-500/20 text-red-300', icon: XCircle },
      in_progress: { label: 'В эфире', color: 'bg-blue-500/20 text-blue-300', icon: Zap },
      completed: { label: 'Завершена', color: 'bg-purple-500/20 text-purple-300', icon: Award },
      cancelled: { label: 'Отменена', color: 'bg-slate-500/20 text-slate-300', icon: XCircle },
    };
    return badges[status];
  };

  const getVenueTypeBadge = (type: VenueType) => {
    const badges = {
      bar: { label: '🍺 Бар', color: 'bg-amber-500/20 text-amber-300' },
      restaurant: { label: '🍽️ Ресторан', color: 'bg-green-500/20 text-green-300' },
      club: { label: '🎉 Клуб', color: 'bg-purple-500/20 text-purple-300' },
      cafe: { label: '☕ Кафе', color: 'bg-blue-500/20 text-blue-300' },
      hotel: { label: '🏨 Отель', color: 'bg-indigo-500/20 text-indigo-300' },
      other: { label: '🏢 Другое', color: 'bg-slate-500/20 text-slate-300' },
    };
    return badges[type];
  };

  const statusBadge = getStatusBadge(request.status);
  const StatusIcon = statusBadge.icon;
  const venueTypeBadge = getVenueTypeBadge(request.venueType);
  const progress = request.targetPlays > 0 ? (request.completedPlays / request.targetPlays) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Venue Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-white font-semibold text-base sm:text-lg">{request.venueName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
                <span className={`px-2 py-0.5 rounded-lg text-xs ${venueTypeBadge.color}`}>
                  {venueTypeBadge.label}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {request.venueCity}
                </span>
                {request.venueRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {request.venueRating}
                  </span>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-lg sm:text-xl font-bold text-indigo-400">₽{request.totalPrice.toLocaleString()}</p>
              <p className="text-xs text-slate-400">Ваша доля: ₽{request.stationPayout.toLocaleString()}</p>
            </div>
          </div>

          {/* Package Details */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs">
              {request.packageType.replace('sec', ' сек')}
            </span>
            <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs">
              {request.playsPerDay} выходов/день
            </span>
            <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs">
              {request.durationDays} дней
            </span>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">
              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
            </span>
          </div>

          {/* Progress (if in progress or completed) */}
          {(request.status === 'in_progress' || request.status === 'completed') && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Прогресс</span>
                <span className="text-white font-medium">
                  {request.completedPlays} / {request.targetPlays}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onPlayAudio}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-sm"
            >
              {playingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {playingAudio ? 'Пауза' : 'Прослушать'}
            </button>

            <button
              onClick={onView}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all text-sm"
            >
              <Eye className="w-4 h-4" />
              Детали
            </button>

            {request.status === 'pending' && (
              <div className="contents">
                <button
                  onClick={onApprove}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-all text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Одобрить
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Отклонить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          venueName={request.venueName}
          onConfirm={(reason) => {
            onReject(reason);
            setShowRejectModal(false);
          }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </motion.div>
  );
}

// Request Detail Modal
function RequestDetailModal({ request, onClose, onApprove, onReject, onStartBroadcast, onCompleteBroadcast }: any) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Детали заявки</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Venue Info */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-3">Информация о заведении</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Название</p>
                <p className="text-white font-medium">{request.venueName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Тип</p>
                <p className="text-white font-medium">{request.venueType}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Город</p>
                <p className="text-white font-medium">{request.venueCity}</p>
              </div>
              {request.venuePhone && (
                <div>
                  <p className="text-slate-400 text-sm mb-1">Телефон</p>
                  <p className="text-white font-medium">{request.venuePhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Details */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-3">Детали кампании</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Длительность ролика</p>
                <p className="text-white font-medium">{request.packageType.replace('sec', ' секунд')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Выходов в день</p>
                <p className="text-white font-medium">{request.playsPerDay}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Длительность кампании</p>
                <p className="text-white font-medium">{request.durationDays} дней</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Всего выходов</p>
                <p className="text-white font-medium">{request.targetPlays}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Начало</p>
                <p className="text-white font-medium">{new Date(request.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Окончание</p>
                <p className="text-white font-medium">{new Date(request.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30">
            <h4 className="text-green-300 font-semibold mb-3">Финансы</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-green-200/60 text-sm mb-1">Общая сумма</p>
                <p className="text-white text-xl font-bold">₽{request.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-green-200/60 text-sm mb-1">Ваша доля (85%)</p>
                <p className="text-green-300 text-xl font-bold">₽{request.stationPayout.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-green-200/60 text-sm mb-1">Комиссия (15%)</p>
                <p className="text-white/60 text-xl font-bold">₽{request.platformFee.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Audio File */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-white font-semibold mb-3">Аудио файл</h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 p-3 rounded-lg bg-white/5 flex items-center gap-3">
                <Music className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{request.audioFileName}</p>
                  <p className="text-slate-400 text-xs">{request.audioDuration} секунд</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 sm:flex-none p-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
                  <Download className="w-5 h-5 mx-auto" />
                </button>
                <button className="flex-1 sm:flex-none p-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-all">
                  <Play className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {request.status === 'pending' && !showRejectForm && (
              <div className="contents">
                <button
                  onClick={onApprove}
                  className="flex-1 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Одобрить заявку
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Отклонить
                </button>
              </div>
            )}

            {showRejectForm && (
              <div className="flex-1 space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Укажите причину отклонения..."
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 resize-none outline-none focus:border-red-500/50"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        onReject(rejectReason);
                      } else {
                        toast.error('Укажите причину отклонения');
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
                  >
                    Подтвердить отклонение
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {request.status === 'approved' && (
              <button
                onClick={onStartBroadcast}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Запустить трансляцию
              </button>
            )}

            {request.status === 'in_progress' && (
              <button
                onClick={onCompleteBroadcast}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Завершить трансляцию
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reject Modal
function RejectModal({ venueName, onConfirm, onCancel }: any) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-4 sm:p-6 rounded-2xl bg-[#0a0a14] border border-white/20 shadow-2xl">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Отклонить заявку</h3>
        <p className="text-sm sm:text-base text-slate-400 mb-3 sm:mb-4">
          Вы уверены, что хотите отклонить заявку от "{venueName}"?
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Укажите причину отклонения (обязательно)..."
          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 resize-none outline-none focus:border-red-500/50 mb-3 sm:mb-4 text-sm sm:text-base"
          rows={4}
        />
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all text-sm sm:text-base"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
              } else {
                toast.error('Укажите причину отклонения');
              }
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all text-sm sm:text-base"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MOCK DATA
// =====================================================

const mockRequests: VenueAdRequest[] = [
  {
    id: 'req1',
    venueId: 'venue1',
    venueName: 'Sunset Lounge Bar',
    venueType: 'bar',
    venueCity: 'Москва',
    venuePhone: '+7 (495) 123-45-67',
    venueRating: 4.8,
    
    packageId: 'pkg1',
    packageType: '15sec',
    duration: 15,
    audioUrl: 'https://example.com/ad1.mp3',
    audioFileName: 'sunset-lounge-promo.mp3',
    audioDuration: 14.8,
    
    timeSlots: ['evening', 'prime_time'],
    playsPerDay: 10,
    durationDays: 7,
    startDate: '2026-02-05',
    endDate: '2026-02-11',
    
    totalPrice: 15000,
    stationPayout: 12750, // 85%
    platformFee: 2250,    // 15%
    
    totalPlays: 70,
    targetPlays: 70,
    completedPlays: 35,
    impressions: 105000,
    
    status: 'in_progress',
    submittedAt: '2026-02-01T10:30:00',
    approvedAt: '2026-02-01T14:00:00',
  },
  {
    id: 'req2',
    venueId: 'venue2',
    venueName: 'Urban Club Moscow',
    venueType: 'club',
    venueCity: 'Москва',
    venuePhone: '+7 (495) 987-65-43',
    venueRating: 4.5,
    
    packageId: 'pkg2',
    packageType: '30sec',
    duration: 30,
    audioUrl: 'https://example.com/ad2.mp3',
    audioFileName: 'urban-club-ad.mp3',
    audioDuration: 29.5,
    
    timeSlots: ['night', 'prime_time'],
    playsPerDay: 5,
    durationDays: 7,
    startDate: '2026-02-10',
    endDate: '2026-02-16',
    
    totalPrice: 35000,
    stationPayout: 29750,
    platformFee: 5250,
    
    totalPlays: 35,
    targetPlays: 35,
    completedPlays: 0,
    impressions: 0,
    
    status: 'pending',
    submittedAt: '2026-02-03T09:15:00',
  },
  {
    id: 'req3',
    venueId: 'venue3',
    venueName: 'Italiano Trattoria',
    venueType: 'restaurant',
    venueCity: 'Санкт-Петербург',
    venueRating: 4.9,
    
    packageId: 'pkg3',
    packageType: '10sec',
    duration: 10,
    audioUrl: 'https://example.com/ad3.mp3',
    audioFileName: 'italiano-ad.mp3',
    audioDuration: 9.8,
    
    timeSlots: ['day', 'evening'],
    playsPerDay: 12,
    durationDays: 14,
    startDate: '2026-02-01',
    endDate: '2026-02-14',
    
    totalPrice: 8000,
    stationPayout: 6800,
    platformFee: 1200,
    
    totalPlays: 168,
    targetPlays: 168,
    completedPlays: 168,
    impressions: 252000,
    
    status: 'completed',
    submittedAt: '2026-01-25T11:00:00',
    approvedAt: '2026-01-25T15:30:00',
    completedAt: '2026-02-14T23:59:00',
  },
  {
    id: 'req4',
    venueId: 'venue4',
    venueName: 'Jazz Corner Cafe',
    venueType: 'cafe',
    venueCity: 'Москва',
    venueRating: 4.7,
    
    packageId: 'pkg4',
    packageType: '15sec',
    duration: 15,
    audioUrl: 'https://example.com/ad4.mp3',
    audioFileName: 'jazz-cafe-promo.mp3',
    audioDuration: 14.5,
    
    timeSlots: ['morning', 'day'],
    playsPerDay: 8,
    durationDays: 7,
    startDate: '2026-02-15',
    endDate: '2026-02-21',
    
    totalPrice: 12000,
    stationPayout: 10200,
    platformFee: 1800,
    
    totalPlays: 56,
    targetPlays: 56,
    completedPlays: 0,
    impressions: 0,
    
    status: 'pending',
    submittedAt: '2026-02-02T16:45:00',
  },
  {
    id: 'req5',
    venueId: 'venue5',
    venueName: 'Night Fever Club',
    venueType: 'club',
    venueCity: 'Екатеринбург',
    
    packageId: 'pkg5',
    packageType: '15sec',
    duration: 15,
    audioUrl: 'https://example.com/ad5.mp3',
    audioFileName: 'night-fever-ad.mp3',
    audioDuration: 14.2,
    
    timeSlots: ['evening', 'night'],
    playsPerDay: 10,
    durationDays: 7,
    startDate: '2026-02-08',
    endDate: '2026-02-14',
    
    totalPrice: 10000,
    stationPayout: 8500,
    platformFee: 1500,
    
    totalPlays: 70,
    targetPlays: 70,
    completedPlays: 70,
    impressions: 140000,
    
    status: 'completed',
    submittedAt: '2026-01-28T13:20:00',
    approvedAt: '2026-01-28T18:00:00',
    completedAt: '2026-02-14T23:59:00',
  },
];