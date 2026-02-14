/**
 * PAGE BANNER - Hero banner for all public pages
 * Renders route-specific banner from centralized banners registry
 * Note: /about and /marketplace use their own banners from special-banners
 */

import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ALL_BANNERS } from '@/app/assets/banners';

interface PageBannerProps {
  pathname: string;
  onNavigate: (path: string) => void;
}

export function PageBanner({ pathname, onNavigate }: PageBannerProps) {
  const banner = ALL_BANNERS[pathname];
  if (!banner) return null;

  // Full-image mode: show image at natural aspect ratio, no overlays or text
  if (banner.fullImage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full overflow-hidden"
      >
        <ImageWithFallback
          src={banner.image}
          alt={banner.title}
          className="w-full h-auto block"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[180px] xs:h-[200px] sm:h-[240px] lg:h-[380px] overflow-hidden"
    >
      {/* Background Image */}
      <ImageWithFallback
        src={banner.image}
        alt={banner.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={banner.objectPosition ? { objectPosition: banner.objectPosition } : undefined}
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