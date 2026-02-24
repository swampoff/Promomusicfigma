/**
 * NEWS PIPELINE DASHBOARD
 * Управление pipeline сбора и модерации новостей
 * - Статус источников
 * - Запуск сбора
 * - Предпросмотр и модерация
 * - Статистика
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Newspaper, RefreshCw, CheckCircle, XCircle, Globe, Clock, 
  AlertTriangle, TrendingUp, Eye, Trash2, ChevronDown, ChevronUp,
  ExternalLink, Filter, Loader2, Inbox, Check, X, Wifi, WifiOff,
  BarChart3, Zap, Archive, FileText, Play, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server/api/ai-agent`;

// =====================================================
// TYPES
// =====================================================

interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'html';
  category: string;
  enabled: boolean;
  status: {
    sourceId: string;
    sourceName: string;
    lastFetchAt: string | null;
    lastFetchStatus: 'success' | 'error' | 'never';
    articlesCollected: number;
    lastError?: string;
  };
}

interface PendingArticle {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  content: string;
  coverImage: string;
  source: string;
  sourceUrl?: string;
  processedAt: string;
  status: string;
}

interface PipelineStats {
  totalCollected: number;
  totalPending: number;
  totalPublished: number;
  totalRejected: number;
  lastRunAt: string | null;
  sourcesActive: number;
}

type Tab = 'pipeline' | 'pending' | 'published' | 'rejected';

// =====================================================
// COMPONENT
// =====================================================

export function AIAgentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('pipeline');
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<PendingArticle[]>([]);
  const [rejectedArticles, setRejectedArticles] = useState<PendingArticle[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<PendingArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [collectingSource, setCollectingSource] = useState<string | null>(null);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  // =====================================================
  // API CALLS
  // =====================================================

  const headers = {
    'Authorization': `Bearer ${publicAnonKey}`,
    'Content-Type': 'application/json',
  };

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sources`, { headers });
      const data = await res.json();
      if (data.success) setSources(data.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/pending`, { headers });
      const data = await res.json();
      if (data.success) setPendingArticles(data.data);
    } catch (error) {
      console.error('Error fetching pending:', error);
    }
  }, []);

  const fetchPublished = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/published?limit=50`, { headers });
      const data = await res.json();
      if (data.success) setPublishedArticles(data.data);
    } catch (error) {
      console.error('Error fetching published:', error);
    }
  }, []);

  const fetchRejected = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/rejected`, { headers });
      const data = await res.json();
      if (data.success) setRejectedArticles(data.data);
    } catch (error) {
      console.error('Error fetching rejected:', error);
    }
  }, []);

  // Load data on tab change
  useEffect(() => {
    fetchStats();
    if (activeTab === 'pipeline') {
      fetchSources();
    } else if (activeTab === 'pending') {
      fetchPending();
    } else if (activeTab === 'published') {
      fetchPublished();
    } else if (activeTab === 'rejected') {
      fetchRejected();
    }
  }, [activeTab]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const collectAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/collect`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Сбор завершён', {
          description: data.data.message,
        });
        await fetchSources();
        await fetchStats();
        await fetchPending();
      } else {
        toast.error('Ошибка сбора', { description: data.error });
      }
    } catch (error) {
      toast.error('Ошибка сети', { description: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const collectFromSource = async (sourceId: string) => {
    setCollectingSource(sourceId);
    try {
      const res = await fetch(`${API_BASE}/collect`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sourceIds: [sourceId] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.data.message}`);
        await fetchSources();
        await fetchStats();
      } else {
        toast.error('Ошибка', { description: data.error });
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setCollectingSource(null);
    }
  };

  const approveArticle = async (id: string) => {
    setModeratingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Новость опубликована');
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        if (selectedArticle?.id === id) setSelectedArticle(null);
        await fetchStats();
      }
    } catch (error) {
      toast.error('Ошибка одобрения');
    } finally {
      setModeratingId(null);
    }
  };

  const rejectArticle = async (id: string) => {
    setModeratingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Новость отклонена');
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        if (selectedArticle?.id === id) setSelectedArticle(null);
        await fetchStats();
      }
    } catch (error) {
      toast.error('Ошибка отклонения');
    } finally {
      setModeratingId(null);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Новость удалена');
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        setPublishedArticles(prev => prev.filter(a => a.id !== id));
        setRejectedArticles(prev => prev.filter(a => a.id !== id));
        if (selectedArticle?.id === id) setSelectedArticle(null);
        await fetchStats();
      }
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const approveAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/approve-all`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Одобрено: ${data.data.approved} новостей`);
        setPendingArticles([]);
        await fetchStats();
      }
    } catch (error) {
      toast.error('Ошибка массового одобрения');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Никогда';
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSourceIcon = (type: string) => {
    return type === 'rss' ? <Wifi className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Активен';
      case 'error': return 'Ошибка';
      default: return 'Не запускался';
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#0a0a14] p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 mb-2">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex-shrink-0">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Новостной pipeline</h1>
              <p className="text-sm sm:text-base text-gray-400">Сбор, обработка и модерация новостей</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Inbox className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400">На модерации</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.totalPending}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-400">Опубликовано</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.totalPublished}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-slate-400">Отклонено</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.totalRejected}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Всего собрано</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.totalCollected}</p>
              {stats.lastRunAt && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Последний запуск: {formatDate(stats.lastRunAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3 mb-4 sm:mb-6">
          {([
            { key: 'pipeline' as Tab, label: 'Источники', icon: Globe, count: sources.length },
            { key: 'pending' as Tab, label: 'На модерации', icon: Inbox, count: stats?.totalPending || 0 },
            { key: 'published' as Tab, label: 'Опубликовано', icon: CheckCircle, count: stats?.totalPublished || 0 },
            { key: 'rejected' as Tab, label: 'Отклонено', icon: XCircle, count: stats?.totalRejected || 0 },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all text-xs xs:text-sm sm:text-base whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-semibold">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[10px] xs:text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pipeline / Sources Tab */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">Источники новостей</h2>
              <button
                onClick={collectAll}
                disabled={loading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 text-sm sm:text-base w-full xs:w-auto justify-center"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Собрать из всех</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {sources.map(source => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 sm:p-4 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-lg border ${getStatusColor(source.status.lastFetchStatus)}`}>
                        {getSourceIcon(source.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">{source.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] xs:text-xs px-1.5 py-0.5 rounded-full border ${getStatusColor(source.status.lastFetchStatus)}`}>
                            {getStatusLabel(source.status.lastFetchStatus)}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase">{source.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => collectFromSource(source.id)}
                      disabled={collectingSource === source.id}
                      className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all disabled:opacity-50 flex-shrink-0"
                      title="Собрать из этого источника"
                    >
                      {collectingSource === source.id
                        ? <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                        : <Play className="w-4 h-4 text-purple-400" />
                      }
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 truncate">
                        {source.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{formatDate(source.status.lastFetchAt)}</span>
                    </div>
                    {source.status.articlesCollected > 0 && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span>Собрано: {source.status.articlesCollected} статей</span>
                      </div>
                    )}
                    {source.status.lastError && (
                      <div className="flex items-start gap-1.5 text-red-400/70 mt-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{source.status.lastError}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {source.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Articles Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                На модерации
                {pendingArticles.length > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">({pendingArticles.length})</span>
                )}
              </h2>
              {pendingArticles.length > 0 && (
                <div className="flex gap-2 w-full xs:w-auto">
                  <button
                    onClick={approveAll}
                    disabled={loading}
                    className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Одобрить все</span>
                  </button>
                  <button
                    onClick={fetchPending}
                    className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    title="Обновить"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {pendingArticles.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
                <Inbox className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-slate-400">Нет новостей на модерации</p>
                <p className="text-xs text-slate-500 mt-2">
                  Запустите сбор из вкладки «Источники»
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {pendingArticles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {article.coverImage && (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 hidden xs:block"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3
                            className="font-bold text-white text-sm sm:text-base line-clamp-2 cursor-pointer hover:text-purple-300 transition-colors"
                            onClick={() => setSelectedArticle(article)}
                          >
                            {article.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] xs:text-xs text-slate-500">
                          <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                            {article.tag}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {article.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(article.processedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => approveArticle(article.id)}
                          disabled={moderatingId === article.id}
                          className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          title="Одобрить"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => rejectArticle(article.id)}
                          disabled={moderatingId === article.id}
                          className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                          title="Отклонить"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Published Articles Tab */}
        {activeTab === 'published' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Опубликованные
                {publishedArticles.length > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">({publishedArticles.length})</span>
                )}
              </h2>
              <button
                onClick={fetchPublished}
                className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                title="Обновить"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {publishedArticles.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
                <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Нет опубликованных новостей</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {publishedArticles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:bg-white/[0.07] transition-all cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{article.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{article.tag}</span>
                        <span>-</span>
                        <span>{article.source}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteArticle(article.id); }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejected Articles Tab */}
        {activeTab === 'rejected' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Отклонённые
                {rejectedArticles.length > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">({rejectedArticles.length})</span>
                )}
              </h2>
              <button
                onClick={fetchRejected}
                className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                title="Обновить"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {rejectedArticles.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
                <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Нет отклонённых новостей</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {rejectedArticles.map((article, i) => (
                  <div
                    key={article.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 flex items-center gap-3 opacity-70"
                  >
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-white truncate">{article.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{article.tag}</span>
                        <span>-</span>
                        <span>{article.source}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteArticle(article.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Article Preview Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0d0d1a] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedArticle.coverImage && (
                  <img
                    src={selectedArticle.coverImage}
                    alt=""
                    className="w-full h-40 sm:h-56 object-cover rounded-t-2xl"
                  />
                )}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                          {selectedArticle.tag}
                        </span>
                        <span className="text-xs text-slate-500">{selectedArticle.source}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedArticle.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                          selectedArticle.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {selectedArticle.status === 'published' ? 'Опубликовано' :
                           selectedArticle.status === 'rejected' ? 'Отклонено' : 'На модерации'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedArticle.title}</h2>
                    </div>
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 mb-4 italic">{selectedArticle.excerpt}</p>

                  <div
                    className="prose prose-sm sm:prose-base prose-invert max-w-none mb-6 sm:mb-8
                      prose-p:text-slate-300 prose-strong:text-white prose-headings:text-white
                      prose-li:text-slate-300 prose-ul:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />

                  {selectedArticle.sourceUrl && (
                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mb-6"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Источник: {selectedArticle.sourceUrl}
                    </a>
                  )}

                  {selectedArticle.status === 'pending' && (
                    <div className="flex flex-col xs:flex-row gap-3">
                      <button
                        onClick={() => approveArticle(selectedArticle.id)}
                        disabled={moderatingId === selectedArticle.id}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 font-semibold"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Одобрить и опубликовать</span>
                      </button>
                      <button
                        onClick={() => rejectArticle(selectedArticle.id)}
                        disabled={moderatingId === selectedArticle.id}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 font-semibold"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Отклонить</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}