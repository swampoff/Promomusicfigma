/**
 * GENRE ICON — 3D иконки жанров из Figma "3D Music Icon Set"
 * Каждый жанр маппится на уникальный 3D ассет
 */

// ── Genre icon URLs (Unsplash CDN - lightweight) ──────
const iconPop = 'https://images.unsplash.com/photo-1618436210414-9722c3e87d8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconRock = 'https://images.unsplash.com/photo-1650892243500-9ffaa0744fa5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconHipHop = 'https://images.unsplash.com/photo-1724458113863-444dea4ef0ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconElectronic = 'https://images.unsplash.com/photo-1556607356-d6a622ea735f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconRnB = 'https://images.unsplash.com/photo-1596826793477-814a59819a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconIndie = 'https://images.unsplash.com/photo-1596646841290-b0fae03be07d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconJazz = 'https://images.unsplash.com/photo-1651178836409-4460d0e47bea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconClassical = 'https://images.unsplash.com/photo-1615779979540-149702d79d52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconCountry = 'https://images.unsplash.com/photo-1716003665130-854e3ae864de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconReggae = 'https://images.unsplash.com/photo-1565103001988-2de7a0a7c7f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconAfrobeat = 'https://images.unsplash.com/photo-1625994761169-bf23651dfb2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';
const iconFolk = 'https://images.unsplash.com/photo-1568903457385-c38d34ffd37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200';

// ── Genre → Asset Map ────────────────────────────────────

const GENRE_ICONS: Record<string, string> = {
  'Pop': iconPop,
  'Rock': iconRock,
  'Hip-Hop': iconHipHop,
  'Electronic': iconElectronic,
  'R&B': iconRnB,
  'Jazz': iconJazz,
  'Classical': iconClassical,
  'Country': iconCountry,
  'Reggae': iconReggae,
  'Afrobeat': iconAfrobeat,
  'Indie': iconIndie,
  'Folk': iconFolk,
};

// ── Маппинг жанров ───────────────────────────────────────

/** Цветовая схема каждого жанра (border, bg, text) */
export const GENRE_COLORS: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  'Pop':        { border: 'border-pink-400/40', bg: 'bg-pink-500/10',    text: 'text-pink-400',    glow: 'shadow-pink-500/20' },
  'Rock':       { border: 'border-orange-400/40', bg: 'bg-orange-500/10', text: 'text-orange-400',  glow: 'shadow-orange-500/20' },
  'Hip-Hop':    { border: 'border-purple-400/40', bg: 'bg-purple-500/10', text: 'text-purple-400',  glow: 'shadow-purple-500/20' },
  'Electronic': { border: 'border-cyan-400/40', bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    glow: 'shadow-cyan-500/20' },
  'R&B':        { border: 'border-pink-400/40', bg: 'bg-pink-500/10',    text: 'text-pink-300',    glow: 'shadow-pink-500/20' },
  'Jazz':       { border: 'border-yellow-400/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400',  glow: 'shadow-yellow-500/20' },
  'Classical':  { border: 'border-violet-400/40', bg: 'bg-violet-500/10', text: 'text-violet-400',  glow: 'shadow-violet-500/20' },
  'Country':    { border: 'border-amber-400/40', bg: 'bg-amber-500/10',  text: 'text-amber-400',   glow: 'shadow-amber-500/20' },
  'Reggae':     { border: 'border-green-400/40', bg: 'bg-green-500/10',  text: 'text-green-400',   glow: 'shadow-green-500/20' },
  'Afrobeat':   { border: 'border-lime-400/40', bg: 'bg-lime-500/10',    text: 'text-lime-400',    glow: 'shadow-lime-500/20' },
  'Indie':      { border: 'border-teal-400/40', bg: 'bg-teal-500/10',    text: 'text-teal-400',    glow: 'shadow-teal-500/20' },
  'Folk':       { border: 'border-amber-500/40', bg: 'bg-amber-600/10',  text: 'text-amber-500',   glow: 'shadow-amber-600/20' },
};

const DEFAULT_COLOR = { border: 'border-white/20', bg: 'bg-white/5', text: 'text-gray-400', glow: 'shadow-white/10' };

/**
 * GenreIcon — 3D иконка жанра
 * @param genre - название жанра (Pop, Rock, ...)
 * @param size  - размер иконки в px (default 24)
 */
export function GenreIcon({ genre, size = 32 }: { genre: string; size?: number }) {
  const iconSrc = GENRE_ICONS[genre];

  if (iconSrc) {
    return (
      <div
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        <img
          src={iconSrc}
          alt={genre}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  // Fallback — универсальная нота для неизвестных жанров
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="20" r="6" stroke="#94a3b8" strokeWidth="2" fill="none" />
      <path d="M30 20v12" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="32" r="4" stroke="#94a3b8" strokeWidth="2" fill="none" />
    </svg>
  );
}

/**
 * GenreTag — жанровый тег с иконкой и подсветкой
 * Готовый UI-элемент для использования в списках треков, фильтрах, профилях
 */
export function GenreTag({
  genre,
  size = 'md',
  showIcon = true,
  onClick,
  active = false,
  className = '',
}: {
  genre: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  const colors = GENRE_COLORS[genre] || DEFAULT_COLOR;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = { sm: 20, md: 28, lg: 36 };

  const Tag = onClick ? 'button' : 'span';

  return (
    <Tag
      onClick={onClick}
      className={`
        inline-flex items-center rounded-lg border font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${active
          ? `${colors.bg} ${colors.border} ${colors.text} shadow-md ${colors.glow}`
          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/25 hover:text-gray-200'
        }
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {showIcon && <GenreIcon genre={genre} size={iconSizes[size]} />}
      {genre}
    </Tag>
  );
}