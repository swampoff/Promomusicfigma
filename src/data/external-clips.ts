/**
 * Внешние клипы для главной страницы
 *
 * Этот файл обновляется еженедельно новыми клипами из внешних источников
 * (YouTube, VK Video и др.)
 *
 * Последнее обновление: 2026-03-14
 */

export interface ExternalClip {
  id: string;
  title: string;
  artist: string;
  views: string;
  thumbnail: string;
  videoUrl?: string;
  source: 'youtube' | 'vk' | 'rutube' | 'other';
  addedDate: string;
}

export const externalClips: ExternalClip[] = [
  {
    id: 'ext-clip-1',
    title: 'Северное сияние',
    artist: 'Полина Гагарина',
    views: '3.6M',
    thumbnail: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-14',
  },
  {
    id: 'ext-clip-2',
    title: 'Не отпускай',
    artist: 'Jony',
    views: '5.2M',
    thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-14',
  },
  {
    id: 'ext-clip-3',
    title: 'Весна придёт',
    artist: 'Леонид Агутин',
    views: '1.4M',
    thumbnail: 'https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=640&h=360&fit=crop',
    source: 'vk',
    addedDate: '2026-03-14',
  },
  {
    id: 'ext-clip-4',
    title: 'Между нами',
    artist: 'Скриптонит',
    views: '4.1M',
    thumbnail: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-14',
  },
  {
    id: 'ext-clip-5',
    title: 'Город заснул',
    artist: 'Дора',
    views: '2.7M',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&h=360&fit=crop',
    source: 'rutube',
    addedDate: '2026-03-14',
  },
  {
    id: 'ext-clip-6',
    title: 'На краю света',
    artist: 'Miyagi & Andy Panda',
    views: '6.8M',
    thumbnail: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-14',
  },
];
