#!/bin/bash

# =====================================================
# SYNC FILES TO DESKTOP
# =====================================================
# Копирует все созданные файлы в папку на рабочем столе
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Целевая папка
TARGET_DIR=~/Desktop/"стильный кабинет артиста 2"

echo -e "${BLUE}🔄 Синхронизация файлов в: ${TARGET_DIR}${NC}"

# Создать папку если не существует
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${BLUE}📁 Создаю папку: ${TARGET_DIR}${NC}"
    mkdir -p "$TARGET_DIR"
fi

# Копировать все файлы
echo -e "${BLUE}📋 Копирую файлы...${NC}"

# GitHub Actions
if [ -f ".github/workflows/deploy.yml" ]; then
    mkdir -p "$TARGET_DIR/.github/workflows"
    cp ".github/workflows/deploy.yml" "$TARGET_DIR/.github/workflows/"
    echo -e "${GREEN}✅ .github/workflows/deploy.yml${NC}"
fi

# Scripts
for file in deploy.sh sync-to-desktop.sh; do
    if [ -f "$file" ]; then
        cp "$file" "$TARGET_DIR/"
        chmod +x "$TARGET_DIR/$file"
        echo -e "${GREEN}✅ $file${NC}"
    fi
done

# Config files
for file in vercel.json package.json; do
    if [ -f "$file" ]; then
        cp "$file" "$TARGET_DIR/"
        echo -e "${GREEN}✅ $file${NC}"
    fi
done

# Testing files
for file in test-api.html test-api.mjs; do
    if [ -f "$file" ]; then
        cp "$file" "$TARGET_DIR/"
        echo -e "${GREEN}✅ $file${NC}"
    fi
done

# Documentation
for file in *.md; do
    if [ -f "$file" ]; then
        cp "$file" "$TARGET_DIR/"
        echo -e "${GREEN}✅ $file${NC}"
    fi
done

# Backend files
if [ -d "supabase" ]; then
    echo -e "${BLUE}📡 Копирую Supabase files...${NC}"
    cp -r supabase "$TARGET_DIR/"
    echo -e "${GREEN}✅ supabase/${NC}"
fi

# Frontend files
if [ -d "src" ]; then
    echo -e "${BLUE}🎨 Копирую src/...${NC}"
    cp -r src "$TARGET_DIR/"
    echo -e "${GREEN}✅ src/${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Синхронизация завершена!${NC}"
echo -e "${BLUE}📁 Файлы скопированы в: ${TARGET_DIR}${NC}"
echo ""
echo -e "${BLUE}Следующие шаги:${NC}"
echo "  cd \"$TARGET_DIR\""
echo "  git status"
echo "  git add ."
echo "  git commit -m 'feat: добавил CI/CD и тестирование'"
echo "  git push"
echo ""
