@echo off
REM 🧹 Clean Vite Cache Script for Windows
REM Этот скрипт очищает все кэши Vite и пересобирает проект

echo 🧹 Очистка кэша Vite...

REM Удаление кэша Vite
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ node_modules\.vite удалён
) else (
    echo ⚠️ node_modules\.vite не найден
)

REM Удаление dist
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ dist удалён
) else (
    echo ⚠️ dist не найден
)

REM Удаление .next (если есть)
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ .next удалён
) else (
    echo ⚠️ .next не найден
)

echo.
echo 🔨 Пересборка проекта...
call npm run build

echo.
echo ✅ Готово! Теперь задеплойте на Supabase.
pause
