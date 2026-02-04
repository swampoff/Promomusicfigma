# 🧪 API TESTING GUIDE
## Руководство по тестированию новых API endpoints

Дата: 4 февраля 2026

---

## 📋 СОДЕРЖАНИЕ

1. [Подготовка к тестированию](#подготовка)
2. [Radio API Endpoints](#radio-api)
3. [Venue API Endpoints](#venue-api)
4. [ElevenLabs API Endpoints](#elevenlabs-api)
5. [Тестовые данные](#тестовые-данные)
6. [Проверка валидации Zod](#валидация)

---

## 🔧 ПОДГОТОВКА К ТЕСТИРОВАНИЮ {#подготовка}

### 1. Получить токен авторизации

Войдите в систему и получите JWT токен из localStorage:

```javascript
// В браузерной консоли
const token = localStorage.getItem('supabaseToken');
console.log('Authorization: Bearer', token);
```

### 2. Настроить переменные

```bash
# Замените на ваши значения
PROJECT_ID="your-project-id"
API_BASE="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84730125"
TOKEN="your-jwt-token"
```

---

## 📻 RADIO API ENDPOINTS {#radio-api}

### 1. Analytics Overview

**Endpoint:** `GET /api/radio/analytics/overview`

```bash
curl -X GET \
  "${API_BASE}/api/radio/analytics/overview?period=month" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "period": "month",
  "data": {
    "revenue": {
      "total": 125000,
      "station": 106250,
      "platform": 18750,
      "growth": 24.5
    },
    "requests": {
      "total": 48,
      "pending": 12,
      "approved": 32,
      "rejected": 4,
      "approvalRate": 88.9,
      "avgModerationTime": 45
    },
    "listeners": {
      "total": 145000,
      "unique": 42000,
      "peak": 3200,
      "growth": 18.2
    },
    "content": {
      "totalPlays": 1250,
      "impressions": 312500,
      "engagementRate": 76.5
    }
  }
}
```

**Тестовые случаи:**
- ✅ period=today
- ✅ period=week
- ✅ period=month
- ✅ period=year
- ❌ period=invalid (должна вернуть ошибку)
- ❌ Без токена (401)

---

### 2. Revenue Chart

**Endpoint:** `GET /api/radio/analytics/revenue`

```bash
curl -X GET \
  "${API_BASE}/api/radio/analytics/revenue?period=week" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "period": "week",
  "data": [
    {
      "date": "01.02.2026",
      "revenue": 15000,
      "station": 12750,
      "platform": 2250
    },
    {
      "date": "02.02.2026",
      "revenue": 18000,
      "station": 15300,
      "platform": 2700
    }
  ]
}
```

---

### 3. Balance

**Endpoint:** `GET /api/radio/finance/balance`

```bash
curl -X GET \
  "${API_BASE}/api/radio/finance/balance" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "balance": 85000,
  "stats": {
    "totalEarned": 200000,
    "totalWithdrawn": 115000,
    "available": 85000
  }
}
```

---

### 4. Transactions

**Endpoint:** `GET /api/radio/finance/transactions`

```bash
curl -X GET \
  "${API_BASE}/api/radio/finance/transactions?limit=10&offset=0" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "total": 150,
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "transaction_type": "royalty",
      "amount": "15000.00",
      "description": "Royalty from advertisement order",
      "status": "completed",
      "balance_before": "70000.00",
      "balance_after": "85000.00",
      "created_at": "2026-02-04T10:00:00Z"
    }
  ]
}
```

**Тестовые случаи:**
- ✅ limit=50, offset=0
- ✅ limit=10, offset=10
- ❌ limit=200 (превышает максимум 100)
- ❌ limit=-5 (отрицательное значение)

---

### 5. Withdrawal Request

**Endpoint:** `POST /api/radio/finance/withdrawal`

```bash
curl -X POST \
  "${API_BASE}/api/radio/finance/withdrawal" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "paymentMethod": "bank_transfer",
    "paymentDetails": {
      "accountNumber": "12345678901234567890",
      "bankName": "Сбербанк"
    }
  }'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "withdrawal": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 50000,
    "payment_method": "bank_transfer",
    "payment_details": {
      "accountNumber": "12345678901234567890",
      "bankName": "Сбербанк"
    },
    "status": "pending",
    "created_at": "2026-02-04T12:00:00Z"
  },
  "message": "Withdrawal request created successfully"
}
```

**Тестовые случаи (Zod валидация):**
- ✅ Корректные данные
- ❌ amount < 1000 (ошибка: "Minimum withdrawal amount is 1000 RUB")
- ❌ amount > balance (ошибка: "Insufficient balance")
- ❌ paymentMethod = "invalid" (ошибка валидации enum)
- ❌ Без amount (ошибка: "amount is required")

---

### 6. Ad Slots List

**Endpoint:** `GET /api/radio/ad-slots/list`

```bash
curl -X GET \
  "${API_BASE}/api/radio/ad-slots/list" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 7. Create Ad Slot

**Endpoint:** `POST /api/radio/ad-slots/create`

```bash
curl -X POST \
  "${API_BASE}/api/radio/ad-slots/create" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slotType": "slot_15sec",
    "timeSlot": "prime_time",
    "price": 5000,
    "duration": 15,
    "maxPerHour": 4
  }'
```

**Тестовые случаи (Zod валидация):**
- ✅ Корректные данные
- ❌ slotType = "slot_90sec" (недопустимое значение)
- ❌ price = -100 (отрицательная цена)
- ❌ duration < 5 (слишком короткий)
- ❌ maxPerHour > 12 (превышение лимита)

---

### 8. Rotation Packages

**Endpoint:** `GET /api/radio/rotation-packages/list`

```bash
curl -X GET \
  "${API_BASE}/api/radio/rotation-packages/list" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 9. Orders List

**Endpoint:** `GET /api/radio/orders/list`

```bash
curl -X GET \
  "${API_BASE}/api/radio/orders/list" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "advertisementOrders": [ /* массив заказов рекламы */ ],
  "rotationOrders": [ /* массив заказов ротации */ ]
}
```

---

## 🏢 VENUE API ENDPOINTS {#venue-api}

### 1. Analytics Overview

**Endpoint:** `GET /api/venue/analytics/overview`

```bash
curl -X GET \
  "${API_BASE}/api/venue/analytics/overview?period=month" \
  -H "Authorization: Bearer ${TOKEN}"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "period": "month",
  "data": {
    "spending": {
      "total": 85000,
      "growth": -5.2,
      "thisMonth": 85000
    },
    "campaigns": {
      "active": 3,
      "total": 8,
      "completed": 5,
      "successRate": 87.5
    },
    "reach": {
      "totalImpressions": 425000,
      "uniqueListeners": 58000,
      "growth": 32.5,
      "avgPerCampaign": 53125
    },
    "performance": {
      "avgROI": 245,
      "conversionRate": 4.2,
      "engagementRate": 82.3
    }
  }
}
```

---

### 2. Campaigns List

**Endpoint:** `GET /api/venue/analytics/campaigns`

```bash
curl -X GET \
  "${API_BASE}/api/venue/analytics/campaigns" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 3. Spending Chart

**Endpoint:** `GET /api/venue/analytics/spending`

```bash
curl -X GET \
  "${API_BASE}/api/venue/analytics/spending?period=month" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 4. ROI Analytics

**Endpoint:** `GET /api/venue/analytics/roi`

```bash
curl -X GET \
  "${API_BASE}/api/venue/analytics/roi" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 5. Radio Comparison

**Endpoint:** `GET /api/venue/analytics/radio-compare`

```bash
curl -X GET \
  "${API_BASE}/api/venue/analytics/radio-compare" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 6. Export Analytics

**Endpoint:** `POST /api/venue/analytics/export`

```bash
curl -X POST \
  "${API_BASE}/api/venue/analytics/export" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "period": "month",
    "includeGraphs": true
  }'
```

**Тестовые случаи (Zod валидация):**
- ✅ format="pdf"
- ✅ format="excel"
- ✅ format="csv"
- ✅ format="json"
- ❌ format="xml" (недопустимый формат)
- ❌ period="invalid" (недопустимый период)

---

### 7. Get Profile

**Endpoint:** `GET /api/venue/profile`

```bash
curl -X GET \
  "${API_BASE}/api/venue/profile" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

### 8. Update Profile

**Endpoint:** `PUT /api/venue/profile`

```bash
curl -X PUT \
  "${API_BASE}/api/venue/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "venueName": "Новое название",
    "description": "Обновленное описание заведения",
    "phone": "+7 (999) 123-45-67"
  }'
```

**Тестовые случаи (Zod валидация):**
- ✅ Корректные данные
- ❌ venueName длиной 1 символ (минимум 2)
- ❌ website без протокола (не URL)
- ❌ capacity = -10 (отрицательное значение)

---

## 🎙️ ELEVENLABS API ENDPOINTS {#elevenlabs-api}

### 1. Generate Audio

**Endpoint:** `POST /api/elevenlabs/generate`

```bash
curl -X POST \
  "${API_BASE}/api/elevenlabs/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid-заказа",
    "customText": "Добро пожаловать на радио Promo FM!"
  }'
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "contentType": "jingle",
    "text": "Добро пожаловать на радио Promo FM!",
    "status": "processing",
    "audioUrl": "https://...signed-url...",
    "generatedAt": "2026-02-04T14:30:00Z"
  },
  "audioUrl": "https://...signed-url...",
  "message": "Audio generated successfully"
}
```

**Тестовые случаи:**
- ✅ С customText
- ✅ Без customText (использует текст из заказа)
- ❌ Без orderId (ошибка)
- ❌ Несуществующий orderId (404)

---

### 2. Get Voices

**Endpoint:** `GET /api/elevenlabs/voices`

```bash
curl -X GET \
  "${API_BASE}/api/elevenlabs/voices"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "category": "neutral"
    },
    // ...
  ]
}
```

---

## 📊 ТЕСТОВЫЕ ДАННЫЕ {#тестовые-данные}

### Создание тестового пользователя (Radio)

```sql
-- В Supabase SQL Editor
INSERT INTO users (id, email, role, balance)
VALUES 
  ('test-radio-user-id', 'test-radio@example.com', 'radio_station', 100000);

INSERT INTO radio_stations (id, user_id, station_name, slug)
VALUES
  ('test-station-id', 'test-radio-user-id', 'Test Radio Station', 'test-radio');
```

### Создание тестового пользователя (Venue)

```sql
INSERT INTO users (id, email, role)
VALUES 
  ('test-venue-user-id', 'test-venue@example.com', 'venue');

INSERT INTO venue_profiles (id, user_id, venue_name, venue_type)
VALUES
  ('test-venue-id', 'test-venue-user-id', 'Test Venue', 'club');
```

### Создание тестовых транзакций

```sql
INSERT INTO balance_transactions (user_id, user_email, transaction_type, amount, balance_before, balance_after, status)
VALUES 
  ('test-radio-user-id', 'test-radio@example.com', 'royalty', 15000, 85000, 100000, 'completed'),
  ('test-radio-user-id', 'test-radio@example.com', 'royalty', 12000, 73000, 85000, 'completed');
```

---

## ✅ ПРОВЕРКА ВАЛИДАЦИИ ZOD {#валидация}

### Тестирование валидации withdrawal

```bash
# ❌ Сумма меньше минимума
curl -X POST \
  "${API_BASE}/api/radio/finance/withdrawal" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "paymentMethod": "bank_transfer"
  }'

# Ожидаемая ошибка:
# {"error": "Validation error: amount: Minimum withdrawal amount is 1000 RUB"}
```

```bash
# ❌ Недопустимый метод оплаты
curl -X POST \
  "${API_BASE}/api/radio/finance/withdrawal" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMethod": "crypto"
  }'

# Ожидаемая ошибка:
# {"error": "Validation error: paymentMethod: Invalid enum value..."}
```

### Тестирование валидации ad slot

```bash
# ❌ Недопустимый тип слота
curl -X POST \
  "${API_BASE}/api/radio/ad-slots/create" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slotType": "slot_90sec",
    "timeSlot": "morning",
    "price": 3000,
    "duration": 15
  }'

# Ожидаемая ошибка:
# {"error": "Validation error: slotType: Invalid enum value..."}
```

```bash
# ❌ Отрицательная цена
curl -X POST \
  "${API_BASE}/api/radio/ad-slots/create" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slotType": "slot_15sec",
    "timeSlot": "morning",
    "price": -100,
    "duration": 15
  }'

# Ожидаемая ошибка:
# {"error": "Validation error: price: Number must be positive"}
```

---

## 📝 ЧЕКЛИСТ ТЕСТИРОВАНИЯ

### Radio API
- [ ] Analytics overview (все периоды)
- [ ] Revenue chart
- [ ] Balance
- [ ] Transactions (с pagination)
- [ ] Withdrawal request (валидация)
- [ ] Ad slots list
- [ ] Create ad slot (валидация)
- [ ] Rotation packages list
- [ ] Orders list

### Venue API
- [ ] Analytics overview (все периоды)
- [ ] Campaigns list
- [ ] Spending chart
- [ ] ROI analytics
- [ ] Radio comparison
- [ ] Export analytics (все форматы)
- [ ] Get profile
- [ ] Update profile (валидация)

### ElevenLabs API
- [ ] Generate audio (с/без customText)
- [ ] Get voices

### Общие проверки
- [ ] 401 для запросов без токена
- [ ] 404 для несуществующих ресурсов
- [ ] Валидация Zod для всех POST/PUT запросов
- [ ] Корректные error messages
- [ ] CORS headers
- [ ] Response format (JSON)

---

## 🐛 ОТЛАДКА

### Проверка логов сервера

```bash
# В Supabase Dashboard -> Edge Functions -> Logs
# Или через CLI:
supabase functions logs make-server-84730125
```

### Типичные ошибки

**401 Unauthorized:**
- Проверьте токен авторизации
- Токен может истечь - войдите заново

**404 Not Found:**
- Проверьте правильность URL
- Убедитесь, что ресурс существует в БД

**400 Validation Error:**
- Проверьте формат данных
- Читайте сообщение ошибки Zod

**500 Internal Server Error:**
- Смотрите логи сервера
- Проверьте SQL запросы
- Проверьте существование таблиц

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

После успешного тестирования:

1. ✅ Обновить frontend - заменить mock данные на реальные API
2. ✅ Добавить error handling в компонентах
3. ✅ Настроить загрузочные состояния (loading states)
4. ✅ Добавить уведомления об ошибках (toast)
5. ✅ Оптимизировать запросы (кеширование)

---

**Создано:** 4 февраля 2026  
**Версия:** 1.0  
**Статус:** ✅ Готово к тестированию

---
