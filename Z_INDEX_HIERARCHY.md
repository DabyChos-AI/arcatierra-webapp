# Z-Index Hierarchy - ArcaTierra

> Al día el 16-oct-2026 (R11 · CAR2, sesión 50). Los valores de abajo son los que hay en el código hoy (medidos con
> `grep` en `src/`); la versión de julio de 2025 de este archivo era un plan que nunca se aplicó tal cual (pedía `z-750`
> para WhatsApp y `z-650` para los toasts, y el encabezado ya estaba en 1000). Si cambias una capa, actualiza esta tabla.

## 🎯 Objetivo
Que el encabezado se vea siempre, que los diálogos y avisos queden encima de todo, y que los flotantes del sitio público
(carrito, WhatsApp) no tapen lo que la persona tiene que tocar, sobre todo a 390 px.

## 📊 Jerarquía real (de arriba hacia abajo)

| z | Qué | Dónde |
|---|---|---|
| `10001` | Menú móvil del encabezado (panel blanco) | `components/layout/TransparentHeader.tsx` |
| `10000` | Velo del menú móvil · pestaña «Cerrar filtros» del panel de filtros de escritorio | `TransparentHeader.tsx` · `app/tienda/page.tsx` |
| `9998`–`9999` | Cajones laterales: carrito (`CartSidebar`, velo 9998 / cajón 9999) y filtros de la tienda en móvil | `components/CartSidebar.tsx` · `app/tienda/page.tsx` |
| `9990` | Pestaña «Mostrar filtros» de la tienda en escritorio (solo con los filtros colapsados, `hidden lg:flex`) | `app/tienda/page.tsx` |
| `9500` | Avisos (`aviso.exito/error/info`) | `components/ui/Avisos.tsx` |
| `9000` | Diálogo de confirmación (`confirmar()`) | `components/ui/Avisos.tsx` |
| `2500` | Modal de servicios de catering | `components/catering/ServicesInfoModal.tsx` |
| `1000`–`2000` | Encabezado público fijo (1000) y sus menús (1001–1002, 2000) | `TransparentHeader.tsx` |
| `999` | Banner de anuncios (sticky) | `components/AnnouncementBanner.tsx` |
| `950` | Modales públicos (vista rápida, fechas, privadas, propuesta corporativa de /catering, …; con `pt-36` para librar el encabezado) | `ProductQuickView.tsx`, `experiencias/*`, `catering/CorporateRequestModal.tsx` |
| `900` | Tirador «Carrito» (desde 640 px) | `CartSidebar.tsx` |
| `750` | Burbuja de WhatsApp | `components/WhatsAppChat.tsx` |
| `0`–`50` | Contenido de la página; velo del chat de WhatsApp en móvil (`z-40`) | — |

El panel (`/admin`) no monta el carrito, la burbuja, el banner ni el encabezado público. Sus modales van en 60/70/1100/1200/1300 y
siguen por debajo del diálogo (9000) y de los avisos (9500).

## 📱 Regla de 390 px (CAR2, R11)
- **Debajo de 640 px (`sm`) no hay pestañas fijas en los bordes laterales:** tapaban el borde de las tarjetas (medido con
  `elementFromPoint` a 390×844).
  - Tirador «Carrito»: `hidden sm:flex`; a 390 el carrito se abre con el botón «Carrito» del encabezado (siempre visible).
  - «Filtros» de la tienda: debajo de `lg` es un botón dentro de la fila de filtros (`tienda-filtros-abrir`), no una pestaña fija.
- Burbuja de WhatsApp debajo de 640 px: 48 px, `bottom-4 right-4` (desde 640: 56 px, `bottom-6 right-6`).
- Un flotante nuevo: por debajo de los modales públicos (950) y nunca en una pestaña lateral a 390.

## ✅ Reglas de oro
- Modales públicos en `z-[950]`; flotantes (tirador, burbuja) por debajo (`z-[900]`, `z-[750]`).
- Diálogos y avisos solo con `Avisos.tsx` (9000 / 9500): no inventes otra capa de notificaciones.
- Clases completas (`z-[950]`), nunca armadas con plantillas (`z-[${n}]`): Tailwind no las genera.
