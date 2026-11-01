import ListaExperiencias from '@/components/sitio-nuevo/experiencias/ListaExperiencias'

// R15 v2 · F4 (sesión 62): la lista de experiencias del sitio nuevo, en `/experiencias` (RUTAS_SITIO_NUEVO de src/lib/sitio-nuevo.ts; solo se
// ve con ARCA_SITIO_NUEVO=1). Contrato v2 §9-F4 D-F4-03, D-F4-12, D-F4-13; cadena-v2/f4/experiencias-F4.md §2.
// Sin `metadata` propia, como la página de hoy (src/app/experiencias/page.tsx es de cliente y no exporta título): el título es el del layout
// raíz y el `noindex` lo pone src/app/nuevo/layout.tsx. Estática: los datos los pide la lista en el navegador (D-F2-03).
export default function ExperienciasNueva() {
  return <ListaExperiencias />
}
