'use client'

// R15 v2 · F1: el popup de anuncio del sitio nuevo (maqueta `#arca-popup`). Contrato v2 §9 C22, C24, C32, C34.
// - Cuándo sale, como la maqueta: solo en la portada (useSelectedLayoutSegments() vacío, igual en servidor y navegador), una vez por
//   sesión, 400 ms después de que la persona recorre el 20 % de la página (scrollY / (scrollHeight − innerHeight)).
// - Su texto, foto y vigencia no existen en ningún lado (pregunta C46): una marca en bloque a nombre de Lucio y Pablo, sin botón de acción
//   (su destino depende de lo que anuncie). Lleva el boletín de hoy con `origen: 'popup'` (DR71): la MISMA llamada, casilla y trampa,
//   con la variante para fondo claro (C34).
// - La ventana es el `Dialogo` de base (ui/Dialogo.tsx): cerrado no está en el DOM (C32); abierto, diálogo «Anuncio» con foco atrapado,
//   Escape, el velo y el ✕ («Cerrar») lo cierran, y el foco regresa. Se abre después de hidratar: el HTML del servidor no lo trae.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelectedLayoutSegments } from 'next/navigation'
import NewsletterForm from '@/components/layout/NewsletterForm'
import Dialogo from '@/components/sitio-nuevo/ui/Dialogo'
import Falta from '@/components/sitio-nuevo/Falta'
import { E } from './estilos'

/** Llave de sessionStorage: si existe, el popup ya salió en esta sesión (las pruebas de qa la ponen para apagarlo). */
export const CLAVE_ANUNCIO_VISTO = 'snAnuncioVisto'

/** Lo que el popup recuerda de la sesión. Con el almacenamiento bloqueado no recuerda nada: sale una vez por carga. */
const sesion = {
  yaSalio(): boolean {
    try {
      return window.sessionStorage.getItem(CLAVE_ANUNCIO_VISTO) !== null
    } catch {
      return false
    }
  },
  anotar(): void {
    try {
      window.sessionStorage.setItem(CLAVE_ANUNCIO_VISTO, '1')
    } catch {
      /* bloqueado: no pasa nada */
    }
  },
}

/**
 * Llama `alLlegar` una vez, `espera` ms después de que la página se recorre hasta `fraccion` (un cálculo por cuadro, no por evento).
 * Mientras `activo` sea falso no escucha nada; al apagarse o desmontarse se cancela lo pendiente.
 */
function useAlRecorrer(fraccion: number, espera: number, activo: boolean, alLlegar: () => void): void {
  const llegar = useRef(alLlegar)
  useEffect(() => {
    llegar.current = alLlegar
  })

  useEffect(() => {
    if (!activo) return
    let cuadro = 0
    let reloj: number | undefined
    const medir = () => {
      cuadro = 0
      const recorrido = document.documentElement.scrollHeight - window.innerHeight
      if (recorrido <= 0 || window.scrollY / recorrido < fraccion) return
      window.removeEventListener('scroll', pedirCuadro)
      reloj = window.setTimeout(() => llegar.current(), espera)
    }
    const pedirCuadro = () => {
      if (cuadro === 0) cuadro = window.requestAnimationFrame(medir)
    }
    window.addEventListener('scroll', pedirCuadro, { passive: true })
    pedirCuadro()
    return () => {
      window.removeEventListener('scroll', pedirCuadro)
      window.cancelAnimationFrame(cuadro)
      window.clearTimeout(reloj)
    }
  }, [fraccion, espera, activo])
}

export default function Anuncio() {
  const enPortada = useSelectedLayoutSegments().length === 0
  // `listo`: ya se decidió en esta carga (salió o ya había salido); no se vuelve a escuchar el scroll.
  const [listo, setListo] = useState(false)
  const [abierto, setAbierto] = useState(false)

  useAlRecorrer(0.2, 400, enPortada && !listo, () => {
    setListo(true)
    if (sesion.yaSalio()) return
    sesion.anotar()
    setAbierto(true)
  })

  const cerrar = useCallback(() => setAbierto(false), [])

  return (
    <Dialogo abierto={abierto} onCerrar={cerrar} titulo="Anuncio" tituloOculto etiquetaCerrar="Cerrar" relleno={false} testId="sn-anuncio">
      <div className={E.anuncio.cuerpo}>
        <div className={E.anuncio.contenido}>
          <Falta como="bloque" que="texto, foto y vigencia del anuncio" quien="Lucio y Pablo" />
        </div>
        <BoletinDelAnuncio />
      </div>
    </Dialogo>
  )
}

/** El boletín de hoy con su título de hoy (Footer.tsx), en la variante para fondo claro. */
function BoletinDelAnuncio() {
  return (
    <div className={E.anuncio.boletin} data-testid="sn-anuncio-boletin">
      <p className={E.anuncio.boletinTitulo}>Newsletter</p>
      <NewsletterForm origen="popup" />
    </div>
  )
}
