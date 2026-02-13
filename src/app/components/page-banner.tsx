/**
 * PAGE BANNER - Hero banner for all public pages
 * Shows a route-specific banner with background image, title and CTA
 * Note: /about uses its own custom hero banner in AboutRoute
 */

import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import promoAirBanner from "figma:asset/cfe42fd2a3ee537de86c58cb16e8cc5f2cb0ac63.png";
import promoLabBanner from "figma:asset/ceecd0e5a020ec7c970930102c62b3027c2da4bb.png";
import promoGuideBanner from "figma:asset/2f8f4b1dc7217a125294e76c78441a874b7152c8.png";
import concertsBanner from "figma:asset/bb62fb02deb508e9a701caff0b2199cf4e00ad4a.png";
import newsBanner from "figma:asset/b2538c870893a6984e9fa9e7ffb86c045dc60e58.png";
import chartsBanner from "figma:asset/d44ed2af26df81c36f406412441f2c272aa378a0.png";

interface PageBannerProps {
  pathname: string;
  onNavigate: (path: string) => void;
}

const BANNERS: Record<string, {
  image: string;
  title: string;
  accent: string;
  description: string;
  gradient: string;
  cta?: { label: string; path: string };
  fullImage?: boolean;
}> = {
  // ── Content pages ──
  '/concerts': {
    image: concertsBanner,
    title: 'Афиша',
    accent: 'концертов',
    description: 'Лучшие музыкальные события в вашем городе',
    gradient: 'from-orange-500/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/charts': {
    image: chartsBanner,
    title: 'Музыкальные',
    accent: 'чарты',
    description: 'Рейтинги самых популярных треков и артистов',
    gradient: 'from-purple-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/news': {
    image: newsBanner,
    title: 'Музыкальные',
    accent: 'новости',
    description: 'Главные события индустрии и релизы',
    gradient: 'from-blue-600/80 via-black/60 to-transparent',
    fullImage: true,
  },

  // ── Product pages ──
  '/promo-air': {
    image: promoAirBanner,
    title: 'Promo.air',
    accent: '- аудиобрендирование',
    description: 'Единое радио для заведений с легальной музыкой',
    gradient: 'from-cyan-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/promo-lab': {
    image: promoLabBanner,
    title: 'Promo.lab',
    accent: '- тест трека',
    description: 'Эксперты оценят ваш трек перед релизом',
    gradient: 'from-pink-600/80 via-black/60 to-transparent',
    fullImage: true,
  },
  '/promo-guide': {
    image: promoGuideBanner,
    title: 'Promo.guide',
    accent: '- Shazam наоборот',
    description: 'Узнайте, какая музыка играет в вашем любимом месте',
    gradient: 'from-indigo-600/80 via-black/60 to-transparent',
    fullImage: true,
  },

  // ── For artists pages ──
  '/for-artists': {
    image: 'https://images.unsplash.com/photo-1763964062626-063ceec3100a?w=1200&q=80',
    title: 'Для',
    accent: 'артистов',
    description: 'Продвигайте свою музыку в тысячах заведений',
    gradient: 'from-rose-600/80 via-black/60 to-transparent',
    cta: { label: 'Начать продвижение', path: '/login' },
  },
  '/for-djs': {
    image: 'https://images.unsplash.com/photo-1762505190657-c005000faef2?w=1200&q=80',
    title: 'Для',
    accent: 'DJs',
    description: 'Миксы и сеты на лучших площадках',
    gradient: 'from-violet-600/80 via-black/60 to-transparent',
    cta: { label: 'Начать букинг', path: '/login' },
  },
  '/for-producers': {
    image: 'https://images.unsplash.com/photo-1757612550685-d15d473f2e85?w=1200&q=80',
    title: 'Для',
    accent: 'саундпродюсеров',
    description: 'Биты, продакшн и коллаборации',
    gradient: 'from-emerald-600/80 via-black/60 to-transparent',
    cta: { label: 'Создать студию', path: '/login' },
  },
  '/for-engineers': {
    image: 'https://images.unsplash.com/photo-1624252447862-6c904f09286a?w=1200&q=80',
    title: 'Для',
    accent: 'звукоинженеров',
    description: 'Сведение, мастеринг и профессиональный звук',
    gradient: 'from-blue-600/80 via-black/60 to-transparent',
    cta: { label: 'Присоединиться', path: '/login' },
  },

  // ── For partners pages ──
  '/for-business': {
    image: 'https://images.unsplash.com/photo-1713281318623-eb73e86e23c2?w=1200&q=80',
    title: 'Для',
    accent: 'радиостанций',
    description: 'Ротация и эфир с лучшими артистами',
    gradient: 'from-purple-600/80 via-black/60 to-transparent',
  },
  '/for-tv': {
    image: 'https://images.unsplash.com/photo-1671575584088-03eb2811c30f?w=1200&q=80',
    title: 'Для',
    accent: 'телеканалов',
    description: 'Музыкальный контент для эфира и программ',
    gradient: 'from-cyan-600/80 via-black/60 to-transparent',
  },
  '/for-labels': {
    image: 'https://images.unsplash.com/photo-1748781208325-18107f54fa57?w=1200&q=80',
    title: 'Для',
    accent: 'лейблов',
    description: 'Управление ростером и продвижение каталога',
    gradient: 'from-amber-600/80 via-black/60 to-transparent',
  },
  '/for-media': {
    image: 'https://images.unsplash.com/photo-1709377583121-576ad11b3849?w=1200&q=80',
    title: 'Для',
    accent: 'СМИ',
    description: 'Пресс-материалы и эксклюзивный контент',
    gradient: 'from-rose-600/80 via-black/60 to-transparent',
  },
  '/for-bloggers': {
    image: 'https://images.unsplash.com/photo-1758273239210-59fea02475eb?w=1200&q=80',
    title: 'Для',
    accent: 'блогеров',
    description: 'Музыка для контента и коллаборации с артистами',
    gradient: 'from-fuchsia-600/80 via-black/60 to-transparent',
  },

  // ── Company pages ──
  '/contact': {
    image: 'https://images.unsplash.com/photo-1581438395625-215c5c2c6f2e?w=1200&q=80',
    title: 'Свяжитесь',
    accent: 'с нами',
    description: 'Мы всегда на связи для ваших вопросов и предложений',
    gradient: 'from-[#FF577F]/80 via-black/60 to-transparent',
  },
  '/careers': {
    image: 'https://images.unsplash.com/photo-1758873268851-feebbfb1d037?w=1200&q=80',
    title: 'Карьера',
    accent: 'в Promo.music',
    description: 'Присоединяйтесь к команде, которая меняет музыкальную индустрию',
    gradient: 'from-emerald-600/80 via-black/60 to-transparent',
  },
  '/partners': {
    image: 'https://images.unsplash.com/photo-1758599543152-a73184816eba?w=1200&q=80',
    title: 'Партнёрская',
    accent: 'программа',
    description: 'Зарабатывайте вместе с нами, продвигая музыкальную экосистему',
    gradient: 'from-amber-600/80 via-black/60 to-transparent',
  },
  '/support-info': {
    image: 'https://images.unsplash.com/photo-1741770067276-a10e15ff5197?w=1200&q=80',
    title: 'Центр',
    accent: 'поддержки',
    description: 'Ответы на вопросы и помощь по всем продуктам экосистемы',
    gradient: 'from-blue-600/80 via-black/60 to-transparent',
  },
  '/docs': {
    image: 'https://images.unsplash.com/photo-1542395765-761de4ee9696?w=1200&q=80',
    title: 'Документация',
    accent: 'платформы',
    description: 'Руководства, API и техническая документация',
    gradient: 'from-slate-600/80 via-black/60 to-transparent',
  },
  '/privacy': {
    image: 'https://images.unsplash.com/photo-1767972464040-8bfee42d7bed?w=1200&q=80',
    title: 'Политика',
    accent: 'конфиденциальности',
    description: 'Как мы защищаем ваши персональные данные',
    gradient: 'from-indigo-600/80 via-black/60 to-transparent',
  },
  '/terms': {
    image: 'https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?w=1200&q=80',
    title: 'Условия',
    accent: 'использования',
    description: 'Правила использования платформы и сервисов',
    gradient: 'from-slate-500/80 via-black/60 to-transparent',
  },
};

export function PageBanner({ pathname, onNavigate }: PageBannerProps) {
  const banner = BANNERS[pathname];
  if (!banner) return null;

  // Full-image mode: show image at fixed size, no overlays or text
  if (banner.fullImage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-[180px] xs:h-[200px] sm:h-[240px] lg:h-[280px] overflow-hidden"
      >
        <ImageWithFallback
          src={banner.image}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[180px] xs:h-[200px] sm:h-[240px] lg:h-[280px] overflow-hidden"
    >
      {/* Background Image */}
      <ImageWithFallback
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-4 xs:p-5 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-1 sm:mb-2">
            {banner.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF577F] to-[#FF3366]">{banner.accent}</span>
          </h1>
          <p className="text-xs xs:text-sm sm:text-base text-white/70 max-w-lg mb-3 sm:mb-4 line-clamp-2">
            {banner.description}
          </p>
          {banner.cta && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(banner.cta!.path)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF577F]/25 hover:shadow-[#FF577F]/40 transition-shadow"
            >
              {banner.cta.label}
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}