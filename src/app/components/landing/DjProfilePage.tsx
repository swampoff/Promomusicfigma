/**
 * DJ PROFILE PAGE — Детальный публичный профиль диджея
 * Портфолио, миксы, отзывы, календарь, букинг
 * Открывается из DJ Marketplace по клику на карточку
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Star, MapPin, Clock, Calendar, CheckCircle2,
  Disc3, Headphones, Play, Pause, Heart, Share2, Globe,
  DollarSign, Users, Zap, Award, Music, MessageSquare,
  ChevronRight, ExternalLink, Mail
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface DjProfileData {
  id: string;
  name: string;
  photo: string;
  city: string;
  genres: string[];
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  experience: string;
  verified: boolean;
  available: boolean;
  topGenre: string;
  completedGigs: number;
  bio: string;
  tags: string[];
}

interface DjProfilePageProps {
  dj: DjProfileData;
  onBack: () => void;
  onBook: () => void;
}

/* ═══════ MOCK EXTENDED DATA ═══════ */

interface Mix {
  id: string;
  title: string;
  genre: string;
  duration: string;
  plays: number;
  likes: number;
}

interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  text: string;
  eventType: string;
}

const getMixes = (djId: string): Mix[] => [
  { id: 'm1', title: 'Summer Vibes 2025', genre: 'Deep House', duration: '1:12:00', plays: 1240, likes: 87 },
  { id: 'm2', title: 'Late Night Sessions', genre: 'Techno', duration: '58:30', plays: 890, likes: 64 },
  { id: 'm3', title: 'Wedding Mix - Romantic', genre: 'Open Format', duration: '45:00', plays: 2100, likes: 152 },
  { id: 'm4', title: 'Club Banger Vol.3', genre: 'House', duration: '1:30:00', plays: 670, likes: 45 },
];

const getReviews = (djId: string): Review[] => [
  { id: 'r1', author: 'Анна К.', date: '14 янв 2026', rating: 5, text: 'Отличный DJ! Все гости танцевали до утра. Отличный подбор музыки и контакт с залом.', eventType: 'Свадьба' },
  { id: 'r2', author: 'Максим Д.', date: '28 дек 2025', rating: 5, text: 'Корпоратив прошёл на ура! DJ подготовился, знал наши предпочтения заранее.', eventType: 'Корпоратив' },
  { id: 'r3', author: 'Event PRO', date: '15 дек 2025', rating: 4, text: 'Профессиональный подход, пришёл с собственным оборудованием. Рекомендуем.', eventType: 'Клубное мероприятие' },
];

const getCalendar = (): { date: string; available: boolean }[] => {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push({
      date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' }),
      available: Math.random() > 0.35,
    });
  }
  return days;
};

const getEquipment = (): string[] => [
  'Pioneer DDJ-1000', 'Pioneer CDJ-3000 x2', 'DJM-900NXS2',
  'QSC K12.2 x2', 'Shure SM58', 'Ноутбук MacBook Pro'
];

const getAddons = (): { name: string; price: string }[] => [
  { name: 'Расширенный сет (+2 часа)', price: '+15,000 ₽' },
  { name: 'Световое оборудование', price: '+10,000 ₽' },
  { name: 'MC / Ведущий', price: '+20,000 ₽' },
  { name: 'Звуковое оборудование', price: '+12,000 ₽' },
];

type Tab = 'about' | 'mixes' | 'reviews' | 'calendar';

export function DjProfilePage({ dj, onBack, onBook }: DjProfilePageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [playingMix, setPlayingMix] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const mixes = getMixes(dj.id);
  const reviews = getReviews(dj.id);
  const calendar = getCalendar();
  const equipment = getEquipment();
  const addons = getAddons();

  const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'about', label: 'О диджее' },
    { key: 'mixes', label: 'Миксы', count: mixes.length },
    { key: 'reviews', label: 'Отзывы', count: reviews.length },
    { key: 'calendar', label: 'Календарь' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-12">

      {/* ═══════ HEADER ═══════ */}
      <div className="px-3 sm:px-5 lg:px-6 pt-4 pb-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-400 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Назад в каталог
        </button>
      </div>

      {/* ═══════ PROFILE HERO ═══════ */}
      <section className="px-3 sm:px-5 lg:px-6 mb-6">
        <div className="bg-white/[0.04] backdrop-blur-sm rounded-xl lg:rounded-2xl border border-white/10 overflow-hidden">
          {/* Purple gradient header */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-purple-600/40 via-violet-600/30 to-fuchsia-600/20 relative">
            <div className="absolute inset-0" style={{ filter: 'blur(0px)' }}>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-purple-400/30"
                  style={{ width: `${3 + i}px`, height: `${3 + i}px`, left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }}
                  animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </div>

          <div className="px-4 lg:px-6 pb-4 -mt-10 sm:-mt-12 relative">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Photo */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-gray-900 shadow-xl">
                  <ImageWithFallback src={dj.photo} alt={dj.name} className="w-full h-full object-cover" />
                </div>
                {dj.available && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 sm:pt-12">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h1 className="text-xl sm:text-2xl font-black">{dj.name}</h1>
                      {dj.verified && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{dj.city}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dj.experience}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dj.completedGigs} букингов</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(dj.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-white">{dj.rating}</span>
                      <span className="text-[10px] text-gray-600">({dj.reviewsCount} отзывов)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dj.genres.map(g => (
                        <span key={g} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-bold text-purple-300">{g}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsFavorite(!isFavorite)}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-400 text-red-400' : 'text-gray-400'}`} />
                    </button>
                    <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price + Book CTA */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
              <div>
                <span className="text-[10px] text-gray-500">от</span>
                <span className="text-xl font-black text-purple-400 ml-1">{(dj.priceFrom / 1000).toFixed(0)}K ₽</span>
                <span className="text-[10px] text-gray-500 ml-1">/ выступление</span>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBook}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Забронировать
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TABS ═══════ */}
      <div className="px-3 sm:px-5 lg:px-6 mb-4">
        <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === tab.key
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[9px] px-1 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-purple-500/30' : 'bg-white/5'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ TAB CONTENT ═══════ */}
      <div className="px-3 sm:px-5 lg:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* === ABOUT === */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                {/* Bio */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-2">О себе</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{dj.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {dj.tags.map(t => (
                      <span key={t} className="text-[9px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">#{t}</span>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-purple-400" /> Оборудование
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {equipment.map((eq, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <CheckCircle2 className="w-3 h-3 text-purple-400/60 flex-shrink-0" />
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-purple-400" /> Дополнительные услуги
                  </h3>
                  <div className="space-y-1.5">
                    {addons.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{a.name}</span>
                        <span className="font-bold text-purple-300">{a.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats mini */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Рейтинг', value: dj.rating.toString(), icon: Star },
                    { label: 'Букингов', value: dj.completedGigs.toString(), icon: Calendar },
                    { label: 'Отзывов', value: dj.reviewsCount.toString(), icon: MessageSquare },
                    { label: 'Миксов', value: mixes.length.toString(), icon: Music },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/10">
                        <Icon className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <div className="text-sm font-black text-white">{s.value}</div>
                        <div className="text-[9px] text-gray-600">{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === MIXES === */}
            {activeTab === 'mixes' && (
              <div className="space-y-2">
                {mixes.map((mix, i) => (
                  <motion.div
                    key={mix.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      playingMix === mix.id
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    }`}
                    onClick={() => setPlayingMix(playingMix === mix.id ? null : mix.id)}
                  >
                    {/* Play button */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      playingMix === mix.id
                        ? 'bg-purple-500'
                        : 'bg-white/10'
                    }`}>
                      {playingMix === mix.id
                        ? <Pause className="w-4 h-4 text-white" />
                        : <Play className="w-4 h-4 text-white ml-0.5" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{mix.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>{mix.genre}</span>
                        <span>•</span>
                        <span>{mix.duration}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 flex-shrink-0">
                      <span className="flex items-center gap-0.5">
                        <Play className="w-2.5 h-2.5" />{mix.plays.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5" />{mix.likes}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Audio visualization placeholder */}
                {playingMix && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-purple-500/5 rounded-xl p-3 border border-purple-500/20 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(16)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-purple-400 rounded-full"
                          animate={{ height: [4, 8 + Math.random() * 16, 4] }}
                          transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-purple-300 ml-auto">Воспроизведение...</span>
                  </motion.div>
                )}
              </div>
            )}

            {/* === REVIEWS === */}
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {/* Rating summary */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-400">{avgRating.toFixed(1)}</div>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} />
                      ))}
                    </div>
                    <div className="text-[9px] text-gray-600 mt-0.5">{reviews.length} отзывов</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = reviews.filter(r => r.rating === stars).length;
                      const pct = (count / reviews.length) * 100;
                      return (
                        <div key={stars} className="flex items-center gap-2 text-[10px]">
                          <span className="text-gray-500 w-3">{stars}</span>
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-600 w-4 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review cards */}
                {reviews.map((review, i) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/[0.03] rounded-xl p-3 lg:p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-300">
                          {review.author[0]}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">{review.author}</span>
                          <span className="text-[9px] text-gray-600 ml-2">{review.date}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-white/5 rounded-full text-[9px] text-gray-500">{review.eventType}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-[10px] lg:text-xs text-gray-400 leading-relaxed">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* === CALENDAR === */}
            {activeTab === 'calendar' && (
              <div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 mb-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" /> Доступность (ближайшие 3 недели)
                  </h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendar.map((day, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                          day.available
                            ? 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'
                            : 'bg-white/[0.02] border border-white/5 opacity-40'
                        }`}
                      >
                        <div className="text-[9px] text-gray-500 leading-tight">{day.date.split(',')[0]}</div>
                        <div className={`text-[10px] font-bold mt-0.5 ${day.available ? 'text-green-400' : 'text-gray-600'}`}>
                          {day.date.split(' ')[0]}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Свободен</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600" /> Занят</span>
                  </div>
                </div>

                {/* Quick book */}
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20 text-center">
                  <p className="text-xs text-gray-400 mb-3">Выберите свободную дату и отправьте заявку</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBook}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl font-bold text-sm shadow shadow-purple-500/20 inline-flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Отправить заявку на букинг
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}