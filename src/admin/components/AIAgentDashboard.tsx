/**
 * AI AGENT DASHBOARD
 * Админ-панель для управления AI-агентом
 * - Модерация новостей
 * - Просмотр чартов
 * - Аналитика трендов
 * - Ручной запуск задач
 */

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Newspaper, PlayCircle, CheckCircle, XCircle, RefreshCw, BarChart3, Radio } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api`;

// =====================================================
// TYPES
// =====================================================

interface ChartEntry {
  position: number;
  title: string;
  artist: string;
  previous_position?: number;
  weeks_in_chart?: number;
}

interface RadioChart {
  source: 'russkoe-radio' | 'radio-maximum' | 'nashe-radio' | 'dfm-radio';
  date: string;
  top10: ChartEntry[];
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  created_at: string;
  published_at?: string;
}

interface Analytics {
  date: string;
  content: string;
  created_at: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function AIAgentDashboard() {
  const [activeTab, setActiveTab] = useState<'news' | 'charts' | 'analytics'>('news');
  const [pendingNews, setPendingNews] = useState<NewsArticle[]>([]);
  const [charts, setCharts] = useState<RadioChart[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchPendingNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-agent/news/pending`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setPendingNews(data.articles || []);
    } catch (error) {
      console.error('Error fetching pending news:', error);
    }
  };

  const fetchCharts = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-agent/charts/latest`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setCharts(data.charts || []);
    } catch (error) {
      console.error('Error fetching charts:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-agent/analytics/latest`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'news') {
      fetchPendingNews();
    } else if (activeTab === 'charts') {
      fetchCharts();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const moderateArticle = async (articleId: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/ai-agent/news/${articleId}/moderate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setPendingNews(prev => prev.filter(a => a.id !== articleId));
        setSelectedArticle(null);
      }
    } catch (error) {
      console.error('Error moderating article:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerChartCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/ai-agent/collect-charts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        await fetchCharts();
        await fetchAnalytics();
      }
    } catch (error) {
      console.error('Error collecting charts:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerNewsProcessing = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/ai-agent/process-news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        await fetchPendingNews();
      }
    } catch (error) {
      console.error('Error processing news:', error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const getRadioName = (source: RadioChart['source']) => {
    const names = {
      'russkoe-radio': 'Русское Радио',
      'radio-maximum': 'Радио Максимум',
      'nashe-radio': 'Наше Радио',
      'dfm-radio': 'DFM Radio',
    };
    return names[source];
  };

  const getPositionChange = (entry: ChartEntry) => {
    if (!entry.previous_position) return <span className="text-purple-400">NEW</span>;
    const change = entry.previous_position - entry.position;
    if (change > 0) return <span className="text-green-400">↑{change}</span>;
    if (change < 0) return <span className="text-red-400">↓{Math.abs(change)}</span>;
    return <span className="text-gray-500">−</span>;
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 mb-2">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Agent Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-400">Управление контентом и аналитикой</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2 xs:pb-0">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center justify-center xs:justify-start gap-2 px-4 xs:px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'news'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-xl border border-white/20'
            }`}
          >
            <Newspaper className="w-4 xs:w-5 h-4 xs:h-5" />
            <span className="font-semibold text-sm xs:text-base">Новости ({pendingNews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center justify-center xs:justify-start gap-2 px-4 xs:px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'charts'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-xl border border-white/20'
            }`}
          >
            <TrendingUp className="w-4 xs:w-5 h-4 xs:h-5" />
            <span className="font-semibold text-sm xs:text-base">Чарты</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center justify-center xs:justify-start gap-2 px-4 xs:px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-xl border border-white/20'
            }`}
          >
            <BarChart3 className="w-4 xs:w-5 h-4 xs:h-5" />
            <span className="font-semibold text-sm xs:text-base">Аналитика</span>
          </button>
        </div>

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Новости на модерации</h2>
              <button
                onClick={triggerNewsProcessing}
                disabled={loading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 w-full xs:w-auto justify-center"
              >
                <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap">Собрать новости</span>
              </button>
            </div>

            {pendingNews.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-12 text-center">
                <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-400">Нет новостей на модерации</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {pendingNews.map(article => (
                  <div
                    key={article.id}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 hover:bg-white/15 transition-all cursor-pointer"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">{article.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          {new Date(article.created_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moderateArticle(article.id, 'approve');
                          }}
                          disabled={loading}
                          className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all disabled:opacity-50"
                          title="Одобрить"
                        >
                          <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 mx-auto sm:mx-0" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moderateArticle(article.id, 'reject');
                          }}
                          disabled={loading}
                          className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all disabled:opacity-50"
                          title="Отклонить"
                        >
                          <XCircle className="w-4 sm:w-5 h-4 sm:h-5 mx-auto sm:mx-0" />
                        </button>
                      </div>
                    </div>
                    {article.source_url && (
                      <a
                        href={article.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Источник →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Article Preview Modal */}
            {selectedArticle && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50"
                onClick={() => setSelectedArticle(null)}
              >
                <div
                  className="bg-gray-900 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex-1">{selectedArticle.title}</h2>
                      <button
                        onClick={() => setSelectedArticle(null)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0"
                      >
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </button>
                    </div>
                    
                    <div
                      className="prose prose-sm sm:prose-base prose-invert max-w-none mb-6 sm:mb-8"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />

                    <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={() => moderateArticle(selectedArticle.id, 'approve')}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span>Одобрить и опубликовать</span>
                      </button>
                      <button
                        onClick={() => moderateArticle(selectedArticle.id, 'reject')}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span>Отклонить</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Чарты радиостанций</h2>
              <button
                onClick={triggerChartCollection}
                disabled={loading}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 w-full xs:w-auto justify-center"
              >
                <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap">Обновить чарты</span>
              </button>
            </div>

            {charts.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-12 text-center">
                <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-400">Нет данных по чартам</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Нажмите "Обновить чарты" для сбора данных</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {charts.map(chart => (
                  <div key={chart.source} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate">{getRadioName(chart.source)}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{new Date(chart.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {chart.top10.map(entry => (
                        <div key={entry.position} className="flex items-center gap-2 xs:gap-3 sm:gap-4 p-2.5 sm:p-3 bg-white/5 rounded-xl">
                          <div className="text-xl xs:text-2xl font-bold text-purple-400 w-6 xs:w-8 text-center flex-shrink-0">
                            {entry.position}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm sm:text-base truncate">{entry.title}</p>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">{entry.artist}</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 sm:gap-1 flex-shrink-0">
                            <div className="text-xs xs:text-sm">{getPositionChange(entry)}</div>
                            {entry.weeks_in_chart && (
                              <span className="text-[10px] xs:text-xs text-gray-500 whitespace-nowrap">{entry.weeks_in_chart} нед</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Аналитика трендов</h2>
            </div>

            {!analytics ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-12 text-center">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-400">Нет аналитических данных</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Запустите сбор чартов для генерации аналитики</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400 flex-shrink-0" />
                    <p className="text-xs sm:text-sm md:text-base text-gray-400">
                      Анализ от {new Date(analytics.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
                
                <div
                  className="prose prose-sm sm:prose-base prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: analytics.content }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}