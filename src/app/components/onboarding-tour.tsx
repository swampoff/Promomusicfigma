/**
 * ONBOARDING TOUR - Пошаговый интерактивный гайд для новых артистов
 * - Сохранение прогресса в localStorage для возобновления
 * - Mobile spotlight с автооткрытием sidebar
 * - Анимированные preview-мокапы разделов
 * - Чистые пользовательские тексты без технических деталей
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, Upload, Music2, TrendingUp,
  Bell, Wallet, Rocket, Sparkles, PartyPopper, CheckCircle2,
  Handshake, LayoutDashboard, Command, ArrowUpRight, MessageSquare,
} from 'lucide-react';
import { PromoLogo } from '@/app/components/promo-logo';

const LS_TOUR_KEY = 'promo_onboarding_completed';
const LS_TOUR_PROGRESS_KEY = 'promo_tour_progress';
const LS_TOUR_VERSION = 'v3';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
  section?: string;
  tip?: string;
  features?: string[];
  highlightSelector?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в ПРОМО.МУЗЫКА!',
    description: 'Ваш персональный кабинет для управления музыкальной карьерой. Пройдите короткий тур, чтобы узнать ключевые возможности.',
    icon: Sparkles,
    color: 'from-pink-500 to-purple-500',
    bgGlow: 'bg-pink-500/20',
    features: ['Публикация контента', 'Аналитика', 'Коллаборации', 'Продвижение'],
  },
  {
    id: 'dashboard',
    title: 'Главная панель',
    description: 'Ваш командный центр - ключевая статистика, последние уведомления и быстрые действия в одном месте.',
    icon: LayoutDashboard,
    color: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/20',
    section: 'home',
    highlightSelector: 'home',
    features: ['Сводка по трекам', 'Виджеты активности', 'Быстрые ссылки'],
  },
  {
    id: 'publish',
    title: 'Публикация контента',
    description: 'Публикуйте видеоклипы и концерты через удобный визард. Общайтесь с модератором в чате, отслеживайте статус заказов.',
    icon: Upload,
    color: 'from-[#FF577F] to-purple-500',
    bgGlow: 'bg-[#FF577F]/20',
    section: 'publish',
    highlightSelector: 'publish',
    tip: 'Начните с бесплатного тарифа, чтобы познакомиться с системой',
    features: ['Визард публикации', 'Чат с модератором', 'Отслеживание статусов'],
  },
  {
    id: 'tracks',
    title: 'Управление треками',
    description: 'Загружайте треки, управляйте метаданными и обложками. Сортируйте плейлисты перетаскиванием, тестируйте качество.',
    icon: Music2,
    color: 'from-cyan-500 to-blue-500',
    bgGlow: 'bg-cyan-500/20',
    section: 'tracks',
    highlightSelector: 'tracks',
    tip: 'Используйте "Тест трека" для интеллектуального анализа качества',
    features: ['Перетаскивание треков', 'Метаданные и обложки', 'Анализ качества'],
  },
  {
    id: 'analytics',
    title: 'Аналитика и статистика',
    description: 'Подробная статистика: прослушивания, география аудитории, платформы и доходы. Данные обновляются автоматически.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/20',
    section: 'settings',
    highlightSelector: 'settings',
    tip: 'Аналитика доступна в разделе «Настройки». Публикуйте контент в пиковые часы (18:00-21:00) для максимального охвата',
    features: ['Графики прослушиваний', 'Гео-аудитория', 'Доходы по платформам'],
  },
  {
    id: 'collaboration',
    title: 'Коллаборации с продюсерами',
    description: 'Получайте предложения битов и услуг от продюсеров. Обсуждайте детали в чате, принимайте или отклоняйте офферы.',
    icon: Handshake,
    color: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/20',
    section: 'collaboration',
    highlightSelector: 'collaboration',
    tip: 'Включите уведомления, чтобы не пропустить интересные предложения',
    features: ['Предложения продюсеров', 'Встроенный чат', 'Управление офферами'],
  },
  {
    id: 'messages',
    title: 'Сообщения',
    description: 'Переписка с фанатами, продюсерами и поддержкой теперь в центре уведомлений. Нажмите на колокольчик и выберите вкладку «Сообщения».',
    icon: MessageSquare,
    color: 'from-cyan-500 to-blue-500',
    bgGlow: 'bg-cyan-500/20',
    section: 'home',
    highlightSelector: 'home',
    tip: 'Сообщения доступны через колокольчик в шапке и боковой панели',
    features: ['Чат с фанатами', 'Переписка с продюсерами', 'Голосовые сообщения'],
  },
  {
    id: 'promotion',
    title: 'Продвижение и питчинг',
    description: 'Питчинг треков на плейлисты, маркетинговые кампании и PR. Монеты открывают доступ к премиум-функциям.',
    icon: Rocket,
    color: 'from-pink-500 to-rose-500',
    bgGlow: 'bg-pink-500/20',
    section: 'pitching',
    highlightSelector: 'pitching',
    features: ['Питчинг на плейлисты', 'Маркетинговые кампании', 'Монеты и бонусы'],
  },
  {
    id: 'finances',
    title: 'Финансы и платежи',
    description: 'Отслеживайте доходы от стримов, историю транзакций, баланс монет. Экспортируйте финансовые отчёы.',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-500/20',
    section: 'settings',
    highlightSelector: 'settings',
    features: ['Доходы от стримов', 'История транзакций', 'Экспорт отчётов'],
  },
  {
    id: 'shortcuts',
    title: 'Горячие клавиши и поиск',
    description: 'Используйте командную палитру для мгновенной навигации. Поиск по всем разделам за секунду.',
    icon: Command,
    color: 'from-slate-400 to-slate-600',
    bgGlow: 'bg-slate-400/20',
    features: ['Cmd+K / Ctrl+K - поиск', '? - повторить тур', 'Стрелки - навигация', 'Enter - переход'],
  },
  {
    id: 'done',
    title: 'Вы готовы!',
    description: 'Все разделы настроены и ждут вас. Начните с главной панели или сразу загрузите первый трек. Удачи!',
    icon: PartyPopper,
    color: 'from-yellow-500 to-orange-500',
    bgGlow: 'bg-yellow-500/20',
    tip: 'Повторно запустить тур: раздел "Поддержка" или клавиша ?',
  },
];

// =========================================================================
// PREVIEW MOCKUPS - анимированные CSS-иллюстрации разделов
// =========================================================================

function PreviewMockup({ stepId, color }: { stepId: string; color: string }) {
  switch (stepId) {
    case 'dashboard':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            {[
              { label: 'Треки', val: '24', c: 'from-cyan-500 to-blue-500' },
              { label: 'Видео', val: '8', c: 'from-purple-500 to-pink-500' },
              { label: 'Концерты', val: '3', c: 'from-amber-500 to-orange-500' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="rounded-lg bg-white/[0.04] border border-white/5 p-2 text-center"
              >
                <div className={`text-base font-bold bg-gradient-to-r ${s.c} bg-clip-text text-transparent`}>{s.val}</div>
                <div className="text-[9px] text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {[65, 45, 80, 55, 70, 40, 90].map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                className="flex-1 bg-gradient-to-t from-blue-500/40 to-cyan-500/20 rounded-sm origin-bottom"
                style={{ height: `${h * 0.3}px` }}
              />
            ))}
          </div>
        </motion.div>
      );

    case 'publish':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          {[
            { status: 'Опубликовано', color: 'bg-green-500', w: 'w-full' },
            { status: 'На модерации', color: 'bg-yellow-500', w: 'w-3/4' },
            { status: 'Новый заказ', color: 'bg-blue-500', w: 'w-1/2' },
          ].map((item, i) => (
            <motion.div
              key={item.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              className="flex items-center gap-2 py-1.5"
            >
              <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
              <div className="flex-1">
                <div className={`h-1.5 rounded-full bg-white/10 overflow-hidden`}>
                  <motion.div
                    className={`h-full ${item.color}/30 ${item.w}`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    style={{ maxWidth: item.w === 'w-full' ? '100%' : item.w === 'w-3/4' ? '75%' : '50%' }}
                  />
                </div>
              </div>
              <span className="text-[9px] text-slate-500 w-20 text-right">{item.status}</span>
            </motion.div>
          ))}
        </motion.div>
      );

    case 'tracks':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          {['Summer Vibes', 'Midnight Jazz', 'Electric Dreams'].map((track, i) => (
            <motion.div
              key={track}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="flex items-center gap-2.5 py-1.5"
            >
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-white/80 truncate">{track}</div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.4 + j * 0.03 + i * 0.1 }}
                      className="w-1 bg-cyan-500/40 rounded-full origin-bottom"
                      style={{ height: `${4 + Math.random() * 8}px` }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[9px] text-slate-500">3:{(20 + i * 15).toString().padStart(2, '0')}</span>
            </motion.div>
          ))}
        </motion.div>
      );

    case 'analytics':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          <div className="flex items-end gap-1 h-16 mb-2">
            {[20, 35, 28, 45, 38, 55, 48, 65, 58, 72, 68, 80].map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.25 + i * 0.04, duration: 0.3 }}
                className="flex-1 rounded-t-sm origin-bottom"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(to top, rgba(16, 185, 129, 0.5), rgba(20, 184, 166, 0.2))`,
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-slate-400">Прослушивания</span>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[10px] font-semibold text-emerald-400"
            >
              +23% за неделю
            </motion.span>
          </div>
        </motion.div>
      );

    case 'collaboration':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          <div className="flex items-center justify-center gap-4 mb-2.5">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/40 to-orange-500/40 flex items-center justify-center text-[11px] font-bold text-amber-300"
            >
              A
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              <Handshake className="w-5 h-5 text-amber-400" />
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 flex items-center justify-center text-[11px] font-bold text-purple-300"
            >
              P
            </motion.div>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-slate-400"
            >
              Артист ↔ Продюсер
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="h-0.5 bg-gradient-to-r from-amber-500/30 via-amber-500/60 to-amber-500/30 rounded-full mt-1.5 mx-auto"
            />
          </div>
        </motion.div>
      );

    case 'messages':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          <div className="flex items-center justify-center gap-4 mb-2.5">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/40 to-orange-500/40 flex items-center justify-center text-[11px] font-bold text-amber-300"
            >
              A
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            >
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </motion.div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 flex items-center justify-center text-[11px] font-bold text-purple-300"
            >
              P
            </motion.div>
          </div>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] text-slate-400"
            >
              Артист ↔ Продюсер
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="h-0.5 bg-gradient-to-r from-amber-500/30 via-amber-500/60 to-amber-500/30 rounded-full mt-1.5 mx-auto"
            />
          </div>
        </motion.div>
      );

    case 'promotion':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          <div className="flex items-center justify-center mb-2.5">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <Rocket className="w-8 h-8 text-pink-400" />
              <motion.div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-500/30 rounded-full blur-md"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {['Плейлисты', 'Кампании', 'PR', 'Монеты'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="text-center py-1 px-2 rounded-md bg-pink-500/10 border border-pink-500/15 text-[9px] text-pink-300"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      );

    case 'finances':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[10px] text-slate-400">Баланс</div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-bold text-green-400"
            >
              12 450 ₽
            </motion.div>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Стримы', val: '+8 200 ₽', c: 'text-green-400' },
              { label: 'Донаты', val: '+4 250 ₽', c: 'text-green-400' },
            ].map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="flex items-center justify-between py-1"
              >
                <span className="text-[10px] text-slate-500">{t.label}</span>
                <span className={`text-[10px] font-medium ${t.c}`}>{t.val}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );

    case 'shortcuts':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 mb-4"
        >
          {/* Cmd+K row */}
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            {['⌘', 'K'].map((key, i) => (
              <motion.div
                key={key}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.1, type: 'spring', stiffness: 300 }}
                className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-mono text-white shadow-lg"
              >
                {key}
              </motion.div>
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-[10px] text-slate-500 ml-1"
            >
              поиск
            </motion.span>
          </div>
          {/* ? key row */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-sm font-mono text-purple-300 shadow-lg"
            >
              ?
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] text-slate-500 ml-1"
            >
              повторить тур
            </motion.span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full h-8 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2 px-3"
          >
            <div className="w-3 h-3 rounded-full bg-slate-600" />
            <motion.div
              className="h-1 bg-white/20 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
          </motion.div>
        </motion.div>
      );

    default:
      return null;
  }
}

// =========================================================================
// PROGRESS HELPERS
// =========================================================================

function getSavedProgress(): number | null {
  try {
    const raw = localStorage.getItem(LS_TOUR_PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire progress after 7 days
    if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(LS_TOUR_PROGRESS_KEY);
      return null;
    }
    if (typeof data.step === 'number' && data.step >= 0 && data.step < TOUR_STEPS.length) {
      return data.step;
    }
    return null;
  } catch {
    return null;
  }
}

function saveProgress(step: number) {
  localStorage.setItem(LS_TOUR_PROGRESS_KEY, JSON.stringify({ step, timestamp: Date.now() }));
}

function clearProgress() {
  localStorage.removeItem(LS_TOUR_PROGRESS_KEY);
}

// =========================================================================
// MAIN COMPONENT
// =========================================================================

interface OnboardingTourProps {
  onNavigate?: (section: string) => void;
  forceShow?: boolean;
  onComplete?: () => void;
  /** На мобильных открывает sidebar для spotlight */
  onOpenSidebar?: () => void;
  /** Текущая ширина viewport < lg */
  isMobile?: boolean;
}

export function OnboardingTour({
  onNavigate,
  forceShow,
  onComplete,
  onOpenSidebar,
  isMobile,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState(1);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const highlightRef = useRef<HTMLElement | null>(null);

  // Init: check completion + saved progress
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
      return;
    }
    const completedVersion = localStorage.getItem(LS_TOUR_KEY);
    if (completedVersion === LS_TOUR_VERSION) return;

    const saved = getSavedProgress();
    if (saved !== null && saved > 0) {
      // There's saved progress - show resume prompt after delay
      const timer = setTimeout(() => {
        setCurrentStep(saved);
        setShowResumePrompt(true);
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Fresh start
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  // Save progress on step change
  useEffect(() => {
    if (isVisible && currentStep > 0) {
      saveProgress(currentStep);
    }
  }, [currentStep, isVisible]);

  // Highlight sidebar element
  useEffect(() => {
    // Cleanup previous
    if (highlightRef.current) {
      highlightRef.current.style.removeProperty('box-shadow');
      highlightRef.current.style.removeProperty('z-index');
      highlightRef.current.style.removeProperty('position');
      highlightRef.current = null;
    }

    const step = TOUR_STEPS[currentStep];
    if (!step.highlightSelector || !isVisible) return;

    // On mobile, open sidebar first, then wait for DOM
    if (isMobile && onOpenSidebar) {
      onOpenSidebar();
      // Wait for sidebar animation to complete
      const timer = setTimeout(() => {
        applyHighlight(step.highlightSelector!);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      applyHighlight(step.highlightSelector);
    }

    return () => {
      if (highlightRef.current) {
        highlightRef.current.style.removeProperty('box-shadow');
        highlightRef.current.style.removeProperty('z-index');
        highlightRef.current.style.removeProperty('position');
        highlightRef.current = null;
      }
    };
  }, [currentStep, isVisible, isMobile]);

  function applyHighlight(selector: string) {
    const el = document.querySelector(`[data-tour-step="${selector}"]`) as HTMLElement;
    if (el) {
      highlightRef.current = el;
      el.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.5), 0 0 24px rgba(168, 85, 247, 0.25)';
      el.style.zIndex = '20';
      el.style.position = 'relative';
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  const handleNext = useCallback(() => {
    setShowResumePrompt(false);
    if (currentStep < TOUR_STEPS.length - 1) {
      setDirection(1);
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      const nextStep = TOUR_STEPS[nextIdx];
      if (nextStep.section && onNavigate) {
        onNavigate(nextStep.section);
      }
    } else {
      handleComplete();
    }
  }, [currentStep, onNavigate]);

  const handlePrev = useCallback(() => {
    setShowResumePrompt(false);
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(LS_TOUR_KEY, LS_TOUR_VERSION);
    clearProgress();
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(LS_TOUR_KEY, LS_TOUR_VERSION);
    clearProgress();
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  const handleResumeFromStart = useCallback(() => {
    setShowResumePrompt(false);
    setCurrentStep(0);
    clearProgress();
  }, []);

  const handleGoToSection = useCallback(() => {
    const s = TOUR_STEPS[currentStep];
    if (s.section && onNavigate) {
      onNavigate(s.section);
    }
  }, [currentStep, onNavigate]);

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, x: direction * 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -direction * 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#12122a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col min-h-[560px]"
          >
            {/* Glow */}
            <div className={`absolute top-0 left-0 right-0 h-40 ${step.bgGlow} blur-3xl opacity-30 pointer-events-none`} />

            {/* Progress Bar */}
            <div className="h-1 bg-white/5 relative z-10">
              <motion.div
                className={`h-full bg-gradient-to-r ${step.color}`}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 relative z-10">
              <span className="text-xs text-slate-500 font-medium">
                {currentStep + 1} / {TOUR_STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
                Пропустить
              </button>
            </div>

            {/* Resume prompt */}
            <AnimatePresence>
              {showResumePrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pt-3 relative z-10"
                >
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-purple-200">Продолжить с шага {currentStep + 1}?</p>
                    </div>
                    <button
                      onClick={handleResumeFromStart}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                    >
                      С начала
                    </button>
                    <button
                      onClick={() => setShowResumePrompt(false)}
                      className="text-[10px] text-purple-300 font-semibold px-2 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                    >
                      Продолжить
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="px-6 py-5 relative z-10 flex-1 flex flex-col">
              {/* Icon / Logo */}
              <div className="flex items-center justify-center mb-4">
                {isFirstStep ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                  >
                    <PromoLogo size="lg" animated={false} glowOnHover={false} />
                  </motion.div>
                ) : isLastStep ? (
                  <motion.div
                    initial={{ scale: 0, rotate: 20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg relative`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                    {/* Confetti particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                          background: ['#FF577F', '#22d3ee', '#eab308', '#a855f7', '#10b981', '#f97316'][i],
                        }}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: [0, (Math.random() - 0.5) * 60],
                          y: [0, -20 - Math.random() * 30],
                        }}
                        transition={{
                          duration: 1.2,
                          delay: 0.3 + i * 0.1,
                          repeat: Infinity,
                          repeatDelay: 1.5,
                        }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg relative`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-50`}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-2 text-center">{step.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 text-center">{step.description}</p>

              {/* Spacer to push everything after description down evenly */}
              <div className="flex-1 flex flex-col justify-center">
              {/* Animated Preview Mockup */}
              <PreviewMockup stepId={step.id} color={step.color} />

              {/* Feature chips */}
              {step.features && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap justify-center gap-1.5 mb-4"
                >
                  {step.features.map((feat, i) => (
                    <motion.span
                      key={feat}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] text-slate-300 font-medium"
                    >
                      {feat}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {/* Tip */}
              {step.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-start gap-2 px-3 py-2.5 bg-yellow-500/5 border border-yellow-500/15 rounded-xl w-full"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-yellow-200/80 leading-relaxed">{step.tip}</span>
                </motion.div>
              )}

              {/* Go to section */}
              {step.section && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  onClick={handleGoToSection}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  Перейти в раздел
                </motion.button>
              )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-6 relative z-10">
              <button
                onClick={handlePrev}
                disabled={isFirstStep}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </button>

              {/* Step dots */}
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setShowResumePrompt(false);
                      setDirection(i > currentStep ? 1 : -1);
                      setCurrentStep(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? `bg-gradient-to-r ${step.color} w-5`
                        : i < currentStep
                          ? 'bg-white/30 w-2'
                          : 'bg-white/10 w-2'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${step.color} hover:opacity-90 transition-opacity shadow-lg`}
              >
                {isLastStep ? (
                  <span className="contents">
                    <CheckCircle2 className="w-4 h-4" />
                    Начать
                  </span>
                ) : (
                  <span className="contents">
                    Далее
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  const isCompleted = () => localStorage.getItem(LS_TOUR_KEY) === LS_TOUR_VERSION;
  const resetTour = () => {
    localStorage.removeItem(LS_TOUR_KEY);
    clearProgress();
    setShowTour(true);
  };

  return { showTour, setShowTour, isCompleted, resetTour };
}