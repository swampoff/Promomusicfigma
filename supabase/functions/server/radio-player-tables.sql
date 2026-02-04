-- =====================================================
-- RADIO PLAYER INFRASTRUCTURE TABLES
-- Таблицы для управления плеерами заведений
-- =====================================================

-- 1. Таблица плееров
CREATE TABLE IF NOT EXISTS radio_players_84730125 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues_84730125(id) ON DELETE CASCADE,
  player_type VARCHAR(20) NOT NULL CHECK (player_type IN ('web', 'hardware', 'mobile')),
  device_id VARCHAR(255) NOT NULL,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error')),
  last_seen TIMESTAMP WITH TIME ZONE,
  
  -- Конфигурация
  volume DECIMAL(3,2) DEFAULT 0.80 CHECK (volume >= 0 AND volume <= 1),
  crossfade INTEGER DEFAULT 3, -- секунды
  jingle_frequency INTEGER DEFAULT 5, -- каждые N треков
  
  -- Текущее состояние
  is_playing BOOLEAN DEFAULT false,
  current_track_id UUID REFERENCES tracks_84730125(id),
  current_time INTEGER DEFAULT 0, -- секунды
  
  -- Местоположение (для аналитики)
  location JSONB,
  
  -- Метаданные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Уникальность устройства в рамках заведения
  UNIQUE(venue_id, device_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_radio_players_venue 
  ON radio_players_84730125(venue_id);
CREATE INDEX IF NOT EXISTS idx_radio_players_status 
  ON radio_players_84730125(status);
CREATE INDEX IF NOT EXISTS idx_radio_players_last_seen 
  ON radio_players_84730125(last_seen DESC);

-- 2. Таблица метрик плееров (для аналитики)
CREATE TABLE IF NOT EXISTS radio_player_metrics_84730125 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES radio_players_84730125(id) ON DELETE CASCADE,
  
  -- Метрики
  is_playing BOOLEAN NOT NULL,
  track_id UUID REFERENCES tracks_84730125(id),
  volume DECIMAL(3,2),
  
  -- Дополнительные метрики
  buffer_health DECIMAL(3,2), -- 0-1, качество буферизации
  connection_quality VARCHAR(20), -- excellent, good, poor
  
  -- Временная метка
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Партиционирование по дате для оптимизации (опционально в продакшене)
CREATE INDEX IF NOT EXISTS idx_radio_player_metrics_player 
  ON radio_player_metrics_84730125(player_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_radio_player_metrics_timestamp 
  ON radio_player_metrics_84730125(timestamp DESC);

-- 3. Таблица команд для плееров (очередь)
CREATE TABLE IF NOT EXISTS radio_player_commands_84730125 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES radio_players_84730125(id) ON DELETE CASCADE,
  
  -- Команда
  command VARCHAR(50) NOT NULL CHECK (command IN (
    'PLAY', 'PAUSE', 'VOLUME', 'LOAD_PLAYLIST', 'SKIP', 
    'INJECT_CONTENT', 'UPDATE_CONFIG', 'RESTART'
  )),
  params JSONB, -- Параметры команды
  
  -- Статус выполнения
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'executed', 'failed')),
  error TEXT,
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_radio_player_commands_player 
  ON radio_player_commands_84730125(player_id, status, created_at DESC);

-- 4. Таблица плейлистов для заведений
CREATE TABLE IF NOT EXISTS venue_playlists_84730125 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues_84730125(id) ON DELETE CASCADE,
  
  -- Информация
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Статус
  is_active BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  
  -- Треки
  track_ids UUID[] DEFAULT '{}', -- Массив ID треков
  
  -- Настройки
  shuffle BOOLEAN DEFAULT false,
  repeat_mode VARCHAR(20) DEFAULT 'all' CHECK (repeat_mode IN ('all', 'one', 'none')),
  
  -- Метаданные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_playlists_venue 
  ON venue_playlists_84730125(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_playlists_active 
  ON venue_playlists_84730125(venue_id, is_active);

-- 5. Таблица контента для вставки (джинглы, реклама, анонсы)
CREATE TABLE IF NOT EXISTS venue_content_84730125 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues_84730125(id) ON DELETE CASCADE,
  
  -- Тип контента
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('jingle', 'advertisement', 'announcement')),
  
  -- Информация
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Файл
  file_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- секунды
  bitrate INTEGER, -- kbps
  
  -- Статус
  is_active BOOLEAN DEFAULT true,
  
  -- Настройки вставки
  priority INTEGER DEFAULT 5, -- 1-10, приоритет вставки
  frequency_type VARCHAR(20) DEFAULT 'tracks' CHECK (frequency_type IN ('tracks', 'time')),
  frequency_value INTEGER DEFAULT 5, -- каждые N треков или каждые N минут
  
  -- Расписание (опционально)
  schedule JSONB, -- {days: [1,2,3], hours: [9,10,11,12]}
  
  -- Метаданные
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_content_venue 
  ON venue_content_84730125(venue_id, is_active);
CREATE INDEX IF NOT EXISTS idx_venue_content_type 
  ON venue_content_84730125(content_type, is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Обновление updated_at
CREATE OR REPLACE FUNCTION update_radio_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_radio_players_updated_at
  BEFORE UPDATE ON radio_players_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_radio_players_updated_at();

CREATE TRIGGER trigger_venue_playlists_updated_at
  BEFORE UPDATE ON venue_playlists_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_radio_players_updated_at();

CREATE TRIGGER trigger_venue_content_updated_at
  BEFORE UPDATE ON venue_content_84730125
  FOR EACH ROW
  EXECUTE FUNCTION update_radio_players_updated_at();

-- =====================================================
-- КОММЕНТАРИИ
-- =====================================================

COMMENT ON TABLE radio_players_84730125 IS 'Плееры заведений (веб, hardware, mobile)';
COMMENT ON TABLE radio_player_metrics_84730125 IS 'Метрики работы плееров для аналитики';
COMMENT ON TABLE radio_player_commands_84730125 IS 'Очередь команд для плееров';
COMMENT ON TABLE venue_playlists_84730125 IS 'Плейлисты заведений';
COMMENT ON TABLE venue_content_84730125 IS 'Контент для вставки (джинглы, реклама, анонсы)';

-- =====================================================
-- SAMPLE DATA (для тестирования)
-- =====================================================

-- Будет добавлено автоматически при создании заведения
