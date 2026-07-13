#!/bin/bash

# ============================================
# AUDITORÍA RESPONSIVE - Arcatierra
# Genera análisis real del código actual
# ============================================

echo "🔍 AUDITORÍA RESPONSIVE - Arcatierra"
echo "===================================="
echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Crear directorio resultados
mkdir -p audit
AUDIT_DIR="../audit"

cd src

# ============================================
# 1. GRIDS SIN BREAKPOINTS RESPONSIVE
# ============================================
echo "📐 Analizando grids sin responsive..."
{
  echo "# GRIDS SIN BREAKPOINTS RESPONSIVE"
  echo "# Generado: $(date)"
  echo "# Problema: grid-cols-X sin sm:/md:/lg:"
  echo ""
  find app components -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | \
    xargs grep -n "grid grid-cols-[2-9]" 2>/dev/null | \
    grep -v "sm:" | grep -v "md:" | grep -v "lg:" | \
    head -50
} > "$AUDIT_DIR/1-grids-sin-responsive.txt"

# ============================================
# 2. TEXTOS GRANDES SIN RESPONSIVE
# ============================================
echo "📝 Analizando tipografía sin responsive..."
{
  echo "# TEXTOS GRANDES SIN BREAKPOINTS"
  echo "# Generado: $(date)"
  echo "# Problema: text-4xl, text-5xl, etc sin sm:/md:/lg:"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -nE "text-[4-9]xl|text-\[.*rem\]" 2>/dev/null | \
    grep -v "sm:" | grep -v "md:" | grep -v "lg:" | \
    head -50
} > "$AUDIT_DIR/2-textos-sin-responsive.txt"

# ============================================
# 3. SPACING EXCESIVO SIN BREAKPOINTS
# ============================================
echo "📏 Analizando spacing excesivo..."
{
  echo "# SPACING EXCESIVO SIN RESPONSIVE"
  echo "# Generado: $(date)"
  echo "# Problema: px-20, py-16, etc sin md:/lg:"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -nE "p[xy]-1[5-9]|p[xy]-2[0-9]|p[xy]-3[0-9]" 2>/dev/null | \
    grep -v "md:" | grep -v "lg:" | \
    head -50
} > "$AUDIT_DIR/3-spacing-excesivo.txt"

# ============================================
# 4. ANCHOS FIJOS EN PÍXELES
# ============================================
echo "📦 Analizando anchos fijos..."
{
  echo "# ANCHOS FIJOS EN PÍXELES"
  echo "# Generado: $(date)"
  echo "# Problema: w-[400px] o width: 500px"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -nE "w-\[[0-9]+px\]|width:\s*[0-9]+px|min-w-\[[0-9]+px\]" 2>/dev/null | \
    head -50
} > "$AUDIT_DIR/4-anchos-fijos.txt"

# ============================================
# 5. IMÁGENES SIN CLASES RESPONSIVE
# ============================================
echo "🖼️  Analizando imágenes..."
{
  echo "# IMÁGENES SIN RESPONSIVE"
  echo "# Generado: $(date)"
  echo "# Problema: <Image sin className o width/height fijos"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -n "<Image" 2>/dev/null | \
    head -100
} > "$AUDIT_DIR/5-imagenes-analisis.txt"

# ============================================
# 6. CONTAINERS SIN MAX-WIDTH
# ============================================
echo "📦 Analizando containers..."
{
  echo "# CONTAINERS SIN MAX-WIDTH"
  echo "# Generado: $(date)"
  echo "# Problema: divs sin max-w-"
  echo ""
  find app -type f -name "page.tsx" 2>/dev/null | \
    xargs grep -l "return" | \
    xargs grep -L "max-w-" | \
    head -20
} > "$AUDIT_DIR/6-containers-sin-maxwidth.txt"

# ============================================
# 7. BOTONES SIN TOUCH TARGET
# ============================================
echo "👆 Analizando botones touch..."
{
  echo "# BOTONES SIN TOUCH TARGET (min 44x44px)"
  echo "# Generado: $(date)"
  echo "# Buscar: button con padding muy pequeño"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -nE "<button.*p-[0-2]|<button.*px-[0-2]|<button.*py-[0-2]" 2>/dev/null | \
    head -30
} > "$AUDIT_DIR/7-botones-touch-target.txt"

# ============================================
# 8. TABLAS SIN OVERFLOW
# ============================================
echo "📊 Analizando tablas..."
{
  echo "# TABLAS SIN OVERFLOW-X-AUTO"
  echo "# Generado: $(date)"
  echo "# Problema: <table sin wrapper responsive"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -B2 -A2 "<table" 2>/dev/null | \
    grep -v "overflow" | \
    head -30
} > "$AUDIT_DIR/8-tablas-sin-overflow.txt"

# ============================================
# 9. FLEX SIN BREAKPOINTS
# ============================================
echo "🔄 Analizando flex layouts..."
{
  echo "# FLEX LAYOUTS SIN RESPONSIVE"
  echo "# Generado: $(date)"
  echo "# Problema: flex-row sin flex-col mobile"
  echo ""
  find app components -type f -name "*.tsx" 2>/dev/null | \
    xargs grep -n "flex flex-row" 2>/dev/null | \
    grep -v "flex-col" | \
    head -30
} > "$AUDIT_DIR/9-flex-sin-responsive.txt"

# ============================================
# 10. PÁGINAS A REVISAR (lista completa)
# ============================================
echo "📄 Generando lista de páginas..."
{
  echo "# TODAS LAS PÁGINAS DEL PROYECTO"
  echo "# Generado: $(date)"
  echo ""
  echo "## App Pages:"
  find app -name "page.tsx" -o -name "page.ts" | sort
  echo ""
  echo "## Componentes principales:"
  find components -maxdepth 2 -name "*.tsx" | sort
} > "$AUDIT_DIR/10-lista-paginas.txt"

cd ..

# ============================================
# RESUMEN FINAL
# ============================================
AUDIT_DIR="audit"  # Cambiar de vuelta después del cd ..

echo ""
echo "✅ AUDITORÍA COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 RESUMEN DE PROBLEMAS:"
echo ""

for file in "$AUDIT_DIR"/*.txt; do
  if [ -f "$file" ]; then
    count=$(grep -v "^#" "$file" | grep -v "^$" | wc -l | tr -d ' ')
    filename=$(basename "$file")
    printf "%-35s %3d líneas\n" "$filename" "$count"
  fi
done

echo ""
echo "📂 Resultados completos en: $AUDIT_DIR/"
echo ""
echo "🔍 Ver resumen:"
echo "   cat $AUDIT_DIR/1-grids-sin-responsive.txt | head -20"
echo ""
echo "📝 Siguiente paso: Revisar archivo 1-grids-sin-responsive.txt"
