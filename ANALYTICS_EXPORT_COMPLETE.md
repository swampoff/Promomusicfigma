# ANALYTICS EXPORT - ПОЛНАЯ ДОКУМЕНТАЦИЯ

## 🎯 ОБЗОР СИСТЕМЫ ЭКСПОРТА

Полноценная система экспорта аналитики в различных форматах для радиостанций и заведений.

---

## 📊 ПОДДЕРЖИВАЕМЫЕ ФОРМАТЫ

### 1. PDF (Рекомендуем ⭐)
**Детальный отчет с графиками и таблицами**
- ✅ Готов к печати
- ✅ Профессиональное оформление
- ✅ Графики и статистика
- ✅ Таблицы с данными
- 📱 Открывается в новом окне для печати в PDF

### 2. Excel (XLS)
**Таблица для анализа**
- ✅ Все данные в таблицах
- ✅ Готов для формул
- ✅ Фильтры и сортировка
- ✅ Сводные таблицы
- 📊 Формат: XML SpreadsheetML

### 3. CSV
**Простой формат для импорта**
- ✅ Легкий вес
- ✅ Универсальный
- ✅ Импорт в любую систему
- ✅ Кириллица с BOM
- 🔄 UTF-8 with BOM

### 4. JSON
**Данные для разработчиков**
- ✅ Структурированные данные
- ✅ API интеграция
- ✅ Автоматизация
- ✅ Программная обработка
- 💻 Pretty-print форматирование

---

## 🗂️ ФАЙЛОВАЯ СТРУКТУРА

```
/src/
├── utils/
│   └── analytics-export.ts          # Утилиты экспорта
└── components/
    └── analytics-export-modal.tsx   # Модальное окно

/src/radio/components/
└── analytics-section.tsx             # Интеграция для радио

/src/venue/components/
└── analytics-section.tsx             # Интеграция для заведений
```

---

## 💻 КОД КОМПОНЕНТОВ

### Утилиты экспорта (`/src/utils/analytics-export.ts`)

**Функции:**
```typescript
// CSV Export
exportToCSV(data: any[], filename: string)

// Excel Export (XML)
exportToExcel(data: any[], filename: string, sheetName?: string)

// JSON Export
exportToJSON(data: any, filename: string)

// PDF Export (HTML print)
exportToPDF(data: {
  title: string;
  period: string;
  stats: any;
  tables?: Array<{ title: string; data: any[] }>;
}, filename: string)

// Radio Analytics Export
exportRadioAnalytics(
  format: 'pdf' | 'excel' | 'csv' | 'json',
  data: { period: string; stats: any; campaigns?: any[] }
)

// Venue Analytics Export
exportVenueAnalytics(
  format: 'pdf' | 'excel' | 'csv' | 'json',
  data: { period: string; stats: any; campaigns?: any[] }
)
```

---

## 🎨 UI КОМПОНЕНТ

### Модальное окно экспорта

**Особенности:**
- ✅ Glassmorphism дизайн
- ✅ Выбор из 4 форматов
- ✅ Рекомендации (PDF помечен звездой)
- ✅ Превью содержимого отчета
- ✅ Анимации (motion/react)
- ✅ Адаптивный дизайн
- ✅ Loading состояние

**Параметры:**
```typescript
interface AnalyticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'json') => void;
  title?: string;
  type?: 'radio' | 'venue';
}
```

---

## 🔄 ИНТЕГРАЦИЯ

### Radio Analytics

```typescript
import { AnalyticsExportModal } from '@/components/analytics-export-modal';
import { exportRadioAnalytics } from '@/utils/analytics-export';

const [isExportModalOpen, setIsExportModalOpen] = useState(false);

// Кнопка экспорта
<button onClick={() => setIsExportModalOpen(true)}>
  <Download className="w-4 h-4" />
  Экспорт
</button>

// Модальное окно
<AnalyticsExportModal
  isOpen={isExportModalOpen}
  onClose={() => setIsExportModalOpen(false)}
  onExport={(format) => {
    exportRadioAnalytics(format, {
      period: getPeriodLabel(timePeriod),
      stats: stats,
      campaigns: [...]
    });
  }}
  type="radio"
/>
```

### Venue Analytics

```typescript
import { AnalyticsExportModal } from '@/components/analytics-export-modal';
import { exportVenueAnalytics } from '@/utils/analytics-export';

<AnalyticsExportModal
  isOpen={isExportModalOpen}
  onClose={() => setIsExportModalOpen(false)}
  onExport={(format) => {
    exportVenueAnalytics(format, {
      period: getPeriodLabel(timePeriod),
      stats: stats,
      campaigns: [...],
      radioStations: [...]
    });
  }}
  type="venue"
/>
```

---

## 📄 СОДЕРЖИМОЕ ОТЧЕТОВ

### PDF Отчет

**Структура:**
```
┌─────────────────────────────────────┐
│ Заголовок                           │
│ Период: Неделя                      │
│ Сгенерирован: 03.02.2026 12:30     │
├─────────────────────────────────────┤
│                                     │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│ │КPI│ │КPI│ │КPI│ │КPI│          │
│ └───┘ └───┘ └───┘ └───┘          │
│                                     │
├─────────────────────────────────────┤
│ Таблица 1: Активные кампании       │
│ ┌─────┬─────┬─────┬─────┐         │
│ │     │     │     │     │         │
│ └─────┴─────┴─────┴─────┘         │
├─────────────────────────────────────┤
│ Таблица 2: Радиостанции            │
│ ┌─────┬─────┬─────┬─────┐         │
│ │     │     │     │     │         │
│ └─────┴─────┴─────┴─────┘         │
├─────────────────────────────────────┤
│ PROMO.MUSIC © 2026                 │
└─────────────────────────────────────┘
```

**Стили:**
- Шрифт: Segoe UI
- Цвета: Индиго акценты
- Адаптивная верстка
- Печать: без фона

### Excel Таблица

**Листы:**
- Лист 1: "Кампании" - все данные кампаний
- Лист 2: "Статистика" - сводная статистика (опционально)

**Формат:**
```xml
<?xml version="1.0"?>
<Workbook>
  <Worksheet ss:Name="Кампании">
    <Table>
      <Row><!-- Заголовки --></Row>
      <Row><!-- Данные --></Row>
    </Table>
  </Worksheet>
</Workbook>
```

### CSV Файл

**Формат:**
```csv
name,type,revenue,plays,roi
"DJ Alexey","Артист","₽25,000",180,"245%"
"Sunset Lounge","Заведение","₽15,000",70,"228%"
```

**Особенности:**
- UTF-8 with BOM (кириллица)
- Экранирование запятых и кавычек
- Совместимость с Excel

### JSON Данные

**Структура:**
```json
{
  "period": "Неделя",
  "stats": {
    "revenue": { "total": 125000, "growth": 24.5 },
    "campaigns": { "active": 3, "total": 8 }
  },
  "campaigns": [
    {
      "name": "DJ Alexey",
      "type": "Артист",
      "revenue": "₽25,000",
      "plays": 180,
      "roi": "245%"
    }
  ]
}
```

---

## 🎯 WORKFLOW ЭКСПОРТА

### 1. Пользователь нажимает "Экспорт"
```
Analytics Section → Кнопка "Экспорт"
                   ↓
           Открывается модальное окно
```

### 2. Выбор формата
```
Модальное окно → Пользователь выбирает формат
                ↓
        PDF / Excel / CSV / JSON
```

### 3. Генерация файла
```
onClick → exportRadioAnalytics(format, data)
         ↓
  Генерация контента
         ↓
  Скачивание файла
```

### 4. Закрытие окна
```
Успешная загрузка → Закрытие модального окна
                    ↓
             Возврат к аналитике
```

---

## 📱 АДАПТИВНОСТЬ

### Модальное окно

**Мобильные (< 640px):**
- Fullscreen режим
- Grid: 1 колонка
- Прокрутка внутри модального окна
- Кнопки на всю ширину

**Планшеты (640px - 1024px):**
- Grid: 2 колонки для форматов
- Компактные карточки

**Десктоп (> 1024px):**
- Grid: 2 колонки
- Полноразмерные карточки
- max-width: 2xl (672px)

---

## 🚀 ОСОБЕННОСТИ

### 1. PDF через Print Dialog
```typescript
const printWindow = window.open('', '_blank');
printWindow.document.write(htmlContent);
printWindow.document.close();
setTimeout(() => {
  printWindow.print();
}, 250);
```

**Преимущества:**
- Нет зависимостей от библиотек
- Нативный браузерный принтер
- Выбор принтера/PDF
- Настройки печати

### 2. Excel через XML
```typescript
const xmlContent = `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
    ...
  </Workbook>`;
```

**Преимущества:**
- Нет внешних библиотек
- Совместимость с Excel
- Легкий вес
- Поддержка типов данных

### 3. CSV с BOM
```typescript
const BOM = '\uFEFF';
const blob = new Blob([BOM + csvContent], { 
  type: 'text/csv;charset=utf-8;' 
});
```

**Преимущества:**
- Корректная кириллица в Excel
- UTF-8 encoding
- Универсальная совместимость

### 4. JSON Pretty Print
```typescript
const jsonString = JSON.stringify(data, null, 2);
```

**Преимущества:**
- Читаемый формат
- Удобен для разработки
- Легко парсится

---

## ✅ ЧЕКЛИСТ

- [x] Утилиты экспорта созданы
- [x] Модальное окно создано
- [x] Интеграция в Radio Analytics
- [x] Интеграция в Venue Analytics  
- [x] PDF экспорт реализован
- [x] Excel экспорт реализован
- [x] CSV экспорт реализован
- [x] JSON экспорт реализован
- [x] Адаптивный дизайн
- [x] Анимации добавлены
- [x] Loading состояния
- [x] Документация создана

---

## 🎉 РЕЗУЛЬТАТ

**Создана полноценная система экспорта:**
- ✅ 4 формата экспорта (PDF, Excel, CSV, JSON)
- ✅ 2 утилитных файла
- ✅ Модальное окно с выбором
- ✅ Интеграция в обе аналитики
- ✅ Полностью адаптивный UI
- ✅ Профессиональные отчеты
- ✅ Без внешних зависимостей
- ✅ Готово к использованию

**Система экспорта аналитики полностью готова!** 🚀📊✨
