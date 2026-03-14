import { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Clock, ArrowRight, Music, Users, TrendingUp, Calendar, Award, Mic2, Star, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useLandingNews } from '@/hooks/useLandingData';
import type { LandingNews } from '@/hooks/useLandingData';
import { useNavigate } from 'react-router';

type NewsCategory = 'all' | 'releases' | 'artists' | 'industry' | 'events' | 'charts' | 'interviews' | 'reviews';

const categories: { value: NewsCategory; label: string; icon: any }[] = [
  { value: 'all', label: 'Все', icon: Newspaper },
  { value: 'releases', label: 'Релизы', icon: Music },
  { value: 'artists', label: 'Артисты', icon: Users },
  { value: 'industry', label: 'Индустрия', icon: TrendingUp },
  { value: 'events', label: 'События', icon: Calendar },
  { value: 'charts', label: 'Чарты', icon: Award },
  { value: 'interviews', label: 'Интервью', icon: Mic2 },
  { value: 'reviews', label: 'Рецензии', icon: Star },
];

const catMap: Record<string, NewsCategory> = {
  'releases': 'releases', 'artists': 'artists', 'industry': 'industry',
  'events': 'events', 'charts': 'charts', 'interviews': 'interviews',
  'reviews': 'reviews', 'news': 'industry',
  'Релиз': 'releases', 'Артист': 'artists', 'Индустрия': 'industry',
  'Концерт': 'events', 'Фестиваль': 'events', 'Чарт': 'charts',
  'Интервью': 'interviews', 'Рецензия': 'reviews',
};

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80',
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Вчера';
  if (days < 7) return `${days} дн назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function NewsSection() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const { data: serverNews, isLoading } = useLandingNews(30);
  const navigate = useNavigate();

  const articles = (serverNews || []).map((n: LandingNews, i: number) => ({
    id: n.id || `n-${i}`,
    title: n.title || '',
    excerpt: n.excerpt || n.title || '',
    content: n.content || '',
    category: catMap[n.tag || ''] || catMap[n.category || ''] || 'industry',
    categoryLabel: categories.find(c => c.value === (catMap[n.tag || ''] || catMap[n.category || ''] || 'industry'))?.label || 'Новости',
    coverImage: n.coverImage || (n as any).imageUrl || '',
    date: n.publishedAt ? timeAgo(n.publishedAt) : 'Сегодня',
    authorName: (n as any).authorName || n.artistName || n.source || 'Редакция',
    authorAvatar: (n as any).authorAvatar || n.artistAvatar || '',
    source: n.source || '',
    sourceUrl: (n as any).sourceUrl || '',
    readTime: Math.max(1, Math.ceil((n.content || n.excerpt || '').length / 800)),
    fallbackImage: COVER_IMAGES[i % COVER_IMAGES.length],
  }));

  const filtered = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const featured = filtered.slice(0, 2);
  const rest = filtered.slice(2);

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-1 sm:mb-2">
          Новости музыки
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Обзоры, аналитика и мнения от наших авторов
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const count = cat.value === 'all' ? articles.length : articles.filter(a => a.category === cat.value).length;
          if (cat.value !== 'all' && count === 0) return null;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-full transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-[#FF577F] border-[#FF577F] text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
              {count > 0 && <span className="text-[9px] opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Загрузка...
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          Нет новостей в этой категории
        </div>
      )}

      {/* Featured — top 2 large cards */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {featured.map((article) => (
            <motion.article
              key={article.id}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/news/${article.id}`)}
              className="group cursor-pointer bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <ImageWithFallback
                  src={article.coverImage || article.fallbackImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2 py-0.5 bg-[#FF577F]/80 backdrop-blur-sm rounded text-[10px] font-semibold mb-2">
                    {article.categoryLabel}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold leading-tight line-clamp-2 group-hover:text-[#FF577F] transition-colors">
                    {article.title}
                  </h3>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {article.authorAvatar ? (
                      <img src={article.authorAvatar} alt={article.authorName} className="w-7 h-7 rounded-full border border-white/10 object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-600 flex items-center justify-center text-[10px] font-bold">
                        {article.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold">{article.authorName}</p>
                      {article.source && article.source !== article.authorName && (
                        <p className="text-[10px] text-slate-500">{article.source}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span>{article.readTime} мин</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Rest — compact list */}
      {rest.length > 0 && (
        <div className="space-y-2 sm:space-y-3">
          {rest.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ x: 4 }}
              onClick={() => navigate(`/news/${article.id}`)}
              className="group cursor-pointer flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white/[0.02] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] rounded-xl transition-all"
            >
              {/* Author avatar */}
              <div className="flex-shrink-0">
                {article.authorAvatar ? (
                  <img src={article.authorAvatar} alt={article.authorName} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 object-cover" />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#FF577F] to-purple-600 flex items-center justify-center text-sm font-bold">
                    {article.authorName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">{article.authorName}</span>
                  <span className="text-[10px] text-slate-500">{article.date}</span>
                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-slate-400 font-medium">
                    {article.categoryLabel}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-1 group-hover:text-[#FF577F] transition-colors mb-0.5">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {article.excerpt}
                </p>
                {article.source && article.source !== article.authorName && (
                  <p className="text-[10px] text-slate-600 mt-1">
                    Источник: {article.source}
                  </p>
                )}
              </div>

              {/* Cover thumbnail */}
              {(article.coverImage || article.fallbackImage) && (
                <div className="hidden sm:block flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={article.coverImage || article.fallbackImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
            </motion.article>
          ))}
        </div>
      )}

      {/* Load more */}
      {filtered.length > 10 && (
        <div className="flex justify-center pt-2">
          <Button className="bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-full text-xs border border-white/10">
            Показать ещё
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
