/**
 * CONCERTS SECTION - Секция концертов для главной страницы
 * Показывает предстоящие концерты с красивыми карточками
 */

import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Ticket, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface Concert {
  id: string;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image?: string;
  ticketPrice?: string;
}

const upcomingConcerts: Concert[] = [
  {
    id: '1',
    title: 'Summer Music Fest 2026',
    artist: 'Various Artists',
    date: '15 июля 2026',
    time: '18:00',
    venue: 'Olympic Stadium',
    city: 'Москва',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    ticketPrice: 'от 2000₽',
  },
  {
    id: '2',
    title: 'Акустический вечер',
    artist: 'DJ Smash',
    date: '22 июля 2026',
    time: '20:00',
    venue: 'A2 Green Concert',
    city: 'Санкт-Петербург',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    ticketPrice: 'от 1500₽',
  },
  {
    id: '3',
    title: 'Rock Night',
    artist: 'Zivert',
    date: '5 августа 2026',
    time: '19:00',
    venue: 'Crocus City Hall',
    city: 'Москва',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    ticketPrice: 'от 3000₽',
  },
  {
    id: '4',
    title: 'Jazz Evening',
    artist: 'The Weeknd',
    date: '12 августа 2026',
    time: '21:00',
    venue: 'Космонавт',
    city: 'Санкт-Петербург',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    ticketPrice: 'от 2500₽',
  },
  {
    id: '5',
    title: 'Electronic Night',
    artist: 'Armin van Buuren',
    date: '20 августа 2026',
    time: '22:00',
    venue: 'Adrenaline Stadium',
    city: 'Москва',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    ticketPrice: 'от 4000₽',
  },
  {
    id: '6',
    title: 'Hip-Hop Battle',
    artist: 'Оксимирон',
    date: '1 сентября 2026',
    time: '20:00',
    venue: 'VK Fest Arena',
    city: 'Москва',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    ticketPrice: 'от 2800₽',
  },
];

export function ConcertsSection() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white mb-2 font-display">
            🎸 Предстоящие концерты
          </h2>
          <p className="text-sm xs:text-base text-slate-400">
            Не пропустите лучшие музыкальные события
          </p>
        </div>
        <Button
          size="sm"
          className="hidden sm:flex bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full"
        >
          Все концерты
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Concerts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {upcomingConcerts.map((concert, index) => (
          <motion.div
            key={concert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#FF577F]/50 transition-all cursor-pointer"
          >
            {/* Concert Image */}
            <div className="relative h-40 xs:h-48 sm:h-56 overflow-hidden">
              <ImageWithFallback
                src={concert.image}
                alt={concert.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              {/* Price Badge */}
              {concert.ticketPrice && (
                <div className="absolute top-3 xs:top-4 right-3 xs:right-4 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-[#FF577F] backdrop-blur-md text-white text-xs xs:text-sm font-bold shadow-lg">
                  <Ticket className="w-3 h-3 xs:w-3.5 xs:h-3.5 inline mr-1" />
                  {concert.ticketPrice}
                </div>
              )}
            </div>

            {/* Concert Info */}
            <div className="p-4 xs:p-5 sm:p-6 space-y-3 xs:space-y-4">
              {/* Artist */}
              <div className="text-xs xs:text-sm text-[#FF577F] font-bold">
                {concert.artist}
              </div>

              {/* Title */}
              <h3 className="text-base xs:text-lg sm:text-xl font-black text-white line-clamp-2 group-hover:text-[#FF577F] transition-colors">
                {concert.title}
              </h3>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs xs:text-sm text-slate-400">
                  <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0 text-[#FF577F]" />
                  <span className="truncate">{concert.date}</span>
                  <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0 text-[#FF577F] ml-1" />
                  <span className="truncate">{concert.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs xs:text-sm text-slate-400">
                  <MapPin className="w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0 text-[#FF577F]" />
                  <span className="truncate">{concert.venue}, {concert.city}</span>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-2 xs:py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#FF577F] to-purple-500 hover:from-[#FF4D7D] hover:to-purple-600 text-white font-bold text-xs xs:text-sm transition-all shadow-md shadow-[#FF577F]/20"
              >
                Купить билет
              </motion.button>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FF577F]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Mobile Show All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="sm:hidden flex justify-center mt-6"
      >
        <Button
          size="lg"
          className="bg-[#FF577F] hover:bg-[#FF4D7D] text-white font-bold px-8 py-6 rounded-full text-sm"
        >
          Все концерты
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
