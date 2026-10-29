import localFont from 'next/font/local'

// R15 · F1 v2 (contrato v2 §9 C14 y C15; cadena-v2/f1/CONTRATO-BASE-F1.md §1): las letras libres del sitio nuevo, servidas desde el
// propio sitio. Archivos oficiales sin modificar, con su OFL y su origen en fuentes/FUENTES.md.
//
// SOLO lo importa src/app/nuevo/layout.tsx: next/font arma el @font-face y las precargas para las páginas que usan este módulo, así
// que las páginas de hoy no descargan nada nuevo. Ningún componente de ui/** importa este archivo (usan las clases font-sn-*).

const titulos = localFont({
  src: [
    { path: './fuentes/DMSerifDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/DMSerifDisplay-Italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--sn-fuente-titulos',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

const texto = localFont({
  src: [{ path: './fuentes/InterVariable.woff2', weight: '100 900', style: 'normal' }],
  variable: '--sn-fuente-texto',
  display: 'swap',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
})

const mono = localFont({
  src: [
    { path: './fuentes/DMMono-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fuentes/DMMono-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--sn-fuente-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'monospace'],
  adjustFontFallback: false,
})

/**
 * Va en el envoltorio `[data-sitio-nuevo]` de src/app/nuevo/layout.tsx (y en ningún otro lado).
 *
 * Define las tres variables de las letras y además redefine `--font-body` y `--font-heading`: globals.css le pone la letra de hoy
 * DIRECTO a `p, span, div, li, a, button, input, textarea, label` con `var(--font-body)` y a `h1…h6` con `var(--font-heading)`, así que
 * dentro del envoltorio esas reglas resuelven a Inter y a DM Serif Display sin tocar globals.css (C15). Fuera, nada cambia.
 */
export const clasesFuentesSitioNuevo = [
  titulos.variable,
  texto.variable,
  mono.variable,
  '[--font-body:var(--sn-fuente-texto)]',
  '[--font-heading:var(--sn-fuente-titulos)]',
].join(' ')
