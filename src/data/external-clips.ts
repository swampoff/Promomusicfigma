/**
 * Внешние клипы для главной страницы
 *
 * Этот файл обновляется еженедельно новыми клипами из внешних источников
 * (YouTube, VK Video и др.)
 *
 * Последнее обновление: 2026-03-10
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
    title: 'Дорога домой',
    artist: 'Артик & Асти',
    views: '2.1M',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-10',
  },
  {
    id: 'ext-clip-2',
    title: 'Нежность',
    artist: 'Zivert',
    views: '1.8M',
    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-10',
  },
  {
    id: 'ext-clip-3',
    title: 'Космос',
    artist: 'Мот',
    views: '3.4M',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-10',
  },
  {
    id: 'ext-clip-4',
    title: 'Лунный свет',
    artist: 'Елена Темникова',
    views: '1.2M',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-10',
  },
  {
    id: 'ext-clip-5',
    title: 'Танцуй',
    artist: 'Макс Барских',
    views: '4.7M',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-10',
  },
  {
    id: 'ext-clip-6',
    title: 'Огни ночного города',
    artist: 'Баста',
    views: '2.9M',
    thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&h=360&fit=crop',
    source: 'youtube',
    addedDate: '2026-03-10',
  },
];
