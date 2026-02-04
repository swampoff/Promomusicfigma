/**
 * AI AGENT - Mistral-powered контент-агент для promo.music
 * 
 * Функционал:
 * - Сбор чартов из радиостанций (еженедельно)
 * - Генерация новостей через Claude
 * - Автоматическая модерация и публикация
 * - Аналитика трендов
 */

import { Hono } from 'npm:hono@4';
import type { Context } from 'npm:hono@4';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const aiAgent = new Hono();

// =====================================================
// TYPES
// =====================================================

interface ChartEntry {
  position: number;
  title: string;
  artist: string;
  previous_position?: number;
  weeks_in_chart?: number;
}

interface RadioChart {
  source: 'russkoe-radio' | 'radio-maximum' | 'nashe-radio' | 'dfm-radio';
  date: string;
  top10: ChartEntry[];
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source_url?: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  created_at: string;
  published_at?: string;
}

// =====================================================
// MISTRAL AI INTEGRATION
// =====================================================

async function callMistralAI(prompt: string, systemPrompt?: string): Promise<string> {
  const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
  
  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY not configured');
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mistralApiKey}`
    },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// =====================================================
// CLAUDE AI INTEGRATION (для обработки новостей)
// =====================================================

async function callClaudeAI(prompt: string, systemPrompt?: string): Promise<string> {
  const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!claudeApiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt || 'You are a professional music journalist for promo.music platform.',
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// =====================================================
// CHART PARSING
// =====================================================

/**
 * Парсинг чартов с радиостанций
 * В продакшене заменить на реальный парсинг или API
 */
async function fetchRadioChart(source: RadioChart['source']): Promise<ChartEntry[]> {
  console.log(`📊 [AI-Agent] Парсинг чартов: ${source}`);

  // TODO: Реализовать реальный парсинг
  // Примеры источников:
  // - https://rusradio.ru/chart/
  // - https://maximum.ru/chart/
  // - https://nashe.ru/chart/
  // - https://www.dfm.ru/top100/

  // DEMO: возвращаем фейковые данные
  const demoChart: ChartEntry[] = [
    { position: 1, title: 'Demo Track 1', artist: 'Demo Artist 1', previous_position: 2, weeks_in_chart: 3 },
    { position: 2, title: 'Demo Track 2', artist: 'Demo Artist 2', previous_position: 1, weeks_in_chart: 5 },
    { position: 3, title: 'Demo Track 3', artist: 'Demo Artist 3', previous_position: 4, weeks_in_chart: 2 },
    { position: 4, title: 'Demo Track 4', artist: 'Demo Artist 4', previous_position: 5, weeks_in_chart: 1 },
    { position: 5, title: 'Demo Track 5', artist: 'Demo Artist 5', previous_position: 3, weeks_in_chart: 4 },
    { position: 6, title: 'Demo Track 6', artist: 'Demo Artist 6', previous_position: 7, weeks_in_chart: 6 },
    { position: 7, title: 'Demo Track 7', artist: 'Demo Artist 7', previous_position: 6, weeks_in_chart: 2 },
    { position: 8, title: 'Demo Track 8', artist: 'Demo Artist 8', previous_position: 9, weeks_in_chart: 3 },
    { position: 9, title: 'Demo Track 9', artist: 'Demo Artist 9', previous_position: 8, weeks_in_chart: 1 },
    { position: 10, title: 'Demo Track 10', artist: 'Demo Artist 10', previous_position: 12, weeks_in_chart: 7 },
  ];

  return demoChart;
}

/**
 * Сбор всех чартов и сохранение в БД
 */
async function collectAllCharts(): Promise<RadioChart[]> {
  const sources: RadioChart['source'][] = [
    'russkoe-radio',
    'radio-maximum',
    'nashe-radio',
    'dfm-radio'
  ];

  const charts: RadioChart[] = [];
  const date = new Date().toISOString().split('T')[0];

  for (const source of sources) {
    try {
      const top10 = await fetchRadioChart(source);
      
      const chart: RadioChart = {
        source,
        date,
        top10
      };

      charts.push(chart);

      // Сохраняем в KV store
      await kv.set(`chart:${source}:${date}`, JSON.stringify(chart));
      
      console.log(`✅ [AI-Agent] Чарт сохранён: ${source}`);
    } catch (error) {
      console.error(`❌ [AI-Agent] Ошибка парсинга ${source}:`, error);
    }
  }

  return charts;
}

// =====================================================
// NEWS PROCESSING
// =====================================================

/**
 * Сбор новостей из источников
 */
async function fetchMusicNews(): Promise<Array<{ title: string; url: string; snippet: string }>> {
  console.log('📰 [AI-Agent] Сбор новостей');

  // TODO: Интеграция с RSS или News API
  // Примеры источников:
  // - music.ru
  // - intermedia.ru
  // - zvuki.ru
  // - the-flow.ru

  // DEMO: возвращаем фейковые новости
  return [
    {
      title: 'Новый альбом популярного исполнителя',
      url: 'https://example.com/news1',
      snippet: 'Известный артист представил новый студийный альбом...'
    },
    {
      title: 'Крупный музыкальный фестиваль анонсирован',
      url: 'https://example.com/news2',
      snippet: 'Организаторы объявили даты проведения летнего фестиваля...'
    },
  ];
}

/**
 * Обработка новости через Claude AI
 */
async function processNewsWithClaude(newsItem: { title: string; url: string; snippet: string }): Promise<string> {
  const systemPrompt = `Ты — профессиональный музыкальный журналист платформы promo.music.

Твоя задача:
- Переписать новость в стиле promo.music (современный, энергичный, профессиональный)
- Добавить контекст и экспертное мнение
- Структурировать текст с подзаголовками
- Сделать материал интересным для музыкантов и индустрии
- Длина: 300-500 слов
- Формат: HTML разметка (h2, p, ul, li)

Важно: сохранить фактическую точность и не добавлять выдуманные факты.`;

  const prompt = `Новость для обработки:

Заголовок: ${newsItem.title}
Источник: ${newsItem.url}
Краткое содержание: ${newsItem.snippet}

Создай статью в стиле promo.music на основе этой новости.`;

  const article = await callClaudeAI(prompt, systemPrompt);
  return article;
}

/**
 * Создание новостной статьи
 */
async function createNewsArticle(newsItem: { title: string; url: string; snippet: string }): Promise<NewsArticle> {
  console.log('✍️ [AI-Agent] Обработка новости через Claude:', newsItem.title);

  const content = await processNewsWithClaude(newsItem);
  
  const article: NewsArticle = {
    id: `news-${Date.now()}`,
    title: newsItem.title,
    content,
    source_url: newsItem.url,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  // Сохраняем в KV store
  await kv.set(`news:${article.id}`, JSON.stringify(article));
  
  // Добавляем в список на модерацию
  const pendingNews = await kv.get('news:pending') || '[]';
  const pending = JSON.parse(pendingNews);
  pending.push(article.id);
  await kv.set('news:pending', JSON.stringify(pending));

  console.log('✅ [AI-Agent] Статья создана и отправлена на модерацию:', article.id);

  return article;
}

// =====================================================
// ANALYTICS & INSIGHTS
// =====================================================

/**
 * Анализ трендов с помощью Mistral AI
 */
async function analyzeChartTrends(charts: RadioChart[]): Promise<string> {
  console.log('📈 [AI-Agent] Анализ трендов через Mistral AI');

  const systemPrompt = `Ты — аналитик музыкальной индустрии для платформы promo.music.

Твоя задача — проанализировать чарты радиостанций и выявить:
- Общие тренды (какие жанры и стили популярны)
- Новые прорывные артисты
- Треки с наибольшим ростом
- Сравнение между разными радиостанциями
- Рекомендации для музыкантов

Формат ответа: структурированный анализ в HTML (h2, h3, p, ul, li).`;

  const chartsData = charts.map(chart => ({
    source: chart.source,
    top10: chart.top10.map(t => `${t.position}. ${t.artist} - ${t.title} (${t.previous_position ? `было ${t.previous_position}` : 'новое'})`).join('\n')
  }));

  const prompt = `Проанализируй чарты радиостанций за эту неделю:

${chartsData.map(c => `
${c.source}:
${c.top10}
`).join('\n---\n')}

Создай аналитическую статью с инсайтами и трендами.`;

  const analysis = await callMistralAI(prompt, systemPrompt);
  
  // Сохраняем анализ
  const date = new Date().toISOString().split('T')[0];
  await kv.set(`analysis:${date}`, JSON.stringify({
    date,
    content: analysis,
    created_at: new Date().toISOString(),
  }));

  return analysis;
}

// =====================================================
// ROUTES
// =====================================================

/**
 * POST /ai-agent/collect-charts
 * Запуск сбора чартов (должен вызываться еженедельно через cron)
 */
aiAgent.post('/ai-agent/collect-charts', async (c: Context) => {
  try {
    console.log('🤖 [AI-Agent] Запуск сбора чартов');

    const charts = await collectAllCharts();
    const analysis = await analyzeChartTrends(charts);

    return c.json({
      success: true,
      message: 'Charts collected and analyzed',
      charts_count: charts.length,
      analysis_preview: analysis.substring(0, 200) + '...',
    });
  } catch (error) {
    console.error('❌ [AI-Agent] Ошибка сбора чартов:', error);
    return c.json({ 
      error: 'Failed to collect charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /ai-agent/process-news
 * Запуск обработки новостей (должен вызываться ежедневно через cron)
 */
aiAgent.post('/ai-agent/process-news', async (c: Context) => {
  try {
    console.log('🤖 [AI-Agent] Запуск обработки новостей');

    const newsItems = await fetchMusicNews();
    const articles: NewsArticle[] = [];

    for (const newsItem of newsItems) {
      const article = await createNewsArticle(newsItem);
      articles.push(article);
    }

    return c.json({
      success: true,
      message: 'News processed and sent for moderation',
      articles_count: articles.length,
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
      })),
    });
  } catch (error) {
    console.error('❌ [AI-Agent] Ошибка обработки новостей:', error);
    return c.json({ 
      error: 'Failed to process news',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /ai-agent/charts/latest
 * Получение последних чартов
 */
aiAgent.get('/ai-agent/charts/latest', async (c: Context) => {
  try {
    const source = c.req.query('source') as RadioChart['source'] | undefined;
    const date = new Date().toISOString().split('T')[0];

    if (source) {
      const chart = await kv.get(`chart:${source}:${date}`);
      return c.json(chart ? JSON.parse(chart) : null);
    }

    // Получаем все чарты
    const sources: RadioChart['source'][] = ['russkoe-radio', 'radio-maximum', 'nashe-radio', 'dfm-radio'];
    const charts: RadioChart[] = [];

    for (const src of sources) {
      const chart = await kv.get(`chart:${src}:${date}`);
      if (chart) {
        charts.push(JSON.parse(chart));
      }
    }

    return c.json({ charts });
  } catch (error) {
    console.error('❌ [AI-Agent] Ошибка получения чартов:', error);
    return c.json({ error: 'Failed to fetch charts' }, 500);
  }
});

/**
 * GET /ai-agent/news/pending
 * Получение новостей на модерации
 */
aiAgent.get('/ai-agent/news/pending', async (c: Context) => {
  try {
    const pendingIds = await kv.get('news:pending') || '[]';
    const ids = JSON.parse(pendingIds);

    const articles: NewsArticle[] = [];
    for (const id of ids) {
      const article = await kv.get(`news:${id}`);
      if (article) {
        articles.push(JSON.parse(article));
      }
    }

    return c.json({ articles });
  } catch (error) {
    console.error('❌ [AI-Agent] Ошибка получения новостей:', error);
    return c.json({ error: 'Failed to fetch news' }, 500);
  }
});

/**
 * POST /ai-agent/news/:id/moderate
 * Модерация новости (approve/reject)
 */
aiAgent.post('/ai-agent/news/:id/moderate', async (c: Context) => {
  try {
    const newsId = c.req.param('id');
    const { action, admin_notes } = await c.req.json<{
      action: 'approve' | 'reject';
      admin_notes?: string;
    }>();

    const articleData = await kv.get(`news:${newsId}`);
    if (!articleData) {
      return c.json({ error: 'Article not found' }, 404);
    }

    const article: NewsArticle = JSON.parse(articleData);

    if (action === 'approve') {
      article.status = 'approved';
      article.published_at = new Date().toISOString();
      
      // Добавляем в список опубликованных
      const published = await kv.get('news:published') || '[]';
      const publishedList = JSON.parse(published);
      publishedList.unshift(newsId);
      await kv.set('news:published', JSON.stringify(publishedList.slice(0, 100))); // Храним последние 100
    } else {
      article.status = 'draft';
    }

    await kv.set(`news:${newsId}`, JSON.stringify(article));

    // Удаляем из pending
    const pendingIds = await kv.get('news:pending') || '[]';
    const pending = JSON.parse(pendingIds).filter((id: string) => id !== newsId);
    await kv.set('news:pending', JSON.stringify(pending));

    console.log(`✅ [AI-Agent] Новость ${action === 'approve' ? 'одобрена' : 'отклонена'}:`, newsId);

    return c.json({
      success: true,
      message: `Article ${action}d`,
      article,
    });
  } catch (error) {
    console.error('❌ [AI-Agent] Ошибка модерации:', error);
    return c.json({ error: 'Failed to moderate article' }, 500);
  }
});

/**
 * GET /ai-agent/analytics/latest
 * Получение последнего аналитического отчёта
 */
aiAgent.get('/ai-agent/analytics/latest', async (c: Context) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const analysis = await kv.get(`analysis:${date}`);
    
    return c.json(analysis ? JSON.parse(analysis) : null);
  } catch (error) {
    console.error('❌ [AI-Agent] Ошибка получения аналитики:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// =====================================================
// EXPORT
// =====================================================

export default aiAgent;
