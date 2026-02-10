/**
 * GLASS BANNER LAYER — точная копия Figma Rectangle1
 * backdrop-blur-[21px], radial gradient glow, border #151515 3.5px, rounded-[40px]
 *
 * Для full-bleed (hero-баннеры без скруглений) передавайте:
 *   className="!rounded-none" — border-overlay автоматически подхватит
 */

import { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

const FIGMA_BG = "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 194 311\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><rect x=\"0\" y=\"0\" height=\"100%25\" width=\"100%25\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(19.021 29.985 -18.704 81.362 3.7854 11.151)\"><stop stop-color=\"rgba(255,255,255,0.4)\" offset=\"0\"/><stop stop-color=\"rgba(255,255,255,0)\" offset=\"1\"/></radialGradient></defs></svg>')";

interface GlassBannerLayerProps {
  children: ReactNode;
  className?: string;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Убрать скругления (hero full-bleed) */
  noRadius?: boolean;
}

export function GlassBannerLayer({ children, className, padding = 'md', noRadius }: GlassBannerLayerProps) {
  const pad = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const outerRadius = noRadius ? 'rounded-none' : 'rounded-[40px]';
  const borderRadius = noRadius ? 'rounded-none' : 'rounded-[43.5px]';

  return (
    <div
      className={cn('backdrop-blur-[21px] relative', outerRadius, pad, className)}
      style={{ backgroundImage: FIGMA_BG, backgroundSize: '100% 100%' }}
    >
      {/* Figma border overlay — #151515 3.5px */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute border-[#151515] border-[3.5px] border-solid pointer-events-none',
          noRadius ? 'inset-0 rounded-none' : 'inset-[-3.5px] rounded-[43.5px]'
        )}
      />
      {children}
    </div>
  );
}

export default GlassBannerLayer;
