/**
 * CHARTS AGGREGATION ROUTES
 * Агрегация чартов из внешних источников (радиостанции и стриминги)
 * через Mistral для извлечения структурированных данных из HTML-страниц
 */

import { Hono } from "npm:hono@4";
import * as db from './db.tsx';

const charts = new Hono();

// ─── Chart Source Configuration ────────────────────────────

interface ChartSourceConfig {
  id: string;
  name: string;
  url: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  maxTracks: number;
  /** Описание формата для Mistral */
  parsingHint: string;
}

const CHART_SOURCES: ChartSourceConfig[] = [
  {
    id: 'russkoe',
    name: 'Русское Радио',
    url: 'https://russkoeradiofm.ru/hitparad/',
    logo: '🇷🇺',
    type: 'radio',
    gradient: 'from-red-500/20 to-blue-500/20',
    borderColor: 'border-red-500/30',
    maxTracks: 20,
    parsingHint: 'Хит-парад недели "Золотой граммофон". Извлеки ТОП-20 треков с позициями, названиями и исполнителями.',
  },
  {
    id: 'nashe',
    name: 'Наше Радио',
    url: 'https://www.nashe.ru/chartova',
    logo: '🎸',
    type: 'radio',
    gradient: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
    maxTracks: 13,
    parsingHint: 'Недельный хит-парад "Чартова дюжина". Извлеки 13 треков с позициями, названиями и исполнителями.',
  },
  {
    id: 'maximum',
    name: 'Радио Maximum',
    url: 'https://moskva.fm/charts/maximum.html',
    logo: '🎵',
    type: 'radio',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    maxTracks: 20,
    parsingHint: 'Хит-парад Maximum по ротации станции. Извлеки ТОП-20 треков с позициями, названиями и исполнителями.',
  },
  {
    id: 'dfm',
    name: 'DFM',
    url: 'https://dfm.ru/charts/top-30',
    logo: '🔊',
    type: 'radio',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    maxTracks: 30,
    parsingHint: 'Общий чарт DFM Top-30. Извлеки ТОП-30 треков с позициями, названиями и исполнителями.',
  },
  {
    id: 'europa',
    name: 'Europa Plus',
    url: 'https://europaplus.ru/programs/top40',
    logo: '🌟',
    type: 'radio',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    borderColor: 'border-yellow-500/30',
    maxTracks: 40,
    parsingHint: 'Europa Plus Top-40. Извлеки ТОП-40 треков с позициями, названиями и исполнителями.',
  },
  {
    id: 'yandex',
    name: 'Яндекс Музыка',
    url: 'https://music.yandex.ru/chart',
    logo: '🔴',
    type: 'streaming',
    gradient: 'from-red-600/20 to-yellow-600/20',
    borderColor: 'border-red-600/30',
    maxTracks: 20,
    parsingHint: 'Чарт Яндекс Музыки. Извлеки ТОП-20 треков с позициями, названиями и исполнителями.',
  },
  {
    id: 'vk',
    name: 'VK Музыка',
    url: 'https://music.vk.com',
    logo: '🎧',
    type: 'streaming',
    gradient: 'from-blue-600/20 to-indigo-600/20',
    borderColor: 'border-blue-600/30',
    maxTracks: 20,
    parsingHint: 'Чарт VK Музыки (треки по популярности). Извлеки ТОП-20 треков с позициями, названиями и исполнителями.',
  },
];

interface ChartTrackEntry {
  position: number;
  previousPosition: number;
  title: string;
  artist: string;
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
}

interface ExternalChartData {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  logo: string;
  type: 'radio' | 'streaming';
  gradient: string;
  borderColor: string;
  tracks: ChartTrackEntry[];
  fetchedAt: string;
  parsedBy: 'mistral' | 'fallback';
  error?: string;
}

// ─── HTML Fetching & Text Extraction ───────────────────────

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`Chart fetch failed for ${url}: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Strip HTML tags, scripts, styles to get clean text
    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to ~8000 chars to fit in Mistral context
    return cleanText.slice(0, 8000);
  } catch (error) {
    console.log(`Chart fetch error for ${url}: ${error}`);
    return null;
  }
}

// ─── Mistral Extraction ─────────────────────────────────────

async function extractChartWithMistral(
  sourceConfig: ChartSourceConfig,
  pageText: string,
): Promise<ChartTrackEntry[] | null> {
  const mistralKey = Deno.env.get('MISTRAL_API_KEY');
  if (!mistralKey) {
    console.log('MISTRAL_API_KEY not set, skipping chart extraction');
    return null;
  }

  const systemPrompt = `Ты - парсер музыкальных чартов. Из текста HTML-страницы извлеки список треков чарта.
${sourceConfig.parsingHint}

ВАЖНО:
- Верни ТОЛЬКО валидный JSON-массив
- Каждый элемент: {"position": число, "title": "Название трека", "artist": "Исполнитель"}
- Позиции начинаются с 1
- Максимум ${sourceConfig.maxTracks} треков
- Если не удалось извлечь чарт, верни пустой массив []
- НЕ добавляй markdown-обёртку, только чистый JSON
- Если трек содержит feat., оставь feat. в title`;

  try {
    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Вот текст страницы чарта "${sourceConfig.name}" (${sourceConfig.url}):\n\n${pageText}` },
        ],
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!resp.ok) {
      console.log(`Mistral chart extraction error for ${sourceConfig.id}: ${await resp.text()}`);
      return null;
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.log(`Mistral returned empty content for ${sourceConfig.id}`);
      return null;
    }

    // Parse the JSON response
    let parsed: any;
    try {
      // Try direct parse
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON array from text
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        console.log(`Failed to parse Mistral response for ${sourceConfig.id}: ${content.slice(0, 200)}`);
        return null;
      }
    }

    // Normalize: handle both {tracks: [...]} and [...] formats
    const rawTracks = Array.isArray(parsed) ? parsed : (parsed.tracks || parsed.chart || parsed.entries || []);

    if (!Array.isArray(rawTracks) || rawTracks.length === 0) {
      console.log(`No tracks parsed for ${sourceConfig.id}`);
      return null;
    }

    // Load previous chart to calculate trends
    const prevData: any = await db.kvGet(`chart:source:${sourceConfig.id}`);
    const prevTracks: ChartTrackEntry[] = prevData?.tracks || [];
    const prevPositionMap = new Map<string, number>();
    prevTracks.forEach(t => {
      prevPositionMap.set(`${t.artist}|||${t.title}`.toLowerCase(), t.position);
    });

    // Map to our format with trend calculation
    const entries: ChartTrackEntry[] = rawTracks
      .filter((t: any) => t.title && t.artist)
      .slice(0, sourceConfig.maxTracks)
      .map((t: any, idx: number) => {
        const position = t.position || idx + 1;
        const key = `${t.artist}|||${t.title}`.toLowerCase();
        const prevPos = prevPositionMap.get(key);

        let trend: ChartTrackEntry['trend'] = 'new';
        let trendValue = 0;

        if (prevPos !== undefined) {
          const diff = prevPos - position;
          if (diff > 0) {
            trend = 'up';
            trendValue = diff;
          } else if (diff < 0) {
            trend = 'down';
            trendValue = Math.abs(diff);
          } else {
            trend = 'same';
            trendValue = 0;
          }
        }

        return {
          position,
          previousPosition: prevPos ?? 0,
          title: String(t.title).trim(),
          artist: String(t.artist).trim(),
          trend,
          trendValue,
        };
      });

    console.log(`Extracted ${entries.length} tracks for ${sourceConfig.id} via Mistral`);
    return entries;
  } catch (error) {
    console.log(`Mistral extraction error for ${sourceConfig.id}: ${error}`);
    return null;
  }
}

// ─── Aggregation Logic ──────────────────────────────────────

async function aggregateSource(source: ChartSourceConfig): Promise<ExternalChartData> {
  const now = new Date().toISOString();

  // Step 1: Fetch page text
  const pageText = await fetchPageText(source.url);

  if (!pageText) {
    // Try to return cached data
    const cached: any = await db.kvGet(`chart:source:${source.id}`);
    if (cached && cached.tracks?.length > 0) {
      console.log(`Using cached chart data for ${source.id} (fetch failed)`);
      return { ...cached, error: 'Не удалось загрузить страницу, используются кэшированные данные' };
    }
    return {
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      logo: source.logo,
      type: source.type,
      gradient: source.gradient,
      borderColor: source.borderColor,
      tracks: [],
      fetchedAt: now,
      parsedBy: 'fallback',
      error: 'Не удалось загрузить страницу чарта',
    };
  }

  // Step 2: Extract chart with Mistral
  const tracks = await extractChartWithMistral(source, pageText);

  if (!tracks || tracks.length === 0) {
    // Return cached data if available
    const cached: any = await db.kvGet(`chart:source:${source.id}`);
    if (cached && cached.tracks?.length > 0) {
      console.log(`Using cached chart data for ${source.id} (extraction failed)`);
      return { ...cached, error: 'Извлечение не удалось, используются кэшированные данные' };
    }
    return {
      sourceId: source.id,
      sourceName: source.name,
      sourceUrl: source.url,
      logo: source.logo,
      type: source.type,
      gradient: source.gradient,
      borderColor: source.borderColor,
      tracks: [],
      fetchedAt: now,
      parsedBy: 'fallback',
      error: 'Не удалось извлечь данные чарта',
    };
  }

  // Step 3: Build result
  const result: ExternalChartData = {
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    logo: source.logo,
    type: source.type,
    gradient: source.gradient,
    borderColor: source.borderColor,
    tracks,
    fetchedAt: now,
    parsedBy: 'mistral',
  };

  // Step 4: Save to KV
  await db.kvSet(`chart:source:${source.id}`, result);
  console.log(`Chart saved for ${source.id}: ${tracks.length} tracks`);

  return result;
}

// ─── Routes ──────────────────────────────────────────────────

/**
 * GET /sources
 * Возвращает конфигурацию всех источников чартов
 */
charts.get('/sources', async (c) => {
  try {
    const sourcesWithData = await Promise.all(
      CHART_SOURCES.map(async (source) => {
        const data: any = await db.kvGet(`chart:source:${source.id}`);
        return {
          id: source.id,
          name: source.name,
          url: source.url,
          logo: source.logo,
          type: source.type,
          gradient: source.gradient,
          borderColor: source.borderColor,
          maxTracks: source.maxTracks,
          hasCachedData: !!(data?.tracks?.length > 0),
          tracksCount: data?.tracks?.length || 0,
          lastFetched: data?.fetchedAt || null,
          parsedBy: data?.parsedBy || null,
        };
      })
    );
    return c.json({ success: true, data: sourcesWithData });
  } catch (error) {
    console.log(`Error fetching chart sources: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /all
 * Возвращает данные всех чартов из KV (кэшированные)
 */
charts.get('/all', async (c) => {
  try {
    const allCharts: ExternalChartData[] = [];

    for (const source of CHART_SOURCES) {
      const data: any = await db.kvGet(`chart:source:${source.id}`);
      if (data && data.tracks?.length > 0) {
        allCharts.push(data);
      } else {
        // Return source config with empty tracks
        allCharts.push({
          sourceId: source.id,
          sourceName: source.name,
          sourceUrl: source.url,
          logo: source.logo,
          type: source.type,
          gradient: source.gradient,
          borderColor: source.borderColor,
          tracks: [],
          fetchedAt: '',
          parsedBy: 'fallback',
        });
      }
    }

    return c.json({ success: true, data: allCharts });
  } catch (error) {
    console.log(`Error fetching all charts: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /source/:id
 * Возвращает данные конкретного чарта из KV
 */
charts.get('/source/:id', async (c) => {
  try {
    const sourceId = c.req.param('id');
    const source = CHART_SOURCES.find(s => s.id === sourceId);
    if (!source) {
      return c.json({ success: false, error: `Chart source "${sourceId}" not found` }, 404);
    }

    const data: any = await db.kvGet(`chart:source:${sourceId}`);
    if (data && data.tracks?.length > 0) {
      return c.json({ success: true, data });
    }

    return c.json({
      success: true,
      data: {
        sourceId: source.id,
        sourceName: source.name,
        sourceUrl: source.url,
        logo: source.logo,
        type: source.type,
        gradient: source.gradient,
        borderColor: source.borderColor,
        tracks: [],
        fetchedAt: '',
        parsedBy: 'fallback',
      },
    });
  } catch (error) {
    console.log(`Error fetching chart source: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * POST /aggregate
 * Запускает агрегацию данных из внешних источников
 * Можно указать sourceIds для агрегации конкретных источников
 */
charts.post('/aggregate', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const requestedIds: string[] = body.sourceIds || [];

    const sourcesToProcess = requestedIds.length > 0
      ? CHART_SOURCES.filter(s => requestedIds.includes(s.id))
      : CHART_SOURCES;

    if (sourcesToProcess.length === 0) {
      return c.json({ success: false, error: 'No valid source IDs provided' }, 400);
    }

    console.log(`Starting chart aggregation for ${sourcesToProcess.length} sources: ${sourcesToProcess.map(s => s.id).join(', ')}`);

    // Process sources sequentially to avoid rate limiting
    const results: Array<{
      sourceId: string;
      sourceName: string;
      tracksFound: number;
      parsedBy: string;
      error?: string;
    }> = [];

    for (const source of sourcesToProcess) {
      try {
        const result = await aggregateSource(source);
        results.push({
          sourceId: result.sourceId,
          sourceName: result.sourceName,
          tracksFound: result.tracks.length,
          parsedBy: result.parsedBy,
          error: result.error,
        });
      } catch (err) {
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          tracksFound: 0,
          parsedBy: 'error',
          error: String(err),
        });
      }

      // Small delay between sources to be polite
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save aggregation timestamp
    await db.kvSet('chart:aggregation:last', {
      timestamp: new Date().toISOString(),
      sourcesProcessed: results.length,
      totalTracks: results.reduce((sum, r) => sum + r.tracksFound, 0),
      results,
    });

    console.log(`Chart aggregation complete: ${results.length} sources processed`);

    return c.json({ success: true, data: { results } });
  } catch (error) {
    console.log(`Chart aggregation error: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

/**
 * GET /aggregation-status
 * Возвращает статус последней агрегации
 */
charts.get('/aggregation-status', async (c) => {
  try {
    const status: any = await db.kvGet('chart:aggregation:last');
    return c.json({ success: true, data: status || null });
  } catch (error) {
    console.log(`Error fetching aggregation status: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

export default charts;
