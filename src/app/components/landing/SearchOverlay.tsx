/**
 * SEARCH OVERLAY - Полноэкранный поиск ПРОМО.МУЗЫКА
 * Debounced поиск по API через useSearch hook с категориями результатов
 * Glassmorphism дизайн, клавиатурная навигация (Arrow Up/Down + Enter),
 * история поиска в localStorage, xs-2xl адаптивность
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, Music2, User, Disc3, Loader2, ArrowRight,
  TrendingUp, Sparkles, Mic2, Radio, Clock, Trash2,
} from 'lucide-react';
import { useSearch } from '@/hooks/useLandingData';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onArtistClick?: (artistId: string, artistName: string) => void;
  onNavigate?: (page: string) => void;
}

// ── localStorage history ────────────────────────────────

const HISTORY_KEY = 'promo_search_history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToHistory(query: string) {
  try {
    const q = query.trim();
    if (!q || q.length < 2) return;
    const history = getSearchHistory().filter(h => h.toLowerCase() !== q.toLowerCase());
    history.unshift(q);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch { /* ignore */ }
}

function removeFromHistory(query: string) {
  try {
    const history = getSearchHistory().filter(h => h !== query);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch { /* ignore */ }
}

// ── Suggestion chips ────────────────────────────────────

const POPULAR_QUERIES = [
  { label: 'Сандра', icon: User },
  { label: 'Electronic', icon: Music2 },
  { label: 'Hip-Hop', icon: Mic2 },
  { label: 'Deep House', icon: Disc3 },
  { label: 'Trap', icon: TrendingUp },
  { label: 'R&B', icon: Radio },
];

const QUICK_LINKS = [
  { label: 'Чарты', page: 'charts', icon: TrendingUp },
  { label: 'Новинки', page: 'home', icon: Sparkles },
  { label: 'Для артистов', page: 'for-artists', icon: Mic2 },
  { label: 'Концерты', page: 'concerts', icon: Music2 },
];

// ── Result item type (for keyboard navigation) ──────────

interface FlatItem {
  type: 'artist' | 'track';
  id: string;
  name: string;       // artist name or track title
  sub: string;         // genre / artist
  artistId?: string;   // for tracks
}

// ── Component ───────────────────────────────────────────

export function SearchOverlay({ isOpen, onClose, onArtistClick, onNavigate }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { data: results, isLoading } = useSearch(query, 400);

  // Flatten results for keyboard navigation
  const flatItems = useMemo<FlatItem[]>(() => {
    if (!results) return [];
    const items: FlatItem[] = [];
    if (results.artists) {
      for (const a of results.artists) {
        items.push({
          type: 'artist',
          id: a.id,
          name: a.name,
          sub: [a.genre, a.city].filter(Boolean).join(' - ') || 'Artist',
        });
      }
    }
    if (results.tracks) {
      for (const t of results.tracks) {
        items.push({
          type: 'track',
          id: t.id,
          name: t.title,
          sub: [t.artist, t.genre].filter(Boolean).join(' - '),
          artistId: t.artistId,
        });
      }
    }
    return items;
  }, [results]);

  const hasResults = flatItems.length > 0;

  // Focus & reset on open/close
  useEffect(() => {
    if (isOpen) {
      setHistory(getSearchHistory());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setActiveIdx(-1);
    }
  }, [isOpen]);

  // Reset keyboard index on new results
  useEffect(() => {
    setActiveIdx(-1);
  }, [flatItems.length]);

  // ESC to close + body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // ── Actions ─────────────────────────────────────────────

  const handleArtistClick = useCallback((id: string, name: string) => {
    addToHistory(query || name);
    setHistory(getSearchHistory());
    onArtistClick?.(id, name);
    onClose();
  }, [onArtistClick, onClose, query]);

  const handleQuickLink = useCallback((page: string) => {
    onNavigate?.(page);
    onClose();
  }, [onNavigate, onClose]);

  const handlePopularQuery = useCallback((q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  }, []);

  const handleHistoryClick = useCallback((q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  }, []);

  const handleRemoveHistory = useCallback((e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    removeFromHistory(q);
    setHistory(getSearchHistory());
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const handleSelectItem = useCallback((item: FlatItem) => {
    addToHistory(query);
    if (item.type === 'artist') {
      onArtistClick?.(item.id, item.name);
    } else if (item.artistId) {
      onArtistClick?.(item.artistId, item.sub.split(' - ')[0] || item.name);
    }
    onClose();
  }, [query, onArtistClick, onClose]);

  // ── Keyboard navigation ─────────────────────────────────

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(prev => {
        const next = prev + 1;
        return next >= flatItems.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(prev => {
        const next = prev - 1;
        return next < 0 ? flatItems.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < flatItems.length) {
        handleSelectItem(flatItems[activeIdx]);
      } else if (query.trim().length >= 2) {
        addToHistory(query.trim());
        setHistory(getSearchHistory());
      }
    }
  }, [flatItems, activeIdx, handleSelectItem, query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0 || !resultsRef.current) return;
    const el = resultsRef.current.querySelector(`[data-result-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIdx]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-start justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl mx-3 xs:mx-4 mt-16 xs:mt-20 sm:mt-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Search Input ─────────────────────────────── */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 rounded-xl xs:rounded-2xl blur-xl" />
              <div className="relative flex items-center bg-white/[0.08] backdrop-blur-2xl border border-white/15 rounded-xl xs:rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="pl-4 xs:pl-5 sm:pl-6">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 xs:w-5 xs:h-5 text-pink-400 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Поиск артистов, треков, жанров..."
                  className="flex-1 bg-transparent text-white text-sm xs:text-base sm:text-lg px-3 xs:px-4 py-3.5 xs:py-4 sm:py-5 outline-none placeholder:text-slate-500"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(''); setActiveIdx(-1); inputRef.current?.focus(); }}
                    className="px-2 xs:px-3 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3 xs:px-4 sm:px-5 py-3.5 xs:py-4 sm:py-5 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border-l border-white/10"
                >
                  <span className="text-[10px] xs:text-xs font-mono font-bold">ESC</span>
                </button>
              </div>
            </div>

            {/* ── Results / Suggestions ────────────────────── */}
            <div ref={resultsRef} className="mt-3 xs:mt-4 max-h-[60vh] overflow-y-auto rounded-xl xs:rounded-2xl">

              {/* ─── No query: history + suggestions ───────── */}
              {!query && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 shadow-xl"
                >
                  {/* Recent searches */}
                  {history.length > 0 && (
                    <div className="mb-5 xs:mb-6">
                      <div className="flex items-center justify-between mb-2.5 xs:mb-3">
                        <h3 className="text-[10px] xs:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Недавние поиски
                        </h3>
                        <button
                          onClick={handleClearHistory}
                          className="text-[10px] xs:text-xs text-slate-600 hover:text-pink-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          Очистить
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 xs:gap-2">
                        {history.map((h) => (
                          <button
                            key={h}
                            onClick={() => handleHistoryClick(h)}
                            className="group flex items-center gap-1.5 px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-white/5 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/20 transition-all"
                          >
                            <Clock className="w-3 h-3 text-slate-600 group-hover:text-pink-400 transition-colors" />
                            <span className="text-[11px] xs:text-xs text-slate-400 group-hover:text-white font-medium">{h}</span>
                            <span
                              onClick={(e) => handleRemoveHistory(e, h)}
                              className="ml-0.5 text-slate-700 hover:text-pink-400 transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div className="mb-5 xs:mb-6">
                    <h3 className="text-[10px] xs:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 xs:mb-3 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3" />
                      Быстрые ссылки
                    </h3>
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 xs:gap-2">
                      {QUICK_LINKS.map((link) => (
                        <button
                          key={link.page}
                          onClick={() => handleQuickLink(link.page)}
                          className="flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg xs:rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-pink-500/20 transition-all group"
                        >
                          <link.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-400 transition-colors" />
                          <span className="text-[11px] xs:text-xs text-slate-300 group-hover:text-white font-medium">{link.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Queries */}
                  <div>
                    <h3 className="text-[10px] xs:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 xs:mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Популярные запросы
                    </h3>
                    <div className="flex flex-wrap gap-1.5 xs:gap-2">
                      {POPULAR_QUERIES.map((pq) => (
                        <button
                          key={pq.label}
                          onClick={() => handlePopularQuery(pq.label)}
                          className="flex items-center gap-1.5 px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg bg-white/5 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/20 transition-all group"
                        >
                          <pq.icon className="w-3 h-3 text-slate-500 group-hover:text-pink-400 transition-colors" />
                          <span className="text-[11px] xs:text-xs text-slate-400 group-hover:text-white font-medium">{pq.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Loading ───────────────────────────────── */}
              {query && isLoading && (
                <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-xl xs:rounded-2xl p-6 xs:p-8 shadow-xl text-center">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs xs:text-sm text-slate-400">Поиск по "{query}"...</p>
                </div>
              )}

              {/* ─── Search results ────────────────────────── */}
              {query && !isLoading && hasResults && (() => {
                let globalIdx = 0;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-xl xs:rounded-2xl overflow-hidden shadow-xl"
                  >
                    {/* Keyboard hint */}
                    <div className="px-3 xs:px-4 sm:px-5 pt-3 pb-1.5 flex items-center gap-3 text-[9px] xs:text-[10px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px]">↑</kbd>
                        <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px]">↓</kbd>
                        навигация
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px]">Enter</kbd>
                        выбрать
                      </span>
                    </div>

                    {/* Artists */}
                    {results!.artists && results!.artists.length > 0 && (
                      <div className="p-3 xs:p-4 sm:p-5 pt-2">
                        <h3 className="text-[10px] xs:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 xs:mb-3 flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          Артисты ({results!.artists.length})
                        </h3>
                        <div className="space-y-1 xs:space-y-1.5">
                          {results!.artists.map((artist: any) => {
                            const idx = globalIdx++;
                            const isActive = idx === activeIdx;
                            return (
                              <button
                                key={artist.id}
                                data-result-idx={idx}
                                onClick={() => handleArtistClick(artist.id, artist.name)}
                                className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg xs:rounded-xl transition-all group text-left ${
                                  isActive ? 'bg-pink-500/15 border border-pink-500/30' : 'hover:bg-white/10 border border-transparent'
                                }`}
                              >
                                <div className={`flex items-center justify-center rounded-full border transition-colors ${
                                  isActive ? 'bg-gradient-to-br from-pink-500/40 to-purple-500/40 border-pink-500/40' : 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 border-white/10 group-hover:border-pink-500/30'
                                }`} style={{ width: 36, height: 36 }}>
                                  <User className="w-4 h-4 text-white/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs xs:text-sm font-semibold truncate transition-colors ${
                                    isActive ? 'text-pink-300' : 'text-white group-hover:text-pink-300'
                                  }`}>
                                    {artist.name}
                                  </p>
                                  <p className="text-[10px] xs:text-[11px] text-slate-500 truncate">
                                    {artist.genre || 'Artist'}
                                    {artist.city ? ` - ${artist.city}` : ''}
                                  </p>
                                </div>
                                <ArrowRight className={`w-3.5 h-3.5 transition-colors flex-shrink-0 ${
                                  isActive ? 'text-pink-400' : 'text-slate-600 group-hover:text-pink-400'
                                }`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tracks */}
                    {results!.tracks && results!.tracks.length > 0 && (
                      <div className="p-3 xs:p-4 sm:p-5 border-t border-white/5">
                        <h3 className="text-[10px] xs:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 xs:mb-3 flex items-center gap-1.5">
                          <Music2 className="w-3 h-3" />
                          Треки ({results!.tracks.length})
                        </h3>
                        <div className="space-y-1 xs:space-y-1.5">
                          {results!.tracks.map((track: any) => {
                            const idx = globalIdx++;
                            const isActive = idx === activeIdx;
                            return (
                              <button
                                key={track.id}
                                data-result-idx={idx}
                                className={`w-full flex items-center gap-2.5 xs:gap-3 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-lg xs:rounded-xl transition-all group text-left ${
                                  isActive ? 'bg-purple-500/15 border border-purple-500/30' : 'hover:bg-white/10 border border-transparent'
                                }`}
                                onClick={() => {
                                  addToHistory(query);
                                  if (track.artistId) handleArtistClick(track.artistId, track.artist);
                                }}
                              >
                                <div className={`flex items-center justify-center rounded-lg border transition-colors ${
                                  isActive ? 'bg-gradient-to-br from-purple-500/40 to-blue-500/40 border-purple-500/40' : 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-white/10 group-hover:border-purple-500/30'
                                }`} style={{ width: 36, height: 36 }}>
                                  <Music2 className="w-4 h-4 text-white/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs xs:text-sm font-semibold truncate transition-colors ${
                                    isActive ? 'text-purple-300' : 'text-white group-hover:text-purple-300'
                                  }`}>
                                    {track.title}
                                  </p>
                                  <p className="text-[10px] xs:text-[11px] text-slate-500 truncate">
                                    {track.artist}
                                    {track.genre ? ` - ${track.genre}` : ''}
                                  </p>
                                </div>
                                {track.plays > 0 && (
                                  <span className="text-[9px] text-slate-600 font-mono">
                                    {track.plays >= 1000 ? `${(track.plays / 1000).toFixed(0)}K` : track.plays}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* ─── No results ─────────────────────────────── */}
              {query && query.length >= 2 && !isLoading && !hasResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-xl xs:rounded-2xl p-6 xs:p-8 text-center shadow-xl"
                >
                  <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm xs:text-base text-slate-400 mb-1 font-medium">Ничего не найдено</p>
                  <p className="text-[10px] xs:text-xs text-slate-600">Попробуйте изменить запрос или проверить написание</p>
                </motion.div>
              )}

              {/* ─── Typing hint ────────────────────────────── */}
              {query && query.length < 2 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-xl xs:rounded-2xl p-5 xs:p-6 text-center shadow-xl"
                >
                  <p className="text-xs xs:text-sm text-slate-500">Введите минимум 2 символа для поиска</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
