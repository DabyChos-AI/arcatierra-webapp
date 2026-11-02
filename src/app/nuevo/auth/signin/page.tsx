import Entrar from '@/components/sitio-nuevo/acceso/Entrar'

// R15 v2 · F6 (acceso): /auth/signin del sitio nuevo (maqueta `#cuenta-noauth`). Contrato v2 §8-F6, §9-F6 D-F6-03, D-F6-04, D-F6-06, D-F6-09,
// D-F6-10 P-5; cadena-v2/f6/acceso-F6.md. Se ve en /auth/signin (solo en el link de revisión) cuando la entrega de direcciones de cuenta agregue la
// dirección (D-F6-03). Página estática: la sesión y los envíos van desde el navegador. Sin `metadata` propia, como la de hoy (D-F6-09 P-10).
// No está debajo del layout de la cuenta (`nuevo/usuario/layout.tsx`): lleva su propio `<main>` y su único `h1` (D-F6-08 P-1).
export default function EntrarNuevo() {
  return (
    <main data-testid="sn-acceso" data-pagina="entrar">
      <Entrar />
    </main>
  )
}
