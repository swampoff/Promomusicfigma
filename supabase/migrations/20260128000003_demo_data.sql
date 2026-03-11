-- =====================================================
-- SEED DATA — Реалистичные данные для разработки
-- Заведения, радиостанции, артисты, диджеи, лейблы
-- =====================================================

-- Очистка существующих сид-данных
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM transactions WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM pitching_requests WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM news WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM concerts WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM videos WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM tracks WHERE user_id IN (SELECT id FROM users_extended WHERE email LIKE '%@seed.promo.fm');
DELETE FROM users_extended WHERE email LIKE '%@seed.promo.fm';

-- =====================================================
-- USERS — реалистичные профили
-- =====================================================
INSERT INTO users_extended (username, display_name, email, role, status, verified, avatar_url, bio, location, followers_count, total_plays, balance, coins_balance, subscription_tier) VALUES

-- Артисты
('kedr_livanskiy', 'Kedr Livanskiy', 'kedr@seed.promo.fm', 'artist', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=kedr', 'Электронная музыка, синтезаторы, dream-pop. Релизы на 2MR, Not Not Fun.', 'Санкт-Петербург', 28400, 4560000, 87200.00, 2100, 'pro'),
('monetochka_elizaveta', 'Монеточка', 'monetochka@seed.promo.fm', 'artist', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=monetochka', 'Певица и автор песен. Альбомы: Раскраски для взрослых, Нет монет.', 'Москва', 156000, 34500000, 234500.00, 8900, 'elite'),
('pompeya_band', 'Pompeya', 'pompeya@seed.promo.fm', 'artist', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=pompeya', 'Indie-электроника. Tropical, Real, Power.', 'Москва', 42000, 8900000, 56000.00, 3200, 'pro'),

-- Диджеи
('dj_nina_kraviz', 'Nina Kraviz', 'nina@seed.promo.fm', 'dj', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina', 'Techno DJ & Producer. Основательница трип-лейбла. Резидент Mutabor.', 'Москва', 89000, 12300000, 345000.00, 12000, 'elite'),
('dj_phil_weeks', 'Phil Weeks', 'phil@seed.promo.fm', 'dj', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=phil', 'Deep House / Tech House. Резидент Gazgolder.', 'Москва', 34500, 5600000, 120000.00, 4500, 'pro'),
('dj_lapti', 'DJ Lapti', 'lapti@seed.promo.fm', 'dj', 'active', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=lapti', 'Underground techno, acid. Резидент Griboedov.', 'Санкт-Петербург', 8900, 1200000, 28000.00, 800, 'start'),

-- Лейблы
('trip_label', 'трип', 'trip@seed.promo.fm', 'label', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=trip', 'Независимый лейбл. Techno, acid, experimental.', 'Москва', 45000, 23000000, 567000.00, 15000, 'elite'),
('kompakt_ru', 'Kompakt Russia', 'kompakt@seed.promo.fm', 'label', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=kompakt', 'Представительство Kompakt Records в России. Minimal, techno.', 'Москва', 23000, 12000000, 234000.00, 6700, 'pro'),

-- Заведения (реальные клубы)
('mutabor_club', 'Mutabor', 'mutabor@seed.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=mutabor', 'Техно-клуб. 1500 чел. Pioneer CDJ-3000, DJM-V10, Funktion-One.', 'Москва', 67000, 0, 890000.00, 3400, 'venue-business'),
('gazgolder_club', 'Gazgolder Club', 'gazgolder@seed.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=gazgolder', 'Клуб и концертная площадка. 2000 чел. L-Acoustics K2, Pioneer.', 'Москва', 54000, 0, 670000.00, 2800, 'venue-business'),
('propaganda_club', 'Propaganda', 'propaganda@seed.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=propaganda', 'Легендарный бар-клуб с 1997 года. 600 чел. House, disco, tech house.', 'Москва', 89000, 0, 450000.00, 1500, 'venue-start'),
('griboedov_club', 'Griboedov', 'griboedov@seed.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=griboedov', 'Андеграунд-клуб в бомбоубежище. 350 чел. D&B, techno, jungle.', 'Санкт-Петербург', 34000, 0, 280000.00, 900, 'venue-start'),
('sevcabel_port', 'Севкабель Порт', 'sevcabel@seed.promo.fm', 'venue', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=sevcabel', 'Креативное пространство на набережной. Фестивали, концерты. 8000 чел.', 'Санкт-Петербург', 120000, 0, 1200000.00, 5600, 'venue-network'),

-- Радиостанции
('kissfm_msk', 'Kiss FM Moscow', 'kissfm@seed.promo.fm', 'radio', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=kissfm', 'Dance-радио. FM 106.5. Охват: 2.4 млн слушателей/мес. EDM, house, pop.', 'Москва', 340000, 0, 1200000.00, 23000, 'radio-station'),
('megapolis_fm', 'Megapolis FM', 'megapolis@seed.promo.fm', 'radio', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=megapolis', 'Электронная музыка. FM 89.5. Охват: 1.8 млн. Techno, house, ambient.', 'Москва', 230000, 0, 890000.00, 15000, 'radio-station'),
('piteri_fm', 'Питер FM', 'piteri@seed.promo.fm', 'radio', 'active', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=piteri', 'Радио Санкт-Петербурга. FM 100.9. Охват: 1.2 млн. Pop, indie, rock.', 'Санкт-Петербург', 180000, 0, 670000.00, 12000, 'radio-station'),

-- Новые пользователи (ожидают модерации)
('new_producer', 'Артём Крафт', 'artem@seed.promo.fm', 'artist', 'pending', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=artem', 'Начинающий продюсер. Lo-fi, hip-hop beats.', 'Новосибирск', 0, 0, 0, 0, 'spark'),
('new_dj_kazan', 'DJ Volga', 'volga@seed.promo.fm', 'dj', 'pending', false, 'https://api.dicebear.com/7.x/avataaars/svg?seed=volga', 'Начинающий диджей. Melodic techno, progressive.', 'Казань', 0, 0, 0, 0, 'spark');

-- =====================================================
-- TRACKS — реалистичные треки
-- =====================================================
INSERT INTO tracks (user_id, title, artist_name, genre, subgenre, audio_url, cover_url, duration_seconds, status, plays_count, likes_count, bpm, created_at)
SELECT
  u.id,
  t.title,
  t.artist_name,
  t.genre,
  t.subgenre,
  'https://storage.promo.fm/tracks/' || LOWER(REPLACE(t.title, ' ', '-')) || '.mp3',
  'https://storage.promo.fm/covers/' || LOWER(REPLACE(t.title, ' ', '-')) || '.jpg',
  t.duration,
  t.status,
  t.plays,
  t.likes,
  t.bpm,
  NOW() - (random() * interval '90 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('Скитания', 'Kedr Livanskiy', 'Electronic', 'Dream Pop', 248, 'approved', 234500, 18900, 118),
  ('Lugovoy', 'Kedr Livanskiy', 'Electronic', 'Synth Pop', 312, 'approved', 567000, 34500, 125),
  ('Нимфоманка', 'Монеточка', 'Pop', 'Indie Pop', 195, 'approved', 8900000, 456000, 120),
  ('Каждый раз', 'Монеточка', 'Pop', 'Electropop', 210, 'approved', 12300000, 678000, 128),
  ('Tropical', 'Pompeya', 'Electronic', 'Indie Dance', 285, 'approved', 3400000, 189000, 122),
  ('Power', 'Pompeya', 'Electronic', 'New Wave', 256, 'approved', 2100000, 145000, 130),
  ('Ghetto Kraviz', 'Nina Kraviz', 'Electronic', 'Techno', 420, 'approved', 4500000, 234000, 132),
  ('I''m Gonna Get You', 'Nina Kraviz', 'Electronic', 'Acid Techno', 378, 'approved', 6700000, 345000, 138),
  ('Live at Propaganda', 'Phil Weeks', 'Electronic', 'Deep House', 3600, 'approved', 890000, 67000, 124),
  ('Basement Sessions', 'DJ Lapti', 'Electronic', 'Acid Techno', 2400, 'pending', 0, 0, 140),
  ('Lo-fi Sunset', 'Артём Крафт', 'Hip-Hop', 'Lo-fi', 180, 'pending', 0, 0, 85)
) t(title, artist_name, genre, subgenre, duration, status, plays, likes, bpm)
WHERE u.username IN ('kedr_livanskiy', 'monetochka_elizaveta', 'pompeya_band', 'dj_nina_kraviz', 'dj_phil_weeks', 'dj_lapti', 'new_producer');

-- =====================================================
-- CONCERTS — реальные площадки, актуальные даты
-- =====================================================
INSERT INTO concerts (user_id, title, description, type, city, venue, event_date, event_time, ticket_price_from, ticket_price_to, banner_url, status, views_count, interested_count, created_at)
SELECT
  u.id,
  c.title,
  c.description,
  c.type,
  c.city,
  c.venue,
  CURRENT_DATE + (c.days_offset || ' days')::INTERVAL,
  c.time,
  c.price_from,
  c.price_to,
  'https://storage.promo.fm/banners/concerts/' || LOWER(REPLACE(c.title, ' ', '-')) || '.jpg',
  c.status,
  c.views,
  c.interested,
  NOW() - (random() * interval '10 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('Techno Résidence @ Mutabor', 'Ежемесячная техно-резиденция. Line-up: Nina Kraviz, Бен Клок.', 'club', 'Москва', 'Mutabor', 3, '23:00', 1500.00, 3500.00, 'approved', 34500, 2800),
  ('Awakening Festival 2026', 'Открытый фестиваль электронной музыки на Севкабеле. 3 сцены, 20+ артистов.', 'festival', 'Санкт-Петербург', 'Севкабель Порт', 38, '14:00', 3000.00, 8000.00, 'approved', 89000, 12400),
  ('Deep Sessions @ Gazgolder', 'Phil Weeks all night long. Deep house, afro house, soulful grooves.', 'club', 'Москва', 'Gazgolder Club', 10, '23:30', 1200.00, 2500.00, 'approved', 23400, 1890),
  ('Монеточка — Нет монет Tour', 'Презентация нового альбома. Специальные гости.', 'concert', 'Москва', 'Adrenaline Stadium', 25, '19:00', 2500.00, 12000.00, 'approved', 156000, 34500),
  ('Bassline @ Griboedov', 'D&B, jungle, breakbeat. Резиденты + гости из Москвы.', 'club', 'Санкт-Петербург', 'Griboedov', 5, '23:00', 800.00, 1500.00, 'approved', 8900, 670),
  ('Pompeya — Acoustic Set', 'Камерный акустический сет в баре. 100 мест.', 'club', 'Москва', 'Propaganda', 17, '20:00', 2000.00, 4000.00, 'pending', 0, 0)
) c(title, description, type, city, venue, days_offset, time, price_from, price_to, status, views, interested)
WHERE u.username IN ('dj_nina_kraviz', 'dj_phil_weeks', 'monetochka_elizaveta', 'pompeya_band', 'dj_lapti');

-- =====================================================
-- NEWS — актуальные новости
-- =====================================================
INSERT INTO news (user_id, title, preview, content, cover_url, category, status, views_count, likes_count, created_at)
SELECT
  u.id,
  n.title,
  n.preview,
  n.content,
  'https://storage.promo.fm/news/' || LOWER(REPLACE(n.title, ' ', '-')) || '.jpg',
  n.category,
  n.status,
  n.views,
  n.likes,
  NOW() - (random() * interval '15 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('Mutabor объявил летний лайнап', 'Главный техно-клуб Москвы раскрыл программу сезона 2026.', 'Mutabor Club представил полный лайнап летнего сезона 2026. В программе: резиденции Nina Kraviz, выступления европейских хедлайнеров и новый звук от Funktion-One. Продажа абонементов стартует 20 марта.', 'announcement', 'approved', 45600, 3400),
  ('Севкабель Порт запускает Awakening Festival', 'Новый open-air фестиваль электронной музыки в Петербурге.', 'Севкабель Порт анонсировал первый Awakening Festival — open-air фестиваль электронной музыки на набережной. 3 сцены, 20+ артистов, фуд-корт и маркет. Даты: 18 апреля 2026. Early bird билеты уже в продаже.', 'event', 'approved', 89000, 6700),
  ('Kedr Livanskiy выпустила новый EP', 'Четыре новых трека на лейбле 2MR Records.', 'Kedr Livanskiy представила EP "Liminal" — четыре трека на стыке dream-pop и электроники. Записано в студии Санкт-Петербурга с аналоговыми синтезаторами Roland Juno-106 и Korg MS-20.', 'release', 'approved', 23400, 1890),
  ('Монеточка анонсировала тур', 'Презентация альбома "Нет монет" в 15 городах России.', 'Монеточка объявила о старте тура в поддержку нового альбома "Нет монет". 15 городов, старт в Москве (Adrenaline Stadium, 25 апреля). VIP-пакеты включают meet & greet.', 'event', 'approved', 156000, 12300)
) n(title, preview, content, category, status, views, likes)
WHERE u.username IN ('mutabor_club', 'sevcabel_port', 'kedr_livanskiy', 'monetochka_elizaveta');

-- =====================================================
-- TRANSACTIONS — реалистичные финансовые операции
-- =====================================================
INSERT INTO transactions (user_id, type, amount, description, status, created_at)
SELECT
  u.id,
  t.type,
  t.amount,
  t.description,
  t.status,
  NOW() - (random() * interval '60 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('deposit', 89900.00, 'Оплата подписки «Про» (год)', 'completed'),
  ('earning', 12400.00, 'Роялти за стриминг (февраль)', 'completed'),
  ('earning', 8900.00, 'Роялти за стриминг (январь)', 'completed'),
  ('purchase', 7000.00, 'Рассылка на радиостанции (1 кредит)', 'completed'),
  ('earning', 3400.00, 'Донаты от слушателей', 'completed'),
  ('withdrawal', 25000.00, 'Вывод на карту *4276', 'completed'),
  ('deposit', 149990.00, 'Оплата подписки «Бизнес» (мес)', 'completed'),
  ('purchase', 15000.00, 'Баннерная реклама (7 дней)', 'completed'),
  ('earning', 65000.00, 'Букинг: Mutabor 14 мар', 'completed'),
  ('earning', 45000.00, 'Букинг: Propaganda 7 мар', 'completed'),
  ('deposit', 9990.00, 'Оплата подписки Заведение «Бизнес» (мес)', 'completed'),
  ('purchase', 2500.00, 'Заказ джингла (15 сек)', 'completed'),
  ('purchase', 3000.00, 'Рекламный ролик (30 сек)', 'completed')
) t(type, amount, description, status)
WHERE u.username IN ('kedr_livanskiy', 'monetochka_elizaveta', 'dj_nina_kraviz', 'dj_phil_weeks', 'mutabor_club', 'gazgolder_club', 'kissfm_msk')
LIMIT 80;

-- =====================================================
-- NOTIFICATIONS — реалистичные уведомления
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, is_read, priority, created_at)
SELECT
  u.id,
  n.type,
  n.title,
  n.message,
  n.is_read,
  n.priority,
  NOW() - (random() * interval '7 days')
FROM users_extended u
CROSS JOIN (VALUES
  ('moderation', 'Трек одобрен', 'Ваш трек «Ghetto Kraviz» прошёл модерацию и опубликован в каталоге.', false, 'normal'),
  ('payment', 'Букинг оплачен', 'Получен депозит 19,500 ₽ за выступление в Mutabor (14 мар).', false, 'high'),
  ('booking', 'Новый запрос на букинг', 'Gazgolder Club приглашает на Deep Sessions (21 мар). Гонорар: 80,000 ₽.', false, 'high'),
  ('system', 'Подписка продлена', 'Подписка «Про» успешно продлена до 15 апреля 2026.', true, 'normal'),
  ('marketing', 'Рассылка завершена', 'Ваш трек отправлен на 45 радиостанций. Ожидайте ответов в течение 5 дней.', true, 'normal'),
  ('social', 'Новый отзыв', 'Propaganda оставила отзыв о выступлении 7 марта (5 звёзд).', false, 'low')
) n(type, title, message, is_read, priority)
WHERE u.username IN ('dj_nina_kraviz', 'dj_phil_weeks', 'kedr_livanskiy', 'monetochka_elizaveta', 'mutabor_club')
LIMIT 30;
