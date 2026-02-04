# 🎸 BOOKING СИСТЕМА - ПОЛНАЯ АРХИТЕКТУРА ДЛЯ АРТИСТОВ И ЗАВЕДЕНИЙ

**Дата:** 3 февраля 2026  
**Версия:** 2.0 - Двусторонняя букинг-система  

---

## 🏗️ ОБЩАЯ АРХИТЕКТУРА

### **Участники системы:**

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  ЗАВЕДЕНИЕ  │────────▶│   ПЛАТФОРМА  │◀────────│  АРТИСТ/DJ  │
│   (Venue)   │         │ promo.music  │         │  (Artist)   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                         │
      │ Создает заявку        │ Комиссия 10%           │ Принимает
      │ Оплачивает            │ Гарантирует сделку     │ Получает выплату
      │ Оставляет отзыв       │ Модерирует             │ Управляет календарем
      └───────────────────────┴────────────────────────┘
```

### **Типы performers (исполнителей):**

| Тип | Таблица | Роль | Описание |
|-----|---------|------|----------|
| `artist` | `artist_profiles` | artist | Музыкант, певец, группа |
| `dj` | `dj_profiles` | dj | DJ, диджей |
| `band` | `artist_profiles` | artist | Live band (тип артиста) |

**Важно:** В системе букинга оба типа (`artist` и `dj`) работают одинаково!

---

## 📊 SQL СТРУКТУРА

### **1. Таблица booking_requests**

**Основная таблица заявок на букинг**

```sql
CREATE TABLE public.booking_requests (
    -- Идентификация
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Участники (venue → performer)
    requester_id UUID NOT NULL REFERENCES public.profiles(id),
    requester_type TEXT NOT NULL DEFAULT 'venue', -- venue, artist (если артист букает артиста)
    performer_id UUID NOT NULL REFERENCES public.profiles(id),
    performer_type TEXT NOT NULL, -- 'artist' или 'dj'
    
    -- Мероприятие
    event_type TEXT NOT NULL DEFAULT 'dj_set', -- concert, dj_set, live, corporate, wedding, private
    event_title TEXT NOT NULL,
    event_description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_hours NUMERIC(4,1) DEFAULT 4,
    
    -- Локация
    venue_id UUID REFERENCES public.venue_profiles(id), -- Если известно заведение
    venue_name TEXT, -- Название заведения
    venue_address TEXT,
    venue_city TEXT,
    venue_type TEXT, -- bar, club, restaurant, concert_hall, outdoor, private
    
    -- Аудитория
    expected_audience INTEGER,
    audience_type TEXT, -- general, vip, corporate, private
    
    -- Финансы
    offered_price NUMERIC(10,2) NOT NULL, -- Полная сумма от заведения
    performer_fee NUMERIC(10,2), -- Сумма артисту (90%)
    platform_commission NUMERIC(10,2), -- Комиссия платформы (10%)
    currency TEXT DEFAULT 'RUB',
    
    -- Депозит
    deposit_amount NUMERIC(10,2), -- 30% от offered_price
    deposit_percentage NUMERIC(5,2) DEFAULT 30.00,
    deposit_paid_at TIMESTAMPTZ,
    deposit_transaction_id UUID REFERENCES public.payment_transactions(id),
    
    -- Финальный платеж
    final_amount NUMERIC(10,2), -- 70% от offered_price
    full_payment_at TIMESTAMPTZ,
    final_transaction_id UUID REFERENCES public.payment_transactions(id),
    
    -- Выплата артисту
    payout_amount NUMERIC(10,2), -- performer_fee
    payout_at TIMESTAMPTZ,
    payout_transaction_id UUID REFERENCES public.payment_transactions(id),
    payout_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- Технические требования
    technical_requirements JSONB DEFAULT '{}', -- {equipment: [], sound: "", lighting: "", other: ""}
    special_requests TEXT,
    
    -- Статус workflow
    status TEXT DEFAULT 'pending',
    -- pending: ожидает ответа артиста
    -- accepted: артист принял, ждет депозит
    -- rejected: артист отклонил
    -- deposit_paid: депозит оплачен
    -- confirmed: полная оплата, букинг подтвержден
    -- completed: мероприятие прошло
    -- cancelled: отменено
    -- refunded: возврат средств
    
    -- Отмена
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES public.profiles(id),
    cancelled_at TIMESTAMPTZ,
    cancellation_fee NUMERIC(10,2) DEFAULT 0, -- Штраф за отмену
    refund_amount NUMERIC(10,2),
    refund_processed_at TIMESTAMPTZ,
    
    -- Отзывы (после мероприятия)
    venue_review_id UUID REFERENCES public.venue_artist_reviews(id),
    artist_review_id UUID REFERENCES public.venue_artist_reviews(id),
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'accepted', 'rejected', 'deposit_paid', 
        'confirmed', 'completed', 'cancelled', 'refunded'
    )),
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'concert', 'dj_set', 'live', 'corporate', 'wedding', 'private'
    )),
    CONSTRAINT valid_performer_type CHECK (performer_type IN ('artist', 'dj')),
    CONSTRAINT valid_payout_status CHECK (payout_status IN (
        'pending', 'processing', 'completed', 'failed'
    ))
);

-- Индексы для производительности
CREATE INDEX idx_booking_requests_requester ON public.booking_requests(requester_id);
CREATE INDEX idx_booking_requests_performer ON public.booking_requests(performer_id);
CREATE INDEX idx_booking_requests_status ON public.booking_requests(status);
CREATE INDEX idx_booking_requests_event_date ON public.booking_requests(event_date);
CREATE INDEX idx_booking_requests_created_at ON public.booking_requests(created_at);
CREATE INDEX idx_booking_requests_performer_status ON public.booking_requests(performer_id, status);

-- Триггер обновления timestamp
CREATE TRIGGER update_booking_requests_updated_at 
BEFORE UPDATE ON public.booking_requests 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS политики
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Участники видят свои букинги
CREATE POLICY "Users see own booking requests"
ON public.booking_requests FOR SELECT
USING (
    auth.uid() = requester_id OR 
    auth.uid() = performer_id
);

-- Админы видят все
CREATE POLICY "Admins see all booking requests"
ON public.booking_requests FOR SELECT
USING (public.is_admin(auth.uid()));

-- Venue может создавать заявки
CREATE POLICY "Venues can create booking requests"
ON public.booking_requests FOR INSERT
WITH CHECK (
    auth.uid() = requester_id AND 
    (public.has_role(auth.uid(), 'venue') OR public.has_role(auth.uid(), 'artist'))
);

-- Участники могут обновлять свои букинги
CREATE POLICY "Participants can update bookings"
ON public.booking_requests FOR UPDATE
USING (
    auth.uid() = performer_id OR 
    auth.uid() = requester_id OR
    public.is_admin(auth.uid())
);
```

---

### **2. Таблица booking_calendar**

**Календарь доступности артистов/DJ**

```sql
CREATE TABLE public.booking_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Кому принадлежит календарь
    performer_id UUID NOT NULL REFERENCES public.profiles(id),
    performer_type TEXT NOT NULL, -- 'artist' или 'dj'
    
    -- Дата
    date DATE NOT NULL,
    
    -- Доступность
    is_available BOOLEAN DEFAULT true,
    
    -- Если занято букингом
    booking_id UUID REFERENCES public.booking_requests(id),
    
    -- Ручная блокировка
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT, -- vacation, personal, maintenance, other
    blocked_note TEXT,
    
    -- Тайм-слоты (опционально, для более точного контроля)
    time_slots JSONB DEFAULT '[]', -- [{start: "18:00", end: "23:00", available: true}]
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Уникальность: один performer - одна дата
    UNIQUE(performer_id, date)
);

-- Индексы
CREATE INDEX idx_booking_calendar_performer ON public.booking_calendar(performer_id);
CREATE INDEX idx_booking_calendar_date ON public.booking_calendar(date);
CREATE INDEX idx_booking_calendar_performer_date ON public.booking_calendar(performer_id, date);
CREATE INDEX idx_booking_calendar_available ON public.booking_calendar(is_available) WHERE is_available = true;

-- Триггер
CREATE TRIGGER update_booking_calendar_updated_at 
BEFORE UPDATE ON public.booking_calendar 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.booking_calendar ENABLE ROW LEVEL SECURITY;

-- Performer управляет своим календарем
CREATE POLICY "Performers manage own calendar"
ON public.booking_calendar FOR ALL
USING (auth.uid() = performer_id);

-- Все могут видеть доступность (для поиска)
CREATE POLICY "Anyone can view calendar availability"
ON public.booking_calendar FOR SELECT
TO authenticated
USING (true);
```

---

### **3. Таблица booking_payments**

**Платежи по букингам**

```sql
CREATE TABLE public.booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Связь с букингом
    booking_id UUID NOT NULL REFERENCES public.booking_requests(id),
    
    -- Участники
    payer_id UUID NOT NULL REFERENCES public.profiles(id), -- Кто платит (venue)
    recipient_id UUID NOT NULL REFERENCES public.profiles(id), -- Кому (performer или platform)
    
    -- Сумма
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'RUB',
    
    -- Тип платежа
    payment_type TEXT NOT NULL,
    -- deposit: депозит 30%
    -- final: финальный платеж 70%
    -- full: полная оплата сразу (редко)
    -- refund: возврат
    -- payout: выплата артисту
    -- cancellation_fee: штраф за отмену
    
    -- Статус
    status TEXT DEFAULT 'pending',
    -- pending: ожидает обработки
    -- processing: в процессе
    -- completed: завершен
    -- failed: ошибка
    -- refunded: возвращен
    
    -- Gateway (платежная система)
    gateway TEXT DEFAULT 'stripe', -- stripe, paypal, yookassa, etc
    gateway_payment_id TEXT, -- ID в платежной системе
    gateway_response JSONB,
    
    -- Метаданные
    metadata JSONB DEFAULT '{}',
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    -- Связь с основной таблицей транзакций
    transaction_id UUID REFERENCES public.payment_transactions(id),
    
    CONSTRAINT valid_payment_type CHECK (payment_type IN (
        'deposit', 'final', 'full', 'refund', 'payout', 'cancellation_fee'
    )),
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded'
    ))
);

-- Индексы
CREATE INDEX idx_booking_payments_booking ON public.booking_payments(booking_id);
CREATE INDEX idx_booking_payments_payer ON public.booking_payments(payer_id);
CREATE INDEX idx_booking_payments_recipient ON public.booking_payments(recipient_id);
CREATE INDEX idx_booking_payments_status ON public.booking_payments(status);
CREATE INDEX idx_booking_payments_type ON public.booking_payments(payment_type);

-- RLS
ALTER TABLE public.booking_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payments"
ON public.booking_payments FOR SELECT
USING (
    auth.uid() = payer_id OR 
    auth.uid() = recipient_id OR
    public.is_admin(auth.uid())
);
```

---

### **4. Обновление artist_profiles**

**Добавить поля для букинга**

```sql
-- Добавить в artist_profiles
ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 10000;
ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS minimum_booking_hours NUMERIC(4,1) DEFAULT 2;
ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS booking_info JSONB DEFAULT '{}';
-- {
--   availableDays: ["friday", "saturday"],
--   technicalRider: {...},
--   specialRequirements: "...",
--   cancellationPolicy: "..."
-- }

ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS completed_bookings INTEGER DEFAULT 0;
ALTER TABLE public.artist_profiles ADD COLUMN IF NOT EXISTS booking_rating NUMERIC(3,2) DEFAULT 5.0;
```

---

### **5. Обновление dj_profiles**

**Уже есть booking_info, добавить недостающие**

```sql
-- Добавить в dj_profiles (если нет)
ALTER TABLE public.dj_profiles ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.dj_profiles ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;
ALTER TABLE public.dj_profiles ADD COLUMN IF NOT EXISTS completed_bookings INTEGER DEFAULT 0;
ALTER TABLE public.dj_profiles ADD COLUMN IF NOT EXISTS booking_rating NUMERIC(3,2) DEFAULT 5.0;
```

---

## 💰 ФИНАНСОВАЯ ЛОГИКА

### **Формула расчета:**

```typescript
// Входные данные
const hourlyRate = 15000; // ₽/час
const durationHours = 4;  // часов

// Расчет
const offeredPrice = hourlyRate * durationHours; // 60,000₽
const platformCommission = offeredPrice * 0.10;   // 6,000₽ (10%)
const performerFee = offeredPrice - platformCommission; // 54,000₽

// Депозит (30%)
const depositPercentage = 0.30;
const depositAmount = offeredPrice * depositPercentage; // 18,000₽

// Финальный платеж (70%)
const finalPercentage = 0.70;
const finalAmount = offeredPrice * finalPercentage; // 42,000₽

// Проверка
console.assert(depositAmount + finalAmount === offeredPrice);
```

### **Пример:**

| Параметр | Значение |
|----------|----------|
| Ставка | 15,000₽/час |
| Длительность | 4 часа |
| **Полная стоимость** | **60,000₽** |
| Комиссия платформы (10%) | 6,000₽ |
| **Артисту** | **54,000₽** |
| Депозит (30%) | 18,000₽ |
| Остаток (70%) | 42,000₽ |

---

### **Workflow платежей:**

```
1️⃣ СОЗДАНИЕ ЗАЯВКИ (status: pending)
   Venue: Создает заявку
   System: Расчет цен (offered_price, performer_fee, commission)
   
2️⃣ ПРИНЯТИЕ АРТИСТОМ (status: accepted)
   Artist: Нажимает "Принять"
   System: Расчет депозита (30%)
   Venue: Получает уведомление "Оплатите депозит"
   
3️⃣ ОПЛАТА ДЕПОЗИТА (status: deposit_paid)
   Venue: Платит 18,000₽
   System: 
     - Создает booking_payment (type: deposit)
     - Обновляет booking_request.deposit_paid_at
     - Блокирует дату в booking_calendar
   Artist: Получает уведомление "Депозит получен"
   
4️⃣ НАПОМИНАНИЕ ЗА 24 ЧАСА
   System: За 24ч до мероприятия
   Venue: Получает уведомление "Оплатите остаток"
   
5️⃣ ФИНАЛЬНЫЙ ПЛАТЕЖ (status: confirmed)
   Venue: Платит 42,000₽
   System:
     - Создает booking_payment (type: final)
     - Обновляет booking_request.full_payment_at
     - Статус → confirmed
   Artist: Получает уведомление "Букинг подтвержден"
   
6️⃣ МЕРОПРИЯТИЕ ПРОХОДИТ
   System: После event_date
   
7️⃣ ЗАВЕРШЕНИЕ (status: completed)
   System: Автоматически через 24ч после мероприятия
   Status → completed
   Venue & Artist: Уведомление "Оставьте отзыв"
   
8️⃣ ВЫПЛАТА АРТИСТУ
   System: После получения отзывов (или через 7 дней)
   Artist: Получает 54,000₽ на баланс
   System:
     - Создает booking_payment (type: payout, recipient: artist)
     - Обновляет booking_request.payout_at
     - Payout_status → completed
```

---

## 🚫 ПОЛИТИКА ОТМЕНЫ

### **Таблица возвратов:**

| Когда отменено | Venue возврат | Artist компенсация | Platform |
|----------------|---------------|-------------------|----------|
| **До депозита** | 100% (0₽ потеря) | 0% | Комиссия 0₽ |
| **После депозита, >14 дней** | 100% (возврат 18,000₽) | 0% | Комиссия 0₽ |
| **7-14 дней до** | 70% (возврат 12,600₽) | 30% депозита (5,400₽) | Комиссия 540₽ |
| **3-7 дней до** | 50% (возврат 9,000₽) | 50% депозита (9,000₽) | Комиссия 900₽ |
| **<3 дней до** | 0% (потеря 18,000₽) | 100% депозита (18,000₽) | Комиссия 1,800₽ |
| **После полной оплаты** | 0% (потеря 60,000₽) | 100% (получает 60,000₽) | Комиссия 6,000₽ |
| **Отменил Artist** | 100% + штраф | -штраф 10,000₽ | Штраф артисту |

### **Формула штрафа за отмену артистом:**

```typescript
const artistCancellationFee = Math.min(
  performerFee * 0.50, // 50% от гонорара
  20000 // Максимум 20,000₽
);

// Пример: 54,000₽ * 0.50 = 27,000₽ → cap at 20,000₽
```

---

## 🔔 УВЕДОМЛЕНИЯ

### **Типы уведомлений:**

| Событие | Получатель | Тип | Текст |
|---------|-----------|-----|-------|
| Новая заявка | Artist | `booking_request_new` | "🎤 Новая заявка от {venue_name}" |
| Заявка принята | Venue | `booking_accepted` | "✅ {artist_name} принял заявку" |
| Заявка отклонена | Venue | `booking_rejected` | "❌ {artist_name} отклонил заявку" |
| Депозит оплачен | Artist | `booking_deposit_paid` | "💰 Депозит {amount}₽ получен" |
| Напоминание оплатить | Venue | `booking_payment_reminder` | "⏰ Оплатите остаток за 24ч" |
| Полная оплата | Artist | `booking_confirmed` | "🎉 Букинг подтвержден!" |
| Мероприятие завтра | Both | `booking_tomorrow` | "📅 Мероприятие завтра" |
| Мероприятие завершено | Both | `booking_completed` | "⭐ Оставьте отзыв" |
| Выплата артисту | Artist | `booking_payout` | "💸 Выплата {amount}₽ на баланс" |
| Отмена букинга | Both | `booking_cancelled` | "🚫 Букинг отменен" |

---

## 📡 API ENDPOINTS

### **Для заведений (Venue):**

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/artists/search` | Поиск артистов с фильтрами |
| GET | `/api/artists/:id` | Профиль артиста |
| GET | `/api/artists/:id/availability` | Календарь доступности |
| POST | `/api/bookings/create` | Создать заявку |
| GET | `/api/bookings` | Мои букинги (как requester) |
| GET | `/api/bookings/:id` | Детали букинга |
| PUT | `/api/bookings/:id/cancel` | Отменить букинг |
| POST | `/api/bookings/:id/pay-deposit` | Оплатить депозит |
| POST | `/api/bookings/:id/pay-final` | Оплатить остаток |
| POST | `/api/bookings/:id/review` | Оставить отзыв |

### **Для артистов (Artist/DJ):**

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/bookings/incoming` | Входящие заявки |
| PUT | `/api/bookings/:id/accept` | Принять заявку |
| PUT | `/api/bookings/:id/reject` | Отклонить заявку |
| GET | `/api/bookings/my` | Мои букинги (как performer) |
| GET | `/api/bookings/:id` | Детали букинга |
| PUT | `/api/bookings/:id/cancel` | Отменить букинг |
| GET | `/api/bookings/calendar` | Мой календарь |
| PUT | `/api/bookings/calendar` | Обновить доступность |
| POST | `/api/bookings/calendar/block` | Заблокировать даты |
| GET | `/api/bookings/earnings` | Статистика заработка |
| POST | `/api/bookings/:id/review` | Оставить отзыв |

### **Админ:**

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/admin/bookings` | Все букинги |
| PUT | `/api/admin/bookings/:id/moderate` | Модерация |
| POST | `/api/admin/bookings/:id/refund` | Возврат |
| GET | `/api/admin/bookings/analytics` | Аналитика |

---

## 🗂️ EDGE FUNCTIONS

### **1. create-booking-request**

**Создание заявки от venue**

```typescript
// /supabase/functions/server/routes/bookings/create.ts

export async function createBookingRequest(c: Context) {
  const user = c.get('user');
  const body = await c.req.json();
  
  // Валидация
  const {
    performerId,
    performerType,
    eventType,
    eventTitle,
    eventDate,
    startTime,
    durationHours,
    venueAddress,
    expectedAudience,
    technicalRequirements,
  } = body;
  
  // Получить ставку performer'а
  const { data: performer } = await supabase
    .from(performerType === 'dj' ? 'dj_profiles' : 'artist_profiles')
    .select('hourly_rate, minimum_booking_hours')
    .eq('user_id', performerId)
    .single();
  
  if (!performer) {
    return c.json({ error: 'Performer not found' }, 404);
  }
  
  // Проверка минимума
  if (durationHours < performer.minimum_booking_hours) {
    return c.json({ 
      error: `Minimum booking is ${performer.minimum_booking_hours} hours` 
    }, 400);
  }
  
  // Расчет цен
  const offeredPrice = performer.hourly_rate * durationHours;
  const platformCommission = offeredPrice * 0.10;
  const performerFee = offeredPrice - platformCommission;
  const depositAmount = offeredPrice * 0.30;
  const finalAmount = offeredPrice * 0.70;
  
  // Создать заявку
  const { data: booking, error } = await supabase
    .from('booking_requests')
    .insert({
      requester_id: user.id,
      requester_type: 'venue',
      performer_id: performerId,
      performer_type: performerType,
      event_type: eventType,
      event_title: eventTitle,
      event_date: eventDate,
      start_time: startTime,
      duration_hours: durationHours,
      venue_address: venueAddress,
      expected_audience: expectedAudience,
      offered_price: offeredPrice,
      performer_fee: performerFee,
      platform_commission: platformCommission,
      deposit_amount: depositAmount,
      final_amount: finalAmount,
      technical_requirements: technicalRequirements,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  // Уведомление артисту
  await sendNotification({
    userId: performerId,
    type: 'booking_request_new',
    title: 'Новая заявка на букинг',
    message: `Заведение хочет забронировать вас на ${eventDate}`,
    data: { bookingId: booking.id },
  });
  
  return c.json({ booking });
}
```

---

### **2. respond-booking-request**

**Принять/отклонить заявку (Artist/DJ)**

```typescript
// /supabase/functions/server/routes/bookings/respond.ts

export async function respondBookingRequest(c: Context) {
  const user = c.get('user');
  const bookingId = c.req.param('id');
  const { action, rejectionReason } = await c.req.json(); // 'accept' or 'reject'
  
  // Получить букинг
  const { data: booking } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', bookingId)
    .eq('performer_id', user.id)
    .single();
  
  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }
  
  if (booking.status !== 'pending') {
    return c.json({ error: 'Booking already processed' }, 400);
  }
  
  if (action === 'accept') {
    // Принять
    const { data: updated } = await supabase
      .from('booking_requests')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    // Уведомление venue
    await sendNotification({
      userId: booking.requester_id,
      type: 'booking_accepted',
      title: 'Заявка принята!',
      message: `Артист принял вашу заявку. Оплатите депозит ${booking.deposit_amount}₽`,
      data: { bookingId: booking.id },
    });
    
    return c.json({ booking: updated });
    
  } else if (action === 'reject') {
    // Отклонить
    const { data: updated } = await supabase
      .from('booking_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        cancellation_reason: rejectionReason,
        cancelled_by: user.id,
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    // Уведомление venue
    await sendNotification({
      userId: booking.requester_id,
      type: 'booking_rejected',
      title: 'Заявка отклонена',
      message: `Артист отклонил вашу заявку`,
      data: { bookingId: booking.id },
    });
    
    return c.json({ booking: updated });
  }
  
  return c.json({ error: 'Invalid action' }, 400);
}
```

---

### **3. process-booking-deposit**

**Оплата депозита (30%)**

```typescript
// /supabase/functions/server/routes/bookings/pay-deposit.ts

export async function processBookingDeposit(c: Context) {
  const user = c.get('user');
  const bookingId = c.req.param('id');
  const { paymentMethodId } = await c.req.json(); // Stripe payment method
  
  // Получить букинг
  const { data: booking } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', bookingId)
    .eq('requester_id', user.id)
    .single();
  
  if (!booking || booking.status !== 'accepted') {
    return c.json({ error: 'Invalid booking' }, 400);
  }
  
  // Создать платеж через Stripe (mock)
  const paymentIntent = await createStripePayment({
    amount: booking.deposit_amount * 100, // в копейках
    currency: 'rub',
    customerId: user.id,
    paymentMethodId,
    metadata: {
      bookingId: booking.id,
      type: 'deposit',
    },
  });
  
  if (paymentIntent.status !== 'succeeded') {
    return c.json({ error: 'Payment failed' }, 400);
  }
  
  // Обновить букинг
  const { data: updated } = await supabase
    .from('booking_requests')
    .update({
      status: 'deposit_paid',
      deposit_paid_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();
  
  // Создать payment record
  await supabase.from('booking_payments').insert({
    booking_id: bookingId,
    payer_id: user.id,
    recipient_id: 'platform', // сначала платформе
    amount: booking.deposit_amount,
    payment_type: 'deposit',
    status: 'completed',
    gateway: 'stripe',
    gateway_payment_id: paymentIntent.id,
    processed_at: new Date().toISOString(),
  });
  
  // Заблокировать дату в календаре
  await supabase.from('booking_calendar').upsert({
    performer_id: booking.performer_id,
    date: booking.event_date,
    is_available: false,
    booking_id: bookingId,
  });
  
  // Уведомление артисту
  await sendNotification({
    userId: booking.performer_id,
    type: 'booking_deposit_paid',
    title: 'Депозит получен!',
    message: `Депозит ${booking.deposit_amount}₽ оплачен. Дата забронирована.`,
    data: { bookingId: booking.id },
  });
  
  return c.json({ booking: updated, payment: paymentIntent });
}
```

---

### **4. complete-booking-and-payout**

**Завершение и выплата артисту**

```typescript
// /supabase/functions/server/routes/bookings/complete.ts

export async function completeBookingAndPayout(c: Context) {
  const bookingId = c.req.param('id');
  
  // Получить букинг
  const { data: booking } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', bookingId)
    .eq('status', 'confirmed')
    .single();
  
  if (!booking) {
    return c.json({ error: 'Booking not found or not confirmed' }, 404);
  }
  
  // Проверка: мероприятие прошло?
  const eventDate = new Date(booking.event_date);
  const now = new Date();
  if (eventDate > now) {
    return c.json({ error: 'Event has not occurred yet' }, 400);
  }
  
  // Обновить статус
  await supabase
    .from('booking_requests')
    .update({
      status: 'completed',
    })
    .eq('id', bookingId);
  
  // Выплата артисту (performer_fee)
  const { data: payout } = await supabase
    .from('booking_payments')
    .insert({
      booking_id: bookingId,
      payer_id: 'platform',
      recipient_id: booking.performer_id,
      amount: booking.performer_fee,
      payment_type: 'payout',
      status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  // Обновить букинг с payout info
  await supabase
    .from('booking_requests')
    .update({
      payout_amount: booking.performer_fee,
      payout_at: new Date().toISOString(),
      payout_transaction_id: payout.id,
      payout_status: 'completed',
    })
    .eq('id', bookingId);
  
  // Начислить баланс артисту
  await supabase.rpc('add_balance', {
    user_id: booking.performer_id,
    amount: booking.performer_fee,
  });
  
  // Обновить статистику
  await supabase
    .from(booking.performer_type === 'dj' ? 'dj_profiles' : 'artist_profiles')
    .update({
      completed_bookings: supabase.raw('completed_bookings + 1'),
    })
    .eq('user_id', booking.performer_id);
  
  // Уведомления
  await sendNotification({
    userId: booking.performer_id,
    type: 'booking_payout',
    title: 'Выплата получена!',
    message: `${booking.performer_fee}₽ зачислено на баланс`,
    data: { bookingId: booking.id },
  });
  
  await sendNotification({
    userId: booking.requester_id,
    type: 'booking_completed',
    title: 'Мероприятие завершено',
    message: 'Оставьте отзыв о работе артиста',
    data: { bookingId: booking.id },
  });
  
  await sendNotification({
    userId: booking.performer_id,
    type: 'booking_completed',
    title: 'Мероприятие завершено',
    message: 'Оставьте отзыв о заведении',
    data: { bookingId: booking.id },
  });
  
  return c.json({ success: true, payout });
}
```

---

## 🎨 UI КОМПОНЕНТЫ ДЛЯ АРТИСТА

### **Структура:**

```
/src/artist/
  components/
    artist-bookings-section.tsx    - Главная секция букингов
    booking-request-card.tsx       - Карточка входящей заявки
    booking-calendar-view.tsx      - Календарь доступности
    booking-earnings-stats.tsx     - Статистика заработка
    booking-action-modal.tsx       - Модалка принять/отклонить
```

### **Вкладки в кабинете артиста:**

```
┌────────────────────────────────────────────────┐
│  [Входящие 3]  [Активные]  [История]  [₽ Заработок]  │
└────────────────────────────────────────────────┘
```

---

## 📈 СТАТИСТИКА И АНАЛИТИКА

### **Для артиста:**

- Входящие заявки (pending)
- Активные букинги (accepted, deposit_paid, confirmed)
- Завершенные (completed)
- Заработок за период
- Средний чек
- Рейтинг букингов
- Топ заведений

### **Для venue:**

- Активные букинги
- История букингов
- Потраченная сумма
- Любимые артисты
- Предстоящие мероприятия

---

## ✅ ЧЕКЛИСТ РЕАЛИЗАЦИИ

**SQL:**
- [ ] Создать booking_requests
- [ ] Создать booking_calendar
- [ ] Создать booking_payments
- [ ] Обновить artist_profiles
- [ ] Обновить dj_profiles
- [ ] RLS политики

**Backend:**
- [ ] create-booking-request
- [ ] respond-booking-request
- [ ] process-booking-deposit
- [ ] process-booking-final
- [ ] complete-booking-and-payout
- [ ] cancel-booking-with-refund

**Frontend - Venue:**
- [x] Поиск артистов
- [x] Карточки артистов
- [x] Профиль артиста (modal)
- [x] Форма создания заявки
- [x] Список моих букингов
- [ ] Оплата депозита/остатка
- [ ] Отзывы после мероприятия

**Frontend - Artist:**
- [ ] Входящие заявки
- [ ] Карточка заявки с деталями
- [ ] Принять/отклонить (modal)
- [ ] Календарь доступности
- [ ] Блокировка дат
- [ ] История букингов
- [ ] Статистика заработка
- [ ] Отзывы после мероприятия

**Уведомления:**
- [ ] Новая заявка → Artist
- [ ] Заявка принята/отклонена → Venue
- [ ] Депозит оплачен → Artist
- [ ] Напоминание оплатить → Venue
- [ ] Букинг подтвержден → Artist
- [ ] Мероприятие завтра → Both
- [ ] Мероприятие завершено → Both
- [ ] Выплата → Artist

---

## 🎉 ИТОГ

**Создана полная архитектура букинг-системы:**

✅ SQL структура (3 таблицы)  
✅ Финансовая логика (депозит/остаток/выплата)  
✅ Workflow (8 статусов)  
✅ Политика отмены  
✅ API endpoints (20+)  
✅ Edge functions (6)  
✅ Уведомления (10 типов)  
✅ Документация  

**Готово к имплементации!** 🚀
