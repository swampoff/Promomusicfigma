# 🔄 Clear Cache and Restart Dev Server

## ⚠️ Если ошибка persists после исправления

Проблема может быть в кеше браузера или dev server. Выполните следующие шаги:

### 1️⃣ Остановите dev server
```bash
# Нажмите Ctrl+C в терминале где запущен сервер
```

### 2️⃣ Очистите кеш Node modules (опционально)
```bash
# Если проблема не решается, удалите .vite кеш
rm -rf node_modules/.vite
```

### 3️⃣ Перезапустите dev server
```bash
npm run dev
# или
pnpm dev
```

### 4️⃣ Очистите кеш браузера
- **Chrome/Edge**: `Ctrl+Shift+Delete` → Выберите "Cached images and files" → Clear
- **Firefox**: `Ctrl+Shift+Delete` → Выберите "Cache" → Clear
- Или просто: **Hard Refresh** с `Ctrl+Shift+R` (Windows) или `Cmd+Shift+R` (Mac)

### 5️⃣ Откройте приложение в Incognito/Private режиме
Это гарантирует отсутствие кеша:
- **Chrome**: `Ctrl+Shift+N`
- **Firefox**: `Ctrl+Shift+P`

---

## 🐛 Если ошибка всё ещё есть

Проблема может быть в смешанных импортах motion/framer-motion.

### Решение: Унифицировать все импорты на `motion/react`

Сейчас в проекте есть файлы, которые импортируют из `framer-motion`:
```typescript
// ❌ Старый способ (нужно заменить)
import { motion } from 'framer-motion';

// ✅ Новый способ (использовать везде)
import { motion } from 'motion/react';
```

### Файлы, которые нужно обновить:
1. `/src/app/components/performance-history-tab.tsx`
2. `/src/app/components/quick-test-button.tsx`
3. `/src/app/components/public-concerts-widget.tsx`
4. `/src/app/components/concerts-filters.tsx`
5. `/src/app/components/concerts-analytics.tsx`
6. `/src/app/components/notifications-manager.tsx`
7. `/src/app/components/email-campaigns.tsx`
8. `/src/app/components/ticketing-integration.tsx`
9. `/src/app/components/marketing-page.tsx`
10. `/src/app/components/storage-test-button.tsx`

### Команда для автозамены (опционально):
```bash
# Заменить все импорты framer-motion на motion/react
find src -name "*.tsx" -exec sed -i "s/from 'framer-motion'/from 'motion\/react'/g" {} +
find src -name "*.tsx" -exec sed -i 's/from "framer-motion"/from "motion\/react"/g' {} +
```

---

## ✅ После исправления

1. Перезапустите dev server
2. Hard refresh браузера (`Ctrl+Shift+R`)
3. Проверьте консоль браузера на ошибки
4. Приложение должно работать!

---

## 📝 Проверено

- ✅ Export/Import в `/src/promo-guide/PromoGuideApp.phase1.tsx` исправлен
- ✅ Все основные компоненты экспортируются корректно
- ⚠️ Смешанные импорты motion/framer-motion могут вызывать конфликты

Если проблема persist, сообщите какую именно ошибку вы видите в консоли браузера (F12 → Console).
