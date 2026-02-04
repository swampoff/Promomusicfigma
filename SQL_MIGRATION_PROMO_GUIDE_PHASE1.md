# 🗄️ SQL MIGRATION - PROMO.GUIDE ФАЗА 1

## 📋 МИНИМАЛЬНЫЕ ИЗМЕНЕНИЯ

Для запуска Promo.Guide Фаза 1 нужно добавить **ВСЕГО 2 ПОЛЯ** в существующие таблицы.

---

## ✅ MIGRATION 1: venue_profiles

```sql
-- Добавить поля для публичности в Promo.Guide

ALTER TABLE venue_profiles 
  ADD COLUMN IF NOT EXISTS show_in_guide BOOLEAN DEFAULT false;

ALTER TABLE venue_profiles
  ADD COLUMN IF NOT EXISTS show_now_playing BOOLEAN DEFAULT false;

ALTER TABLE venue_profiles
  ADD COLUMN IF NOT EXISTS guide_tier TEXT DEFAULT 'basic';

-- Комментарии
COMMENT ON COLUMN venue_profiles.show_in_guide IS 
  'Показывать venue в публичном Promo.Guide (требует подписку Premium)';

COMMENT ON COLUMN venue_profiles.show_now_playing IS 
  'Показывать "сейчас играет" публично в Promo.Guide';

COMMENT ON COLUMN venue_profiles.guide_tier IS 
  'Тариф venue в Promo.Guide: basic, premium, enterprise';
```

### Пояснение:

- **show_in_guide**: Главный переключатель. `true` = venue попадает в публичный список Promo.Guide
- **show_now_playing**: Показывать ли "сейчас играет" публично (privacy setting)
- **guide_tier**: Тариф venue (для будущего: featured placement, top-1 и т.д.)

---

## ✅ MIGRATION 2: venue_playback_status

```sql
-- Добавить публичную видимость текущего трека

ALTER TABLE venue_playback_status
  ADD COLUMN IF NOT EXISTS public_visibility BOOLEAN DEFAULT false;

-- Комментарий
COMMENT ON COLUMN venue_playback_status.public_visibility IS 
  'Видимость текущего трека для публики (для Promo.Guide)';
```

### Пояснение:

- **public_visibility**: Можно ли показывать ЭТОТ трек публично? 
  - Venue может включить `show_now_playing = true`, но скрыть конкретные треки
  - Пример: venue играет коммерческую рекламу → `public_visibility = false`

---

## ✅ MIGRATION 3: venue_playback_history (опционально)

Эта таблица может уже существовать для внутренней аналитики.  
Если НЕТ - создаем для топ-треков:

```sql
-- История воспроизведения (для топ-5 треков недели)

CREATE TABLE IF NOT EXISTS venue_playback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE,
  track_id UUID,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_id UUID,
  album_name TEXT,
  cover_url TEXT,
  genre TEXT,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  play_count INTEGER DEFAULT 1,
  
  -- Indexes
  CONSTRAINT unique_venue_track UNIQUE(venue_id, track_id)
);

-- Index для быстрого поиска топ-треков
CREATE INDEX IF NOT EXISTS idx_playback_history_venue_played 
  ON venue_playback_history(venue_id, played_at DESC);

CREATE INDEX IF NOT EXISTS idx_playback_history_play_count 
  ON venue_playback_history(venue_id, play_count DESC);
```

### Пояснение:

- Записываем каждый трек который играл в venue
- `play_count` увеличивается если трек повторяется
- Используется для "Топ-5 треков недели" в Promo.Guide

---

## 🔧 ИСПОЛЬЗОВАНИЕ

### 1. Venue включает публичность:

```sql
-- Venue владелец в настройках VenueApp включает:

UPDATE venue_profiles 
SET 
  show_in_guide = true,
  show_now_playing = true,
  guide_tier = 'premium'
WHERE id = 'venue-uuid';
```

### 2. Когда трек начинает играть:

```sql
-- Backend обновляет playback_status:

UPDATE venue_playback_status
SET
  current_track_id = 'track-uuid',
  current_track_name = 'So What',
  current_artist = 'Miles Davis',
  current_cover_url = 'https://...',
  current_genre = 'Jazz',
  is_playing = true,
  public_visibility = true,  -- ← КЛЮЧЕВОЕ ПОЛЕ!
  started_at = NOW(),
  updated_at = NOW()
WHERE venue_id = 'venue-uuid';
```

### 3. Сохранить в историю:

```sql
-- Для статистики "топ треков"

INSERT INTO venue_playback_history (
  venue_id,
  track_id,
  track_name,
  artist_name,
  cover_url,
  genre,
  played_at
)
VALUES (
  'venue-uuid',
  'track-uuid',
  'So What',
  'Miles Davis',
  'https://...',
  'Jazz',
  NOW()
)
ON CONFLICT (venue_id, track_id) 
DO UPDATE SET 
  play_count = venue_playback_history.play_count + 1,
  played_at = NOW();
```

---

## 📊 ПРИМЕРЫ ЗАПРОСОВ

### Получить все venue для Promo.Guide:

```sql
SELECT 
  id,
  venue_name,
  type,
  address,
  city,
  lat,
  lng,
  genres,
  is_open,
  verified,
  show_in_guide,
  show_now_playing,
  guide_tier
FROM venue_profiles
WHERE show_in_guide = true
ORDER BY verified DESC, created_at DESC
LIMIT 50;
```

### Получить "сейчас играет" для venue:

```sql
SELECT
  vp.id as venue_id,
  vp.venue_name,
  vp.address,
  vp.city,
  vps.current_track_name,
  vps.current_artist,
  vps.current_cover_url,
  vps.current_genre,
  vps.started_at,
  vps.is_playing
FROM venue_profiles vp
JOIN venue_playback_status vps ON vp.id = vps.venue_id
WHERE 
  vp.show_in_guide = true
  AND vp.show_now_playing = true
  AND vps.is_playing = true
  AND vps.public_visibility = true
ORDER BY vps.started_at DESC;
```

### Топ-5 треков venue за неделю:

```sql
SELECT
  track_name,
  artist_name,
  cover_url,
  genre,
  SUM(play_count) as total_plays
FROM venue_playback_history
WHERE 
  venue_id = 'venue-uuid'
  AND played_at >= NOW() - INTERVAL '7 days'
GROUP BY track_name, artist_name, cover_url, genre
ORDER BY total_plays DESC
LIMIT 5;
```

---

## 🎯 ИТОГО: ИЗМЕНЕНИЯ

### Минимум для запуска Promo.Guide:

```
✅ venue_profiles: +3 поля (show_in_guide, show_now_playing, guide_tier)
✅ venue_playback_status: +1 поле (public_visibility)
✅ venue_playback_history: новая таблица (опционально)

= ВСЕГО 4 ПОЛЯ + 1 таблица!
```

### Таблицы которые УЖЕ должны существовать:

```
✅ venue_profiles (основная таблица venue)
✅ venue_playback_status (текущий статус проигрывания)
```

Если этих таблиц нет - их нужно создать отдельно (они часть venue system).

---

## 🚀 DEPLOYMENT

### Шаг 1: Выполнить migrations в Supabase Dashboard

1. Открыть Supabase Dashboard → SQL Editor
2. Скопировать SQL код выше
3. Выполнить

### Шаг 2: Проверить

```sql
-- Проверить что поля добавлены
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'venue_profiles'
  AND column_name IN ('show_in_guide', 'show_now_playing', 'guide_tier');

-- Должно вернуть 3 строки
```

### Шаг 3: Установить значения для тестирования

```sql
-- Включить публичность для 1-2 venue (для тестирования)
UPDATE venue_profiles 
SET 
  show_in_guide = true,
  show_now_playing = true,
  guide_tier = 'premium'
WHERE id IN (
  SELECT id FROM venue_profiles LIMIT 2
);
```

### Шаг 4: Проверить API

```bash
# Test endpoint
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/public/guide/venues

# Должно вернуть список venue
```

---

## ✅ ГОТОВО!

Backend API готов, SQL готов.  
Осталось только:
1. Выполнить migrations
2. Интегрировать frontend
3. Profit! 🚀

---

## 📝 NOTES

- Все поля имеют `DEFAULT false` - venue НЕ попадают в Guide автоматически
- Venue должен АКТИВНО включить `show_in_guide = true` (платная фича)
- `public_visibility` дает контроль на уровне треков (privacy)
- История нужна для статистики, но не критична для MVP

---

## 🔒 PRIVACY & SECURITY

### Важно:

- **Venue контролирует публичность** - может выключить в любой момент
- **Track-level privacy** - через `public_visibility`
- **No personal data** в публичных endpoints - только venue info и треки
- **Rate limiting** на публичных endpoints (TODO: добавить в будущем)

---

**Всё! Минимум для запуска. 🎯**
