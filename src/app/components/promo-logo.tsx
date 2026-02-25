/**
 * PROMO LOGO - Унифицированный логотип ПРОМО.МУЗЫКА
 * Scale + opacity анимация при загрузке через Motion
 * Пульсирующий glow-эффект при hover
 * Поддержка подзаголовков для кабинетов (ADMIN, DJ STUDIO, FM и т.д.)
 * Размеры xs-3xl + customClasses для полной кастомизации (напр. responsive login)
 */

import { motion } from 'motion/react';
import { useState } from 'react';

// Logo as inline SVG
const promoLogo = '/logo.png';

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
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
              transform: 'scale(1.5)',
              animation: isHovered ? 'promoGlow 2s ease-in-out infinite' : 'none',
            }}
          />
        )}
        <div className={`${s.logo} aspect-square rounded-full overflow-hidden relative z-10 group-hover:scale-105 transition-transform duration-300`}>
          <img src={promoLogo} alt="ПРОМО.МУЗЫКА" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col -space-y-0.5">
          <span
            className={`${s.promo} font-black tracking-tight leading-none bg-gradient-to-r ${promoGradient} bg-clip-text text-transparent`}
            style={promoFontFamily ? { fontFamily: promoFontFamily } : undefined}
          >
            ПРОМО
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
              .музыка
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
    <motion.img
      src="/logo.png"
      alt="PROMO.MUSIC"
      width={size}
      height={size}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 16 }}
      style={{ objectFit: 'contain' }}
    />
  );
}
