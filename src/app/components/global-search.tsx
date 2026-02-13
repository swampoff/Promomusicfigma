/**
 * GLOBAL SEARCH - Cmd+K командная палитра
 * Поиск по всем разделам кабинета артиста
 * С историей недавних поисков (localStorage)
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, LayoutDashboard, Music2, Video, Calendar, FileText,
  FlaskConical, Rocket, TrendingUp, Wallet, Settings, HelpCircle,
  Upload, Bell, DollarSign, X, Command, ArrowRight, Sparkles,
  Handshake, Clock, Trash2, MessageSquare,
} from 'lucide-react';

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  section: string;
  keywords: string[];
}

interface RecentSearch {
  query: string;
  section: string;
  label: string;
  timestamp: number;
}

interface GlobalSearchProps {
  onNavigate: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LS_RECENT_SEARCHES_KEY = 'promo_recent_searches';
const MAX_RECENT_SEARCHES = 6;

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'home', label: 'Главная', description: 'Обзор кабинета', icon: LayoutDashboard, section: 'home', keywords: ['главная', 'обзор', 'дашборд', 'home', 'dashboard'] },
  { id: 'publish', label: 'Мои публикации', description: 'Заказы на публикацию видео и концертов', icon: Upload, section: 'publish', keywords: ['публикации', 'заказы', 'видео', 'концерты', 'publish', 'orders'] },
  { id: 'messages', label: 'Сообщения', description: 'Чаты и переписки', icon: MessageSquare, section: 'messages', keywords: ['сообщения', 'чат', 'переписка', 'messages', 'chat', 'inbox'] },
  { id: 'notifications', label: 'Уведомления', description: 'История уведомлений', icon: Bell, section: 'notifications', keywords: ['уведомления', 'оповещения', 'notifications', 'alerts'] },
  { id: 'tracks', label: 'Мои треки', description: 'Управление треками', icon: Music2, section: 'tracks', keywords: ['треки', 'музыка', 'tracks', 'songs', 'music'] },
  { id: 'video', label: 'Мои видео', description: 'Управление видеоклипами', icon: Video, section: 'video', keywords: ['видео', 'клипы', 'video', 'clips'] },
  { id: 'concerts', label: 'Мои концерты', description: 'Управление событиями', icon: Calendar, section: 'concerts', keywords: ['концерты', 'события', 'мероприятия', 'concerts', 'events'] },
  { id: 'news', label: 'Мои новости', description: 'Публикации новостей', icon: FileText, section: 'news', keywords: ['новости', 'пресса', 'news', 'press'] },
  { id: 'track-test', label: 'Тест трека', description: 'Анализ качества трека', icon: FlaskConical, section: 'track-test', keywords: ['тест', 'анализ', 'quality', 'test'] },
  { id: 'pitching', label: 'Продвижение', description: 'Питчинг и маркетинг', icon: Rocket, section: 'pitching', keywords: ['продвижение', 'питчинг', 'маркетинг', 'promotion', 'pitching'] },
  { id: 'pricing', label: 'Тарифы', description: 'Планы подписки', icon: DollarSign, section: 'pricing', keywords: ['тарифы', 'подписка', 'цены', 'pricing', 'plans'] },
  { id: 'analytics', label: 'Аналитика', description: 'Статистика и графики', icon: TrendingUp, section: 'analytics', keywords: ['аналитика', 'статистика', 'графики', 'analytics', 'stats'] },
  { id: 'payments', label: 'Финансы', description: 'Платежи и баланс', icon: Wallet, section: 'payments', keywords: ['финансы', 'платежи', 'деньги', 'finances', 'payments'] },
  { id: 'collaboration', label: 'Коллаборации', description: 'Предложения от продюсеров', icon: Handshake, section: 'collaboration', keywords: ['коллаборации', 'продюсеры', 'биты', 'collaboration', 'producer', 'beats'] },
  { id: 'support', label: 'Поддержка', description: 'Помощь и FAQ', icon: HelpCircle, section: 'support', keywords: ['поддержка', 'помощь', 'faq', 'support', 'help'] },
  { id: 'settings', label: 'Настройки', description: 'Настройки профиля', icon: Settings, section: 'settings', keywords: ['настройки', 'профиль', 'settings', 'profile'] },
];

// Quick actions
const QUICK_ACTIONS: SearchItem[] = [
  { id: 'action-publish-video', label: 'Опубликовать видео', description: 'Создать заказ на публикацию видео', icon: Upload, section: 'publish', keywords: ['опубликовать видео'] },
  { id: 'action-publish-concert', label: 'Опубликовать концерт', description: 'Создать заказ на публикацию концерта', icon: Calendar, section: 'publish', keywords: ['опубликовать концерт'] },
  { id: 'action-upload-track', label: 'Загрузить трек', description: 'Добавить новый трек', icon: Music2, section: 'tracks', keywords: ['загрузить трек'] },
];

function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(LS_RECENT_SEARCHES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentSearch[];
  } catch {
    return [];
  }
}

function saveRecentSearch(item: SearchItem, query: string) {
  const recent = getRecentSearches();
  // Remove duplicate by section
  const filtered = recent.filter(r => r.section !== item.section || r.label !== item.label);
  const newEntry: RecentSearch = {
    query: query || item.label,
    section: item.section,
    label: item.label,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(LS_RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(LS_RECENT_SEARCHES_KEY);
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  return `${days} дн назад`;
}

export function GlobalSearch({ onNavigate, isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => [...SEARCH_ITEMS, ...QUICK_ACTIONS], []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    );
  }, [query, allItems]);

  // Recents shown only when query is empty
  const showRecent = !query.trim() && recentSearches.length > 0;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((item: SearchItem) => {
    saveRecentSearch(item, query);
    onNavigate(item.section);
    onClose();
  }, [onNavigate, onClose, query]);

  const handleRecentSelect = useCallback((recent: RecentSearch) => {
    // Find matching item to get section and save updated recent
    const matchingItem = allItems.find(i => i.section === recent.section && i.label === recent.label);
    if (matchingItem) {
      saveRecentSearch(matchingItem, recent.query);
    }
    onNavigate(recent.section);
    onClose();
  }, [allItems, onNavigate, onClose]);

  const handleClearRecent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // Total items for keyboard navigation: recent section + filtered items
  const totalItems = showRecent ? recentSearches.length + filtered.length : filtered.length;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (showRecent && selectedIndex < recentSearches.length) {
        handleRecentSelect(recentSearches[selectedIndex]);
      } else {
        const idx = showRecent ? selectedIndex - recentSearches.length : selectedIndex;
        if (filtered[idx]) {
          handleSelect(filtered[idx]);
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, selectedIndex, handleSelect, handleRecentSelect, onClose, showRecent, recentSearches, totalItems]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-search-idx="${selectedIndex}"]`) as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Find icon for a recent search
  const getIconForSection = (section: string): React.ElementType => {
    return allItems.find(i => i.section === section)?.icon || Search;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-[#12122a] border border-white/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Поиск по разделам..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-slate-500 font-mono">ESC</kbd>
              </div>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
              {/* Recent Searches Section */}
              {showRecent && (
                <>
                  <div className="flex items-center justify-between px-4 py-1.5">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Недавние поиски
                    </p>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Очистить
                    </button>
                  </div>
                  {recentSearches.map((recent, i) => {
                    const RecentIcon = getIconForSection(recent.section);
                    const isSelected = i === selectedIndex;
                    return (
                      <button
                        key={`recent-${recent.section}-${recent.timestamp}`}
                        data-search-idx={i}
                        onClick={() => handleRecentSelect(recent)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-purple-500/20' : 'bg-white/5'
                        }`}>
                          <RecentIcon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {recent.label}
                          </p>
                          <p className="text-[10px] text-slate-600 truncate">
                            {formatRelativeTime(recent.timestamp)}
                          </p>
                        </div>
                        <Clock className={`w-3 h-3 flex-shrink-0 ${isSelected ? 'text-slate-400' : 'text-slate-700'}`} />
                      </button>
                    );
                  })}
                  <div className="h-px bg-white/5 mx-4 my-1.5" />
                </>
              )}

              {/* All / Filtered Items */}
              {filtered.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Ничего не найдено</p>
                  <p className="text-xs text-slate-600 mt-1">Попробуйте другой запрос</p>
                </div>
              ) : (
                <>
                  {!query && (
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Навигация</p>
                  )}
                  {filtered.map((item, i) => {
                    const Icon = item.icon;
                    const globalIdx = showRecent ? recentSearches.length + i : i;
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        data-search-idx={globalIdx}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-purple-500/20' : 'bg-white/5'
                        }`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                          )}
                        </div>
                        {isSelected && <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white/5 rounded font-mono">↑↓</kbd> навигация</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-white/5 rounded font-mono">↵</kbd> выбрать</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Sparkles className="w-3 h-3" />
                <span>promo.music</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Хук для глобальной горячей клавиши Cmd+K / Ctrl+K
 */
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}