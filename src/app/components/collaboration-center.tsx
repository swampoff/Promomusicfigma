/**
 * COLLABORATION CENTER - Центр коллабораций артиста
 * Просмотр предложений от продюсеров, чат по офферам
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Music2, Sliders, Headphones, Mic2, Sparkles, Ghost,
  CheckCircle2, XCircle, MessageSquare, Clock, Coins, Tag,
  Send, ArrowRight, Filter, Loader2, AlertCircle, RefreshCw,
  Play, ChevronDown, X, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchArtistOffers, respondToOffer, fetchCollabChat,
  sendCollabMessage, type CollabOffer, type CollabMessage,
} from '@/utils/api/collaboration-api';
import { useMessages } from '@/utils/contexts/MessagesContext';

const TYPE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  beat: { label: 'Бит', icon: Music2, color: 'text-purple-400 bg-purple-500/15' },
  mixing: { label: 'Сведение', icon: Sliders, color: 'text-teal-400 bg-teal-500/15' },
  mastering: { label: 'Мастеринг', icon: Headphones, color: 'text-blue-400 bg-blue-500/15' },
  arrangement: { label: 'Аранжировка', icon: Music2, color: 'text-amber-400 bg-amber-500/15' },
  ghost_production: { label: 'Гост-продакшн', icon: Ghost, color: 'text-slate-400 bg-slate-500/15' },
  collab_track: { label: 'Совместный трек', icon: Sparkles, color: 'text-pink-400 bg-pink-500/15' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Новое', color: 'text-amber-400 bg-amber-500/20' },
  accepted: { label: 'Принято', color: 'text-green-400 bg-green-500/20' },
  declined: { label: 'Отклонено', color: 'text-red-400 bg-red-500/20' },
  discussion: { label: 'Обсуждение', color: 'text-blue-400 bg-blue-500/20' },
  completed: { label: 'Завершено', color: 'text-emerald-400 bg-emerald-500/20' },
  cancelled: { label: 'Отменено', color: 'text-slate-400 bg-slate-500/20' },
};

interface CollaborationCenterProps {
  artistId: string;
  artistName: string;
  onOpenInMessages?: (producerId: string, producerName: string) => void;
}

export function CollaborationCenter({ artistId, artistName, onOpenInMessages }: CollaborationCenterProps) {
  const [offers, setOffers] = useState<CollabOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'discussion'>('all');
  const [selectedOffer, setSelectedOffer] = useState<CollabOffer | null>(null);
  const [chatMessages, setChatMessages] = useState<CollabMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [respondLoading, setRespondLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgCtx = useMessages();

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchArtistOffers(artistId);
      setOffers(data);
    } catch (err) {
      console.error('Failed to load collab offers:', err);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const filtered = offers.filter(o => filter === 'all' || o.status === filter);

  const handleRespond = async (offerId: string, status: 'accepted' | 'declined' | 'discussion', comment?: string) => {
    setRespondLoading(true);
    const res = await respondToOffer(offerId, { artistId, status, comment });
    setRespondLoading(false);
    if (res.success) {
      toast.success(status === 'accepted' ? 'Предложение принято!' : status === 'declined' ? 'Предложение отклонено' : 'Начато обсуждение');
      loadOffers();
      if (selectedOffer?.id === offerId) {
        setSelectedOffer(prev => prev ? { ...prev, status } : null);
      }
    } else {
      toast.error('Ошибка: ' + (res.error || 'Неизвестная ошибка'));
    }
  };

  const loadChat = async (offerId: string) => {
    setChatLoading(true);
    const msgs = await fetchCollabChat(offerId);
    setChatMessages(msgs);
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleOpenOffer = (offer: CollabOffer) => {
    setSelectedOffer(offer);
    loadChat(offer.id);
  };

  const handleSendMessage = async () => {
    if (!chatText.trim() || !selectedOffer) return;
    const text = chatText.trim();
    setChatText('');
    const res = await sendCollabMessage(selectedOffer.id, {
      senderId: artistId,
      senderName: artistName,
      senderRole: 'artist',
      text,
    });
    if (res.success) {
      loadChat(selectedOffer.id);

      // ── Sync to unified DM system ──
      if (msgCtx) {
        try {
          const conv = await msgCtx.getOrCreateConversation(
            {
              userId: selectedOffer.producerId,
              userName: selectedOffer.producerName,
              role: 'producer',
              avatar: selectedOffer.producerAvatar,
            },
            'collab',
            selectedOffer.id,
          );
          if (conv) {
            await msgCtx.sendMessage(conv.id, text);
          }
        } catch (err) {
          console.error('[CollaborationCenter] DM sync error:', err);
        }
      }
    }
  };

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Только что';
    if (hours < 24) return `${hours}ч назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}д назад`;
    return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const pendingCount = offers.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Handshake className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
            Коллаборации
          </h1>
          <p className="text-sm text-slate-400 mt-1">Предложения от продюсеров и совместные проекты</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
              {pendingCount} новых
            </span>
          )}
          <button onClick={loadOffers} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          ['all', `Все (${offers.length})`],
          ['pending', `Новые (${offers.filter(o => o.status === 'pending').length})`],
          ['accepted', 'Принятые'],
          ['discussion', 'В обсуждении'],
        ] as const).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Offers List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
              <Handshake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Нет предложений</p>
              <p className="text-xs text-slate-600 mt-1">Продюсеры смогут отправлять вам предложения</p>
            </div>
          ) : (
            filtered.map((offer, i) => {
              const typeInfo = TYPE_LABELS[offer.type] || TYPE_LABELS.beat;
              const statusInfo = STATUS_MAP[offer.status] || STATUS_MAP.pending;
              const TypeIcon = typeInfo.icon;
              const isSelected = selectedOffer?.id === offer.id;
              return (
                <motion.button
                  key={offer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleOpenOffer(offer)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white truncate">{offer.title}</h3>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">от {offer.producerName}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span>{typeInfo.label}</span>
                        {offer.price && <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" />{offer.price.toLocaleString()} P</span>}
                        {offer.bpm && <span>{offer.bpm} BPM</span>}
                        <span>{formatDate(offer.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selectedOffer ? (
            <motion.div
              key={selectedOffer.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Offer Header */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{selectedOffer.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>от {selectedOffer.producerName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_MAP[selectedOffer.status]?.color}`}>
                        {STATUS_MAP[selectedOffer.status]?.label}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedOffer(null)} className="p-1.5 hover:bg-white/5 rounded-lg">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {selectedOffer.description && (
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">{selectedOffer.description}</p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedOffer.genre && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-[10px] text-slate-400">
                      <Tag className="w-3 h-3" />{selectedOffer.genre}
                    </span>
                  )}
                  {selectedOffer.bpm && (
                    <span className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-slate-400">{selectedOffer.bpm} BPM</span>
                  )}
                  {selectedOffer.key && (
                    <span className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-slate-400">Key: {selectedOffer.key}</span>
                  )}
                  {selectedOffer.price && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg text-[10px] text-emerald-400 font-bold">
                      <Coins className="w-3 h-3" />{selectedOffer.price.toLocaleString()} P
                    </span>
                  )}
                </div>

                {/* Action buttons (only for pending) */}
                {selectedOffer.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleRespond(selectedOffer.id, 'accepted')}
                      disabled={respondLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />Принять
                    </button>
                    <button
                      onClick={() => handleRespond(selectedOffer.id, 'discussion')}
                      disabled={respondLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />Обсудить
                    </button>
                    <button
                      onClick={() => handleRespond(selectedOffer.id, 'declined')}
                      disabled={respondLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />Отклонить
                    </button>
                  </div>
                )}
              </div>

              {/* Chat */}
              <div className="flex flex-col h-[380px]">
                <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500 font-medium">Чат по предложению</span>
                  </div>
                  {onOpenInMessages && selectedOffer && (
                    <button
                      onClick={() => onOpenInMessages(selectedOffer.producerId, selectedOffer.producerName)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Открыть в Сообщениях
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chatLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Начните обсуждение</p>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.senderRole === 'artist' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          msg.senderRole === 'artist'
                            ? 'bg-amber-500/20 text-amber-100 rounded-br-md'
                            : 'bg-white/5 text-slate-300 rounded-bl-md'
                        }`}>
                          <p className="text-[10px] font-semibold mb-0.5 opacity-60">{msg.senderName}</p>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                          <p className="text-[9px] opacity-40 mt-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="px-4 py-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatText}
                      onChange={e => setChatText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Написать сообщение..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/30"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatText.trim()}
                      className="p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl transition-colors disabled:opacity-30"
                    >
                      <Send className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="text-center">
                <Handshake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Выберите предложение</p>
                <p className="text-xs text-slate-600 mt-1">для просмотра деталей и чата</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}