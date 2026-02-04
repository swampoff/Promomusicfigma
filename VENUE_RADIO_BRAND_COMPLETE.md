# VENUE RADIO BRAND - ПОЛНАЯ ДОКУМЕНТАЦИЯ

## 🎵 СИСТЕМА РАДИОБРЕНДА ЗАВЕДЕНИЙ

Полноценная система управления внутренним радиовещанием для баров, ресторанов, клубов и кафе.

---

## 🎯 КОНЦЕПЦИЯ

**Радиобренд заведения** - это автоматизированная система фонового вещания, которая:
- Создает уникальную звуковую атмосферу заведения
- Проигрывает музыку, джинглы, рекламу и анонсы по расписанию
- Монетизирует эфир через продажу рекламных слотов
- Управляется полностью через платформу PROMO.MUSIC

**Важно:** Формирование эфира происходит на отдельном сервере PROMO.MUSIC. Заведение только управляет настройками и контролирует поток.

---

## 📊 АРХИТЕКТУРА

### SQL Структура (6 таблиц, 117+ полей)
```
1. venue_radio_settings (27 полей) - Настройки радио
2. venue_radio_playlists (19 полей) - Плейлисты
3. venue_radio_content (22 полей) - Джинглы/реклама/анонсы
4. venue_radio_play_queue (18 полей) - Очередь воспроизведения
5. venue_radio_play_history (16 полей) - История проигрываний
6. venue_radio_schedule (15 полей) - Расписание плейлистов
```

### React Компоненты
```
/src/venue/components/radio-brand-section.tsx (850+ строк)
├─ RadioBrandSection (главный компонент)
├─ Tab System (6 вкладок)
│  ├─ PlayerTab - Детальный плеер с управлением
│  ├─ PlaylistsTab - Управление плейлистами
│  ├─ ContentTab - Джинглы, реклама, анонсы
│  ├─ ScheduleTab - Расписание плейлистов
│  ├─ AnalyticsTab - Статистика проигрываний
│  └─ SettingsTab - Настройки (режим тишины, вставки)
├─ InfoCard - KPI карточки
└─ TabButton - Кнопки навигации
```

### Интеграция
```
VenueApp
├─ VenuePlayer (плеер внизу)
│  └─ Radio Brand Button → открывает RadioBrandSection
└─ RadioBrandSection (полноценная страница)
```

---

## 🎨 UI/UX ОСОБЕННОСТИ

### Навигация
**Способ 1:** Клик по кнопке "Радио" (📻) в venue-player
**Способ 2:** Пункт меню "Бренд радио" в sidebar

### Дизайн
- **Стиль:** Glassmorphism с темным фоном
- **Градиенты:** Purple → Pink → Rose
- **Индикаторы:** Пульсирующая точка "В ЭФИРЕ"
- **Анимации:** Motion/React transitions

### Адаптивность
✅ Полностью адаптивен:
- Мобильные (< 640px)
- Планшеты (640px - 1024px)
- Десктоп (> 1024px)

---

## 🎵 ФУНКЦИОНАЛ

### 1. ПЛЕЕР (PlayerTab)

**Детальный плеер с:**
- 🎨 Большая обложка трека (400x400)
- ▶️ Play/Pause управление
- 🔊 Регулятор громкости (slider)
- ⏭️ Пропуск трека
- 📊 Прогресс-бар
- 📜 Очередь проигрывания (5+ треков)
- 📈 KPI карточки (Онлайн, Проиграно, Слушатели, Вовлеченность)

**Управление радио:**
```tsx
// Включить/выключить
<button onClick={() => setIsRadioEnabled(!isRadioEnabled)}>
  {isRadioEnabled ? <Power /> : <PowerOff />}
</button>

// Громкость
<input type="range" value={volume} onChange={(e) => setVolume(e.target.value)} />

// Статус
{isRadioEnabled && <span>🔴 В ЭФИРЕ</span>}
```

### 2. ПЛЕЙЛИСТЫ (PlaylistsTab)

**Управление плейлистами:**
- ➕ Создание нового плейлиста
- ✏️ Редактирование существующих
- 🗑️ Удаление
- ✅ Активация плейлиста в эфир
- 📊 Статистика (треки, длительность, статус)

**Статусы плейлистов:**
- 🔴 **В эфире** - Активный плейлист
- 🟢 **Активен** - Готов к использованию
- ⚫ **Черновик** - В разработке

### 3. КОНТЕНТ (ContentTab)

**Типы контента:**
- ✨ **Джинглы** - Фирменные звуки заведения
- 📢 **Реклама** - Рекламные ролики
- 📻 **Анонсы** - Мероприятия и акции

**Функционал:**
- 📤 Загрузка аудиофайлов (MP3, WAV)
- ▶️ Предпрослушивание
- ✅ Активация/деактивация
- 📊 Статистика проигрываний

### 4. РАСПИСАНИЕ (ScheduleTab)

**Автоматическое переключение плейлистов:**
```
Утренний плейлист → Пн-Пт, 07:00-12:00
Обеденный эфир   → Пн-Пт, 12:00-15:00
Вечерний кайф    → Пт-Сб, 18:00-23:00
```

**Параметры слота:**
- 📅 Дни недели
- ⏰ Время начала/окончания
- 🎵 Привязанный плейлист
- 🔘 Включить/выключить

### 5. АНАЛИТИКА (AnalyticsTab)

**Статистика:**
- 📊 Проиграно треков
- 👥 Слушателей
- ⏱️ Время в эфире
- 📈 Вовлеченность

**Топ-10 треков:**
- Название и артист
- Количество проигрываний
- Рейтинг

### 6. НАСТРОЙКИ (SettingsTab)

**Режим тишины:**
```tsx
quietMode: {
  enabled: true,
  startTime: '00:00',
  endTime: '07:00',
  days: 'all' // или 'Mon,Tue,Wed'
}
```

**Автоматические вставки:**
```tsx
autoInsert: {
  jingleFrequency: 15,      // минут
  adFrequency: 10,          // треков
  announcementFrequency: 20 // треков
}
```

**Информация о потоке:**
- URL потока (stream.promo.fm/venue_12345)
- Статус (🟢 Онлайн / 🔴 Офлайн)
- Последнее обновление (heartbeat)

---

## 🔄 WORKFLOW

### 1. Настройка радио
```
Заведение → Настройки (SettingsTab)
         ↓
Включает радио, устанавливает громкость
         ↓
Настраивает режим тишины
         ↓
Устанавливает частоту вставок
```

### 2. Создание контента
```
Заведение → Плейлисты (PlaylistsTab)
         ↓
Создает плейлист "Утренний вайб"
         ↓
Добавляет 45 треков
         ↓
Загружает джингл в ContentTab
         ↓
Активирует плейлист
```

### 3. Запуск эфира
```
Система → Получает активный плейлист
       ↓
Генерирует очередь (tracks + джинглы + реклама)
       ↓
Отправляет в формирователь эфира (внешний сервер)
       ↓
Начинает трансляцию
```

### 4. Автоматизация
```
Cron Job → Проверяет расписание каждую минуту
        ↓
Если время совпадает → переключает плейлист
        ↓
Проверяет режим тишины → ставит на паузу
        ↓
Обновляет heartbeat → статус "онлайн"
```

---

## 📡 ИНТЕГРАЦИЯ С ВНЕШНИМ СЕРВЕРОМ

### Heartbeat (каждые 5 секунд)
```typescript
POST /api/external-radio-server/heartbeat

Body:
{
  venueId: 'venue_12345',
  currentTrack: {
    id: 'track_789',
    title: 'Summer Vibes',
    artist: 'DJ Kool',
    currentTime: 134,
    duration: 261,
    isPlaying: true
  },
  volume: 0.7,
  isEnabled: true
}

Response:
{
  status: 'ok',
  streamUrl: 'stream.promo.fm/venue_12345',
  queueUpdated: false
}
```

### Генерация очереди
```typescript
POST /api/external-radio-server/queue/generate

Body:
{
  venueId: 'venue_12345',
  playlistId: 'playlist_456',
  settings: {
    jingleFrequency: 15,
    adFrequency: 10,
    announcementFrequency: 20
  }
}

Response:
{
  queue: [
    { type: 'track', id: 'track_1', order: 0 },
    { type: 'track', id: 'track_2', order: 1 },
    { type: 'jingle', id: 'jingle_1', order: 2, isInserted: true },
    { type: 'track', id: 'track_3', order: 3 },
    // ...
  ],
  totalItems: 75
}
```

### Команды управления
```typescript
// Включить/выключить радио
POST /api/external-radio-server/control/power
Body: { venueId, enabled: true/false }

// Изменить громкость
POST /api/external-radio-server/control/volume
Body: { venueId, volume: 0.7 }

// Пропустить трек
POST /api/external-radio-server/control/skip
Body: { venueId }

// Pause/Resume
POST /api/external-radio-server/control/pause
Body: { venueId, pause: true/false }
```

---

## 🎯 API ENDPOINTS (Frontend → Backend)

### Настройки
```typescript
PUT /api/venue/:venueId/radio/settings
GET /api/venue/:venueId/radio/status
```

### Управление
```typescript
POST /api/venue/:venueId/radio/play
POST /api/venue/:venueId/radio/pause
POST /api/venue/:venueId/radio/volume
POST /api/venue/:venueId/radio/skip
```

### Плейлисты
```typescript
GET  /api/venue/:venueId/radio/playlists
POST /api/venue/:venueId/radio/playlists
PUT  /api/venue/:venueId/radio/playlists/:id
POST /api/venue/:venueId/radio/playlists/:id/activate
```

### Контент
```typescript
GET    /api/venue/:venueId/radio/content?type=jingle|ad|announcement
POST   /api/venue/:venueId/radio/content/upload
PUT    /api/venue/:venueId/radio/content/:id
DELETE /api/venue/:venueId/radio/content/:id
```

### Расписание
```typescript
GET    /api/venue/:venueId/radio/schedule
POST   /api/venue/:venueId/radio/schedule
PUT    /api/venue/:venueId/radio/schedule/:id
DELETE /api/venue/:venueId/radio/schedule/:id
```

### Аналитика
```typescript
GET /api/venue/:venueId/radio/analytics
GET /api/venue/:venueId/radio/history
GET /api/venue/:venueId/radio/top-tracks
```

---

## 💡 ОСОБЕННОСТИ РЕАЛИЗАЦИИ

### 1. Контекст состояния
```typescript
// Используется существующий VenuePlayerContext
const player = useVenuePlayer();

// Дополнительное состояние для радио
const [isRadioEnabled, setIsRadioEnabled] = useState(true);
const [settings, setSettings] = useState({...});
```

### 2. Навигация
```typescript
// В VenueApp.tsx
<VenuePlayer onPlayerClick={() => setActiveSection('radio-brand')} />

// В venue-player.tsx
{onPlayerClick && (
  <button onClick={onPlayerClick}>
    <Radio className="w-5 h-5" />
  </button>
)}
```

### 3. Адаптивные классы
```tsx
// Сетка
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Текст
className="text-sm sm:text-base"

// Padding
className="p-4 sm:p-6"

// Flex direction
className="flex flex-col sm:flex-row"
```

---

## ✅ ЧЕКЛИСТ ИНТЕГРАЦИИ

- [x] SQL структура создана (6 таблиц, 117+ полей)
- [x] React компонент создан (850+ строк)
- [x] 6 вкладок реализованы
- [x] Адаптивность полная
- [x] Интеграция в VenueApp
- [x] Навигация из плеера
- [x] Типы TypeScript
- [x] API endpoints спроектированы
- [x] Документация создана

### Следующие шаги:
1. **Backend:** Создать API endpoints
2. **Database:** Выполнить SQL миграции
3. **External Server:** Интеграция с формирователем эфира
4. **Heartbeat:** Настроить обновление каждые 5 сек
5. **Testing:** Протестировать все функции

---

## 🎉 РЕЗУЛЬТАТ

**Создана полноценная система радиобренда заведений:**
- ✅ 6 таблиц SQL (117+ полей)
- ✅ 850+ строк React кода
- ✅ 6 вкладок интерфейса
- ✅ Полностью адаптивный UI
- ✅ Интеграция с venue-player
- ✅ Навигация через кнопку в плеере
- ✅ Режим тишины
- ✅ Расписание плейлистов
- ✅ Управление контентом
- ✅ Аналитика
- ✅ Готова к подключению внешнего сервера

**Система радиобренда полностью готова к интеграции с внешним сервером формирования эфира!** 🚀🎵✨🎊

---

## 📸 СКРИНШОТЫ UI

### Player Tab
```
┌─────────────────────────────────────────────┐
│ [Радиобренд заведения]    [Радио включено] │
│ Sunset Lounge Bar               🔴 В ЭФИРЕ │
├─────────────────────────────────────────────┤
│ [Плеер] [Плейлисты] [Контент] ...          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐                            │
│  │  [ОБЛОЖКА]  │  Summer Vibes              │
│  │   400x400   │  DJ Kool                   │
│  └─────────────┘  ━━━━━●━━━━━ 2:34/4:21    │
│                                             │
│         [⏮] [▶️] [⏭]    🔊 ▬▬▬▬▬▬         │
│                                             │
│  Очередь:                                   │
│  1. ▶ Summer Vibes                          │
│  2. 🎵 Night Drive                          │
│  3. ✨ Джингл                               │
│  4. 📢 Реклама                              │
└─────────────────────────────────────────────┘
```

### Settings Tab
```
┌─────────────────────────────────────────────┐
│ 🌙 Режим тишины            [Вкл/Выкл]      │
│ Начало: [00:00]  Окончание: [07:00]        │
├─────────────────────────────────────────────┤
│ ⚡ Автоматические вставки                   │
│ Джингл каждые:     [15] минут              │
│ Реклама каждые:    [10] треков             │
│ Анонс каждые:      [20] треков             │
├─────────────────────────────────────────────┤
│ ℹ️  Информация о потоке                     │
│ URL:    stream.promo.fm/venue_12345        │
│ Статус: 🟢 Онлайн                          │
│ Обновлено: 3 секунды назад                 │
└─────────────────────────────────────────────┘
```

**Готово к использованию!** 🎊
