# ⚡ БЫСТРЫЕ КОМАНДЫ ДЛЯ ТЕСТИРОВАНИЯ API
## Копируй и вставляй в терминал

---

## 🔧 НАСТРОЙКА (сделайте 1 раз)

```bash
# Замените на свои значения:
export PROJECT_ID="your-project-id-here"
export AUTH_TOKEN="your-token-here"
export API_BASE="https://${PROJECT_ID}.supabase.co/functions/v1/make-server-84730125"
```

**Как получить токен:**
```javascript
// В браузерной консоли (после логина)
const token = localStorage.getItem('supabase.auth.token');
console.log(token);
```

---

## 🏥 HEALTH CHECK

```bash
curl -X GET "${API_BASE}/health"
```

**Ожидаемый ответ:**
```json
{"status":"ok","timestamp":"2026-02-04T..."}
```

---

## 📻 RADIO API - БЫСТРЫЕ ТЕСТЫ

### Analytics Overview
```bash
curl -X GET "${API_BASE}/api/radio/analytics/overview?period=month" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Balance
```bash
curl -X GET "${API_BASE}/api/radio/finance/balance" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Transactions
```bash
curl -X GET "${API_BASE}/api/radio/finance/transactions?limit=10" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Ad Slots List
```bash
curl -X GET "${API_BASE}/api/radio/ad-slots/list" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## 🏢 VENUE API - БЫСТРЫЕ ТЕСТЫ

### Analytics Overview
```bash
curl -X GET "${API_BASE}/api/venue/analytics/overview?period=month" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Campaigns
```bash
curl -X GET "${API_BASE}/api/venue/analytics/campaigns" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Profile
```bash
curl -X GET "${API_BASE}/api/venue/profile" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

---

## ✅ ZOD ВАЛИДАЦИЯ - ТЕСТЫ

### ❌ Withdrawal: Amount below minimum (должна быть ошибка 400)
```bash
curl -X POST "${API_BASE}/api/radio/finance/withdrawal" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "paymentMethod": "bank_transfer"
  }'
```

**Ожидаемый ответ:**
```json
{"error":"Validation error: amount: Minimum withdrawal amount is 1000 RUB"}
```

---

### ❌ Ad Slot: Invalid type (должна быть ошибка 400)
```bash
curl -X POST "${API_BASE}/api/radio/ad-slots/create" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slotType": "slot_90sec",
    "timeSlot": "morning",
    "price": 3000,
    "duration": 15
  }'
```

**Ожидаемый ответ:**
```json
{"error":"Validation error: slotType: Invalid enum value..."}
```

---

### ❌ Export: Invalid format (должна быть ошибка 400)
```bash
curl -X POST "${API_BASE}/api/venue/analytics/export" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "xml",
    "period": "month"
  }'
```

**Ожидаемый ответ:**
```json
{"error":"Validation error: format: Invalid enum value..."}
```

---

## 🎯 ВСЕ ТЕСТЫ ОДНОЙ КОМАНДОЙ

### Запустить Node.js скрипт:
```bash
node test-api.mjs
```

### Или открыть Browser Tester:
```bash
open test-api.html
```

---

## 🔍 ПРОВЕРКА ЛОГОВ

```bash
# Если используете Supabase CLI
supabase functions logs make-server-84730125 --tail

# Или в Supabase Dashboard:
# Project -> Edge Functions -> make-server-84730125 -> Logs
```

---

## 🐛 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### 1. Проверьте что Edge Function развернута
```bash
supabase functions deploy make-server-84730125
```

### 2. Проверьте переменные
```bash
echo "Project ID: ${PROJECT_ID}"
echo "API Base: ${API_BASE}"
echo "Token: ${AUTH_TOKEN:0:20}..."
```

### 3. Проверьте health check
```bash
curl -v "${API_BASE}/health"
```

---

## 📊 EXPECTED RESULTS CHEAT SHEET

| Endpoint | Method | Expected Status | Auth Required |
|----------|--------|----------------|---------------|
| `/health` | GET | 200 | ❌ |
| `/api/radio/analytics/overview` | GET | 200 | ✅ |
| `/api/radio/finance/balance` | GET | 200 | ✅ |
| `/api/radio/finance/withdrawal` | POST | 200 (valid) / 400 (invalid) | ✅ |
| `/api/venue/analytics/overview` | GET | 200 | ✅ |
| `/api/venue/profile` | GET | 200 | ✅ |
| `/api/elevenlabs/voices` | GET | 200 | ❌ |

---

## 💡 PRO TIPS

### Красивый вывод JSON
```bash
curl ... | jq '.'
```

### Сохранить ответ в файл
```bash
curl ... > response.json
```

### Показать headers
```bash
curl -v ...
```

### Измерить время ответа
```bash
curl -w "\nTime: %{time_total}s\n" ...
```

---

## 🚀 ГОТОВЫЕ КОМБО-КОМАНДЫ

### Полная проверка Radio API
```bash
echo "🏥 Health Check..." && \
curl -s "${API_BASE}/health" && \
echo -e "\n\n📊 Analytics..." && \
curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE}/api/radio/analytics/overview?period=month" && \
echo -e "\n\n💰 Balance..." && \
curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE}/api/radio/finance/balance" && \
echo -e "\n\n✅ Done!"
```

### Полная проверка Venue API
```bash
echo "📊 Analytics..." && \
curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE}/api/venue/analytics/overview?period=month" && \
echo -e "\n\n📈 Campaigns..." && \
curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE}/api/venue/analytics/campaigns" && \
echo -e "\n\n👤 Profile..." && \
curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE}/api/venue/profile" && \
echo -e "\n\n✅ Done!"
```

---

**Создано:** 4 февраля 2026  
**Последнее обновление:** 4 февраля 2026

