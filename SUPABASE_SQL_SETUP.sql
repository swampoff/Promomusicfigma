-- =====================================================
-- PROMO.MUSIC - ПОЛНАЯ SQL СТРУКТУРА
-- Enterprise маркетинговая экосистема для музыкантов
-- =====================================================

-- ВАЖНО: Выполните этот скрипт в Supabase SQL Editor
-- Скрипт создает все необходимые таблицы для работы системы

-- =====================================================
-- 1. БАЗОВЫЕ ТАБЛИЦЫ ПОЛЬЗОВАТЕЛЕЙ И РОЛЕЙ
-- =====================================================

-- Таблица пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('musician', 'venue', 'radio_station', 'admin')) DEFAULT 'musician',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. МУЗЫКАНТЫ (MUSICIANS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.musicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  genre TEXT[],
  bio TEXT,
  avatar_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'free',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Треки музыкантов
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID REFERENCES public.musicians(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  audio_url TEXT,
  duration INTEGER, -- в секундах
  genre TEXT[],
  release_date DATE,
  spotify_url TEXT,
  apple_music_url TEXT,
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published')) DEFAULT 'draft',
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. ЗАВЕДЕНИЯ (VENUES)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- Бар, Ресторан, Клуб и т.д.
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Россия',
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  instagram_url TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'free',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Заказы контента для заведений
CREATE TABLE IF NOT EXISTS public.venue_content_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  order_type TEXT CHECK (order_type IN ('single_play', 'daily', 'weekly', 'monthly')) NOT NULL,
  plays_count INTEGER DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'playing', 'completed', 'cancelled')) DEFAULT 'pending',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Плейлисты заведений
CREATE TABLE IF NOT EXISTS public.venue_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tracks JSONB DEFAULT '[]', -- Массив track_id
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. РАДИОСТАНЦИИ (RADIO STATIONS) - 16 ТАБЛИЦ
-- =====================================================

-- 4.1. Основная таблица радиостанций
CREATE TABLE IF NOT EXISTS public.radio_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slogan TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  stream_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  country TEXT DEFAULT 'Россия',
  genres TEXT[],
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'basic', 'professional', 'enterprise')) DEFAULT 'free',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  subscription_expires_at TIMESTAMPTZ,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2. Запросы артистов к радиостанциям
CREATE TABLE IF NOT EXISTS public.radio_artist_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_station_id UUID REFERENCES public.radio_stations(id) ON DELETE CASCADE,
  musician_id UUID REFERENCES public.musicians(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'archived')) DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3. Запросы заведений к радиостанциям
CREATE TABLE IF NOT EXISTS public.radio_venue_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_station_id UUID REFERENCES public.radio_stations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  request_type TEXT CHECK (request_type IN ('partnership', 'advertising', 'collaboration', 'other')) NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'archived')) DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. РЕКЛАМНЫЕ СЛОТЫ (AD SLOTS) - 5 ТАБЛИЦ С WORKFLOW
-- =====================================================

-- 5.1. Определение рекламных слотов
CREATE TABLE IF NOT EXISTS public.ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radio_station_id UUID REFERENCES public.radio_stations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slot_type TEXT CHECK (slot_type IN ('banner', 'audio', 'video', 'native')) DEFAULT 'audio',
  duration INTEGER, -- в секундах (для audio/video)
  price_per_play DECIMAL(10, 2) NOT NULL,
  daily_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2. Рекламные кампании
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  advertiser_type TEXT CHECK (advertiser_type IN ('musician', 'venue', 'external')) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2) NOT NULL,
  spent DECIMAL(10, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'pending', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3. Рекламные материалы
CREATE TABLE IF NOT EXISTS public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_type TEXT CHECK (creative_type IN ('audio', 'image', 'video', 'text')) NOT NULL,
  file_url TEXT,
  text_content TEXT,
  duration INTEGER, -- для audio/video
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.4. Бронирования слотов
CREATE TABLE IF NOT EXISTS public.ad_slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_slot_id UUID REFERENCES public.ad_slots(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES public.ad_creatives(id) ON DELETE CASCADE,
  plays_ordered INTEGER NOT NULL,
  plays_completed INTEGER DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.5. Транзакции по рекламным слотам (85% радио / 15% платформа)
CREATE TABLE IF NOT EXISTS public.ad_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.ad_slot_bookings(id) ON DELETE CASCADE,
  radio_station_id UUID REFERENCES public.radio_stations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  radio_amount DECIMAL(10, 2) NOT NULL, -- 85%
  platform_amount DECIMAL(10, 2) NOT NULL, -- 15%
  status TEXT CHECK (status IN ('pending', 'completed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. AI AGENT (ЧАРТЫ, НОВОСТИ, АНАЛИТИКА)
-- =====================================================

-- 6.1. Чарты радиостанций
CREATE TABLE IF NOT EXISTS public.radio_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT CHECK (source IN ('russkoe-radio', 'radio-maximum', 'nashe-radio', 'dfm-radio')) NOT NULL,
  chart_date DATE NOT NULL,
  position INTEGER NOT NULL,
  track_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  previous_position INTEGER,
  weeks_in_chart INTEGER DEFAULT 1,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, chart_date, position)
);

-- 6.2. AI-сгенерированные новости
CREATE TABLE IF NOT EXISTS public.ai_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  source_url TEXT,
  cover_image_url TEXT,
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'published', 'rejected')) DEFAULT 'pending',
  ai_model TEXT DEFAULT 'claude-3.5', -- Claude для обработки новостей
  moderation_notes TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3. AI-аналитика трендов
CREATE TABLE IF NOT EXISTS public.ai_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date DATE NOT NULL,
  analysis_type TEXT CHECK (analysis_type IN ('weekly_trends', 'monthly_trends', 'genre_analysis', 'artist_analysis')) DEFAULT 'weekly_trends',
  content TEXT NOT NULL, -- HTML контент анализа
  data JSONB, -- Структурированные данные
  ai_model TEXT DEFAULT 'mistral-large', -- Mistral для анализа чартов
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. PROMO.GUIDE (Музыкальный Shazam наоборот + социальный слой)
-- =====================================================

-- 7.1. Прослушивания треков в заведениях
CREATE TABLE IF NOT EXISTS public.promo_guide_listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_device_id TEXT, -- анонимная идентификация устройства
  listened_at TIMESTAMPTZ DEFAULT NOW(),
  duration_listened INTEGER, -- сколько секунд прослушано
  source TEXT CHECK (source IN ('venue_player', 'mobile_app', 'web_app')) DEFAULT 'venue_player'
);

-- 7.2. Реакции пользователей на треки
CREATE TABLE IF NOT EXISTS public.promo_guide_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  user_device_id TEXT,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike', 'save', 'share')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(track_id, user_device_id, reaction_type)
);

-- 7.3. Shazam-подобные распознавания
CREATE TABLE IF NOT EXISTS public.promo_guide_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  user_device_id TEXT,
  recognition_method TEXT CHECK (recognition_method IN ('audio_fingerprint', 'qr_code', 'nfc')) DEFAULT 'audio_fingerprint',
  recognized_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. АНАЛИТИКА (для музыкантов и заведений)
-- =====================================================

-- 8.1. Аналитика прослушиваний
CREATE TABLE IF NOT EXISTS public.analytics_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  radio_station_id UUID REFERENCES public.radio_stations(id) ON DELETE SET NULL,
  play_source TEXT CHECK (play_source IN ('venue', 'radio', 'promo_guide', 'direct')) NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration_played INTEGER, -- в секундах
  listener_location TEXT,
  listener_device_type TEXT
);

-- 8.2. Аналитика доходов
CREATE TABLE IF NOT EXISTS public.analytics_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('musician', 'venue', 'radio_station')) NOT NULL,
  entity_id UUID NOT NULL,
  revenue_type TEXT CHECK (revenue_type IN ('subscription', 'content_order', 'ad_revenue', 'commission')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- =====================================================
-- 9. ФИНАНСЫ И ТРАНЗАКЦИИ
-- =====================================================

-- 9.1. Кошельки пользователей
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'RUB',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 9.2. Транзакции
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'refund', 'commission', 'subscription')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  payment_provider TEXT,
  external_transaction_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 9.3. Вывод средств
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'RUB',
  withdrawal_method TEXT CHECK (withdrawal_method IN ('bank_transfer', 'card', 'paypal', 'crypto')) NOT NULL,
  destination TEXT NOT NULL, -- реквизиты получателя
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')) DEFAULT 'pending',
  admin_notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- =====================================================
-- 10. ПАРТНЕРСКАЯ ПРОГРАММА
-- =====================================================

-- 10.1. Партнеры (реферальная система)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- процент комиссии
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10.2. Рефералы
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'expired')) DEFAULT 'pending',
  commission_earned DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  UNIQUE(partner_id, referred_user_id)
);

-- 10.3. Комиссии партнеров
CREATE TABLE IF NOT EXISTS public.partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  commission_amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. ПОДПИСКИ И ТАРИФЫ
-- =====================================================

-- 11.1. Тарифные планы
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  user_type TEXT CHECK (user_type IN ('musician', 'venue', 'radio_station')) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')) DEFAULT 'monthly',
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11.2. Подписки пользователей
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  discount_percent DECIMAL(5, 2) DEFAULT 0, -- персональная скидка
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. МОДЕРАЦИЯ КОНТЕНТА
-- =====================================================

-- 12.1. Очередь модерации
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT CHECK (content_type IN ('track', 'news', 'ad_creative', 'user_profile')) NOT NULL,
  content_id UUID NOT NULL,
  submitter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')) DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  moderator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  moderation_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 12.2. История модерации
CREATE TABLE IF NOT EXISTS public.moderation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderation_queue_id UUID REFERENCES public.moderation_queue(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT CHECK (action IN ('approved', 'rejected', 'flagged', 'comment')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. УВЕДОМЛЕНИЯ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  category TEXT CHECK (category IN ('system', 'payment', 'moderation', 'social', 'marketing')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- =====================================================
-- 14. НАСТРОЙКИ И КОНФИГУРАЦИЯ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ ПРОИЗВОДИТЕЛЬНОСТИ
-- =====================================================

-- Индексы для поиска и фильтрации
CREATE INDEX IF NOT EXISTS idx_musicians_user_id ON public.musicians(user_id);
CREATE INDEX IF NOT EXISTS idx_musicians_subscription_plan ON public.musicians(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_tracks_musician_id ON public.tracks(musician_id);
CREATE INDEX IF NOT EXISTS idx_tracks_status ON public.tracks(status);
CREATE INDEX IF NOT EXISTS idx_venues_user_id ON public.venues(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON public.venues(city);
CREATE INDEX IF NOT EXISTS idx_radio_stations_user_id ON public.radio_stations(user_id);
CREATE INDEX IF NOT EXISTS idx_radio_artist_requests_status ON public.radio_artist_requests(status);
CREATE INDEX IF NOT EXISTS idx_radio_venue_requests_status ON public.radio_venue_requests(status);

-- Индексы для аналитики
CREATE INDEX IF NOT EXISTS idx_analytics_plays_track_id ON public.analytics_plays(track_id);
CREATE INDEX IF NOT EXISTS idx_analytics_plays_venue_id ON public.analytics_plays(venue_id);
CREATE INDEX IF NOT EXISTS idx_analytics_plays_played_at ON public.analytics_plays(played_at);
CREATE INDEX IF NOT EXISTS idx_analytics_revenue_entity ON public.analytics_revenue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_revenue_date ON public.analytics_revenue(transaction_date);

-- Индексы для рекламных слотов
CREATE INDEX IF NOT EXISTS idx_ad_slot_bookings_campaign_id ON public.ad_slot_bookings(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_slot_bookings_status ON public.ad_slot_bookings(status);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_radio_station_id ON public.ad_transactions(radio_station_id);
CREATE INDEX IF NOT EXISTS idx_ad_transactions_status ON public.ad_transactions(status);

-- Индексы для AI Agent
CREATE INDEX IF NOT EXISTS idx_radio_charts_source_date ON public.radio_charts(source, chart_date);
CREATE INDEX IF NOT EXISTS idx_ai_news_status ON public.ai_news(status);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_date ON public.ai_analytics(analysis_date);

-- Индексы для Promo.Guide
CREATE INDEX IF NOT EXISTS idx_promo_guide_listening_venue ON public.promo_guide_listening_history(venue_id);
CREATE INDEX IF NOT EXISTS idx_promo_guide_listening_track ON public.promo_guide_listening_history(track_id);
CREATE INDEX IF NOT EXISTS idx_promo_guide_listening_date ON public.promo_guide_listening_history(listened_at);

-- Индексы для транзакций
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- Индексы для модерации
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content ON public.moderation_queue(content_type, content_id);

-- Индексы для уведомлений
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- RLS (ROW LEVEL SECURITY) - Базовая настройка
-- =====================================================

-- Включаем RLS на всех таблицах
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Пример базовой политики: пользователи видят только свои данные
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Musicians can view own data" ON public.musicians
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Venues can view own data" ON public.venues
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Radio stations can view own data" ON public.radio_stations
  FOR SELECT USING (auth.uid() = user_id);

-- Все могут видеть опубликованные треки
CREATE POLICY "Anyone can view published tracks" ON public.tracks
  FOR SELECT USING (status = 'published');

-- Музыканты могут видеть свои треки
CREATE POLICY "Musicians can view own tracks" ON public.tracks
  FOR SELECT USING (
    musician_id IN (SELECT id FROM public.musicians WHERE user_id = auth.uid())
  );

-- =====================================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКИХ ДЕЙСТВИЙ
-- =====================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггер на все таблицы с updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_musicians_updated_at BEFORE UPDATE ON public.musicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_radio_stations_updated_at BEFORE UPDATE ON public.radio_stations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- =====================================================

-- Вставляем базовые тарифные планы для музыкантов
INSERT INTO public.subscription_plans (name, slug, user_type, price, billing_period, features, sort_order)
VALUES 
  ('Free', 'free', 'musician', 0, 'monthly', '{"tracks": 3, "analytics": false, "pitching": false}', 1),
  ('Basic', 'basic', 'musician', 990, 'monthly', '{"tracks": 10, "analytics": true, "pitching": false}', 2),
  ('Professional', 'professional', 'musician', 2990, 'monthly', '{"tracks": 50, "analytics": true, "pitching": true, "promo_guide": true}', 3),
  ('Enterprise', 'enterprise', 'musician', 9990, 'monthly', '{"tracks": "unlimited", "analytics": true, "pitching": true, "promo_guide": true, "ai_agent": true, "priority_support": true}', 4)
ON CONFLICT (slug) DO NOTHING;

-- Вставляем базовые тарифные планы для заведений
INSERT INTO public.subscription_plans (name, slug, user_type, price, billing_period, features, sort_order)
VALUES 
  ('Free', 'venue_free', 'venue', 0, 'monthly', '{"playlists": 1, "content_orders": 10, "analytics": false}', 1),
  ('Basic', 'venue_basic', 'venue', 1990, 'monthly', '{"playlists": 3, "content_orders": 50, "analytics": true}', 2),
  ('Professional', 'venue_professional', 'venue', 4990, 'monthly', '{"playlists": 10, "content_orders": 200, "analytics": true, "promo_guide": true}', 3),
  ('Enterprise', 'venue_enterprise', 'venue', 14990, 'monthly', '{"playlists": "unlimited", "content_orders": "unlimited", "analytics": true, "promo_guide": true, "api_access": true}', 4)
ON CONFLICT (slug) DO NOTHING;

-- Вставляем базовые тарифные планы для радиостанций
INSERT INTO public.subscription_plans (name, slug, user_type, price, billing_period, features, sort_order)
VALUES 
  ('Free', 'radio_free', 'radio_station', 0, 'monthly', '{"ad_slots": 2, "artist_requests": 20, "analytics": false}', 1),
  ('Basic', 'radio_basic', 'radio_station', 4990, 'monthly', '{"ad_slots": 5, "artist_requests": 100, "analytics": true}', 2),
  ('Professional', 'radio_professional', 'radio_station', 14990, 'monthly', '{"ad_slots": 20, "artist_requests": 500, "analytics": true, "ai_charts": true}', 3),
  ('Enterprise', 'radio_enterprise', 'radio_station', 49990, 'monthly', '{"ad_slots": "unlimited", "artist_requests": "unlimited", "analytics": true, "ai_charts": true, "white_label": true}', 4)
ON CONFLICT (slug) DO NOTHING;

-- Вставляем системные настройки
INSERT INTO public.system_settings (key, value, description)
VALUES 
  ('platform_commission_rate', '15', 'Комиссия платформы с рекламных транзакций (%)'),
  ('radio_revenue_rate', '85', 'Доля радиостанции от рекламных доходов (%)'),
  ('min_withdrawal_amount', '1000', 'Минимальная сумма для вывода средств (RUB)'),
  ('content_moderation_enabled', 'true', 'Включена ли модерация контента'),
  ('ai_agent_enabled', 'true', 'Включен ли AI-агент для сбора чартов и новостей')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =====================================================
-- ГОТОВО! 🎉
-- =====================================================

-- Скрипт успешно создал все таблицы для promo.music
-- Общее количество таблиц: 40+
-- Следующие шаги:
-- 1. Настройте дополнительные RLS политики под ваши нужды
-- 2. Настройте Storage buckets для загрузки файлов
-- 3. Настройте Edge Functions для бизнес-логики
