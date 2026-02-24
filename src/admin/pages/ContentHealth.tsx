import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Newspaper, BarChart3, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Clock, Send, Bell, Info,
  ChevronDown, ChevronUp, Activity, Wifi, WifiOff
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/server/api/content-health`;

// ── Types ────────────────────────────────────────────

interface SourceError {
  sourceId: string;
  sourceName: string;
  error: string;
  lastFetchAt: string;
}

interface NewsHealth {
  collectedToday: number;
  pending: number;
  published: number;
  rejected: number;
  total: number;
  lastPipelineRun: string | null;
  pipelineStale: boolean;
  pendingAlert: boolean;
  sourcesTotal: number;
  sourcesWithErrors: SourceError[];
  sourcesNeverFetched: string[];
}

interface ChartSourceHealth {
  sourceId: string;
  sourceName: string;
  tracksCount: number;
  fetchedAt: string | null;
  parsedBy: 'mistral' | 'fallback' | 'error' | null;
  status: 'ok' | 'stale' | 'error' | 'fallback' | 'empty';
  error?: string;
  ageHours: number | null;
}

interface ChartsHealth {
  lastAggregation: string | null;
  aggregationStale: boolean;
  sources: ChartSourceHealth[];
  totalTracksAcrossAll: number;
}

interface AlertItem {
  level: 'critical' | 'warning' | 'info';
  category: 'news' | 'charts';
  message: string;
  detail?: string;
}

interface ContentHealthData {
  timestamp: string;
  news: NewsHealth;
  charts: ChartsHealth;
  alerts: AlertItem[];
}

// ── Helpers ──────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return 'никогда';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}ч назад`;
  const days = Math.floor(hours / 24);
  return `${days}д назад`;
}

function StatusIcon({ status }: { status: 'ok' | 'stale' | 'error' | 'fallback' | 'empty' | boolean }) {
  if (status === true || status === 'ok') {
    return <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />;
  }
  if (status === 'fallback') {
    return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
  }
  if (status === 'stale') {
    return <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />;
  }
  return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
}

function AlertLevelBadge({ level }: { level: 'critical' | 'warning' | 'info' }) {
  const config = {
    critical: { bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400', label: 'Критический' },
    warning: { bg: 'bg-yellow-500/20 border-yellow-500/40', text: 'text-yellow-400', label: 'Предупреждение' },
    info: { bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400', label: 'Инфо' },
  };
  const c = config[level];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────

export function ContentHealth() {
  const [data, setData] = useState<ContentHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newsExpanded, setNewsExpanded] = useState(true);
  const [chartsExpanded, setChartsExpanded] = useState(true);
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [sendingTelegram, setSendingTelegram] = useState(false);

  const fetchHealth = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch(`${API}/health`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');
      setData(json.data);
      setLastRefresh(new Date());
      if (showToast) toast.success('Данные обновлены');
    } catch (err) {
      const msg = String(err);
      setError(msg);
      console.error('[ContentHealth] Fetch error:', msg);
      if (showToast) toast.error(`Ошибка загрузки: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchHealth(), 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const sendTelegramReport = async () => {
    setSendingTelegram(true);
    try {
      const resp = await fetch(`${API}/telegram-report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const json = await resp.json();
      if (json.success) {
        toast.success('Отчёт отправлен в Telegram');
      } else {
        toast.error(json.error || 'Ошибка отправки');
      }
    } catch (err) {
      toast.error(`Ошибка: ${err}`);
    } finally {
      setSendingTelegram(false);
    }
  };

  const refreshTimerText = lastRefresh
    ? `Обновлено: ${timeAgo(lastRefresh.toISOString())}`
    : 'Загрузка...';

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 xs:gap-4">
        <div>
          <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-white flex items-center gap-2 xs:gap-3">
            <Activity className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 text-red-400" />
            Здоровье контента
          </div>
          <p className="text-gray-400 text-xs xs:text-sm mt-1">Мониторинг новостного pipeline и чартов</p>
        </div>

        <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg text-[10px] xs:text-xs font-medium transition-all ${
              autoRefresh
                ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                : 'bg-white/5 border border-white/10 text-gray-400'
            }`}
            title={autoRefresh ? 'Автообновление включено (60с)' : 'Автообновление выключено'}
          >
            {autoRefresh ? <Wifi className="w-3 h-3 xs:w-3.5 xs:h-3.5" /> : <WifiOff className="w-3 h-3 xs:w-3.5 xs:h-3.5" />}
            {autoRefresh ? '60с' : 'Выкл'}
          </button>

          {/* Refresh timer */}
          <span className="text-[10px] xs:text-xs text-gray-500 hidden sm:inline">
            {refreshTimerText}
          </span>

          {/* Manual refresh */}
          <button
            onClick={() => fetchHealth(true)}
            disabled={loading}
            className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg text-[10px] xs:text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 xs:w-3.5 xs:h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>

          {/* Telegram report */}
          <button
            onClick={sendTelegramReport}
            disabled={sendingTelegram || !data}
            className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg text-[10px] xs:text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all disabled:opacity-50"
          >
            <Send className={`w-3 h-3 xs:w-3.5 xs:h-3.5 ${sendingTelegram ? 'animate-pulse' : ''}`} />
            <span className="hidden xs:inline">Telegram</span><span className="xs:hidden">TG</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && !data && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>Ошибка загрузки: {error}</span>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
              <div className="h-6 w-48 bg-white/10 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-4 bg-white/5 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data loaded */}
      {data && (
        <div className="contents">
          {/* Quick stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3">
            <QuickStat
              label="Собрано сегодня"
              value={data.news.collectedToday}
              icon={<Newspaper className="w-4 h-4" />}
              color="blue"
              alert={data.news.collectedToday === 0}
            />
            <QuickStat
              label="На модерации"
              value={data.news.pending}
              icon={<Clock className="w-4 h-4" />}
              color="yellow"
              alert={data.news.pendingAlert}
            />
            <QuickStat
              label="Опубликовано"
              value={data.news.published}
              icon={<CheckCircle className="w-4 h-4" />}
              color="green"
            />
            <QuickStat
              label="Треков в чартах"
              value={data.charts.totalTracksAcrossAll}
              icon={<BarChart3 className="w-4 h-4" />}
              color="purple"
              alert={data.charts.totalTracksAcrossAll === 0}
            />
          </div>

          {/* Alerts */}
          {data.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl xs:rounded-2xl backdrop-blur-md bg-red-500/5 border border-red-500/20 overflow-hidden"
            >
              <button
                onClick={() => setAlertsExpanded(!alertsExpanded)}
                className="w-full flex items-center justify-between px-3 xs:px-4 sm:px-5 py-3 xs:py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <Bell className="w-4 h-4 xs:w-5 xs:h-5 text-red-400" />
                  <span className="text-white font-semibold">
                    Алерты
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                    {data.alerts.length}
                  </span>
                </div>
                {alertsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              <AnimatePresence>
                {alertsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 xs:px-4 sm:px-5 pb-3 xs:pb-4 space-y-2">
                      {data.alerts.map((alert, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-xl border ${
                            alert.level === 'critical'
                              ? 'bg-red-500/10 border-red-500/20'
                              : alert.level === 'warning'
                              ? 'bg-yellow-500/10 border-yellow-500/20'
                              : 'bg-blue-500/10 border-blue-500/20'
                          }`}
                        >
                          <div className="mt-0.5">
                            {alert.level === 'critical' ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : alert.level === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <AlertLevelBadge level={alert.level} />
                              <span className="text-[10px] text-gray-500 uppercase font-medium">
                                {alert.category === 'news' ? 'Новости' : 'Чарты'}
                              </span>
                            </div>
                            <p className="text-white text-sm mt-1">{alert.message}</p>
                            {alert.detail && (
                              <p className="text-gray-400 text-xs mt-0.5">{alert.detail}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Main panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
            {/* ═══ NEWS PANEL ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl xs:rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setNewsExpanded(!newsExpanded)}
                className="w-full flex items-center justify-between px-3 xs:px-4 sm:px-5 py-3 xs:py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Newspaper className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-white font-semibold text-sm">Новости</span>
                    <div className="text-gray-500 text-[10px]">
                      {data.news.sourcesTotal} источников
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={!data.news.pipelineStale && data.news.sourcesWithErrors.length === 0} />
                  {newsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {newsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <StatCell label="Сегодня собрано" value={data.news.collectedToday} warn={data.news.collectedToday === 0} />
                        <StatCell
                          label="На модерации"
                          value={data.news.pending}
                          warn={data.news.pendingAlert}
                          suffix={data.news.pendingAlert ? '⚠️' : undefined}
                        />
                        <StatCell label="Опубликовано" value={data.news.published} />
                        <StatCell label="Отклонено" value={data.news.rejected} />
                      </div>

                      {/* Pipeline status */}
                      <div className={`flex items-center justify-between p-3 rounded-xl border ${
                        data.news.pipelineStale
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={!data.news.pipelineStale} />
                          <span className="text-sm text-white">Pipeline</span>
                        </div>
                        <span className={`text-xs ${data.news.pipelineStale ? 'text-red-400' : 'text-green-400'}`}>
                          {timeAgo(data.news.lastPipelineRun)}
                        </span>
                      </div>

                      {/* Source errors */}
                      {data.news.sourcesWithErrors.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                            Источники с ошибками
                          </div>
                          {data.news.sourcesWithErrors.map((src) => (
                            <div
                              key={src.sourceId}
                              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15"
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-white text-xs font-medium truncate">{src.sourceName}</span>
                                  <span className="text-gray-500 text-[10px] flex-shrink-0">{timeAgo(src.lastFetchAt)}</span>
                                </div>
                                <p className="text-red-400/80 text-[11px] mt-0.5 truncate">{src.error}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Never fetched sources */}
                      {data.news.sourcesNeverFetched.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-gray-500/5 border border-gray-500/15">
                          <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1">
                            Ещё не запрашивались
                          </div>
                          <div className="text-gray-400 text-xs">
                            {data.news.sourcesNeverFetched.join(', ')}
                          </div>
                        </div>
                      )}

                      {/* All good */}
                      {data.news.sourcesWithErrors.length === 0 && data.news.sourcesNeverFetched.length === 0 && !data.news.pipelineStale && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Все источники работают штатно</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ═══ CHARTS PANEL ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl xs:rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setChartsExpanded(!chartsExpanded)}
                className="w-full flex items-center justify-between px-3 xs:px-4 sm:px-5 py-3 xs:py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-white font-semibold text-sm">Чарты</span>
                    <div className="text-gray-500 text-[10px]">
                      {data.charts.sources.length} источников
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={!data.charts.aggregationStale && data.charts.sources.every(s => s.status === 'ok')} />
                  {chartsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {chartsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      {/* Aggregation status */}
                      <div className={`flex items-center justify-between p-3 rounded-xl border ${
                        data.charts.aggregationStale
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-green-500/10 border-green-500/20'
                      }`}>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={!data.charts.aggregationStale} />
                          <span className="text-sm text-white">Последняя агрегация</span>
                        </div>
                        <span className={`text-xs ${data.charts.aggregationStale ? 'text-red-400' : 'text-green-400'}`}>
                          {timeAgo(data.charts.lastAggregation)}
                        </span>
                      </div>

                      {/* Per-source table */}
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                          Источники чартов
                        </div>
                        {data.charts.sources.map((src) => (
                          <div
                            key={src.sourceId}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                              src.status === 'ok'
                                ? 'bg-white/[0.02] border-white/10'
                                : src.status === 'fallback'
                                ? 'bg-yellow-500/5 border-yellow-500/15'
                                : src.status === 'stale'
                                ? 'bg-yellow-500/5 border-yellow-500/15'
                                : 'bg-red-500/5 border-red-500/15'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <StatusIcon status={src.status} />
                              <div className="min-w-0">
                                <div className="text-white text-sm font-medium truncate">{src.sourceName}</div>
                                {src.error && (
                                  <div className="text-red-400/70 text-[10px] truncate">{src.error}</div>
                                )}
                                {src.status === 'fallback' && (
                                  <div className="text-yellow-400/70 text-[10px]">Mistral не справился</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 text-right">
                              <div>
                                <div className="text-white text-sm font-medium">{src.tracksCount}</div>
                                <div className="text-gray-500 text-[10px]">треков</div>
                              </div>
                              <div className="text-gray-500 text-[10px] w-16 text-right">
                                {timeAgo(src.fetchedAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-purple-400 text-sm">Всего треков</span>
                        <span className="text-white text-sm font-bold">{data.charts.totalTracksAcrossAll}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Telegram setup hint */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-start gap-3">
              <Send className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-white text-sm font-medium">Telegram-алерты</div>
                <p className="text-gray-400 text-xs mt-1">
                  Для автоматических уведомлений добавьте секреты <code className="text-blue-400 bg-blue-500/10 px-1 rounded">TELEGRAM_BOT_TOKEN</code> и{' '}
                  <code className="text-blue-400 bg-blue-500/10 px-1 rounded">TELEGRAM_CHAT_ID</code> в настройках Supabase.
                  Кнопка «Telegram» выше отправит текущий отчёт вручную.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────

function QuickStat({ label, value, icon, color, alert }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'purple';
  alert?: boolean;
}) {
  const colors = {
    blue: { bg: 'from-blue-500/15 to-cyan-500/15', border: 'border-blue-500/25', text: 'text-blue-400' },
    yellow: { bg: 'from-yellow-500/15 to-orange-500/15', border: 'border-yellow-500/25', text: 'text-yellow-400' },
    green: { bg: 'from-green-500/15 to-emerald-500/15', border: 'border-green-500/25', text: 'text-green-400' },
    purple: { bg: 'from-purple-500/15 to-pink-500/15', border: 'border-purple-500/25', text: 'text-purple-400' },
  };
  const c = colors[color];

  return (
    <div className={`relative p-3 sm:p-4 rounded-xl bg-gradient-to-br ${c.bg} border ${c.border} ${alert ? 'ring-1 ring-red-500/50' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`${c.text}`}>{icon}</span>
        {alert && <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />}
      </div>
      <div className="text-white text-xl sm:text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-gray-400 text-[10px] sm:text-xs mt-0.5">{label}</div>
    </div>
  );
}

function StatCell({ label, value, warn, suffix }: {
  label: string;
  value: number;
  warn?: boolean;
  suffix?: string;
}) {
  return (
    <div className={`p-3 rounded-xl border ${
      warn
        ? 'bg-yellow-500/5 border-yellow-500/20'
        : 'bg-white/[0.02] border-white/10'
    }`}>
      <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-bold ${warn ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
        {suffix && <span className="text-xs">{suffix}</span>}
      </div>
    </div>
  );
}