import Contenedor from '@/components/sitio-nuevo/ui/Contenedor'
import Etiqueta from '@/components/sitio-nuevo/ui/Etiqueta'
import Seccion from '@/components/sitio-nuevo/ui/Seccion'
import Titulo from '@/components/sitio-nuevo/ui/Titulo'
import { ENLACE_MI_CUENTA } from '@/components/sitio-nuevo/armazon/enlaces'
import { TEXTO_BIENVENIDO } from './textos'

// R15 v2 · F6 (cuenta, sesión 64): la franja de arriba de Mi cuenta = `.simple-hero` de la maqueta (las mismas clases que
// `carrito/Encabezado.tsx`: fondo cream con filete abajo, relleno 80/60 → 56/40 hasta 860 px, contenido de 1100 px, título serif terra de
// `sn-hero`, que en cream pasa como texto grande). Lleva el eyebrow «Mi cuenta» (`.simple-hero-eyebrow`, 18 px abajo) en ink: terra no pasa
// en cream como texto chico (CONTRATO-BASE-F1 §2.2). Sin subtítulo y sin marca (D-F6-11 P-5).
//
// El único <h1> de las páginas de Mi cuenta (D-F6-08 P-1): «Bienvenido, {nombre}», el saludo de hoy (D-F6-11 P-5). Mientras no se sabe el
// nombre (también en el HTML del servidor, D-F6-10 P-5), un bloque gris en su lugar, sin texto.

export type OrigenNombre = 'me' | 'sesion' | 'ninguno' | 'cargando'

type Props = {
  nombre: string | null
  origen: OrigenNombre
}

export default function EncabezadoCuenta({ nombre, origen }: Props) {
  return (
    <Seccion
      as="div"
      fondo="cream"
      borde="abajo"
      espacio="ninguno"
      testId="sn-mi-cuenta-encabezado"
      className="pb-10 pt-sn-seccion-movil min-[861px]:pb-[60px] min-[861px]:pt-sn-seccion"
    >
      <Contenedor ancho="angosto">
        <Etiqueta tamano="eyebrow" tono="ink" testId="sn-mi-cuenta-encabezado-etiqueta" className="mb-[18px]">
          {ENLACE_MI_CUENTA.texto}
        </Etiqueta>
        <Titulo nivel={1} tamano="hero" tono="terra" testId="sn-mi-cuenta-encabezado-titulo" className="max-w-sn-titulo [overflow-wrap:anywhere] [text-wrap:balance]">
          {TEXTO_BIENVENIDO}{' '}
          <span data-nombre-de={origen}>
            {nombre === null ? (
              <span aria-hidden="true" className="inline-block h-[0.8em] w-[5ch] rounded-sn-boton bg-sn-ink/10 align-baseline" />
            ) : (
              nombre
            )}
          </span>
        </Titulo>
      </Contenedor>
    </Seccion>
  )
}
