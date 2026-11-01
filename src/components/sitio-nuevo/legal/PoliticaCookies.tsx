import { Apartado } from './piezas'

// R15 v2 · F5 (legales): la sección de cookies, dentro de /privacidad (`#cookies`; D-F5-11 P-9 A, P-10). Sin banner (DR76) y su texto = la
// marca L6 a David (C46). El `que` no nombra Umami: no está en el código de la rama (D-F5-11 P-10). «Cookies» es el nombre de la sección.
export default function PoliticaCookies() {
  return (
    <section id="cookies" data-testid="sn-legal-cookies" aria-labelledby="sn-legal-cookies-titulo" className="flex scroll-mt-20 flex-col gap-6">
      <h2 id="sn-legal-cookies-titulo" data-testid="sn-legal-cookies-titulo" className="m-0 font-sn-titulos text-sn-h3 font-normal text-sn-terra">
        Cookies
      </h2>
      <Apartado que="texto de la política de cookies" />
    </section>
  )
}
