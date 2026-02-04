# 🎵 "СЕЙЧАС ИГРАЕТ" - КАК ЭТО РАБОТАЕТ

## ❓ Вопрос: "Это как?"

**Настройка:** Показывать текущий трек публично  
**Описание:** Посетители смогут видеть какая музыка сейчас играет в вашем заведении

**Вопрос:** КАК посетители это увидят? ГДЕ это отобразится?

---

## 🎯 ГДЕ ОТОБРАЖАЕТСЯ

### 1. **В каталоге заведений** (публичный вид)

```
┌────────────────────────────────────────────┐
│  КАТАЛОГ ЗАВЕДЕНИЙ - МОСКВА                │
├────────────────────────────────────────────┤
│                                            │
│  🏢 Sunset Lounge Bar                      │
│  📍 ул. Тверская, 15                       │
│  ⭐ 4.8 · 100 мест · Jazz, Soul            │
│                                            │
│  🎵 Сейчас играет:                         │
│     Miles Davis - So What                  │
│     ▶️ 2:34 / 9:22                         │
│                                            │
│  [Посмотреть профиль]                      │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│  🏢 Jazz Corner Club                       │
│  📍 Новинский бульвар, 8                   │
│  ⭐ 4.6 · 80 мест · Jazz, Blues            │
│                                            │
│  🎵 Сейчас играет:                         │
│     John Coltrane - Blue Train             │
│     ▶️ 5:12 / 10:42                        │
│                                            │
└────────────────────────────────────────────┘
```

**Если настройка ВЫКЛЮЧЕНА:**
```
│  🏢 Sunset Lounge Bar                      │
│  📍 ул. Тверская, 15                       │
│  ⭐ 4.8 · 100 мест · Jazz, Soul            │
│                                            │
│  🔒 Музыкальная информация скрыта          │
```

---

### 2. **В профиле заведения** (публичная страница)

```
╔════════════════════════════════════════════╗
║                                            ║
║         📸 ОБЛОЖКА ЗАВЕДЕНИЯ               ║
║                                            ║
║    🎯 ЛОГОТИП                              ║
╠════════════════════════════════════════════╣
║  Sunset Lounge Bar                    4.8⭐ ║
║  ул. Тверская, 15, Москва                  ║
╠════════════════════════════════════════════╣
║                                            ║
║  🎵 СЕЙЧАС ИГРАЕТ                          ║
║  ┌──────────────────────────────────────┐  ║
║  │  [обложка]  Miles Davis               │  ║
║  │             So What                   │  ║
║  │             Kind of Blue (1959)       │  ║
║  │                                       │  ║
║  │  ▶️ ━━━━━━━●─────  2:34 / 9:22       │  ║
║  │                                       │  ║
║  │  Jazz · Добавлено от Jazz FM Radio   │  ║
║  └──────────────────────────────────────┘  ║
║                                            ║
╠════════════════════════════════════════════╣
║  О заведении                               ║
║  Уютный лаунж-бар с живой музыкой...      ║
╚════════════════════════════════════════════╝
```

---

### 3. **В мобильном приложении "Nearby"** (рядом со мной)

```
📱 МОБИЛЬНОЕ ПРИЛОЖЕНИЕ
┌────────────────────────────────────────────┐
│  📍 Заведения рядом                        │
├────────────────────────────────────────────┤
│                                            │
│  🏢 Sunset Lounge Bar          0.5 км      │
│  🎵 Miles Davis - So What                  │
│  ⭐ 4.8 · Открыто до 02:00                 │
│                                            │
│  ─────────────────────────────────────────  │
│                                            │
│  🏢 Jazz Corner Club           1.2 км      │
│  🎵 John Coltrane - Blue Train             │
│  ⭐ 4.6 · Открыто до 23:00                 │
│                                            │
│  ─────────────────────────────────────────  │
│                                            │
│  🏢 Rock Bar                   1.8 км      │
│  🔒 Музыка скрыта                          │
│  ⭐ 4.2 · Открыто до 01:00                 │
│                                            │
└────────────────────────────────────────────┘
```

**Use case:**
```
Посетитель гуляет по городу
↓
Открывает приложение promo.music
↓
Видит "Nearby venues"
↓
Видит что в Sunset Lounge сейчас играет Miles Davis
↓
"О, люблю джаз!" → Идет в бар!
```

---

### 4. **В виджете "Live Music Map"** (будущее)

```
┌────────────────────────────────────────────┐
│  🗺️ КАРТА ЖИВОЙ МУЗЫКИ - МОСКВА           │
├────────────────────────────────────────────┤
│                                            │
│         [КАРТА ГОРОДА]                     │
│                                            │
│         📍 Sunset Lounge                   │
│         🎵 Miles Davis                     │
│                                            │
│         📍 Jazz Corner                     │
│         🎵 John Coltrane                   │
│                                            │
│         📍 Rock Bar                        │
│         🔒 (скрыто)                        │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🔧 КАК ЭТО РАБОТАЕТ ТЕХНИЧЕСКИ

### Архитектура:

```
┌─────────────────────────────────────────────────┐
│  VENUE КАБИНЕТ                                  │
│  ├─ Плеер воспроизведения                       │
│  ├─ Выбирает трек: "Miles Davis - So What"     │
│  ├─ Нажимает ▶️ Play                            │
│  └─ API: POST /venue/playback/play              │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  BACKEND (Supabase)                             │
│  ├─ Таблица: venue_playback_status              │
│  ├─ UPDATE:                                     │
│  │   venue_id: "venue-123"                      │
│  │   current_track_id: "track-456"              │
│  │   current_track_name: "So What"              │
│  │   current_artist: "Miles Davis"              │
│  │   current_album: "Kind of Blue"              │
│  │   current_position: 154 (секунд)             │
│  │   duration: 562 (секунд)                     │
│  │   is_playing: true                           │
│  │   started_at: "2026-02-04T18:30:00Z"         │
│  │   updated_at: "2026-02-04T18:32:34Z"         │
│  └─ public_visibility: TRUE/FALSE ← НАСТРОЙКА   │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  ПУБЛИЧНЫЙ API                                  │
│  GET /public/venues/nearby                      │
│  GET /public/venues/{id}/now-playing            │
│                                                 │
│  Если public_visibility = true:                 │
│  ✅ Возвращает данные трека                     │
│                                                 │
│  Если public_visibility = false:                │
│  ❌ Возвращает null или "hidden"                │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  ФРОНТЕНД (Публичный каталог)                   │
│  ├─ Получает данные через API                   │
│  ├─ Отображает:                                 │
│  │   🎵 Сейчас играет:                          │
│  │   Miles Davis - So What                      │
│  │   ▶️ 2:34 / 9:22                             │
│  └─ Обновление каждые 10 секунд (WebSocket)     │
└─────────────────────────────────────────────────┘
```

---

## 📊 SQL СТРУКТУРА

### Таблица: `venue_playback_status`

```sql
CREATE TABLE venue_playback_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venue_profiles(id),
  
  -- Текущий трек
  current_track_id UUID,
  current_track_name TEXT,
  current_artist TEXT,
  current_album TEXT,
  current_cover_url TEXT,
  current_genre TEXT,
  
  -- Статус воспроизведения
  is_playing BOOLEAN DEFAULT false,
  current_position INTEGER DEFAULT 0, -- секунды
  duration INTEGER, -- общая длительность
  
  -- Временные метки
  started_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- НАСТРОЙКА ПУБЛИЧНОСТИ 🎯
  public_visibility BOOLEAN DEFAULT false,
  
  -- Метаданные
  source TEXT, -- 'radio', 'playlist', 'manual'
  source_id UUID, -- ID радио/плейлиста
  
  UNIQUE(venue_id)
);
```

---

## 🔄 WORKFLOW

### Scenario 1: Venue включает трек

```
1. Venue заходит в кабинет
2. Открывает плеер
3. Выбирает трек "Miles Davis - So What"
4. Нажимает ▶️ Play

   ↓ API Call

5. Backend обновляет venue_playback_status:
   {
     venue_id: "venue-123",
     current_track_name: "So What",
     current_artist: "Miles Davis",
     is_playing: true,
     started_at: "2026-02-04T18:30:00Z",
     public_visibility: true ← Проверяет настройку
   }

   ↓ Real-time update

6. Все публичные страницы обновляются через WebSocket
7. Посетители видят "Сейчас играет: Miles Davis - So What"
```

---

### Scenario 2: Посетитель смотрит каталог

```
1. Посетитель открывает сайт promo.music
2. Переходит в "Каталог заведений"
3. Фильтрует: Москва, Jazz

   ↓ API Call

4. GET /public/venues?city=moscow&genre=jazz

   ↓ Backend

5. Для каждого venue проверяет:
   - venue.showInDirectory = true ✅
   - venue.settings.showCurrentlyPlaying = true ✅
   - playback_status.public_visibility = true ✅

   ↓ Возвращает

6. [
     {
       id: "venue-123",
       name: "Sunset Lounge Bar",
       rating: 4.8,
       nowPlaying: {
         track: "So What",
         artist: "Miles Davis",
         position: 154,
         duration: 562,
         isPlaying: true
       }
     },
     ...
   ]

   ↓ Frontend

7. Отображает карточку с "🎵 Сейчас играет"
```

---

## 🎨 UI КОМПОНЕНТЫ

### Компонент: `NowPlayingBadge.tsx`

```tsx
export function NowPlayingBadge({ nowPlaying }: Props) {
  if (!nowPlaying) {
    return (
      <div className="text-sm text-slate-500">
        🔒 Музыкальная информация скрыта
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
      <Music className="w-5 h-5 text-purple-400 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">
          {nowPlaying.artist} - {nowPlaying.track}
        </div>
        <div className="text-xs text-slate-400">
          {formatTime(nowPlaying.position)} / {formatTime(nowPlaying.duration)}
        </div>
      </div>
      {nowPlaying.isPlaying && (
        <div className="flex gap-0.5">
          <div className="w-1 h-4 bg-purple-400 animate-music-bar" />
          <div className="w-1 h-4 bg-purple-400 animate-music-bar delay-75" />
          <div className="w-1 h-4 bg-purple-400 animate-music-bar delay-150" />
        </div>
      )}
    </div>
  );
}
```

---

## 📱 ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Use Case 1: Привлечение посетителей

```
🎯 Цель: Привлечь любителей джаза

Посетитель:
- Открывает приложение
- Видит "Nearby venues"
- Видит: "Sunset Lounge - Miles Davis - So What"
- Думает: "О, люблю джаз!"
- Идет в бар

✅ Результат: +1 посетитель
```

---

### Use Case 2: Дифференциация от конкурентов

```
🎯 Цель: Показать уникальность

Каталог заведений:

🏢 Bar A - 🔒 Музыка скрыта
🏢 Bar B - 🎵 Ed Sheeran - Shape of You
🏢 Sunset Lounge - 🎵 Miles Davis - So What

Любитель джаза:
- Видит что в Sunset Lounge играет НАСТОЯЩИЙ джаз
- Выбирает Sunset Lounge вместо конкурентов

✅ Результат: Конкурентное преимущество
```

---

### Use Case 3: Построение репутации

```
🎯 Цель: Показать что заведение "знает музыку"

Публичный профиль Sunset Lounge:

История последних треков:
- 18:30 - Miles Davis - So What
- 19:00 - John Coltrane - Blue Train
- 19:30 - Thelonious Monk - Round Midnight
- 20:00 - Bill Evans - Waltz for Debby

Посетитель видит:
- Все треки - КЛАССИКА джаза
- Качественный отбор музыки
- Профессиональный подход

✅ Результат: Репутация "места с хорошей музыкой"
```

---

## ⚙️ НАСТРОЙКИ

### В профиле venue:

```tsx
<Switch
  checked={profile.settings?.showCurrentlyPlaying || false}
  onCheckedChange={(checked) => {
    updateSettings({ showCurrentlyPlaying: checked });
    
    // Также обновляет playback_status
    updatePlaybackVisibility(checked);
  }}
/>

<Label>
  Показывать текущий трек публично
  <p className="text-sm text-slate-400">
    Посетители смогут видеть какая музыка 
    сейчас играет в вашем заведении
  </p>
</Label>
```

### Что происходит при включении:

```
1. settings.showCurrentlyPlaying = true
2. playback_status.public_visibility = true
3. Публичный API начинает возвращать данные трека
4. Каталоги и карты обновляются через WebSocket
5. Посетители видят "🎵 Сейчас играет"
```

### Что происходит при выключении:

```
1. settings.showCurrentlyPlaying = false
2. playback_status.public_visibility = false
3. Публичный API возвращает null
4. Каталоги показывают "🔒 Музыка скрыта"
5. Данные о треке остаются ТОЛЬКО в venue кабинете
```

---

## 🔐 ПРИВАТНОСТЬ

### Что ВИДНО когда включено:

```
✅ Название трека: "So What"
✅ Исполнитель: "Miles Davis"
✅ Альбом: "Kind of Blue"
✅ Жанр: "Jazz"
✅ Обложка: [image URL]
✅ Прогресс: 2:34 / 9:22
✅ Статус: играет/пауза
```

### Что СКРЫТО всегда:

```
❌ Полный плейлист
❌ История воспроизведения (старше 24ч)
❌ Внутренние комментарии
❌ Финансовые данные
❌ Настройки venue
```

---

## 🎉 РЕЗЮМЕ

### Вопрос: "Показывать текущий трек публично - это как?"

### Ответ:

**ГДЕ отображается:**
1. ✅ Каталог заведений (карточки)
2. ✅ Публичный профиль venue
3. ✅ Мобильное приложение "Nearby"
4. ✅ Карта живой музыки (будущее)

**КАК работает:**
1. Venue включает трек в плеере
2. Backend обновляет `venue_playback_status`
3. Проверяется настройка `showCurrentlyPlaying`
4. Если `true` → публичный API возвращает данные
5. Посетители видят "🎵 Сейчас играет: Miles Davis - So What"

**ЗАЧЕМ это нужно:**
1. 🎯 Привлечение посетителей
2. 🎯 Показ музыкальной атмосферы
3. 🎯 Дифференциация от конкурентов
4. 🎯 Построение репутации

**Пример:**
```
Посетитель гуляет → Открывает приложение
→ Видит "Sunset Lounge: Miles Davis - So What"
→ "О, люблю джаз!"
→ Идет в бар! 🎉
```

**Это РЕАЛЬНАЯ фича многих сервисов:**
- Spotify: показывает что друзья слушают
- Apple Music: "Friends Are Listening To"
- Last.fm: публичная история
- Shazam: "Popular in your area"

**Теперь это есть в promo.music для venue!** 🎵✨

