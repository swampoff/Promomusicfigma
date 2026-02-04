#!/bin/bash

# =====================================================
# 📁 КОПИРОВАНИЕ ФАЙЛОВ НА РАБОЧИЙ СТОЛ
# =====================================================
# Простой скрипт для копирования всех файлов проекта
# в папку "стильный кабинет артиста 2" на рабочем столе
# =====================================================

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     📁 КОПИРОВАНИЕ ФАЙЛОВ НА РАБОЧИЙ СТОЛ        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Целевая директория
DESKTOP_FOLDER="$HOME/Desktop/стильный кабинет артиста 2"

echo -e "${BLUE}🎯 Целевая папка: ${DESKTOP_FOLDER}${NC}"
echo ""

# Проверка: существует ли папка
if [ ! -d "$DESKTOP_FOLDER" ]; then
    echo -e "${YELLOW}⚠️  Папка не существует. Создать? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        mkdir -p "$DESKTOP_FOLDER"
        echo -e "${GREEN}✅ Папка создана${NC}"
    else
        echo -e "${RED}❌ Отменено${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Папка существует${NC}"
fi

echo ""
echo -e "${BLUE}📋 Копирование файлов...${NC}"
echo ""

# Счетчик
COPIED=0

# Функция копирования
copy_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "$DESKTOP_FOLDER/"
        echo -e "${GREEN}  ✓${NC} $file"
        ((COPIED++))
    fi
}

copy_dir() {
    local dir=$1
    if [ -d "$dir" ]; then
        cp -r "$dir" "$DESKTOP_FOLDER/"
        echo -e "${GREEN}  ✓${NC} $dir/"
        ((COPIED++))
    fi
}

# Копирование CI/CD файлов
echo -e "${BLUE}🔧 CI/CD файлы:${NC}"
if [ -d ".github" ]; then
    copy_dir ".github"
fi
copy_file "deploy.sh"
copy_file "vercel.json"

# Копирование тестовых файлов
echo ""
echo -e "${BLUE}🧪 Тестовые файлы:${NC}"
copy_file "test-api.html"
copy_file "test-api.mjs"

# Копирование документации
echo ""
echo -e "${BLUE}📚 Документация:${NC}"
copy_file "API_TESTING_GUIDE.md"
copy_file "HOW_TO_TEST_API.md"
copy_file "QUICK_TEST_COMMANDS.md"
copy_file "API_TESTING_READY.md"
copy_file "TESTING_COMPLETE_SUMMARY.md"
copy_file "README_TESTING.md"
copy_file "DEPLOYMENT_SETUP.md"
copy_file "QUICK_DEPLOY_GUIDE.md"
copy_file "START_HERE_DEPLOYMENT.md"
copy_file "SETUP_DESKTOP_SYNC.md"
copy_file "README.md"

# Копирование Backend файлов
echo ""
echo -e "${BLUE}📡 Backend файлы:${NC}"
if [ -d "supabase" ]; then
    copy_dir "supabase"
fi

# Копирование Frontend файлов
echo ""
echo -e "${BLUE}🎨 Frontend файлы:${NC}"
if [ -d "src" ]; then
    copy_dir "src"
fi

# Копирование конфигурационных файлов
echo ""
echo -e "${BLUE}⚙️  Конфигурация:${NC}"
copy_file "package.json"
copy_file "tsconfig.json"
copy_file "vite.config.ts"
copy_file ".gitignore"

# Копирование утилит
echo ""
echo -e "${BLUE}🛠️  Утилиты:${NC}"
copy_file "sync-to-desktop.sh"
copy_file "copy-to-desktop.sh"

# Сделать скрипты исполняемыми
if [ -f "$DESKTOP_FOLDER/deploy.sh" ]; then
    chmod +x "$DESKTOP_FOLDER/deploy.sh"
fi
if [ -f "$DESKTOP_FOLDER/sync-to-desktop.sh" ]; then
    chmod +x "$DESKTOP_FOLDER/sync-to-desktop.sh"
fi
if [ -f "$DESKTOP_FOLDER/copy-to-desktop.sh" ]; then
    chmod +x "$DESKTOP_FOLDER/copy-to-desktop.sh"
fi

# Итоги
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║           ✅ КОПИРОВАНИЕ ЗАВЕРШЕНО!              ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Статистика:${NC}"
echo -e "   Скопировано файлов/папок: ${GREEN}${COPIED}${NC}"
echo -e "   Целевая папка: ${BLUE}${DESKTOP_FOLDER}${NC}"
echo ""
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo ""
echo -e "   1. Перейдите в папку:"
echo -e "      ${YELLOW}cd \"${DESKTOP_FOLDER}\"${NC}"
echo ""
echo -e "   2. Проверьте файлы:"
echo -e "      ${YELLOW}ls -la${NC}"
echo ""
echo -e "   3. Если это git репозиторий:"
echo -e "      ${YELLOW}git status${NC}"
echo -e "      ${YELLOW}git add .${NC}"
echo -e "      ${YELLOW}git commit -m \"feat: добавил CI/CD и тестирование\"${NC}"
echo -e "      ${YELLOW}git push${NC}"
echo ""
echo -e "   4. Или запустите deployment:"
echo -e "      ${YELLOW}./deploy.sh${NC}"
echo ""
echo -e "${GREEN}🎉 Готово!${NC}"
echo ""
