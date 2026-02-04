# 🎯 PROMO.MUSIC ECOSYSTEM ARCHITECTURE

## 🌍 ТРИ УРОВНЯ ЭКОСИСТЕМЫ

```
┌─────────────────────────────────────────────────────────┐
│                    PROMO.MUSIC                          │
│                   (Root Platform)                       │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PROMO.AIR    │  │  PROMO.MUSIC  │  │ PROMO.GUIDE   │
│   (B2B)       │  │   (B2C)       │  │  (PUBLIC)     │
│               │  │               │  │               │
│ Venue Cabinet │  │ Artist Cabinet│  │  Открытая     │
│ Radio Cabinet │  │ Curators      │  │  платформа    │
│               │  │               │  │  для всех     │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 1️⃣ PROMO.AIR - B2B Двигатель 💼

### Описание:
Премиальный сервис "Аудио-Консьерж" для бизнеса

### Компоненты:
```
/src/venue/VenueApp.tsx     - Кабинет заведений
/src/radio/RadioApp.tsx     - Кабинет радиостанций
```

### Функционал:
- ✅ Управление плейлистами
- ✅ Радиослоты и реклама
- ✅ Аналитика прослушиваний
- ✅ Профиль заведения
- ✅ Финансовая система (85%/15%)
- ✅ **Now Playing публичность**

### Тарифы:
```
Basic:      $99/мес
Premium:    $299/мес  (Promo.Guide featured)
Enterprise: $999/мес  (Promo.Guide top-1)
```

### Роль:
**Генерировать стабильный cash flow для финансирования экосистемы**

---

## 2️⃣ PROMO.MUSIC - B2C Платформа 🎤

### Описание:
Платформа для артистов с системой кураторов

### Компоненты:
```
/src/app/ArtistApp.tsx      - Кабинет артистов
/src/curators/              - Система кураторов (Пабло, Джет, Кэт)
```

### Функционал:
- ✅ Загрузка треков
- ✅ Система кураторов (отбор для ротации)
- ✅ Аналитика: "где играет мой трек"
- ✅ Тарифные планы
- ✅ **Promo.Guide интеграция**

### Тарифы:
```
Free:  $0      - Загрузка, но НЕ попадает в ротацию
Pro:   $29/мес - Приоритет у кураторов, уведомления "играет в venue"
Elite: $99/мес - Гарантия ротации 5+ venue, аналитика
```

### Роль:
**Создать эксклюзивный каталог живых артистов, который невозможно скопировать**

---

## 3️⃣ PROMO.GUIDE - Публичная Платформа 🌍

### Описание:
Публичная "карта" музыки в заведениях + социальная сеть меломанов

### Компоненты:
```
/src/promo-guide/
├─ PromoGuideApp.tsx           - Главная страница
├─ components/
│  ├─ PromoCodeCard.tsx        - QR-коды со скидкой
│  └─ WhoIsHere.tsx            - Социальный слой
```

### Функционал:
- ✅ Карта заведений
- ✅ "Сейчас играет" real-time
- ✅ QR-коды со скидкой
- ✅ **Социальный слой** (кто здесь, знакомства)
- ✅ Геймификация (уровни, бейджи)
- ✅ Promo Credits
- ✅ Music Meetups

### Доступ:
**БЕЗ РЕГИСТРАЦИИ** - публичная платформа для всех

### Роль:
**Создать сетевой эффект: venue ↔ артисты ↔ посетители**

---

## 🔄 КАК ОНИ СВЯЗАНЫ

### Поток данных:

```
┌──────────────────────────────────────────────────────┐
│  1. VENUE (Promo.Air) загружает трек в плейлист      │
│     или подключает радиостанцию                      │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  2. Трек начинает играть                             │
│     venue_playback_status.public_visibility = true   │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  3. PROMO.GUIDE показывает публично:                 │
│     "В Sunset Lounge сейчас: Miles Davis"            │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  4. АРТИСТ (Promo.Music) видит:                      │
│     "Мой трек играет в Sunset Lounge!"               │
│     → Делится в Instagram                            │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  5. ПОСЕТИТЕЛЬ видит в Promo.Guide:                  │
│     → Получает QR-код 15% скидки                     │
│     → Видит "кто здесь" (94% совпадение!)            │
│     → Приходит в venue → Знакомится                  │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│  6. VENUE видит ROI:                                 │
│     "47 клиентов через Promo.Guide"                  │
│     "Доход $2,350"                                   │
│     → Апгрейдится до Premium!                        │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
              🔄 СЕТЕВОЙ ЭФФЕКТ! 🔄
```

---

## 🏗️ ТЕКУЩАЯ АРХИТЕКТУРА (КАК ЕСТЬ)

### Файловая структура:

```
/src/
├─ app/
│  ├─ RootApp.tsx                  ✅ Главный роутинг
│  ├─ ArtistApp.tsx                ✅ Promo.Music (B2C)
│  └─ components/
│     └─ unified-login/            ✅ Единый логин
│
├─ venue/
│  ├─ VenueApp.tsx                 ✅ Promo.Air (B2B Venue)
│  ├─ components/
│  │  ├─ venue-profile/            ✅ Профиль заведения
│  │  ├─ analytics/                ✅ Аналитика venue
│  │  └─ settings/                 ✅ Настройки (public_visibility!)
│  └─ api/                         ✅ API endpoints
│
├─ radio/
│  ├─ RadioApp.tsx                 ✅ Promo.Air (B2B Radio)
│  ├─ components/
│  │  ├─ ad-slots/                 ✅ Рекламные слоты
│  │  └─ analytics/                ✅ Аналитика radio
│  └─ api/                         ✅ API endpoints
│
├─ admin/
│  └─ AdminApp.tsx                 ✅ Админка
│
└─ promo-guide/                    ⚠️ НЕ ИНТЕГРИРОВАНО!
   ├─ PromoGuideApp.tsx            ✅ Создано
   └─ components/
      ├─ PromoCodeCard.tsx         ✅ Создано
      └─ WhoIsHere.tsx             ✅ Создано
```

---

## 🚀 ЧТО НУЖНО СДЕЛАТЬ

### Задача 1: Интегрировать Promo.Guide в RootApp

```typescript
// /src/app/RootApp.tsx

export default function App() {
  const [view, setView] = useState<'public' | 'dashboard'>('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Если не залогинен - показываем Promo.Guide (публичный)
  if (!isAuthenticated) {
    return (
      <PublicApp onLoginClick={() => setView('dashboard')} />
    );
  }
  
  // Если залогинен - показываем кабинет по роли
  return (
    <AuthenticatedApp userRole={userRole} />
  );
}
```

### Задача 2: Создать PublicApp (обертка для Promo.Guide)

```typescript
// /src/app/PublicApp.tsx

export function PublicApp({ onLoginClick }) {
  const [currentPage, setCurrentPage] = useState<'guide' | 'about'>('guide');
  
  return (
    <div>
      {/* Header с навигацией */}
      <PublicHeader 
        onLoginClick={onLoginClick}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      {/* Content */}
      {currentPage === 'guide' && <PromoGuideApp />}
      {currentPage === 'about' && <AboutPage />}
    </div>
  );
}
```

### Задача 3: Добавить навигацию между разделами

```typescript
// Внутри кабинетов venue/artist добавить ссылку на Promo.Guide

// /src/venue/VenueApp.tsx
<Navigation>
  <NavItem href="/profile">Профиль</NavItem>
  <NavItem href="/analytics">Аналитика</NavItem>
  <NavItem href="/promo-guide" target="_blank">
    🌍 Открыть Promo.Guide
  </NavItem>
</Navigation>
```

---

## 📊 ЕДИНАЯ SQL СТРУКТУРА

### Ключевые таблицы для связи:

```sql
-- 1. Venue Profiles (Promo.Air → Promo.Guide)
CREATE TABLE venue_profiles (
  id UUID PRIMARY KEY,
  venue_name TEXT,
  type TEXT,
  address TEXT,
  city TEXT,
  lat DECIMAL,
  lng DECIMAL,
  
  -- Promo.Guide settings
  show_in_guide BOOLEAN DEFAULT false,        -- Показывать в Promo.Guide
  show_now_playing BOOLEAN DEFAULT false,     -- Показывать "сейчас играет"
  guide_tier TEXT DEFAULT 'basic',            -- 'basic', 'premium', 'enterprise'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Playback Status (связь Promo.Air → Promo.Guide)
CREATE TABLE venue_playback_status (
  venue_id UUID REFERENCES venue_profiles(id),
  current_track_id UUID,
  current_track_name TEXT,
  current_artist TEXT,
  current_cover_url TEXT,
  is_playing BOOLEAN DEFAULT false,
  
  -- КЛЮЧЕВОЕ ПОЛЕ для Promo.Guide!
  public_visibility BOOLEAN DEFAULT false,
  
  started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Artists (Promo.Music → Promo.Guide)
CREATE TABLE artists (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'elite'
  
  -- Promo.Guide notifications
  notify_when_playing BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tracks (Promo.Music → Promo.Guide)
CREATE TABLE tracks (
  id UUID PRIMARY KEY,
  artist_id UUID REFERENCES artists(id),
  title TEXT,
  genre TEXT,
  cover_url TEXT,
  curator_approved BOOLEAN DEFAULT false,  -- Одобрено куратором
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Now Playing History (для артистов)
CREATE TABLE track_plays_in_venues (
  id UUID PRIMARY KEY,
  track_id UUID REFERENCES tracks(id),
  artist_id UUID REFERENCES artists(id),
  venue_id UUID REFERENCES venue_profiles(id),
  played_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  public BOOLEAN DEFAULT false -- Было видно в Promo.Guide?
);

-- 6. Promo.Guide User Checkins (социальный слой)
CREATE TABLE venue_checkins (
  id UUID PRIMARY KEY,
  user_id UUID,
  venue_id UUID REFERENCES venue_profiles(id),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  visible BOOLEAN DEFAULT true,
  location_in_venue TEXT
);

-- 7. QR Codes (loyalty system)
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE,
  user_id UUID,
  venue_id UUID REFERENCES venue_profiles(id),
  discount_percent INTEGER DEFAULT 15,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎯 БИЗНЕС-МОДЕЛЬ (Win-Win-Win)

### Для Venue (Promo.Air):

```
Basic Tier ($99/мес):
✅ Музыка для заведения
✅ Базовая аналитика
❌ НЕ попадает в Promo.Guide

Premium Tier ($299/мес):
✅ Все из Basic
✅ Попадание в Promo.Guide
✅ "Сейчас играет" публично
✅ Значок "Featured" ⭐
✅ QR-коды со скидкой для клиентов
✅ ROI аналитика: "47 клиентов через Promo.Guide"

Enterprise Tier ($999/мес):
✅ Все из Premium
✅ TOP-1 в категории
✅ Персональная страница
✅ API доступ
```

### Для Артистов (Promo.Music):

```
Free:
✅ Загрузка треков
❌ НЕ попадает в ротацию venue
❌ НЕ видно в Promo.Guide

Pro ($29/мес):
✅ Приоритет у кураторов
✅ Попадание в ротацию venue
✅ Уведомления "трек играет в venue X"
✅ Видно в Promo.Guide

Elite ($99/мес):
✅ Все из Pro
✅ Гарантия ротации 5+ venue
✅ Аналитика venue где музыка "заходит"
✅ "Артист дня" возможность (доля от продаж)
```

### Для Посетителей (Promo.Guide):

```
БЕСПЛАТНО!
✅ Открытие заведений через музыку
✅ QR-коды со скидкой 15%
✅ Социальный слой (знакомства)
✅ Геймификация (уровни, бейджи)
✅ Promo Credits (внутренняя валюта)

Цель: Привлечь массовую аудиторию → конвертация в venue посещения
```

---

## 💎 СЕТЕВОЙ ЭФФЕКТ

```
Больше venue на Promo.Air
        ↓
Больше треков в ротации
        ↓
Привлекательнее для артистов (Promo.Music)
        ↓
Больше артистов загружают треки
        ↓
Качественнее музыка
        ↓
Больше venue хотят нашу музыку
        ↓
Больше venue в Promo.Guide
        ↓
Привлекательнее для посетителей
        ↓
Больше посетителей приходят через Promo.Guide
        ↓
Venue видят ROI → апгрейд до Premium
        ↓
    🔄 EXPONENTIAL LOOP! 🔄
```

---

## 🚀 ПЛАН ИНТЕГРАЦИИ

### Фаза 1: Публичный доступ к Promo.Guide (1 неделя)

```
✅ Создать /src/app/PublicApp.tsx
✅ Создать навигацию публичную
✅ Интегрировать PromoGuideApp
✅ Добавить ссылки из venue/artist кабинетов
✅ Deploy на поддомен guide.promo.music
```

### Фаза 2: Backend API (2 недели)

```
✅ GET /api/public/guide/venues
✅ GET /api/public/guide/venues/:id
✅ GET /api/public/guide/live-feed
✅ POST /api/promo-guide/generate-qr
✅ POST /api/venue/scan-qr
✅ WebSocket /ws/venue-chat/:venueId
```

### Фаза 3: Социальный слой (2 недели)

```
✅ Чекины в venue
✅ "Кто здесь сейчас"
✅ Музыкальное совпадение
✅ "Предложить выпить"
✅ Venue Chat
```

### Фаза 4: Геймификация (1 неделя)

```
✅ Уровни (1-4)
✅ Бейджи
✅ Promo Credits
✅ Реферальная программа
```

---

## 📄 РЕЗЮМЕ

### ✅ ЧТО УЖЕ ЕСТЬ:

1. **Promo.Air (B2B)**
   - ✅ Venue кабинет
   - ✅ Radio кабинет
   - ✅ Аналитика
   - ✅ Профиль заведения
   - ✅ Настройка public_visibility

2. **Promo.Music (B2C)**
   - ✅ Artist кабинет
   - ✅ Система кураторов
   - ✅ Загрузка треков
   - ✅ Тарифы

3. **Инфраструктура**
   - ✅ SQL структура (16 таблиц venue, 5 таблиц radio)
   - ✅ API endpoints
   - ✅ Единый логин
   - ✅ Роли: artist, venue, radio_station, admin

### ⚠️ ЧТО НУЖНО ДОДЕЛАТЬ:

1. **Promo.Guide (PUBLIC)**
   - ✅ Компоненты созданы
   - ❌ НЕ интегрировано в RootApp
   - ❌ Нет публичного доступа
   - ❌ Нет навигации
   - ❌ Нет backend API

2. **Связь между разделами**
   - ❌ Venue не знает про Promo.Guide
   - ❌ Artist не видит где играет
   - ❌ Нет публичного endpoint

---

## 🎯 СЛЕДУЮЩИЙ ШАГ:

**Создать PublicApp и интегрировать Promo.Guide правильно?**

Я могу:
1. Создать `/src/app/PublicApp.tsx`
2. Обновить `/src/app/RootApp.tsx` для роутинга
3. Добавить навигацию между разделами
4. Создать публичный header
5. Настроить правильный flow

**Делаем?** 🚀
