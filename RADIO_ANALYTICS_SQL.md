# RADIO ANALYTICS - SQL СТРУКТУРА

## АНАЛИТИКА РАДИОСТАНЦИЙ
Полная система аналитики для радиостанций с детальной статистикой заявок, финансов и контента.

---

## 📊 ТАБЛИЦА 1: radio_analytics_daily
**Ежедневная сводная статистика по радиостанции**

```sql
CREATE TABLE radio_analytics_daily (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Заявки артистов
  artist_requests_total INT DEFAULT 0,
  artist_requests_pending INT DEFAULT 0,
  artist_requests_approved INT DEFAULT 0,
  artist_requests_rejected INT DEFAULT 0,
  artist_requests_completed INT DEFAULT 0,
  
  -- Заявки заведений
  venue_requests_total INT DEFAULT 0,
  venue_requests_pending INT DEFAULT 0,
  venue_requests_approved INT DEFAULT 0,
  venue_requests_rejected INT DEFAULT 0,
  venue_requests_completed INT DEFAULT 0,
  
  -- Финансы (в копейках)
  revenue_artist_total BIGINT DEFAULT 0,      -- Общий доход от артистов
  revenue_venue_total BIGINT DEFAULT 0,       -- Общий доход от заведений
  revenue_total BIGINT DEFAULT 0,             -- Общий доход
  payout_station BIGINT DEFAULT 0,            -- Выплата радиостанции (85%)
  platform_fee BIGINT DEFAULT 0,              -- Комиссия платформы (15%)
  
  -- Контент и прослушивания
  total_plays INT DEFAULT 0,                  -- Всего проигрываний
  total_impressions INT DEFAULT 0,            -- Всего показов (слушателей)
  unique_listeners INT DEFAULT 0,             -- Уникальных слушателей
  avg_listening_time INT DEFAULT 0,           -- Среднее время прослушивания (секунды)
  
  -- Трафик
  peak_listeners INT DEFAULT 0,               -- Пиковое количество слушателей
  peak_hour INT DEFAULT 0,                    -- Час пика (0-23)
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(station_id, date)
);

CREATE INDEX idx_radio_analytics_daily_station ON radio_analytics_daily(station_id);
CREATE INDEX idx_radio_analytics_daily_date ON radio_analytics_daily(date DESC);
CREATE INDEX idx_radio_analytics_daily_station_date ON radio_analytics_daily(station_id, date DESC);
```

---

## 📈 ТАБЛИЦА 2: radio_analytics_requests
**Детальная аналитика по заявкам (артисты + заведения)**

```sql
CREATE TABLE radio_analytics_requests (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Идентификация заявки
  request_id UUID NOT NULL,                   -- ID заявки (artist или venue)
  request_type VARCHAR(20) NOT NULL,          -- 'artist' или 'venue'
  
  -- Информация о клиенте
  client_id UUID NOT NULL,                    -- ID артиста или заведения
  client_name VARCHAR(255) NOT NULL,
  client_type VARCHAR(50),                    -- Для заведений: bar/club/restaurant
  client_city VARCHAR(100),
  
  -- Детали заявки
  package_type VARCHAR(20),                   -- '5sec', '10sec', '15sec', '30sec'
  duration_days INT NOT NULL,
  plays_per_day INT NOT NULL,
  total_plays INT NOT NULL,
  
  -- Финансы (в копейках)
  total_price BIGINT NOT NULL,
  station_payout BIGINT NOT NULL,             -- 85%
  platform_fee BIGINT NOT NULL,               -- 15%
  
  -- Статус и даты
  status VARCHAR(20) NOT NULL,                -- pending/approved/rejected/in_progress/completed
  submitted_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Выполнение
  completed_plays INT DEFAULT 0,
  total_impressions INT DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2) DEFAULT 0, -- Процент вовлеченности
  
  -- Модерация
  moderation_time_minutes INT,                -- Время на модерацию (минуты)
  rejection_reason TEXT,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_radio_analytics_requests_station ON radio_analytics_requests(station_id);
CREATE INDEX idx_radio_analytics_requests_type ON radio_analytics_requests(request_type);
CREATE INDEX idx_radio_analytics_requests_status ON radio_analytics_requests(status);
CREATE INDEX idx_radio_analytics_requests_submitted ON radio_analytics_requests(submitted_at DESC);
CREATE INDEX idx_radio_analytics_requests_client ON radio_analytics_requests(client_id);
```

---

## 💰 ТАБЛИЦА 3: radio_analytics_financial
**Детальная финансовая аналитика с транзакциями**

```sql
CREATE TABLE radio_analytics_financial (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Период
  period_type VARCHAR(20) NOT NULL,           -- 'daily', 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Доходы по источникам (в копейках)
  revenue_artist BIGINT DEFAULT 0,
  revenue_venue BIGINT DEFAULT 0,
  revenue_total BIGINT DEFAULT 0,
  
  -- Выплаты и комиссии
  payout_station BIGINT DEFAULT 0,            -- 85% от общего
  platform_fee BIGINT DEFAULT 0,              -- 15% от общего
  
  -- Разбивка по пакетам
  revenue_5sec BIGINT DEFAULT 0,
  revenue_10sec BIGINT DEFAULT 0,
  revenue_15sec BIGINT DEFAULT 0,
  revenue_30sec BIGINT DEFAULT 0,
  
  -- Статистика транзакций
  transactions_count INT DEFAULT 0,
  avg_transaction_amount BIGINT DEFAULT 0,
  
  -- Тренды
  growth_rate DECIMAL(5,2) DEFAULT 0,         -- Рост в процентах относительно предыдущего периода
  previous_period_revenue BIGINT DEFAULT 0,
  
  -- Прогнозы
  projected_revenue BIGINT DEFAULT 0,         -- Прогноз на следующий период
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(station_id, period_type, period_start)
);

CREATE INDEX idx_radio_analytics_financial_station ON radio_analytics_financial(station_id);
CREATE INDEX idx_radio_analytics_financial_period ON radio_analytics_financial(period_type, period_start DESC);
CREATE INDEX idx_radio_analytics_financial_station_period ON radio_analytics_financial(station_id, period_start DESC);
```

---

## 🎵 ТАБЛИЦА 4: radio_analytics_content
**Аналитика контента и производительности**

```sql
CREATE TABLE radio_analytics_content (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Период
  date DATE NOT NULL,
  hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
  
  -- Контент
  total_ads_played INT DEFAULT 0,             -- Всего рекламы проиграно
  artist_ads_played INT DEFAULT 0,
  venue_ads_played INT DEFAULT 0,
  
  -- Аудитория
  listeners_count INT DEFAULT 0,              -- Количество слушателей в этот час
  listeners_peak INT DEFAULT 0,               -- Пик слушателей в этот час
  avg_session_duration INT DEFAULT 0,         -- Средняя длительность сессии (секунды)
  
  -- Вовлеченность
  total_impressions INT DEFAULT 0,
  click_through_rate DECIMAL(5,2) DEFAULT 0,
  skip_rate DECIMAL(5,2) DEFAULT 0,           -- Процент пропусков
  
  -- Качество
  audio_quality_score DECIMAL(3,1) DEFAULT 0, -- 0-10
  buffering_incidents INT DEFAULT 0,
  
  -- Географія
  top_city VARCHAR(100),
  top_country VARCHAR(100),
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(station_id, date, hour)
);

CREATE INDEX idx_radio_analytics_content_station ON radio_analytics_content(station_id);
CREATE INDEX idx_radio_analytics_content_date ON radio_analytics_content(date DESC);
CREATE INDEX idx_radio_analytics_content_hour ON radio_analytics_content(hour);
CREATE INDEX idx_radio_analytics_content_station_date ON radio_analytics_content(station_id, date DESC, hour);
```

---

## 📱 ТАБЛИЦА 5: radio_analytics_performance
**Производительность и KPI радиостанции**

```sql
CREATE TABLE radio_analytics_performance (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  
  -- Период
  period_type VARCHAR(20) NOT NULL,           -- 'daily', 'weekly', 'monthly'
  period_date DATE NOT NULL,
  
  -- KPI: Заявки
  approval_rate DECIMAL(5,2) DEFAULT 0,       -- Процент одобренных заявок
  rejection_rate DECIMAL(5,2) DEFAULT 0,
  avg_moderation_time INT DEFAULT 0,          -- Среднее время модерации (минуты)
  completion_rate DECIMAL(5,2) DEFAULT 0,     -- Процент завершенных кампаний
  
  -- KPI: Финансы
  revenue_per_request BIGINT DEFAULT 0,       -- Средний доход с заявки
  revenue_growth_rate DECIMAL(5,2) DEFAULT 0,
  
  -- KPI: Аудитория
  avg_daily_listeners INT DEFAULT 0,
  listener_growth_rate DECIMAL(5,2) DEFAULT 0,
  retention_rate DECIMAL(5,2) DEFAULT 0,      -- Процент возвращающихся слушателей
  
  -- KPI: Контент
  avg_impressions_per_play INT DEFAULT 0,
  engagement_score DECIMAL(3,1) DEFAULT 0,    -- 0-10
  quality_score DECIMAL(3,1) DEFAULT 0,       -- 0-10
  
  -- Рейтинги
  platform_rank INT,                          -- Место в общем рейтинге
  city_rank INT,                              -- Место в рейтинге города
  category_rank INT,                          -- Место в категории жанра
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(station_id, period_type, period_date)
);

CREATE INDEX idx_radio_analytics_performance_station ON radio_analytics_performance(station_id);
CREATE INDEX idx_radio_analytics_performance_date ON radio_analytics_performance(period_date DESC);
CREATE INDEX idx_radio_analytics_performance_rank ON radio_analytics_performance(platform_rank);
```

---

## 🔄 ФУНКЦИИ И ТРИГГЕРЫ

### Функция: Обновление ежедневной статистики
```sql
CREATE OR REPLACE FUNCTION update_radio_daily_analytics(
  p_station_id UUID,
  p_date DATE
) RETURNS VOID AS $$
BEGIN
  INSERT INTO radio_analytics_daily (station_id, date)
  VALUES (p_station_id, p_date)
  ON CONFLICT (station_id, date) 
  DO UPDATE SET updated_at = NOW();
  
  -- Подсчет заявок артистов
  UPDATE radio_analytics_daily
  SET 
    artist_requests_total = (SELECT COUNT(*) FROM radio_artist_requests WHERE station_id = p_station_id AND DATE(submitted_at) = p_date),
    artist_requests_pending = (SELECT COUNT(*) FROM radio_artist_requests WHERE station_id = p_station_id AND DATE(submitted_at) = p_date AND status = 'pending'),
    artist_requests_approved = (SELECT COUNT(*) FROM radio_artist_requests WHERE station_id = p_station_id AND DATE(submitted_at) = p_date AND status = 'approved')
  WHERE station_id = p_station_id AND date = p_date;
END;
$$ LANGUAGE plpgsql;
```

### Функция: Расчет финансовой аналитики за период
```sql
CREATE OR REPLACE FUNCTION calculate_radio_financial_analytics(
  p_station_id UUID,
  p_period_type VARCHAR,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  revenue_total BIGINT,
  payout_station BIGINT,
  platform_fee BIGINT,
  growth_rate DECIMAL
) AS $$
DECLARE
  v_revenue_total BIGINT;
  v_payout BIGINT;
  v_fee BIGINT;
  v_previous_revenue BIGINT;
  v_growth DECIMAL;
BEGIN
  -- Текущий период
  SELECT 
    COALESCE(SUM(total_price), 0),
    COALESCE(SUM(station_payout), 0),
    COALESCE(SUM(platform_fee), 0)
  INTO v_revenue_total, v_payout, v_fee
  FROM radio_analytics_requests
  WHERE station_id = p_station_id
    AND submitted_at BETWEEN p_start_date AND p_end_date
    AND status NOT IN ('rejected', 'cancelled');
  
  -- Предыдущий период (для расчета роста)
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_previous_revenue
  FROM radio_analytics_requests
  WHERE station_id = p_station_id
    AND submitted_at BETWEEN (p_start_date - (p_end_date - p_start_date)) AND p_start_date
    AND status NOT IN ('rejected', 'cancelled');
  
  -- Расчет роста
  IF v_previous_revenue > 0 THEN
    v_growth := ((v_revenue_total::DECIMAL - v_previous_revenue) / v_previous_revenue) * 100;
  ELSE
    v_growth := 0;
  END IF;
  
  RETURN QUERY SELECT v_revenue_total, v_payout, v_fee, v_growth;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 ИТОГО: 5 ТАБЛИЦ АНАЛИТИКИ

1. **radio_analytics_daily** - Ежедневная статистика (25 полей)
2. **radio_analytics_requests** - Аналитика заявок (25 полей)
3. **radio_analytics_financial** - Финансовая аналитика (20 полей)
4. **radio_analytics_content** - Контент и производительность (18 полей)
5. **radio_analytics_performance** - KPI и рейтинги (20 полей)

**ВСЕГО: 108+ полей аналитики**

---

## 🎯 API ENDPOINTS ДЛЯ АНАЛИТИКИ

```typescript
// GET /api/radio/:stationId/analytics/overview - Общая сводка
// GET /api/radio/:stationId/analytics/daily?date=YYYY-MM-DD - Данные за день
// GET /api/radio/:stationId/analytics/financial?period=weekly - Финансы за период
// GET /api/radio/:stationId/analytics/requests?type=artist - Аналитика заявок
// GET /api/radio/:stationId/analytics/performance - KPI и рейтинги
// GET /api/radio/:stationId/analytics/content?date=YYYY-MM-DD - Контент за день
// GET /api/radio/:stationId/analytics/trends - Тренды и прогнозы
```
