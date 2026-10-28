// R15 · F2 (WF2, sesión 55): el VALOR de una cifra publicada (contenido_sitio › cifras) dentro de una frase: «17 años…»,
// «más de 60+ familias…». Sin publicar → la marca en su lugar (C9: ninguna cifra se escribe a mano). Componente de servidor.
// testid `sn-cifra-linea-<clave>` con `data-publicada="1|0"`. La cifra en bloque (valor + descripción) es <Cifra> de F1.
import type { DatosCifra } from '@/types/contenido-sitio'
import Falta from '../Falta'

export default function CifraEnLinea({ clave, cifras }: { clave: string; cifras: Record<string, DatosCifra> }) {
  const cifra = cifras[clave]
  if (!cifra) {
    return (
      <span data-testid={`sn-cifra-linea-${clave}`} data-publicada="0">
        <Falta que={`cifra «${clave}»`} quien="Lucio y Pablo" />
      </span>
    )
  }
  return (
    <span data-testid={`sn-cifra-linea-${clave}`} data-publicada="1">
      {cifra.valor}
    </span>
  )
}
