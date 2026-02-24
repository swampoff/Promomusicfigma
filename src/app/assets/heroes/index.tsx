/**
 * HEROES - Персонажи главной карусели лендинга
 *
 * Все Figma-ассеты героев хранятся здесь.
 * Каждый персонаж ЖЁСТКО привязан к своему разделу:
 *
 *   Персонаж     | Раздел              | Accent Color
 *   ─────────────┼─────────────────────┼──────────────
 *   Сандра       | Музыкант/Продвижение| #FF577F
 *   Лиана        | Пресса/PR           | #f43f5e
 *   Дэн          | DJ/Букинг           | #3b82f6
 *   Макс         | Продюсер/Тест трека | #06b6d4
 *   Марк         | Маркетинг           | #FF577F
 *   Стелла       | Радио               | #a855f7
 *
 * Источник: Figma-дизайн
 */

// ── Unsplash-ассеты персонажей (заменяют Figma) ──

/** Сандра - МУЗЫКАНТ/ПРОДВИЖЕНИЕ (всегда продвижение треков) */
const heroSandraImage = 'https://images.unsplash.com/photo-1556296569-44d434fb28d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMHNpbmdlciUyMHN0dWRpbyUyMG5lb258ZW58MXx8fHwxNzcxNzg1NTU0fDA&ixlib=rb-4.1.0&q=80&w=1080';

/** Лиана - ПРЕССА/PR (всегда PR в СМИ) */
const heroLinaImage = 'https://images.unsplash.com/photo-1554200876-907f9286c2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGpvdXJuYWxpc3QlMjBwcmVzcyUyMG1pY3JvcGhvbmV8ZW58MXx8fHwxNzcxNzg1NTU0fDA&ixlib=rb-4.1.0&q=80&w=1080';

/** Дэн - DJ/БУКИНГ (всегда DJ-букинг) */
const heroDanImage = 'https://images.unsplash.com/photo-1623307019152-1ee797183f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxESiUyMHR1cm50YWJsZSUyMG5pZ2h0Y2x1YiUyMG5lb258ZW58MXx8fHwxNzcxNzg1NTU1fDA&ixlib=rb-4.1.0&q=80&w=1080';

/** Марк - МАРКЕТИНГ (всегда маркетинг для артистов) */
const heroMarkImage = 'https://images.unsplash.com/photo-1532617392008-5399d3d8a599?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBjcmVhdGl2ZSUyMGRpZ2l0YWwlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcxNzg1NTU1fDA&ixlib=rb-4.1.0&q=80&w=1080';

/** Стелла - РАДИО (всегда радиоротация) */
const heroStellaImage = 'https://images.unsplash.com/photo-1767474833531-c1be2788064a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWRpbyUyMGJyb2FkY2FzdCUyMHN0dWRpbyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzE3ODU1NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080';

/** Макс - ПРОДЮСЕР/ТЕСТ ТРЕКА (всегда тестирование трека) */
const heroMaxImage = 'https://images.unsplash.com/photo-1767474833645-0465485ca6d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb2R1Y2VyJTIwc3R1ZGlvJTIwbWl4aW5nJTIwY29uc29sZXxlbnwxfHx8fDE3NzE3ODU1NTV8MA&ixlib=rb-4.1.0&q=80&w=1080';

export {
  heroSandraImage,
  heroLinaImage,
  heroDanImage,
  heroMarkImage,
  heroStellaImage,
  heroMaxImage,
};

// ── Реестр привязок (для программного доступа) ──
export const HERO_CHARACTER_MAP = {
  sandra:  { image: heroSandraImage, section: 'promotion',  label: 'Сандра.Музыкант',   color: '#FF577F' },
  lina:    { image: heroLinaImage,   section: 'press',       label: 'Лиана.Пресса',      color: '#f43f5e' },
  dan:     { image: heroDanImage,    section: 'dj',          label: 'Дэн.DJ',            color: '#3b82f6' },
  max:     { image: heroMaxImage,    section: 'track-test',  label: 'Макс.Продюсер',     color: '#06b6d4' },
  mark:    { image: heroMarkImage,   section: 'marketing',   label: 'Марк.Маркетинг',    color: '#FF577F' },
  stella:  { image: heroStellaImage, section: 'radio',       label: 'Стелла.Радио',       color: '#a855f7' },
} as const;