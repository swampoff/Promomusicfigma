# VENUE ANALYTICS - API И СЕРВЕРНЫЕ ФУНКЦИИ

## 📊 API ENDPOINTS ДЛЯ АНАЛИТИКИ ЗАВЕДЕНИЙ

### 1. GET /make-server-84730125/venue/:venueId/analytics/overview
**Получение общей сводки аналитики**

**Query Parameters:**
- `period` - 'today' | 'week' | 'month' | 'year' (default: 'month')

**Response:**
```typescript
{
  spending: {
    total: 85000,
    growth: -5.2,  // Отрицательный = снижение затрат (хорошо)
    thisMonth: 85000,
    lastMonth: 89500,
    trend: 'down'
  },
  campaigns: {
    active: 3,
    total: 8,
    completed: 5,
    successRate: 87.5,
    avgDuration: 14  // дней
  },
  reach: {
    totalImpressions: 425000,
    uniqueListeners: 58000,
    growth: 32.5,
    avgPerCampaign: 53125
  },
  performance: {
    avgROI: 245,
    completionRate: 78.5,
    engagementRate: 82.3,
    conversionRate: 4.2
  }
}
```

**SQL Query:**
```sql
-- Затраты за период
SELECT 
  SUM(total_price) as spending_total
FROM radio_venue_ads
WHERE venue_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
  AND status NOT IN ('rejected', 'cancelled');

-- Кампании
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'in_progress') as active,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  AVG(duration_days) as avg_duration
FROM radio_venue_ads
WHERE venue_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3;

-- Охваты
SELECT 
  SUM(total_impressions) as total_impressions,
  SUM(unique_listeners) as unique_listeners,
  AVG(total_impressions) as avg_per_campaign
FROM venue_analytics_campaigns
WHERE venue_id = $1 
  AND start_date >= $2 
  AND end_date <= $3;

-- Эффективность
SELECT 
  AVG(roi_percentage) as avg_roi,
  AVG(completion_rate) as completion_rate,
  AVG(engagement_rate) as engagement_rate,
  AVG(conversion_rate) as conversion_rate
FROM venue_analytics_campaigns
WHERE venue_id = $1 
  AND start_date >= $2 
  AND end_date <= $3;
```

---

### 2. GET /make-server-84730125/venue/:venueId/analytics/spending-chart
**График затрат на рекламу**

**Query Parameters:**
- `period` - 'week' | 'month' | 'year' (default: 'month')

**Response:**
```typescript
[
  {
    name: 'Нед 1',
    spending: 18000,
    budget: 25000,
    date: '2026-02-03'
  },
  // ...
]
```

**SQL Query:**
```sql
-- По неделям (месяц)
SELECT 
  DATE_TRUNC('week', submitted_at) as week,
  'Нед ' || EXTRACT(WEEK FROM submitted_at) as name,
  SUM(total_price) as spending,
  -- Бюджет можно брать из настроек venue
  (SELECT monthly_ad_budget FROM venues WHERE id = $1) / 4 as budget
FROM radio_venue_ads
WHERE venue_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
  AND status NOT IN ('rejected', 'cancelled')
GROUP BY week
ORDER BY week;
```

---

### 3. GET /make-server-84730125/venue/:venueId/analytics/campaigns-chart
**График кампаний**

**Response:**
```typescript
[
  {
    name: 'Нед 1',
    active: 2,
    completed: 1,
    date: '2026-02-03'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  DATE_TRUNC('week', submitted_at) as week,
  'Нед ' || EXTRACT(WEEK FROM submitted_at) as name,
  COUNT(*) FILTER (WHERE status = 'in_progress') as active,
  COUNT(*) FILTER (WHERE status = 'completed') as completed
FROM radio_venue_ads
WHERE venue_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
GROUP BY week
ORDER BY week;
```

---

### 4. GET /make-server-84730125/venue/:venueId/analytics/reach-chart
**График охватов**

**Response:**
```typescript
[
  {
    name: 'Нед 1',
    impressions: 85000,
    unique: 12000,
    date: '2026-02-03'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  DATE_TRUNC('week', start_date) as week,
  'Нед ' || EXTRACT(WEEK FROM start_date) as name,
  SUM(total_impressions) as impressions,
  SUM(unique_listeners) as unique
FROM venue_analytics_campaigns
WHERE venue_id = $1 
  AND start_date >= $2 
  AND end_date <= $3
GROUP BY week
ORDER BY week;
```

---

### 5. GET /make-server-84730125/venue/:venueId/analytics/roi-chart
**График ROI**

**Response:**
```typescript
[
  {
    name: 'Нед 1',
    roi: 220,
    target: 200,
    date: '2026-02-03'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  DATE_TRUNC('week', start_date) as week,
  'Нед ' || EXTRACT(WEEK FROM start_date) as name,
  AVG(roi_percentage) as roi,
  200 as target  -- Целевой ROI из настроек venue
FROM venue_analytics_campaigns
WHERE venue_id = $1 
  AND start_date >= $2 
  AND end_date <= $3
GROUP BY week
ORDER BY week;
```

---

### 6. GET /make-server-84730125/venue/:venueId/analytics/active-campaigns
**Активные кампании с детальной информацией**

**Response:**
```typescript
[
  {
    id: 'campaign_id',
    radioStationName: 'PROMO.FM Radio',
    packageType: '15sec',
    completedPlays: 85,
    targetPlays: 120,
    roi: 245,
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-02-15'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  rva.id,
  rs.name as radio_station_name,
  rva.package_type,
  rva.completed_plays,
  rva.target_plays,
  vac.roi_percentage as roi,
  rva.status,
  rva.start_date,
  rva.end_date
FROM radio_venue_ads rva
JOIN radio_stations rs ON rs.id = rva.station_id
LEFT JOIN venue_analytics_campaigns vac ON vac.campaign_id = rva.id
WHERE rva.venue_id = $1 
  AND rva.status = 'in_progress'
ORDER BY rva.start_date DESC;
```

---

### 7. GET /make-server-84730125/venue/:venueId/analytics/radio-comparison
**Сравнение радиостанций**

**Query Parameters:**
- `period` - 'week' | 'month' | 'year' (default: 'month')

**Response:**
```typescript
[
  {
    stationName: 'PROMO.FM Radio',
    campaignsCount: 5,
    avgROI: 245,
    totalReach: 125000,
    performanceScore: 9.2
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  rs.name as station_name,
  COUNT(vac.id) as campaigns_count,
  AVG(vac.roi_percentage) as avg_roi,
  SUM(vac.total_impressions) as total_reach,
  AVG(vac.performance_score) as performance_score
FROM venue_analytics_campaigns vac
JOIN radio_stations rs ON rs.id = vac.radio_station_id
WHERE vac.venue_id = $1 
  AND vac.start_date >= $2 
  AND vac.end_date <= $3
GROUP BY rs.id, rs.name
ORDER BY performance_score DESC
LIMIT 10;
```

---

### 8. GET /make-server-84730125/venue/:venueId/analytics/recommendations
**Рекомендации по оптимизации рекламы**

**Response:**
```typescript
{
  recommendations: [
    {
      type: 'best_station',
      text: 'PROMO.FM показывает лучший ROI 245%',
      icon: 'TrendingUp',
      priority: 'high'
    },
    {
      type: 'format_suggestion',
      text: 'Попробуйте 15-сек формат - выше вовлеченность',
      icon: 'Target',
      priority: 'medium'
    },
    // ...
  ],
  bestStation: {
    name: 'PROMO.FM Radio',
    roi: 245,
    reason: 'Самый высокий ROI за последний месяц'
  },
  bestTimeSlot: {
    time: '08:00-10:00',
    reach: 'Утренние часы дают на 35% больше охвата'
  }
}
```

**SQL Query:**
```sql
-- Лучшая станция
SELECT 
  rs.name,
  AVG(vac.roi_percentage) as avg_roi,
  SUM(vac.total_impressions) as total_reach
FROM venue_analytics_campaigns vac
JOIN radio_stations rs ON rs.id = vac.radio_station_id
WHERE vac.venue_id = $1 
  AND vac.start_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY rs.id, rs.name
ORDER BY avg_roi DESC
LIMIT 1;

-- Лучший формат
SELECT 
  package_type,
  AVG(engagement_rate) as avg_engagement,
  AVG(roi_percentage) as avg_roi
FROM venue_analytics_campaigns
WHERE venue_id = $1 
  AND start_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY package_type
ORDER BY avg_engagement DESC
LIMIT 1;
```

---

## 🔧 СЕРВЕРНЫЕ ФУНКЦИИ

### Обновление аналитики кампании
```typescript
// /supabase/functions/server/venue-analytics.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * Обновление аналитики при завершении кампании
 */
export async function updateCampaignAnalytics(campaignId: string) {
  // 1. Получить данные кампании
  const { data: campaign } = await supabase
    .from('radio_venue_ads')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (!campaign) return;

  // 2. Рассчитать метрики
  const completionRate = (campaign.completed_plays / campaign.target_plays) * 100;
  const costPerPlay = campaign.total_price / campaign.completed_plays;
  const costPerImpression = campaign.total_price / (campaign.total_impressions || 1);
  
  // 3. Оценить эффективность (0-10)
  const performanceScore = calculatePerformanceScore({
    completionRate,
    engagementRate: campaign.engagement_rate || 0,
    roi: campaign.roi_percentage || 0
  });

  // 4. Сохранить в venue_analytics_campaigns
  await supabase
    .from('venue_analytics_campaigns')
    .upsert({
      venue_id: campaign.venue_id,
      campaign_id: campaign.id,
      radio_station_id: campaign.station_id,
      radio_station_name: campaign.station_name,
      package_type: campaign.package_type,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      duration_days: campaign.duration_days,
      target_plays: campaign.target_plays,
      completed_plays: campaign.completed_plays,
      progress_percentage: (campaign.completed_plays / campaign.target_plays) * 100,
      total_impressions: campaign.total_impressions || 0,
      unique_listeners: campaign.unique_listeners || 0,
      completion_rate: completionRate,
      engagement_rate: campaign.engagement_rate || 0,
      total_cost: campaign.total_price,
      cost_per_play: costPerPlay,
      cost_per_impression: costPerImpression,
      roi_percentage: campaign.roi_percentage || 0,
      performance_score: performanceScore,
      status: campaign.status,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'campaign_id'
    });

  return { success: true };
}

/**
 * Расчет оценки эффективности кампании (0-10)
 */
function calculatePerformanceScore(metrics: {
  completionRate: number;
  engagementRate: number;
  roi: number;
}): number {
  // Веса для разных метрик
  const weights = {
    completion: 0.3,
    engagement: 0.3,
    roi: 0.4
  };

  // Нормализация метрик к шкале 0-10
  const normalizedCompletion = Math.min(metrics.completionRate / 10, 10);
  const normalizedEngagement = Math.min(metrics.engagementRate / 10, 10);
  const normalizedROI = Math.min(metrics.roi / 30, 10); // ROI 300% = 10 баллов

  // Взвешенная сумма
  const score = 
    normalizedCompletion * weights.completion +
    normalizedEngagement * weights.engagement +
    normalizedROI * weights.roi;

  return Math.round(score * 10) / 10;
}

/**
 * Обновление ежедневной аналитики заведения
 */
export async function updateVenueDailyAnalytics(venueId: string, date: string) {
  // Получить все кампании за день
  const { data: campaigns } = await supabase
    .from('venue_analytics_campaigns')
    .select('*')
    .eq('venue_id', venueId)
    .lte('start_date', date)
    .gte('end_date', date);

  if (!campaigns || campaigns.length === 0) return;

  // Агрегировать данные
  const analytics = {
    active_campaigns: campaigns.filter(c => c.status === 'active').length,
    total_campaigns: campaigns.length,
    total_plays: campaigns.reduce((sum, c) => sum + c.completed_plays, 0),
    total_impressions: campaigns.reduce((sum, c) => sum + c.total_impressions, 0),
    unique_listeners: campaigns.reduce((sum, c) => sum + c.unique_listeners, 0),
    ad_spend_total: campaigns.reduce((sum, c) => sum + c.total_cost, 0),
    avg_completion_rate: campaigns.reduce((sum, c) => sum + c.completion_rate, 0) / campaigns.length,
    avg_engagement_rate: campaigns.reduce((sum, c) => sum + c.engagement_rate, 0) / campaigns.length,
  };

  // Сохранить
  await supabase
    .from('venue_analytics_daily')
    .upsert({
      venue_id: venueId,
      date: date,
      ...analytics,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'venue_id,date'
    });

  return { success: true };
}
```

---

## 📅 CRON JOBS

### Ежедневное обновление аналитики
```bash
# POST /make-server-84730125/cron/update-venue-analytics
# Запускается каждый день в 00:10

1. Получить список всех активных заведений с рекламными кампаниями
2. Для каждого заведения:
   - updateVenueDailyAnalytics(venueId, yesterday)
   - Обновить финансовую аналитику
   - Рассчитать ROI кампаний
3. Обновить рекомендации
```

---

## ✅ ИТОГО

**Создано:**
- 8 API endpoints для venue analytics
- 2 серверные функции для расчетов
- SQL запросы для всех метрик
- Система рекомендаций
- План CRON jobs

**Все готово для интеграции!** 🚀
