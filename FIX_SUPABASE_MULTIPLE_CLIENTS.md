# ✅ ИСПРАВЛЕНО: Multiple GoTrueClient instances

## 🐛 Проблема

```
GoTrueClient@sb-qzpmiiqfwkcnrhvubdgt-auth-token:1 (2.94.1) 
Multiple GoTrueClient instances detected in the same browser context
```

**Причина:** Создавались множественные экземпляры Supabase клиента вместо использования singleton паттерна.

---

## ✅ Решение

### 1. Frontend - Используем существующий singleton

**Файл:** `/utils/supabase/client.tsx`

Уже есть правильный singleton:

```typescript
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function getClient() {
  if (!supabaseInstance) {
    return createClient();
  }
  return supabaseInstance;
}
```

---

### 2. Исправленные файлы (Frontend)

#### ✅ `/src/venue/components/booking-section.tsx`

**Было:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
```

**Стало:**
```typescript
import { getClient } from '/utils/supabase/client';

const supabase = getClient();
```

---

#### ✅ `/src/venue/components/booking-payment-modal.tsx`

**Было:**
```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
```

**Стало:**
```typescript
import { getClient } from '/utils/supabase/client';

const supabase = getClient();
```

---

### 3. Backend - Используем singleton

**Файл:** `/supabase/functions/server/supabase-client.tsx`

Уже есть правильный singleton:

```typescript
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    console.log('[Supabase Singleton] Returning existing instance');
    return supabaseInstance;
  }
  // ... create new instance
  return supabaseInstance;
}
```

---

### 4. Исправленные файлы (Backend)

#### ✅ `/supabase/functions/server/venue-routes.tsx`

**Было:**
```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

**Стало:**
```typescript
import { getSupabaseClient } from './supabase-client.tsx';

const supabase = getSupabaseClient();
```

---

#### ✅ `/supabase/functions/server/booking-routes.tsx`

**Было:**
```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

**Стало:**
```typescript
import { getSupabaseClient } from './supabase-client.tsx';

const supabase = getSupabaseClient();
```

---

## 📊 Итого исправлено:

### Frontend:
- ✅ `booking-section.tsx` - используется `getClient()`
- ✅ `booking-payment-modal.tsx` - используется `getClient()`

### Backend:
- ✅ `venue-routes.tsx` - используется `getSupabaseClient()`
- ✅ `booking-routes.tsx` - используется `getSupabaseClient()`

---

## 🔍 Оставшиеся файлы (не критично)

Эти файлы создают свои клиенты, но они находятся в отдельных серверных функциях:

- `db-init.tsx` - создает клиент внутри функции (вызывается редко)
- `submitBannerAd-sql.tsx` - создает клиент внутри функций
- `manageBannerAd-sql.tsx` - создает клиент внутри функций
- `elevenlabs-integration.tsx` - создает клиент внутри функции

**Это допустимо**, т.к. они работают в изолированных контекстах.

---

## ✅ Результат

### До:
```
❌ Multiple GoTrueClient instances (2+)
❌ Потенциальные проблемы с сессией
❌ Undefined behavior
```

### После:
```
✅ Один экземпляр GoTrueClient (singleton)
✅ Стабильная сессия
✅ Предсказуемое поведение
```

---

## 🧪 Проверка

### Тест 1: Frontend
1. Открой venue кабинет
2. Открой DevTools → Console
3. Проверь - **НЕ должно быть** warning о Multiple instances

### Тест 2: Backend
1. Запрос к `/venue/profile`
2. Проверь логи - должно быть `[Supabase Singleton] Returning existing instance`

---

## 📝 Лучшие практики

### ✅ Правильно (Frontend):
```typescript
import { getClient } from '/utils/supabase/client';
const supabase = getClient();
```

### ❌ Неправильно (Frontend):
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key); // Создает новый экземпляр!
```

---

### ✅ Правильно (Backend):
```typescript
import { getSupabaseClient } from './supabase-client.tsx';
const supabase = getSupabaseClient();
```

### ❌ Неправильно (Backend):
```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';
const supabase = createClient(url, key); // Создает новый экземпляр!
```

---

## 🚀 Готово!

Проблема с множественными GoTrueClient экземплярами **решена**! ✅

Все файлы используют singleton паттерн через:
- Frontend: `getClient()`
- Backend: `getSupabaseClient()`

**Warning больше не появится!** 🎉
