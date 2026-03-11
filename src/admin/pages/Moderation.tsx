import config from '@/config/environment';
/**
 * UNIFIED MODERATION PAGE - Единая страница модерации для всех типов контента
 * Real API stats for tracks, concerts, banners; 0 for types without backend
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Music, Video, Calendar, FileText, Image, ListMusic, Megaphone, Box, Award,
  CheckCircle, XCircle, Clock, AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';
import { TrackModeration } from './TrackModeration';
import { VideoModeration } from './VideoModeration';
import { ConcertModeration } from './ConcertModeration';
import { NewsModeration } from './NewsModeration';
import { BannerModeration } from './BannerModeration';
import { PitchingModeration } from './PitchingModeration';
import { MarketingModeration } from './MarketingModeration';
import { Production360Moderation } from './Production360Moderation';
import { PromoLabModeration } from './PromoLabModeration';

const API_BASE = `${config.functionsUrl}/api`;

async function statsFetch(path: string) {
  const token = (await supabase.auth.getSession()).data.session?.access_token || publicAnonKey;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return res.json();
}

type ModerationType = 'tracks' | 'videos' | 'concerts' | 'news' | 'banners' | 'pitchings' | 'marketing' | 'production360' | 'promolab';

interface TabConfig {
  id: ModerationType;
  label: string;
  icon: any;
  price: string;
}

interface TabStats {
  pending: number;
  approved: number;
  rejected: number;
}

const EMPTY_STATS: TabStats = { pending: 0, approved: 0, rejected: 0 };

export function Moderation() {
  const [activeTab, setActiveTab] = useState<ModerationType>('tracks');
  const [stats, setStats] = useState<Record<ModerationType, TabStats>>({
    tracks: EMPTY_STATS,
    videos: EMPTY_STATS,
    concerts: EMPTY_STATS,
    news: EMPTY_STATS,
    banners: EMPTY_STATS,
    pitchings: EMPTY_STATS,
    marketing: EMPTY_STATS,
    production360: EMPTY_STATS,
    promolab: EMPTY_STATS,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [trackRes, concertRes, bannerRes] = await Promise.all([
          statsFetch('/track-moderation/stats').catch(() => ({})),
          statsFetch('/concert-moderation/stats').catch(() => ({})),
          statsFetch('/banners/moderation/pending').catch(() => ({ data: [] })),
        ]);

        const ts = trackRes?.data || trackRes || {};
        const cs = concertRes?.data || concertRes || {};
        const bannerList = bannerRes?.data || [];

        setStats(prev => ({
          ...prev,
          tracks: {
            pending: ts.pending || 0,
            approved: ts.approved || 0,
            rejected: ts.rejected || 0,
          },
          concerts: {
            pending: cs.pending || 0,
            approved: cs.approved || 0,
            rejected: cs.rejected || 0,
          },
          banners: {
            pending: Array.isArray(bannerList) ? bannerList.length : 0,
            approved: 0,
            rejected: 0,
          },
        }));
      } catch (err) {
        console.error('Error fetching moderation stats:', err);
      }
    };
    fetchStats();
  }, []);

  // ==================== TABS CONFIG ====================
  const tabs: TabConfig[] = [
    { id: 'tracks', label: 'Треки', icon: Music, price: '50 \u{1FA99}' },
    { id: 'videos', label: 'Видео', icon: Video, price: '\u{2014}' },
    { id: 'concerts', label: 'Концерты', icon: Calendar, price: '30 \u{1FA99}' },
    { id: 'news', label: 'Новости', icon: FileText, price: '\u{2014}' },
    { id: 'banners', label: 'Баннеры', icon: Image, price: '\u{2014}' },
    { id: 'pitchings', label: 'Питчинг', icon: ListMusic, price: '\u{2014}' },
    { id: 'marketing', label: 'Маркетинг', icon: Megaphone, price: '\u{2014}' },
    { id: 'production360', label: '360°', icon: Box, price: '\u{2014}' },
    { id: 'promolab', label: 'PromoLab', icon: Award, price: 'БЕСПЛАТНО' },
  ];

  const totalPending = Object.values(stats).reduce((sum, s) => sum + s.pending, 0);
  const totalApproved = Object.values(stats).reduce((sum, s) => sum + s.approved, 0);

  return (
    <div className="space-y-3 xs:space-y-4 md:space-y-6 px-0 xs:px-1 md:px-0">
      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-lg xs:rounded-xl md:rounded-2xl border border-white/10 p-3 xs:p-4 md:p-6"
      >
        {/* Title & Global Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 xs:mb-5 md:mb-6">
          <div>
            <h1 className="text-lg xs:text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">Модерация контента</h1>
            <p className="text-[10px] xs:text-xs md:text-base text-gray-400">Проверяйте и одобряйте весь загруженный контент</p>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-[10px] xs:text-xs text-gray-400">На модерации</div>
              <div className="text-lg xs:text-xl md:text-2xl font-bold text-yellow-400">{totalPending}</div>
            </div>
            <div className="px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-[10px] xs:text-xs text-gray-400">Одобрено</div>
              <div className="text-lg xs:text-xl md:text-2xl font-bold text-green-400">{totalApproved}</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 xs:mb-5 md:mb-6 p-2.5 xs:p-3 md:p-4 rounded-lg xs:rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] xs:text-xs md:text-sm font-semibold text-blue-400 mb-0.5 xs:mb-1">Единая модерация</h3>
            <p className="text-[10px] xs:text-xs text-gray-300">
              Все типы контента собраны в одном месте. Переключайтесь между разделами и модерируйте эффективно. 
              При одобрении контента начисляются коины артисту.
            </p>
          </div>
        </div>

        {/* ==================== TABS ==================== */}
        <div className="flex gap-1.5 xs:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const tabStats = stats[tab.id];
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-shrink-0 px-2.5 xs:px-3 md:px-4 py-2 xs:py-2.5 md:py-3 rounded-lg xs:rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <div className="flex items-center gap-1 xs:gap-1.5 md:gap-2">
                  <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
                  <div className="text-left">
                    <div className="text-[10px] xs:text-xs md:text-sm font-semibold">{tab.label}</div>
                    <div className={`text-[10px] xs:text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {tab.price}
                    </div>
                  </div>
                </div>
                
                {/* Pending Badge */}
                {tabStats.pending > 0 && (
                  <div className={`absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 xs:w-5 xs:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[9px] xs:text-xs font-bold ${
                    isActive ? 'bg-yellow-400 text-gray-900' : 'bg-yellow-500 text-white'
                  }`}>
                    {tabStats.pending}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Stats Bar */}
        <div className="mt-3 xs:mt-3.5 md:mt-4 grid grid-cols-3 gap-1.5 xs:gap-2">
          <div className="px-2 py-1 xs:px-2.5 xs:py-1.5 md:px-3 md:py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
            <div className="text-[10px] xs:text-xs text-gray-400">Ожидают</div>
            <div className="text-sm xs:text-base md:text-lg font-bold text-yellow-400">
              {stats[activeTab].pending}
            </div>
          </div>
          <div className="px-2 py-1 xs:px-2.5 xs:py-1.5 md:px-3 md:py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-[10px] xs:text-xs text-gray-400">Одобрено</div>
            <div className="text-sm xs:text-base md:text-lg font-bold text-green-400">
              {stats[activeTab].approved}
            </div>
          </div>
          <div className="px-2 py-1 xs:px-2.5 xs:py-1.5 md:px-3 md:py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-[10px] xs:text-xs text-gray-400">Отклонено</div>
            <div className="text-sm xs:text-base md:text-lg font-bold text-red-400">
              {stats[activeTab].rejected}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ==================== CONTENT AREA ==================== */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'tracks' && <TrackModeration />}
        {activeTab === 'videos' && <VideoModeration />}
        {activeTab === 'concerts' && <ConcertModeration />}
        {activeTab === 'news' && <NewsModeration />}
        {activeTab === 'banners' && <BannerModeration />}
        {activeTab === 'pitchings' && <PitchingModeration />}
        {activeTab === 'marketing' && <MarketingModeration />}
        {activeTab === 'production360' && <Production360Moderation />}
        {activeTab === 'promolab' && <PromoLabModeration />}
      </motion.div>
    </div>
  );
}
