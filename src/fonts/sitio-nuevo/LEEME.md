# Letras del sitio nuevo (R15 · F1 · WF1, DR62 · contrato §9 C16)

Las cargan `next/font/local` **solo** en `src/app/nuevo/layout.tsx` (producción no las descarga) y se exponen como tres
variables CSS. Cambiar a Cahuenga y Akkurat, si Arca Tierra las compra, es cambiar los archivos de estas tres variables
en ese layout; las clases (`font-sn-titulos`, `font-sn-texto`, `font-sn-mono`) no cambian.

| Variable | Letra | Archivos | Uso (como la maqueta) |
|---|---|---|---|
| `--sn-fuente-titulos` | DM Serif Display 400 (normal e itálica) | `DMSerifDisplay-Regular.woff2`, `DMSerifDisplay-Italic.woff2` | títulos (en la maqueta, Cahuenga) |
| `--sn-fuente-texto` | Inter variable (peso 100–900) | `InterVariable.woff2` | texto (en la maqueta, Akkurat) |
| `--sn-fuente-mono` | DM Mono 300, 400 y 500 | `DMMono-Light.woff2`, `DMMono-Regular.woff2`, `DMMono-Medium.woff2` | cifras y etiquetas |

## De dónde salen

Repositorio oficial de Google Fonts, `https://github.com/google/fonts` (rama `main`), bajados el 28-oct-2026 (UTC):

| Original | md5 |
|---|---|
| `ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf` | `2312ec57b28b87679088d5349fc21b4c` |
| `ofl/dmserifdisplay/DMSerifDisplay-Italic.ttf` | `2cfd6017cc5c64e6c7c7732145ebe2a2` |
| `ofl/inter/Inter[opsz,wght].ttf` | `bff0f6e3b9e2259a28313168a907054f` |
| `ofl/dmmono/DMMono-Light.ttf` | `4423a104b8e2bd6afcea6929ffaea5af` |
| `ofl/dmmono/DMMono-Regular.ttf` | `be05f4d4a10e657d6732fff8cb84dcd5` |
| `ofl/dmmono/DMMono-Medium.ttf` | `81c99e3b388a6ff9b9598913a8e81708` |

Se pasaron a woff2 con fontTools 4.63 dejando el latín completo (U+0020–007E, U+00A0–024F), la puntuación general
(U+2000–206F), las flechas (U+2190–2199) y € ™ − ★ ✓ ✕ cuando la letra los trae; a Inter se le fijó el tamaño óptico
en 14 (queda el eje de peso). DM Serif Display y DM Mono no traen «→»: el navegador lo toma de la siguiente letra de la
pila. DM Mono solo existe hasta 500: los 600/700 de la maqueta salen con 500.

## Licencia

Las tres son **SIL Open Font License 1.1** (`OFL-DMSerifDisplay.txt`, `OFL-Inter.txt`, `OFL-DMMono.txt`, copiados del
mismo repositorio). Se pueden usar, incrustar y redistribuir con el sitio; no se venden solas. La única con nombre
reservado es DM Serif Display («Source», de Adobe), que no es su nombre: la versión recortada puede seguir llamándose así.
