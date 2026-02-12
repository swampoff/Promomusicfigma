/**
 * DJ PROMOTION - Продвижение диджея
 * Питчинг радиостанциям, баннеры, социальные сети
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Radio, Send, BarChart3, Eye, TrendingUp, Target,
  Music, Megaphone, Share2, Globe, CheckCircle, Clock, XCircle
} from 'lucide-react';

interface PitchItem {
  id: string;
  station: string;
  mix: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined';
  listeners?: string;
}

interface CampaignItem {
  id: string;
  title: string;
  type: 'banner' | 'social' | 'email';
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  budget: number;
  spent: number;
}

const MOCK_PITCHES: PitchItem[] = [
  { id: '1', station: 'PROMO.FM', mix: 'Night Session Vol.3', sentAt: '2026-02-08', status: 'accepted', listeners: '1.2M' },
  { id: '2', station: 'Sound Wave', mix: 'Techno Pulse', sentAt: '2026-02-06', status: 'pending', listeners: '680K' },
  { id: '3', station: 'Night Vibes', mix: 'Deep House Mix', sentAt: '2026-02-01', status: 'accepted', listeners: '920K' },
  { id: '4', station: 'Retro Gold', mix: 'Retro Remix Pack', sentAt: '2026-01-28', status: 'declined', listeners: '430K' },
  { id: '5', station: 'Euro Dance FM', mix: 'Club Anthem', sentAt: '2026-01-20', status: 'pending', listeners: '550K' },
];

const MOCK_CAMPAIGNS: CampaignItem[] = [
  { id: '1', title: 'Ночная сессия - баннер лендинг', type: 'banner', status: 'active', impressions: 24500, clicks: 890, budget: 5000, spent: 3200 },
  { id: '2', title: 'Промо-пост VK / Telegram', type: 'social', status: 'active', impressions: 18200, clicks: 1340, budget: 3000, spent: 2100 },
  { id: '3', title: 'Email: приглашение на фестиваль', type: 'email', status: 'completed', impressions: 5400, clicks: 620, budget: 1500, spent: 1500 },
];

const pitchStatusIcons: Record<string, typeof CheckCircle> = { pending: Clock, accepted: CheckCircle, declined: XCircle };
const pitchStatusColors: Record<string, string> = { pending: 'text-yellow-400', accepted: 'text-green-400', declined: 'text-red-400' };
const pitchStatusLabels: Record<string, string> = { pending: 'На рассмотрении', accepted: 'Принят', declined: 'Отклонен' };

const campaignTypeLabels: Record<string, string> = { banner: 'Баннер', social: 'Соц. сети', email: 'Email' };
const campaignTypeColors: Record<string, string> = { banner: 'bg-purple-500/20 text-purple-300', social: 'bg-blue-500/20 text-blue-300', email: 'bg-emerald-500/20 text-emerald-300' };

export function DjPromotion() {
  const [activeTab, setActiveTab] = useState<'pitching' | 'campaigns'>('pitching');

  const pitchStats = {
    total: MOCK_PITCHES.length,
    accepted: MOCK_PITCHES.filter(p => p.status === 'accepted').length,
    pending: MOCK_PITCHES.filter(p => p.status === 'pending').length,
    rate: Math.round((MOCK_PITCHES.filter(p => p.status === 'accepted').length / MOCK_PITCHES.length) * 100),
  };

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">Продвижение</h1>
        <p className="text-xs xs:text-sm text-gray-400 mt-0.5">Питчинг, рекламные кампании, охват аудитории</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-3">
        {[
          { label: 'Питчинги', value: pitchStats.total, icon: Send, color: 'text-purple-400' },
          { label: 'Принято', value: pitchStats.accepted, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Конверсия', value: `${pitchStats.rate}%`, icon: Target, color: 'text-violet-400' },
          { label: 'Кампании', value: MOCK_CAMPAIGNS.length, icon: Megaphone, color: 'text-pink-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
          >
            <s.icon className={`w-4 h-4 xs:w-5 xs:h-5 ${s.color} mb-1.5`} />
            <div className="text-lg xs:text-xl sm:text-2xl font-black text-white">{s.value}</div>
            <div className="text-[10px] xs:text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {[
          { id: 'pitching' as const, label: 'Питчинг радиостанциям', icon: Radio },
          { id: 'campaigns' as const, label: 'Рекламные кампании', icon: Megaphone },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 xs:px-4 py-2.5 text-xs xs:text-sm font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'text-purple-300 border-purple-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Pitching Tab */}
      {activeTab === 'pitching' && (
        <div className="space-y-2.5 xs:space-y-3">
          {MOCK_PITCHES.map((pitch, i) => {
            const StatusIcon = pitchStatusIcons[pitch.status];
            return (
              <motion.div
                key={pitch.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-3.5 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/20 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 xs:w-11 xs:h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Radio className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm xs:text-base font-bold text-white truncate">{pitch.station}</h3>
                      <div className="flex items-center gap-2 text-[10px] xs:text-xs text-gray-500">
                        <span className="flex items-center gap-0.5"><Music className="w-3 h-3" />{pitch.mix}</span>
                        <span>{pitch.listeners} слушателей</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusIcon className={`w-4 h-4 ${pitchStatusColors[pitch.status]}`} />
                    <span className={`text-[10px] xs:text-xs font-bold ${pitchStatusColors[pitch.status]}`}>
                      {pitchStatusLabels[pitch.status]}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <button className="w-full py-3 border-2 border-dashed border-purple-500/20 rounded-xl text-sm font-bold text-purple-400 hover:bg-purple-500/5 hover:border-purple-500/40 transition-all">
            <Send className="w-4 h-4 inline mr-1.5" /> Новый питчинг
          </button>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-2.5 xs:space-y-3">
          {MOCK_CAMPAIGNS.map((campaign, i) => {
            const ctr = campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : '0';
            const budgetPercent = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-3.5 xs:p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-purple-500/20 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-sm xs:text-base font-bold text-white truncate">{campaign.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] xs:text-[10px] font-bold flex-shrink-0 ${campaignTypeColors[campaign.type]}`}>
                    {campaignTypeLabels[campaign.type]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-2.5">
                  <div>
                    <div className="text-xs xs:text-sm font-black text-white">{(campaign.impressions / 1000).toFixed(1)}K</div>
                    <div className="text-[9px] xs:text-[10px] text-gray-500 flex items-center justify-center gap-0.5"><Eye className="w-3 h-3" />Показы</div>
                  </div>
                  <div>
                    <div className="text-xs xs:text-sm font-black text-white">{campaign.clicks}</div>
                    <div className="text-[9px] xs:text-[10px] text-gray-500 flex items-center justify-center gap-0.5"><TrendingUp className="w-3 h-3" />Клики</div>
                  </div>
                  <div>
                    <div className="text-xs xs:text-sm font-black text-white">{ctr}%</div>
                    <div className="text-[9px] xs:text-[10px] text-gray-500 flex items-center justify-center gap-0.5"><BarChart3 className="w-3 h-3" />CTR</div>
                  </div>
                </div>
                {/* Budget bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all"
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] xs:text-[10px] text-gray-500 flex-shrink-0">{campaign.spent}/{campaign.budget} &#8381;</span>
                </div>
              </motion.div>
            );
          })}
          <button className="w-full py-3 border-2 border-dashed border-purple-500/20 rounded-xl text-sm font-bold text-purple-400 hover:bg-purple-500/5 hover:border-purple-500/40 transition-all">
            <Megaphone className="w-4 h-4 inline mr-1.5" /> Новая кампания
          </button>
        </div>
      )}
    </div>
  );
}
