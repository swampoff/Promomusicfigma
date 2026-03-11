# CLAUDE.md — Память проекта ПРОМО.МУЗЫКА

## Еженедельные задачи

### Обновление внешних клипов на главной
- **Файл:** `src/data/external-clips.ts`
- **Частота:** каждую неделю
- **Что делать:** обновить массив `externalClips` новыми клипами из внешних источников (YouTube, VK Video, Rutube и др.)
- **Формат:** каждый клип содержит `id`, `title`, `artist`, `views`, `thumbnail`, `source`, `addedDate`
- **Где отображается:** секция «Новые клипы» на главной странице (`SunoLayoutLanding.tsx`) — в правом сайдбаре и мобильной версии
- **Важно:** обновить поле `addedDate` и комментарий «Последнее обновление» в шапке файла

## Архитектура данных на главной

### Источники данных
| Секция | Источник | Fallback-файл |
|--------|----------|---------------|
| TOP 20 чарт (ПРОМО.МУЗЫКА) | `useWeeklyChart()` API | `src/data/charts-fallback.ts` |
| Чарты радиостанций | `getAllCharts()` API | `src/data/charts-fallback.ts` |
| Новости | `useLandingNews()` API | `src/data/news-fallback.ts` |
| Новинки (треки) | `useNewTracks()` API | — |
| Топ артистов | `usePopularArtists()` API | — |
| Новые клипы | `src/data/external-clips.ts` | — (статические данные) |
| Статистика | `usePlatformStats()` API | — |
| Концерты | `getPromotedConcerts()` API | — |
| Популярные артисты | `PopularArtists` компонент с API | — |

### Fallback-данные
- Чарты: `src/data/charts-fallback.ts` — треки для 7 радиостанций/стримингов
- Новости: `src/data/news-fallback.ts` — 30 статей по всем категориям
- Показываются **только** когда API не возвращает данные
