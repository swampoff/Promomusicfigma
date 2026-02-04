# 🚀 АВТОМАТИЧЕСКИЙ DEPLOYMENT SETUP
## Полная настройка CI/CD для Promo.Music

Дата: 4 февраля 2026

---

## 📋 ЧТО СОЗДАНО

### 1. ✅ GitHub Actions Workflow
**Файл:** `/.github/workflows/deploy.yml`

**Что делает:**
- 📡 Автоматически деплоит Supabase Edge Functions
- 🎨 Билдит и деплоит Frontend на Vercel
- 🧪 Запускает API тесты
- 📬 Отправляет уведомления

**Триггеры:**
- При push в `main` или `master`
- Ручной запуск через GitHub UI

---

### 2. ✅ Deployment Script
**Файл:** `/deploy.sh`

**Команды:**
```bash
./deploy.sh              # Деплой всего (Supabase + Vercel + тесты)
./deploy.sh supabase     # Только Supabase Edge Functions
./deploy.sh vercel       # Только Frontend на Vercel
./deploy.sh test         # Только API тесты
./deploy.sh push         # Git push (запустит GitHub Actions)
```

---

### 3. ✅ Vercel Configuration
**Файл:** `/vercel.json`

**Настройки:**
- Auto-build при push
- Environment variables
- Rewrites для SPA
- Cache headers для assets

---

## 🔧 ПЕРВОНАЧАЛЬНАЯ НАСТРОЙКА

### ШАГ 1: GitHub Secrets

Добавьте secrets в GitHub:

1. Перейдите в **Settings → Secrets and variables → Actions**

2. Добавьте следующие secrets:

```bash
# Supabase
SUPABASE_ACCESS_TOKEN=sbp_xxx...        # Получите на supabase.com/dashboard/account/tokens
SUPABASE_PROJECT_ID=abcdefghijklmnop    # ID вашего проекта

# Vercel
VERCEL_TOKEN=xxx...                     # Получите на vercel.com/account/tokens
VERCEL_ORG_ID=team_xxx...               # Найдите в .vercel/project.json
VERCEL_PROJECT_ID=prj_xxx...            # Найдите в .vercel/project.json

# Environment Variables (для frontend)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# Testing (опционально)
TEST_AUTH_TOKEN=eyJhbG...               # Токен для тестов
```

---

### ШАГ 2: Supabase CLI Setup

```bash
# 1. Установите Supabase CLI (если еще нет)
brew install supabase/tap/supabase

# 2. Войдите в аккаунт
supabase login

# 3. Проверьте что все работает
supabase projects list

# 4. Линкуйте локальный проект (опционально)
supabase link --project-ref your-project-id
```

---

### ШАГ 3: Vercel CLI Setup

```bash
# 1. Установите Vercel CLI (если еще нет)
npm i -g vercel

# 2. Войдите в аккаунт
vercel login

# 3. Линкуйте проект
vercel link

# Это создаст .vercel/project.json с:
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID
```

---

### ШАГ 4: Установите Environment Variables в Vercel

1. Перейдите на **vercel.com/dashboard**
2. Выберите ваш проект
3. **Settings → Environment Variables**
4. Добавьте:

```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbG...
```

---

### ШАГ 5: Сделайте deploy.sh исполняемым

```bash
chmod +x deploy.sh
```

---

## 🚀 ИСПОЛЬЗОВАНИЕ

### Вариант 1: Автоматический (через GitHub Actions)

```bash
# 1. Коммит изменений
git add .
git commit -m "feat: добавил новую фичу"

# 2. Push в main
git push origin main

# 3. GitHub Actions автоматически:
#    - Задеплоит Supabase Functions
#    - Задеплоит Frontend на Vercel
#    - Запустит тесты
#    - Отправит уведомление
```

**Мониторинг:**
- GitHub: `https://github.com/your-repo/actions`

---

### Вариант 2: Полуавтоматический (через deploy.sh)

```bash
# Деплой всего одной командой
./deploy.sh

# Скрипт спросит подтверждение и выполнит:
# 1. Deploy Supabase Edge Functions
# 2. Build и deploy Frontend
# 3. Run API tests
# 4. Git push (опционально)
```

---

### Вариант 3: Частичный деплой

```bash
# Только Supabase
./deploy.sh supabase

# Только Vercel
./deploy.sh vercel

# Только тесты
./deploy.sh test

# Только git push
./deploy.sh push "Мой коммит"
```

---

### Вариант 4: Полностью ручной

```bash
# 1. Supabase
supabase functions deploy make-server-84730125

# 2. Vercel
vercel --prod

# 3. Tests
export PROJECT_ID="xxx"
export AUTH_TOKEN="xxx"
node test-api.mjs

# 4. Git
git add .
git commit -m "Update"
git push
```

---

## 📊 WORKFLOW DIAGRAM

```
┌─────────────────┐
│  Local Changes  │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         v                     v
┌─────────────────┐   ┌──────────────────┐
│  Manual Deploy  │   │   Git Push       │
│  (deploy.sh)    │   │   to GitHub      │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         │                     v
         │            ┌──────────────────┐
         │            │ GitHub Actions   │
         │            │ Triggered        │
         │            └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         v                     v
┌─────────────────┐   ┌──────────────────┐
│    Supabase     │   │     Vercel       │
│  Edge Functions │   │   Frontend       │
└────────┬────────┘   └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    v
           ┌──────────────────┐
           │   API Tests      │
           └────────┬─────────┘
                    │
                    v
           ┌──────────────────┐
           │  Notifications   │
           │  ✅ Success      │
           │  ❌ Failure      │
           └──────────────────┘
```

---

## 🎯 РЕКОМЕНДУЕМЫЙ WORKFLOW

### Для ежедневной разработки:

```bash
# 1. Работаете над кодом
# 2. Коммитите часто
git add .
git commit -m "fix: исправил баг"

# 3. Push когда готово
git push origin main

# 4. GitHub Actions автоматически задеплоит
# 5. Проверяете результат на production
```

---

### Для срочных фиксов:

```bash
# 1. Исправили баг
# 2. Быстрый деплой
./deploy.sh supabase  # Если только backend
./deploy.sh vercel    # Если только frontend

# 3. Push позже
git add .
git commit -m "hotfix: критический баг"
git push
```

---

### Для тестирования перед деплоем:

```bash
# 1. Сделали изменения
# 2. Сначала локально протестировать
./deploy.sh test

# 3. Если тесты ОК - задеплоить
./deploy.sh

# 4. Push в GitHub
```

---

## 🔍 МОНИТОРИНГ DEPLOYMENT

### GitHub Actions:
```
https://github.com/your-username/promo-music/actions
```

**Что смотреть:**
- ✅ Зеленая галочка = успешный деплой
- ❌ Красный крестик = ошибка
- 🟡 Желтый кружок = в процессе

---

### Supabase:
```
https://supabase.com/dashboard/project/_/functions
```

**Что проверять:**
- Status: Active / Inactive
- Last deployed: timestamp
- Logs: ошибки в реальном времени

---

### Vercel:
```
https://vercel.com/dashboard
```

**Что проверять:**
- Production deployment status
- Build logs
- Analytics

---

## 🐛 TROUBLESHOOTING

### ❌ GitHub Actions failed

**1. Проверьте Secrets:**
```bash
# Settings → Secrets → Actions
# Убедитесь что все secrets установлены
```

**2. Проверьте логи:**
```
GitHub → Actions → Failed workflow → Expand logs
```

**3. Типичные ошибки:**
- `SUPABASE_ACCESS_TOKEN` не установлен
- `VERCEL_TOKEN` истек
- Build failed (проверьте package.json)

---

### ❌ Supabase deployment failed

```bash
# 1. Проверьте что залогинены
supabase projects list

# 2. Повторите деплой
supabase functions deploy make-server-84730125 --no-verify-jwt

# 3. Проверьте логи
supabase functions logs make-server-84730125
```

---

### ❌ Vercel deployment failed

```bash
# 1. Проверьте build локально
pnpm build

# 2. Проверьте environment variables в Vercel
vercel env ls

# 3. Попробуйте задеплоить вручную
vercel --prod
```

---

## ⚡ БЫСТРЫЕ КОМАНДЫ

### Один коммит = автоматический деплой:
```bash
git add . && git commit -m "Update" && git push
```

### Полный деплой без вопросов:
```bash
./deploy.sh supabase && ./deploy.sh vercel && ./deploy.sh test
```

### Проверить статус всего:
```bash
# Supabase
supabase projects list
supabase functions list

# Vercel
vercel ls

# GitHub
gh run list  # Если установлен GitHub CLI
```

---

## 📋 CHECKLIST ПЕРЕД ПЕРВЫМ ДЕПЛОЕМ

- [ ] GitHub repo создан
- [ ] Supabase проект создан
- [ ] Vercel проект создан
- [ ] Все GitHub Secrets добавлены
- [ ] Environment Variables в Vercel установлены
- [ ] Supabase CLI установлен и залогинен
- [ ] Vercel CLI установлен и залогинен
- [ ] `deploy.sh` сделан исполняемым
- [ ] Локально все работает (npm dev)
- [ ] Тесты проходят локально

---

## 🎊 АВТОМАТИЗАЦИЯ ДОСТИГНУТА!

После настройки:

**Вам нужно только:**
```bash
git add .
git commit -m "Мои изменения"
git push
```

**GitHub Actions сделает:**
- ✅ Deploy Supabase Functions
- ✅ Build Frontend
- ✅ Deploy to Vercel
- ✅ Run tests
- ✅ Notify you

**Или еще проще:**
```bash
./deploy.sh
```

И все работает! 🚀

---

## 📞 ПОДДЕРЖКА

**Проблемы с setup?**

1. Проверьте `deploy.sh` - он показывает детальные ошибки
2. Читайте логи GitHub Actions
3. Проверьте что все secrets установлены
4. Попробуйте деплоить частями (supabase → vercel → test)

**Все работает?**

Теперь каждый `git push` = автоматический деплой на production! 🎉

---

**Создано:** 4 февраля 2026  
**Статус:** ✅ READY TO DEPLOY  
**Следующий шаг:** Настроить secrets и запустить первый деплой

