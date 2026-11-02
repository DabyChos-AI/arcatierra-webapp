import MarcoCuenta from '@/components/sitio-nuevo/cuenta/MarcoCuenta'

// R15 v2 · F6 (cuenta, sesión 64; D-F6-08 P-1, D-F6-11 P-1): el marco de Mi cuenta alrededor de todas las pestañas de `/usuario/…` del sitio
// nuevo (Resumen, Direcciones y Datos de cuenta; Pedidos, el detalle y Suscripciones de compras), sin que sus páginas importen nada. Pone el
// único <main> y el único <h1>; cada pestaña es una <section aria-labelledby> con su h2. Componente de servidor sin datos del cliente: 0
// `getServerSession`/`auth()` y 0 `fetch` aquí (D-F6-10 P-5); la sesión y `/api/auth/me` se leen en el navegador, dentro de MarcoCuenta.
// Sin `metadata`: el título de cada página queda el de hoy.
export default function LayoutCuenta({ children }: { children: React.ReactNode }) {
  return <MarcoCuenta>{children}</MarcoCuenta>
}
