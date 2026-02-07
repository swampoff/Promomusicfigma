# 🚀 QUICK START: Как работать с концертами

## 📋 БЫСТРАЯ ИНСТРУКЦИЯ

---

## 1️⃣ КАК КОНЦЕРТ ПОПАДАЕТ НА ГЛАВНУЮ?

```
Создать → Одобрить → Оплатить промо → Показать на главной
  ↓           ↓            ↓                ↓
POST      Moderator    POST /promote    Автоматически
          panel                         на главной!
```

### **Пошагово:**

#### **Шаг 1: Создать концерт**
```typescript
// В кабинете артиста: "Мои концерты" → "Добавить концерт"
// Или через API:

import { createConcert } from '@/utils/api/concerts';

const newConcert = await createConcert(accessToken, {
  title: 'Summer Music Fest 2026',
  date: '2026-07-15',
  show_start: '18:00',
  city: 'Москва',
  venue_name: 'Olympic Stadium',
  ticket_price_min: 2000,
  ticket_price_max: 8000,
  ticket_url: 'https://...',
  banner_url: 'https://...',
  event_type: 'Фестиваль',
  description: 'Описание...',
});
```

**Результат:** 
```
status: 'draft'
moderation_status: 'draft'
is_promoted: false
```

#### **Шаг 2: Отправить на модерацию**
```typescript
// POST /tour-dates/:id/submit
// Меняет moderation_status: 'draft' → 'pending'
```

#### **Шаг 3: Модератор одобряет**
```typescript
// Через admin panel
// Меняет moderation_status: 'pending' → 'approved'
// Меняет status: 'draft' → 'published'
```

#### **Шаг 4: Оплатить промо**
```typescript
import { promoteConcert } from '@/utils/api/concerts';

// Артист оплачивает промо (списываются коины)
await promoteConcert(accessToken, concertId, 7); // 7 дней промо

// Результат:
// is_promoted: true
// promotion_expires_at: NOW() + 7 days
```

#### **Шаг 5: Концерт на главной! ✅**
```typescript
// Автоматически появляется в:
// 1. Кабинет артиста → Главная → Grid секция (3 карточки)
// 2. Кабинет артиста → Главная → Sidebar карусель
// 3. Публичный лендинг → Карусель концертов

// Через 7 дней:
// promotion_expires_at < NOW() → концерт исчезает с главной
```

---

## 2️⃣ КАК ПОЛУЧИТЬ КОНЦЕРТЫ ДЛЯ ОТОБРАЖЕНИЯ?

### **Вариант A: В компоненте (React)**
```typescript
import { useEffect, useState } from 'react';
import { getPromotedConcerts } from '@/utils/api/concerts';

export function MyComponent() {
  const [concerts, setConcerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getPromotedConcerts();
        setConcerts(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {concerts.map(concert => (
        <ConcertCard key={concert.id} concert={concert} />
      ))}
    </div>
  );
}
```

### **Вариант B: Прямой API вызов**
```typescript
import { getPromotedConcerts } from '@/utils/api/concerts';

const concerts = await getPromotedConcerts();
console.log(concerts);
// [
//   { id: 1, title: 'Summer Fest', date: '2026-07-15', ... },
//   { id: 2, title: 'Acoustic Night', date: '2026-07-22', ... },
// ]
```

---

## 3️⃣ ГДЕ СЕЙЧАС ОТОБРАЖАЮТСЯ КОНЦЕРТЫ?

### **✅ Кабинет артиста (`/artist`)**
- **HomePage Grid** - 3 карточки в центре
- **HomePage Sidebar** - карусель справа (auto-rotation 5 сек)

### **✅ Публичный лендинг (`/`)**
- **SunoLayoutLanding Carousel** - горизонтальная карусель после "Новых клипов"

### **❌ Пока НЕТ (можно добавить)**
- Радиостанция (`/radio`)
- Отдельная страница "Все концерты"
- Поиск/фильтры концертов

---

## 4️⃣ API ENDPOINTS

### **Публичные (без auth):**
```
GET /make-server-84730125/api/concerts/promoted
→ Все promoted концерты (для главной страницы)
```

### **Приватные (требуют auth token):**
```
GET    /make-server-84730125/api/concerts/tour-dates
→ Мои концерты

POST   /make-server-84730125/api/concerts/tour-dates
→ Создать концерт

PUT    /make-server-84730125/api/concerts/tour-dates/:id
→ Обновить концерт

DELETE /make-server-84730125/api/concerts/tour-dates/:id
→ Удалить концерт

POST   /make-server-84730125/api/concerts/tour-dates/:id/submit
→ Отправить на модерацию

POST   /make-server-84730125/api/concerts/tour-dates/:id/promote
→ Оплатить промо (коины)
```

---

## 5️⃣ СТРУКТУРА ДАННЫХ

### **Interface: PromotedConcert**
```typescript
interface PromotedConcert {
  id: number;                // Уникальный ID
  title: string;             // "Summer Music Fest 2026"
  date: string;              // "2026-07-15" (ISO format)
  time: string;              // "18:00"
  city: string;              // "Москва"
  venue: string;             // "Olympic Stadium"
  type: string;              // "Фестиваль", "Акустический сет", "DJ сет"
  description: string;       // Полное описание
  banner: string;            // URL картинки
  ticketPriceFrom: string;   // "2000"
  ticketPriceTo: string;     // "8000"
  ticketLink: string;        // URL для покупки билетов
  views: number;             // Количество просмотров
  clicks: number;            // Количество кликов
}
```

---

## 6️⃣ FALLBACK МЕХАНИЗМ

```typescript
try {
  // Пытаемся загрузить с API
  const response = await fetch('/api/concerts/promoted');
  if (!response.ok) {
    throw new Error('API error');
  }
  return response.json();
} catch (error) {
  // Если ошибка - показываем demo данные
  console.warn('Using demo data');
  return DEMO_CONCERTS; // 3 демо-концерта
}
```

**Что это значит:**
- ✅ Если backend недоступен → пользователь всё равно видит концерты (demo)
- ✅ Если база пустая → пользователь видит demo концерты
- ✅ Приложение **никогда** не ломается из-за отсутствия данных

---

## 7️⃣ DEBUGGING

### **Консольные логи:**

**При успешной загрузке:**
```
🎸 Fetching promoted concerts from API...
✅ Loaded 3 promoted concerts from API
🎸 Loaded promoted concerts: 3
🎪 Loaded concerts for landing: 3
```

**При fallback на demo:**
```
⚠️ API returned status 500, using demo data
📭 No promoted concerts found, using demo data
🔄 Falling back to demo data
```

### **Как проверить что данные приходят с API:**

1. Откройте DevTools → Console
2. Найдите лог `✅ Loaded N promoted concerts from API`
3. Если видите `📭 No promoted concerts found, using demo data` - значит база пустая
4. Если видите `⚠️ API returned status 500` - проблема с backend

---

## 8️⃣ FAQ

### **Q: Почему я вижу одни и те же концерты?**
A: Это demo данные. Чтобы увидеть реальные - нужно:
1. Создать концерты через кабинет
2. Одобрить через модерацию
3. Оплатить промо

### **Q: Как долго концерт висит на главной?**
A: 7 дней по умолчанию (можно изменить при оплате промо)

### **Q: Можно ли показать концерт без оплаты промо?**
A: Нет, нужно `is_promoted = true`, это платная функция

### **Q: Как добавить свои demo данные?**
A: Редактируйте массив `DEMO_CONCERTS` в `/src/utils/api/concerts.ts`

### **Q: Можно ли добавить фильтры (город, жанр)?**
A: Да, см. раздел "NEXT STEPS" в `/CONCERTS_INTEGRATION_COMPLETE.md`

---

## 9️⃣ READY-TO-USE ПРИМЕРЫ

### **Пример 1: Создать тестовый концерт**
```typescript
// В кабинете артиста, вкладка "Мои концерты"
const testConcert = {
  title: 'Test Concert',
  date: '2026-12-31',
  show_start: '23:00',
  city: 'Москва',
  venue_name: 'Test Venue',
  ticket_price_min: 1000,
  ticket_price_max: 5000,
  ticket_url: 'https://example.com',
  banner_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
  event_type: 'Концерт',
  description: 'Test description',
};

await createConcert(accessToken, testConcert);
```

### **Пример 2: Кастомный компонент с концертами**
```typescript
import { getPromotedConcerts } from '@/utils/api/concerts';

export function MyConcertsWidget() {
  const [concerts, setConcerts] = useState([]);

  useEffect(() => {
    getPromotedConcerts().then(setConcerts);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {concerts.map(concert => (
        <div key={concert.id} className="p-4 bg-white/10 rounded-xl">
          <img src={concert.banner} alt={concert.title} />
          <h3>{concert.title}</h3>
          <p>{concert.city} • {concert.date}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 ИТОГО

**Чтобы концерт появился на главной:**
1. ✅ Создать концерт
2. ✅ Одобрить модерацию
3. ✅ Оплатить промо
4. ✅ Ждать автоматического отображения

**Чтобы показать концерты в новом компоненте:**
1. ✅ `import { getPromotedConcerts } from '@/utils/api/concerts'`
2. ✅ `useEffect(() => { ... })` для загрузки
3. ✅ `useState` для хранения
4. ✅ Render компонента

**Всё остальное работает автоматически!** 🎉
