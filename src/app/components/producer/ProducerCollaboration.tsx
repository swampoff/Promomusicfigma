/**
 * PRODUCER COLLABORATION - Отправка предложений артистам
 * Продюсер создаёт офферы (биты, услуги) и отслеживает ответы
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Plus, Send, Music2, Sliders, Headphones, Sparkles,
  CheckCircle2, XCircle, MessageSquare, Clock, Coins,
  Loader2, RefreshCw, ChevronDown, X, Search, ArrowRight,
  Tag, User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createOffer, fetchProducerOffers, fetchCollabChat, sendCollabMessage,
  type CollabOffer, type CollabMessage,
} from '@/utils/api/collaboration-api';

const TYPE_OPTIONS = [
  { value: 'beat', label: 'Бит', icon: Music2 },
  { value: 'mixing', label: 'Сведение', icon: Sliders },
  { value: 'mastering', label: 'Мастеринг', icon: Headphones },
  { value: 'arrangement', label: 'Аранжировка', icon: Music2 },
  { value: 'collab_track', label: 'Совместный трек', icon: Sparkles },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/20',
  accepted: 'text-green-400 bg-green-500/20',
  declined: 'text-red-400 bg-red-500/20',
  discussion: 'text-blue-400 bg-blue-500/20',
  completed: 'text-emerald-400 bg-emerald-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидание', accepted: 'Принято', declined: 'Отклонено',
  discussion: 'Обсуждение', completed: 'Завершено', cancelled: 'Отменено',
};

// Демо-артисты
const DEMO_ARTISTS = [
  { id: 'artist-sandra', name: 'Сандра', genre: 'Pop' },
  { id: 'artist-liana', name: 'Лиана', genre: 'R&B' },
  { id: 'artist-dan', name: 'Дэн', genre: 'Electronic' },
  { id: 'artist-maxam', name: 'Максам', genre: 'Hip-Hop' },
  { id: 'artist-timur', name: 'Тимур', genre: 'Trap' },
  { id: 'artist-nika', name: 'Ника', genre: 'Indie' },
  { id: 'artist-roman', name: 'Роман', genre: 'Rock' },
  { id: 'artist-alisa', name: 'Алиса', genre: 'Jazz' },
];

interface ProducerCollaborationProps {
  producerId: string;
  producerName: string;
}

export function ProducerCollaboration({ producerId, producerName }: ProducerCollaborationProps) {
  const [offers, setOffers] = useState<CollabOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CollabOffer | null>(null);
  const [chatMessages, setChatMessages] = useState<CollabMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formArtist, setFormArtist] = useState(DEMO_ARTISTS[0]);
  const [formType, setFormType] = useState('beat');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formBpm, setFormBpm] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formGenre, setFormGenre] = useState('');
  const [creating, setCreating] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    const data = await fetchProducerOffers(producerId);
    setOffers(data);
    setLoading(false);
  }, [producerId]);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const handleCreate = async () => {
    if (!formTitle.trim()) { toast.error('Укажите название'); return; }
    setCreating(true);
    const res = await createOffer({
      producerId,
      producerName,
      artistId: formArtist.id,
      artistName: formArtist.name,
      type: formType,
      title: formTitle,
      description: formDesc,
      price: formPrice ? Number(formPrice) : undefined,
      bpm: formBpm ? Number(formBpm) : undefined,
      key: formKey || undefined,
      genre: formGenre || undefined,
    });
    setCreating(false);
    if (res.success) {
      toast.success(`Предложение отправлено ${formArtist.name}!`);
      setShowCreate(false);
      setFormTitle(''); setFormDesc(''); setFormPrice(''); setFormBpm(''); setFormKey(''); setFormGenre('');
      loadOffers();
    } else {
      toast.error('Ошибка: ' + (res.error || 'Попробуйте позже'));
    }
  };

  const openChat = async (offer: CollabOffer) => {
    setSelectedOffer(offer);
    setChatLoading(true);
    const msgs = await fetchCollabChat(offer.id);
    setChatMessages(msgs);
    setChatLoading(false);
  };

  const handleSendChat = async () => {
    if (!chatText.trim() || !selectedOffer) return;
    const text = chatText.trim();
    setChatText('');
    const res = await sendCollabMessage(selectedOffer.id, {
      senderId: producerId, senderName: producerName, senderRole: 'producer', text,
    });
    if (res.success) {
      const msgs = await fetchCollabChat(selectedOffer.id);
      setChatMessages(msgs);
    }
  };

  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    discussion: offers.filter(o => o.status === 'discussion').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Handshake className="w-6 h-6 text-teal-400" />
            Коллаборации с артистами
          </h2>
          <p className="text-xs text-gray-500 mt-1">Отправляйте предложения артистам напрямую</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />Новое предложение
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Всего', value: stats.total, color: 'text-teal-400' },
          { label: 'Ожидают', value: stats.pending, color: 'text-amber-400' },
          { label: 'Принято', value: stats.accepted, color: 'text-green-400' },
          { label: 'Обсуждение', value: stats.discussion, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-[#12122a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white">Новое предложение</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-white/5 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                {/* Artist Select */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Артист *</label>
                  <select value={formArtist.id} onChange={e => setFormArtist(DEMO_ARTISTS.find(a => a.id === e.target.value) || DEMO_ARTISTS[0])}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/40">
                    {DEMO_ARTISTS.map(a => <option key={a.id} value={a.id} className="bg-[#0a0a14]">{a.name} - {a.genre}</option>)}
                  </select>
                </div>
                {/* Type */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Тип</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setFormType(opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          formType === opt.value ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                        <opt.icon className="w-3.5 h-3.5" />{opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Title */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Название *</label>
                  <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Trap Beat 140 BPM"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
                </div>
                {/* Description */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Описание</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={3} placeholder="Опишите предложение..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40 resize-none" />
                </div>
                {/* Price + BPM + Key */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Цена, P</label>
                    <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="5000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">BPM</label>
                    <input type="number" value={formBpm} onChange={e => setFormBpm(e.target.value)} placeholder="140"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Тональность</label>
                    <input type="text" value={formKey} onChange={e => setFormKey(e.target.value)} placeholder="Am"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
                  </div>
                </div>
                {/* Genre */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Жанр</label>
                  <input type="text" value={formGenre} onChange={e => setFormGenre(e.target.value)} placeholder="Trap, Hip-Hop"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Отмена</button>
                <button onClick={handleCreate} disabled={!formTitle.trim() || creating}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-40 flex items-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {creating ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/5 p-5 h-28">
              <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))
        ) : offers.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Handshake className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Вы ещё не отправляли предложений</p>
          </div>
        ) : (
          offers.map((offer, i) => {
            const statusColor = STATUS_COLORS[offer.status] || STATUS_COLORS.pending;
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{offer.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Артист: {offer.artistName} - {new Date(offer.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                    {STATUS_LABELS[offer.status] || offer.status}
                  </span>
                </div>
                {offer.description && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{offer.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-[10px] text-gray-500">
                    {offer.price && <span>{offer.price.toLocaleString()} P</span>}
                    {offer.bpm && <span>{offer.bpm} BPM</span>}
                    {offer.genre && <span>{offer.genre}</span>}
                  </div>
                  <button
                    onClick={() => openChat(offer)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />Чат
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOffer(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-[#12122a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[70vh]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedOffer.title}</h3>
                  <p className="text-[10px] text-gray-500">Чат с {selectedOffer.artistName}</p>
                </div>
                <button onClick={() => setSelectedOffer(null)} className="p-1.5 hover:bg-white/5 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {chatLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-teal-400" /></div>
                ) : chatMessages.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-500">Начните диалог</p>
                ) : chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderRole === 'producer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${
                      msg.senderRole === 'producer' ? 'bg-teal-500/20 text-teal-100 rounded-br-sm' : 'bg-white/5 text-gray-300 rounded-bl-sm'
                    }`}>
                      <span className="text-[9px] font-semibold block mb-0.5 opacity-50">{msg.senderName}</span>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10">
                <input type="text" value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="Сообщение..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/40" />
                <button onClick={handleSendChat} disabled={!chatText.trim()} className="p-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-xl transition-colors disabled:opacity-30">
                  <Send className="w-4 h-4 text-teal-400" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}