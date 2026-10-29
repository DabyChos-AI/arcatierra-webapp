import { FOCO, FOCO_BOTON, FOCO_SOBRE_OSCURO as FOCO_OSCURO } from '@/components/sitio-nuevo/ui/clases'

// R15 v2 · F1: las clases del armazón en un solo lugar, con los tokens `sn` de CONTRATO-BASE-F1 (base, §2–§3) y sus pares de contraste
// (§2.2: texto chico solo en los pares AA). Clases completas siempre (Tailwind no genera clases armadas con plantillas).
// - `globals.css` pone `a` en terracota y `*:focus` con contorno también con el ratón: cada liga lleva su color y su `hover:`, y el foco es
//   `focus:outline-none` + `focus-visible:` (contrato base §5.1, §5.2; C18: 2 px `sn-terra`, separación 3 px y 4 px en botones; sobre
//   fondo oscuro, `sn-warm`).
// - Cortes con variantes arbitrarias (sin `screens` nuevos, C16): la barra de escritorio desde CORTE_ESCRITORIO (C38); el resto, desde
//   861 px, el corte de la maqueta que midió base (a 860 todavía es celular; Contenedor, Seccion y Dialogo cortan igual).

/** Corte de escritorio: desde aquí la barra de ligas; debajo, el botón del menú del celular. Igual que las clases `min-[1100px]:`. */
export const CORTE_ESCRITORIO = 1100

export const E = {
  raiz: 'flex min-h-screen w-full flex-col bg-sn-warm font-sn-texto text-sn-ink',
  saltar: `sr-only z-[960] rounded-sn-pildora bg-sn-ink px-4 py-2 font-sn-mono text-sn-boton-sm uppercase text-sn-warm hover:text-sn-warm focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${FOCO}`,
  cabecera:
    'sticky top-0 z-[940] flex h-14 items-center justify-between gap-4 border-b border-sn-border bg-sn-warm px-sn-lateral-movil [transition:box-shadow_.3s_ease] motion-reduce:[transition:none] min-[861px]:h-16 min-[861px]:px-sn-lateral',
  // Sombra al bajar más de 8 px: la de la maqueta (`.topbar.is-stuck`, medida por base en medidas/maqueta-css.json). Propiedad arbitraria y no
  // utilidad de sombra: una utilidad de sombra nueva reagrupa las reglas de sombra de hoy (C16; CONTRATO-BASE-F1 §3.4).
  cabeceraPegada: '[box-shadow:0_1px_0_rgba(61,35,20,0.06),0_8px_24px_rgba(61,35,20,0.04)]',
  logoLiga: `flex min-w-0 items-center rounded-sn-boton ${FOCO}`,
  logoHorizontal: 'hidden h-9 w-auto min-[1100px]:block',
  logoAngosto: 'flex items-center gap-2 min-[1100px]:hidden',
  logoIsotipo: 'h-8 w-auto',
  logoLetras: 'h-5 w-auto',
  acciones: 'flex shrink-0 items-center gap-2 min-[1100px]:gap-3',
  navEscritorio: 'hidden min-[1100px]:block min-[1100px]:pr-2',
  navLista: 'flex items-center gap-6',
  navEnlace: `font-sn-mono text-sn-boton font-medium uppercase text-sn-ink hover:text-sn-terra aria-[current=page]:text-sn-terra ${FOCO}`,
  iconoBoton: `inline-flex h-11 w-11 items-center justify-center rounded-sn-pildora border border-sn-border bg-transparent text-sn-ink hover:border-sn-terra hover:text-sn-terra ${FOCO_BOTON}`,
  carritoConteo:
    'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-sn-pildora bg-sn-green px-1 font-sn-mono text-[10px] font-medium text-white',
  // La maqueta no tiene menú de cuenta: sin sombra (nada sin medir), solo el borde.
  cuentaPanel: 'absolute right-0 top-full z-[945] mt-2 min-w-56 rounded-sn-tarjeta border border-sn-border bg-white py-2',
  cuentaEnlace: `block px-4 py-2 font-sn-texto text-sn-cuerpo-sm text-sn-ink hover:bg-sn-warm hover:text-sn-ink ${FOCO}`,
  tiendaEscritorio: `hidden min-h-11 max-w-[260px] items-center rounded-sn-pildora min-[1100px]:inline-flex ${FOCO_BOTON}`,
  soloCelular: 'min-[1100px]:hidden',
  // Menú del celular (maqueta `.burger-overlay` y `.burger-drawer`): velo ink al 55 % con 2 px de desenfoque; cajón de 84 % hasta 380 px,
  // relleno 76/32/32 y su sombra (arbitraria, como la de la cabecera). Sin clase de display en el velo: lo oculta el atributo `hidden`.
  menu: {
    velo: 'fixed inset-0 z-[950] bg-sn-ink/55 [backdrop-filter:blur(2px)]',
    cajon:
      'absolute inset-y-0 right-0 w-[84%] max-w-[380px] overflow-y-auto bg-sn-warm px-8 pb-8 pt-[76px] [box-shadow:-12px_0_60px_rgba(0,0,0,0.18)] focus:outline-none',
    cerrar: `absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-sn-pildora text-sn-ink hover:text-sn-terra ${FOCO_BOTON}`,
    acciones: 'mt-6 flex flex-col gap-3',
    enlace: `block border-b border-sn-border py-3 font-sn-titulos text-sn-h4 text-sn-ink hover:text-sn-terra ${FOCO}`,
    tienda: `flex min-h-11 items-center justify-center rounded-sn-pildora px-4 py-2 text-center ${FOCO_BOTON}`,
    secundario: `flex min-h-11 items-center justify-center rounded-sn-pildora border border-sn-ink px-4 py-2 font-sn-mono text-sn-boton font-medium uppercase text-sn-ink hover:border-sn-terra hover:text-sn-terra ${FOCO_BOTON}`,
  },
  cinta: 'flex min-h-11 items-center justify-center border-b border-sn-border bg-sn-cream px-sn-lateral-movil py-2 text-center min-[861px]:px-sn-lateral',
  anuncio: {
    // Dentro del Dialogo de base (sin su relleno): la marca en el lugar de la foto y el texto, y el boletín al lado (debajo a 390).
    cuerpo: 'grid grid-cols-1 min-[861px]:grid-cols-2',
    contenido: 'px-6 pb-2 pt-14 min-[861px]:p-8 min-[861px]:pt-14',
    boletin: 'flex flex-col gap-3 px-6 pb-7 pt-4 min-[861px]:px-8 min-[861px]:pb-9 min-[861px]:pt-14',
    boletinTitulo: 'm-0 font-sn-mono text-sn-eyebrow font-medium uppercase text-sn-terra',
  },

  pie: {
    raiz: 'bg-sn-forest font-sn-texto text-sn-cream',
    arriba: 'grid grid-cols-1 gap-8 border-b border-sn-cream/15 px-sn-lateral-movil py-10 sm:px-14 md:grid-cols-2 md:py-14',
    marca: 'flex items-center',
    logo: 'h-12 w-auto',
    boletin: 'flex flex-col gap-3',
    // Solo trae la marca (pregunta C41): en la letra de texto, para que la negrita de la marca no salga sintética en DM Serif (C36).
    boletinFrase: 'm-0 font-sn-texto text-sn-cuerpo-sm',
    columnas: 'grid grid-cols-1 gap-8 border-b border-sn-cream/15 px-sn-lateral-movil py-10 sm:px-14 md:grid-cols-3 md:px-20 md:py-12',
    titulo: 'mb-4 mt-0 font-sn-mono text-sn-etiqueta font-medium uppercase text-sn-peach',
    tituloMarca: 'mb-4 mt-0 text-sn-cuerpo-xs',
    lista: 'flex flex-col gap-3',
    enlace: `font-sn-mono text-sn-cuerpo-xs text-sn-cream hover:text-white ${FOCO_OSCURO}`,
    direccion: 'flex flex-col gap-2 font-sn-mono text-sn-cuerpo-xs not-italic',
    abajo: 'flex flex-col gap-4 px-sn-lateral-movil py-6 sm:px-14 md:flex-row md:items-center md:justify-between',
    copy: 'm-0 font-sn-mono text-sn-etiqueta-sm uppercase text-sn-cream',
    abajoDerecha: 'flex flex-wrap items-center gap-4',
    legales: 'flex flex-wrap items-center gap-4',
    legal: `font-sn-mono text-sn-etiqueta-sm uppercase text-sn-cream hover:text-white ${FOCO_OSCURO}`,
    redes: 'flex items-center gap-2',
    red: `flex h-11 w-11 items-center justify-center rounded-sn-pildora border border-sn-cream/30 text-sn-cream hover:border-sn-peach hover:text-sn-peach ${FOCO_OSCURO}`,
  },
} as const
