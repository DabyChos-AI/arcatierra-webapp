import FichaExperiencia from '@/components/sitio-nuevo/experiencias/FichaExperiencia'

// R15 v2 · F4 (sesión 62): la ficha de una experiencia del sitio nuevo, en `/experiencias/<slug>` (PREFIJOS_SITIO_NUEVO de
// src/lib/sitio-nuevo.ts, sin `faq` ni `testimonios`; solo se ve con ARCA_SITIO_NUEVO=1). Contrato v2 §9-F4 D-F4-03, D-F4-11 P-2, D-F4-12,
// D-F4-13; cadena-v2/f4/experiencias-F4.md §3. Sin `metadata` propia, como la ficha de hoy (src/app/experiencias/[slug]/page.tsx es de
// cliente): el título es el del layout raíz y el `noindex` lo pone src/app/nuevo/layout.tsx. Los datos los pide la ficha en el navegador
// (D-F2-03): aquí no hay fetch.
export default async function ExperienciaNueva({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <FichaExperiencia slug={slug} />
}
