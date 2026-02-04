# AI AGENT - Автоматизация контента для promo.music

## Обзор

AI-агент на базе **Mistral AI** и **Claude AI** автоматизирует создание контента для главной страницы promo.music:

### 🎵 Функционал

1. **Сбор чартов радиостанций** (еженедельно)
   - Русское Радио
   - Радио Максимум
   - Наше Радио
   - DFM Radio
   - Топ-10 треков с каждой станции

2. **Обработка новостей** (ежедневно)
   - Автоматический сбор музыкальных новостей
   - Обработка через Claude AI в стиле promo.music
   - Модерация администратором
   - Публикация на главной

3. **Аналитика трендов**
   - Анализ чартов через Mistral AI
   - Выявление трендов и прорывных артистов
   - Рекомендации для музыкантов

## 🔧 Настройка

### 1. API ключи

Необходимо получить и установить следующие ключи:

#### Mistral AI
1. Зарегистрируйтесь на https://console.mistral.ai/
2. Создайте API ключ
3. В интерфейсе Figma Make введите ключ в переменную окружения `MISTRAL_API_KEY`

#### Claude AI (Anthropic)
1. Зарегистрируйтесь на https://console.anthropic.com/
2. Создайте API ключ
3. В интерфейсе Figma Make введите ключ в переменную окружения `ANTHROPIC_API_KEY`

### 2. Настройка парсинга чартов

⚠️ **ВАЖНО**: В текущей версии используются демо-данные. Для продакшена необходимо реализовать парсинг:

Откройте файл `/supabase/functions/server/ai-agent.ts` и замените функцию `fetchRadioChart()`:

```typescript
async function fetchRadioChart(source: RadioChart['source']): Promise<ChartEntry[]> {
  // TODO: Реализовать реальный парсинг
  // Примеры источников:
  // - https://rusradio.ru/chart/
  // - https://maximum.ru/chart/
  // - https://nashe.ru/chart/
  // - https://www.dfm.ru/top100/

  // Варианты реализации:
  // 1. Web scraping (если нет API)
  // 2. RSS фиды
  // 3. Официальные API (если доступны)
  
  // Пример с web scraping:
  const response = await fetch(`https://${source}-url.ru/chart/`);
  const html = await response.text();
  // Парсинг HTML...
  
  return parsedChart;
}
```

### 3. Настройка источников новостей

Откройте файл `/supabase/functions/server/ai-agent.ts` и замените функцию `fetchMusicNews()`:

```typescript
async function fetchMusicNews(): Promise<Array<{ title: string; url: string; snippet: string }>> {
  // TODO: Интеграция с RSS или News API
  // Примеры источников:
  // - music.ru
  // - intermedia.ru
  // - zvuki.ru
  // - the-flow.ru
  
  // Пример с RSS:
  const feeds = [
    'https://music.ru/rss',
    'https://intermedia.ru/rss',
  ];
  
  const news = [];
  for (const feed of feeds) {
    const items = await parseRSS(feed);
    news.push(...items);
  }
  
  return news;
}
```

## 📊 Использование

### Админ-панель

1. Войдите в систему как администратор
2. Перейдите в раздел **"AI Агент"** в боковом меню
3. Доступны 3 вкладки:
   - **Новости** - модерация статей
   - **Чарты** - просмотр топ-10
   - **Аналитика** - тренды и инсайты

### API Endpoints

#### Сбор чартов
```bash
POST /make-server-84730125/api/ai-agent/collect-charts
Authorization: Bearer {SUPABASE_ANON_KEY}

# Возвращает:
{
  "success": true,
  "charts_count": 4,
  "analysis_preview": "..."
}
```

#### Обработка новостей
```bash
POST /make-server-84730125/api/ai-agent/process-news
Authorization: Bearer {SUPABASE_ANON_KEY}

# Возвращает:
{
  "success": true,
  "articles_count": 2,
  "articles": [...]
}
```

#### Получение чартов
```bash
GET /make-server-84730125/api/ai-agent/charts/latest
GET /make-server-84730125/api/ai-agent/charts/latest?source=russkoe-radio
Authorization: Bearer {SUPABASE_ANON_KEY}
```

#### Модерация новости
```bash
POST /make-server-84730125/api/ai-agent/news/{id}/moderate
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json

{
  "action": "approve",  // или "reject"
  "admin_notes": "Отличная статья"
}
```

## ⏰ Автоматизация (Cron)

Для полной автоматизации настройте периодический запуск:

### Вариант 1: Supabase Cron (рекомендуется)

Создайте SQL функции в Supabase:

```sql
-- Еженедельный сбор чартов (каждый понедельник в 10:00)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'collect-charts-weekly',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/api/ai-agent/collect-charts',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);

-- Ежедневный сбор новостей (каждый день в 9:00)
SELECT cron.schedule(
  'process-news-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/make-server-84730125/api/ai-agent/process-news',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

### Вариант 2: Внешний Cron

Используйте сервисы типа:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions**

Пример для GitHub Actions (`.github/workflows/ai-agent.yml`):

```yaml
name: AI Agent Tasks

on:
  schedule:
    # Чарты - каждый понедельник в 10:00 UTC
    - cron: '0 10 * * 1'
    # Новости - каждый день в 9:00 UTC
    - cron: '0 9 * * *'

jobs:
  collect-charts:
    runs-on: ubuntu-latest
    steps:
      - name: Collect Charts
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            https://${{ secrets.SUPABASE_PROJECT_ID }}.supabase.co/functions/v1/make-server-84730125/api/ai-agent/collect-charts

  process-news:
    runs-on: ubuntu-latest
    steps:
      - name: Process News
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            https://${{ secrets.SUPABASE_PROJECT_ID }}.supabase.co/functions/v1/make-server-84730125/api/ai-agent/process-news
```

## 🎨 Интеграция на главной странице

Для отображения контента на главной странице используйте следующий код:

```typescript
// Получение последних чартов
const response = await fetch(
  `${API_BASE}/ai-agent/charts/latest`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  }
);
const { charts } = await response.json();

// Получение опубликованных новостей
const publishedIds = await kv.get('news:published') || '[]';
const ids = JSON.parse(publishedIds);
const articles = [];
for (const id of ids.slice(0, 10)) {  // Последние 10
  const article = await kv.get(`news:${id}`);
  if (article) {
    articles.push(JSON.parse(article));
  }
}

// Получение аналитики
const analyticsResponse = await fetch(
  `${API_BASE}/ai-agent/analytics/latest`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  }
);
const analytics = await analyticsResponse.json();
```

## 🔒 Безопасность

- API endpoints доступны только с валидным `SUPABASE_ANON_KEY`
- Модерация новостей доступна только администраторам
- API ключи Mistral и Claude хранятся в environment variables
- Все данные хранятся в KV store с префиксами

## 📈 Структура данных

### Чарты
```typescript
interface RadioChart {
  source: 'russkoe-radio' | 'radio-maximum' | 'nashe-radio' | 'dfm-radio';
  date: string;  // YYYY-MM-DD
  top10: ChartEntry[];
}

interface ChartEntry {
  position: number;
  title: string;
  artist: string;
  previous_position?: number;
  weeks_in_chart?: number;
}

// KV storage: chart:{source}:{date}
```

### Новости
```typescript
interface NewsArticle {
  id: string;
  title: string;
  content: string;  // HTML
  source_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  created_at: string;
  published_at?: string;
}

// KV storage:
// - news:{id} - сама статья
// - news:pending - массив ID на модерации
// - news:published - массив ID опубликованных
```

### Аналитика
```typescript
interface Analytics {
  date: string;
  content: string;  // HTML
  created_at: string;
}

// KV storage: analysis:{date}
```

## 🚀 Roadmap

### Фаза 1 (текущая)
- ✅ Интеграция Mistral AI
- ✅ Интеграция Claude AI
- ✅ Демо сбор чартов
- ✅ Демо обработка новостей
- ✅ Админ-панель модерации

### Фаза 2 (следующая)
- ⏳ Реальный парсинг чартов
- ⏳ Интеграция с RSS источниками
- ⏳ Автоматический cron
- ⏳ Email уведомления админу

### Фаза 3 (будущее)
- 🔮 Персонализированные рекомендации
- 🔮 Генерация инфографики
- 🔮 Социальные медиа интеграция
- 🔮 Мультиязычность

## 💡 Советы

1. **Стоимость API**
   - Mistral: ~$0.002 за 1K tokens
   - Claude: ~$0.003 за 1K tokens
   - Еженедельные чарты: ~$0.10
   - Ежедневные новости: ~$0.30/день

2. **Оптимизация**
   - Кешируйте результаты в KV store
   - Используйте rate limiting
   - Мониторьте использование API

3. **Качество контента**
   - Настройте промпты под свой стиль
   - Регулярно проверяйте модерацию
   - Дайте фидбек на качество статей

## 🐛 Troubleshooting

### Ошибка: "MISTRAL_API_KEY not configured"
- Проверьте, что ключ добавлен в Supabase secrets
- Перезапустите Edge Functions

### Ошибка: "Failed to collect charts"
- Проверьте доступность источников
- Убедитесь, что парсинг настроен правильно
- Проверьте логи в Supabase

### Новости не появляются
- Убедитесь, что cron запускается
- Проверьте статус модерации
- Проверьте KV storage: `news:pending`

## 📞 Поддержка

Для вопросов и предложений:
- GitHub Issues
- Email: support@promo.music
- Telegram: @promo_music_support
