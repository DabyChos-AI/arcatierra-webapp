/**
 * Descargas del panel: el archivo llega con `fetch` (lleva el token de la sesión) y se guarda con el nombre que
 * manda el backend en `Content-Disposition` (la API lo expone por CORS: `main.py`, `expose_headers`).
 *
 * Mismo código que tenían locales `app/admin/planeacion/page.tsx` y `app/admin/reportes/…/ModalPreviewReporte.tsx`
 * (Fase 4b, sesión 40: se exporta aquí; esas dos pantallas se migran después).
 */

/** Nombre del archivo desde `Content-Disposition` (filename* o filename). */
export function nombreDeArchivo(res: Response, porDefecto: string): string {
  const cd = res.headers.get('content-disposition') || ''
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1]
  if (utf8) {
    try {
      return decodeURIComponent(utf8.replace(/"/g, ''))
    } catch {
      /* cae al filename simple */
    }
  }
  return /filename="?([^";]+)"?/i.exec(cd)?.[1] || porDefecto
}

/** blob → objectURL → <a download> → revoke. */
export async function descargar(res: Response, porDefecto: string): Promise<void> {
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreDeArchivo(res, porDefecto)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
