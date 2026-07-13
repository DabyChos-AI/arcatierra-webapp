#!/bin/bash
# Script para optimizar spacing responsive en páginas
# Aplica patrón estándar: py-16→py-12 md:py-16, mb-16→mb-12 md:mb-16, etc.

PAGES=(
  "src/app/baldio/page.tsx"
  "src/app/catering/page.tsx"
  "src/app/impacto/page.tsx"
  "src/app/suscripciones/page.tsx"
  "src/app/entregas/page.tsx"
  "src/app/xochimilco/page.tsx"
  "src/app/catering2/page.tsx"
  "src/app/experiencias/page.tsx"
  "src/app/recetas/page.tsx"
  "src/app/contacto/page.tsx"
  "src/app/blog/page.tsx"
  "src/app/prensa/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "Optimizando: $page"
    
    # Backup
    cp "$page" "$page.backup-responsive"
    
    # Aplicar patrones responsive
    sed -i 's/className="\([^"]*\)py-16\([^"]*\)"/className="\1py-12 md:py-16\2"/g' "$page"
    sed -i 's/className="\([^"]*\)py-20\([^"]*\)"/className="\1py-12 sm:py-16 md:py-20\2"/g' "$page"
    sed -i 's/className="\([^"]*\)mb-16\([^"]*\)"/className="\1mb-12 md:mb-16\2"/g' "$page"
    sed -i 's/className="\([^"]*\)p-8\([^"]*\)"/className="\1p-6 sm:p-8\2"/g' "$page"
    sed -i 's/className="\([^"]*\)gap-12\([^"]*\)"/className="\1gap-8 md:gap-12\2"/g' "$page"
    
    echo "✅ $page optimizada"
  else
    echo "⚠️ No existe: $page"
  fi
done

echo ""
echo "============================================"
echo "✅ Optimización completada"
echo "============================================"
echo "Archivos modificados: ${#PAGES[@]}"
echo "Backups creados en: *.backup-responsive"
