# Letras del sitio nuevo (R15 · F1 v2 · WF1)

Contrato v2 §9 C14 y C15; `cadena-v2/f1/CONTRATO-BASE-F1.md` §1. Las carga `next/font/local` **solo** en `../fuentes.ts`, y la clase que
exporta (`clasesFuentesSitioNuevo`) va **solo** en el envoltorio de `src/app/nuevo/layout.tsx`: las páginas de hoy no las descargan.
Archivos **oficiales sin modificar**: sin recortar (subset), sin fijar ejes, sin cambiar nombres. Bajados el 29-oct-2026 entre las 11:57 y
las 11:59 UTC.

| Archivo servido | Bytes | sha256 del servido | Original | sha256 del original |
|---|---|---|---|---|
| `InterVariable.woff2` | 352,240 | `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3` | el mismo archivo, `web/InterVariable.woff2` de `Inter-4.1.zip` | zip: `9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e` |
| `DMSerifDisplay-Regular.woff2` | 34,508 | `af094602973f383959c72d745d2b4d9b9f8b3653230dd8836acae41145f4b91e` | `ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf` (76,580 B) | `8cc3643535edf039aa5d95440a8542735e9197e4f4b8d9303e980fefbf5ab616` |
| `DMSerifDisplay-Italic.woff2` | 33,384 | `b3e0692a3c1f913d89d2dcf1466bcc8398a3cb0f88471e24fec26fb8e29eea5b` | `ofl/dmserifdisplay/DMSerifDisplay-Italic.ttf` (71,208 B) | `df74c0ac387baeaeb0fe4f2324e1668e6a3ed8c09cd9796fe162c71753e19e45` |
| `DMMono-Regular.woff2` | 23,324 | `ed55e96b69a5266d611d4c8e27d72d30e464beab80d868bc5ca0b81f36fb7993` | `ofl/dmmono/DMMono-Regular.ttf` (49,744 B) | `55b4c98f123daebb3ed27947ba47b2af00554fc6284d639a540bcef5e6258ad2` |
| `DMMono-Medium.woff2` | 23,516 | `072434dbbbcaadf5e52b750bf1e6ff31e8e33fb1fb8dc325601654c10635221d` | `ofl/dmmono/DMMono-Medium.ttf` (50,360 B) | `fd327daf461db87b44a87def475d251bf03b997f7c07d9680592d75dbbfaad0b` |
| `OFL-Inter.txt` | 4,380 | `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a` | `LICENSE.txt` de `Inter-4.1.zip` | (el mismo) |
| `OFL-DMSerifDisplay.txt` | 4,605 | `a3e5cdd67d4571dd0a24fcc968de0efde7ae97ef752daf0906e4767619dd7231` | `ofl/dmserifdisplay/OFL.txt` | (el mismo) |
| `OFL-DMMono.txt` | 4,484 | `2bada5ea45c3c63b7f1ea1f88ce9672c9e4f0c42b2c3b7378949084fe55a3066` | `ofl/dmmono/OFL.txt` | (el mismo) |

## De dónde salen (origen fijo)

- **Inter 4.1** — release oficial del proyecto: `https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip` (etiqueta `v4.1` →
  commit `e3a3d4c57d5ecc01453a575621882a384c1995a3`; 33,707,794 bytes; GitHub no publica digest de ese archivo). Comprobado: las 38 woff2 de
  `web/` del zip son idénticas (sha de blob de git) a `docs/font-files/` del repo en esa etiqueta. Inter publica woff2: se sirve tal cual.
- **DM Serif Display y DM Mono** — sus repositorios de origen (`googlefonts/dm-fonts`, `googlefonts/dm-mono`) están archivados; la
  distribución vigente es Google Fonts: `https://github.com/google/fonts`, commit `58466038e19d5a14053e0c9f863715e74af0fe0e` (rama `main`,
  29-oct-2026 09:12 UTC), carpetas `ofl/dmserifdisplay/` y `ofl/dmmono/` (sus `METADATA.pb` apuntan a `googlefonts/dm-fonts@027cea4e…` y
  `googlefonts/dm-mono@57fadabf…`). Los archivos bajados coinciden con el sha de blob de ese commit. Ahí solo hay TTF.

## TTF → WOFF2 sin crear una «versión modificada»

- **OFL-FAQ 2.2.1** (`https://openfontlicense.org/ofl-faq/`, leída el 29-oct): «You are allowed to create, use and distribute a WOFF version
  of an OFL font without changing the font name, but only if the original font data remains unchanged except for WOFF compression, and
  WOFF-specific metadata is either omitted altogether or present and includes, unaltered, the contents of all equivalent metadata in the
  original font.»
- **Cómo:** `fontTools` 4.63.0, `woff2.compress(ttf, woff2, transform_tables=set())`: **ninguna tabla transformada** y sin bloque de
  metadatos ni de datos privados.
- **Verificado tabla por tabla** contra el TTF oficial (`ttf-a-woff2.py --verificar`): 16 tablas idénticas en bytes (`glyf`, `name`, `cmap`…).
  Solo cambia lo que la norma WOFF2 obliga a todo codificador (W3C WOFF 2.0, §5: «the compliant WOFF2 encoder MUST remove the DSIG table» y
  «MUST also set bit 11 of the 'flags' field of the head table»): se quita `DSIG`, que en estos originales es un sello vacío de 8 bytes con
  **0 firmas**, y en `head` se prende el bit 11 (con lo que cambia `checkSumAdjustment`).
- Controles negativos (ROJO): un TTF con `name` alterado y una compresión con la transformación por omisión de `glyf`/`loca` dan «MALO».
- Guion y salida: `~/vps-stack/_archivo/r15-cadena-v2/f1-base/scripts/ttf-a-woff2.py` y `medidas/conversion-woff2.txt`.

## Licencias

Las tres son **SIL Open Font License 1.1** (`OFL-*.txt`, copiadas sin cambios del mismo origen). Nombres reservados: DM Serif Display
reserva «Source» (de Adobe), que no es su nombre; Inter y DM Mono no reservan ninguno. Se pueden usar, incrustar y redistribuir con el sitio;
no se venden solas.

## Qué pesos y por qué (medido en la maqueta; C36, 13:20 UTC: solo pesos que existen, sin engrosado ni itálica sintéticos)

Elegir qué pesos se sirven no es un subconjunto: cada archivo que se sirve va con todos sus glifos.

- DM Serif Display 400 normal e itálica. La maqueta pide también 500 y 700: aquí salen en 400 (los componentes ponen `font-normal`).
- Inter variable 100–900, **sin itálica**. La maqueta tiene 4 usos de itálica de 300, pero ninguna pieza de F1 la usa, así que no se sirve
  `InterVariable-Italic.woff2`. Si una fase la necesita, se sirve la oficial de la misma v4.1 (misma etiqueta y commit de arriba).
- DM Mono 400 y 500. La maqueta pide 600 y 700 (eyebrows, resultado del validador): aquí salen en 500. Sin Light ni itálicas.
- Medido en Chrome (`probar-base.mjs`, B14; la tinta de la misma palabra en un canvas): DM Serif 400/500/600/700 = 5460 · 5460 · 7080 · 7080 px
  y DM Mono = 4030 · 4980 · 6440 · 6440. Desde 600 el navegador engruesa de forma sintética; 500 sobre una letra que solo trae 400 sale en 400.
