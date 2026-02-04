# VENUE RADIO BRAND - SQL СТРУКТУРА

## 🎵 СИСТЕМА ВНУТРЕННЕГО РАДИО ЗАВЕДЕНИЙ
Полная SQL структура для управления радиовещанием в барах, ресторанах, клубах.

---

## 📊 ТАБЛИЦА 1: venue_radio_settings
**Основные настройки радио заведения**

```sql
CREATE TABLE venue_radio_settings (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Основные настройки
  is_enabled BOOLEAN DEFAULT true,              -- Радио включено/выключено
  is_online BOOLEAN DEFAULT false,              -- Поток онлайн (heartbeat)
  stream_url TEXT,                              -- URL потока (внешний сервер)
  stream_key VARCHAR(255),                      -- Ключ доступа к потоку
  
  -- Громкость
  default_volume DECIMAL(3,2) DEFAULT 0.70,     -- 0.00 - 1.00
  current_volume DECIMAL(3,2) DEFAULT 0.70,
  
  -- Режим тишины (Quiet Mode)
  quiet_mode_enabled BOOLEAN DEFAULT false,
  quiet_mode_start TIME DEFAULT '00:00:00',     -- Начало тишины
  quiet_mode_end TIME DEFAULT '07:00:00',       -- Конец тишины
  quiet_mode_days VARCHAR(50) DEFAULT 'all',    -- 'all' или 'Mon,Tue,Wed'
  
  -- Автоматические вставки
  jingle_frequency_minutes INT DEFAULT 15,      -- Джингл каждые N минут
  ad_frequency_tracks INT DEFAULT 10,           -- Реклама каждые N треков
  announcement_frequency_tracks INT DEFAULT 20, -- Анонс каждые N треков
  
  -- Текущий статус воспроизведения
  active_playlist_id UUID,                      -- ID активного плейлиста
  current_track_id UUID,                        -- Что сейчас играет
  current_track_title VARCHAR(255),
  current_track_artist VARCHAR(255),
  current_track_cover_url TEXT,
  current_time_seconds INT DEFAULT 0,           -- Текущее время трека
  total_duration_seconds INT DEFAULT 0,         -- Длительность трека
  is_playing BOOLEAN DEFAULT false,             -- Идет воспроизведение
  
  -- Heartbeat (обновляется каждые 5 сек)
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(venue_id)
);

CREATE INDEX idx_venue_radio_settings_venue ON venue_radio_settings(venue_id);
CREATE INDEX idx_venue_radio_settings_online ON venue_radio_settings(is_online);
CREATE INDEX idx_venue_radio_settings_heartbeat ON venue_radio_settings(last_heartbeat DESC);
```

---

## 📊 ТАБЛИЦА 2: venue_radio_playlists
**Плейлисты заведения для радио**

```sql
CREATE TABLE venue_radio_playlists (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'draft',           -- 'draft', 'active', 'archived'
  is_active BOOLEAN DEFAULT false,              -- Этот плейлист сейчас в эфире
  
  -- Контент (JSONB массив треков)
  tracks JSONB DEFAULT '[]',                    -- [{track_id, order, duration}]
  total_tracks INT DEFAULT 0,
  total_duration_minutes INT DEFAULT 0,
  
  -- AI генерация
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,                               -- Промпт для AI генерации
  
  -- Расписание (когда автоматически активировать)
  schedule_enabled BOOLEAN DEFAULT false,
  schedule_days VARCHAR(50),                    -- 'Mon,Tue,Wed' или 'all'
  schedule_start_time TIME,                     -- Время начала
  schedule_end_time TIME,                       -- Время окончания
  schedule_priority INT DEFAULT 0,              -- Приоритет (выше = важнее)
  
  -- Статистика
  times_played INT DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_radio_playlists_venue ON venue_radio_playlists(venue_id);
CREATE INDEX idx_venue_radio_playlists_active ON venue_radio_playlists(is_active);
CREATE INDEX idx_venue_radio_playlists_status ON venue_radio_playlists(status);
```

---

## 📊 ТАБЛИЦА 3: venue_radio_content
**Контент для радио (джинглы, реклама, анонсы)**

```sql
CREATE TABLE venue_radio_content (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Тип контента
  content_type VARCHAR(20) NOT NULL,            -- 'jingle', 'advertisement', 'announcement'
  
  -- Основная информация
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Аудио файл
  audio_file_url TEXT NOT NULL,
  audio_file_key VARCHAR(255),                  -- Ключ в storage
  duration_seconds INT NOT NULL,
  file_size_bytes BIGINT,
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'approved', 'rejected', 'active'
  is_active BOOLEAN DEFAULT false,              -- Используется ли сейчас
  
  -- Расписание (опционально)
  schedule_enabled BOOLEAN DEFAULT false,
  schedule_days VARCHAR(50),
  schedule_start_time TIME,
  schedule_end_time TIME,
  
  -- Статистика
  play_count INT DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  
  -- Для рекламы (если advertisement)
  advertiser_id UUID,                           -- ID рекламодателя
  campaign_id UUID,                             -- ID кампании
  paid_amount BIGINT DEFAULT 0,                 -- Сумма оплаты (копейки)
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_radio_content_venue ON venue_radio_content(venue_id);
CREATE INDEX idx_venue_radio_content_type ON venue_radio_content(content_type);
CREATE INDEX idx_venue_radio_content_status ON venue_radio_content(status);
CREATE INDEX idx_venue_radio_content_active ON venue_radio_content(is_active);
```

---

## 📊 ТАБЛИЦА 4: venue_radio_play_queue
**Очередь проигрывания (автоматически генерируется)**

```sql
CREATE TABLE venue_radio_play_queue (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES venue_radio_playlists(id),
  
  -- Позиция в очереди
  queue_position INT NOT NULL,
  
  -- Контент
  content_type VARCHAR(20) NOT NULL,            -- 'track', 'jingle', 'advertisement', 'announcement'
  content_id UUID NOT NULL,                     -- ID трека/джингла/рекламы
  content_title VARCHAR(255),
  content_artist VARCHAR(255),
  content_duration_seconds INT,
  content_cover_url TEXT,
  
  -- Флаги
  is_inserted BOOLEAN DEFAULT false,            -- Автоматически вставлено системой
  is_mandatory BOOLEAN DEFAULT false,           -- Обязательное (нельзя пропустить)
  is_priority BOOLEAN DEFAULT false,            -- Приоритетное
  
  -- Статус
  status VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'playing', 'played', 'skipped'
  played_at TIMESTAMPTZ,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_radio_play_queue_venue ON venue_radio_play_queue(venue_id);
CREATE INDEX idx_venue_radio_play_queue_position ON venue_radio_play_queue(queue_position);
CREATE INDEX idx_venue_radio_play_queue_status ON venue_radio_play_queue(status);
CREATE INDEX idx_venue_radio_play_queue_playlist ON venue_radio_play_queue(playlist_id);
```

---

## 📊 ТАБЛИЦА 5: venue_radio_play_history
**История проигрываний (для аналитики)**

```sql
CREATE TABLE venue_radio_play_history (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Контент
  content_type VARCHAR(20) NOT NULL,
  content_id UUID NOT NULL,
  content_title VARCHAR(255),
  content_artist VARCHAR(255),
  
  -- Проигрывание
  playlist_id UUID,                             -- Из какого плейлиста
  duration_played_seconds INT,                  -- Сколько секунд проиграли
  completion_percentage DECIMAL(5,2),           -- Процент прослушивания
  
  -- Время
  play_date DATE NOT NULL,
  play_time TIME NOT NULL,
  play_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Контекст
  context VARCHAR(50) DEFAULT 'venue_radio',    -- 'venue_radio', 'manual', 'scheduled'
  
  -- Для артистов (статистика)
  artist_id UUID,                               -- Если это трек артиста
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_radio_play_history_venue ON venue_radio_play_history(venue_id);
CREATE INDEX idx_venue_radio_play_history_date ON venue_radio_play_history(play_date DESC);
CREATE INDEX idx_venue_radio_play_history_content ON venue_radio_play_history(content_type, content_id);
CREATE INDEX idx_venue_radio_play_history_artist ON venue_radio_play_history(artist_id);
```

---

## 📊 ТАБЛИЦА 6: venue_radio_schedule
**Расписание автоматического переключения плейлистов**

```sql
CREATE TABLE venue_radio_schedule (
  -- Primary
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Название слота
  name VARCHAR(255) NOT NULL,                   -- "Утренний плейлист", "Вечерний вайб"
  description TEXT,
  
  -- Плейлист
  playlist_id UUID NOT NULL REFERENCES venue_radio_playlists(id),
  
  -- Дни недели
  days VARCHAR(50) NOT NULL,                    -- 'Mon,Tue,Wed,Thu,Fri' или 'all'
  
  -- Время
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Приоритет
  priority INT DEFAULT 0,                       -- Выше = важнее
  
  -- Статус
  is_enabled BOOLEAN DEFAULT true,
  
  -- Статистика
  last_activated_at TIMESTAMPTZ,
  activation_count INT DEFAULT 0,
  
  -- Метаданные
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venue_radio_schedule_venue ON venue_radio_schedule(venue_id);
CREATE INDEX idx_venue_radio_schedule_playlist ON venue_radio_schedule(playlist_id);
CREATE INDEX idx_venue_radio_schedule_enabled ON venue_radio_schedule(is_enabled);
CREATE INDEX idx_venue_radio_schedule_priority ON venue_radio_schedule(priority DESC);
```

---

## 🔄 ФУНКЦИИ И ТРИГГЕРЫ

### Функция: Обновление heartbeat
```sql
CREATE OR REPLACE FUNCTION update_venue_radio_heartbeat(
  p_venue_id UUID,
  p_current_track JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE venue_radio_settings
  SET 
    is_online = true,
    last_heartbeat = NOW(),
    current_track_id = (p_current_track->>'id')::UUID,
    current_track_title = p_current_track->>'title',
    current_track_artist = p_current_track->>'artist',
    current_track_cover_url = p_current_track->>'cover_url',
    current_time_seconds = (p_current_track->>'current_time')::INT,
    total_duration_seconds = (p_current_track->>'duration')::INT,
    is_playing = (p_current_track->>'is_playing')::BOOLEAN,
    updated_at = NOW()
  WHERE venue_id = p_venue_id;
END;
$$ LANGUAGE plpgsql;
```

### Функция: Генерация очереди воспроизведения
```sql
CREATE OR REPLACE FUNCTION generate_venue_radio_queue(
  p_venue_id UUID,
  p_playlist_id UUID
) RETURNS INT AS $$
DECLARE
  v_settings RECORD;
  v_tracks JSONB;
  v_track JSONB;
  v_position INT := 0;
  v_minutes_accumulated INT := 0;
  v_track_count INT := 0;
BEGIN
  -- Получить настройки
  SELECT * INTO v_settings
  FROM venue_radio_settings
  WHERE venue_id = p_venue_id;
  
  -- Получить треки плейлиста
  SELECT tracks INTO v_tracks
  FROM venue_radio_playlists
  WHERE id = p_playlist_id;
  
  -- Очистить старую очередь
  DELETE FROM venue_radio_play_queue
  WHERE venue_id = p_venue_id AND status = 'pending';
  
  -- Генерация очереди
  FOR v_track IN SELECT * FROM jsonb_array_elements(v_tracks)
  LOOP
    v_track_count := v_track_count + 1;
    
    -- 1. Добавить трек
    INSERT INTO venue_radio_play_queue (
      venue_id, playlist_id, queue_position, 
      content_type, content_id, content_title, content_artist, 
      content_duration_seconds, is_inserted
    ) VALUES (
      p_venue_id, p_playlist_id, v_position,
      'track', (v_track->>'track_id')::UUID, 
      v_track->>'title', v_track->>'artist',
      (v_track->>'duration')::INT, false
    );
    
    v_position := v_position + 1;
    v_minutes_accumulated := v_minutes_accumulated + ((v_track->>'duration')::INT / 60);
    
    -- 2. Вставка джингла каждые N минут
    IF v_minutes_accumulated >= v_settings.jingle_frequency_minutes THEN
      INSERT INTO venue_radio_play_queue (
        venue_id, playlist_id, queue_position,
        content_type, content_id, is_inserted
      )
      SELECT 
        p_venue_id, p_playlist_id, v_position,
        'jingle', id, true
      FROM venue_radio_content
      WHERE venue_id = p_venue_id 
        AND content_type = 'jingle' 
        AND is_active = true
      ORDER BY RANDOM()
      LIMIT 1;
      
      v_position := v_position + 1;
      v_minutes_accumulated := 0;
    END IF;
    
    -- 3. Вставка рекламы каждые N треков
    IF v_track_count % v_settings.ad_frequency_tracks = 0 THEN
      INSERT INTO venue_radio_play_queue (
        venue_id, playlist_id, queue_position,
        content_type, content_id, is_inserted, is_mandatory
      )
      SELECT 
        p_venue_id, p_playlist_id, v_position,
        'advertisement', id, true, true
      FROM venue_radio_content
      WHERE venue_id = p_venue_id 
        AND content_type = 'advertisement' 
        AND is_active = true
      ORDER BY RANDOM()
      LIMIT 1;
      
      v_position := v_position + 1;
    END IF;
  END LOOP;
  
  RETURN v_position;
END;
$$ LANGUAGE plpgsql;
```

### Функция: Запись проигрывания
```sql
CREATE OR REPLACE FUNCTION record_venue_radio_play(
  p_venue_id UUID,
  p_content_type VARCHAR,
  p_content_id UUID,
  p_duration_played INT,
  p_playlist_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_content RECORD;
BEGIN
  -- Получить информацию о контенте
  IF p_content_type = 'track' THEN
    SELECT title, artist_name as artist INTO v_content
    FROM tracks WHERE id = p_content_id;
  ELSE
    SELECT title, NULL as artist INTO v_content
    FROM venue_radio_content WHERE id = p_content_id;
  END IF;
  
  -- Записать в историю
  INSERT INTO venue_radio_play_history (
    venue_id, content_type, content_id,
    content_title, content_artist,
    playlist_id, duration_played_seconds,
    completion_percentage,
    play_date, play_time
  ) VALUES (
    p_venue_id, p_content_type, p_content_id,
    v_content.title, v_content.artist,
    p_playlist_id, p_duration_played,
    (p_duration_played::DECIMAL / NULLIF(v_content.duration, 0)) * 100,
    CURRENT_DATE, CURRENT_TIME
  );
  
  -- Обновить счетчик в контенте
  IF p_content_type != 'track' THEN
    UPDATE venue_radio_content
    SET play_count = play_count + 1,
        last_played_at = NOW()
    WHERE id = p_content_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Функция: Проверка режима тишины
```sql
CREATE OR REPLACE FUNCTION check_venue_quiet_mode(
  p_venue_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_settings RECORD;
  v_current_time TIME;
  v_current_day VARCHAR(3);
BEGIN
  SELECT * INTO v_settings
  FROM venue_radio_settings
  WHERE venue_id = p_venue_id;
  
  IF NOT v_settings.quiet_mode_enabled THEN
    RETURN false;
  END IF;
  
  v_current_time := CURRENT_TIME;
  v_current_day := TO_CHAR(CURRENT_DATE, 'Dy');
  
  -- Проверка дня недели
  IF v_settings.quiet_mode_days != 'all' 
     AND v_settings.quiet_mode_days NOT LIKE '%' || v_current_day || '%' THEN
    RETURN false;
  END IF;
  
  -- Проверка времени
  IF v_current_time >= v_settings.quiet_mode_start 
     AND v_current_time < v_settings.quiet_mode_end THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 ИТОГО: 6 ТАБЛИЦ

1. **venue_radio_settings** - Настройки радио (27 полей)
2. **venue_radio_playlists** - Плейлисты (19 полей)
3. **venue_radio_content** - Джинглы/реклама/анонсы (22 полей)
4. **venue_radio_play_queue** - Очередь воспроизведения (18 полей)
5. **venue_radio_play_history** - История проигрываний (16 полей)
6. **venue_radio_schedule** - Расписание плейлистов (15 полей)

**ВСЕГО: 117+ полей**

---

## 🎯 API ENDPOINTS

```typescript
// Настройки
PUT /api/venue/:venueId/radio/settings
GET /api/venue/:venueId/radio/status

// Управление
POST /api/venue/:venueId/radio/play
POST /api/venue/:venueId/radio/pause
POST /api/venue/:venueId/radio/volume
POST /api/venue/:venueId/radio/skip

// Плейлисты
GET /api/venue/:venueId/radio/playlists
POST /api/venue/:venueId/radio/playlists
PUT /api/venue/:venueId/radio/playlists/:id
POST /api/venue/:venueId/radio/playlists/:id/activate

// Очередь
GET /api/venue/:venueId/radio/queue
POST /api/venue/:venueId/radio/queue/generate

// История
GET /api/venue/:venueId/radio/history
GET /api/venue/:venueId/radio/analytics

// Heartbeat
POST /api/venue/:venueId/radio/heartbeat
```

**SQL структура готова к интеграции с внешним сервером формирования эфира!** 🚀
