/**
 * HEROES - Персонажи главной карусели лендинга
 *
 * Все ассеты героев хранятся в public/avatars/.
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
 * Источник: Figma-дизайн / Avatarz
 */

// ── Кастомные аватары персонажей ──

/** Сандра - МУЗЫКАНТ/ПРОДВИЖЕНИЕ (рыжая девушка в белых наушниках) */
const heroSandraImage = '/avatars/sandra.png';

/** Лиана - ПРЕССА/PR (ярко-розовые волосы) */
const heroLinaImage = '/avatars/liana.png';

/** Дэн - DJ/БУКИНГ (диджей в наушниках с неоновыми полосками) */
const heroDanImage = '/avatars/djden.png';

/** Марк - МАРКЕТИНГ (модный парень в очках) */
const heroMarkImage = '/avatars/mark.png';

/** Стелла - РАДИО (радиоредактор перед микрофоном) */
const heroStellaImage = '/avatars/stella.png';

/** Макс - ПРОДЮСЕР/ТЕСТ ТРЕКА (звукоинженер за пультом) */
const heroMaxImage = '/avatars/max.png';

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
