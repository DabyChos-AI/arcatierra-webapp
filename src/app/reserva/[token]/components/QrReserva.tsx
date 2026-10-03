'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, QrCode } from 'lucide-react'
import { aviso } from '@/components/ui/Avisos'
import { nombreArchivoQr } from './textos'

// DR23 (David, 3-oct): el QR codifica la URL de Mi día del PANEL (`qr.url`, la arma el backend con `qr_url_panel`).
// Pide sesión de empleado: un extraño que lo escanee no ve nada. Se dibuja en el navegador con el npm `qrcode`
// (importación dinámica: no pesa en la carga de la página) en un <canvas>; nada de <img> crudo.

type LibQr = typeof import('qrcode')

async function cargarQr(): Promise<LibQr> {
  const mod = await import('qrcode')
  // `qrcode` es CommonJS: según el empaquetador, las funciones vienen en el módulo o en `default`.
  const conDefault = mod as LibQr & { default?: LibQr }
  return conDefault.default ?? mod
}

const COLOR_QR = { dark: '#1F3024', light: '#FFFFFF' } // verde.dark sobre blanco: contraste de sobra para la cámara

export default function QrReserva({ url, folio }: { url: string; folio: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [estado, setEstado] = useState<'dibujando' | 'listo' | 'error'>('dibujando')
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    let vivo = true
    setEstado('dibujando')
    cargarQr()
      .then((lib) => {
        if (!vivo || !canvasRef.current) return
        return lib.toCanvas(canvasRef.current, url, { width: 240, margin: 2, errorCorrectionLevel: 'M', color: COLOR_QR })
      })
      .then(() => {
        if (vivo) setEstado('listo')
      })
      .catch(() => {
        if (vivo) setEstado('error')
      })
    return () => {
      vivo = false
    }
  }, [url])

  const descargar = async () => {
    if (descargando) return
    setDescargando(true)
    try {
      const lib = await cargarQr()
      // PNG más grande que el de pantalla (se imprime o se manda por WhatsApp sin perder lectura).
      const dataUrl = await lib.toDataURL(url, { width: 600, margin: 3, errorCorrectionLevel: 'M', color: COLOR_QR, type: 'image/png' })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = nombreArchivoQr(folio)
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      aviso.error('No se pudo descargar el código QR. Intenta de nuevo o toma una captura de pantalla.')
    } finally {
      setDescargando(false)
    }
  }

  return (
    <section
      data-testid="portal-qr"
      data-qr-url={url}
      aria-labelledby="portal-qr-titulo"
      className="rounded-2xl border border-neutro-borde bg-white p-4 text-center shadow-sm sm:p-6"
    >
      <h2 id="portal-qr-titulo" className="mb-2 flex items-center justify-center gap-2 font-heading text-xl text-verde">
        <QrCode className="h-5 w-5 text-terracota" aria-hidden="true" />
        Tu código QR
      </h2>
      <p data-testid="portal-qr-texto" className="mb-3 text-base text-verde-tipografia">
        Muéstralo al llegar: tu guía lo escanea.
      </p>
      <div className="mx-auto mb-3 flex h-[240px] w-[240px] max-w-full items-center justify-center">
        <canvas
          ref={canvasRef}
          data-testid="portal-qr-canvas"
          data-estado={estado}
          role="img"
          aria-label={`Código QR de la reserva ${folio}`}
          width={240}
          height={240}
          className={`h-[240px] w-[240px] max-w-full ${estado === 'error' ? 'hidden' : ''}`}
        />
        {estado === 'error' && (
          <p role="alert" data-testid="portal-qr-error" className="mb-0 text-sm text-rojo">
            No se pudo dibujar el código. Recarga la página; si sigue igual, da tu folio al llegar.
          </p>
        )}
      </div>
      <button
        type="button"
        data-testid="portal-qr-descargar"
        onClick={descargar}
        disabled={descargando}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-verde px-5 py-2 font-semibold text-verde transition-colors hover:bg-verde hover:text-white disabled:opacity-60"
      >
        <Download className="h-5 w-5" aria-hidden="true" />
        {descargando ? 'Preparando…' : 'Descargar QR'}
      </button>
    </section>
  )
}
