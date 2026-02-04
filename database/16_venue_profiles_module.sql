-- =====================================================
-- PROMO.MUSIC - VENUE PROFILES MODULE
-- Модуль профилей заведений (рестораны, бары, клубы и т.д.)
-- =====================================================

-- =====================================================
-- ENUM: Типы заведений
-- =====================================================
DO $$ BEGIN
  CREATE TYPE venue_type AS ENUM (
    'restaurant',
    'bar',
    'cafe',
    'club',
    'lounge',
    'hotel',
    'spa',
    'gym',
    'shop',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- ENUM: Статусы заведения
-- =====================================================
DO $$ BEGIN
  CREATE TYPE venue_status AS ENUM (
    'pending_approval',
    'approved',
    'rejected',
    'suspended',
    'active'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- ТАБЛИЦА: venue_profiles
-- Профили заведений с полной информацией
-- =====================================================
CREATE TABLE IF NOT EXISTS venue_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Основная информация
  venue_name VARCHAR(255) NOT NULL,
  description TEXT,
  venue_type venue_type NOT NULL DEFAULT 'bar',
  
  -- Локация
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Россия',
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Контактная информация
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  
  -- Визуальные элементы
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[], -- массив URL изображений
  
  -- Рабочие часы (JSON структура)
  working_hours JSONB DEFAULT '{
    "monday": {"open": "10:00", "close": "23:00", "closed": false},
    "tuesday": {"open": "10:00", "close": "23:00", "closed": false},
    "wednesday": {"open": "10:00", "close": "23:00", "closed": false},
    "thursday": {"open": "10:00", "close": "23:00", "closed": false},
    "friday": {"open": "10:00", "close": "02:00", "closed": false},
    "saturday": {"open": "10:00", "close": "02:00", "closed": false},
    "sunday": {"open": "12:00", "close": "23:00", "closed": false}
  }'::jsonb,
  
  -- Музыкальные предпочтения
  genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_mood VARCHAR(50), -- 'energetic', 'calm', 'mixed'
  
  -- Характеристики заведения
  capacity INTEGER,
  average_check DECIMAL(10, 2), -- средний чек
  has_live_music BOOLEAN DEFAULT FALSE,
  has_dj BOOLEAN DEFAULT FALSE,
  has_stage BOOLEAN DEFAULT FALSE,
  has_sound_system BOOLEAN DEFAULT TRUE,
  
  -- Социальные сети
  social_links JSONB DEFAULT '{}'::jsonb,
  
  -- Статус и верификация
  status venue_status NOT NULL DEFAULT 'pending_approval',
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Подписка
  subscription_status VARCHAR(20) DEFAULT 'inactive',
  subscription_plan VARCHAR(50),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Рейтинг и статистика
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  
  -- Настройки
  settings JSONB DEFAULT '{
    "autoPlay": true,
    "crossfade": true,
    "crossfadeDuration": 3,
    "volumeLevel": 70,
    "emailNotifications": true,
    "pushNotifications": true,
    "bookingNotifications": true,
    "trackNotifications": true,
    "allowRadioDistribution": true,
    "autoAcceptRadioTracks": false,
    "showInDirectory": true,
    "allowPublicPlaylists": true
  }'::jsonb,
  
  -- Метаданные
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT venue_name_not_empty CHECK (LENGTH(TRIM(venue_name)) > 0),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT valid_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
  )
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_venue_profiles_user_id ON venue_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_status ON venue_profiles(status);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_venue_type ON venue_profiles(venue_type);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_city ON venue_profiles(city);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_verified ON venue_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_subscription_status ON venue_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_rating ON venue_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_created_at ON venue_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_deleted_at ON venue_profiles(deleted_at) WHERE deleted_at IS NULL;

-- Полнотекстовый поиск
CREATE INDEX IF NOT EXISTS idx_venue_profiles_search ON venue_profiles 
USING gin(to_tsvector('russian', 
  COALESCE(venue_name, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(city, '') || ' ' ||
  COALESCE(address, '')
));

-- Геопространственный индекс
CREATE INDEX IF NOT EXISTS idx_venue_profiles_location ON venue_profiles 
USING gist(ll_to_earth(latitude::float8, longitude::float8)) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON TABLE venue_profiles IS 'Профили заведений (рестораны, бары, клубы и т.д.)';

-- =====================================================
-- ТАБЛИЦА: venue_staff
-- Сотрудники заведения с ролями
-- =====================================================
CREATE TABLE IF NOT EXISTS venue_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Роль
  role VARCHAR(50) NOT NULL, -- 'owner', 'manager', 'dj', 'staff'
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'active',
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Даты
  hired_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(venue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_staff_venue_id ON venue_staff(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_staff_user_id ON venue_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_staff_role ON venue_staff(role);

COMMENT ON TABLE venue_staff IS 'Сотрудники и команда заведения';

-- =====================================================
-- ТАБЛИЦА: venue_playback_status
-- Текущий статус воспроизведения музыки
-- =====================================================
CREATE TABLE IF NOT EXISTS venue_playback_status (
  venue_id UUID PRIMARY KEY REFERENCES venue_profiles(id) ON DELETE CASCADE,
  
  -- Статус
  is_online BOOLEAN DEFAULT FALSE,
  is_playing BOOLEAN DEFAULT FALSE,
  
  -- Текущий трек
  current_playlist_id UUID,
  current_track_id UUID,
  current_track_title VARCHAR(255),
  current_track_artist VARCHAR(255),
  current_track_started_at TIMESTAMPTZ,
  
  -- Последний heartbeat
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  
  -- Обновление
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_playback_status_is_online ON venue_playback_status(is_online);
CREATE INDEX IF NOT EXISTS idx_venue_playback_status_is_playing ON venue_playback_status(is_playing);

COMMENT ON TABLE venue_playback_status IS 'Текущий статус воспроизведения музыки в заведении';

-- =====================================================
-- ТАБЛИЦА: venue_analytics_daily
-- Ежедневная аналитика заведения
-- =====================================================
CREATE TABLE IF NOT EXISTS venue_analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Воспроизведение
  total_playtime INTEGER DEFAULT 0, -- минуты
  total_tracks INTEGER DEFAULT 0,
  unique_tracks INTEGER DEFAULT 0,
  
  -- Посещаемость (если есть интеграция)
  estimated_visitors INTEGER,
  avg_session_duration INTEGER, -- минуты
  
  -- Популярные треки (топ 10)
  top_tracks JSONB DEFAULT '[]'::jsonb,
  
  -- Популярные жанры
  top_genres JSONB DEFAULT '[]'::jsonb,
  
  -- Даты
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(venue_id, date)
);

CREATE INDEX IF NOT EXISTS idx_venue_analytics_daily_venue_id ON venue_analytics_daily(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_analytics_daily_date ON venue_analytics_daily(date DESC);

COMMENT ON TABLE venue_analytics_daily IS 'Ежедневная аналитика воспроизведения музыки';

-- =====================================================
-- ФУНКЦИЯ: Обновление updated_at для venue_profiles
-- =====================================================
CREATE OR REPLACE FUNCTION update_venue_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_venue_profiles_updated_at ON venue_profiles;
CREATE TRIGGER trigger_update_venue_profiles_updated_at
  BEFORE UPDATE ON venue_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_profiles_updated_at();

-- =====================================================
-- ФУНКЦИЯ: Автоматическое создание playback_status
-- =====================================================
CREATE OR REPLACE FUNCTION create_venue_playback_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO venue_playback_status (venue_id)
  VALUES (NEW.id)
  ON CONFLICT (venue_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_venue_playback_status ON venue_profiles;
CREATE TRIGGER trigger_create_venue_playback_status
  AFTER INSERT ON venue_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_venue_playback_status();

-- =====================================================
-- VIEW: Полная информация о заведении
-- =====================================================
CREATE OR REPLACE VIEW venue_full_info AS
SELECT 
  vp.*,
  vps.is_online,
  vps.is_playing,
  vps.current_track_title,
  vps.current_track_artist,
  vps.last_heartbeat,
  u.email as owner_email,
  u.full_name as owner_name,
  COUNT(DISTINCT vs.id) as staff_count
FROM venue_profiles vp
LEFT JOIN venue_playback_status vps ON vp.id = vps.venue_id
LEFT JOIN users u ON vp.user_id = u.id
LEFT JOIN venue_staff vs ON vp.id = vs.venue_id AND vs.deleted_at IS NULL
WHERE vp.deleted_at IS NULL
GROUP BY vp.id, vps.venue_id, vps.is_online, vps.is_playing, 
         vps.current_track_title, vps.current_track_artist, 
         vps.last_heartbeat, u.email, u.full_name;

COMMENT ON VIEW venue_full_info IS 'Полная информация о заведении с текущим статусом';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Включить RLS
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_playback_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_analytics_daily ENABLE ROW LEVEL SECURITY;

-- venue_profiles: Владелец может видеть и редактировать свой профиль
CREATE POLICY venue_profiles_owner_all ON venue_profiles
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- venue_profiles: Все могут видеть активные профили
CREATE POLICY venue_profiles_public_read ON venue_profiles
  FOR SELECT
  USING (status IN ('active', 'approved') AND deleted_at IS NULL);

-- venue_staff: Сотрудники могут видеть свои записи
CREATE POLICY venue_staff_member_read ON venue_staff
  FOR SELECT
  USING (user_id = auth.uid() OR venue_id IN (
    SELECT venue_id FROM venue_staff WHERE user_id = auth.uid()
  ));

-- venue_playback_status: Владелец может управлять
CREATE POLICY venue_playback_owner_all ON venue_playback_status
  FOR ALL
  USING (venue_id IN (
    SELECT id FROM venue_profiles WHERE user_id = auth.uid()
  ));

-- venue_analytics_daily: Владелец может видеть
CREATE POLICY venue_analytics_owner_read ON venue_analytics_daily
  FOR SELECT
  USING (venue_id IN (
    SELECT id FROM venue_profiles WHERE user_id = auth.uid()
  ));

-- =====================================================
-- SEED DATA: Пример заведения
-- =====================================================
-- Раскомментируй для создания тестовых данных
/*
INSERT INTO venue_profiles (
  user_id, venue_name, description, venue_type,
  address, city, country,
  phone, email, website,
  genres, capacity, has_live_music, has_dj,
  status, verified, subscription_status, subscription_plan
) VALUES (
  (SELECT id FROM users WHERE role = 'venue' LIMIT 1),
  'Sunset Lounge Bar',
  'Уютный лаунж-бар в центре города с живой музыкой и авторскими коктейлями',
  'lounge',
  'ул. Тверская, 15',
  'Москва',
  'Россия',
  '+7 (495) 123-45-67',
  'info@sunsetlounge.ru',
  'https://sunsetlounge.ru',
  ARRAY['jazz', 'soul', 'lounge'],
  100,
  true,
  true,
  'active',
  true,
  'active',
  'professional'
) ON CONFLICT (user_id) DO NOTHING;
*/
