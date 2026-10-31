import FichaProducto from '@/components/sitio-nuevo/ficha/FichaProducto'

// R15 v2 · F3 (sesión 61): la ficha de producto del sitio nuevo, en `/producto/<itemcode>` (PREFIJOS_SITIO_NUEVO de src/lib/sitio-nuevo.ts;
// solo se ve con ARCA_SITIO_NUEVO=1). Contrato v2 §9-F3 D-F3-04, D-F3-09, D-F3-14 (P2), D-F3-22; cadena-v2/f3/ficha-F3.md §4.
// Sin `metadata` propia, como la ficha de hoy (src/app/producto/[id]/page.tsx): el título es el del layout raíz y el `noindex` lo pone
// src/app/nuevo/layout.tsx. Los datos los pide la ficha en el navegador (D-F2-03): aquí no hay fetch.
export default async function ProductoNuevo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FichaProducto id={id} />
}
