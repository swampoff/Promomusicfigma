/**
 * WEEKLY CHARTS WIDGET
 * Виджет для отображения чартов на главной странице
 * Данные собираются через AI-агента
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Radio, Play, ChevronRight } from 'lucide-react';
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

// =====================================================
// COMPONENT
// =====================================================

export function WeeklyCharts() {
  const [charts, setCharts] = useState<RadioChart[]>([]);
  const [selectedSource, setSelectedSource] = useState<RadioChart['source'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/ai-agent/charts/latest`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        console.error('Failed to fetch charts');
        return;
      }

      const data = await response.json();
      setCharts(data.charts || []);
      
      // Выбираем первый источник по умолчанию
      if (data.charts && data.charts.length > 0) {
        setSelectedSource(data.charts[0].source);
      }
    } catch (error) {
      console.error('Error fetching charts:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!entry.previous_position) {
      return { icon: '★', color: 'text-purple-400', label: 'NEW' };
    }
    const change = entry.previous_position - entry.position;
    if (change > 0) {
      return { icon: '↑', color: 'text-green-400', label: `+${change}` };
    }
    if (change < 0) {
      return { icon: '↓', color: 'text-red-400', label: `${change}` };
    }
    return { icon: '−', color: 'text-gray-400', label: '0' };
  };

  const selectedChart = charts.find(c => c.source === selectedSource);

  if (loading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (charts.length === 0) {
    return null; // Скрываем если нет данных
  }

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Топ-10 недели
              </h2>
            </div>
            <p className="text-gray-400">
              Актуальные чарты российских радиостанций
            </p>
          </div>
        </div>

        {/* Radio Station Selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          {charts.map(chart => (
            <button
              key={chart.source}
              onClick={() => setSelectedSource(chart.source)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                selectedSource === chart.source
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-xl border border-white/20'
              }`}
            >
              <Radio className="w-5 h-5" />
              <span className="font-semibold">{getRadioName(chart.source)}</span>
            </button>
          ))}
        </div>

        {/* Chart Display */}
        {selectedChart && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Radio className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {getRadioName(selectedChart.source)}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {new Date(selectedChart.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Top 10 List */}
            <div className="space-y-3">
              {selectedChart.top10.map((entry, index) => {
                const change = getPositionChange(entry);
                const isTop3 = entry.position <= 3;

                return (
                  <div
                    key={entry.position}
                    className={`group flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5 ${
                      isTop3 ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : 'bg-white/5'
                    }`}
                  >
                    {/* Position */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                        isTop3
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {entry.position}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {entry.title}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {entry.artist}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      {/* Position Change */}
                      <div className={`flex items-center gap-1 font-bold ${change.color}`}>
                        <span>{change.icon}</span>
                        <span className="text-sm">{change.label}</span>
                      </div>

                      {/* Weeks in Chart */}
                      {entry.weeks_in_chart && (
                        <div className="hidden sm:flex items-center gap-1 text-gray-400">
                          <span className="text-xs">{entry.weeks_in_chart} нед</span>
                        </div>
                      )}

                      {/* Play Button (для будущей интеграции) */}
                      <button className="opacity-0 group-hover:opacity-100 p-2 bg-white/10 rounded-lg hover:bg-purple-500 transition-all">
                        <Play className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Обновляется каждый понедельник
              </p>
              <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group">
                <span className="text-sm font-semibold">Полный чарт</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* AI Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Собрано AI-агентом на базе Mistral
          </span>
        </div>
      </div>
    </section>
  );
}
