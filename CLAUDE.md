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
| Концерты | `useLandingConcerts()` API | `src/data/concerts-fallback.ts` |
| Популярные артисты | `PopularArtists` компонент с API | — |

### Fallback-данные
- Чарты: `src/data/charts-fallback.ts` — треки для 7 радиостанций/стримингов
- Новости: `src/data/news-fallback.ts` — 30 статей по всем категориям
- Концерты: `src/data/concerts-fallback.ts` — 6 концертов
- Показываются **только** когда API не возвращает данные

### Кабинет артиста
| Секция | Источник | Fallback |
|--------|----------|----------|
| Главная (home-page) | `DataContext.getTracksByUser()` | Показывает нули если нет треков |
| Треки (tracks-page) | `DataContext.getTracksByUser()` | — |
| Видео (video-page) | `DataContext.getVideosByUser()` | — (только реальные данные) |
| Новости (news-page) | `DataContext.getNewsByUser()` | — (только реальные данные) |
| Сообщения (messages-page) | `MessagesContext` → messaging API | Демо-диалоги при отсутствии провайдера |
| Аналитика (analytics-page) | `fetchAnalyticsOverview/Timeline` API + `DataContext` | Моки для отдельных графиков |
| Продвижение (pitching-page) | `DataContext.getPitchingsByUser()` | Каталог площадок из `src/data/pitching-catalog.ts` |
| Концерты | `DataContext` | — |

### Кабинет радиостанции
| Секция | Источник | Fallback |
|--------|----------|----------|
| Заявки артистов | `fetchArtistRequests()` API | — (пустой список) |
| Заявки заведений | `fetchVenueRequests()` API | — (пустой список) |
| Рекламные слоты | `fetchAdSlots()` API | — (пустой список) |
| Финансы | `fetchFinanceOverview()` + `fetchFinanceTransactions()` API | Нули если нет данных |
| Аналитика | `fetchRadioAnalytics()` API | Шаблоны масштабирования для графиков |
| Уведомления | `fetchRadioNotifications()` API | — |
| Тикеты поддержки | `fetchTicketMessages()` / `sendTicketMessage()` API | — |
| Профиль | `useRadioProfile()` → `radio-profile` API | localStorage |
| Сообщения | `MessagesContext` → messaging API | — |
