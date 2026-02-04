# VENUE ANALYTICS - SQL СТРУКТУРА

## АНАЛИТИКА ЗАВЕДЕНИЙ
Полная система аналитики для баров, клубов, ресторанов с детальной статистикой рекламных кампаний, эффективности и финансов.

---

## 📊 ТАБЛИЦА 1: venue_analytics_daily
**Ежедневная сводная статистика по заведению**

```sql
CREATE TABLE venue_analytics_daily (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Рекламные кампании
  active_campaigns INT DEFAULT 0,
  total_campaigns INT DEFAULT 0,
  new_campaigns INT DEFAULT 0,
  completed_campaigns INT DEFAULT 0,
  
  -- Проигрывания и охваты
  total_plays INT DEFAULT 0,                  -- Всего проигрываний рекламы
  total_impressions INT DEFAULT 0,            -- Всего показов (слушателей)
  unique_listeners INT DEFAULT 0,             -- Уникальных слушателей
  avg_reach_per_play INT DEFAULT 0,           -- Средний охват на проигрывание
  
  -- Финансы (в копейках)
  ad_spend_total BIGINT DEFAULT 0,            -- Общие затраты на рекламу
  ad_spend_5sec BIGINT DEFAULT 0,             -- Затраты на 5-сек ролики
  ad_spend_10sec BIGINT DEFAULT 0,            -- Затраты на 10-сек ролики
  ad_spend_15sec BIGINT DEFAULT 0,            -- Затраты на 15-сек ролики
  ad_spend_30sec BIGINT DEFAULT 0,            -- Затраты на 30-сек ролики
  
  -- Эффективность
  avg_completion_rate DECIMAL(5,2) DEFAULT 0, -- Процент досмотров
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0, -- Вовлеченность
  click_through_rate DECIMAL(5,2) DEFAULT 0,  -- CTR (если есть ссылки)
  
  -- Посещаемость заведения (если интегрировано)
  visitors_count INT DEFAULT 0,               -- Посетителей за день
  new_visitors INT DEFAULT 0,                 -- Новых посетителей
  bookings_count INT DEFAULT 0,               -- Броней столиков
  
  -- ROI и конверсии
  estimated_revenue BIGINT DEFAULT 0,         -- Предполагаемый доход
  roi_percentage DECIMAL(5,2) DEFAULT 0,      -- ROI = (Revenue - Cost) / Cost * 100
  conversion_rate DECIMAL(5,2) DEFAULT 0,     -- Конверсия слушателей в посетителей
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(venue_id, date)
);

CREATE INDEX idx_venue_analytics_daily_venue ON venue_analytics_daily(venue_id);
CREATE INDEX idx_venue_analytics_daily_date ON venue_analytics_daily(date DESC);
CREATE INDEX idx_venue_analytics_daily_venue_date ON venue_analytics_daily(venue_id, date DESC);
```

---

## 📈 ТАБЛИЦА 2: venue_analytics_campaigns
**Детальная аналитика по каждой рекламной кампании**

```sql
CREATE TABLE venue_analytics_campaigns (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL,                  -- ID кампании в radio_venue_ads
  
  -- Информация о кампании
  radio_station_id UUID NOT NULL REFERENCES radio_stations(id),
  radio_station_name VARCHAR(255) NOT NULL,
  package_type VARCHAR(20) NOT NULL,          -- '5sec', '10sec', '15sec', '30sec'
  
  -- Даты
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INT NOT NULL,
  
  -- Проигрывания
  target_plays INT NOT NULL,
  completed_plays INT DEFAULT 0,
  plays_per_day INT NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Охваты и эффективность
  total_impressions INT DEFAULT 0,
  unique_listeners INT DEFAULT 0,
  avg_listeners_per_play INT DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,     -- Процент досмотров
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Финансы (в копейках)
  total_cost BIGINT NOT NULL,
  cost_per_play BIGINT DEFAULT 0,
  cost_per_impression BIGINT DEFAULT 0,
  cost_per_listener BIGINT DEFAULT 0,
  
  -- Результаты
  estimated_visitors INT DEFAULT 0,           -- Оценочное количество посетителей
  actual_visitors INT DEFAULT 0,              -- Фактических (если есть данные)
  bookings_generated INT DEFAULT 0,           -- Сгенерированных броней
  revenue_generated BIGINT DEFAULT 0,         -- Сгенерированный доход
  roi_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Статус
  status VARCHAR(20) NOT NULL,                -- 'pending', 'active', 'completed', 'cancelled'
  
  -- Рейтинг кампании
  performance_score DECIMAL(3,1) DEFAULT 0,   -- 0-10, общая оценка эффективности
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_analytics_campaigns_venue ON venue_analytics_campaigns(venue_id);
CREATE INDEX idx_venue_analytics_campaigns_radio ON venue_analytics_campaigns(radio_station_id);
CREATE INDEX idx_venue_analytics_campaigns_status ON venue_analytics_campaigns(status);
CREATE INDEX idx_venue_analytics_campaigns_dates ON venue_analytics_campaigns(start_date, end_date);
```

---

## 📻 ТАБЛИЦА 3: venue_analytics_radio_stations
**Сравнительная аналитика по радиостанциям**

```sql
CREATE TABLE venue_analytics_radio_stations (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  radio_station_id UUID NOT NULL REFERENCES radio_stations(id),
  
  -- Период
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL,           -- 'weekly', 'monthly', 'yearly'
  
  -- Кампании
  campaigns_count INT DEFAULT 0,
  active_campaigns INT DEFAULT 0,
  completed_campaigns INT DEFAULT 0,
  
  -- Проигрывания и охваты
  total_plays INT DEFAULT 0,
  total_impressions INT DEFAULT 0,
  unique_listeners INT DEFAULT 0,
  avg_listeners_per_campaign INT DEFAULT 0,
  
  -- Финансы (в копейках)
  total_spend BIGINT DEFAULT 0,
  avg_cost_per_campaign BIGINT DEFAULT 0,
  cost_per_impression BIGINT DEFAULT 0,
  
  -- Эффективность
  avg_completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_roi DECIMAL(5,2) DEFAULT 0,
  performance_score DECIMAL(3,1) DEFAULT 0,   -- 0-10
  
  -- Конверсии
  estimated_visitors INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue_generated BIGINT DEFAULT 0,
  
  -- Рекомендации
  recommended BOOLEAN DEFAULT false,          -- Рекомендуется ли эта станция
  recommendation_score INT DEFAULT 0,         -- 0-100
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(venue_id, radio_station_id, period_type, period_start)
);

CREATE INDEX idx_venue_analytics_radio_venue ON venue_analytics_radio_stations(venue_id);
CREATE INDEX idx_venue_analytics_radio_station ON venue_analytics_radio_stations(radio_station_id);
CREATE INDEX idx_venue_analytics_radio_period ON venue_analytics_radio_stations(period_start DESC);
CREATE INDEX idx_venue_analytics_radio_score ON venue_analytics_radio_stations(performance_score DESC);
```

---

## 💰 ТАБЛИЦА 4: venue_analytics_financial
**Детальная финансовая аналитика**

```sql
CREATE TABLE venue_analytics_financial (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Период
  period_type VARCHAR(20) NOT NULL,           -- 'daily', 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Затраты на рекламу (в копейках)
  ad_spend_total BIGINT DEFAULT 0,
  ad_spend_5sec BIGINT DEFAULT 0,
  ad_spend_10sec BIGINT DEFAULT 0,
  ad_spend_15sec BIGINT DEFAULT 0,
  ad_spend_30sec BIGINT DEFAULT 0,
  
  -- Разбивка по станциям (топ-3)
  top_station_1_spend BIGINT DEFAULT 0,
  top_station_1_name VARCHAR(255),
  top_station_2_spend BIGINT DEFAULT 0,
  top_station_2_name VARCHAR(255),
  top_station_3_spend BIGINT DEFAULT 0,
  top_station_3_name VARCHAR(255),
  
  -- Результаты
  total_impressions INT DEFAULT 0,
  total_plays INT DEFAULT 0,
  estimated_visitors INT DEFAULT 0,
  actual_visitors INT DEFAULT 0,
  bookings_count INT DEFAULT 0,
  
  -- Доходы (в копейках)
  estimated_revenue BIGINT DEFAULT 0,         -- Предполагаемый доход от рекламы
  actual_revenue BIGINT DEFAULT 0,            -- Фактический (если есть данные)
  
  -- ROI и эффективность
  roi_percentage DECIMAL(5,2) DEFAULT 0,
  cost_per_visitor BIGINT DEFAULT 0,
  cost_per_booking BIGINT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Бюджет
  budget_allocated BIGINT DEFAULT 0,          -- Выделенный бюджет
  budget_spent BIGINT DEFAULT 0,              -- Потраченный
  budget_remaining BIGINT DEFAULT 0,          -- Остаток
  budget_utilization DECIMAL(5,2) DEFAULT 0,  -- Процент использования
  
  -- Тренды
  growth_rate DECIMAL(5,2) DEFAULT 0,         -- Рост относительно предыдущего периода
  previous_period_spend BIGINT DEFAULT 0,
  
  -- Прогнозы
  projected_spend BIGINT DEFAULT 0,           -- Прогноз на следующий период
  projected_roi DECIMAL(5,2) DEFAULT 0,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(venue_id, period_type, period_start)
);

CREATE INDEX idx_venue_analytics_financial_venue ON venue_analytics_financial(venue_id);
CREATE INDEX idx_venue_analytics_financial_period ON venue_analytics_financial(period_type, period_start DESC);
CREATE INDEX idx_venue_analytics_financial_venue_period ON venue_analytics_financial(venue_id, period_start DESC);
```

---

## 📊 ТАБЛИЦА 5: venue_analytics_performance
**KPI и производительность заведения**

```sql
CREATE TABLE venue_analytics_performance (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Период
  period_type VARCHAR(20) NOT NULL,           -- 'daily', 'weekly', 'monthly'
  period_date DATE NOT NULL,
  
  -- KPI: Реклама
  ad_campaigns_count INT DEFAULT 0,
  avg_campaign_duration DECIMAL(5,2) DEFAULT 0, -- Средняя длительность (дней)
  avg_campaign_cost BIGINT DEFAULT 0,
  campaign_success_rate DECIMAL(5,2) DEFAULT 0, -- Процент успешных кампаний
  
  -- KPI: Охваты
  total_impressions INT DEFAULT 0,
  avg_impressions_per_campaign INT DEFAULT 0,
  unique_listeners_reached INT DEFAULT 0,
  reach_growth_rate DECIMAL(5,2) DEFAULT 0,
  
  -- KPI: Эффективность
  avg_completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0,
  avg_roi DECIMAL(5,2) DEFAULT 0,
  cost_efficiency_score DECIMAL(3,1) DEFAULT 0, -- 0-10
  
  -- KPI: Посещаемость
  total_visitors INT DEFAULT 0,
  new_visitors INT DEFAULT 0,
  returning_visitors INT DEFAULT 0,
  visitor_growth_rate DECIMAL(5,2) DEFAULT 0,
  
  -- KPI: Конверсии
  ad_to_visitor_conversion DECIMAL(5,2) DEFAULT 0,
  visitor_to_booking_conversion DECIMAL(5,2) DEFAULT 0,
  total_bookings INT DEFAULT 0,
  booking_growth_rate DECIMAL(5,2) DEFAULT 0,
  
  -- KPI: Финансы
  total_ad_spend BIGINT DEFAULT 0,
  revenue_generated BIGINT DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  
  -- Общая производительность
  overall_score DECIMAL(3,1) DEFAULT 0,        -- 0-10
  
  -- Рекомендации системы
  optimization_suggestions JSONB DEFAULT '[]', -- Список рекомендаций
  best_performing_station VARCHAR(255),
  best_time_slot VARCHAR(50),                  -- Лучшее время для рекламы
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(venue_id, period_type, period_date)
);

CREATE INDEX idx_venue_analytics_performance_venue ON venue_analytics_performance(venue_id);
CREATE INDEX idx_venue_analytics_performance_date ON venue_analytics_performance(period_date DESC);
CREATE INDEX idx_venue_analytics_performance_score ON venue_analytics_performance(overall_score DESC);
```

---

## 🔄 ФУНКЦИИ И ТРИГГЕРЫ

### Функция: Обновление ежедневной статистики
```sql
CREATE OR REPLACE FUNCTION update_venue_daily_analytics(
  p_venue_id UUID,
  p_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO venue_analytics_daily (venue_id, date)
  VALUES (p_venue_id, p_date)
  ON CONFLICT (venue_id, date) 
  DO UPDATE SET updated_at = NOW();
  
  -- Подсчет кампаний
  UPDATE venue_analytics_daily
  SET 
    active_campaigns = (
      SELECT COUNT(*) 
      FROM radio_venue_ads 
      WHERE venue_id = p_venue_id 
        AND status = 'in_progress'
        AND p_date BETWEEN start_date AND end_date
    ),
    total_campaigns = (
      SELECT COUNT(*) 
      FROM radio_venue_ads 
      WHERE venue_id = p_venue_id 
        AND DATE(submitted_at) = p_date
    ),
    completed_campaigns = (
      SELECT COUNT(*) 
      FROM radio_venue_ads 
      WHERE venue_id = p_venue_id 
        AND status = 'completed'
        AND DATE(completed_at) = p_date
    )
  WHERE venue_id = p_venue_id AND date = p_date;
END;
$$ LANGUAGE plpgsql;
```

### Функция: Расчет ROI кампании
```sql
CREATE OR REPLACE FUNCTION calculate_campaign_roi(
  p_campaign_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  v_cost BIGINT;
  v_revenue BIGINT;
  v_roi DECIMAL;
BEGIN
  SELECT total_price, estimated_revenue
  INTO v_cost, v_revenue
  FROM radio_venue_ads
  WHERE id = p_campaign_id;
  
  IF v_cost > 0 THEN
    v_roi := ((v_revenue::DECIMAL - v_cost) / v_cost) * 100;
  ELSE
    v_roi := 0;
  END IF;
  
  RETURN v_roi;
END;
$$ LANGUAGE plpgsql;
```

### Функция: Рекомендация радиостанций
```sql
CREATE OR REPLACE FUNCTION recommend_radio_stations(
  p_venue_id UUID,
  p_limit INT DEFAULT 5
) RETURNS TABLE (
  station_id UUID,
  station_name VARCHAR,
  recommendation_score INT,
  avg_roi DECIMAL,
  avg_reach INT,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id as station_id,
    rs.name as station_name,
    (
      -- Формула рекомендации (0-100)
      LEAST(100, (
        (COALESCE(vars.avg_roi, 0) * 0.4) +
        (COALESCE(vars.avg_completion_rate, 0) * 0.3) +
        (COALESCE(vars.avg_engagement_rate, 0) * 0.3)
      ))
    )::INT as recommendation_score,
    vars.avg_roi,
    vars.avg_listeners_per_campaign as avg_reach,
    CASE 
      WHEN vars.avg_roi > 50 THEN 'Высокий ROI'
      WHEN vars.avg_completion_rate > 80 THEN 'Высокая досматриваемость'
      WHEN vars.avg_listeners_per_campaign > 1000 THEN 'Большой охват'
      ELSE 'Стабильные показатели'
    END as reason
  FROM radio_stations rs
  LEFT JOIN venue_analytics_radio_stations vars 
    ON vars.radio_station_id = rs.id 
    AND vars.venue_id = p_venue_id
  WHERE rs.status = 'active'
  ORDER BY recommendation_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 ИТОГО: 5 ТАБЛИЦ АНАЛИТИКИ

1. **venue_analytics_daily** - Ежедневная статистика (28 полей)
2. **venue_analytics_campaigns** - Аналитика кампаний (30 полей)
3. **venue_analytics_radio_stations** - Сравнение станций (25 полей)
4. **venue_analytics_financial** - Финансовая аналитика (30 полей)
5. **venue_analytics_performance** - KPI и производительность (30 полей)

**ВСЕГО: 143+ поля аналитики**

---

## 🎯 API ENDPOINTS ДЛЯ АНАЛИТИКИ

```typescript
// GET /api/venue/:venueId/analytics/overview - Общая сводка
// GET /api/venue/:venueId/analytics/campaigns - Список кампаний с метриками
// GET /api/venue/:venueId/analytics/radio-comparison - Сравнение станций
// GET /api/venue/:venueId/analytics/financial - Финансовая аналитика
// GET /api/venue/:venueId/analytics/performance - KPI
// GET /api/venue/:venueId/analytics/recommendations - Рекомендации станций
// GET /api/venue/:venueId/analytics/trends - Тренды и прогнозы
```
