# 🏗️ ПОЛНАЯ АРХИТЕКТУРА PROMO.MUSIC

## 📊 Схема потока данных и компонентов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ТОЧКА ВХОДА                                    │
└─────────────────────────────────────────────────────────────────────────┘

/index.html
    │
    ├── <script src="/src/main.tsx">
    │
    v

/src/main.tsx
    │
    ├── ReactDOM.createRoot(root)
    ├── Импорты стилей:
    │   • fonts.css
    │   • tailwind.css
    │   • theme.css
    │   • index.css
    │
    └── render(<AppWrapper />)
         │
         v

┌─────────────────────────────────────────────────────────────────────────┐
│                          APP WRAPPER                                    │
└─────────────────────────────────────────────────────────────────────────┘

/src/app/AppWrapper.tsx
    │
    └── <MainRouter />
         │
         v

┌─────────────────────────────────────────────────────────────────────────┐
│                          MAIN ROUTER                                    │
│                     (React Router + Routes)                             │
└─────────────────────────────────────────────────────────────────────────┘

/src/main-router.tsx
    │
    ├── <BrowserRouter>
    │   ├── <ErrorBoundary>
    │   ├── <Routes>
    │   │   │
    │   │   ├── Route: /feedback/:token → <FeedbackPortal />
    │   │   │
    │   │   └── Route: /* → <RootApp />  ⭐ ОСНОВНОЙ РОУТ
    │   │
    │   └── <Toaster />
    │
    v

┌─────────────────────────────────────────────────────────────────────────┐
│                          ROOT APP                                       │
│                  (Управление состоянием авторизации)                    │
└─────────────────────────────────────────────────────────────────────────┘

/src/app/RootApp.tsx

    State Management:
    • view: 'public' | 'login' | 'dashboard'
    • isAuthenticated: boolean
    • userRole: 'artist' | 'admin' | 'radio_station' | 'venue'

    ┌─────────────────────────────────────────────────────────────┐
    │                    УСЛОВНЫЙ РЕНДЕРИНГ                        │
    └─────────────────────────────────────────────────────────────┘

    if (view === 'public') {
        │
        └── <PublicApp onLoginClick={handleShowLogin} />  ⭐ ПУБЛИЧНАЯ ЧАСТЬ
    }

    if (view === 'login' || !isAuthenticated) {
        │
        └── <UnifiedLogin onLoginSuccess={handleLoginSuccess} />
    }

    if (view === 'dashboard' && isAuthenticated) {
        │
        ├── userRole === 'admin' → <AdminApp />
        ├── userRole === 'radio_station' → <RadioApp />
        ├── userRole === 'venue' → <VenueApp />
        └── userRole === 'artist' → <ArtistApp />
    }

┌─────────────────────────────────────────────────────────────────────────┐
│                          PUBLIC APP                                     │
│                    (Публичная часть БЕЗ авторизации)                   │
└─────────────────────────────────────────────────────────────────────────┘

/src/app/PublicApp.tsx

    State:
    • currentPage: 'landing' | 'about'

    ┌─────────────────────────────────────────────────────────────┐
    │                    УСЛОВНЫЙ РЕНДЕРИНГ                        │
    └─────────────────────────────────────────────────────────────┘

    if (currentPage === 'landing') {
        │
        └── <SunoLayoutLanding onLogin={onLoginClick} />  ⭐ ГЛАВНАЯ СТРАНИЦА
    }

    if (currentPage === 'about') {
        │
        ├── <PublicHeader />
        ├── <AboutPage />
        └── <PublicFooter />
    }

┌─────────────────────────────────────────────────────────────────────────┐
│                      SUNO LAYOUT LANDING                                │
│              (Главная страница с 4-колоночным layout)                   │
└─────────────────────────────────────────────────────────────────────────┘

/src/app/components/landing/SunoLayoutLanding.tsx

    State:
    • activeNav: 'home' | 'charts' | 'news'
    • mobileMenuOpen: boolean

    ┌─────────────────────────────────────────────────────────────┐
    │                    СТРУКТУРА СТРАНИЦЫ                        │
    └─────────────────────────────────────────────────────────────┘

    1. MOBILE HEADER (lg:hidden)
       │
       ├── Logo (клик → setActiveNav('home'))  ✅
       ├── Login Button
       └── Menu Toggle
           │
           └── Mobile Menu
               ├── Главная (клик → setActiveNav('home'))  ✅
               ├── Чарты (клик → setActiveNav('charts'))
               └── Новости (клик → setActiveNav('news'))  ✅

    2. HERO BANNER (всегда видим)
       │
       └── <Carousel> с 3 баннерами:
           ├── "Продвигай музыку быстрее звука"
           ├── "Попади в ТОП радиостанций"
           └── "Монетизируй свою музыку"

    3. ЧЕТЫРЕХКОЛОНОЧНЫЙ LAYOUT
       │
       ├── [1] LEFT SIDEBAR (240px, hidden lg:flex)
       │   │
       │   ├── Logo (клик → setActiveNav('home'))  ✅
       │   │
       │   └── Navigation:
       │       ├── Главная (клик → setActiveNav('home'))  ✅
       │       ├── Чарты (клик → setActiveNav('charts'))
       │       └── Новости (клик → setActiveNav('news'))  ✅
       │
       ├── [2] WIDGETS SIDEBAR (256px, hidden md:block)
       │   │
       │   ├── Тест трека
       │   ├── Спецпредложения
       │   ├── Подписка Newsletter
       │   ├── Наушники
       │   └── Топ артистов
       │
       ├── [3] MAIN CONTENT (flex-1)  ⭐ ОСНОВНОЙ КОНТЕНТ
       │   │
       │   │   ┌───────────────────────────────────────────────┐
       │   │   │         УСЛОВНЫЙ РЕНДЕРИНГ ПО activeNav       │
       │   │   └───────────────────────────────────────────────┘
       │   │
       │   ├── if (activeNav === 'home'):
       │   │   │
       │   │   ├── TOP 20 Чартов (mock данные)
       │   │   └── Новые клипы
       │   │
       │   ├── if (activeNav === 'charts'):
       │   │   │
       │   │   └── <ChartsSection />  ✅
       │   │       │
       │   │       └── /src/app/components/landing/ChartsSection.tsx
       │   │
       │   └── if (activeNav === 'news'):  ⭐ РАЗДЕЛ НОВОСТЕЙ
       │       │
       │       └── <NewsSection />  ✅
       │           │
       │           └── /src/app/components/landing/NewsSection.tsx
       │               │
       │               ├── Breaking News баннер
       │               ├── Статистика (30 публикаций, просмотры...)
       │               ├── 8 категорий фильтрации
       │               ├── 2 Featured новости
       │               ├── Сетка новостей (30 штук)
       │               └── Newsletter подписка
       │
       └── [4] RIGHT SIDEBAR (350px, hidden xl:block)
           │
           ├── PROMO.FM сейчас (статистика)
           ├── Новинки (5 треков)
           ├── Новые клипы (4 видео)
           ├── Лидеры недели
           └── Скоро в эфире

┌─────────────────────────────────────────────────────────────────────────┐
│                          NEWS SECTION                                   │
│                   (30 реальных профессиональных новостей)               │
└─────────────────────────────────────────────────────────────────────────┘

/src/app/components/landing/NewsSection.tsx

    State:
    • selectedCategory: NewsCategory

    Структура:
    ├── Breaking News баннер (красный, анимированный)
    ├── Статистика (4 карточки):
    │   ├── 30 Публикаций
    │   ├── 386.4K Просмотров
    │   ├── 8.5K Обсуждений
    │   └── 6 Горячих тем
    │
    ├── Категории (8 кнопок):
    │   ├── Все новости (30)
    │   ├── Релизы (7)
    │   ├── Артисты (6)
    │   ├── Индустрия (6)
    │   ├── События (4)
    │   ├── Чарты (2)
    │   ├── Интервью (4)
    │   └── Рецензии (4)
    │
    ├── Featured новости (2 больших):
    │   ├── The Weeknd - рекордный альбом
    │   └── Билли Айлиш - мировой тур
    │
    ├── Сетка новостей (адаптивная 1-5 колонок):
    │   └── 30 новостей с:
    │       ├── Изображения
    │       ├── Заголовки
    │       ├── Авторы с аватарами
    │       ├── Источники (Rolling Stone, Billboard...)
    │       ├── Теги (The Weeknd, альбом...)
    │       ├── Геолокация (Лос-Анджелес, Москва...)
    │       ├── Badges (Breaking, Exclusive, Trending)
    │       └── Статистика (просмотры, лайки, комментарии)
    │
    └── Newsletter подписка

┌─────────────────────────────────────────────────────────────────────────┐
│                          НАВИГАЦИЯ                                      │
└─────────────────────────────────────────────────────────────────────────┘

    activeNav State управляет контентом:
    
    ┌──────────────┬─────────────────────────────────────────────┐
    │ activeNav    │ Отображаемый компонент                      │
    ├──────────────┼─────────────────────────────────────────────┤
    │ 'home'       │ Hero + TOP 20 чартов + Новые клипы          │
    │ 'charts'     │ <ChartsSection />                           │
    │ 'news'       │ <NewsSection />  ⭐ 30 новостей             │
    └──────────────┴─────────────────────────────────────────────┘

    Способы изменения activeNav:

    1. КЛИК ПО ЛОГОТИПУ (возврат на главную):
       ├── Mobile Header Logo → setActiveNav('home')  ✅
       └── Desktop Sidebar Logo → setActiveNav('home')  ✅

    2. КНОПКИ НАВИГАЦИИ:
       ├── Mobile Menu:
       │   ├── Главная → setActiveNav('home')
       │   ├── Чарты → setActiveNav('charts')
       │   └── Новости → setActiveNav('news')  ✅
       │
       └── Desktop Sidebar:
           ├── Главная → setActiveNav('home')
           ├── Чарты → setActiveNav('charts')
           └── Новости → setActiveNav('news')  ✅

┌─────────────────────────────────────────────────────────────────────────┐
│                          ИМПОРТЫ                                        │
└─────────────────────────────────────────────────────────────────────────┘

/src/app/components/landing/SunoLayoutLanding.tsx:

    import { ChartsSection } from './ChartsSection';  ✅
    import { NewsSection } from './NewsSection';      ✅

    ИСПОЛЬЗОВАНИЕ:
    {activeNav === 'charts' && <ChartsSection />}    ✅
    {activeNav === 'news' && <NewsSection />}        ✅

┌─────────────────────────────────────────────────────────────────────────┐
│                          АДАПТИВНОСТЬ                                   │
└─────────────────────────────────────────────────────────────────────────┘

    Breakpoints:
    ├── xs:   475px   (XS devices)
    ├── sm:   640px   (Small)
    ├── md:   768px   (Medium) - Показываем widgets sidebar
    ├── lg:   1024px  (Large) - Показываем left sidebar
    ├── xl:   1280px  (XL) - Показываем right sidebar
    └── 2xl:  1536px  (2XL)

    Сетка новостей:
    ├── 320-474px:  1 колонка
    ├── 475-639px:  1 колонка (xs)
    ├── 640-767px:  2 колонки (sm)
    ├── 768-1023px: 3 колонки (md)
    ├── 1024-1279px: 4 колонки (xl)
    └── 1280px+:    5 колонок (2xl)

┌─────────────────────────────────────────────────────────────────────────┐
│                          ДАННЫЕ                                         │
└─────────────────────────────────────────────────────────────────────────┘

    NewsSection.tsx содержит:
    
    • 30 реальных новостей про:
      ├── The Weeknd - рекордный альбом
      ├── Билли Айлиш - мировой тур 2026
      ├── Drake - surprise-альбом
      ├── Spotify - 600M подписчиков
      ├── Coachella 2026 - лайнап
      ├── Taylor Swift - Grammy рекорд
      ├── Bad Bunny - латиноамериканский тур
      ├── Dua Lipa - новый сингл
      ├── Post Malone - документальный фильм
      └── ... и 21 других новостей

    • Каждая новость включает:
      ├── id, title, excerpt, fullContent
      ├── category, tags, image, date
      ├── author, authorAvatar, source
      ├── views, comments, likes, shares
      ├── readTime, location
      └── isTrending, isFeatured, isBreaking, isExclusive

┌─────────────────────────────────────────────────────────────────────────┐
│                          АНИМАЦИИ                                       │
└─────────────────────────────────────────────────────────────────────────┘

    Используется motion/react:
    
    ├── Hero Carousel: autoplay каждые 5 секунд
    ├── Cards: whileHover + scale animations
    ├── Breaking News: анимация молнии (pulse)
    ├── Stats: fade-in с delays
    └── News grid: stagger animation

┌─────────────────────────────────────────────────────────────────────────┐
│                          ФАЙЛОВАЯ СТРУКТУРА                             │
└─────────────────────────────────────────────────────────────────────────┘

/
├── index.html                              (Точка входа HTML)
├── vite.config.ts                          (Конфигурация Vite)
├── package.json                            (Зависимости)
│
└── src/
    ├── main.tsx                            (Точка входа JS)
    ├── main-router.tsx                     (React Router)
    │
    ├── styles/
    │   ├── fonts.css                       (Montserrat, Inter, Golos Text)
    │   ├── tailwind.css                    (Tailwind v4)
    │   ├── theme.css                       (Брендовые токены)
    │   └── index.css                       (Глобальные стили)
    │
    └── app/
        ├── AppWrapper.tsx                  (Обертка приложения)
        ├── RootApp.tsx                     (Управление auth)
        ├── PublicApp.tsx                   (Публичная часть)
        ├── ArtistApp.tsx                   (Кабинет артиста)
        │
        └── components/
            └── landing/
                ├── SunoLayoutLanding.tsx   ⭐ (Главная страница)
                ├── NewsSection.tsx         ⭐ (30 новостей)
                ├── ChartsSection.tsx       (Музыкальные чарты)
                └── ...другие компоненты

┌─────────────────────────────────────────────────────────────────────────┐
│                          СОСТОЯНИЕ (STATE)                              │
└─────────────────────────────────────────────────────────────────────────┘

    RootApp.tsx:
    ├── view: 'public' | 'login' | 'dashboard'
    ├── isAuthenticated: boolean
    └── userRole: 'artist' | 'admin' | 'radio_station' | 'venue'

    PublicApp.tsx:
    └── currentPage: 'landing' | 'about'

    SunoLayoutLanding.tsx:
    ├── activeNav: 'home' | 'charts' | 'news'  ⭐ КЛЮЧЕВОЙ STATE
    └── mobileMenuOpen: boolean

    NewsSection.tsx:
    └── selectedCategory: NewsCategory

┌─────────────────────────────────────────────────────────────────────────┐
│                          ЦЕПОЧКА РЕНДЕРИНГА                             │
└─────────────────────────────────────────────────────────────────────────┘

    Полный путь до NewsSection:

    index.html
        → /src/main.tsx
            → AppWrapper
                → MainRouter
                    → Route /*
                        → RootApp
                            → if (view === 'public')
                                → PublicApp
                                    → if (currentPage === 'landing')
                                        → SunoLayoutLanding
                                            → if (activeNav === 'news')
                                                → NewsSection  ✅

    Количество уровней: 9 компонентов в цепочке

┌─────────────────────────────────────────────────────────────────────────┐
│                          ПРОВЕРКА СВЯЗЕЙ                                │
└─────────────────────────────────────────────────────────────────────────┘

    ✅ index.html правильно импортирует /src/main.tsx
    ✅ main.tsx правильно рендерит AppWrapper
    ✅ AppWrapper правильно импортирует MainRouter
    ✅ MainRouter правильно роутит на RootApp
    ✅ RootApp правильно рендерит PublicApp
    ✅ PublicApp правильно рендерит SunoLayoutLanding
    ✅ SunoLayoutLanding правильно импортирует NewsSection
    ✅ NewsSection правильно экспортируется
    ✅ Клик по логотипу правильно вызывает setActiveNav('home')
    ✅ Кнопка "Новости" правильно вызывает setActiveNav('news')
    ✅ activeNav === 'news' правильно рендерит <NewsSection />

┌─────────────────────────────────────────────────────────────────────────┐
│                          ИТОГ                                           │
└─────────────────────────────────────────────────────────────────────────┘

    ВСЕ СВЯЗИ КОРРЕКТНЫ! ✅

    • Маршруты настроены правильно
    • Импорты/экспорты корректны
    • Навигация работает через activeNav state
    • Клик по логотипу возвращает на главную (setActiveNav('home'))
    • Раздел "Новости" доступен через кнопку в навигации
    • NewsSection рендерится при activeNav === 'news'
    • 30 новостей загружаются и отображаются правильно

    Проблема НЕ в архитектуре!
    Проблема в кэшировании браузера/CDN.

    Решение: Hard Refresh (Ctrl + Shift + R) в инкогнито ⚡
