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

// ── Figma-ассеты персонажей ──

/** Сандра - МУЗЫКАНТ/ПРОДВИЖЕНИЕ (всегда продвижение треков) */
import heroSandraImage from 'figma:asset/35f389a17164c721f8c2f14a2208404902db7e32.png';

/** Лиана - ПРЕССА/PR (всегда PR в СМИ) */
import heroLinaImage from 'figma:asset/b588af1e64b5cf5211ec15bac00b66a0ac0e5986.png';

/** Дэн - DJ/БУКИНГ (всегда DJ-букинг) */
import heroDanImage from 'figma:asset/30c1c79a63080cd59ff8ce73c2d420b2a94316e6.png';

/** Марк - МАРКЕТИНГ (всегда маркетинг для артистов) */
import heroMarkImage from 'figma:asset/31a289e2e77360c47a1716aa8258585bf84fdc26.png';

/** Стелла - РАДИО (всегда радиоротация) */
import heroStellaImage from 'figma:asset/110f38099480aa93fa51ce4d7cb3ddcf76695405.png';

/** Макс - ПРОДЮСЕР/ТЕСТ ТРЕКА (всегда тестирование трека) */
import heroMaxImage from 'figma:asset/4a23a592ae83211e9897ddd52bb057ddcdd2b8d2.png';

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
