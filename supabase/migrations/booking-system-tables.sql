-- =====================================================
-- BOOKING SYSTEM - SQL СТРУКТУРА
-- Полная структура таблиц для системы букинга артистов
-- =====================================================

-- 1. BOOKING REQUESTS - Заявки на букинг
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Стороны сделки
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_type VARCHAR(20) NOT NULL CHECK (requester_type IN ('venue', 'organizer')),
  performer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  performer_type VARCHAR(20) NOT NULL CHECK (performer_type IN ('artist', 'dj', 'band')),
  
  -- Детали мероприятия
  event_type VARCHAR(50) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_hours DECIMAL(4,2) NOT NULL,
  
  -- Место проведения
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE SET NULL,
  venue_name VARCHAR(255),
  venue_address TEXT,
  venue_city VARCHAR(100),
  venue_type VARCHAR(50),
  venue_capacity INTEGER,
  
  -- Аудитория
  expected_audience INTEGER,
  audience_type VARCHAR(50),
  audience_age_range VARCHAR(50),
  
  -- Финансы
  offered_price DECIMAL(10,2) NOT NULL,
  performer_fee DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  deposit_percentage DECIMAL(5,2) DEFAULT 30.0,
  final_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  
  -- Технические требования
  technical_requirements JSONB DEFAULT '{}',
  equipment_provided JSONB DEFAULT '{}',
  rider_requirements TEXT,
  sound_check_time TIME,
  load_in_time TIME,
  
  -- Дополнительные услуги
  accommodation_provided BOOLEAN DEFAULT false,
  transportation_provided BOOLEAN DEFAULT false,
  meals_provided BOOLEAN DEFAULT false,
  special_requests TEXT,
  
  -- Статус и временные метки
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'accepted',
    'rejected',
    'deposit_paid',
    'confirmed',
    'completed',
    'cancelled',
    'dispute'
  )),
  
  -- Важные даты
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  deposit_paid_at TIMESTAMP WITH TIME ZONE,
  full_payment_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Отмена и причины
  cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  cancellation_penalty DECIMAL(10,2),
  
  -- Контакты
  requester_contact_phone VARCHAR(50),
  requester_contact_email VARCHAR(255),
  performer_contact_phone VARCHAR(50),
  performer_contact_email VARCHAR(255),
  
  -- Рейтинг и отзывы
  venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
  venue_review TEXT,
  performer_rating INTEGER CHECK (performer_rating >= 1 AND performer_rating <= 5),
  performer_review TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}',
  
  -- Индексы для быстрого поиска
  CONSTRAINT valid_date_range CHECK (event_date >= CURRENT_DATE),
  CONSTRAINT valid_price CHECK (offered_price > 0 AND performer_fee > 0)
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_booking_requester ON booking_requests(requester_id, status);
CREATE INDEX idx_booking_performer ON booking_requests(performer_id, status);
CREATE INDEX idx_booking_event_date ON booking_requests(event_date);
CREATE INDEX idx_booking_status ON booking_requests(status);
CREATE INDEX idx_booking_created_at ON booking_requests(created_at DESC);
CREATE INDEX idx_booking_venue ON booking_requests(venue_id);

-- =====================================================
-- 2. BOOKING PAYMENTS - История платежей
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  booking_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  
  -- Участники платежа
  payer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id VARCHAR(100) NOT NULL, -- user_id или 'platform'
  
  -- Детали платежа
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RUB',
  payment_type VARCHAR(30) NOT NULL CHECK (payment_type IN (
    'deposit',
    'final',
    'refund',
    'penalty',
    'commission'
  )),
  
  -- Статус платежа
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'disputed'
  )),
  
  -- Платежный шлюз
  gateway VARCHAR(50), -- 'stripe', 'yookassa', 'paypal', etc.
  gateway_payment_id VARCHAR(255),
  gateway_response JSONB,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Дополнительная информация
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  CONSTRAINT valid_amount CHECK (amount > 0)
);

CREATE INDEX idx_payment_booking ON booking_payments(booking_id);
CREATE INDEX idx_payment_payer ON booking_payments(payer_id);
CREATE INDEX idx_payment_status ON booking_payments(status);
CREATE INDEX idx_payment_created ON booking_payments(created_at DESC);

-- =====================================================
-- 3. BOOKING CALENDAR - Календарь доступности
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  performer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  performer_type VARCHAR(20) NOT NULL CHECK (performer_type IN ('artist', 'dj', 'band')),
  
  date DATE NOT NULL,
  
  -- Доступность
  is_available BOOLEAN DEFAULT true,
  availability_type VARCHAR(30) DEFAULT 'available' CHECK (availability_type IN (
    'available',
    'booked',
    'blocked',
    'pending'
  )),
  
  -- Связь с букингом
  booking_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  
  -- Время
  start_time TIME,
  end_time TIME,
  
  -- Примечания
  notes TEXT,
  block_reason TEXT,
  
  -- Метаданные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальность даты для артиста
  UNIQUE(performer_id, date, start_time)
);

CREATE INDEX idx_calendar_performer ON booking_calendar(performer_id, date);
CREATE INDEX idx_calendar_date ON booking_calendar(date);
CREATE INDEX idx_calendar_booking ON booking_calendar(booking_id);

-- =====================================================
-- 4. BOOKING_MESSAGES - Переписка по букингу
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  booking_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  message TEXT NOT NULL,
  message_type VARCHAR(30) DEFAULT 'text' CHECK (message_type IN (
    'text',
    'system',
    'file',
    'status_update'
  )),
  
  -- Вложения
  attachments JSONB DEFAULT '[]',
  
  -- Статус прочтения
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_message_booking ON booking_messages(booking_id, created_at DESC);
CREATE INDEX idx_message_recipient ON booking_messages(recipient_id, read);

-- =====================================================
-- 5. BOOKING_CONTRACTS - Договоры и соглашения
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  booking_id UUID NOT NULL UNIQUE REFERENCES booking_requests(id) ON DELETE CASCADE,
  
  -- Текст договора
  contract_text TEXT NOT NULL,
  contract_version VARCHAR(50),
  
  -- Подписи сторон
  venue_signed BOOLEAN DEFAULT false,
  venue_signed_at TIMESTAMP WITH TIME ZONE,
  venue_signature TEXT,
  
  performer_signed BOOLEAN DEFAULT false,
  performer_signed_at TIMESTAMP WITH TIME ZONE,
  performer_signature TEXT,
  
  -- Файл PDF
  contract_pdf_url TEXT,
  
  -- Статус
  status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
    'draft',
    'sent',
    'signed',
    'cancelled'
  )),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_contract_booking ON booking_contracts(booking_id);
CREATE INDEX idx_contract_status ON booking_contracts(status);

-- =====================================================
-- 6. PERFORMER_AVAILABILITY_SETTINGS - Настройки доступности
-- =====================================================
CREATE TABLE IF NOT EXISTS performer_availability_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  performer_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Базовая доступность по дням недели
  monday_available BOOLEAN DEFAULT true,
  tuesday_available BOOLEAN DEFAULT true,
  wednesday_available BOOLEAN DEFAULT true,
  thursday_available BOOLEAN DEFAULT true,
  friday_available BOOLEAN DEFAULT true,
  saturday_available BOOLEAN DEFAULT true,
  sunday_available BOOLEAN DEFAULT true,
  
  -- Временные рамки
  default_start_time TIME DEFAULT '18:00',
  default_end_time TIME DEFAULT '23:00',
  
  -- Минимальные требования
  minimum_notice_days INTEGER DEFAULT 7,
  maximum_advance_days INTEGER DEFAULT 365,
  
  -- Автоматическое принятие
  auto_accept_enabled BOOLEAN DEFAULT false,
  auto_accept_max_price DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. BOOKING_ANALYTICS - Аналитика букингов
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('venue', 'performer')),
  
  -- Период
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Метрики
  total_bookings INTEGER DEFAULT 0,
  confirmed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_fees DECIMAL(12,2) DEFAULT 0,
  
  -- Средние значения
  average_booking_value DECIMAL(10,2) DEFAULT 0,
  average_response_time_hours INTEGER DEFAULT 0,
  
  -- Рейтинги
  average_rating DECIMAL(3,2),
  total_reviews INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_analytics_user ON booking_analytics(user_id, period_start DESC);

-- =====================================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЗАЦИИ
-- =====================================================

-- Триггер обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_calendar_updated_at
  BEFORE UPDATE ON booking_calendar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_contracts_updated_at
  BEFORE UPDATE ON booking_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ФУНКЦИИ ДЛЯ АНАЛИТИКИ
-- =====================================================

-- Функция расчета статистики букингов
CREATE OR REPLACE FUNCTION calculate_booking_stats(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  total_revenue NUMERIC,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT,
    COALESCE(SUM(performer_fee), 0),
    AVG(performer_rating)
  FROM booking_requests
  WHERE performer_id = p_user_id
    AND event_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS ПОЛИТИКИ (Row Level Security)
-- =====================================================

-- Включить RLS
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_contracts ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи видят свои букинги
CREATE POLICY booking_requests_access ON booking_requests
  FOR ALL
  USING (
    auth.uid() = requester_id OR 
    auth.uid() = performer_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Политика: пользователи видят свои платежи
CREATE POLICY booking_payments_access ON booking_payments
  FOR ALL
  USING (
    auth.uid() = payer_id OR
    auth.uid() IN (
      SELECT requester_id FROM booking_requests WHERE id = booking_id
      UNION
      SELECT performer_id FROM booking_requests WHERE id = booking_id
    ) OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Политика: артисты управляют своим календарем
CREATE POLICY booking_calendar_access ON booking_calendar
  FOR ALL
  USING (
    auth.uid() = performer_id OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Комментарии к таблицам
COMMENT ON TABLE booking_requests IS 'Заявки на букинг артистов и DJ';
COMMENT ON TABLE booking_payments IS 'История всех платежей по букингам';
COMMENT ON TABLE booking_calendar IS 'Календарь доступности артистов';
COMMENT ON TABLE booking_messages IS 'Переписка между venue и артистом';
COMMENT ON TABLE booking_contracts IS 'Договоры и электронные подписи';
COMMENT ON TABLE performer_availability_settings IS 'Настройки доступности артистов';
COMMENT ON TABLE booking_analytics IS 'Аналитика и статистика по букингам';
