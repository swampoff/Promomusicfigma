/**
 * PROMO LOGO - Унифицированный логотип Promo.music
 * Scale + opacity анимация при загрузке через Motion
 * Пульсирующий glow-эффект при hover
 * Поддержка подзаголовков для кабинетов (ADMIN, DJ STUDIO, FM и т.д.)
 * Размеры xs-3xl + customClasses для полной кастомизации (напр. responsive login)
 */

import { motion } from 'motion/react';
import { useState } from 'react';
import promoLogo from 'figma:asset/133ca188b414f1c29705efbbe02f340cc1bfd098.png';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface SizeConfig {
  logo: string;
  promo: string;
  music: string;
  subtitle: string;
  gap: string;
}

interface PromoLogoProps {
  size?: LogoSize;
  showText?: boolean;
  animated?: boolean;
  delay?: number;
  className?: string;
  onClick?: () => void;
  /** Подзаголовок кабинета (ADMIN, DJ STUDIO, FM, VENUE и т.д.) */
  subtitle?: string;
  /** Кастомный цвет подзаголовка (по умолчанию text-white/60) */
  subtitleColor?: string;
  /** Кастомный градиент для PROMO текста */
  promoGradient?: string;
  /** Пульсирующий glow-эффект при hover (по умолчанию true) */
  glowOnHover?: boolean;
  /** Цвет glow-эффекта */
  glowColor?: string;
  /**
   * Полная кастомизация CSS-классов - переопределяет sizeMap.
   * Идеально для responsive-дизайна (unified-login, landing).
   * Пример: { logo: 'h-10 xs:h-14 sm:h-18', promo: 'text-[24px] xs:text-[32px]' }
   */
  customClasses?: Partial<SizeConfig>;
  /** Кастомный шрифт для текста PROMO */
  promoFontFamily?: string;
  /** Кастомный шрифт для подзаголовка */
  subtitleFontFamily?: string;
  /** Нативный tooltip при наведении */
  title?: string;
}

const sizeMap: Record<LogoSize, SizeConfig> = {
  xs:   { logo: 'w-7 h-7',   promo: 'text-[18px]', music: 'text-[9px]',  subtitle: 'text-[9px]',  gap: 'gap-1.5' },
  sm:   { logo: 'w-8 h-8',   promo: 'text-[16px]', music: 'text-[10px]', subtitle: 'text-[10px]', gap: 'gap-2' },
  md:   { logo: 'w-10 h-10', promo: 'text-[22px]', music: 'text-[12px]', subtitle: 'text-[9px]',  gap: 'gap-3' },
  lg:   { logo: 'w-14 h-14', promo: 'text-[28px]', music: 'text-[14px]', subtitle: 'text-[12px]', gap: 'gap-3' },
  xl:   { logo: 'w-20 h-20', promo: 'text-[40px]', music: 'text-[18px]', subtitle: 'text-[14px]', gap: 'gap-4' },
  '2xl': { logo: 'w-24 h-24', promo: 'text-[52px]', music: 'text-[22px]', subtitle: 'text-[18px]', gap: 'gap-4' },
  '3xl': { logo: 'w-32 h-32', promo: 'text-[72px]', music: 'text-[28px]', subtitle: 'text-[22px]', gap: 'gap-5' },
};

const DEFAULT_PROMO_GRADIENT = 'from-[#FF577F] via-[#FF6B8F] to-[#FF577F]';
const DEFAULT_GLOW_COLOR = '#FF577F';

export function PromoLogo({
  size = 'md',
  showText = true,
  animated = true,
  delay = 0,
  className = '',
  onClick,
  subtitle,
  subtitleColor = 'text-white/60',
  promoGradient = DEFAULT_PROMO_GRADIENT,
  glowOnHover = true,
  glowColor = DEFAULT_GLOW_COLOR,
  customClasses,
  promoFontFamily,
  subtitleFontFamily,
  title,
}: PromoLogoProps) {
  const base = sizeMap[size];
  // Merge custom overrides on top of base size
  const s: SizeConfig = customClasses
    ? {
        logo: customClasses.logo ?? base.logo,
        promo: customClasses.promo ?? base.promo,
        music: customClasses.music ?? base.music,
        subtitle: customClasses.subtitle ?? base.subtitle,
        gap: customClasses.gap ?? base.gap,
      }
    : base;

  const [isHovered, setIsHovered] = useState(false);

  const Wrapper = onClick ? 'button' : 'div';

  const logoContent = (
    <Wrapper
      type={onClick ? 'button' : undefined}
      className={`group flex items-center ${s.gap} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
    >
      {/* Logo icon with glow */}
      <div className="relative flex-shrink-0">
        {/* Glow layer */}
        {glowOnHover && (
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
              transform: 'scale(1.5)',
              animation: isHovered ? 'promoGlow 2s ease-in-out infinite' : 'none',
            }}
          />
        )}
        <div className={`${s.logo} rounded-lg overflow-hidden relative z-10 group-hover:scale-105 transition-transform duration-300`}>
          <img src={promoLogo} alt="Promo.music" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col -space-y-0.5">
          <span
            className={`${s.promo} font-black tracking-tight leading-none bg-gradient-to-r ${promoGradient} bg-clip-text text-transparent`}
            style={promoFontFamily ? { fontFamily: promoFontFamily } : undefined}
          >
            PROMO
          </span>
          {subtitle ? (
            <span
              className={`${s.subtitle} font-bold tracking-[0.2em] uppercase ${subtitleColor}`}
              style={subtitleFontFamily ? { fontFamily: subtitleFontFamily } : undefined}
            >
              {subtitle}
            </span>
          ) : (
            <span
              className={`${s.music} font-bold tracking-widest leading-none bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase`}
              style={subtitleFontFamily ? { fontFamily: subtitleFontFamily } : undefined}
            >
              .music
            </span>
          )}
        </div>
      )}

      {/* Inject glow keyframes */}
      <style>{`
        @keyframes promoGlow {
          0%, 100% { opacity: 0.4; transform: scale(1.5); }
          50% { opacity: 0.8; transform: scale(1.8); }
        }
      `}</style>
    </Wrapper>
  );

  if (!animated) return logoContent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.6,
        type: 'spring',
        stiffness: 200,
        damping: 18,
      }}
    >
      {logoContent}
    </motion.div>
  );
}

/**
 * Прямой доступ к PNG-ассету логотипа (для компонентов с кастомной разметкой)
 */
export { promoLogo };

/**
 * Inline SVG favicon (для OG-превью и т.п.)
 */
export function PromoFaviconSvg({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 16 }}
    >
      <defs>
        <linearGradient id="fav-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="50%" stopColor="#0a0a14" />
          <stop offset="100%" stopColor="#0a1628" />
        </linearGradient>
        <linearGradient id="fav-pink" x1="12" y1="10" x2="40" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF577F" />
          <stop offset="50%" stopColor="#FF6B8F" />
          <stop offset="100%" stopColor="#FF577F" />
        </linearGradient>
        <linearGradient id="fav-cyan" x1="28" y1="40" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="fav-glow" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF577F" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#fav-bg)" />
      <rect width="64" height="64" rx="14" fill="url(#fav-glow)" opacity="0.5" />
      <rect x="1" y="1" width="62" height="62" rx="13" stroke="url(#fav-pink)" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
      <path d="M18 48V16h12c7.2 0 12 4.2 12 10.5S37.2 37 30 37h-4.5v11H18z" fill="url(#fav-pink)" />
      <path d="M25.5 22v9H30c3.3 0 5.5-1.8 5.5-4.5S33.3 22 30 22h-4.5z" fill="url(#fav-bg)" />
      <circle cx="40" cy="48" r="2.5" fill="url(#fav-cyan)" />
      <path d="M45 42v6h1.8v-4.2c0-.9.6-1.5 1.4-1.5s1.2.5 1.2 1.4V48h1.8v-4.2c0-.9.6-1.5 1.4-1.5s1.2.5 1.2 1.4V48H56v-4.8c0-1.8-1-3-2.6-3-.9 0-1.7.4-2.2 1.1-.4-.7-1.1-1.1-2-1.1-.8 0-1.5.3-2 .9V42H45z" fill="url(#fav-cyan)" />
    </motion.svg>
  );
}