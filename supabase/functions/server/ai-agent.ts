/**
 * NEWS PIPELINE - Сбор, обработка и модерация музыкальных новостей
 * 
 * Pipeline:
 * 1. Сбор из RSS/HTML музыкальных источников
 * 2. Обработка через Claude (рерайт в стиле Promo.music)
 * 3. Модерация администратором
 * 4. Публикация на лендинг (через landing-data-routes.tsx)
 * 
 * KV Storage:
 * - news:public:{id}  - обработанные новости (pending/published/rejected)
 * - news:pipeline:source:{sourceId} - статус источника
 * - news:pipeline:stats - статистика pipeline
 */

import { Hono } from 'npm:hono@4';
import type { Context } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

const aiAgent = new Hono();

// =====================================================
// TYPES
// =====================================================

interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'html';
  category: string;
  /** CSS selector hint for Claude extraction */
  contentHint: string;
  enabled: boolean;
}

interface RawNewsItem {
  title: string;
  excerpt: string;
  sourceUrl?: string;
  sourceName: string;
  sourceId: string;
  category: string;
}

interface ProcessedNewsItem {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  content: string;
  coverImage: string;
  views: number;
  likes: number;
  publishedAt: string;
  status: 'pending' | 'published' | 'rejected';
  source: string;
  sourceUrl?: string;
  sourceId: string;
  processedAt: string;
  moderatedAt?: string;
  moderationNote?: string;
}

interface SourceStatus {
  sourceId: string;
  sourceName: string;
  lastFetchAt: string | null;
  lastFetchStatus: 'success' | 'error' | 'never';
  articlesCollected: number;
  lastError?: string;
}

interface PipelineStats {
  totalCollected: number;
  totalPending: number;
  totalPublished: number;
  totalRejected: number;
  lastRunAt: string | null;
  sourcesActive: number;
}

// =====================================================
// NEWS SOURCES CONFIGURATION
// =====================================================

const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'intermedia',
    name: 'InterMedia',
    url: 'https://www.intermedia.ru/rss',
    type: 'rss',
    category: 'Индустрия',
    contentHint: 'Российский музыкальный портал с новостями шоу-бизнеса',
    enabled: true,
  },
  {
    id: 'the-flow',
    name: 'The Flow',
    url: 'https://the-flow.ru/',
    type: 'html',
    category: 'Хип-хоп',
    contentHint: 'Российский хип-хоп портал, главные новости на главной странице',
    enabled: true,
  },
  {
    id: 'tass-culture',
    name: 'ТАСС Культура',
    url: 'https://tass.ru/kultura',
    type: 'html',
    category: 'Культура',
    contentHint: 'Раздел культуры ТАСС, включает музыкальные новости',
    enabled: true,
  },
  {
    id: 'fontanka-culture',
    name: 'Фонтанка Культура',
    url: 'https://www.fontanka.ru/culture/',
    type: 'html',
    category: 'Культура',
    contentHint: 'Раздел культуры Фонтанки с новостями концертов и музыки',
    enabled: true,
  },
  {
    id: 'rbc-style-music',
    name: 'РБК Стиль',
    url: 'https://style.rbc.ru/entertainment',
    type: 'html',
    category: 'Развлечения',
    contentHint: 'Раздел развлечений РБК Стиль, музыкальные новости',
    enabled: true,
  },
  // ──────────── Новые источники ────────────
  {
    id: 'zvuki-ru',
    name: 'Звуки.ру',
    url: 'https://www.zvuki.ru/R/P/',
    type: 'html',
    category: 'Релизы',
    contentHint: 'Старейший российский музыкальный портал - рецензии, релизы, интервью, новости',
    enabled: true,
  },
  {
    id: 'afisha-daily',
    name: 'Афиша Daily',
    url: 'https://daily.afisha.ru/music/',
    type: 'html',
    category: 'Культура',
    contentHint: 'Раздел музыки Афиши Daily - статьи, интервью, обзоры, рецензии',
    enabled: true,
  },
  {
    id: 'colta-music',
    name: 'Colta.ru',
    url: 'https://www.colta.ru/rubric/music',
    type: 'html',
    category: 'Культура',
    contentHint: 'Независимое культурное издание, раздел музыки - аналитика, рецензии, интервью',
    enabled: true,
  },
  {
    id: 'sadwave',
    name: 'Sadwave',
    url: 'https://sadwave.com/',
    type: 'html',
    category: 'Инди',
    contentHint: 'Портал об инди и альтернативной музыке - концерты, релизы, фестивали',
    enabled: true,
  },
  {
    id: 'rap-ru',
    name: 'Rap.ru',
    url: 'https://rap.ru/news/',
    type: 'html',
    category: 'Хип-хоп',
    contentHint: 'Российский хип-хоп портал - новости рэп-сцены, релизы, баттлы',
    enabled: true,
  },
  {
    id: 'muzkarta',
    name: 'Музкарта',
    url: 'https://muzkarta.info/',
    type: 'html',
    category: 'Концерты',
    contentHint: 'Агрегатор концертов классической и академической музыки по всей России',
    enabled: true,
  },
  {
    id: 'lenta-culture',
    name: 'Лента.ру Культура',
    url: 'https://lenta.ru/rubrics/culture/music/',
    type: 'html',
    category: 'Индустрия',
    contentHint: 'Раздел музыки Лента.ру - новости музыкальной индустрии, артисты, события',
    enabled: true,
  },
  {
    id: 'kp-showbiz',
    name: 'КП Шоу-бизнес',
    url: 'https://www.kp.ru/online/news/showbiz/',
    type: 'html',
    category: 'Шоу-бизнес',
    contentHint: 'Комсомольская правда, раздел шоу-бизнеса - новости звёзд, концерты, премии',
    enabled: true,
  },
];

// Cover images for news articles (royalty-free)
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80',
  'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80',
];

// =====================================================
// CLAUDE AI INTEGRATION
// =====================================================

async function callClaude(prompt: string, systemPrompt: string, maxTokens = 2000): Promise<string | null> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.log('[News Pipeline] ANTHROPIC_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log(`[News Pipeline] Claude API error: ${response.status} ${errText}`);
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.log(`[News Pipeline] Claude call failed: ${error}`);
    return null;
  }
}

// =====================================================
// PAGE FETCHING
// =====================================================

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PromoMusic/1.0; +https://promo.music)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.5',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`[News Pipeline] Fetch failed for ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Strip HTML tags, keep text
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();

    // Limit to ~10000 chars for Claude context
    return cleanText.slice(0, 10000);
  } catch (error) {
    console.log(`[News Pipeline] Fetch error for ${url}: ${error}`);
    return null;
  }
}

// =====================================================
// RSS PARSING (basic regex-based)
// =====================================================

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
}

function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const descMatch = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim().replace(/<[^>]+>/g, ''),
        link: linkMatch ? linkMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim().replace(/<[^>]+>/g, '').slice(0, 500) : '',
        pubDate: dateMatch ? dateMatch[1].trim() : undefined,
      });
    }
  }

  return items.slice(0, 10); // max 10 items per source
}

async function fetchRSS(url: string): Promise<RSSItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PromoMusic/1.0)',
        'Accept': 'application/rss+xml,application/xml,text/xml,*/*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`[News Pipeline] RSS fetch failed for ${url}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSS(xml);
  } catch (error) {
    console.log(`[News Pipeline] RSS error for ${url}: ${error}`);
    return [];
  }
}

// =====================================================
// NEWS EXTRACTION (via Claude)
// =====================================================

async function extractNewsFromHTML(
  source: NewsSource,
  pageText: string,
): Promise<RawNewsItem[]> {
  const systemPrompt = `Ты - парсер новостей для музыкальной платформы Promo.music.
Из текста страницы ты извлекаешь заголовки и краткие описания МУЗЫКАЛЬНЫХ новостей.
Только новости про музыку, артистов, концерты, фестивали, стриминг, музыкальную индустрию.
Игнорируй рекламу, навигацию, нерелевантный контент.

ФОРМАТ ОТВЕТА - строго JSON массив:
[
  {"title": "Заголовок новости", "excerpt": "Краткое описание 1-2 предложения", "category": "Релиз|Концерт|Индустрия|Интервью|Фестиваль|Чарт|Технологии"}
]

Верни от 3 до 8 самых значимых музыкальных новостей. Если музыкальных новостей нет - верни пустой массив [].
Используй только короткие тире (-), не длинные.`;

  const prompt = `Источник: ${source.name} (${source.url})
Описание: ${source.contentHint}

Текст страницы:
${pageText}

Извлеки музыкальные новости в формате JSON:`;

  const result = await callClaude(prompt, systemPrompt, 1500);
  if (!result) return [];

  try {
    // Extract JSON from response
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: any) => item.title && item.excerpt)
      .map((item: any) => ({
        title: String(item.title).trim(),
        excerpt: String(item.excerpt).trim(),
        sourceUrl: source.url,
        sourceName: source.name,
        sourceId: source.id,
        category: String(item.category || source.category).trim(),
      }));
  } catch (error) {
    console.log(`[News Pipeline] JSON parse error for ${source.id}: ${error}`);
    return [];
  }
}

// =====================================================
// NEWS PROCESSING (Claude rewrite)
// =====================================================

async function processNewsItem(raw: RawNewsItem): Promise<ProcessedNewsItem | null> {
  const systemPrompt = `Ты - главный редактор музыкальной платформы Promo.music.
Переписываешь новость в фирменном стиле:
- Современный, энергичный, профессиональный тон
- Ориентация на музыкантов и профессионалов индустрии
- Краткие абзацы, живой язык
- Без «воды», только суть и контекст
- Используй только короткие тире (-), никогда длинные (—)
- Не упоминай "Promo.music" в тексте новости
- Не добавляй выдуманные факты

ФОРМАТ ОТВЕТА - строго JSON:
{
  "title": "Заголовок (до 100 символов, цепляющий)",
  "excerpt": "Краткое описание (до 200 символов)",
  "content": "Полный текст новости (3-5 абзацев, HTML: <p>, <strong>, <ul>, <li>)",
  "tag": "Один тег: Релиз|Концерт|Индустрия|Интервью|Фестиваль|Чарт|Технологии|Рекорд"
}`;

  const prompt = `Исходная новость:
Заголовок: ${raw.title}
Описание: ${raw.excerpt}
Источник: ${raw.sourceName}
Категория: ${raw.category}

Перепиши в стиле Promo.music и верни JSON:`;

  const result = await callClaude(prompt, systemPrompt, 1200);
  if (!result) return null;

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const now = new Date().toISOString();
    const id = `pipeline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      id,
      title: String(parsed.title || raw.title).trim(),
      tag: String(parsed.tag || raw.category).trim(),
      excerpt: String(parsed.excerpt || raw.excerpt).trim(),
      content: String(parsed.content || `<p>${raw.excerpt}</p>`),
      coverImage: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)],
      views: 0,
      likes: 0,
      publishedAt: now,
      status: 'pending',
      source: raw.sourceName,
      sourceUrl: raw.sourceUrl,
      sourceId: raw.sourceId,
      processedAt: now,
    };
  } catch (error) {
    console.log(`[News Pipeline] Process error for "${raw.title}": ${error}`);
    return null;
  }
}

// =====================================================
// DEDUPLICATION
// =====================================================

async function isDuplicate(title: string): Promise<boolean> {
  const existing = await kv.getByPrefix('news:public:');
  const normalizedTitle = title.toLowerCase().replace(/[^а-яa-z0-9\s]/gi, '').trim();

  for (const item of existing) {
    const news = typeof item === 'string' ? JSON.parse(item) : item;
    if (news?.title) {
      const existingNormalized = news.title.toLowerCase().replace(/[^а-яa-z0-9\s]/gi, '').trim();
      // Simple similarity check: if 70%+ of words match
      const words1 = new Set(normalizedTitle.split(/\s+/));
      const words2 = new Set(existingNormalized.split(/\s+/));
      const intersection = [...words1].filter(w => words2.has(w));
      const similarity = intersection.length / Math.max(words1.size, words2.size);
      if (similarity > 0.7) return true;
    }
  }

  return false;
}

// =====================================================
// MAIN COLLECTION LOGIC
// =====================================================

async function collectFromSource(source: NewsSource): Promise<{
  items: RawNewsItem[];
  error?: string;
}> {
  console.log(`[News Pipeline] Collecting from ${source.name} (${source.type})...`);

  try {
    let rawItems: RawNewsItem[] = [];

    if (source.type === 'rss') {
      const rssItems = await fetchRSS(source.url);
      if (rssItems.length > 0) {
        // RSS items are already structured, just map them
        rawItems = rssItems.map(item => ({
          title: item.title,
          excerpt: item.description || item.title,
          sourceUrl: item.link || source.url,
          sourceName: source.name,
          sourceId: source.id,
          category: source.category,
        }));
        console.log(`[News Pipeline] RSS: ${rssItems.length} items from ${source.name}`);
      } else {
        // Fallback: try HTML extraction
        const pageText = await fetchPageText(source.url);
        if (pageText) {
          rawItems = await extractNewsFromHTML(source, pageText);
        }
      }
    } else {
      // HTML source - fetch and extract via Claude
      const pageText = await fetchPageText(source.url);
      if (pageText) {
        rawItems = await extractNewsFromHTML(source, pageText);
        console.log(`[News Pipeline] HTML: ${rawItems.length} items from ${source.name}`);
      }
    }

    // Filter only music-related (Claude already does this, but extra safety)
    const musicItems = rawItems.filter(item =>
      item.title.length > 10 && item.excerpt.length > 10
    );

    // Update source status
    const statusData: SourceStatus = {
      sourceId: source.id,
      sourceName: source.name,
      lastFetchAt: new Date().toISOString(),
      lastFetchStatus: musicItems.length > 0 ? 'success' : 'error',
      articlesCollected: musicItems.length,
    };
    await kv.set(`news:pipeline:source:${source.id}`, statusData);

    return { items: musicItems };
  } catch (error) {
    console.log(`[News Pipeline] Error collecting from ${source.name}: ${error}`);

    const statusData: SourceStatus = {
      sourceId: source.id,
      sourceName: source.name,
      lastFetchAt: new Date().toISOString(),
      lastFetchStatus: 'error',
      articlesCollected: 0,
      lastError: String(error),
    };
    await kv.set(`news:pipeline:source:${source.id}`, statusData);

    return { items: [], error: String(error) };
  }
}

async function collectAndProcess(sourceIds?: string[]): Promise<{
  collected: number;
  processed: number;
  errors: string[];
}> {
  const sources = sourceIds
    ? NEWS_SOURCES.filter(s => sourceIds.includes(s.id) && s.enabled)
    : NEWS_SOURCES.filter(s => s.enabled);

  const allRaw: RawNewsItem[] = [];
  const errors: string[] = [];

  // Collect from all sources
  for (const source of sources) {
    const result = await collectFromSource(source);
    allRaw.push(...result.items);
    if (result.error) {
      errors.push(`${source.name}: ${result.error}`);
    }
  }

  console.log(`[News Pipeline] Total raw items: ${allRaw.length}`);

  // Deduplicate and process
  let processed = 0;
  for (const raw of allRaw) {
    // Check for duplicates
    const duplicate = await isDuplicate(raw.title);
    if (duplicate) {
      console.log(`[News Pipeline] Skipping duplicate: "${raw.title}"`);
      continue;
    }

    // Process through Claude
    const article = await processNewsItem(raw);
    if (article) {
      await kv.set(`news:public:${article.id}`, article);
      processed++;
      console.log(`[News Pipeline] Processed: "${article.title}" -> ${article.id}`);
    }

    // Rate limiting: small delay between Claude calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Update pipeline stats
  const existingStats = await kv.get('news:pipeline:stats') as PipelineStats | null;
  const stats: PipelineStats = {
    totalCollected: (existingStats?.totalCollected || 0) + allRaw.length,
    totalPending: 0, // will be recalculated
    totalPublished: 0,
    totalRejected: 0,
    lastRunAt: new Date().toISOString(),
    sourcesActive: sources.length,
  };

  // Recalculate status counts
  const allNews = await kv.getByPrefix('news:public:');
  for (const item of allNews) {
    const news = typeof item === 'string' ? JSON.parse(item) : item;
    if (news?.status === 'pending') stats.totalPending++;
    else if (news?.status === 'published') stats.totalPublished++;
    else if (news?.status === 'rejected') stats.totalRejected++;
  }

  await kv.set('news:pipeline:stats', stats);

  console.log(`[News Pipeline] Done. Collected: ${allRaw.length}, Processed: ${processed}, Errors: ${errors.length}`);

  return { collected: allRaw.length, processed, errors };
}

// =====================================================
// ROUTES
// =====================================================

/**
 * GET /sources
 * Список всех источников с их статусом
 */
aiAgent.get('/sources', async (c: Context) => {
  try {
    const sourcesWithStatus = await Promise.all(
      NEWS_SOURCES.map(async (source) => {
        const status = await kv.get(`news:pipeline:source:${source.id}`) as SourceStatus | null;
        return {
          ...source,
          status: status || {
            sourceId: source.id,
            sourceName: source.name,
            lastFetchAt: null,
            lastFetchStatus: 'never' as const,
            articlesCollected: 0,
          },
        };
      })
    );

    return c.json({ success: true, data: sourcesWithStatus });
  } catch (error) {
    console.log(`[News Pipeline] Error fetching sources: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /collect
 * Запуск сбора и обработки новостей из всех источников
 * Body: { sourceIds?: string[] } - опционально, конкретные источники
 */
aiAgent.post('/collect', async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const sourceIds = body.sourceIds as string[] | undefined;

    console.log(`[News Pipeline] Starting collection${sourceIds ? ` for sources: ${sourceIds.join(', ')}` : ' (all sources)'}...`);

    const result = await collectAndProcess(sourceIds);

    return c.json({
      success: true,
      data: {
        collected: result.collected,
        processed: result.processed,
        errors: result.errors,
        message: `Собрано ${result.collected} новостей, обработано ${result.processed}`,
      },
    });
  } catch (error) {
    console.log(`[News Pipeline] Collection error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /pending
 * Новости на модерации
 */
aiAgent.get('/pending', async (c: Context) => {
  try {
    const allNews = await kv.getByPrefix('news:public:');
    const pending = allNews
      .map((item: any) => typeof item === 'string' ? JSON.parse(item) : item)
      .filter((item: any) => item?.status === 'pending')
      .sort((a: any, b: any) => new Date(b.processedAt || b.publishedAt).getTime() - new Date(a.processedAt || a.publishedAt).getTime());

    return c.json({ success: true, data: pending });
  } catch (error) {
    console.log(`[News Pipeline] Error fetching pending: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /published
 * Опубликованные новости
 */
aiAgent.get('/published', async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    const allNews = await kv.getByPrefix('news:public:');
    const published = allNews
      .map((item: any) => typeof item === 'string' ? JSON.parse(item) : item)
      .filter((item: any) => item?.status === 'published')
      .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);

    return c.json({ success: true, data: published });
  } catch (error) {
    console.log(`[News Pipeline] Error fetching published: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /rejected
 * Отклонённые новости
 */
aiAgent.get('/rejected', async (c: Context) => {
  try {
    const allNews = await kv.getByPrefix('news:public:');
    const rejected = allNews
      .map((item: any) => typeof item === 'string' ? JSON.parse(item) : item)
      .filter((item: any) => item?.status === 'rejected')
      .sort((a: any, b: any) => new Date(b.moderatedAt || b.processedAt).getTime() - new Date(a.moderatedAt || a.processedAt).getTime());

    return c.json({ success: true, data: rejected });
  } catch (error) {
    console.log(`[News Pipeline] Error fetching rejected: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /:id/approve
 * Одобрить новость
 */
aiAgent.post('/:id/approve', async (c: Context) => {
  try {
    const newsId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const note = body.note as string | undefined;

    const newsData = await kv.get(`news:public:${newsId}`) as ProcessedNewsItem | null;
    if (!newsData) {
      return c.json({ success: false, error: 'Новость не найдена' }, 404);
    }

    const news = typeof newsData === 'string' ? JSON.parse(newsData) : newsData;
    news.status = 'published';
    news.moderatedAt = new Date().toISOString();
    news.publishedAt = new Date().toISOString();
    if (note) news.moderationNote = note;

    await kv.set(`news:public:${newsId}`, news);

    console.log(`[News Pipeline] Approved: ${newsId} - "${news.title}"`);

    return c.json({ success: true, data: news });
  } catch (error) {
    console.log(`[News Pipeline] Approve error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /:id/reject
 * Отклонить новость
 */
aiAgent.post('/:id/reject', async (c: Context) => {
  try {
    const newsId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const note = body.note as string | undefined;

    const newsData = await kv.get(`news:public:${newsId}`) as ProcessedNewsItem | null;
    if (!newsData) {
      return c.json({ success: false, error: 'Новость не найдена' }, 404);
    }

    const news = typeof newsData === 'string' ? JSON.parse(newsData) : newsData;
    news.status = 'rejected';
    news.moderatedAt = new Date().toISOString();
    if (note) news.moderationNote = note;

    await kv.set(`news:public:${newsId}`, news);

    console.log(`[News Pipeline] Rejected: ${newsId} - "${news.title}"`);

    return c.json({ success: true, data: news });
  } catch (error) {
    console.log(`[News Pipeline] Reject error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * DELETE /:id
 * Удалить новость полностью
 */
aiAgent.delete('/:id', async (c: Context) => {
  try {
    const newsId = c.req.param('id');
    await kv.del(`news:public:${newsId}`);
    console.log(`[News Pipeline] Deleted: ${newsId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`[News Pipeline] Delete error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /stats
 * Статистика pipeline
 */
aiAgent.get('/stats', async (c: Context) => {
  try {
    // Recalculate fresh stats
    const allNews = await kv.getByPrefix('news:public:');
    let pending = 0, published = 0, rejected = 0;

    for (const item of allNews) {
      const news = typeof item === 'string' ? JSON.parse(item) : item;
      if (news?.status === 'pending') pending++;
      else if (news?.status === 'published') published++;
      else if (news?.status === 'rejected') rejected++;
    }

    const savedStats = await kv.get('news:pipeline:stats') as PipelineStats | null;

    const stats: PipelineStats = {
      totalCollected: savedStats?.totalCollected || 0,
      totalPending: pending,
      totalPublished: published,
      totalRejected: rejected,
      lastRunAt: savedStats?.lastRunAt || null,
      sourcesActive: NEWS_SOURCES.filter(s => s.enabled).length,
    };

    return c.json({ success: true, data: stats });
  } catch (error) {
    console.log(`[News Pipeline] Stats error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /approve-all
 * Одобрить все pending новости
 */
aiAgent.post('/approve-all', async (c: Context) => {
  try {
    const allNews = await kv.getByPrefix('news:public:');
    let approved = 0;

    for (const item of allNews) {
      const news = typeof item === 'string' ? JSON.parse(item) : item;
      if (news?.status === 'pending' && news.id) {
        news.status = 'published';
        news.moderatedAt = new Date().toISOString();
        news.publishedAt = new Date().toISOString();
        news.moderationNote = 'Массовое одобрение';
        await kv.set(`news:public:${news.id}`, news);
        approved++;
      }
    }

    console.log(`[News Pipeline] Bulk approved: ${approved} articles`);
    return c.json({ success: true, data: { approved } });
  } catch (error) {
    console.log(`[News Pipeline] Bulk approve error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /reject-all
 * Отклонить все pending новости
 */
aiAgent.post('/reject-all', async (c: Context) => {
  try {
    const allNews = await kv.getByPrefix('news:public:');
    let rejected = 0;

    for (const item of allNews) {
      const news = typeof item === 'string' ? JSON.parse(item) : item;
      if (news?.status === 'pending' && news.id) {
        news.status = 'rejected';
        news.moderatedAt = new Date().toISOString();
        news.moderationNote = 'Массовое отклонение';
        await kv.set(`news:public:${news.id}`, news);
        rejected++;
      }
    }

    console.log(`[News Pipeline] Bulk rejected: ${rejected} articles`);
    return c.json({ success: true, data: { rejected } });
  } catch (error) {
    console.log(`[News Pipeline] Bulk reject error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// =====================================================
// LEGACY COMPATIBILITY ROUTES
// (old AIAgentDashboard used these paths)
// =====================================================

// Old: /ai-agent/process-news -> new: /collect
aiAgent.post('/process-news', async (c: Context) => {
  // Redirect to new collect endpoint
  const body = await c.req.json().catch(() => ({}));
  const result = await collectAndProcess(body.sourceIds);
  return c.json({
    success: true,
    message: 'News processed and sent for moderation',
    articles_count: result.processed,
  });
});

// Old: /ai-agent/news/pending -> new: /pending
aiAgent.get('/news/pending', async (c: Context) => {
  const allNews = await kv.getByPrefix('news:public:');
  const pending = allNews
    .map((item: any) => typeof item === 'string' ? JSON.parse(item) : item)
    .filter((item: any) => item?.status === 'pending');
  return c.json({ articles: pending });
});

// Old: /ai-agent/news/:id/moderate
aiAgent.post('/news/:id/moderate', async (c: Context) => {
  const newsId = c.req.param('id');
  const { action } = await c.req.json();
  const newsData = await kv.get(`news:public:${newsId}`) as any;
  if (!newsData) return c.json({ error: 'Not found' }, 404);
  const news = typeof newsData === 'string' ? JSON.parse(newsData) : newsData;
  if (action === 'approve') {
    news.status = 'published';
    news.publishedAt = new Date().toISOString();
  } else {
    news.status = 'rejected';
  }
  news.moderatedAt = new Date().toISOString();
  await kv.set(`news:public:${newsId}`, news);
  return c.json({ success: true, article: news });
});

export default aiAgent;