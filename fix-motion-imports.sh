#!/bin/bash

# Script to fix all motion imports from framer-motion to motion/react

echo "🔧 Fixing motion imports..."

# List of files to fix
files=(
  "src/app/components/concerts-filters.tsx"
  "src/app/components/concerts-analytics.tsx"
  "src/app/components/notifications-manager.tsx"
  "src/app/components/email-campaigns.tsx"
  "src/app/components/ticketing-integration.tsx"
  "src/app/components/marketing-page.tsx"
  "src/app/components/storage-test-button.tsx"
)

# Replace in each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing: $file"
    sed -i "s/from 'framer-motion'/from 'motion\/react'/g" "$file"
    sed -i 's/from "framer-motion"/from "motion\/react"/g' "$file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✅ Done! All motion imports have been updated to 'motion/react'"
echo ""
echo "Next steps:"
echo "1. Stop the dev server (Ctrl+C)"
echo "2. Clear cache: rm -rf node_modules/.vite"
echo "3. Restart: npm run dev"
echo "4. Hard refresh browser: Ctrl+Shift+R"
