#!/usr/bin/env python3
"""K2 (DR77, sesión K2 del 23-oct-2026): genera src/app/admin/tema-oscuro.css, el modo oscuro del panel /admin.

No se reescriben los usos de color con `dark:` en los archivos del panel: este script recorre las clases de color que el
panel USA (src/app/admin, src/components/admin y src/components/ui/Avisos.tsx, ver K2-CONTRATO §8 C1) y para cada una
emite una regla que solo aplica con html[data-tema-admin="oscuro"], solo en pantalla (@media screen: la impresión queda
clara) y nunca dentro de un contenedor .k2-claro (vista previa de correos, papel de impresión).

El mapeo es por TIPO DE UTILIDAD, no por color: `bg-white` es superficie (se oscurece) y `text-white` es letra sobre un
botón de color (se queda). Los tokens --k2-* se definen arriba de la hoja; los teñidos sin /NN se calculan opacos sobre
--k2-superficie (C4) y los que traen /NN van con alfa sobre el token.

Uso:
  python3 scripts/k2-generar-tema.py               escribe src/app/admin/tema-oscuro.css
  python3 scripts/k2-generar-tema.py --inventario  conteo por clase y las que no sabe mapear (deben ser 0)
  python3 scripts/k2-generar-tema.py --revisar     sale con 1 si el CSS en disco no es el que generaría
  python3 scripts/k2-generar-tema.py --paleta      contraste de cada texto contra fondo y superficies

Si agregas una clase de color al panel: corre --revisar; si sale 1, regenera y confirma que --inventario dice 0 sin mapear.
Sin dependencias externas. Determinista: mismo árbol = mismo CSS.
"""
from __future__ import annotations

import os
import re
import sys
from collections import Counter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGENES = ['src/app/admin', 'src/components/admin', 'src/components/ui/Avisos.tsx']
SALIDA = 'src/app/admin/tema-oscuro.css'
ATRIBUTO = 'html[data-tema-admin="oscuro"]'
FUERA_CLARO = ':not(:where(.k2-claro, .k2-claro *))'

# ---------------------------------------------------------------------------------------------------------------------
# Paleta del oscuro (K2-CONTRATO §4; los ajustes medidos van en §8). Orden = orden en la hoja.
# ---------------------------------------------------------------------------------------------------------------------
TOKENS: dict[str, str] = {
    'fondo': '#141A17',
    'superficie': '#1C2420',
    'superficie-2': '#25302A',
    'superficie-3': '#303C35',
    'superficie-4': '#3A4740',
    'borde': '#34413A',
    'borde-fuerte': '#46554C',
    'texto': '#E7ECE8',
    'texto-2': '#C7D1CB',
    'texto-3': '#A2AFA8',
    'texto-4': '#8C9992',  # §8 C5: #86938C daba 4.28 sobre superficie-2
    'tenue': '#65716B',
}
# Acentos de letra: nivel 1 (shades 300-600 y DEFAULT) y nivel 2, más claro (700-900 y las variantes «dark/oscuro»,
# que en claro se usan para dar más peso; en oscuro más peso = más luz).
# §8 C8: el nivel 1 se aclaró (mezcla con blanco, pasos de 2 %) hasta dar ≥ 4.5 en el peor apilado del panel: el teñido
# `-bg` con el mismo acento /10 encima («Reintentar» de los estados de error: text-rojo + bg-rojo/10 dentro de bg-rojo-bg).
# Valores de partida del contrato: terracota #E58F7C, rojo #F87171, naranja #FB923C, azul #7CB8F0, morado #B79CFA,
# rosa #F28AC0, marca #8DBF9E. --paleta comprueba la regla (columna «apilado»).
ACENTOS: dict[str, tuple[str, str]] = {
    'terracota': ('#EAA394', '#F0B2A4'),
    'rojo': ('#FA9999', '#FCA5A5'),
    'naranja': ('#FB9D50', '#FDBA74'),
    'ambar': ('#FBBF24', '#FCD34D'),
    'verde': ('#6FD39A', '#A7E8C0'),
    'azul': ('#7FB9F0', '#A9D1F7'),
    'morado': ('#C0A8FB', '#CFBDFC'),
    'rosa': ('#F396C6', '#F7B3D6'),
    'marca': ('#8FC0A0', '#B5D6C0'),  # verde de marca (#33503E) en oscuro: bordes, anillos y teñidos «verde»
}
# Teñidos (fondos claros de color: shade 50/100/200/300 y los `-bg` de la marca) = acento con este alfa sobre superficie.
ALFA_TINTE = {'50': 0.12, '100': 0.16, '200': 0.24, '300': 0.32, 'bg': 0.16}
ALFA_BORDE_TINTE = 0.35

# ---------------------------------------------------------------------------------------------------------------------
# Colores de Tailwind 3.4 (los que existen en el proyecto: defaults + tailwind.config.ts)
# ---------------------------------------------------------------------------------------------------------------------
_TW = {
    'slate': 'f8fafc f1f5f9 e2e8f0 cbd5e1 94a3b8 64748b 475569 334155 1e293b 0f172a 020617',
    'gray': 'f9fafb f3f4f6 e5e7eb d1d5db 9ca3af 6b7280 4b5563 374151 1f2937 111827 030712',
    'zinc': 'fafafa f4f4f5 e4e4e7 d4d4d8 a1a1aa 71717a 52525b 3f3f46 27272a 18181b 09090b',
    'neutral': 'fafafa f5f5f5 e5e5e5 d4d4d4 a3a3a3 737373 525252 404040 262626 171717 0a0a0a',
    'stone': 'fafaf9 f5f5f4 e7e5e4 d6d3d1 a8a29e 78716c 57534e 44403c 292524 1c1917 0c0a09',
    'red': 'fef2f2 fee2e2 fecaca fca5a5 f87171 ef4444 dc2626 b91c1c 991b1b 7f1d1d 450a0a',
    'orange': 'fff7ed ffedd5 fed7aa fdba74 fb923c f97316 ea580c c2410c 9a3412 7c2d12 431407',
    'amber': 'fffbeb fef3c7 fde68a fcd34d fbbf24 f59e0b d97706 b45309 92400e 78350f 451a03',
    'yellow': 'fefce8 fef9c3 fef08a fde047 facc15 eab308 ca8a04 a16207 854d0e 713f12 422006',
    'lime': 'f7fee7 ecfccb d9f99d bef264 a3e635 84cc16 65a30d 4d7c0f 3f6212 365314 1a2e05',
    'green': 'f0fdf4 dcfce7 bbf7d0 86efac 4ade80 22c55e 16a34a 15803d 166534 14532d 052e16',
    'emerald': 'ecfdf5 d1fae5 a7f3d0 6ee7b7 34d399 10b981 059669 047857 065f46 064e3b 022c22',
    'teal': 'f0fdfa ccfbf1 99f6e4 5eead4 2dd4bf 14b8a6 0d9488 0f766e 115e59 134e4a 042f2e',
    'cyan': 'ecfeff cffafe a5f3fc 67e8f9 22d3ee 06b6d4 0891b2 0e7490 155e75 164e63 083344',
    'sky': 'f0f9ff e0f2fe bae6fd 7dd3fc 38bdf8 0ea5e9 0284c7 0369a1 075985 0c4a6e 082f49',
    'blue': 'eff6ff dbeafe bfdbfe 93c5fd 60a5fa 3b82f6 2563eb 1d4ed8 1e40af 1e3a8a 172554',
    'indigo': 'eef2ff e0e7ff c7d2fe a5b4fc 818cf8 6366f1 4f46e5 4338ca 3730a3 312e81 1e1b4b',
    'violet': 'f5f3ff ede9fe ddd6fe c4b5fd a78bfa 8b5cf6 7c3aed 6d28d9 5b21b6 4c1d95 2e1065',
    'purple': 'faf5ff f3e8ff e9d5ff d8b4fe c084fc a855f7 9333ea 7e22ce 6b21a8 581c87 3b0764',
    'fuchsia': 'fdf4ff fae8ff f5d0fe f0abfc e879f9 d946ef c026d3 a21caf 86198f 701a75 4a044e',
    'pink': 'fdf2f8 fce7f3 fbcfe8 f9a8d4 f472b6 ec4899 db2777 be185d 9d174d 831843 500724',
    'rose': 'fff1f2 ffe4e6 fecdd3 fda4af fb7185 f43f5e e11d48 be123c 9f1239 881337 4c0519',
}
SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
COLORES: dict[str, str] = {'white': '#ffffff', 'black': '#000000'}
for _fam, _vals in _TW.items():
    for _s, _v in zip(SHADES, _vals.split()):
        COLORES[f'{_fam}-{_s}'] = '#' + _v
# tailwind.config.ts (colores de la marca)
COLORES.update({
    'terracota': '#B15543', 'terracota-principal': '#B15543', 'terracota-medio': '#BA6440',
    'terracota-oscuro': '#975543', 'terracota-dark': '#8A3F30',
    'verde': '#33503E', 'verde-tipografia': '#3A4741', 'verde-principal': '#33503E', 'verde-claro': '#475A52',
    'verde-suave': '#748880', 'verde-dark': '#1F3024',
    'verde-medio': '#596C64',  # CLARO1 (R15 F1): el verde-suave legible del panel en claro (5.59 sobre blanco)
    'neutro-crema': '#E3DBCB', 'neutro-beige': '#CCBB9A', 'neutro-calido': '#DCB584', 'neutro-gris': '#C1CCCE',
    'neutro-light': '#F5F1EA', 'neutro-borde': '#E5E0D6',
    'amarillo': '#F59E0B', 'amarillo-bg': '#FEF3C7', 'azul': '#0369A1', 'azul-bg': '#F0F9FF',
    'rojo': '#DC2626', 'rojo-bg': '#FEE2E2', 'morado': '#7C3AED', 'morado-bg': '#EDE9FE',
    'rosa': '#DB2777', 'rosa-bg': '#FCE7F3',
})
ESPECIALES = {'transparent', 'current', 'inherit'}

# Hex arbitrarios del panel (`bg-[#33503E]`…): a qué color con nombre equivalen. Uno nuevo que no esté aquí sale en
# --inventario como «sin mapear» (se agrega aquí, con su nombre equivalente).
HEX_ARBITRARIOS = {
    '#33503e': 'verde', '#1f3024': 'verde-dark', '#3a4741': 'verde-tipografia', '#475a52': 'verde-claro',
    '#748880': 'verde-suave', '#2a4233': 'verde-hover', '#b15543': 'terracota', '#975543': 'terracota-oscuro',
    '#8a3f30': 'terracota-dark', '#ba6440': 'terracota-medio', '#e3dbcb': 'neutro-crema', '#ccbb9a': 'neutro-beige',
    '#f5f1ea': 'neutro-light', '#e5e0d6': 'neutro-borde', '#4ade80': 'green-400',
    '#f1f5f2': 'tinte-marca-50', '#e4ebe4': 'tinte-marca-100', '#f6e9e4': 'tinte-terracota-100',
}
COLORES['verde-hover'] = '#2A4233'

# Familia → grupo de acento
GRUPO = {
    'red': 'rojo', 'rose': 'rojo', 'rojo': 'rojo',
    'orange': 'naranja',
    'amber': 'ambar', 'yellow': 'ambar', 'amarillo': 'ambar',
    'green': 'verde', 'emerald': 'verde', 'lime': 'verde', 'teal': 'verde',
    'blue': 'azul', 'sky': 'azul', 'indigo': 'azul', 'cyan': 'azul', 'azul': 'azul',
    'purple': 'morado', 'violet': 'morado', 'fuchsia': 'morado', 'morado': 'morado',
    'pink': 'rosa', 'rosa': 'rosa',
    'terracota': 'terracota',
}
GRISES = {'slate', 'gray', 'zinc', 'neutral', 'stone'}

# ---------------------------------------------------------------------------------------------------------------------
# Utilidades y variantes
# ---------------------------------------------------------------------------------------------------------------------
# utilidad → (propiedad CSS, variable de opacidad de Tailwind, clase de mapeo). El orden es el de Tailwind 3.4 en la hoja
# (border antes que border-t…, para que el lado gane como en claro).
UTILIDADES = {
    'border': ('border-color', '--tw-border-opacity', 'borde'),
    'border-x': ('border-left-color|border-right-color', '--tw-border-opacity', 'borde'),
    'border-y': ('border-top-color|border-bottom-color', '--tw-border-opacity', 'borde'),
    'border-t': ('border-top-color', '--tw-border-opacity', 'borde'),
    'border-r': ('border-right-color', '--tw-border-opacity', 'borde'),
    'border-b': ('border-bottom-color', '--tw-border-opacity', 'borde'),
    'border-l': ('border-left-color', '--tw-border-opacity', 'borde'),
    'divide': ('border-color', '--tw-divide-opacity', 'borde'),
    'bg': ('background-color', '--tw-bg-opacity', 'fondo'),
    'from': ('gradiente-from', None, 'gradiente'),
    'via': ('gradiente-via', None, 'gradiente'),
    'to': ('gradiente-to', None, 'gradiente'),
    'fill': ('fill', None, 'letra'),
    'stroke': ('stroke', None, 'letra'),
    'text': ('color', '--tw-text-opacity', 'letra'),
    'decoration': ('text-decoration-color', None, 'letra'),
    'placeholder': ('color', '--tw-placeholder-opacity', 'placeholder'),
    'caret': ('caret-color', None, 'letra'),
    'accent': ('accent-color', None, 'anillo'),
    'shadow': ('--tw-shadow-color', None, 'anillo'),
    'outline': ('outline-color', None, 'anillo'),
    'ring': ('--tw-ring-color', '--tw-ring-opacity', 'anillo'),
    'ring-offset': ('--tw-ring-offset-color', None, 'borde'),
}
ORDEN_UTIL = {u: i for i, u in enumerate(UTILIDADES)}

# Sufijos de esas utilidades que NO son color (o nombres de propiedades CSS que aparecen en estilos en línea).
NO_COLOR = {
    'text': {'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', 'md', 'left',
             'center', 'right', 'justify', 'start', 'end', 'wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip',
             'hero', 'section', 'decoration', 'align', 'transform', 'overflow', 'shadow', 'indent', 'rendering'},
    'border': {'0', '2', '4', '8', 'solid', 'dashed', 'dotted', 'double', 'hidden', 'none', 'collapse', 'separate',
               'spacing', 'radius', 'style', 'width', 'color', 'bottom', 'top', 'left', 'right', 'box', 'inline'},
    'bg': {'fixed', 'local', 'scroll', 'auto', 'cover', 'contain', 'center', 'top', 'bottom', 'left', 'right',
           'repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'none', 'clip-text', 'clip-border', 'clip-padding',
           'clip-content', 'origin-border', 'origin-padding', 'origin-content', 'blend-multiply', 'opacity'},
    'ring': {'0', '1', '2', '4', '8', 'inset', 'offset', 'opacity'},
    'ring-offset': {'0', '1', '2', '4', '8'},
    'outline': {'none', 'dashed', 'dotted', 'double', '0', '1', '2', '4', '8', 'offset'},
    'divide': {'x', 'y', 'x-0', 'y-0', 'x-2', 'y-2', 'x-4', 'y-4', 'x-reverse', 'y-reverse', 'solid', 'dashed',
               'dotted', 'double', 'none', 'opacity'},
    'shadow': {'sm', 'md', 'lg', 'xl', '2xl', 'inner', 'none', 'soft', 'medium', 'terracota', 'verde'},
    'fill': {'none'}, 'stroke': {'0', '1', '2', 'none'}, 'accent': {'auto'},
    'decoration': {'solid', 'double', 'dotted', 'dashed', 'wavy', '0', '1', '2', '4', '8', 'auto', 'from-font',
                   'slice', 'clone'},
    'placeholder': {'shown'}, 'caret': set(), 'from': set(), 'via': set(), 'to': set(),
}
for _l in ('border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l'):
    NO_COLOR[_l] = NO_COLOR['border']

# Variantes → (orden, tipo, pseudo). Orden de Tailwind 3.4: estructurales, group/peer, estados, disabled.
VARIANTES = {
    'first': (10, 'pseudo', ':first-child'), 'last': (11, 'pseudo', ':last-child'),
    'odd': (12, 'pseudo', ':nth-child(odd)'), 'even': (13, 'pseudo', ':nth-child(even)'),
    'placeholder': (14, 'elemento', '::placeholder'),
    'group-hover': (20, 'grupo', '.group:hover'), 'group-focus': (21, 'grupo', '.group:focus'),
    'group-focus-within': (22, 'grupo', '.group:focus-within'),
    'peer-checked': (23, 'par', '.peer:checked'), 'peer-focus': (24, 'par', '.peer:focus'),
    'focus-within': (30, 'pseudo', ':focus-within'), 'hover': (31, 'pseudo', ':hover'),
    'focus': (32, 'pseudo', ':focus'), 'focus-visible': (33, 'pseudo', ':focus-visible'),
    'active': (34, 'pseudo', ':active'), 'checked': (35, 'pseudo', ':checked'),
    'disabled': (36, 'pseudo', ':disabled'),
}
PANTALLAS = {'sm': 640, 'md': 768, 'lg': 1024, 'xl': 1280, '2xl': 1536}

# Una clase candidata: [!][variantes:]utilidad-valor[/opacidad]
RX_CLASE = re.compile(
    r'(?<![\w\-:/\[\].#])(!?)((?:[a-z0-9\-]+:)*)'
    r'(border-[xytrbl]|ring-offset|border|divide|ring|outline|bg|text|from|via|to|placeholder|fill|stroke|accent|'
    r'decoration|shadow|caret)-'
    r'(\[[^\]\s\'"`]+\]|[a-z0-9]+(?:-[a-z0-9]+)*)'
    r'(?:/(\d{1,3}|\[[0-9.]+\]))?'
    r'(?![\w\-\[])'
)
RX_LONGITUD = re.compile(r'^\[(-?[0-9.]+(px|rem|em|%|vh|vw|ch)?|length:.*)\]$')


# ---------------------------------------------------------------------------------------------------------------------
# Color
# ---------------------------------------------------------------------------------------------------------------------
def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def mezclar(fg: str, alfa: float, bg: str) -> str:
    f, b = hex_rgb(fg), hex_rgb(bg)
    return '#' + ''.join(f'{round(f[i] * alfa + b[i] * (1 - alfa)):02X}' for i in range(3))


def luminancia(h: str) -> float:
    def canal(c: int) -> float:
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = hex_rgb(h)
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def contraste(a: str, b: str) -> float:
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def rgb_txt(h: str) -> str:
    return '%d %d %d' % hex_rgb(h)


def acento_hex(grupo: str, nivel: int) -> str:
    return ACENTOS[grupo][nivel - 1]


def tinte_hex(grupo: str, clave: str) -> str:
    return mezclar(acento_hex(grupo, 1), ALFA_TINTE[clave], TOKENS['superficie'])


def borde_tinte_hex(grupo: str) -> str:
    return mezclar(acento_hex(grupo, 1), ALFA_BORDE_TINTE, TOKENS['superficie'])


# §8 C6: un fondo sólido que se queda, si con letra blanca da < 4.5, en oscuro baja de tono (misma familia) hasta 4.5.
# Los de la marca sin escala propia van a su equivalente: amarillo → amber, terracota-medio → terracota, verde-suave →
# verde-claro. En claro no cambia nada.
EQUIVALENTE_SOLIDO = {'amarillo': 'amber-500', 'terracota-medio': 'terracota', 'verde-suave': 'verde-claro',
                      'rosa': 'pink-600', 'azul': 'sky-700', 'rojo': 'red-600', 'morado': 'violet-600'}


def solido_legible(nombre: str):
    nombre = EQUIVALENTE_SOLIDO.get(nombre, nombre)
    color = COLORES[nombre]
    fam, shade = descomponer(nombre)
    while contraste('#ffffff', color) < 4.5 and shade.isdigit() and shade != '950':
        shade = SHADES[SHADES.index(shade) + 1]
        nombre = f'{fam}-{shade}'
        color = COLORES[nombre]
    return color


# Valor de destino: ('token', nombre) | ('hex', '#rrggbb') | ('igual', '#rrggbb' o palabra)
def destino_token(nombre: str):
    return ('token', nombre)


def descomponer(valor: str):
    """'gray-200' → ('gray', '200'); 'terracota-dark' → ('terracota', 'dark'); 'amarillo-bg' → ('amarillo', 'bg')."""
    if valor in ESPECIALES or valor in ('white', 'black'):
        return valor, ''
    m = re.match(r'^([a-z]+)-(\d{2,3})$', valor)
    if m:
        return m.group(1), m.group(2)
    if '-' in valor:
        fam, resto = valor.split('-', 1)
        return fam, resto
    return valor, ''


def resolver_nombre(valor: str):
    """Devuelve el nombre de color canónico (clave de COLORES o especial) o None si no es un color conocido."""
    if valor.startswith('['):
        dentro = valor[1:-1]
        if re.match(r'^#[0-9a-fA-F]{3,8}$', dentro):
            return HEX_ARBITRARIOS.get(dentro.lower())
        if dentro.startswith(('rgb', 'rgba', 'hsl')):
            return 'arbitrario:' + dentro
        return None
    if valor in ESPECIALES or valor in COLORES:
        return valor
    return None


def mapear(clase_util: str, nombre: str):
    """Destino en oscuro para (clase de utilidad, color). None = no sé."""
    if nombre in ESPECIALES:
        return ('igual', nombre)
    if nombre.startswith('arbitrario:'):
        return ('igual', nombre)  # rgba() a mano (velos/tooltips oscuros): se queda
    if nombre.startswith('tinte-'):
        _, grupo, clave = nombre.split('-')
        if clase_util in ('borde', 'anillo'):
            return ('hex', borde_tinte_hex(grupo))
        return ('hex', tinte_hex(grupo, clave))
    fam, shade = descomponer(nombre)
    original = COLORES[nombre]

    if clase_util in ('letra', 'placeholder'):
        if nombre == 'white':
            return ('igual', original)
        if nombre == 'black':
            return destino_token('texto')
        if clase_util == 'placeholder':
            return destino_token('texto-4')
        if fam in GRISES:
            n = int(shade)
            if n >= 800:
                return destino_token('texto')
            if n == 700:
                return destino_token('texto-2')
            if n >= 500:
                return destino_token('texto-3')
            if n == 400:
                return destino_token('texto-4')
            return destino_token('tenue')
        if fam == 'verde':
            if shade in ('', 'principal', 'tipografia', 'dark', 'hover'):
                return destino_token('texto')
            return destino_token('texto-3')  # claro, suave
        if fam == 'neutro':
            return destino_token('texto-4')
        if fam in GRUPO:
            grupo = GRUPO[fam]
            if shade in ('dark', 'oscuro') or (shade.isdigit() and int(shade) >= 700):
                return ('token', f'{grupo}-2')
            if shade == 'bg' or (shade.isdigit() and int(shade) <= 200):
                return ('token', f'{grupo}-2')
            return ('token', grupo)
        return None

    if clase_util in ('fondo', 'gradiente'):
        if nombre == 'white':
            return destino_token('superficie')
        if nombre == 'black':
            return ('igual', original)
        if fam in GRISES:
            n = int(shade)
            if n <= 100:
                return destino_token('superficie-2')
            if n == 200:
                return destino_token('superficie-3')
            if n == 300:
                return destino_token('superficie-4')
            legible = solido_legible(nombre)  # 400+: puntos, insignias, bloque de código oscuro
            return ('igual', original) if legible == original else ('hex', legible)
        if fam == 'neutro':
            return destino_token({'light': 'superficie-2', 'crema': 'superficie-3', 'borde': 'superficie-3',
                                  'gris': 'superficie-4', 'beige': 'superficie-4', 'calido': 'superficie-4'}[shade])
        if fam == 'verde':
            legible = solido_legible(nombre)  # botones verdes con letra blanca (verde-suave baja a verde-claro, C6)
            return ('igual', original) if legible == original else ('hex', legible)
        if fam in GRUPO:
            grupo = GRUPO[fam]
            if shade == 'bg':
                return ('hex', tinte_hex(grupo, 'bg'))
            if shade.isdigit() and int(shade) <= 300:
                return ('hex', tinte_hex(grupo, shade))
            legible = solido_legible(nombre)  # sólidos (botones, puntos): se quedan, salvo §8 C6
            return ('igual', original) if legible == original else ('hex', legible)
        return None

    if clase_util in ('borde', 'anillo'):
        if nombre == 'white':
            return destino_token('superficie')
        if nombre == 'black':
            return ('igual', original)
        if fam in GRISES:
            n = int(shade)
            if n <= 200:
                return destino_token('borde')
            if n <= 400:
                return destino_token('borde-fuerte')
            return destino_token('texto-4')
        if fam == 'neutro':
            if shade in ('light', 'crema', 'borde'):
                return destino_token('borde')
            return destino_token('borde-fuerte')
        if fam == 'verde':
            if shade in ('', 'principal', 'tipografia', 'dark', 'hover'):
                return ('token', 'marca')
            return destino_token('borde-fuerte')
        if fam in GRUPO:
            grupo = GRUPO[fam]
            if shade == 'bg' or (shade.isdigit() and int(shade) <= 300):
                return ('hex', borde_tinte_hex(grupo))
            return ('token', grupo)
        return None
    return None


def valor_css(destino, alfa: str | None, var_opacidad: str | None) -> str:
    """Texto CSS del color de destino con su opacidad (/NN fija o la variable de Tailwind)."""
    tipo, v = destino
    if tipo == 'igual' and not v.startswith('#'):
        if v.startswith('arbitrario:'):
            return v.split(':', 1)[1].replace('_', ' ')
        return {'transparent': 'transparent', 'current': 'currentColor', 'inherit': 'inherit'}[v]
    if tipo == 'token':
        comp = f'var(--k2-{v}-rgb)'
    else:
        comp = rgb_txt(v)
    if alfa is not None:
        return f'rgb({comp} / {alfa})'
    if var_opacidad:
        return f'rgb({comp} / var({var_opacidad}, 1))'
    return f'rgb({comp})'


def alfa_de(opacidad: str | None) -> str | None:
    if opacidad is None:
        return None
    if opacidad.startswith('['):
        return opacidad[1:-1]
    n = int(opacidad)
    return ('%g' % (n / 100))


# ---------------------------------------------------------------------------------------------------------------------
# Lectura del árbol
# ---------------------------------------------------------------------------------------------------------------------
def archivos() -> list[str]:
    salida = []
    for origen in ORIGENES:
        ruta = os.path.join(RAIZ, origen)
        if os.path.isfile(ruta):
            salida.append(ruta)
            continue
        for d, subdirs, fs in os.walk(ruta):
            subdirs.sort()
            for f in sorted(fs):
                if f.endswith(('.ts', '.tsx')):
                    salida.append(os.path.join(d, f))
    return sorted(salida)


class Clase:
    __slots__ = ('texto', 'importante', 'variantes', 'util', 'valor', 'opacidad', 'nombre')

    def __init__(self, texto, importante, variantes, util, valor, opacidad, nombre):
        self.texto, self.importante, self.variantes = texto, importante, variantes
        self.util, self.valor, self.opacidad, self.nombre = util, valor, opacidad, nombre


def escanear():
    """→ (Counter de clases de color, {clase: Clase}, {texto: motivo} de las que no sabe mapear)."""
    conteo: Counter = Counter()
    clases: dict[str, Clase] = {}
    sin_mapear: dict[str, str] = {}
    for ruta in archivos():
        with open(ruta, encoding='utf-8') as fh:
            fuente = fh.read()
        for m in RX_CLASE.finditer(fuente):
            imp, pref, util, valor, opa = m.groups()
            if valor in NO_COLOR.get(util, ()) or RX_LONGITUD.match(valor):
                continue
            if util == 'border' and re.match(r'^[xytrbl](-\d+)?$', valor):
                continue  # border-b, border-l-4…
            if util in ('ring', 'outline', 'ring-offset', 'divide', 'stroke', 'decoration') and re.match(r'^\d', valor):
                continue
            if util in ('from', 'via', 'to') and re.match(r'^\d+%$', valor):
                continue
            if re.match(r'^(gradient-|opacity-\d)', valor):
                continue  # bg-gradient-to-r, bg-opacity-50, ring-opacity-…: no son color
            if util == 'shadow' and valor in NO_COLOR['shadow']:
                continue
            texto = m.group(0)
            variantes = tuple(v for v in pref.split(':') if v)
            nombre = resolver_nombre(valor)
            if nombre is None:
                # ¿Parece color? Si el primer tramo es una familia conocida, es una clase que no existe o no conozco.
                sin_mapear[texto] = f'«{valor}» no es un color conocido'
                conteo[texto] += 1
                continue
            malas = [v for v in variantes if v not in VARIANTES and v not in PANTALLAS]
            if malas:
                sin_mapear[texto] = f'variante desconocida: {", ".join(malas)}'
                conteo[texto] += 1
                continue
            clase_util = UTILIDADES[util][2]
            if variantes and variantes[-1] == 'placeholder' and util == 'text':
                clase_util = 'placeholder'
            if mapear(clase_util, nombre) is None:
                sin_mapear[texto] = f'sin regla para {util} + {nombre}'
            conteo[texto] += 1
            clases[texto] = Clase(texto, bool(imp), variantes, util, valor, opa, nombre)
    for t in sin_mapear:
        clases.pop(t, None)
    return conteo, clases, sin_mapear


# ---------------------------------------------------------------------------------------------------------------------
# CSS
# ---------------------------------------------------------------------------------------------------------------------
def escapar(clase: str) -> str:
    salida = []
    for i, c in enumerate(clase):
        if c.isascii() and (c.isalnum() or c in '-_'):
            if i == 0 and c.isdigit():
                salida.append('\\3%s ' % c)
            else:
                salida.append(c)
        else:
            salida.append('\\' + c)
    return ''.join(salida)


def selector(c: Clase) -> str:
    base = '.' + escapar(c.texto)
    ancestro = ''
    pseudos = ''
    elemento = ''
    for v in c.variantes:
        if v in PANTALLAS:
            continue
        _, tipo, ps = VARIANTES[v]
        if tipo == 'pseudo':
            pseudos += ps
        elif tipo == 'grupo':
            ancestro = ps + ' '
        elif tipo == 'par':
            ancestro = ps + ' ~ '
        elif tipo == 'elemento':
            elemento = ps
    if c.util == 'placeholder':
        elemento = '::placeholder'
    sufijo_hijo = ''
    if c.util == 'divide':
        # .divide-gray-200 > :not([hidden]) ~ :not([hidden])
        return f'{ATRIBUTO} {ancestro}{base}{pseudos}{FUERA_CLARO} > :not([hidden]) ~ :not([hidden]){FUERA_CLARO}'
    return f'{ATRIBUTO} {ancestro}{base}{pseudos}{FUERA_CLARO}{elemento}{sufijo_hijo}'


def declaraciones(c: Clase) -> list[str]:
    prop, var_op, clase_util = UTILIDADES[c.util]
    if c.variantes and c.variantes[-1] == 'placeholder' and c.util == 'text':
        clase_util = 'placeholder'
        var_op = '--tw-placeholder-opacity'
    destino = mapear(clase_util, c.nombre)
    alfa = alfa_de(c.opacidad)
    if clase_util in ('fondo', 'gradiente') and alfa is not None and not c.nombre.startswith(('tinte-', 'arbitrario:')) \
            and c.nombre not in ESPECIALES:
        # bg-terracota/10, bg-verde/5, bg-rojo/20…: en claro es un velo del color de marca sobre blanco; en oscuro el
        # mismo velo se hace con el acento claro del token (con el sólido original casi no se ve sobre la superficie).
        fam, shade = descomponer(c.nombre)
        solido = shade in ('', 'principal', 'dark', 'oscuro', 'medio', 'hover') or (shade.isdigit() and int(shade) >= 400)
        if fam == 'verde' and shade in ('', 'principal', 'dark', 'hover'):
            destino = ('token', 'marca')
        elif fam in GRUPO and solido:
            destino = ('token', GRUPO[fam])
    if c.util == 'bg' and alfa is not None and float(alfa) < 0.35 and c.nombre in ('white', 'black'):
        # Velos finos: blanco/15 sobre un encabezado de color se queda; negro/5 (hover que oscurece) en oscuro se ve
        # como nada, así que se vuelve blanco con el mismo alfa (el hover sigue notándose).
        destino = ('igual', '#ffffff')
    imp = ' !important' if c.importante else ''
    if prop.startswith('gradiente'):
        color = valor_css(destino, alfa, None)
        transparente = valor_css(destino, '0', None) if destino[0] != 'igual' or destino[1].startswith('#') else 'transparent'
        if prop == 'gradiente-from':
            return [f'--tw-gradient-from: {color} var(--tw-gradient-from-position){imp}',
                    f'--tw-gradient-to: {transparente} var(--tw-gradient-to-position){imp}',
                    f'--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to){imp}']
        if prop == 'gradiente-via':
            return [f'--tw-gradient-to: {transparente} var(--tw-gradient-to-position){imp}',
                    f'--tw-gradient-stops: var(--tw-gradient-from), {color} var(--tw-gradient-via-position), '
                    f'var(--tw-gradient-to){imp}']
        return [f'--tw-gradient-to: {color} var(--tw-gradient-to-position){imp}']
    color = valor_css(destino, alfa, var_op)
    if c.util == 'shadow':
        return [f'--tw-shadow-color: {color}{imp}', f'--tw-shadow: var(--tw-shadow-colored){imp}']
    return [f'{p}: {color}{imp}' for p in prop.split('|')]


def clave_orden(c: Clase):
    pantalla = max((PANTALLAS[v] for v in c.variantes if v in PANTALLAS), default=0)
    rango_var = tuple(sorted(VARIANTES[v][0] for v in c.variantes if v in VARIANTES))
    return (pantalla, rango_var, ORDEN_UTIL[c.util], c.texto)


def bloque_tokens() -> list[str]:
    lineas = [f'  {ATRIBUTO} {{', '    color-scheme: dark;']
    todos = dict(TOKENS)
    for grupo, (n1, n2) in ACENTOS.items():
        todos[grupo] = n1
        todos[f'{grupo}-2'] = n2
    for nombre, valor in todos.items():
        lineas.append(f'    --k2-{nombre}: {valor};')
        lineas.append(f'    --k2-{nombre}-rgb: {rgb_txt(valor)};')
    lineas.append('  }')
    return lineas


def bloque_base() -> list[str]:
    """Reglas de elemento (K2-CONTRATO §8 C2). Especificidad por debajo de cualquier regla de clase (0,2,1)."""
    w = f':where({ATRIBUTO})'
    return [
        '  /* Base (§8 C2): todo por debajo de las reglas de clase. body le gana a su propia clase bg-neutro-crema. */',
        f'  {ATRIBUTO} body:not(.k2-claro) {{ background-color: var(--k2-fondo); color: var(--k2-texto); }}',
        f'  {w} body *{FUERA_CLARO}, {w} body ::before, {w} body ::after {{ border-color: var(--k2-borde); }}',
        f'  {w} body :is(h1, h2, h3, h4, h5, h6){FUERA_CLARO} {{ color: var(--k2-texto); }}',  # 0,0,2 > globals h1 (0,0,1)
        f'  {w} body a{FUERA_CLARO} {{ color: var(--k2-terracota); }}',
        f'  {w} body a:hover{FUERA_CLARO} {{ color: var(--k2-terracota-2); }}',
        f'  {w} body :where(input:not([type="checkbox"], [type="radio"], [type="range"], [type="color"], '
        f'[type="file"], [type="button"], [type="submit"], [type="reset"]), select, textarea){FUERA_CLARO} '
        '{ background-color: var(--k2-superficie); border-color: var(--k2-borde-fuerte); }',
        f'  {w} body :is(input, textarea){FUERA_CLARO}::placeholder {{ color: var(--k2-texto-4); }}',  # > preflight (0,0,2)
        f'  {w} body :where(option, optgroup) {{ background-color: var(--k2-superficie); color: var(--k2-texto); }}',
        f'  {w} body hr{FUERA_CLARO} {{ border-color: var(--k2-borde); }}',
        # K2B (R15 F1): el preflight de Tailwind (globals.css) deja los botones transparentes; si un instante esa hoja no
        # está y esta sí (23-oct, /admin/empleados: «Buscar» #a2afa8 sobre #6b6b6b), Chrome los pinta ButtonFace oscuro.
        # Esta hoja repite lo mismo para no depender de la otra. (0,0,1): cualquier clase bg-* le gana.
        f'  {w} body :where(button, [type="button"], [type="reset"], [type="submit"]){FUERA_CLARO} '
        '{ background-color: transparent; background-image: none; }',
    ]


def bloque_fondo_pagina(clases: dict[str, Clase]) -> list[str]:
    """§8 C3: el contenedor de página (min-h-screen + gris/neutro claro) es --k2-fondo, no un pozo dentro de tarjeta."""
    lineas = []
    for nombre in ('bg-gray-50', 'bg-neutro-light', 'bg-neutro-crema'):
        if nombre in clases:
            lineas.append(f'  {ATRIBUTO} .min-h-screen.{escapar(nombre)}{FUERA_CLARO} '
                          '{ background-color: rgb(var(--k2-fondo-rgb) / var(--tw-bg-opacity, 1)); }')
    if lineas:
        lineas.insert(0, '  /* §8 C3: contenedor de página (min-h-screen) = fondo. Va después de su clase suelta. */')
    return lineas


def generar(clases: dict[str, Clase]) -> str:
    orden = sorted(clases.values(), key=clave_orden)
    base, pantallas = [], {}
    for c in orden:
        regla = f'{selector(c)} {{ {"; ".join(declaraciones(c))}; }}'
        p = max((PANTALLAS[v] for v in c.variantes if v in PANTALLAS), default=0)
        if p:
            pantallas.setdefault(p, []).append(regla)
        else:
            base.append(regla)
    lineas = [
        '/* K2 (R11, DR77): modo oscuro del panel /admin.',
        '   ARCHIVO GENERADO por scripts/k2-generar-tema.py: no editar a mano.',
        '   Regenerar: python3 scripts/k2-generar-tema.py  ·  comprobar: python3 scripts/k2-generar-tema.py --revisar',
        '   Solo aplica con html[data-tema-admin="oscuro"] y en pantalla; nunca dentro de .k2-claro. */',
        '@media screen {',
    ]
    lineas += bloque_tokens()
    lineas += bloque_base()
    lineas.append(f'  /* Clases de color del panel ({len(clases)}): base y variantes de estado. */')
    lineas += ['  ' + r for r in base]
    lineas += bloque_fondo_pagina(clases)
    for p in sorted(pantallas):
        lineas.append(f'  @media (min-width: {p}px) {{')
        lineas += ['    ' + r for r in pantallas[p]]
        lineas.append('  }')
    lineas.append('}')
    return '\n'.join(lineas) + '\n'


# ---------------------------------------------------------------------------------------------------------------------
# Paleta (informe de contraste de los tokens)
# ---------------------------------------------------------------------------------------------------------------------
def informe_paleta() -> str:
    fondos = {k: TOKENS[k] for k in ('fondo', 'superficie', 'superficie-2', 'superficie-3')}
    textos = {k: TOKENS[k] for k in ('texto', 'texto-2', 'texto-3', 'texto-4', 'tenue')}
    for g, (a, b) in ACENTOS.items():
        textos[g] = a
        textos[g + '-2'] = b
    filas = ['| token | valor | ' + ' | '.join(fondos) + ' | tinte propio: 200 · -bg + acento/10 |', '|---|---|' + '---|' * (len(fondos) + 1)]
    for k, v in textos.items():
        celdas = [f'{contraste(v, f):.2f}' for f in fondos.values()]
        grupo = k[:-2] if k.endswith('-2') else k
        propio = ''
        if grupo in ACENTOS:
            apilado = mezclar(acento_hex(grupo, 1), 0.1, tinte_hex(grupo, 'bg'))
            propio = f'{contraste(v, tinte_hex(grupo, "200")):.2f} (200) · {contraste(v, apilado):.2f} (apilado)'
        filas.append(f'| {k} | {v} | ' + ' | '.join(celdas) + f' | {propio} |')
    blanco = '#ffffff'
    filas.append('')
    filas.append('Blanco sobre sólidos en oscuro (§8 C6): ' + ', '.join(
        f'{n} {contraste(blanco, solido_legible(n)):.2f}' for n in ('verde', 'terracota', 'verde-claro', 'green-500',
                                                                    'green-600', 'red-500', 'amber-600', 'orange-600',
                                                                    'amarillo', 'terracota-medio', 'verde-suave')))
    return '\n'.join(filas)


def main(argv: list[str]) -> int:
    conteo, clases, sin_mapear = escanear()
    if '--paleta' in argv:
        print(informe_paleta())
        return 0
    css = generar(clases)
    ruta = os.path.join(RAIZ, SALIDA)
    if '--inventario' in argv:
        for texto, n in sorted(conteo.items(), key=lambda x: (-x[1], x[0])):
            marca = '  SIN MAPEAR: ' + sin_mapear[texto] if texto in sin_mapear else ''
            print(f'{n:6d}  {texto}{marca}')
        print(f'archivos: {len(archivos())} · clases de color: {len(conteo)} · usos: {sum(conteo.values())} · '
              f'mapeadas: {len(clases)} · sin mapear: {len(sin_mapear)}')
        return 1 if sin_mapear else 0
    if '--revisar' in argv:
        try:
            with open(ruta, encoding='utf-8') as fh:
                actual = fh.read()
        except FileNotFoundError:
            actual = ''
        if actual != css or sin_mapear:
            print(f'{SALIDA} no coincide con lo que generaría el script (o hay clases sin mapear: {len(sin_mapear)}).'
                  ' Regenera con: python3 scripts/k2-generar-tema.py', file=sys.stderr)
            return 1
        print(f'{SALIDA} al día ({len(clases)} clases).')
        return 0
    if sin_mapear:
        for t, motivo in sorted(sin_mapear.items()):
            print(f'SIN MAPEAR: {t} — {motivo}', file=sys.stderr)
    with open(ruta, 'w', encoding='utf-8') as fh:
        fh.write(css)
    print(f'{SALIDA}: {len(css)} bytes, {len(clases)} clases, {css.count("{") - css.count("@media")} reglas'
          + (f', {len(sin_mapear)} SIN MAPEAR' if sin_mapear else ''))
    return 1 if sin_mapear else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
