'use client'

// PIE1 (R8, sesión 48): lo que es de la web pública (el pie con el correo y el teléfono de Arca Tierra) no se pinta en el
// panel (/admin), igual que AnnouncementBanner, TransparentHeader (TH1) y WhatsAppChat. El hijo puede ser un componente de
// servidor (Footer): se renderiza en el servidor y aquí solo se decide si se muestra.
import { usePathname } from 'next/navigation'

export default function SoloFueraDelPanel({ children }: { children: React.ReactNode }) {
  const enAdmin = usePathname()?.startsWith('/admin') ?? false
  if (enAdmin) return null
  return <>{children}</>
}
