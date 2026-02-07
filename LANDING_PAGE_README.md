# 🎵 Promo.Music - Новая Landing Page

## 📋 Обзор

Создана современная landing page для **promo.music** в стиле glassmorphism с темным фоном, полной адаптивностью (320px → 4K+) и интеграцией с Supabase для реальных данных.

## 🎨 Структура страницы

### 1. **Hero Section** 
- Главная секция с анимированными gradient orbs
- Динамический heading с gradient текстом "Promo.Music"
- CTA кнопки: "Начать бесплатно" и "Войти в кабинет"
- Статистика: 4 радиостанции, 1000+ треков, 24/7 мониторинг
- **Файл:** `/src/app/components/landing/HeroSection.tsx`

### 2. **TOP 20 Charts Section**
- Данные из таблицы `radio_charts` (Supabase)
- Фильтр по радиостанциям:
  - Все радио
  - Русское Радио 🇷🇺
  - Maximum 🎸
  - Наше Радио 🎤
  - DFM 🎧
- Индикаторы позиций: ⬆️ вверх, ⬇️ вниз, — без изменений, NEW
- Hover эффекты с glassmorphism
- **Файл:** `/src/app/components/landing/TopChartsSection.tsx`

### 3. **New Releases Section**
- Данные из таблицы `tracks` (status = 'published')
- Grid адаптация: 2 → 3 → 4 → 6 колонок
- Cover изображения с hover overlay
- Badge "NEW" на каждом релизе
- Информация о жанре и дате релиза
- **Файл:** `/src/app/components/landing/NewReleasesSection.tsx`

### 4. **Trending Section**
- Популярные треки с trend score
- Фильтр по времени: Сегодня / Неделя / Месяц
- Метрики: plays count, source радиостанции
- Действия: Play, Like, Share
- **Файл:** `/src/app/components/landing/TrendingSection.tsx`

### 5. **Features Section**
- 6 ключевых возможностей платформы:
  - 📻 Мониторинг радиостанций
  - 📊 Аналитика ротаций
  - 🎯 Таргетированные кампании
  - 💎 AI-агент контента
  - 💰 Монетизация
  - 🚀 Enterprise уровень

### 6. **Final CTA Section**
- Призыв к действию с анимированными orbs
- Trust indicators (4 радио, 24/7, Real-time)

### 7. **Global Player** (опционально)
- Плеер внизу экрана для preview треков
- Controls: Play/Pause, Skip, Volume, Progress bar
- Адаптивный: полный функционал на desktop, упрощенный на mobile
- **Файл:** `/src/app/components/landing/GlobalPlayer.tsx`

## 📁 Файловая структура

```
/src/app/components/landing/
├── HeroSection.tsx           # Hero секция
├── TopChartsSection.tsx      # TOP 20 чарты
├── NewReleasesSection.tsx    # Новинки
├── TrendingSection.tsx       # Trending треки
├── MainLandingPage.tsx       # Главный компонент (собирает всё)
├── GlobalPlayer.tsx          # Плеер внизу экрана
└── index.ts                  # Exports
```

## 🔌 Интеграция с Supabase

### Таблицы используемые:

1. **`radio_charts`** - чарты радиостанций
   - Поля: `source`, `chart_date`, `position`, `track_title`, `artist_name`, `previous_position`, `weeks_in_chart`
   - Используется в: TopChartsSection, TrendingSection

2. **`tracks`** - треки музыкантов
   - Поля: `title`, `artist`, `cover_url`, `genre`, `release_date`, `status`
   - Фильтр: `status = 'published'`
   - Используется в: NewReleasesSection

### Подключение:
```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
```

## 📱 Адаптивность

### Breakpoints:
- **xs:** 475px (кастомный breakpoint для маленьких смартфонов)
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

### Адаптивные изменения:

**Text размеры:**
```tsx
text-5xl xs:text-6xl md:text-7xl lg:text-8xl
```

**Grid колонки:**
```tsx
grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
```

**Flex направление:**
```tsx
flex-col xs:flex-row
```

**Скрытие элементов:**
```tsx
hidden md:block  // показывать только на md+
```

## 🎨 Стиль и дизайн

### Цветовая палитра:
- **Primary:** Purple 600 → Pink 600 (gradient)
- **Secondary:** Blue 600 → Cyan 600
- **Background:** Slate 950 (темный)
- **Overlay:** White/5, White/10 (glassmorphism)
- **Border:** White/10, White/20

### Glassmorphism эффекты:
```tsx
bg-white/5 backdrop-blur-xl border border-white/10
```

### Анимации (Motion):
```tsx
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
```

## 🚀 Использование

### В PublicApp.tsx:
```tsx
import { MainLandingPage } from '@/app/components/landing/MainLandingPage';

<MainLandingPage onLogin={onLoginClick} />
```

### С плеером (опционально):
```tsx
import { GlobalPlayer } from '@/app/components/landing/GlobalPlayer';

const [currentTrack, setCurrentTrack] = useState(null);

<GlobalPlayer 
  track={currentTrack} 
  onClose={() => setCurrentTrack(null)} 
/>
```

## 🔄 Изменения в PublicApp.tsx

### Удалено:
- ❌ Promo.Guide страница (отдельная платформа)
- ❌ Promo.Air упоминания (отдельная платформа)
- ❌ Старый LandingPage компонент с концепцией "открывай заведения"

### Добавлено:
- ✅ MainLandingPage компонент
- ✅ Упрощенная навигация: Главная / О платформе
- ✅ Обновленный header без лишних пунктов меню

## 📊 Данные и загрузка

### Loading states:
Все секции имеют красивые loading состояния:
```tsx
<div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
<p className="text-slate-400 mt-4">Загрузка...</p>
```

### Empty states:
При отсутствии данных показываются placeholder сообщения:
```tsx
<Music2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
<p className="text-slate-400">Новинки скоро появятся</p>
```

## 🎯 Следующие шаги (опционально)

1. **Добавить реальные audio URL** в таблицу tracks для плеера
2. **Реализовать систему лайков** (сохранять в Supabase)
3. **Добавить шаринг** в соцсети
4. **Создать детальную страницу трека** при клике
5. **Добавить поиск** по трекам и артистам
6. **Реализовать плейлисты** пользователей

## ✅ Готовность к production

- ✅ Полная адаптивность (320px → 4K+)
- ✅ Glassmorphism дизайн
- ✅ Real-time данные из Supabase
- ✅ Оптимизированные изображения
- ✅ Плавные анимации (Motion)
- ✅ Loading и Empty states
- ✅ SEO-friendly структура
- ✅ Accessibility (keyboard navigation)

---

**Создано:** 6 февраля 2026  
**Версия:** 1.0.0  
**Платформа:** Promo.Music  
**Технологии:** React, TypeScript, Tailwind CSS v4, Motion, Supabase
