import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, TrendingDown, Music, Play, Heart, Share2, Crown, Flame, Star, Globe, Calendar, Filter, ArrowUp, ArrowDown, Minus, Eye, Headphones, Radio, Loader2, Wifi, WifiOff, RefreshCw, Gift } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { useWeeklyChart } from '@/hooks/useLandingData';
import type { WeeklyChart, ChartEntry } from '@/utils/api/landing-data';
import { getAllCharts } from '@/utils/api/charts-api';
import type { ExternalChartData } from '@/utils/api/charts-api';
import { promoFallbackTracks, fallbackChartSources, fallbackChartTracks } from '@/data/charts-fallback';

interface ChartTrack {
 id: string;
 position: number;
 previousPosition: number;
 title: string;
 artist: string;
 plays?: number;
 likes?: number;
 trend: 'up' | 'down' | 'same' | 'new';
 trendValue: number;
 coverUrl?: string;
 previewUrl?: string;
 onPlatform?: boolean;
}

interface ChartSource {
 id: string;
 name: string;
 logo: string;
 type: 'radio' | 'streaming';
 gradient: string;
 borderColor: string;
 tracks: ChartTrack[];
}

interface ChartsSectionProps {
 onPlayTrack?: (track: { id: string; title: string; artist: string; cover?: string; audioUrl?: string }) => void;
}

export function ChartsSection({ onPlayTrack }: ChartsSectionProps) {
 const [selectedChart, setSelectedChart] = useState<string>('promo');
 const { data: weeklyChart, isLoading: chartLoading, error: chartError, refetch: refetchChart } = useWeeklyChart();
 const [externalCharts, setExternalCharts] = useState<ExternalChartData[]>([]);

 useEffect(() => {
 getAllCharts().then(data => setExternalCharts(data));
 }, []);

 // Конвертация серверного чарта в ChartTrack[]
 const promoTracks: ChartTrack[] = weeklyChart?.entries
 ? weeklyChart.entries.map((e: any) => {
 const diff = (e.previousPosition || 0) - (e.position || 0);
 const trend: ChartTrack['trend'] = e.trend || (diff > 0 ? 'up' : diff < 0 ? 'down' : 'same');
 return {
 id: e.trackId || 'chart-' + e.position,
 position: e.position,
 previousPosition: e.previousPosition || 0,
 title: e.title,
 artist: e.artist,
 plays: e.plays,
 likes: e.likes,
 trend,
 trendValue: e.trendValue || Math.abs(diff),
 coverUrl: e.coverUrl || e.cover || e.coverSmall || '',
 previewUrl: e.previewUrl || '',
 onPlatform: e.onPlatform || false,
 };
 })
 : [];

 // Данные чартов от разных источников (fallback из data файла, API данные приоритетнее)
 const chartSources: ChartSource[] = [
 {
 id: 'promo',
 name: 'ПРОМО.МУЗЫКА',
 logo: '🎯',
 type: 'streaming',
 gradient: 'from-[#FF577F]/20 to-purple-500/20',
 borderColor: 'border-[#FF577F]/30',
 tracks: promoTracks.length > 0 ? promoTracks.slice(0, 10) : promoFallbackTracks,
 },
 ...fallbackChartSources.map(source => ({
 ...source,
 tracks: fallbackChartTracks[source.id] || [],
 })),
 ];

 // Мержим серверные данные (если есть) поверх fallback
 const mergedChartSources: ChartSource[] = chartSources.map(source => {
 if (source.id === 'promo') return source; // ПРОМО.МУЗЫКА чарт загружается отдельно
 const ext = externalCharts.find(e => e.sourceId === source.id);
 if (ext && ext.tracks && ext.tracks.length > 0) {
 return {
 ...source,
 logo: ext.logo || source.logo,
 tracks: ext.tracks.map((t, i) => ({
 id: `${ext.sourceId}-${t.position || i}`,
 position: t.position,
 previousPosition: t.previousPosition,
 title: t.title,
 artist: t.artist,
 trend: t.trend,
 trendValue: t.trendValue,
 })),
 };
 }
 return source;
 });

 const currentChart = mergedChartSources.find(c => c.id === selectedChart) || mergedChartSources[0];

 const getTrendIcon = (trend: ChartTrack['trend'], value: number) => {
 if (trend === 'new') return <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" />;
 if (trend === 'up') return <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />;
 if (trend === 'down') return <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />;
 return <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />;
 };

 const getTrendColor = (trend: ChartTrack['trend']) => {
 if (trend === 'new') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
 if (trend === 'up') return 'bg-green-500/20 text-green-400 border-green-500/30';
 if (trend === 'down') return 'bg-red-500/20 text-red-400 border-red-500/30';
 return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
 };

 const formatNumber = (num?: number) => {
 if (!num) return '';
 if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
 if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
 return num.toString();
 };

 // Статистика
 const totalCharts = mergedChartSources.length;
 const radioCharts = mergedChartSources.filter(c => c.type === 'radio').length;
 const streamingCharts = mergedChartSources.filter(c => c.type === 'streaming').length;
 const totalTracks = mergedChartSources.reduce((acc, chart) => acc + chart.tracks.length, 0);

 return (
 <div className="space-y-4 sm:space-y-6 md:space-y-7 lg:space-y-8">
 {/* Header */}
 <motion.div 
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-2 sm:mb-3 md:mb-4 text-display leading-tight">
 Музыкальные чарты
 </div>
 <p className="text-[11px] sm:text-sm md:text-base text-slate-400 leading-relaxed">
 ТОП-10 треков от радиостанций и стриминговых сервисов
 </p>
 </motion.div>

 {/* Stats Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 lg:gap-5 xl:gap-6">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-6"
 >
 <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-[#FF577F] mb-1.5 sm:mb-3" />
 <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 sm:mb-1">{totalCharts}</p>
 <p className="text-[10px] sm:text-sm text-slate-400">Чартов</p>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-6"
 >
 <Radio className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-400 mb-1.5 sm:mb-3" />
 <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 sm:mb-1">{radioCharts}</p>
 <p className="text-[10px] sm:text-sm text-slate-400">Радиостанций</p>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-6"
 >
 <Headphones className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-green-400 mb-1.5 sm:mb-3" />
 <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 sm:mb-1">{streamingCharts}</p>
 <p className="text-[10px] sm:text-sm text-slate-400">Стримингов</p>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-5 lg:p-6"
 >
 <Music className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-yellow-400 mb-1.5 sm:mb-3" />
 <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black font-mono mb-0.5 sm:mb-1">{totalTracks}</p>
 <p className="text-[10px] sm:text-sm text-slate-400">Всего треков</p>
 </motion.div>
 </div>

 {/* Chart Source Selector */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5 }}
 >
 <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
 <Filter className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-400" />
 <span className="text-xs sm:text-base font-bold text-slate-400">Выберите чарт:</span>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1.5 sm:gap-2.5">
 {mergedChartSources.map((chart) => (
 <motion.div
 key={chart.id}
 role="button"
 tabIndex={0}
 whileHover={{ scale: 1.05, y: -2 }}
 whileTap={{ scale: 0.95 }}
 onClick={() => setSelectedChart(chart.id)}
 onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') setSelectedChart(chart.id); }}
 className={`flex flex-col items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all border cursor-pointer ${
 selectedChart === chart.id
 ? `bg-gradient-to-br ${chart.gradient} ${chart.borderColor} shadow-md`
 : 'bg-white/5 border-white/10 hover:bg-white/10'
 }`}
 >
 <span className="text-xl sm:text-3xl">{chart.logo}</span>
 <span className="text-[9px] sm:text-xs font-bold text-center leading-tight">{chart.name}</span>
 </motion.div>
 ))}
 </div>
 </motion.div>

 {/* TOP 3 Highlights */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 }}
 className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4"
 >
 {currentChart.tracks.slice(0, 3).map((track, index) => (
 <motion.div
 key={track.id}
 whileHover={{ scale: 1.03, y: -5 }}
 className={`relative bg-gradient-to-br ${
 index === 0 ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' :
 index === 1 ? 'from-slate-400/20 to-slate-500/20 border-slate-400/30' :
 'from-amber-600/20 to-amber-700/20 border-amber-600/30'
 } border rounded-xl sm:rounded-2xl p-3 sm:p-5 cursor-pointer`}
 onClick={() => onPlayTrack?.({ id: track.id, title: track.title, artist: track.artist, cover: track.coverUrl, audioUrl: track.previewUrl })}
 >
 <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
 {index === 0 && <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-400" fill="currentColor" />}
 {index === 1 && <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-slate-400" fill="currentColor" />}
 {index === 2 && <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" fill="currentColor" />}
 </div>
 <div className="text-3xl sm:text-5xl md:text-6xl font-black opacity-20 mb-2 sm:mb-3">#{index + 1}</div>
 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 sm:mb-3 border border-white/10">
 {track.coverUrl ? (
 <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-[#FF577F]/30 to-purple-500/30 flex items-center justify-center">
 <Music className="w-8 h-8 text-[#FF577F]/60" />
 </div>
 )}
 </div>
 <div className="text-sm sm:text-lg md:text-xl font-black mb-1 leading-tight">{track.title}</div>
 <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">{track.artist}</p>
 {track.plays && (
 <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs">
 <span className="flex items-center gap-1">
 <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
 {formatNumber(track.plays)}
 </span>
 <span className="flex items-center gap-1">
 <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
 {formatNumber(track.likes)}
 </span>
 {track.onPlatform && (
 <button onClick={() => toast.info('Донаты скоро будут доступны!')} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF577F]/20 text-[#FF577F] hover:bg-[#FF577F]/30 transition-colors">
 <Gift className="w-3 h-3" />
 Поддержать
 </button>
 )}
 </div>
 )}
 </motion.div>
 ))}
 </motion.div>

 {/* Chart Table */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.7 }}
 className={`bg-gradient-to-br ${currentChart.gradient} border ${currentChart.borderColor} rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden`}
 >
 {/* Chart Header */}
 <div className="bg-white/5 border-b border-white/10 p-3 sm:p-5 md:p-6">
 <div className="flex items-center gap-2 sm:gap-4">
 <span className="text-3xl sm:text-5xl">{currentChart.logo}</span>
 <div className="flex-1">
 <div className="text-lg sm:text-2xl md:text-3xl font-black">{currentChart.name}</div>
 <p className="text-[10px] sm:text-sm text-slate-400">
 {currentChart.type === 'radio' ? 'Радиостанция' : 'Стриминговый сервис'} • ТОП-10
 </p>
 </div>
 {selectedChart === 'promo' && (
 <div className="flex items-center gap-2">
 {chartLoading ? (
 <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[9px] sm:text-[10px]">
 <Loader2 className="w-2.5 h-2.5 animate-spin" />
 <span className="hidden sm:inline">Загрузка...</span>
 </span>
 ) : promoTracks.length > 0 ? (
 <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[9px] sm:text-[10px]">
 <Wifi className="w-2.5 h-2.5" />
 <span className="hidden sm:inline">Сервер</span>
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-[9px] sm:text-[10px]">
 <WifiOff className="w-2.5 h-2.5" />
 <span className="hidden sm:inline">Демо</span>
 </span>
 )}
 <div
 role="button"
 tabIndex={0}
 onClick={() => refetchChart()}
 onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') refetchChart(); }}
 className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
 title="Обновить"
 >
 <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
 </div>
 </div>
 )}
 {selectedChart !== 'promo' && (() => {
 const ext = externalCharts.find(e => e.sourceId === selectedChart);
 const hasServerData = ext && ext.tracks && ext.tracks.length > 0;
 return hasServerData ? (
 <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[9px] sm:text-[10px]">
 <Wifi className="w-2.5 h-2.5" />
 <span className="hidden sm:inline">Обновлено</span>
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/10 border border-slate-500/20 rounded-full text-slate-400 text-[9px] sm:text-[10px]">
 <WifiOff className="w-2.5 h-2.5" />
 <span className="hidden sm:inline">Демо</span>
 </span>
 );
 })()}
 </div>
 </div>

 {/* Table Body */}
 <div className="divide-y divide-white/5">
 {currentChart.tracks.map((track, index) => (
 <motion.div
 key={track.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.05 }}
 whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
 className="grid grid-cols-12 gap-2 sm:gap-4 p-2 sm:p-4 lg:p-5 cursor-pointer items-center group"
 onClick={() => onPlayTrack?.({ id: track.id, title: track.title, artist: track.artist, cover: track.coverUrl, audioUrl: track.previewUrl })}
 >
 {/* Position */}
 <div className="col-span-2 sm:col-span-1">
 <div className="flex items-center gap-1 sm:gap-2">
 {track.position <= 3 && (
 <Crown className={`w-3 h-3 sm:w-4 sm:h-4 ${
 track.position === 1 ? 'text-yellow-400' :
 track.position === 2 ? 'text-slate-400' :
 'text-amber-600'
 }`} fill="currentColor" />
 )}
 <span className="text-sm sm:text-lg md:text-xl font-black font-mono">{track.position}</span>
 </div>
 </div>

 {/* Trend */}
 <div className="col-span-2 sm:col-span-1">
 <div className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${getTrendColor(track.trend)}`}>
 {getTrendIcon(track.trend, track.trendValue)}
 {track.trendValue > 0 && <span className="text-[9px] sm:text-xs font-bold">{track.trendValue}</span>}
 </div>
 </div>

 {/* Track Info */}
 <div className="col-span-8 sm:col-span-6 md:col-span-7 lg:col-span-8 flex items-center gap-2 sm:gap-3">
 <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
 {track.coverUrl ? (
 <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" loading="lazy" />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-[#FF577F]/20 to-purple-500/20 flex items-center justify-center">
 <Music className="w-5 h-5 text-[#FF577F]/50" />
 </div>
 )}
 </div>
 <div className="min-w-0 flex-1">
 <div className="text-xs sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 group-hover:text-[#FF577F] transition-colors leading-tight truncate">
 {track.title}
 </div>
 <p className="text-[10px] sm:text-sm text-slate-400 truncate">{track.artist}</p>
 </div>
 </div>

 {/* Stats - только для стриминговых сервисов на больших экранах */}
 {track.plays && (
 <div className="hidden md:flex col-span-3 lg:col-span-2 items-center gap-3 text-xs">
 <span className="flex items-center gap-1">
 <Play className="w-3.5 h-3.5 text-blue-400" />
 <span className="font-mono font-bold">{formatNumber(track.plays)}</span>
 </span>
 <span className="flex items-center gap-1">
 <Heart className="w-3.5 h-3.5 text-green-400" />
 <span className="font-mono font-bold">{formatNumber(track.likes)}</span>
 </span>
 {track.onPlatform && (
 <button onClick={(e) => { e.stopPropagation(); toast.info('Донаты скоро будут доступны!'); }} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF577F]/20 text-[#FF577F] hover:bg-[#FF577F]/30 transition-colors">
 <Gift className="w-3 h-3" />
 <span className="hidden lg:inline">Поддержать</span>
 </button>
 )}
 </div>
 )}
 </motion.div>
 ))}
 </div>
 </motion.div>

 {/* CTA */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8 }}
 whileHover={{ scale: 1.02 }}
 className="bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 cursor-pointer"
 >
 <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-5 md:gap-6 lg:gap-8">
 <div className="flex-1 text-center md:text-left">
 <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 justify-center md:justify-start">
 <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-[#FF577F]" />
 <div className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black">Попади в чарты</div>
 </div>
 <p className="text-[10px] sm:text-sm md:text-base lg:text-lg text-slate-400 leading-relaxed">
 Загрузи трек на платформу и получи шанс попасть в TOP-10 радиостанций
 </p>
 </div>
 <Button className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-5 md:py-6 lg:py-7 rounded-full text-xs sm:text-base md:text-lg shadow-md shadow-[#FF577F]/10 whitespace-nowrap">
 Загрузить трек
 </Button>
 </div>
 </motion.div>
 </div>
 );
}