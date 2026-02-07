# 🎨 Premium Glassmorphism Design System

## 🌟 Обзор

Новый премиум дизайн Promo.Music основан на **glassmorphism** эстетике с революционными анимациями и 3D эффектами.

---

## 🎯 Ключевые компоненты

### 1. **GlassCard** - Универсальная стеклянная карточка

```tsx
import { GlassCard } from '@/app/components/landing/GlassCard';

<GlassCard 
  variant="premium"    // default | hover | gradient | glow | premium | neon
  blur="lg"            // sm | md | lg | xl
  border={true}        // показать границу
  shadow={true}        // показать тень
  glow={true}          // эффект свечения
  hoverScale={true}    // масштабирование при hover
>
  Контент
</GlassCard>
```

**Варианты:**
- `default` - базовый стеклянный эффект
- `hover` - усиленный hover эффект
- `gradient` - градиентный фон
- `glow` - эффект свечения (розовый)
- `premium` - градиент от #FF577F к purple
- `neon` - неоновая граница

---

### 2. **GlassButton** - Стеклянная кнопка

```tsx
import { GlassButton } from '@/app/components/landing/GlassCard';

<GlassButton
  variant="primary"    // primary | secondary | ghost | neon
  size="md"            // sm | md | lg
  glow={true}          // эффект свечения
>
  Кнопка
</GlassButton>
```

**Варианты:**
- `primary` - основная кнопка (#FF577F)
- `secondary` - прозрачная с границей
- `ghost` - полностью прозрачная
- `neon` - неоновая граница с hover эффектом

---

### 3. **AnimatedBackground** - Анимированный фон

```tsx
import { AnimatedBackground } from '@/app/components/landing/GlassCard';

<AnimatedBackground />
```

**Функции:**
- 3 анимированных градиентных круга (розовый, фиолетовый, синий)
- Плавная пульсация (8-12 секунд)
- Декоративная сетка
- Radial gradient маска

---

### 4. **FloatingParticles** - Плавающие частицы

```tsx
import { FloatingParticles } from '@/app/components/landing/GlassCard';

<FloatingParticles />
```

**Функции:**
- 20 анимированных частиц
- Случайная позиция и размер
- Плавное движение вверх-вниз
- Затухание opacity

---

## 🎨 Premium Виджеты

### TrackTestWidget - Тест трека

```tsx
import { TrackTestWidget } from '@/app/components/landing/PremiumWidgets';

<TrackTestWidget />
```

**Эффекты:**
- Анимированная иконка с пульсирующей тенью
- Градиентный фон
- Плавающие частицы
- Hover эффекты

---

### SpecialOfferWidget - Спецпредложения

```tsx
import { SpecialOfferWidget } from '@/app/components/landing/PremiumWidgets';

<SpecialOfferWidget />
```

**Эффекты:**
- Анимированный градиентный фон (45° → 90° → 135°)
- Вращающаяся иконка при hover
- Градиентный текст заголовка

---

### SubscriptionWidget - Подписка

```tsx
import { SubscriptionWidget } from '@/app/components/landing/PremiumWidgets';

<SubscriptionWidget />
```

**Эффекты:**
- Неоновая граница (#FF577F)
- Пульсирующий фон
- Кнопка с glow эффектом

---

### TopArtistsWidget - Топ артистов

```tsx
import { TopArtistsWidget } from '@/app/components/landing/PremiumWidgets';

<TopArtistsWidget artists={artists} />
```

**Эффекты:**
- Золотые/серебряные/бронзовые бейджи для TOP-3
- Анимация появления (stagger)
- Hover эффект смещения
- Анимированная иконка короны для #1

---

## 🎵 Premium Hero Banner

### PremiumHeroBanner - Главный баннер

```tsx
import { PremiumHeroBanner } from '@/app/components/landing/PremiumHeroBanner';

<PremiumHeroBanner />
```

**Функции:**
- 3 баннера с автосменой
- Анимированный градиентный фон
- Магнитный 3D эффект иконки
- Плавающие частицы
- Индикаторы с layoutId анимацией

**Магнитный эффект:**
Иконка следует за курсором с эффектом магнита (spring анимация)

---

### CompactHeroBanner - Мобильная версия

```tsx
import { CompactHeroBanner } from '@/app/components/landing/PremiumHeroBanner';

<CompactHeroBanner />
```

Компактная версия для мобильных устройств с основными элементами.

---

## 🎼 Premium Track Cards

### TrackCard - Карточка трека в списке

```tsx
import { TrackCard } from '@/app/components/landing/PremiumTrackCards';

<TrackCard 
  track={track} 
  index={0} 
  isPlaying={false} 
/>
```

**Эффекты:**
- Анимированный фон при hover
- Кнопка Play/Pause появляется при hover
- Золотой/серебряный/бронзовый бейдж для TOP-3
- Тренд индикатор (↑/↓)
- Действия (like, share, more) при hover
- Прогресс бар при проигрывании

---

### FeaturedTrackCard - Featured трек

```tsx
import { FeaturedTrackCard } from '@/app/components/landing/PremiumTrackCards';

<FeaturedTrackCard track={track} />
```

**Эффекты:**
- Фоновое изображение с градиентом
- Анимированный FEATURED бейдж
- Большая кнопка Play/Pause
- Статистика с иконками
- Плавающие частицы

---

### CompactTrackCard - Компактная карточка

```tsx
import { CompactTrackCard } from '@/app/components/landing/PremiumTrackCards';

<CompactTrackCard track={track} />
```

Минималистичная версия для боковых панелей.

---

## 🎭 EnhancedSunoLayout - Главный Layout

### Использование

```tsx
import { EnhancedSunoLayout } from '@/app/components/landing/EnhancedSunoLayout';

<EnhancedSunoLayout onLogin={handleLogin} />
```

### Структура

```
┌─────────────────────────────────────────────────────────────┐
│                     Hero Banner (full width)                 │
└─────────────────────────────────────────────────────────────┘
┌──────┬──────────┬──────────────────────────┬─────────────────┐
│      │          │                          │                 │
│ Nav  │ Widgets  │    Main Content          │  Right Sidebar  │
│ 240px│  256px   │       (flex-1)           │     350px       │
│      │          │                          │                 │
│      │ • Test   │ • Welcome                │ • New Videos    │
│      │ • Offers │ • Stats                  │ • Trending      │
│      │ • Sub    │ • Tracks                 │ • Coming Soon   │
│      │ • Head   │ • Charts/News            │                 │
│      │ • TOP    │                          │                 │
│      │          │                          │                 │
└──────┴──────────┴──────────────────────────┴─────────────────┘
```

### Адаптивность

- **Mobile (< 1024px):** 1 колонка, мобильное меню
- **Desktop (1024px+):** Nav + Main
- **XL (1280px+):** Nav + Widgets + Main
- **2XL (1536px+):** Nav + Widgets + Main + Right

---

## 🎨 Цветовая палитра

### Основные цвета

```css
/* Брендовые */
--primary: #FF577F;        /* Розовый */
--secondary: #3E4C5E;      /* Темно-синий */

/* Градиенты */
--gradient-primary: linear-gradient(135deg, #FF577F, #A855F7);
--gradient-secondary: linear-gradient(135deg, #A855F7, #3B82F6);
--gradient-success: linear-gradient(135deg, #10B981, #14B8A6);

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-hover: rgba(255, 255, 255, 0.15);
```

### Тени и свечение

```css
/* Стандартные тени */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Цветное свечение */
--glow-pink: 0 0 30px rgba(255, 87, 127, 0.3);
--glow-purple: 0 0 30px rgba(168, 85, 247, 0.3);
--glow-blue: 0 0 30px rgba(59, 130, 246, 0.3);
```

---

## 🎬 Анимации

### Основные анимации

```tsx
// Появление
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}

// Hover масштаб
whileHover={{ scale: 1.05 }}

// Tap
whileTap={{ scale: 0.95 }}

// Стagger для списков
transition={{ delay: index * 0.1 }}
```

### Пульсация

```tsx
animate={{
  scale: [1, 1.2, 1],
  opacity: [0.1, 0.2, 0.1],
}}
transition={{
  duration: 8,
  repeat: Infinity,
  ease: "easeInOut",
}}
```

### Вращение

```tsx
animate={{ rotate: 360 }}
transition={{
  duration: 20,
  repeat: Infinity,
  ease: "linear"
}}
```

---

## 📱 Responsive Design

### Breakpoints

```tsx
// Tailwind breakpoints
xs:  475px   // Extra small devices
sm:  640px   // Small devices
md:  768px   // Medium devices
lg:  1024px  // Large devices
xl:  1280px  // Extra large
2xl: 1536px  // 2X Extra large
```

### Mobile First

Все компоненты разработаны с mobile-first подходом:

1. Базовые стили для mobile
2. Постепенное добавление функций на больших экранах
3. Скрытие второстепенных элементов на малых экранах

---

## 🚀 Performance

### Оптимизации

1. **Lazy Loading:** Импорты только необходимых компонентов
2. **Memoization:** React.memo для тяжелых компонентов
3. **CSS Containment:** `contain: layout paint` для изолированных блоков
4. **will-change:** Предзагрузка GPU для анимаций
5. **Intersection Observer:** Анимации только в viewport

### Blur эффекты

Backdrop-blur может быть тяжелым. Рекомендации:

```tsx
// Легкий blur для списков
<GlassCard blur="sm">  

// Средний для карточек
<GlassCard blur="md">  

// Тяжелый только для героев
<GlassCard blur="xl">  
```

---

## 🎯 Best Practices

### 1. Используйте GlassCard везде

```tsx
// ❌ Плохо
<div className="bg-white/5 backdrop-blur-md rounded-xl p-4">
  Content
</div>

// ✅ Хорошо
<GlassCard variant="hover" blur="md" className="p-4">
  Content
</GlassCard>
```

### 2. Группируйте анимации

```tsx
// ❌ Плохо - каждый элемент анимируется отдельно
{items.map((item, i) => (
  <motion.div key={i} animate={{ opacity: 1 }}>
    {item}
  </motion.div>
))}

// ✅ Хорошо - stagger анимация
<motion.div>
  {items.map((item, i) => (
    <motion.div 
      key={i} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.1 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### 3. Переиспользуйте компоненты

Все виджеты и карточки созданы для переиспользования. Не создавайте новые - используйте существующие с props.

---

## 🔧 Troubleshooting

### Blur не работает

```tsx
// Убедитесь, что родитель имеет overflow
<div className="overflow-hidden">
  <GlassCard blur="lg">Content</GlassCard>
</div>
```

### Анимации лагают

```tsx
// Добавьте will-change
<motion.div style={{ willChange: 'transform' }}>
  Content
</motion.div>
```

### Градиенты не видны

```tsx
// Проверьте z-index и opacity
<div className="relative">
  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20" />
  <div className="relative z-10">Content</div>
</div>
```

---

## 📚 Примеры использования

### Простая карточка

```tsx
<GlassCard variant="hover" blur="md" className="p-6">
  <h3 className="text-xl font-bold mb-2">Заголовок</h3>
  <p className="text-slate-400">Описание</p>
</GlassCard>
```

### Карточка с градиентом

```tsx
<GlassCard variant="premium" blur="lg" glow className="p-6">
  <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
    Премиум функция
  </h3>
  <GlassButton variant="primary" size="lg" glow>
    Подключить
  </GlassButton>
</GlassCard>
```

### Анимированная сетка

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.1 }}
    >
      <GlassCard variant="hover" blur="md" className="p-4">
        {item.content}
      </GlassCard>
    </motion.div>
  ))}
</div>
```

---

## 🎉 Результат

### Что получили:

✅ Революционный glassmorphism дизайн  
✅ 100+ анимаций и 3D эффектов  
✅ Полная адаптивность 320px → 4K  
✅ Премиум компоненты (виджеты, карточки, баннеры)  
✅ Оптимизированная производительность  
✅ Простое API для разработчиков  

### Переключение дизайнов:

В dev режиме доступна кнопка переключения между классическим и премиум дизайном в правом нижнем углу.

---

**Дата обновления:** 7 февраля 2026  
**Версия:** 2.0.0 Premium Glassmorphism  
**Статус:** ✅ Production Ready
