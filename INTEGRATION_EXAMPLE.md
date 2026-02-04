# Интеграция AI-контента на главную страницу

## Обзор

Система AI-агента создаёт два типа контента для главной страницы:
- **Чарты радиостанций** - компонент `WeeklyCharts`
- **Новости индустрии** - компонент `AIGeneratedNews`

## Быстрая интеграция

### Вариант 1: В существующую PublicApp

Откройте `/src/app/PublicApp.tsx` и добавьте компоненты:

```typescript
import { WeeklyCharts } from '@/public/components/WeeklyCharts';
import { AIGeneratedNews } from '@/public/components/AIGeneratedNews';

export function PublicApp({ onLoginClick }: PublicAppProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Существующий контент */}
      <PromoGuideHero />
      <FeaturedTracks />
      
      {/* НОВОЕ: AI-генерированные чарты */}
      <WeeklyCharts />
      
      {/* НОВОЕ: AI-генерированные новости */}
      <AIGeneratedNews />
      
      {/* Остальной контент */}
      <Footer />
    </div>
  );
}
```

### Вариант 2: Отдельная страница

Создайте новую страницу для чартов и новостей:

```typescript
// /src/public/pages/TrendsPage.tsx
import { WeeklyCharts } from '@/public/components/WeeklyCharts';
import { AIGeneratedNews } from '@/public/components/AIGeneratedNews';

export function TrendsPage() {
  return (
    <div className="min-h-screen bg-black">
      <WeeklyCharts />
      <AIGeneratedNews />
    </div>
  );
}
```

## Компоненты

### WeeklyCharts

**Функционал:**
- Отображает топ-10 треков с 4 радиостанций
- Переключение между радиостанциями
- Показывает изменение позиций (↑↓)
- Количество недель в чарте
- Автообновление данных

**Props:**
Компонент не требует props, работает автономно.

**Пример использования:**
```typescript
import { WeeklyCharts } from '@/public/components/WeeklyCharts';

<WeeklyCharts />
```

**Кастомизация:**
```typescript
// Если хотите показать только конкретную радиостанцию
<WeeklyCharts defaultSource="russkoe-radio" />

// Компактный вид (только топ-5)
<WeeklyCharts compact limit={5} />
```

### AIGeneratedNews

**Функционал:**
- Отображает опубликованные новости
- Модальное окно для чтения статьи
- Автоформатирование дат ("Сегодня", "Вчера", "3 дня назад")
- Адаптивная сетка (1/2/3 колонки)

**Props:**
Компонент не требует props, работает автономно.

**Пример использования:**
```typescript
import { AIGeneratedNews } from '@/public/components/AIGeneratedNews';

<AIGeneratedNews />
```

**Кастомизация:**
```typescript
// Показать только последние N статей
<AIGeneratedNews limit={6} />

// Горизонтальный слайдер вместо сетки
<AIGeneratedNews layout="slider" />
```

## Стилизация

Оба компонента используют glassmorphism стиль, соответствующий дизайну promo.music:
- `bg-white/10` - полупрозрачный фон
- `backdrop-blur-xl` - размытие
- `border border-white/20` - тонкая граница
- Градиенты purple → pink для акцентов

### Изменение цветовой схемы

Если хотите изменить цвета, отредактируйте компоненты:

```typescript
// Было:
className="bg-gradient-to-r from-purple-500 to-pink-500"

// Стало (например, синий):
className="bg-gradient-to-r from-blue-500 to-cyan-500"
```

## API интеграция

### Получение данных

Компоненты автоматически получают данные от AI-агента через API:

```typescript
// WeeklyCharts
GET /make-server-84730125/api/ai-agent/charts/latest

// AIGeneratedNews (в продакшене)
GET /make-server-84730125/api/ai-agent/news/published
```

### Кеширование

Для оптимизации добавьте кеширование:

```typescript
// В WeeklyCharts.tsx
const CACHE_KEY = 'weekly_charts';
const CACHE_TIME = 3600000; // 1 час

useEffect(() => {
  const cached = localStorage.getItem(CACHE_KEY);
  const cacheTime = localStorage.getItem(CACHE_KEY + '_time');
  
  if (cached && cacheTime && Date.now() - Number(cacheTime) < CACHE_TIME) {
    setCharts(JSON.parse(cached));
    setLoading(false);
    return;
  }
  
  fetchCharts();
}, []);

const fetchCharts = async () => {
  // ... fetch logic
  localStorage.setItem(CACHE_KEY, JSON.stringify(data.charts));
  localStorage.setItem(CACHE_KEY + '_time', String(Date.now()));
};
```

## SEO оптимизация

Для лучшего SEO добавьте метаданные:

```typescript
// В head секции
<meta property="og:title" content="Топ-10 треков недели | PROMO.MUSIC" />
<meta property="og:description" content="Актуальные чарты российских радиостанций, собранные AI-агентом" />
<meta property="og:image" content="https://promo.music/og-charts.jpg" />

// Structured data
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": "Топ-10 Русское Радио",
  "description": "Актуальный чарт радиостанции",
  "numTracks": 10,
  "track": [...]
}
</script>
```

## Analytics

Добавьте отслеживание взаимодействий:

```typescript
// В WeeklyCharts.tsx
const handleRadioClick = (source: string) => {
  setSelectedSource(source);
  
  // Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'chart_view', {
      radio_station: source,
    });
  }
};

// В AIGeneratedNews.tsx
const handleArticleClick = (articleId: string) => {
  setSelectedArticle(article);
  
  // Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'article_read', {
      article_id: articleId,
    });
  }
};
```

## Loading States

Компоненты имеют встроенные загрузочные состояния:

```typescript
{loading && (
  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
)}
```

### Кастомный loader

Замените на свой:

```typescript
{loading && (
  <div className="flex flex-col items-center gap-4">
    <YourCustomLoader />
    <p className="text-gray-400">Загружаем чарты...</p>
  </div>
)}
```

## Error Handling

Добавьте обработку ошибок:

```typescript
const [error, setError] = useState<string | null>(null);

const fetchCharts = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Failed to fetch charts');
    }
    
    // ... остальная логика
  } catch (err) {
    console.error('Error:', err);
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};

// В рендере
{error && (
  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
    <p className="text-red-400">Ошибка загрузки: {error}</p>
    <button onClick={fetchCharts} className="text-red-300 underline">
      Попробовать снова
    </button>
  </div>
)}
```

## Mobile Optimization

Компоненты адаптивны out-of-the-box, но можете улучшить:

```typescript
// Horizontal scroll для радиостанций на мобильных
<div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
  {charts.map(chart => (
    <button className="flex-shrink-0 snap-start">
      {/* ... */}
    </button>
  ))}
</div>

// CSS для скрытия scrollbar
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

## Performance

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const WeeklyCharts = lazy(() => import('@/public/components/WeeklyCharts'));
const AIGeneratedNews = lazy(() => import('@/public/components/AIGeneratedNews'));

// В компоненте
<Suspense fallback={<LoadingSpinner />}>
  <WeeklyCharts />
</Suspense>

<Suspense fallback={<LoadingSpinner />}>
  <AIGeneratedNews />
</Suspense>
```

### Virtual Scrolling

Для большого количества новостей:

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={800}
  itemCount={articles.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ArticleCard article={articles[index]} />
    </div>
  )}
</FixedSizeList>
```

## Полный пример интеграции

```typescript
// /src/app/PublicApp.tsx
import { useState, useEffect } from 'react';
import { WeeklyCharts } from '@/public/components/WeeklyCharts';
import { AIGeneratedNews } from '@/public/components/AIGeneratedNews';

export function PublicApp({ onLoginClick }: PublicAppProps) {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="h-screen">
        <PromoGuideHero onLoginClick={onLoginClick} />
      </section>

      {/* Featured Content */}
      <section>
        <FeaturedTracks />
      </section>

      {/* AI-Generated Charts */}
      <WeeklyCharts />

      {/* AI-Generated News */}
      <AIGeneratedNews />

      {/* Other Sections */}
      <HowItWorks />
      <Pricing />
      <Footer />
    </div>
  );
}
```

## Troubleshooting

### Компоненты не загружаются
→ Проверьте, что AI-агент запущен и данные собраны

### Пустые данные
→ Запустите сбор данных через админ-панель: "AI Агент" → "Обновить чарты/новости"

### Стили не применяются
→ Убедитесь, что Tailwind CSS настроен корректно

### CORS ошибки
→ Проверьте CORS настройки в Edge Functions

## Следующие шаги

1. ✅ Интегрируйте компоненты на главную
2. ✅ Настройте автоматический cron для обновления данных
3. ✅ Добавьте аналитику взаимодействий
4. ✅ Оптимизируйте производительность
5. ✅ Настройте SEO

---

**Нужна помощь?** Смотрите полную документацию в `/AI_AGENT_README.md`
