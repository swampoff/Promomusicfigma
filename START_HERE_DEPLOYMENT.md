# 🚀 НАЧНИТЕ ЗДЕСЬ - АВТОМАТИЧЕСКИЙ DEPLOYMENT

## Для вас лично - что делать прямо сейчас

---

## ✅ ЧТО Я СОЗДАЛ ДЛЯ ВАС

### 1. GitHub Actions Workflow
**Файл:** `.github/workflows/deploy.yml`
- ✅ Автоматически деплоит Supabase при push в main
- ✅ Автоматически деплоит Vercel при push в main
- ✅ Запускает тесты после деплоя
- ✅ Отправляет уведомления

### 2. Deployment Script
**Файл:** `deploy.sh`
```bash
./deploy.sh              # Деплой всего
./deploy.sh supabase     # Только Supabase
./deploy.sh vercel       # Только Vercel
./deploy.sh test         # Только тесты
./deploy.sh push "msg"   # Git push
```

### 3. Vercel Config
**Файл:** `vercel.json`
- ✅ Настроен auto-build
- ✅ Настроены environment variables
- ✅ Оптимизирован для production

### 4. Документация
- `DEPLOYMENT_SETUP.md` - полная документация
- `QUICK_DEPLOY_GUIDE.md` - быстрый гайд за 10 минут

---

## 🎯 ВАМ НУЖНО СДЕЛАТЬ (10-15 минут)

Поскольку у вас уже есть GitHub, Supabase и Vercel настроенные, осталось только добавить secrets.

### ШАГ 1: Получите токены

#### Supabase Access Token:
```
1. Откройте: https://supabase.com/dashboard/account/tokens
2. Create new token → назовите "GitHub Actions"
3. Скопируйте токен (начинается с sbp_...)
```

#### Vercel Token:
```
1. Откройте: https://vercel.com/account/tokens
2. Create → назовите "GitHub Actions"
3. Скопируйте токен
```

#### Vercel Project IDs:
```bash
# В терминале вашего проекта:
cd ~/Desktop/promo-music  # или где у вас проект

# Если еще не линковали:
vercel link

# Это создаст .vercel/project.json
cat .vercel/project.json

# Вы увидите:
{
  "orgId": "team_xxx...",      # ← это VERCEL_ORG_ID
  "projectId": "prj_xxx..."    # ← это VERCEL_PROJECT_ID
}
```

---

### ШАГ 2: Добавьте GitHub Secrets

1. Откройте ваш GitHub repo в браузере
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **"New repository secret"** для каждого:

```bash
# Supabase
SUPABASE_ACCESS_TOKEN = sbp_xxx... (из шага 1)
SUPABASE_PROJECT_ID = ваш-project-id

# Vercel
VERCEL_TOKEN = xxx... (из шага 1)
VERCEL_ORG_ID = team_xxx... (из .vercel/project.json)
VERCEL_PROJECT_ID = prj_xxx... (из .vercel/project.json)

# Environment Variables для frontend
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbG...

# Опционально для тестов
TEST_AUTH_TOKEN = ваш-токен-для-тестов
```

**Где взять остальные значения:**
- `SUPABASE_PROJECT_ID` - в URL Supabase dashboard
- `VITE_SUPABASE_URL` - в Supabase → Settings → API → URL
- `VITE_SUPABASE_ANON_KEY` - в Supabase → Settings → API → anon/public

---

### ШАГ 3: Сделайте deploy.sh исполняемым

```bash
# В терминале:
cd ~/Desktop/promo-music  # или где у вас проект
chmod +x deploy.sh
```

---

### ШАГ 4: Первый деплой!

#### Вариант A: Через Git (автоматический)

```bash
# Добавьте все новые файлы
git add .

# Коммит
git commit -m "setup: настроил автоматический CI/CD deployment"

# Push
git push origin main

# Смотрите как GitHub Actions делает всю работу!
# https://github.com/your-username/your-repo/actions
```

#### Вариант B: Через скрипт (ручной)

```bash
# Просто запустите
./deploy.sh

# Скрипт спросит подтверждение и задеплоит все
```

---

## 🎊 ПОСЛЕ ПЕРВОГО ДЕПЛОЯ

Ваш workflow станет:

```bash
# 1. Работаете над кодом
# 2. Коммитите изменения
git add .
git commit -m "Добавил новую фичу"

# 3. Push
git push

# 4. GitHub Actions автоматически:
#    ✅ Деплоит Supabase Edge Functions
#    ✅ Билдит и деплоит Frontend на Vercel
#    ✅ Запускает API тесты
#    ✅ Уведомляет о результатах
```

**Вам больше ничего не нужно делать!** 🚀

---

## 📊 МОНИТОРИНГ

После push смотрите прогресс:

### GitHub Actions:
```
https://github.com/your-username/your-repo/actions
```
- Зеленая галочка ✅ = успех
- Красный крестик ❌ = ошибка (смотрите логи)

### Supabase Functions:
```
https://supabase.com/dashboard/project/_/functions
```
- Проверьте что функция Active
- Смотрите логи в реальном времени

### Vercel:
```
https://vercel.com/dashboard
```
- Проверьте Production deployment
- Смотрите build logs

---

## 🔥 БЫСТРЫЕ КОМАНДЫ

### Полный деплой всего:
```bash
./deploy.sh
```

### Только Supabase (быстрее):
```bash
./deploy.sh supabase
```

### Только Frontend:
```bash
./deploy.sh vercel
```

### Запустить тесты:
```bash
export PROJECT_ID="your-project-id"
export AUTH_TOKEN="your-token"
./deploy.sh test
```

### Git push с автоматическим деплоем:
```bash
git add . && git commit -m "Update" && git push
```

---

## 🐛 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Проблема 1: GitHub Actions failed

**Проверьте:**
1. Все secrets добавлены в GitHub?
2. Токены не истекли?
3. Project IDs правильные?

**Решение:**
```bash
# Смотрите детальные логи в GitHub Actions
# Settings → Secrets → проверьте все значения
```

---

### Проблема 2: deploy.sh не запускается

**Проверьте:**
```bash
# Файл исполняемый?
ls -la deploy.sh

# Если нет -x, сделайте:
chmod +x deploy.sh
```

---

### Проблема 3: Supabase CLI не установлен

```bash
# macOS
brew install supabase/tap/supabase

# Проверка
supabase --version
```

---

### Проблема 4: Vercel CLI не установлен

```bash
# Установка
npm i -g vercel

# Проверка
vercel --version

# Логин
vercel login
```

---

## ✅ CHECKLIST

Перед первым деплоем убедитесь:

- [ ] GitHub repo существует
- [ ] Все GitHub Secrets добавлены (7 штук)
- [ ] `deploy.sh` исполняемый (`chmod +x`)
- [ ] Supabase CLI установлен и залогинен
- [ ] Vercel CLI установлен (опционально)
- [ ] `.vercel/project.json` существует
- [ ] Все изменения закоммичены

---

## 🎯 БЫСТРЫЙ СТАРТ (TL;DR)

```bash
# 1. Добавьте 7 secrets в GitHub Settings → Actions

# 2. В терминале:
chmod +x deploy.sh

# 3. Деплой:
./deploy.sh
# или
git add . && git commit -m "Setup CI/CD" && git push

# 4. Смотрите результат:
# https://github.com/your-repo/actions
```

---

## 🎉 ГОТОВО!

После настройки каждый `git push` автоматически обновляет production.

**Никаких ручных деплоев больше не нужно!** 🚀

---

## 📞 ПОМОЩЬ

**Нужна помощь?**

1. Читайте `DEPLOYMENT_SETUP.md` - полная документация
2. Читайте `QUICK_DEPLOY_GUIDE.md` - быстрый гайд
3. Проверьте логи в GitHub Actions
4. Запустите `./deploy.sh` для детальных сообщений об ошибках

---

**Создано:** 4 февраля 2026  
**Для:** Автоматизация deployment promo.music  
**Статус:** ✅ READY TO USE  

**Следующий шаг:** Добавьте GitHub Secrets и сделайте первый push!

