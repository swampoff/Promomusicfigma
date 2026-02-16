/**
 * NEWS DETAIL PAGE - Детальная страница новости
 * Загружает данные через getNewsById API
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Calendar, Eye, ThumbsUp, Clock, Tag, Share2,
  Loader2, Newspaper, ExternalLink, Bookmark,
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import * as landingApi from '@/utils/api/landing-data';
import type { LandingNews } from '@/utils/api/landing-data';

interface NewsDetailPageProps {
  newsId: string;
  onBack: () => void;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
];

export function NewsDetailPage({ newsId, onBack }: NewsDetailPageProps) {
  const [news, setNews] = useState<LandingNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const result = await landingApi.getNewsById(newsId);
      if (result.success && result.data) {
        setNews(result.data);
      } else {
        setError(result.error || 'Новость не найдена');
      }
      setLoading(false);
    }
    load();
  }, [newsId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#FF577F] animate-spin" />
        <span className="ml-3 text-sm text-slate-400">Загрузка новости...</span>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Новость не найдена</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Запрашиваемая новость не существует или была удалена'}</p>
        <button onClick={onBack} className="text-sm text-[#FF577F] hover:text-[#FF3366] flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Вернуться к новостям
        </button>
      </div>
    );
  }

  const publishDate = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Сегодня';

  const coverImage = news.coverImage || news.artistAvatar || FALLBACK_IMAGES[0];

  // Parse content into paragraphs
  const paragraphs = (news.content || news.excerpt || '')
    .split(/\n\n|\n/)
    .filter(p => p.trim().length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#FF577F] transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Назад к новостям
      </motion.button>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8"
      >
        <ImageWithFallback
          src={coverImage}
          alt={news.title}
          className="w-full h-48 sm:h-64 lg:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Tag overlay */}
        {news.tag && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-[#FF577F]/80 backdrop-blur-sm rounded-full text-xs font-bold text-white">
              {news.tag}
            </span>
          </div>
        )}
      </motion.div>

      {/* Title & Meta */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-4">
          {news.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {publishDate}
          </span>
          {news.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {news.views.toLocaleString()} просмотров
            </span>
          )}
          {news.likes > 0 && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              {news.likes.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            ~{Math.max(1, Math.ceil((news.content || news.excerpt || '').length / 1000))} мин
          </span>
        </div>

        {/* Source info */}
        {news.artistName && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
            {news.artistAvatar && (
              <ImageWithFallback src={news.artistAvatar} alt={news.artistName} className="w-8 h-8 rounded-full object-cover" />
            )}
            <div>
              <div className="text-xs font-bold text-white">{news.artistName}</div>
              <div className="text-[10px] text-slate-600">Promo.music</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 sm:mb-10"
      >
        {/* Excerpt as lead */}
        {news.excerpt && news.content && news.excerpt !== news.content && (
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 font-medium">
            {news.excerpt}
          </p>
        )}

        {/* Body paragraphs */}
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* If only excerpt available */}
        {!news.content && news.excerpt && (
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {news.excerpt}
          </p>
        )}
      </motion.article>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between pt-6 border-t border-white/5"
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              liked
                ? 'bg-[#FF577F]/20 text-[#FF577F] border border-[#FF577F]/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            {(news.likes || 0) + (liked ? 1 : 0)}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSaved(!saved)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              saved
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
            {saved ? 'Сохранено' : 'Сохранить'}
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: news.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:text-white text-xs font-bold transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          Поделиться
        </motion.button>
      </motion.div>

      {/* Back to news */}
      <div className="mt-8 text-center">
        <button onClick={onBack} className="text-sm text-[#FF577F] hover:text-[#FF3366] font-bold flex items-center gap-1 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Все новости
        </button>
      </div>
    </div>
  );
}
