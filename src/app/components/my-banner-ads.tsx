import config from '@/config/environment';
/**
 * MY BANNER ADS - УПРАВЛЕНИЕ БАННЕРНЫМИ КАМПАНИЯМИ
 * Просмотр, статистика и управление баннерной рекламой
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Calendar, Banknote, Eye, MousePointer, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle, PlayCircle, Ban, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { GlassBannerLayer } from '@/app/components/ui/glass-banner-layer';
import { projectId, publicApiKey } from '@/utils/auth/info';
import { authClient } from '@/utils/auth/client';

const API_BASE = `${config.functionsUrl}/api/banners`;

async function bannerApiFetch(path: string, options: RequestInit = {}) {
  const token = (await authClient.auth.getSession()).data.session?.access_token || publicApiKey;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res.json();
}

interface BannerAd {
  id: string;
  campaign_name: string;
  banner_type: 'top_banner' | 'sidebar_large' | 'sidebar_small';
  dimensions: string;
  image_url: string;
  target_url: string;
  duration_days: number;
  price: number;
  start_date: string;
  end_date: string;
  status: 'pending_moderation' | 'payment_pending' | 'approved' | 'active' | 'expired' | 'rejected' | 'cancelled';
  views: number;
  clicks: number;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
}

interface MyBannerAdsProps {
  userId: string;
}

// Status mapping from backend to UI
const STATUS_MAP: Record<string, BannerAd['status']> = {
  'pending': 'pending_moderation',
  'approved': 'approved',
  'active': 'active',
  'rejected': 'rejected',
  'expired': 'expired',
  'cancelled': 'cancelled',
  'payment_pending': 'payment_pending',
};

const STATUS_CONFIG = {
  pending_moderation: {
    label: 'На модерации',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-400/30',
  },
  payment_pending: {
    label: 'Ожидает оплаты',
    icon: Banknote,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-400/30',
  },
  approved: {
    label: 'Одобрено',
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-400/30',
  },
  active: {
    label: 'Активна',
    icon: PlayCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-400/30',
  },
  expired: {
    label: 'Завершена',
    icon: Clock,
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-400/30',
  },
  rejected: {
    label: 'Отклонена',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-400/30',
  },
  cancelled: {
    label: 'Отменена',
    icon: Ban,
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-400/30',
  },
};

const BANNER_TYPE_LABELS = {
  top_banner: 'Главный баннер',
  sidebar_large: 'Боковой большой',
  sidebar_small: 'Боковой малый',
};

export function MyBannerAds({ userId }: MyBannerAdsProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'active' | 'completed' | 'rejected'>('all');
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await bannerApiFetch(`?user_id=${userId}`);
        const items = data?.data || data?.banners || [];
        const normalized: BannerAd[] = items.map((b: any) => ({
          id: String(b.id),
          campaign_name: b.title || b.campaign_name || '',
          banner_type: b.banner_type || 'top_banner',
          dimensions: b.dimensions || '',
          image_url: b.image_url || b.banner_image_url || '',
          target_url: b.link_url || b.target_url || '',
          duration_days: b.duration_days || 0,
          price: b.price || 0,
          start_date: b.start_date || '',
          end_date: b.end_date || '',
          status: STATUS_MAP[b.moderation_status || b.status] || (b.status as BannerAd['status']) || 'pending_moderation',
          views: b.impressions || b.views || 0,
          clicks: b.clicks || 0,
          rejection_reason: b.rejection_reason || '',
          admin_notes: b.moderation_comment || b.admin_notes || '',
          created_at: b.created_at || '',
        }));
        setBannerAds(normalized);
      } catch (error) {
        console.error('Error loading banner ads:', error);
        toast.error('Ошибка загрузки баннеров');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchBanners();
  }, [userId]);

  const filterAds = () => {
    switch (selectedTab) {
      case 'pending':
        return bannerAds.filter(ad => ad.status === 'pending_moderation' || ad.status === 'payment_pending');
      case 'active':
        return bannerAds.filter(ad => ad.status === 'active' || ad.status === 'approved');
      case 'completed':
        return bannerAds.filter(ad => ad.status === 'expired');
      case 'rejected':
        return bannerAds.filter(ad => ad.status === 'rejected' || ad.status === 'cancelled');
      default:
        return bannerAds;
    }
  };

  const filteredAds = filterAds();

  const calculateCTR = (views: number, clicks: number) => {
    if (views === 0) return 0;
    return ((clicks / views) * 100).toFixed(2);
  };

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handlePayment = (adId: string) => {
    toast.success('Переход к оплате...', {
      description: 'В реальном приложении откроется форма оплаты',
    });
  };

  const handleCancel = (adId: string) => {
    toast.info('Кампания отменена', {
      description: 'Средства будут возвращены в течение 3-5 рабочих дней',
    });
  };

  // Статистика
  const totalStats = {
    active: bannerAds.filter(ad => ad.status === 'active').length,
    totalViews: bannerAds.reduce((sum, ad) => sum + ad.views, 0),
    totalClicks: bannerAds.reduce((sum, ad) => sum + ad.clicks, 0),
    totalSpent: bannerAds.filter(ad => ad.status !== 'rejected' && ad.status !== 'cancelled').reduce((sum, ad) => sum + ad.price, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-3 text-gray-400">Загрузка баннеров...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2 sm:mb-3"
        >
          Мои баннерные кампании
        </motion.h1>
        <p className="text-gray-400 text-xs sm:text-sm md:text-base">
          Управляйте своей визуальной рекламой на платформе
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30"
        >
          <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalStats.active}</p>
          <p className="text-xs sm:text-sm text-gray-300">Активных</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30"
        >
          <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalStats.totalViews.toLocaleString('ru-RU')}</p>
          <p className="text-xs sm:text-sm text-gray-300">Показов</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30"
        >
          <MousePointer className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{totalStats.totalClicks.toLocaleString('ru-RU')}</p>
          <p className="text-xs sm:text-sm text-gray-300">Кликов</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
        >
          <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mb-1 sm:mb-2" />
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{Math.round(totalStats.totalSpent / 1000)}K ₽</p>
          <p className="text-xs sm:text-sm text-gray-300">Потрачено</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Все', count: bannerAds.length },
          { id: 'pending', label: 'Ожидают', count: bannerAds.filter(ad => ad.status === 'pending_moderation' || ad.status === 'payment_pending').length },
          { id: 'active', label: 'Активные', count: bannerAds.filter(ad => ad.status === 'active' || ad.status === 'approved').length },
          { id: 'completed', label: 'Завершенные', count: bannerAds.filter(ad => ad.status === 'expired').length },
          { id: 'rejected', label: 'Отклоненные', count: bannerAds.filter(ad => ad.status === 'rejected' || ad.status === 'cancelled').length },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-sm sm:text-base ${
              selectedTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label} ({tab.count})
          </motion.button>
        ))}
      </div>

      {/* Banner Cards Grid - адаптивная сетка как у видео */}
      <AnimatePresence mode="wait">
        {filteredAds.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-8 sm:p-12 text-center rounded-2xl bg-white/5 border border-white/10 border-dashed"
          >
            <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">Кампаний не найдено</p>
            <p className="text-xs sm:text-sm text-gray-500">Создайте свою первую баннерную кампанию</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAds.map((ad, index) => {
              const statusConfig = STATUS_CONFIG[ad.status];
              const StatusIcon = statusConfig.icon;
              const daysRemaining = getDaysRemaining(ad.end_date);
              const ctr = calculateCTR(ad.views, ad.clicks);

              return (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassBannerLayer padding="none" className="group hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                  {/* Banner Image */}
                  <div className="relative aspect-video overflow-hidden rounded-t-[24px]">
                    <img
                      src={ad.image_url}
                      alt={ad.campaign_name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-lg ${statusConfig.bg} border ${statusConfig.border} backdrop-blur-sm`}>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                        <span className={`text-xs font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Days Remaining Badge */}
                    {ad.status === 'active' && daysRemaining !== null && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs font-semibold">
                        {daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                        {ad.campaign_name}
                      </h3>
                      <p className="text-gray-400 text-sm">{BANNER_TYPE_LABELS[ad.banner_type]}</p>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ad.duration_days} дней
                      </span>
                      <span className="flex items-center gap-1">
                        <Banknote className="w-3 h-3" />
                        {Math.round(ad.price / 1000)}K ₽
                      </span>
                    </div>

                    {/* Dates */}
                    {ad.start_date && ad.end_date && (
                      <div className="text-xs text-gray-400">
                        {new Date(ad.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - {new Date(ad.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </div>
                    )}

                    {/* Statistics */}
                    {(ad.status === 'active' || ad.status === 'expired') && (
                      <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {ad.views > 1000 ? `${Math.round(ad.views / 1000)}K` : ad.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointer className="w-4 h-4" />
                          {ad.clicks > 1000 ? `${Math.round(ad.clicks / 1000)}K` : ad.clicks}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {ctr}%
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {ad.status === 'rejected' && ad.rejection_reason && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-400/30">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="text-red-400 text-xs">{ad.rejection_reason}</div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {ad.status === 'payment_pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePayment(ad.id)}
                          className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Banknote className="w-4 h-4" />
                          Оплатить
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCancel(ad.id)}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-300"
                        >
                          <Ban className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}

                    {ad.status === 'active' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Статистика
                      </motion.button>
                    )}
                  </div>
                  </GlassBannerLayer>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}