# RADIO ANALYTICS - СЕРВЕРНЫЕ ФУНКЦИИ

## API ENDPOINTS ДЛЯ АНАЛИТИКИ РАДИОСТАНЦИЙ

### 📊 1. GET /make-server-84730125/radio/:stationId/analytics/overview
**Получение общей сводки аналитики**

**Query Parameters:**
- `period` - 'today' | 'week' | 'month' | 'year' (default: 'week')

**Response:**
```typescript
{
  revenue: {
    total: 125000,
    growth: 24.5,
    station: 106250,  // 85%
    platform: 18750,  // 15%
    trend: 'up'
  },
  requests: {
    total: 48,
    pending: 12,
    approved: 32,
    rejected: 4,
    approvalRate: 88.9,
    avgModerationTime: 45 // минуты
  },
  listeners: {
    total: 145000,
    growth: 18.2,
    unique: 42000,
    avgSessionTime: 1850, // секунды
    peakListeners: 3200
  },
  content: {
    totalPlays: 1250,
    artistPlays: 820,
    venuePlays: 430,
    impressions: 385000,
    engagementRate: 76.5
  }
}
```

**SQL Query:**
```sql
-- Доход за период
SELECT 
  SUM(total_price) as revenue_total,
  SUM(station_payout) as revenue_station,
  SUM(platform_fee) as revenue_platform
FROM radio_analytics_requests
WHERE station_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
  AND status NOT IN ('rejected', 'cancelled');

-- Заявки за период
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  AVG(moderation_time_minutes) as avg_moderation_time
FROM radio_analytics_requests
WHERE station_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3;

-- Слушатели за период
SELECT 
  SUM(unique_listeners) as total_listeners,
  AVG(unique_listeners) as avg_daily_listeners,
  MAX(peak_listeners) as peak_listeners,
  AVG(avg_listening_time) as avg_session_time
FROM radio_analytics_daily
WHERE station_id = $1 
  AND date >= $2 
  AND date <= $3;

-- Контент за период
SELECT 
  SUM(total_plays) as total_plays,
  SUM(total_impressions) as total_impressions,
  AVG(avg_engagement_rate) as engagement_rate
FROM radio_analytics_requests
WHERE station_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
  AND status IN ('in_progress', 'completed');
```

---

### 📈 2. GET /make-server-84730125/radio/:stationId/analytics/revenue-chart
**Получение данных для графика доходов**

**Query Parameters:**
- `period` - 'week' | 'month' | 'year' (default: 'week')

**Response:**
```typescript
[
  {
    name: 'Пн',
    revenue: 15000,
    payout: 12750,
    fee: 2250,
    date: '2026-02-03'
  },
  // ... остальные дни
]
```

**SQL Query:**
```sql
-- По дням (неделя)
SELECT 
  date,
  TO_CHAR(date, 'Dy') as name,
  revenue_total as revenue,
  payout_station as payout,
  platform_fee as fee
FROM radio_analytics_daily
WHERE station_id = $1 
  AND date >= $2 
  AND date <= $3
ORDER BY date;

-- По месяцам (год)
SELECT 
  DATE_TRUNC('month', date) as month,
  TO_CHAR(DATE_TRUNC('month', date), 'Mon') as name,
  SUM(revenue_total) as revenue,
  SUM(payout_station) as payout,
  SUM(platform_fee) as fee
FROM radio_analytics_daily
WHERE station_id = $1 
  AND date >= $2 
  AND date <= $3
GROUP BY month
ORDER BY month;
```

---

### 📊 3. GET /make-server-84730125/radio/:stationId/analytics/requests-chart
**Получение данных для графика заявок**

**Response:**
```typescript
[
  {
    name: 'Пн',
    artist: 5,
    venue: 3,
    approved: 6,
    rejected: 2,
    date: '2026-02-03'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  DATE(submitted_at) as date,
  TO_CHAR(DATE(submitted_at), 'Dy') as name,
  COUNT(*) FILTER (WHERE request_type = 'artist') as artist,
  COUNT(*) FILTER (WHERE request_type = 'venue') as venue,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM radio_analytics_requests
WHERE station_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
GROUP BY date
ORDER BY date;
```

---

### 👥 4. GET /make-server-84730125/radio/:stationId/analytics/listeners-chart
**Получение данных для графика аудитории**

**Response:**
```typescript
[
  {
    name: 'Пн',
    listeners: 18000,
    unique: 5200,
    date: '2026-02-03'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  date,
  TO_CHAR(date, 'Dy') as name,
  total_impressions as listeners,
  unique_listeners as unique
FROM radio_analytics_daily
WHERE station_id = $1 
  AND date >= $2 
  AND date <= $3
ORDER BY date;
```

---

### 🎵 5. GET /make-server-84730125/radio/:stationId/analytics/content-distribution
**Получение распределения контента (для Pie Chart)**

**Response:**
```typescript
{
  artist: {
    count: 820,
    percentage: 65.6
  },
  venue: {
    count: 430,
    percentage: 34.4
  }
}
```

**SQL Query:**
```sql
SELECT 
  request_type,
  SUM(completed_plays) as plays,
  COUNT(*) as requests
FROM radio_analytics_requests
WHERE station_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
  AND status IN ('in_progress', 'completed')
GROUP BY request_type;
```

---

### 🏆 6. GET /make-server-84730125/radio/:stationId/analytics/top-clients
**Получение топ клиентов**

**Query Parameters:**
- `limit` - количество клиентов (default: 10)
- `type` - 'all' | 'artist' | 'venue' (default: 'all')

**Response:**
```typescript
[
  {
    id: 'client123',
    name: 'DJ Alexey',
    type: 'artist',
    revenue: 25000,
    plays: 180,
    rating: 4.9,
    requestsCount: 3
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  client_id,
  client_name as name,
  request_type as type,
  SUM(total_price) as revenue,
  SUM(completed_plays) as plays,
  COUNT(*) as requests_count,
  AVG(avg_engagement_rate) as avg_engagement
FROM radio_analytics_requests
WHERE station_id = $1 
  AND submitted_at >= $2 
  AND submitted_at <= $3
  AND status IN ('approved', 'in_progress', 'completed')
GROUP BY client_id, client_name, request_type
ORDER BY revenue DESC
LIMIT $4;
```

---

### 🕐 7. GET /make-server-84730125/radio/:stationId/analytics/hourly-content
**Получение почасовой аналитики контента**

**Query Parameters:**
- `date` - дата в формате YYYY-MM-DD (default: today)

**Response:**
```typescript
[
  {
    hour: '00:00',
    plays: 45,
    listeners: 850,
    hourValue: 0
  },
  // ... каждые 4 часа
]
```

**SQL Query:**
```sql
SELECT 
  hour,
  LPAD(hour::TEXT, 2, '0') || ':00' as hour_display,
  total_ads_played as plays,
  listeners_count as listeners
FROM radio_analytics_content
WHERE station_id = $1 
  AND date = $2
ORDER BY hour;

-- Группировка по 4 часа для компактности
SELECT 
  (hour / 4) * 4 as hour_group,
  LPAD(((hour / 4) * 4)::TEXT, 2, '0') || ':00' as hour_display,
  SUM(total_ads_played) as plays,
  AVG(listeners_count)::INT as listeners
FROM radio_analytics_content
WHERE station_id = $1 
  AND date = $2
GROUP BY hour_group
ORDER BY hour_group;
```

---

### 📱 8. GET /make-server-84730125/radio/:stationId/analytics/recent-activity
**Получение последней активности**

**Query Parameters:**
- `limit` - количество событий (default: 10)

**Response:**
```typescript
[
  {
    type: 'approved',
    text: 'Одобрена заявка от DJ Alexey',
    time: '2026-02-03T10:30:00Z',
    timeAgo: '5 мин назад'
  },
  // ...
]
```

**SQL Query:**
```sql
SELECT 
  CASE 
    WHEN status = 'approved' AND approved_at IS NOT NULL THEN 'approved'
    WHEN status = 'rejected' THEN 'rejected'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'pending' THEN 'new'
    ELSE 'other'
  END as type,
  CASE 
    WHEN status = 'approved' THEN 'Одобрена заявка от ' || client_name
    WHEN status = 'rejected' THEN 'Отклонена заявка от ' || client_name
    WHEN status = 'completed' THEN 'Завершена кампания ' || client_name
    WHEN status = 'pending' THEN 'Новая заявка от ' || client_name
  END as text,
  COALESCE(approved_at, submitted_at, created_at) as time
FROM radio_analytics_requests
WHERE station_id = $1
ORDER BY time DESC
LIMIT $2;
```

---

## 🔧 СЕРВЕРНАЯ ФУНКЦИЯ: Обновление аналитики

```typescript
// /supabase/functions/server/analytics.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * Обновление ежедневной аналитики для радиостанции
 * Вызывается по крону каждый день в 00:00
 */
export async function updateDailyAnalytics(stationId: string, date: string) {
  // 1. Подсчет заявок
  const { data: requestsStats } = await supabase
    .from('radio_analytics_requests')
    .select('status, request_type, total_price, station_payout, platform_fee')
    .eq('station_id', stationId)
    .gte('submitted_at', `${date}T00:00:00`)
    .lt('submitted_at', `${date}T23:59:59`);

  const artistRequests = requestsStats?.filter(r => r.request_type === 'artist') || [];
  const venueRequests = requestsStats?.filter(r => r.request_type === 'venue') || [];

  // 2. Подсчет финансов
  const revenueTotal = requestsStats?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0;
  const payoutStation = requestsStats?.reduce((sum, r) => sum + (r.station_payout || 0), 0) || 0;
  const platformFee = requestsStats?.reduce((sum, r) => sum + (r.platform_fee || 0), 0) || 0;

  // 3. Вставка/обновление записи
  await supabase
    .from('radio_analytics_daily')
    .upsert({
      station_id: stationId,
      date: date,
      
      artist_requests_total: artistRequests.length,
      artist_requests_pending: artistRequests.filter(r => r.status === 'pending').length,
      artist_requests_approved: artistRequests.filter(r => r.status === 'approved').length,
      artist_requests_rejected: artistRequests.filter(r => r.status === 'rejected').length,
      
      venue_requests_total: venueRequests.length,
      venue_requests_pending: venueRequests.filter(r => r.status === 'pending').length,
      venue_requests_approved: venueRequests.filter(r => r.status === 'approved').length,
      venue_requests_rejected: venueRequests.filter(r => r.status === 'rejected').length,
      
      revenue_total: revenueTotal,
      payout_station: payoutStation,
      platform_fee: platformFee,
      
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'station_id,date'
    });

  return { success: true };
}

/**
 * Расчет финансовой аналитики за период
 */
export async function calculateFinancialAnalytics(
  stationId: string,
  periodType: 'daily' | 'weekly' | 'monthly',
  startDate: string,
  endDate: string
) {
  const { data: requests } = await supabase
    .from('radio_analytics_requests')
    .select('*')
    .eq('station_id', stationId)
    .gte('submitted_at', startDate)
    .lte('submitted_at', endDate)
    .not('status', 'in', '(rejected,cancelled)');

  const revenueArtist = requests?.filter(r => r.request_type === 'artist')
    .reduce((sum, r) => sum + r.total_price, 0) || 0;
  
  const revenueVenue = requests?.filter(r => r.request_type === 'venue')
    .reduce((sum, r) => sum + r.total_price, 0) || 0;
  
  const revenueTotal = revenueArtist + revenueVenue;
  const payoutStation = revenueTotal * 0.85;
  const platformFee = revenueTotal * 0.15;

  // Разбивка по пакетам
  const revenue5sec = requests?.filter(r => r.package_type === '5sec').reduce((sum, r) => sum + r.total_price, 0) || 0;
  const revenue10sec = requests?.filter(r => r.package_type === '10sec').reduce((sum, r) => sum + r.total_price, 0) || 0;
  const revenue15sec = requests?.filter(r => r.package_type === '15sec').reduce((sum, r) => sum + r.total_price, 0) || 0;
  const revenue30sec = requests?.filter(r => r.package_type === '30sec').reduce((sum, r) => sum + r.total_price, 0) || 0;

  await supabase
    .from('radio_analytics_financial')
    .upsert({
      station_id: stationId,
      period_type: periodType,
      period_start: startDate,
      period_end: endDate,
      revenue_artist: revenueArtist,
      revenue_venue: revenueVenue,
      revenue_total: revenueTotal,
      payout_station: payoutStation,
      platform_fee: platformFee,
      revenue_5sec: revenue5sec,
      revenue_10sec: revenue10sec,
      revenue_15sec: revenue15sec,
      revenue_30sec: revenue30sec,
      transactions_count: requests?.length || 0,
      avg_transaction_amount: requests?.length ? revenueTotal / requests.length : 0,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'station_id,period_type,period_start'
    });

  return {
    revenueTotal,
    payoutStation,
    platformFee,
    breakdown: { revenue5sec, revenue10sec, revenue15sec, revenue30sec }
  };
}
```

---

## 📅 CRON JOBS

### Ежедневное обновление аналитики
```bash
# Запускается каждый день в 00:05
# POST /make-server-84730125/cron/update-daily-analytics

# Псевдокод:
1. Получить список всех активных радиостанций
2. Для каждой станции:
   - updateDailyAnalytics(stationId, yesterday)
   - calculateFinancialAnalytics(stationId, 'daily', yesterday, yesterday)
3. Обновить рейтинги станций
4. Отправить email-отчеты (если настроено)
```

### Еженедельное обновление
```bash
# Запускается каждый понедельник в 01:00
# POST /make-server-84730125/cron/update-weekly-analytics

# Псевдокод:
1. Для каждой станции:
   - calculateFinancialAnalytics(stationId, 'weekly', lastWeekStart, lastWeekEnd)
2. Обновить тренды и прогнозы
```

---

## 🎯 ПРОИЗВОДИТЕЛЬНОСТЬ

### Индексы для быстрых запросов
```sql
-- Уже созданы в RADIO_ANALYTICS_SQL.md
CREATE INDEX idx_radio_analytics_daily_station_date ON radio_analytics_daily(station_id, date DESC);
CREATE INDEX idx_radio_analytics_requests_station ON radio_analytics_requests(station_id);
CREATE INDEX idx_radio_analytics_requests_submitted ON radio_analytics_requests(submitted_at DESC);
```

### Кэширование
- Общая сводка кэшируется на 5 минут
- Графики кэшируются на 15 минут
- Топ клиентов кэшируется на 1 час

---

## ✅ ИТОГО

**Создано:**
- 7 API endpoints для аналитики
- 2 серверные функции для расчетов
- SQL запросы для всех метрик
- Система автоматического обновления
- План по CRON jobs

**Все готово для интеграции!** 🚀
