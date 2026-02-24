/**
 * DIGITAL GOODS MARKETPLACE - Каталог цифровых товаров
 * Категории: sample_pack, preset, drum_kit, template, tutorial, loop
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Star, Package, Download, Eye, ShoppingCart,
  Loader2, Filter, X, Tag, Music, Sliders, BookOpen,
  Disc3, Layers, ChevronDown, CheckCircle2, User,
} from 'lucide-react';
import {
  fetchDigitalGoods,
  purchaseDigitalGood,
  type DigitalGood,
  type DigitalGoodsFilter,
} from '@/utils/api/marketplace';

/* ═══════════════════════════════════════ */
/* CONSTANTS                               */
/* ═══════════════════════════════════════ */

const CATEGORIES: Array<{ value: string; label: string; icon: typeof Package }> = [
  { value: '', label: 'Все', icon: Package },
  { value: 'sample_pack', label: 'Сэмпл-паки', icon: Music },
  { value: 'preset', label: 'Пресеты', icon: Sliders },
  { value: 'drum_kit', label: 'Драм-киты', icon: Disc3 },
  { value: 'template', label: 'Шаблоны DAW', icon: Layers },
  { value: 'tutorial', label: 'Обучение', icon: BookOpen },
  { value: 'loop', label: 'Лупы', icon: Music },
];

const SORT_OPTIONS = [
  { value: 'popular' as const, label: 'Популярные' },
  { value: 'new' as const, label: 'Новые' },
  { value: 'rating' as const, label: 'По рейтингу' },
  { value: 'price_asc' as const, label: 'Дешевле' },
  { value: 'price_desc' as const, label: 'Дороже' },
];

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU');
}

function getCategoryIcon(cat: string) {
  return CATEGORIES.find(c => c.value === cat)?.icon || Package;
}

function getCategoryLabel(cat: string) {
  return CATEGORIES.find(c => c.value === cat)?.label || cat;
}

/* ═══════════════════════════════════════ */
/* MAIN COMPONENT                          */
/* ═══════════════════════════════════════ */

interface DigitalGoodsMarketplaceProps {
  onGetStarted: () => void;
}

export function DigitalGoodsMarketplace({ onGetStarted }: DigitalGoodsMarketplaceProps) {
  const [goods, setGoods] = useState<DigitalGood[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<DigitalGoodsFilter['sort']>('popular');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [selectedGood, setSelectedGood] = useState<DigitalGood | null>(null);

  const loadGoods = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDigitalGoods({
        search: search || undefined,
        category: category || undefined,
        sort,
        limit: 50,
      });
      setGoods(result.goods);
    } catch (err) {
      console.error('Failed to load digital goods:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const t = setTimeout(loadGoods, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadGoods]);

  const handlePurchase = async (good: DigitalGood) => {
    setPurchasingId(good.id);
    // Симуляция оплаты
    await new Promise(r => setTimeout(r, 1500));
    const result = await purchaseDigitalGood(good.id, 'demo-user', 'Демо Пользователь');
    if (result) {
      setPurchasedIds(prev => new Set(prev).add(good.id));
    }
    setPurchasingId(null);
  };

  return (
    <div className="pb-12">
      {/* Search & Filters */}
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск сэмплов, пресетов, шаблонов..."
              className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/40"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-500 hover:text-white" />
              </button>
            )}
          </div>

          {/* Category pills + sort */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      category === cat.value
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    <CatIcon className="w-3 h-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-400 focus:outline-none focus:border-pink-500/40 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-3 sm:px-5 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4 animate-pulse space-y-3">
                  <div className="w-full aspect-square bg-white/5 rounded-lg" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : goods.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-700" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">Товары не найдены</h3>
              <p className="text-sm text-gray-600">Попробуйте изменить фильтры</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {goods.map((good, idx) => {
                const CatIcon = getCategoryIcon(good.category);
                const isPurchased = purchasedIds.has(good.id);
                const isPurchasing = purchasingId === good.id;

                return (
                  <motion.div
                    key={good.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 hover:border-pink-500/20 transition-all overflow-hidden"
                  >
                    {/* Visual header */}
                    <div
                      className="relative aspect-[4/3] bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 flex items-center justify-center cursor-pointer"
                      onClick={() => setSelectedGood(good)}
                    >
                      <CatIcon className="w-10 h-10 text-pink-400/30" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[9px] font-bold text-pink-300">
                        {getCategoryLabel(good.category)}
                      </div>
                      {good.format && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[9px] font-bold text-gray-400">
                          {good.format}
                        </div>
                      )}
                      {good.fileSize && good.fileSize !== '0 MB' && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[9px] font-bold text-gray-400">
                          {good.fileSize}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3
                        className="text-sm font-bold text-white truncate cursor-pointer hover:text-pink-300 transition-colors mb-1"
                        onClick={() => setSelectedGood(good)}
                      >
                        {good.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
                        <User className="w-3 h-3" />
                        <span>{good.producer}</span>
                        {good.rating > 0 && (
                          <span className="contents">
                            <span className="text-gray-700 mx-0.5">-</span>
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-amber-400">{good.rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-600 mb-3">
                        <span className="flex items-center gap-0.5">
                          <Download className="w-3 h-3" /> {good.sales}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {good.views}
                        </span>
                      </div>

                      {/* Price + buy */}
                      <div className="flex items-center justify-between">
                        <p className="text-base font-black text-white">{formatPrice(good.price)} ₽</p>
                        {isPurchased ? (
                          <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Куплено
                          </span>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePurchase(good)}
                            disabled={isPurchasing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-[10px] font-bold text-white shadow-sm disabled:opacity-50 hover:shadow-pink-500/25 transition-shadow"
                          >
                            {isPurchasing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3 h-3" />
                            )}
                            Купить
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedGood && (
          <DigitalGoodDetailModal
            good={selectedGood}
            isPurchased={purchasedIds.has(selectedGood.id)}
            isPurchasing={purchasingId === selectedGood.id}
            onPurchase={() => handlePurchase(selectedGood)}
            onClose={() => setSelectedGood(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* DETAIL MODAL                            */
/* ═══════════════════════════════════════ */

function DigitalGoodDetailModal({ good, isPurchased, isPurchasing, onPurchase, onClose }: {
  good: DigitalGood;
  isPurchased: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
  onClose: () => void;
}) {
  const CatIcon = getCategoryIcon(good.category);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#12121e] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        {/* Header visual */}
        <div className="relative h-40 bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-indigo-500/15 flex items-center justify-center">
          <CatIcon className="w-16 h-16 text-pink-400/20" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-pink-300">
            {getCategoryLabel(good.category)}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl font-black text-white mb-1">{good.title}</h2>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> {good.producer}
              {good.rating > 0 && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {good.rating.toFixed(1)}
                </span>
              )}
            </p>
          </div>

          {good.description && (
            <p className="text-sm text-gray-400 leading-relaxed">{good.description}</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-white/5 rounded-xl text-center">
              <Download className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-sm font-bold text-white">{good.sales}</p>
              <p className="text-[9px] text-gray-500">Продаж</p>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl text-center">
              <Eye className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-sm font-bold text-white">{good.views}</p>
              <p className="text-[9px] text-gray-500">Просмотров</p>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl text-center">
              <Package className="w-4 h-4 mx-auto mb-1 text-gray-500" />
              <p className="text-sm font-bold text-white">{good.fileSize || '-'}</p>
              <p className="text-[9px] text-gray-500">{good.format || 'Файл'}</p>
            </div>
          </div>

          {/* Tags */}
          {good.tags && good.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {good.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Price + action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <p className="text-2xl font-black text-white">{formatPrice(good.price)} ₽</p>
            {isPurchased ? (
              <span className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Куплено
              </span>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onPurchase}
                disabled={isPurchasing}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-pink-500/20 disabled:opacity-50 hover:shadow-pink-500/40 transition-shadow"
              >
                {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                Купить
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
