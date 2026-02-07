# 🎸 CONCERTS FLOW DOCUMENTATION
## Полная схема логики, функций и связей раздела концертов

---

## 📊 АРХИТЕКТУРА ДАННЫХ

### 1. BACKEND (Supabase)

#### **Таблица базы данных**: `tour_dates`
```sql
CREATE TABLE tour_dates (
  id UUID PRIMARY KEY,
  artist_id UUID REFERENCES auth.users(id),
  title TEXT,
  description TEXT,
  tour_name TEXT,
  venue_name TEXT,
  venue_address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Россия',
  date DATE,
  doors_open TIME,
  show_start TIME,
  ticket_url TEXT,
  ticket_price_min NUMERIC,
  ticket_price_max NUMERIC,
  venue_capacity INTEGER,
  event_type TEXT DEFAULT 'Концерт',
  status TEXT DEFAULT 'draft', -- draft, published, cancelled
  moderation_status TEXT DEFAULT 'draft', -- draft, pending, approved, rejected
  banner_url TEXT,
  genre TEXT,
  is_promoted BOOLEAN DEFAULT false,
  promotion_expires_at TIMESTAMP,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **API Routes** (`/supabase/functions/server/concerts-routes.tsx`):
```
BASE URL: /make-server-84730125/api/concerts

├─ GET    /tour-dates              # Получить все концерты пользователя
├─ GET    /tour-dates/:id          # Получить один концерт
├─ POST   /tour-dates              # Создать новый концерт
├─ PUT    /tour-dates/:id          # Обновить концерт
├─ DELETE /tour-dates/:id          # Удалить концерт
├─ POST   /tour-dates/:id/submit   # Отправить на модерацию
└─ POST   /tour-dates/:id/promote  # Продвинуть концерт (is_promoted = true)

+ Performance History API:
├─ GET    /performance-history     # История выступлений
├─ POST   /performance-history     # Добавить выступление
├─ PUT    /performance-history/:id # Обновить выступление
└─ DELETE /performance-history/:id # Удалить выступление
```

**Авторизация**: 
- Все endpoints требуют `Authorization: Bearer {access_token}`
- Используется `verifyAuth()` для проверки пользователя
- Пользователь может управлять только своими концертами (`artist_id = user.id`)

---

## 🎯 FRONTEND АРХИТЕКТУРА

### 2. ТИПЫ ДАННЫХ

#### **Interface: PromotedConcert** (`/src/app/components/promoted-concerts-sidebar.tsx:6`)
```typescript
export interface PromotedConcert {
  id: number;
  title: string;
  date: string;           // ISO date format: '2026-07-15'
  time: string;           // Time format: '18:00'
  city: string;
  venue: string;
  type: string;           // 'Фестиваль', 'Акустический сет', 'DJ сет'
  description: string;
  banner: string;         // Image URL
  ticketPriceFrom: string;
  ticketPriceTo: string;
  ticketLink: string;
  views: number;
  clicks: number;
}
```

### 3. КОМПОНЕНТЫ

#### **A) PromotedConcertsSidebar** 
📂 `/src/app/components/promoted-concerts-sidebar.tsx`

**Назначение**: Карусель концертов в правом сайдбаре кабинета артиста

**Props**:
```typescript
interface PromotedConcertsSidebarProps {
  concerts: PromotedConcert[];
  onConcertClick?: (concertId: number) => void;
}
```

**Функционал**:
- ✅ Автоматическая ротация каждые 5 секунд
- ✅ Ручная навигация (стрелки prev/next)
- ✅ Индикаторы точек (dots) для навигации
- ✅ Pause on hover
- ✅ Glassmorphism дизайн
- ✅ Анимации через Motion

**State**:
```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [isAutoPlaying, setIsAutoPlaying] = useState(true);
```

**Auto-rotation Logic**:
```typescript
useEffect(() => {
  if (!isAutoPlaying) return;
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % concerts.length);
  }, 5000);
  return () => clearInterval(interval);
}, [isAutoPlaying, concerts.length]);
```

---

#### **B) HomePage - Grid секция**
📂 `/src/app/components/home-page.tsx:407`

**Назначение**: 3 карточки концертов в центральной части главной страницы кабинета

**Props**:
```typescript
interface HomePageProps {
  onNavigate: (section: string) => void;
  promotedConcerts?: PromotedConcert[];
  promotedNews?: NewsItem[];
}
```

**Отображение**:
```typescript
{promotedConcerts && promotedConcerts.length > 0 && (
  <motion.div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {promotedConcerts.slice(0, 3).map((concert, index) => (
        // Карточка концерта
      ))}
    </div>
  </motion.div>
)}
```

**Дизайн карточки**:
- 📸 Banner image с gradient overlay
- 📅 Date badge (правый верхний угол)
- 📍 Локация + время
- 📊 Статистика (views, clicks)
- ✨ Hover анимации

---

#### **C) SunoLayoutLanding - Карусель**
📂 `/src/app/components/landing/SunoLayoutLanding.tsx:873`

**Назначение**: Горизонтальная карусель концертов на публичной главной странице

**Data Source** (hardcoded):
```typescript
const upcomingConcerts = [
  { 
    id: '1', 
    title: 'Summer Music Fest 2026', 
    artist: 'Разные исполнители',
    date: '2026-07-15',
    time: '18:00',
    city: 'Москва', 
    venue: 'Olympic Stadium',
    price: 'от 2000 ₽',
    image: 'https://...',
    views: '15.4K'
  },
  // ... ещё 3 концерта
];
```

**Дизайн**:
- 🎨 Вертикальные карточки (aspect-ratio 4:5)
- 📱 Адаптивная ширина: 280px → 320px → 360px
- 🔄 Horizontal scroll с snap-x
- 🎯 Date badge + Views badge
- 💰 Цена с hover анимацией

**Расположение**: После секции "Новые клипы", скрыта на XL экранах (`xl:hidden`)

---

#### **D) ConcertsSection**
📂 `/src/app/components/landing/ConcertsSection.tsx:23`

**Назначение**: Полная страница концертов при клике на вкладку "Концерты"

**Data Source** (hardcoded):
```typescript
const upcomingConcerts: Concert[] = [
  { id: '1', title: 'Summer Music Fest 2026', ... },
  // ... список концертов
];
```

---

## 🔄 DATA FLOW (ТЕКУЩАЯ РЕАЛИЗАЦИЯ)

### **Путь 1: Кабинет артиста (ArtistApp → HomePage)**

```
┌─────────────────────┐
│  ArtistApp.tsx:52   │
│  promotedConcerts   │ ← HARDCODED данные (3 концерта)
│  = [ {...}, ... ]   │
└──────────┬──────────┘
           │
           ▼ Props передача
┌─────────────────────────────────────┐
│  HomePage.tsx:123                   │
│  <HomePage                          │
│    promotedConcerts={...}           │
│    onNavigate={setActiveSection}    │
│  />                                 │
└──────────┬──────────────────────────┘
           │
           ├──────────────┬──────────────┐
           ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐
    │ Grid секция │  │   Sidebar   │  │  Debug console   │
    │ .slice(0,3) │  │ <Promoted   │  │  useEffect log   │
    │  :407-502   │  │  Concerts   │  │     :91-92       │
    │             │  │  Sidebar/>  │  │                  │
    └─────────────┘  └─────────────┘  └──────────────────┘
```

### **Путь 2: Публичный лендинг (SunoLayoutLanding)**

```
┌──────────────────────────────┐
│  SunoLayoutLanding.tsx:116   │
│  upcomingConcerts            │ ← HARDCODED данные (4 концерта)
│  = [ {...}, ... ]            │
└──────────┬───────────────────┘
           │
           ▼ Прямое использование
┌──────────────────────────────┐
│  Карусель :873               │
│  {upcomingConcerts.map(...)} │
│                              │
│  - Horizontal scroll         │
│  - Snap navigation           │
│  - 4 вертикальные карточки   │
└──────────────────────────────┘
```

---

## 🚀 БУДУЩАЯ ИНТЕГРАЦИЯ С BACKEND

### **Необходимые изменения**:

#### 1. **Создать API hook**
📂 `/src/utils/api/concerts.ts`

```typescript
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface PromotedConcert {
  id: number;
  title: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  type: string;
  description: string;
  banner: string;
  ticketPriceFrom: string;
  ticketPriceTo: string;
  ticketLink: string;
  views: number;
  clicks: number;
}

// Получить promoted концерты (публичный endpoint)
export async function getPromotedConcerts(): Promise<PromotedConcert[]> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/concerts/promoted`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch promoted concerts');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching promoted concerts:', error);
    return DEMO_CONCERTS; // Fallback to demo data
  }
}

// Получить концерты пользователя (требует auth)
export async function getUserConcerts(accessToken: string) {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/concerts/tour-dates`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch user concerts');
  }
  
  return response.json();
}

// Demo data fallback
const DEMO_CONCERTS: PromotedConcert[] = [
  { id: 1, title: 'Summer Music Fest 2026', ... },
  { id: 2, title: 'Акустический вечер', ... },
  { id: 3, title: 'Electronic Paradise', ... },
];
```

#### 2. **Добавить backend endpoint для promoted концертов**
📂 `/supabase/functions/server/concerts-routes.tsx`

```typescript
// Get all promoted concerts (public, no auth required)
concertsRoutes.get('/promoted', async (c) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: concerts, error } = await supabase
      .from('tour_dates')
      .select('*')
      .eq('is_promoted', true)
      .gte('promotion_expires_at', new Date().toISOString())
      .eq('moderation_status', 'approved')
      .gte('date', new Date().toISOString()) // Only future concerts
      .order('date', { ascending: true })
      .limit(10);
    
    if (error) {
      console.error('Error fetching promoted concerts:', error);
      return c.json({ success: false, error: error.message }, 500);
    }
    
    // Transform to frontend format
    const transformed = concerts.map(concert => ({
      id: concert.id,
      title: concert.title,
      date: concert.date,
      time: concert.show_start,
      city: concert.city,
      venue: concert.venue_name,
      type: concert.event_type,
      description: concert.description,
      banner: concert.banner_url,
      ticketPriceFrom: concert.ticket_price_min?.toString() || '0',
      ticketPriceTo: concert.ticket_price_max?.toString() || '0',
      ticketLink: concert.ticket_url,
      views: concert.views || 0,
      clicks: concert.clicks || 0,
    }));
    
    return c.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error in GET /promoted:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});
```

#### 3. **Обновить ArtistApp.tsx**

```typescript
import { useEffect, useState } from 'react';
import { getPromotedConcerts } from '@/utils/api/concerts';

export function ArtistApp() {
  const [promotedConcerts, setPromotedConcerts] = useState<PromotedConcert[]>([]);
  
  useEffect(() => {
    // Load promoted concerts on mount
    const loadConcerts = async () => {
      const concerts = await getPromotedConcerts();
      setPromotedConcerts(concerts);
    };
    
    loadConcerts();
  }, []);
  
  // Rest of component...
}
```

#### 4. **Обновить SunoLayoutLanding.tsx**

```typescript
import { useEffect, useState } from 'react';
import { getPromotedConcerts } from '@/utils/api/concerts';

export function SunoLayoutLanding({ onLogin }: SunoLayoutLandingProps) {
  const [upcomingConcerts, setUpcomingConcerts] = useState([]);
  
  useEffect(() => {
    const loadConcerts = async () => {
      const concerts = await getPromotedConcerts();
      setUpcomingConcerts(concerts);
    };
    
    loadConcerts();
  }, []);
  
  // Rest of component...
}
```

---

## 📈 PROMOTION WORKFLOW

### **Как концерт становится "promoted":**

```
1. Артист создает концерт
   POST /tour-dates
   status: 'draft'
   moderation_status: 'draft'
   is_promoted: false

2. Артист отправляет на модерацию
   POST /tour-dates/:id/submit
   moderation_status: 'pending'

3. Модератор одобряет
   (Через admin panel)
   moderation_status: 'approved'
   status: 'published'

4. Артист оплачивает промо (коины)
   POST /tour-dates/:id/promote
   {
     days: 7  // Длительность промо
   }
   →
   is_promoted: true
   promotion_expires_at: NOW() + 7 days

5. Концерт появляется на главной
   GET /promoted
   WHERE is_promoted = true
     AND promotion_expires_at > NOW()
     AND moderation_status = 'approved'
```

---

## 🎨 ДИЗАЙН СИСТЕМЫ

### **Расположение концертов**:

1. **Кабинет артиста** (`/artist`):
   - ✅ Grid секция (3 карточки) - центр главной страницы
   - ✅ Sidebar карусель - правая колонка
   - ✅ Полная страница "Мои концерты" - отдельная вкладка

2. **Публичный лендинг** (`/`):
   - ✅ Карусель концертов - после секции "Новые клипы"
   - ✅ Страница "Концерты" - отдельная вкладка

3. **Радиостанция** (`/radio`):
   - ❌ Пока нет (можно добавить в будущем)

---

## 🔧 ТЕХНИЧЕСКИЕ ДЕТАЛИ

### **Анимации** (Motion):
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 1.3 }}
whileHover={{ scale: 1.02, y: -5 }}
```

### **Responsive breakpoints**:
- `xs`: 475px (mobile)
- `sm`: 640px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### **Цветовая палитра**:
- Primary: `#FF577F` (розовый)
- Secondary: `#3E4C5E` (темно-синий)
- Background: `bg-gradient-to-br from-[#FF577F]/20 to-[#3E4C5E]/20`

---

## 📝 CHECKLIST ДЛЯ ИНТЕГРАЦИИ

- [ ] Создать `/api/concerts/promoted` endpoint
- [ ] Создать `/utils/api/concerts.ts` hook
- [ ] Добавить useEffect в ArtistApp.tsx
- [ ] Добавить useEffect в SunoLayoutLanding.tsx
- [ ] Добавить loading states
- [ ] Добавить error handling
- [ ] Добавить fallback на demo data
- [ ] Тестировать с реальными данными
- [ ] Добавить аналитику (track clicks, views)
- [ ] Добавить фильтры (город, жанр, дата)

---

## 🎯 ВЫВОДЫ

**Текущее состояние**:
- ✅ UI полностью готов
- ✅ Backend API существует
- ❌ Frontend НЕ подключен к backend (hardcoded данные)

**Для полной интеграции нужно**:
1. Создать публичный endpoint `/promoted`
2. Добавить API hooks
3. Заменить hardcoded данные на async загрузку
4. Добавить обработку loading/error states

**Преимущества текущего подхода**:
- 🎨 Дизайн уже готов и протестирован
- 🔄 Легко переключиться с demo на реальные данные
- 🛡️ Fallback гарантирует работу даже если API недоступен
