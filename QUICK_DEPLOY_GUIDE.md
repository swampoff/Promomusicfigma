# ⚡ БЫСТРЫЙ ГАЙД ПО DEPLOYMENT
## Настройка за 10 минут

---

## 🎯 ЦЕЛЬ

Настроить автоматический деплой где **один git push** = обновление на production.

---

## ⚡ 3 ПРОСТЫХ ШАГА

### ШАГ 1: Получите токены (5 минут)

#### A. Supabase Access Token
1. Откройте: https://supabase.com/dashboard/account/tokens
2. Нажмите **"Generate new token"**
3. Назовите: `GitHub Actions`
4. Скопируйте токен (начинается с `sbp_...`)

#### B. Vercel Token
1. Откройте: https://vercel.com/account/tokens
2. Нажмите **"Create Token"**
3. Назовите: `GitHub Actions`
4. Скопируйте токен

#### C. Vercel Project IDs
```bash
# В терминале проекта:
cd your-project
vercel link

# Это создаст .vercel/project.json
cat .vercel/project.json

# Скопируйте:
# - orgId (это VERCEL_ORG_ID)
# - projectId (это VERCEL_PROJECT_ID)
```

---

### ШАГ 2: Добавьте secrets в GitHub (3 минуты)

1. Откройте ваш GitHub repo
2. **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **"New repository secret"**
4. Добавьте по одному:

```
Name: SUPABASE_ACCESS_TOKEN
Value: sbp_xxx... (из шага 1A)

Name: SUPABASE_PROJECT_ID
Value: your-project-id (из Supabase dashboard)

Name: VERCEL_TOKEN
Value: xxx... (из шага 1B)

Name: VERCEL_ORG_ID
Value: team_xxx... (из шага 1C)

Name: VERCEL_PROJECT_ID
Value: prj_xxx... (из шага 1C)

Name: VITE_SUPABASE_URL
Value: https://xxx.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbG... (ваш anon key)
```

---

### ШАГ 3: Push и готово! (2 минуты)

```bash
# Сделайте deploy.sh исполняемым
chmod +x deploy.sh

# Сделайте первый push
git add .
git commit -m "setup: настроил CI/CD"
git push origin main

# GitHub Actions автоматически задеплоит все!
```

**Проверьте:**
- GitHub → Actions → Смотрите прогресс
- После завершения проверьте production

---

## 🚀 ТЕПЕРЬ ИСПОЛЬЗУЙТЕ

### Автоматический деплой (рекомендуется):
```bash
git add .
git commit -m "Мои изменения"
git push
# → GitHub Actions задеплоит автоматически!
```

### Ручной деплой (если нужна скорость):
```bash
./deploy.sh
# → Задеплоит все прямо сейчас
```

### Частичный деплой:
```bash
./deploy.sh supabase  # Только backend
./deploy.sh vercel    # Только frontend
```

---

## 📊 ГДЕ СМОТРЕТЬ РЕЗУЛЬТАТЫ

### GitHub Actions:
```
https://github.com/your-username/your-repo/actions
```

### Supabase Functions:
```
https://supabase.com/dashboard/project/_/functions
```

### Vercel Deployment:
```
https://vercel.com/dashboard
```

---

## ❓ FAQ

### Q: Нужно ли каждый раз запускать deploy.sh?
**A:** Нет! После настройки GitHub Actions достаточно делать `git push`.

### Q: Можно ли деплоить только backend или только frontend?
**A:** Да! Используйте:
- `./deploy.sh supabase` - только backend
- `./deploy.sh vercel` - только frontend

### Q: Что если что-то сломалось?
**A:** Проверьте логи в GitHub Actions или запустите `./deploy.sh test`

### Q: Нужен ли Vercel CLI?
**A:** Не обязательно для auto-deploy через GitHub. Но полезен для ручного деплоя.

---

## 🎉 ГОТОВО!

После настройки ваш workflow:

```
1. Пишете код
2. git push
3. Автоматически деплоится на production
4. Получаете уведомление
```

**Все! Больше ничего не нужно!** 🚀

---

**Следующий шаг:** Сделайте первый push и наслаждайтесь автоматическим деплоем!

