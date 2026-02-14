/**
 * CHARTS MANAGEMENT - Admin page for managing external chart aggregation
 * Позволяет запускать сбор данных из внешних источников (радиостанции, стриминги)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, RefreshCw, Radio, Headphones, Music, Globe, Clock,
  CheckCircle, XCircle, Loader2, AlertTriangle, TrendingUp, ArrowUp,
  ArrowDown, Star, Minus, ExternalLink, Zap, Database, Eye, ChevronDown,
  ChevronUp, Play
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getChartSources,
  getAllCharts,
  aggregateCharts,
  getAggregationStatus,
} from '@/utils/api/charts-api';
import type {
  ChartSourceInfo,
  ExternalChartData,
  AggregationStatus,
  AggregationResult,
} from '@/utils/api/charts-api';

export function ChartsManagement() {
  const [sources, setSources] = useState<ChartSourceInfo[]>([]);
  const [charts, setCharts] = useState<ExternalChartData[]>([]);
  const [aggStatus, setAggStatus] = useState<AggregationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAggregating, setIsAggregating] = useState(false);
  const [aggResults, setAggResults] = useState<AggregationResult[] | null>(null);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [s, c, a] = await Promise.all([
        getChartSources(),
        getAllCharts(),
        getAggregationStatus(),
      ]);
      setSources(s);
      setCharts(c);
      setAggStatus(a);
    } catch (error) {
      console.error('Error loading chart data:', error);
      toast.error('Ошибка загрузки данных чартов');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAggregate(sourceIds?: string[]) {
    setIsAggregating(true);
    setAggResults(null);
    const targetLabel = sourceIds?.length
      ? `${sourceIds.length} источник${sourceIds.length > 1 ? 'ов' : ''}`
      : 'всех источников';
    toast.info(`Запускаем сбор данных из ${targetLabel}...`, { duration: 3000 });

    try {
      const result = await aggregateCharts(sourceIds);
      if (result.success && result.results) {
        setAggResults(result.results);
        const total = result.results.reduce((s, r) => s + r.tracksFound, 0);
        const successCount = result.results.filter(r => r.tracksFound > 0).length;
        toast.success(`Собрано ${total} треков из ${successCount}/${result.results.length} источников`);
        // Reload data
        await loadData();
      } else {
        toast.error(`Ошибка агрегации: ${result.error}`);
      }
    } catch (error) {
      console.error('Aggregation error:', error);
      toast.error('Ошибка при агрегации чартов');
    } finally {
      setIsAggregating(false);
    }
  }

  function toggleSource(id: string) {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatDate(iso: string | null) {
    if (!iso) return 'Нет данных';
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'new') return <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />;
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-green-400" />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-slate-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const totalTracksInCache = charts.reduce((sum, c) => sum + c.tracks.length, 0);
  const sourcesWithData = charts.filter(c => c.tracks.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Управление чартами
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Агрегация данных из внешних музыкальных чартов
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Обновить
          </button>
          <button
            onClick={() => handleAggregate(
              selectedSources.size > 0 ? Array.from(selectedSources) : undefined
            )}
            disabled={isAggregating}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {isAggregating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {selectedSources.size > 0
              ? `Собрать (${selectedSources.size})`
              : 'Собрать все'}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Globe className="w-6 h-6 text-cyan-400 mb-2" />
          <p className="text-2xl font-black font-mono">{sources.length}</p>
          <p className="text-xs text-slate-400">Источников</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Database className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-2xl font-black font-mono">{sourcesWithData}</p>
          <p className="text-xs text-slate-400">С данными</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Music className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-2xl font-black font-mono">{totalTracksInCache}</p>
          <p className="text-xs text-slate-400">Треков в кэше</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Clock className="w-6 h-6 text-yellow-400 mb-2" />
          <p className="text-sm font-bold font-mono">{aggStatus ? formatDate(aggStatus.timestamp) : 'Ещё не запускалась'}</p>
          <p className="text-xs text-slate-400 mt-1">Последняя агрегация</p>
        </div>
      </div>

      {/* Aggregation Results */}
      <AnimatePresence>
        {aggResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-5"
          >
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              Результаты последней агрегации
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {aggResults.map(r => (
                <div
                  key={r.sourceId}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    r.tracksFound > 0
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {r.tracksFound > 0 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-xs font-bold">{r.sourceName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{r.tracksFound} треков</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      r.parsedBy === 'mistral' ? 'bg-cyan-500/20 text-cyan-400' :
                      r.parsedBy === 'fallback' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {r.parsedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source List */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Globe className="w-5 h-5 text-slate-400" />
          Источники чартов
        </h2>

        {charts.map(chart => {
          const source = sources.find(s => s.id === chart.sourceId);
          const isExpanded = expandedSource === chart.sourceId;
          const isSelected = selectedSources.has(chart.sourceId);
          const hasTracks = chart.tracks.length > 0;

          return (
            <motion.div
              key={chart.sourceId}
              layout
              className={`bg-white/5 border rounded-2xl overflow-hidden transition-colors ${
                isSelected ? 'border-cyan-500/40' : 'border-white/10'
              }`}
            >
              {/* Source Header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedSource(isExpanded ? null : chart.sourceId)}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSource(chart.sourceId); }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  {isSelected && <CheckCircle className="w-3 h-3" />}
                </button>

                {/* Logo & Name */}
                <span className="text-2xl">{chart.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate">{chart.sourceName}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      chart.type === 'radio'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                    }`}>
                      {chart.type === 'radio' ? 'Радио' : 'Стриминг'}
                    </span>
                  </div>
                  <a
                    href={chart.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    {chart.sourceUrl}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className={`text-xs font-mono font-bold ${hasTracks ? 'text-green-400' : 'text-slate-500'}`}>
                      {chart.tracks.length} треков
                    </span>
                    {chart.fetchedAt && (
                      <p className="text-[10px] text-slate-500">{formatDate(chart.fetchedAt)}</p>
                    )}
                  </div>
                  {chart.parsedBy === 'mistral' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      Обработано
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Track List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 px-4 py-3">
                      {chart.error && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-3 text-xs text-yellow-400">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          {chart.error}
                        </div>
                      )}

                      {hasTracks ? (
                        <div className="divide-y divide-white/5">
                          {chart.tracks.map((track, idx) => (
                            <div key={idx} className="flex items-center gap-3 py-1.5 text-xs">
                              <span className="w-6 text-right font-mono font-bold text-slate-500">
                                {track.position}
                              </span>
                              <span className="w-5 flex justify-center">
                                {getTrendIcon(track.trend)}
                              </span>
                              <span className="flex-1 font-bold truncate">{track.title}</span>
                              <span className="text-slate-400 truncate max-w-[150px]">{track.artist}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-sm text-slate-500">
                          <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Нет данных - запустите агрегацию
                        </div>
                      )}

                      {/* Single-source aggregate button */}
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleAggregate([chart.sourceId])}
                          disabled={isAggregating}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-xs font-bold text-cyan-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isAggregating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Обновить этот чарт
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Help note */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Как работает агрегация
        </h3>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Система загружает HTML-страницы выбранных источников</li>
          <li>Из текста страниц извлекаются позиции, названия треков и исполнители</li>
          <li>При повторной агрегации рассчитываются тренды (вверх/вниз/новый) на основе предыдущих данных</li>
          <li>Данные кэшируются и отображаются на публичной странице чартов</li>
          <li>Рекомендуется обновлять раз в неделю</li>
        </ul>
      </div>
    </div>
  );
}
