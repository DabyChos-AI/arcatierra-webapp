// R15 · F0 (sesión 53, 28-oct-2026): la marca «FALTA · qué · quién» del sitio nuevo (R15-CONTRATO §4).
//
// Regla de David: no se inventa nada. Donde falta un dato, una foto o una sección, va esta marca y nunca un dato supuesto.
// Solo se usa dentro de src/app/nuevo/** y de los componentes del sitio nuevo: producción no la pinta nunca (qa cuenta
// 0 [data-falta] en las páginas de producción). El conteo y la lista los saca ~/arcatierra-qa/r15-faltantes.mjs.
//
// Componente de servidor (sin 'use client'). Colores fijos, no dependen del tema: letra #C00000 sobre #FFF200 (contraste 5.6).
// Van en `style` en línea, no en clases: una clase que no existe no da error y deja la marca sin color.

/** Quién tiene que mandar lo que falta. Tipo cerrado: un «quién» nuevo se agrega aquí, no se escribe suelto. Las Sofías son
 *  «Encargadas de Experiencias», nunca «las dueñas». */
export type QuienFalta =
  | 'Lucio y Pablo'
  | 'Encargadas de Experiencias'
  | 'Diseñadora'
  | 'David'
  | 'Quien administra su dominio'

type Props = {
  /** Qué falta, en palabras de negocio («cifra de familias», «fotos de la portada»). */
  que: string
  quien: QuienFalta
  /** 'texto' (por omisión) va en línea dentro de un párrafo; 'bloque' ocupa el ancho de su contenedor (una foto, una sección). */
  como?: 'texto' | 'bloque'
}

const LETRA = '#C00000'
const FONDO = '#FFF200'

const ESTILO_TEXTO: React.CSSProperties = {
  color: LETRA,
  backgroundColor: FONDO,
  fontWeight: 700,
  padding: '0.05em 0.35em',
  borderRadius: '0.2em',
  overflowWrap: 'anywhere',
  boxDecorationBreak: 'clone',
  WebkitBoxDecorationBreak: 'clone',
}

const ESTILO_BLOQUE: React.CSSProperties = {
  color: LETRA,
  backgroundColor: FONDO,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  width: '100%',
  minHeight: '12rem',
  padding: '1.5rem',
  boxSizing: 'border-box',
  border: `2px dashed ${LETRA}`,
  borderRadius: '0.5rem',
  overflowWrap: 'anywhere',
}

export default function Falta({ que, quien, como = 'texto' }: Props) {
  return (
    <mark
      data-falta=""
      data-falta-que={que}
      data-falta-quien={quien}
      data-falta-como={como}
      style={como === 'bloque' ? ESTILO_BLOQUE : ESTILO_TEXTO}
    >
      {`FALTA · ${que} · ${quien}`}
    </mark>
  )
}
