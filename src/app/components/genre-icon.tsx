/**
 * GENRE ICON — 3D иконки жанров из Figma "3D Music Icon Set"
 * Каждый жанр маппится на уникальный 3D ассет
 */

// ── 3D Asset Imports (from Figma 3D Music Icon Set) ──────
// Characters
import iconPop from "figma:asset/49f6c85dda0ac227abb3e49ab9cf21752ca52591.png";        // Pop — woman with headphones
import iconRock from "figma:asset/ac4f616d844cbc85c24cd895e6d756f59e6890e4.png";       // Rock — drum kit
import iconHipHop from "figma:asset/cdcc734d52235132a13da5ab880058c8321c4a5a.png";     // Hip-Hop — DJ with turntable
import iconElectronic from "figma:asset/b04cb3bf8c3d93314500d5219e30997d617519ee.png"; // Electronic — DJ headphones & turntable
import iconRnB from "figma:asset/5c9fbfbd460ca845ff6321ec046de094d2dddec4.png";        // R&B — dancing performers
import iconIndie from "figma:asset/1583d2bea42f13cfa68653c6d7297ac98022b871.png";      // Indie — cassette/boombox
// Instruments
import iconJazz from "figma:asset/4bc02f8a1867e93227dd4ca763a3d6d7dcbcbd83.png";       // Jazz — saxophone
import iconClassical from "figma:asset/7b2a6ed9ab62676184118c0018d5d4674baa9d6f.png";  // Classical — piano
import iconCountry from "figma:asset/a18ab3012fcfccf21b9cccd8d31045a0ca54a8cc.png";    // Country — acoustic guitar
import iconReggae from "figma:asset/dab6f45f8fcce9d9e309c78c9087e7b1158f3131.png";     // Reggae — drums
import iconAfrobeat from "figma:asset/97d54b55f4f9efe4e2873f1a6ebe1180473a857f.png";   // Afrobeat — marimba/xylophone
import iconFolk from "figma:asset/6ed650b9cdd1200c54df5e406846a7750a1012f1.png";       // Folk — banjo

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