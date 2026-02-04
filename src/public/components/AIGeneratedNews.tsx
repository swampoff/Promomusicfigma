/**
 * AI GENERATED NEWS
 * Виджет новостей, созданных AI-агентом
 */

import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import * as kv from '../../../supabase/functions/server/kv_store.tsx';

// =====================================================
// TYPES
// =====================================================

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  created_at: string;
  published_at?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function AIGeneratedNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedNews();
  }, []);

  const fetchPublishedNews = async () => {
    try {
      setLoading(true);
      
      // В продакшене это будет API endpoint
      // Пока используем demo данные
      const demoArticles: NewsArticle[] = [
        {
          id: 'demo-1',
          title: 'Новый тренд в российской музыке: AI-ассистированное создание треков',
          content: `
            <h2>🎵 Революция в музыкальном производстве</h2>
            <p>Российские артисты активно начали использовать искусственный интеллект для создания музыки. По данным исследования, более 40% молодых продюсеров уже экспериментируют с AI-инструментами.</p>
            
            <h3>Что изменилось?</h3>
            <ul>
              <li>AI помогает генерировать мелодии и биты</li>
              <li>Автоматическая обработка вокала стала доступнее</li>
              <li>Сокращение времени на пост-продакшн</li>
            </ul>
            
            <p>Эксперты прогнозируют, что к 2025 году AI станет неотъемлемой частью процесса создания музыки, но живое исполнение и творческий подход останутся ключевыми.</p>
          `,
          status: 'published',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          published_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'demo-2',
          title: 'Летний фестивальный сезон 2026: что нужно знать артистам',
          content: `
            <h2>🎪 Подготовка к фестивальному сезону</h2>
            <p>Организаторы крупнейших российских фестивалей объявили о старте приема заявок на летний сезон 2026. Для начинающих артистов это уникальная возможность заявить о себе.</p>
            
            <h3>Ключевые фестивали</h3>
            <ul>
              <li>WILD MINT - заявки до 15 марта</li>
              <li>Park Live - заявки до 1 апреля</li>
              <li>Alfa Future People - заявки до 20 марта</li>
            </ul>
            
            <h3>Советы для артистов</h3>
            <p>Чтобы увеличить шансы на попадание в лайн-ап:</p>
            <ul>
              <li>Подготовьте качественный EPK (Electronic Press Kit)</li>
              <li>Запишите видео живого выступления</li>
              <li>Покажите активность в социальных сетях</li>
            </ul>
          `,
          status: 'published',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          published_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'demo-3',
          title: 'Стриминг vs живые выступления: где музыканты зарабатывают больше?',
          content: `
            <h2>💰 Экономика музыкальной карьеры</h2>
            <p>Новое исследование показывает интересную статистику: средний артист зарабатывает 70% дохода от живых выступлений и только 30% от стриминга.</p>
            
            <h3>Почему так происходит?</h3>
            <p>Стриминговые платформы платят в среднем $0.003-0.005 за прослушивание. Чтобы заработать $1000, нужно около 250,000 прослушиваний. В то же время один концерт может принести те же деньги.</p>
            
            <h3>Оптимальная стратегия</h3>
            <ul>
              <li>Используйте стриминг для продвижения</li>
              <li>Монетизируйте через живые выступления</li>
              <li>Не забывайте про мерч и краудфандинг</li>
            </ul>
          `,
          status: 'published',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          published_at: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      setArticles(demoArticles);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExcerpt = (html: string, maxLength: number = 200): string => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <>
      <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Новости индустрии
              </h2>
            </div>
            <p className="text-gray-400">
              Актуальные материалы о музыкальном бизнесе
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-500/20"
              >
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.created_at)}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {getExcerpt(article.content)}
                </p>

                {/* Read More */}
                <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-semibold">Читать далее</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>

          {/* AI Badge */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Контент создан AI-агентом на базе Claude и проверен редакцией</span>
          </div>
        </div>
      </section>

      {/* Article Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-gray-900 border border-white/20 rounded-2xl max-w-4xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedArticle.created_at)}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {selectedArticle.title}
                  </h1>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex-shrink-0 p-2 hover:bg-white/10 rounded-lg transition-all ml-4"
                >
                  <span className="text-gray-400 text-2xl">&times;</span>
                </button>
              </div>

              {/* Content */}
              <div
                className="prose prose-invert max-w-none prose-headings:text-white prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-6 prose-p:text-gray-300 prose-p:leading-relaxed prose-ul:text-gray-300 prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />

              {/* Footer */}
              {selectedArticle.source_url && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <a
                    href={selectedArticle.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Источник оригинальной новости →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
