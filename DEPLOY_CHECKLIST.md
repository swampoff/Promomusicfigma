# ✅ DEPLOY CHECKLIST - Готов ли проект к деплою?

## 🎯 БЫСТРАЯ ПРОВЕРКА

### ✅ Backend готов?
```
✅ /supabase/functions/server/promo-guide-routes.tsx - создан
✅ /supabase/functions/server/index.tsx - обновлен (import + route)
✅ Routes подключены правильно
✅ Endpoints: /make-server-84730125/public/guide/*
```

### ✅ Frontend готов?
```
✅ /src/app/PublicApp.tsx - создан
✅ /src/promo-guide/PromoGuideApp.phase1.tsx - создан
✅ /src/app/RootApp.tsx - обновлен
✅ Все импорты корректны
✅ Badge компонент существует (/src/app/components/ui/badge.tsx)
```

### ⚠️ SQL готов?
```
⏳ НУЖНО ВЫПОЛНИТЬ ВРУЧНУЮ В SUPABASE DASHBOARD!
   
   Файл: /SQL_MIGRATION_PROMO_GUIDE_PHASE1.md
   
   1. Открыть Supabase Dashboard
   2. SQL Editor
   3. Скопировать SQL из файла
   4. Выполнить
```

---

## 🚀 ДА, ТЫ МОЖЕШЬ ДЕПЛОИТЬ!

### Но СНАЧАЛА нужно:

### 1. ⚠️ ВЫПОЛНИТЬ SQL MIGRATIONS (КРИТИЧНО!)

```sql
-- В Supabase Dashboard → SQL Editor

-- 1. Venue profiles
ALTER TABLE venue_profiles 
  ADD COLUMN IF NOT EXISTS show_in_guide BOOLEAN DEFAULT false;

ALTER TABLE venue_profiles
  ADD COLUMN IF NOT EXISTS show_now_playing BOOLEAN DEFAULT false;

ALTER TABLE venue_profiles
  ADD COLUMN IF NOT EXISTS guide_tier TEXT DEFAULT 'basic';

-- 2. Venue playback status
ALTER TABLE venue_playback_status
  ADD COLUMN IF NOT EXISTS public_visibility BOOLEAN DEFAULT false;

-- 3. История (опционально, но рекомендуется)
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
  CONSTRAINT unique_venue_track UNIQUE(venue_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_playback_history_venue_played 
  ON venue_playback_history(venue_id, played_at DESC);

CREATE INDEX IF NOT EXISTS idx_playback_history_play_count 
  ON venue_playback_history(venue_id, play_count DESC);
```

### 2. ⚠️ ПРОВЕРИТЬ ЧТО ТАБЛИЦЫ СУЩЕСТВУЮТ

```sql
-- Проверка venue_profiles
SELECT * FROM venue_profiles LIMIT 1;

-- Проверка venue_playback_status
SELECT * FROM venue_playback_status LIMIT 1;

-- Если НЕТ этих таблиц → они должны быть созданы СНАЧАЛА!
-- Это таблицы из venue system, они должны уже существовать
```

### 3. ✅ ТЕСТОВЫЕ ДАННЫЕ (опционально)

```sql
-- Включить публичность для 2-3 venue (для тестирования)
UPDATE venue_profiles 
SET 
  show_in_guide = true,
  show_now_playing = true,
  guide_tier = 'premium'
WHERE id IN (
  SELECT id FROM venue_profiles LIMIT 3
);

-- Включить публичность текущего трека
UPDATE venue_playback_status
SET public_visibility = true
WHERE venue_id IN (
  SELECT id FROM venue_profiles WHERE show_in_guide = true
);
```

---

## 🔧 ПОСЛЕ ДЕПЛОЯ

### 1. Проверить Backend API:

```bash
# Замените YOUR_PROJECT_ID на реальный ID
PROJECT_URL="https://YOUR_PROJECT_ID.supabase.co"

# Test 1: Stats
curl "$PROJECT_URL/functions/v1/make-server-84730125/public/guide/stats"

# Expected: 
# {"success":true,"data":{"total_venues":3,"live_now":2,"cities":1}}

# Test 2: Venues list
curl "$PROJECT_URL/functions/v1/make-server-84730125/public/guide/venues"

# Expected:
# {"success":true,"data":[...venues array...],"meta":{...}}

# Test 3: Venue detail (замените VENUE_ID)
curl "$PROJECT_URL/functions/v1/make-server-84730125/public/guide/venues/VENUE_ID"

# Expected:
# {"success":true,"data":{...venue with now_playing...}}
```

### 2. Проверить Frontend:

1. Открыть приложение
2. Должна показаться **Landing Page** (не логин!)
3. Кликнуть "Открыть Promo.Guide"
4. Должен показаться список venue
5. Фильтры работают
6. Клик на venue → Detail page
7. "Построить маршрут" → Google Maps

### 3. Проверить роутинг:

```
✅ / → PublicApp (Landing)
✅ Клик "Войти" → UnifiedLogin
✅ После логина → Dashboard (Artist/Venue/Radio/Admin)
```

---

## ⚠️ ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ (ФАЗА 1)

### Backend использует mock данные из frontend:
```
⚠️ PromoGuideApp.phase1.tsx сейчас использует const mockVenues = [...]

ДО или ПОСЛЕ деплоя нужно:
1. Заменить mockVenues на реальный API fetch
2. См. /LAUNCH_CHECKLIST_PHASE1.md шаг 5
```

### Решение (после деплоя):

```typescript
// В /src/promo-guide/PromoGuideApp.phase1.tsx

// УДАЛИТЬ:
const mockVenues = [...];

// ДОБАВИТЬ:
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const [venues, setVenues] = useState<Venue[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchVenues();
}, []);

const fetchVenues = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-84730125/public/guide/venues`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    const data = await response.json();
    if (data.success) {
      setVenues(data.data);
    }
  } catch (error) {
    console.error('Error fetching venues:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 📊 ФАЙЛЫ СОЗДАННЫЕ/ОБНОВЛЕННЫЕ

### Backend (2 файла):
```
✅ /supabase/functions/server/promo-guide-routes.tsx (новый)
✅ /supabase/functions/server/index.tsx (обновлен)
```

### Frontend (3 файла):
```
✅ /src/app/PublicApp.tsx (новый)
✅ /src/promo-guide/PromoGuideApp.phase1.tsx (новый)
✅ /src/app/RootApp.tsx (обновлен)
```

### Документация (5 файлов):
```
✅ /PHASED_ROADMAP.md
✅ /SQL_MIGRATION_PROMO_GUIDE_PHASE1.md
✅ /LAUNCH_CHECKLIST_PHASE1.md
✅ /INTEGRATION_COMPLETE.md
✅ /PROMO_ECOSYSTEM_ARCHITECTURE.md
✅ /DEPLOY_CHECKLIST.md (этот файл)
```

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ

```
□ SQL migrations выполнены в Supabase Dashboard
□ Таблицы venue_profiles и venue_playback_status существуют
□ Добавлены поля show_in_guide, show_now_playing, guide_tier, public_visibility
□ Тестовые данные созданы (2-3 venue с show_in_guide = true)
□ Backend API протестирован (curl или Postman)
□ Frontend собирается без ошибок
□ Роутинг работает (public → login → dashboard)
```

---

## 🎉 ГОТОВ К ДЕПЛОЮ?

### Если ВСЕ чекбоксы ✅:

```bash
# ДА! ДЕПЛОЙ!
git add .
git commit -m "feat: Promo.Guide Phase 1 - Public venue directory with now playing"
git push

# Backend деплоится автоматически (Supabase Edge Functions)
# Frontend деплоится автоматически (Vercel/Netlify/etc)
```

### Если НЕТ SQL migrations:

```
⚠️ СТОП! Сначала SQL!

1. Открыть Supabase Dashboard
2. SQL Editor
3. Скопировать из /SQL_MIGRATION_PROMO_GUIDE_PHASE1.md
4. Выполнить
5. ПОТОМ деплоить
```

---

## 🔧 TROUBLESHOOTING

### Ошибка: "Table venue_profiles does not exist"
```
Решение: 
1. Таблица должна быть создана заранее (часть venue system)
2. Если нет - создать venue_profiles сначала
3. См. venue-routes.tsx для структуры таблицы
```

### Ошибка: "Route not found: /public/guide/venues"
```
Решение:
1. Проверить что promo-guide-routes.tsx импортирован в index.tsx
2. Проверить что route добавлен: app.route("/make-server-84730125", promoGuideRoutes)
3. Перезапустить backend
```

### Ошибка: "Cannot find module badge"
```
Решение:
1. Badge компонент существует в /src/app/components/ui/badge.tsx
2. Проверить импорт: import { Badge } from '@/app/components/ui/badge'
3. Если нет - создать простой Badge компонент
```

### Frontend показывает пустой список venue
```
Решение:
1. Проверить что есть venue с show_in_guide = true в БД
2. Проверить console.log в браузере
3. Проверить Network tab (есть ли запрос к API)
4. Проверить что mockVenues заменен на реальный fetch
```

---

## 📞 ФИНАЛЬНЫЕ ПРОВЕРКИ

### Backend:
```bash
✅ curl https://PROJECT.supabase.co/functions/v1/make-server-84730125/public/guide/stats
✅ Возвращает JSON с total_venues, live_now, cities
```

### Frontend:
```bash
✅ npm run build (без ошибок)
✅ Открыть localhost:3000 (или prod URL)
✅ Видно Landing Page
✅ Клик "Открыть Promo.Guide" → показывается список
```

### SQL:
```sql
✅ SELECT COUNT(*) FROM venue_profiles WHERE show_in_guide = true;
✅ Должно вернуть > 0
```

---

## 🚀 ИТОГО

### ДА, ТЫ МОЖЕШЬ ДЕПЛОИТЬ!

### НО СНАЧАЛА:
1. ⚠️ **SQL migrations** (5 минут)
2. ⚠️ **Тестовые данные** (2 минуты)
3. ✅ **Проверка API** (2 минуты)
4. ✅ **Деплой!** 🎉

---

**Общее время до деплоя: 10-15 минут**

**После деплоя:**
- Заменить mock данные на реальный API
- Добавить настройку в VenueApp
- Начать продажи! 💰

**УДАЧИ!** 🚀
