/**
 * HERO BANNER CAROUSEL — Полноширинный баннер в стиле Figma
 * Фоновое фото с gradient overlay, крупный текст слева, CTA-кнопки
 * Карусель вращается автоматически, секции ниже не затрагиваются
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/app/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronRight, ChevronLeft, TestTube, Headphones, Newspaper, Disc3, Radio, Megaphone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

import heroImgSandra from 'figma:asset/35f389a17164c721f8c2f14a2208404902db7e32.png';
import heroImgLina from 'figma:asset/b588af1e64b5cf5211ec15bac00b66a0ac0e5986.png';
import heroImgDan from 'figma:asset/30c1c79a63080cd59ff8ce73c2d420b2a94316e6.png';
import heroImgMark from 'figma:asset/31a289e2e77360c47a1716aa8258585bf84fdc26.png';
import heroImgStella from 'figma:asset/110f38099480aa93fa51ce4d7cb3ddcf76695405.png';
import heroImgMaxam from 'figma:asset/4a23a592ae83211e9897ddd52bb057ddcdd2b8d2.png';

export interface HeroBanner {
  id: string;
  image: string;
  /** Фокус изображения для object-position */
  imagePosition?: string;
  /** Отдельная позиция для мобильных (<md) — для close-up фото */
  mobileImagePosition?: string;
  /** Масштаб изображения на мобильных (0-1, default 1) — для уменьшения крупных лиц */
  mobileImageScale?: number;
  /** Масштаб изображения на десктопе (default 1) — для увеличения мелких фото до уровня close-up */
  imageScale?: number;
  /** Пиксельный сдвиг изображения по X (положительный = вправо) */
  imageOffsetX?: number;
  /** Пиксельный сдвиг изображения по Y (положительный = вниз) */
  imageOffsetY?: number;
  /** Пиксельный сдвиг мобильного изображения по X */
  mobileImageOffsetX?: number;
  /** Пиксельный сдвиг мобильного изображения по Y */
  mobileImageOffsetY?: number;
  /** Цвет фона слайда (default '#0a0a14') — для фото с белым/цветным фоном */
  bgColor?: string;
  /** object-fit для изображения: 'cover' (default) или 'contain' (оказать целиком без обрезки) */
  objectFit?: 'cover' | 'contain';
  /**
   * Режим отображения изображения:
   * - 'cover' (default): object-cover, заполняет весь контейнер
   * - 'portrait': для вертикальных close-up фото — blur-фон + полное изображение по центру
   */
  imageMode?: 'cover' | 'portrait';
  badge: { icon: React.ElementType; label: string };
  title: string;
  titleAccent: string;
  titleAfter?: string;
  description: string;
  primaryButton: { label: string; action: () => void };
  secondaryButton?: { label: string; action: () => void };
  /** Направление градиента overlay */
  gradientDirection?: 'left' | 'right';
  accentColor?: string;
  /** Массив цветов для неоновых летающих огоньков (если задан — показываются) */
  neonParticles?: string[];
}

interface HeroBannerCarouselProps {
  banners: HeroBanner[];
  className?: string;
}

export function HeroBannerCarousel({ banners, className }: HeroBannerCarouselProps) {
  const plugin = useRef(Autoplay({ delay: 6000, stopOnInteraction: true }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    api.on('select', onSelect);
    onSelect();
    return () => { api.off('select', onSelect); };
  }, [api]);

  const goTo = useCallback((idx: number) => { api?.scrollTo(idx); }, [api]);

  return (
    <div className={`relative w-full ${className || ''}`}>
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{ loop: true }}
        setApi={setApi}
      >
        <CarouselContent>
          {banners.map((banner, idx) => (
            <CarouselItem key={banner.id}>
              <BannerSlide banner={banner} isActive={activeIndex === idx} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 xs:bottom-5 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 xs:gap-2.5">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => goTo(idx)}
              className="group relative p-1"
              aria-label={`Баннер ${idx + 1}`}
            >
              <div
                className="rounded-full transition-all duration-500"
                style={{
                  width: activeIndex === idx ? 28 : 8,
                  height: 8,
                  background: activeIndex === idx
                    ? 'linear-gradient(90deg, #FF577F, #FF3366)'
                    : 'rgba(255,255,255,0.25)',
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Arrow nav — desktop only */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => api?.scrollPrev()}
            className="hidden md:flex absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 items-center justify-center text-white/70 hover:text-white hover:bg-black/50 hover:border-white/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            className="hidden md:flex absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 items-center justify-center text-white/70 hover:text-white hover:bg-black/50 hover:border-white/20 transition-all"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </>
      )}
    </div>
  );
}

/* ── Slide ──────────────────────────────────────────────── */

/* ── Neon floating particles ─────────────────────────── */

interface NeonParticle {
  id: number;
  x: number;       // start % from left
  y: number;       // start % from top
  size: number;    // px
  color: string;
  delay: number;   // s
  duration: number; // s
  driftX: number;  // px horizontal drift
}

function NeonParticles({ colors, isActive }: { colors: string[]; isActive: boolean }) {
  const particles = useMemo<NeonParticle[]>(() => {
    const seed = 42;
    const pseudoRandom = (i: number) => {
      const x = Math.sin(seed + i * 127.1) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: pseudoRandom(i * 3) * 100,
      y: pseudoRandom(i * 3 + 1) * 70 + 5,
      size: pseudoRandom(i * 3 + 2) * 6 + 2,
      color: colors[i % colors.length],
      delay: pseudoRandom(i * 7) * 4,
      duration: pseudoRandom(i * 11) * 6 + 5,
      driftX: (pseudoRandom(i * 13) - 0.5) * 120,
    }));
  }, [colors]);

  return (
    <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={isActive ? {
            opacity: [0, 0.8, 1, 0.6, 0],
            y: [0, -40, -90, -150, -220],
            x: [0, p.driftX * 0.3, p.driftX * 0.6, p.driftX * 0.8, p.driftX],
          } : { opacity: 0 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.color} 0%, ${p.color}88 40%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}60, 0 0 ${p.size * 6}px ${p.size * 2}px ${p.color}25`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}

function BannerSlide({ banner, isActive }: { banner: HeroBanner; isActive: boolean }) {
  const accent = banner.accentColor || '#FF577F';
  const imgPos = banner.imagePosition || 'center 20%';
  const mobileImgPos = banner.mobileImagePosition || imgPos;
  const mobileScale = banner.mobileImageScale ?? 1;
  const hasMobileOverride = !!(banner.mobileImagePosition || banner.mobileImageScale);
  const isPortrait = banner.imageMode === 'portrait';
  const imageScale = banner.imageScale ?? 1;
  const bgColor = banner.bgColor || '#0a0a14';
  const isLightBg = (() => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r + g + b) / 3 > 80;
  })();
  const offsetX = banner.imageOffsetX ?? 0;
  const offsetY = banner.imageOffsetY ?? 0;
  const mobileOffsetX = banner.mobileImageOffsetX ?? offsetX;
  const mobileOffsetY = banner.mobileImageOffsetY ?? offsetY;
  const fitMode = banner.objectFit || 'cover';

  /* Градиент: для светлого фона — full-height, сверху вниз от прозрачного к тёмному;
     для тёмного — стандартный 55% снизу вверх */
  const gradientStyle: React.CSSProperties = isLightBg
    ? {
        height: '100%',
        background: [
          'linear-gradient(to bottom,',
          'transparent 0%,',
          'transparent 42%,',
          'rgba(10,10,20,0.08) 50%,',
          'rgba(10,10,20,0.22) 56%,',
          'rgba(10,10,20,0.42) 62%,',
          'rgba(10,10,20,0.62) 67%,',
          'rgba(10,10,20,0.8) 72%,',
          'rgba(10,10,20,0.92) 78%,',
          'rgba(10,10,20,0.98) 84%,',
          '#0a0a14 90%,',
          '#0a0a14 100%)',
        ].join(' '),
      }
    : {
        height: '55%',
        background: 'linear-gradient(to top, #0a0a14 0%, #0a0a14 20%, rgba(10,10,20,0.7) 50%, rgba(10,10,20,0) 100%)',
      };

  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* ── Photo section — full bleed, covers entire banner ── */}
      <div className="absolute inset-0 overflow-hidden">
        {isPortrait ? (
          <>
            {/* Portrait mode: blur-фон + полное изображение по центру */}
            {/* Layer 1: Blurred background — заполняет весь контейнер атмосферой */}
            <img
              src={banner.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out"
              style={{
                objectPosition: imgPos,
                transform: isActive ? 'scale(1.1)' : 'scale(1.05)',
                filter: 'blur(40px) saturate(1.4) brightness(0.5)',
              }}
            />
            {/* Layer 2: Sharp portrait — показывает полное лицо */}
            <img
              src={banner.image}
              alt=""
              className="absolute inset-0 w-full h-full transition-transform duration-[8000ms] ease-out"
              style={{
                objectFit: 'contain',
                objectPosition: 'center top',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
              }}
            />
          </>
        ) : (
          <>
            {/* Cover mode: object-cover, 106% для устранения субпиксельных щелей при scale */}
            {/* Desktop image (md+) */}
            <img
              src={banner.image}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute transition-transform duration-[8000ms] ease-out ${hasMobileOverride ? 'hidden md:block' : ''}`}
              style={{
                inset: '-3%',
                width: '106%',
                height: '106%',
                objectFit: fitMode,
                objectPosition: imgPos,
                transform: `translate(${offsetX}px, ${offsetY}px) ${isActive ? `scale(${imageScale * 1.05})` : `scale(${imageScale})`}`,
                transformOrigin: 'center',
              }}
            />
            {/* Mobile image (<md) — отдельная позиция и масштаб */}
            {hasMobileOverride && (
              <img
                src={banner.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute transition-transform duration-[8000ms] ease-out block md:hidden"
                style={{
                  inset: '-3%',
                  width: '106%',
                  height: '106%',
                  objectFit: fitMode,
                  objectPosition: mobileImgPos,
                  transform: `translate(${mobileOffsetX}px, ${mobileOffsetY}px) ${isActive ? `scale(${mobileScale * 1.05})` : `scale(${mobileScale})`}`,
                  transformOrigin: 'center',
                }}
              />
            )}
          </>
        )}
      </div>

      {/* ── Seamless gradient: photo → text ── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-[1]"
        style={gradientStyle}
      />

      {/* Subtle accent glow at bottom */}
      <div
        className="absolute inset-x-0 bottom-[15%] h-32 z-[1] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${accent}18 0%, transparent 70%)` }}
      />

      {/* ── Text section — padding-top вместо фиксированной высоты фото ── */}
      <div className="relative z-10 px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pb-5 xs:pb-6 sm:pb-8 md:pb-10 pt-[194px] xs:pt-[218px] sm:pt-[262px] md:pt-[380px] lg:pt-[388px] xl:pt-[428px]">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 xs:py-1.5 sm:px-4 sm:py-2 mb-2.5 xs:mb-3 sm:mb-4 rounded-full backdrop-blur-sm border text-[10px] xs:text-xs sm:text-sm w-fit"
          style={{
            background: `${accent}14`,
            borderColor: `${accent}40`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          <banner.badge.icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4" style={{ color: accent }} />
          <span className="font-semibold text-white/90">{banner.badge.label}</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 leading-[1.1] max-w-3xl"
        >
          <span className="text-white">{banner.title}</span>
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${accent}, ${accent}CC, ${accent})` }}
          >
            {banner.titleAccent}
          </span>
          {banner.titleAfter && (
            <span className="text-white"> {banner.titleAfter}</span>
          )}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-400 leading-relaxed mb-3 xs:mb-4 sm:mb-5 md:mb-6 max-w-xl lg:max-w-2xl"
        >
          {banner.description}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="flex items-center gap-2.5 xs:gap-3 sm:gap-4"
        >
          <Button
            size="lg"
            onClick={banner.primaryButton.action}
            className="text-white font-bold rounded-full w-fit shadow-lg px-4 xs:px-5 sm:px-8 md:px-10 py-2.5 xs:py-3 sm:py-4 md:py-6 text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg border"
            style={{
              backgroundImage: `linear-gradient(to right, ${accent}, ${accent}DD)`,
              borderColor: `${accent}80`,
              boxShadow: `0 8px 32px ${accent}30`,
            }}
          >
            {banner.primaryButton.label}
            <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ml-1 xs:ml-1.5 sm:ml-2" />
          </Button>

          {banner.secondaryButton && (
            <Button
              size="lg"
              variant="outline"
              onClick={banner.secondaryButton.action}
              className="hidden sm:flex bg-white/5 hover:bg-white/10 text-white font-bold px-6 sm:px-8 py-4 sm:py-6 rounded-full text-sm sm:text-base lg:text-lg border border-white/15 hover:border-white/30"
            >
              {banner.secondaryButton.label}
            </Button>
          )}
        </motion.div>
      </div>

      {/* Subtle ambient glow — bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}0A 0%, transparent 70%)` }}
      />

      {/* Neon particles */}
      {banner.neonParticles && (
        <NeonParticles colors={banner.neonParticles} isActive={isActive} />
      )}
    </div>
  );
}

/* ── Default banners factory ───────────────────────────── */

export function createDefaultBanners(actions: {
  openTrackModal: (service: string) => void;
  navigateToArtists: () => void;
  navigateToCharts: () => void;
}): HeroBanner[] {
  return [
    {
      id: 'hero-sandra',
      image: heroImgSandra,
      imagePosition: '38% 0%',
      imageScale: 1.05,
      imageOffsetY: -30,
      neonParticles: ['#ff6a00', '#ff8c00', '#ffa500', '#ff4500', '#ff7700', '#ffb347'],
      badge: { icon: Headphones, label: 'Сандра.Музыкант' },
      title: 'Твоя музыка',
      titleAccent: 'в тысячах заведений',
      description: 'Загружай треки и попадай в ротацию на радио и в заведения через Promo.air - аудитория уже ждёт.',
      primaryButton: {
        label: 'Начать продвижение',
        action: () => actions.openTrackModal('promo'),
      },
      secondaryButton: {
        label: 'Подробнее',
        action: actions.navigateToArtists,
      },
      gradientDirection: 'left',
      accentColor: '#FF577F',
    },
    {
      id: 'hero-lina',
      image: heroImgLina,
      imagePosition: '40% 0%',
      imageScale: 0.78,
      imageOffsetX: 55,
      imageOffsetY: -30,
      mobileImagePosition: '40% 0%',
      mobileImageScale: 0.78,
      mobileImageOffsetX: 45,
      mobileImageOffsetY: -30,
      bgColor: '#08081a',
      neonParticles: ['#FF577F', '#ff3366', '#ff6b9d', '#f43f5e', '#e91e63', '#ff80ab'],
      badge: { icon: Newspaper, label: 'Лиана.Пресса' },
      title: 'Попади в',
      titleAccent: 'топовые СМИ',
      description: 'PR-продвижение для музыкантов - публикации в медиа, интервью, обзоры и рецензии. Promo.music выведет тебя на новый уровень узнаваемости.',
      primaryButton: {
        label: 'Заказать PR',
        action: () => actions.openTrackModal('press'),
      },
      secondaryButton: {
        label: 'Узнать больше',
        action: actions.navigateToArtists,
      },
      gradientDirection: 'left',
      accentColor: '#f43f5e',
    },
    {
      id: 'hero-dan',
      image: heroImgDan,
      imagePosition: '40% 0%',
      imageScale: 0.72,
      imageOffsetX: 90,
      imageOffsetY: -30,
      mobileImagePosition: '35% 0%',
      mobileImageScale: 0.78,
      mobileImageOffsetX: 50,
      mobileImageOffsetY: -30,
      bgColor: '#08081a',
      neonParticles: ['#00d4ff', '#ff00ff', '#8b5cf6', '#3b82f6', '#ff3399', '#06d6a0'],
      badge: { icon: Disc3, label: 'Дэн.DJ' },
      title: 'Твои сеты',
      titleAccent: 'на лучших площадках',
      description: 'Создавай миксы, попадай в ротацию клубов и фестивалей через Promo.music - букинг, аналитика и продвижение в одном кабинете.',
      primaryButton: {
        label: 'Начать букинг',
        action: () => actions.openTrackModal('dj'),
      },
      secondaryButton: {
        label: 'Узнать больше',
        action: actions.navigateToArtists,
      },
      gradientDirection: 'left',
      accentColor: '#3b82f6',
    },
    {
      id: 'hero-ai',
      image: heroImgMaxam,
      imagePosition: '50% 15%',
      imageScale: 1.15,
      imageOffsetX: 0,
      imageOffsetY: 0,
      mobileImagePosition: '50% 15%',
      mobileImageScale: 1.15,
      mobileImageOffsetX: 0,
      mobileImageOffsetY: 0,
      bgColor: '#08081a',
      neonParticles: ['#06b6d4', '#22d3ee', '#67e8f9', '#0891b2', '#0e7490', '#a5f3fc'],
      badge: { icon: TestTube, label: 'Макс.Продюсер' },
      title: 'Узнай потенциал',
      titleAccent: 'своего трека',
      description: 'Получи профессиональную оценку от AI и экспертов индустрии перед релизом - детальный анализ по 10+ критериям с рекомендациями.',
      primaryButton: {
        label: 'Протестировать трек',
        action: () => actions.openTrackModal('test'),
      },
      gradientDirection: 'left',
      accentColor: '#06b6d4',
    },
    {
      id: 'hero-mark',
      image: heroImgMark,
      imagePosition: '45% 20%',
      imageScale: 0.92,
      imageOffsetX: 80,
      imageOffsetY: 10,
      mobileImagePosition: '40% 20%',
      mobileImageScale: 0.98,
      mobileImageOffsetX: 45,
      mobileImageOffsetY: 8,
      bgColor: '#08081a',
      neonParticles: ['#FF577F', '#ff3366', '#ff6b9d', '#c2185b', '#e91e63', '#ff80ab'],
      badge: { icon: Megaphone, label: 'Марк.Маркетинг' },
      title: 'Продвигай музыку',
      titleAccent: 'на максимум',
      description: 'Таргетированная реклама, SMM, контент-стратегия и аналитика - комплексный маркетинг для артистов через Promo.music.',
      primaryButton: {
        label: 'Запустить промо',
        action: () => actions.openTrackModal('marketing'),
      },
      secondaryButton: {
        label: 'Узнать больше',
        action: actions.navigateToArtists,
      },
      gradientDirection: 'left',
      accentColor: '#FF577F',
    },
    {
      id: 'hero-stella',
      image: heroImgStella,
      imagePosition: '50% 20%',
      imageScale: 0.88,
      imageOffsetX: 70,
      imageOffsetY: 5,
      mobileImagePosition: '50% 20%',
      mobileImageScale: 0.94,
      mobileImageOffsetX: 40,
      mobileImageOffsetY: 3,
      bgColor: '#08081a',
      neonParticles: ['#a855f7', '#8b5cf6', '#c084fc', '#7c3aed', '#d946ef', '#a78bfa'],
      badge: { icon: Radio, label: 'Стелла.Радио' },
      title: 'Попади в',
      titleAccent: 'ТОП радиостанций',
      description: 'Прямая интеграция с радиостанциями - отправляй треки напрямую в эфир и отслеживай статистику в реальном времени.',
      primaryButton: {
        label: 'Загрузить трек',
        action: () => actions.openTrackModal('novelty'),
      },
      secondaryButton: {
        label: 'Смотреть чарт',
        action: actions.navigateToCharts,
      },
      gradientDirection: 'left',
      accentColor: '#a855f7',
    },
  ];
}