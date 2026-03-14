'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles, ExternalLink, Play, Volume2 } from 'lucide-react';
import { getNewReleases, type NewRelease, type NewReleasesData } from '@/utils/api/landing-data';

const SOURCE_LABELS: Record<string, string> = {
  platform: 'ПРОМО.МУЗЫКА',
  nashe: 'Наше Радио',
  dfm: 'DFM',
  europa: 'Europa Plus',
  russkoe: 'Русское Радио',
  yandex: 'Яндекс Музыка',
  shazam: 'Shazam',
};

const SOURCE_COLORS: Record<string, string> = {
  platform: 'from-[#FF577F] to-[#FF3366]',
  nashe: 'from-green-500 to-emerald-600',
  dfm: 'from-blue-500 to-indigo-600',
  europa: 'from-yellow-500 to-orange-500',
  russkoe: 'from-red-500 to-rose-600',
  yandex: 'from-yellow-400 to-amber-500',
  shazam: 'from-blue-400 to-cyan-500',
};

interface NewReleasesSectionProps {
  onPlayTrack?: (track: { id: string; title: string; artist: string; audioUrl?: string }) => void;
}

export function NewReleasesSection({ onPlayTrack }: NewReleasesSectionProps) {
  const [data, setData] = useState<NewReleasesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewReleases()
      .then((res) => {
        const d = (res as any)?.data || res;
        if (d?.tracks?.length) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.tracks?.length) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 xs:mb-5 sm:mb-6">
        <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#FF577F] to-[#FF3366] flex items-center justify-center">
          <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base xs:text-lg sm:text-xl font-bold text-white">
            Новинки недели
          </h3>
          <p className="text-[10px] xs:text-xs text-white/40">
            Свежие релизы и хиты
          </p>
        </div>
      </div>

      {/* Track list */}
      <div className="space-y-1.5 xs:space-y-2">
        {data.tracks.map((track, idx) => (
          <motion.div
            key={`${track.artist}-${track.title}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onPlayTrack?.({ id: `nr-${idx}`, title: track.title, artist: track.artist, audioUrl: track.previewUrl || '' })}
            className="group flex items-center gap-2.5 xs:gap-3 sm:gap-4 px-3 xs:px-4 py-2.5 xs:py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-200 border border-white/[0.04] hover:border-white/[0.08] cursor-pointer"
          >
            {/* Position / Play */}
            <div className="w-6 xs:w-7 sm:w-8 text-center flex-shrink-0 relative">
              <span className="text-sm xs:text-base sm:text-lg font-bold text-white/30 group-hover:hidden transition-colors">
                {track.position}
              </span>
              <Play className="w-4 h-4 text-[#FF577F] hidden group-hover:block mx-auto" fill="currentColor" />
              {track.previewUrl && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#FF577F]" title="Есть превью" />
              )}
            </div>

            {/* Cover / Icon */}
            <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {track.coverUrl ? (
                <img src={track.coverUrl} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Music className="w-4 h-4 xs:w-5 xs:h-5 text-white/30" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs xs:text-sm sm:text-base font-medium text-white truncate">
                {track.title}
              </p>
              <p className="text-[10px] xs:text-xs text-white/50 truncate">
                {track.artist}
              </p>
            </div>

            {/* Source badge */}
            <div className="flex-shrink-0">
              {track.isOurArtist ? (
                <span className="px-2 py-0.5 xs:px-2.5 xs:py-1 text-[9px] xs:text-[10px] font-bold rounded-full bg-gradient-to-r from-[#FF577F] to-[#FF3366] text-white">
                  НАШ
                </span>
              ) : (
                <span className="px-2 py-0.5 xs:px-2.5 xs:py-1 text-[9px] xs:text-[10px] font-medium rounded-full bg-white/[0.06] text-white/40 border border-white/[0.06]">
                  {SOURCE_LABELS[track.source] || track.sourceLabel || track.source}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Updated at */}
      {data.updatedAt && (
        <p className="text-[10px] xs:text-xs text-white/20 mt-3 xs:mt-4 text-right">
          Обновлено: {new Date(data.updatedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
