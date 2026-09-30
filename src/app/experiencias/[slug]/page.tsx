'use client'

import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { X, Mail } from 'lucide-react';
import { Experiencia } from '@/data/experiencias';
import { formatPrice } from '@/utils/formatters';
import { useSession } from 'next-auth/react';
import { API_URL } from '@/lib/api';
import { formatFechaMexico, hoyMexico } from '@/lib/dates';
import { decodificarSlug, normalizarSlug } from './slug';

// ─── Solicitud de experiencia privada (LD3, contrato C4 de la Fase 3) ────────────────
type HorarioPrivado = 'manana' | 'tarde' | 'noche';

/** Mismos textos que el servidor escribe en el mensaje del lead. */
const HORARIOS_PRIVADOS: { valor: HorarioPrivado; etiqueta: string }[] = [
  { valor: 'manana', etiqueta: 'Mañana (8:00–12:00)' },
  { valor: 'tarde', etiqueta: 'Tarde (12:00–17:00)' },
  { valor: 'noche', etiqueta: 'Noche (17:00–21:00)' },
];

/** `x@y.z`: la misma revisión que hace el servidor para contactar por correo. */
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Límites de `SolicitudPrivadaRequest` (Pydantic): lo que no cabe, el servidor lo rechaza. */
const PERSONAS_MIN = 1;
const PERSONAS_MAX = 500;
const MAX_NOMBRE = 255;
const MAX_EMAIL = 255;
const MAX_TELEFONO = 50;
const MAX_COMENTARIOS = 1500;

const CAMPOS_SOLICITUD: Record<string, string> = {
  nombre: 'nombre',
  email: 'correo',
  telefono: 'teléfono',
  medio_contacto: 'medio de contacto',
  fecha_deseada: 'fecha deseada',
  horario: 'horario',
  personas: 'número de personas',
  comentarios: 'comentarios',
};

/**
 * `detail` de FastAPI en texto para el cliente: un 400 lo trae como texto; un 422 de Pydantic,
 * como lista de `{loc, msg}` (en inglés), así que se dice qué campos revisar.
 */
function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        if (!d || typeof d !== 'object' || !('loc' in d)) return null;
        const loc = (d as { loc: unknown }).loc;
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null;
        return typeof campo === 'string' ? CAMPOS_SOLICITUD[campo] ?? null : null;
      })
      .filter((c): c is string => c !== null);
    const unicos = Array.from(new Set(campos));
    if (unicos.length > 0) return `Revisa estos datos: ${unicos.join(', ')}.`;
  }
  return 'Revisa los datos del formulario.';
}

interface ExperienciaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ExperienciaPage({ params }: ExperienciaPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [experiencia, setExperiencia] = useState<Experiencia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [galeriaIndex, setGaleriaIndex] = useState(0);

  // Estados para el formulario de reserva
  const [adultos, setAdultos] = useState(1);
  const [ninos, setNinos] = useState(0);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

  // LD3 (Fase 3): los datos del formulario privado ya viajan al lead. Antes fecha, horario,
  // personas y comentarios eran campos sin estado y se perdían; el nombre y el correo vacíos
  // se rellenaban con «Visitante» y un correo inventado.
  const [privFecha, setPrivFecha] = useState('');
  const [privHorario, setPrivHorario] = useState<HorarioPrivado | ''>('');
  const [privPersonas, setPrivPersonas] = useState('');
  const [privComentarios, setPrivComentarios] = useState('');
  const [privError, setPrivError] = useState<string | null>(null);
  // Personas que incluye el precio de la experiencia privada (si la API la manda).
  const [personasIncluidas, setPersonasIncluidas] = useState<number | null>(null);

  const cerrarModal = () => {
    setShowReservationModal(false);
    setPrivError(null);
  };

  // Enviar solicitud de experiencia privada y abrir canal de contacto
  const handleContactoPrivada = async (medio: 'whatsapp' | 'email') => {
    if (!experiencia || enviandoSolicitud) return;
    setPrivError(null);

    // Regla de contacto de C4, antes de mandar nada (el servidor la vuelve a revisar).
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();
    const telefonoLimpio = telefono.trim();
    const personasTexto = privPersonas.trim();
    const personasNum = personasTexto === '' ? null : Number(personasTexto);
    let errorLocal: string | null = null;
    if (!nombreLimpio) {
      errorLocal = 'Escribe tu nombre';
    } else if (medio === 'whatsapp' && !telefonoLimpio) {
      errorLocal = 'Escribe tu teléfono para que te contactemos por WhatsApp';
    } else if (medio === 'email' && !CORREO_VALIDO.test(emailLimpio)) {
      errorLocal = 'Escribe un correo válido';
    } else if (privFecha && privFecha < hoyMexico()) {
      errorLocal = 'La fecha deseada ya pasó';
    } else if (
      personasNum !== null &&
      (!Number.isInteger(personasNum) || personasNum < PERSONAS_MIN || personasNum > PERSONAS_MAX)
    ) {
      errorLocal = `El número de personas va de ${PERSONAS_MIN} a ${PERSONAS_MAX}`;
    }
    if (errorLocal) {
      setPrivError(errorLocal);
      return;
    }

    setEnviandoSolicitud(true);
    // Payload = C4 (sin `mensaje`: el servidor lo arma con estos datos).
    const payload = {
      nombre: nombreLimpio,
      email: emailLimpio || null,
      telefono: telefonoLimpio || null,
      medio_contacto: medio,
      fecha_deseada: privFecha || null,
      horario: privHorario || null,
      personas: personasNum,
      comentarios: privComentarios.trim() || null,
    };
    let rechazo: string | null = null;
    try {
      const res = await fetch(`${API_URL}/api/experiencias/${experiencia.id}/solicitud-privada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // 400/422 = el servidor rechazó los datos: se dice por qué y NO se abre el canal.
      // 200, 5xx, 429 o cualquier otra cosa: se abre igual (el cliente quiere hablar con nosotros).
      if (res.status === 400 || res.status === 422) {
        const cuerpo: unknown = await res.json().catch(() => null);
        rechazo = detalleLegible(
          cuerpo && typeof cuerpo === 'object' && 'detail' in cuerpo
            ? (cuerpo as { detail: unknown }).detail
            : null
        );
      }
    } catch (err) {
      // Error de red: no se guardó el lead, pero el canal se abre igual.
      console.error('Error registrando solicitud:', err);
    } finally {
      setEnviandoSolicitud(false);
    }

    if (rechazo) {
      setPrivError(rechazo);
      return;
    }

    // Lo que el cliente pidió, también en el texto de WhatsApp / correo.
    const horarioTexto = HORARIOS_PRIVADOS.find((h) => h.valor === privHorario)?.etiqueta;
    const detalles = [
      privFecha
        ? `Fecha deseada: ${formatFechaMexico(privFecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
        : null,
      horarioTexto ? `Horario: ${horarioTexto}` : null,
      personasNum !== null ? `Personas: ${personasNum}` : null,
    ].filter((linea): linea is string => linea !== null);

    if (medio === 'whatsapp') {
      const msg = encodeURIComponent(
        [
          `Hola, me interesa la experiencia privada "${experiencia.nombre}". Mi nombre es ${nombreLimpio}.`,
          ...detalles,
        ].join('\n')
      );
      window.open(`https://wa.me/525510515525?text=${msg}`, '_blank');
    } else {
      const subject = encodeURIComponent(`Solicitud experiencia privada: ${experiencia.nombre}`);
      const comentariosLimpios = privComentarios.trim();
      const body = encodeURIComponent(
        [
          'Hola,',
          '',
          `Me interesa la experiencia privada "${experiencia.nombre}".`,
          '',
          `Nombre: ${nombreLimpio}`,
          `Email: ${emailLimpio}`,
          `Teléfono: ${telefonoLimpio}`,
          ...detalles,
          ...(comentariosLimpios ? [`Comentarios: ${comentariosLimpios}`] : []),
          '',
          'Quedo atento/a a su respuesta.',
        ].join('\n')
      );
      window.open(`mailto:info@arcatierra.com?subject=${subject}&body=${body}`, '_blank');
    }
    cerrarModal();
  };

  // Llenar datos del usuario si está logueado
  useEffect(() => {
    if (session?.user) {
      setNombre(session.user.name || '');
      setEmail(session.user.email || '');
      // El teléfono se tendría que obtener del perfil del usuario si existe
    }
  }, [session]);

  // Función para manejar el checkout real
  const handleCompletarReserva = async () => {
    if (!experiencia) return;
    
    const precioTotal = experiencia.precio.base * adultos;
    
    try {
      const response = await fetch(`${API_URL}/api/crear-preferencia-pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: experiencia.id,
            name: experiencia.nombre,
            price: experiencia.precio.base,
            quantity: adultos,
            description: `${experiencia.nombre} - ${adultos} adulto${adultos > 1 ? 's' : ''} ${ninos > 0 ? ` + ${ninos} niño${ninos > 1 ? 's' : ''}` : ''}`
          }],
          back_urls: {
            success: `${window.location.origin}/experiencias/${slug}?status=success`,
            failure: `${window.location.origin}/experiencias/${slug}?status=failure`,
            pending: `${window.location.origin}/experiencias/${slug}?status=pending`
          },
          auto_return: 'approved',
          external_reference: `EXP-${experiencia.id}-${Date.now()}`,
          payer: {
            name: nombre,
            email: email,
            phone: {
              number: telefono
            }
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Redirigir al checkout de MercadoPago
        window.location.href = data.init_point;
      } else {
        alert('Error al crear la preferencia de pago. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la reserva. Intenta de nuevo.');
    }
  };

  // Cargar experiencia desde la API
  useEffect(() => {
    const fetchExperiencia = async () => {
      setIsLoading(true);
      try {
        // Primero obtener todas las experiencias para encontrar por slug
        let response = await fetch(`${API_URL}/api/experiencias?limit=50`);
        
        if (!response.ok) {
          console.log('Intentando con localhost como fallback...');
          response = await fetch('http://localhost:8000/api/experiencias?limit=50');
        }
        
        if (response.ok) {
          const data = await response.json();
          
          // Buscar experiencia por slug. WEB-f: Next 15 entrega el parámetro codificado
          // («bebidas-bald%C3%ADo») y la API manda «bebidas-baldío»: con === daba 404.
          // Primero la coincidencia exacta; si no, normalizados (sin acentos, ñ→n), así
          // abren /bebidas-baldío, /bebidas-bald%C3%ADo y /bebidas-baldio.
          const pedido = decodificarSlug(slug);
          const pedidoNormalizado = normalizarSlug(pedido);
          const expEncontrada =
            data.items.find((exp: { slug?: string | null }) => exp.slug === pedido) ??
            data.items.find(
              (exp: { slug?: string | null }) =>
                typeof exp.slug === 'string' && normalizarSlug(exp.slug) === pedidoNormalizado
            );
          
          if (expEncontrada) {
            // Mapear a formato local
            const experienciaMapeada: Experiencia = {
              id: expEncontrada.id,
              slug: expEncontrada.slug,
              nombre: expEncontrada.nombre,
              tipo: expEncontrada.tipo,
              precio: {
                base: expEncontrada.precio,
                nino: expEncontrada.precio_nino || null,
                adicional: expEncontrada.precio_persona_adicional || 0,
                capacidad: expEncontrada.tipo === 'publica' ? 'por persona' : 'hasta 10 personas'
              },
              seo: {
                title: `${expEncontrada.nombre} - Arca Tierra`,
                description: expEncontrada.descripcion || `Experiencia ${expEncontrada.tipo} en Xochimilco`
              },
              imagen: expEncontrada.imagen_principal || 
                (expEncontrada.nombre === 'AMANECER CHINAMPERO CON THE CURIOUS MEXICAN' 
                  ? '/images/experiencias/AMANECERCHINAMPERO.jpg'
                  : expEncontrada.nombre === 'TALLER DE COCINA CON MARIANA OROZCO'
                  ? '/images/experiencias/TALLERDECOCINACONMARIANAOROZCO.jpg'
                  : expEncontrada.nombre === 'CHINAMPA EN FAMILIA'
                  ? '/images/experiencias/CHINAMPAENFAMILIA.jpeg'
                  : `/images/experiencias/${expEncontrada.nombre.toUpperCase().replace(/\s+/g, '')}.jpg`),
              galeria_imagenes: expEncontrada.galeria_imagenes || [],
              badges: expEncontrada.disponible ? [
                { type: expEncontrada.tipo, label: expEncontrada.tipo === 'publica' ? 'Pública' : 'Privada', color: 'text-white', bgColor: expEncontrada.tipo === 'publica' ? 'bg-verde-principal' : 'bg-terracota-principal' }
              ] : [],
              descripcionCorta: expEncontrada.descripcion ? expEncontrada.descripcion.substring(0, 150) + '...' : '',
              descripcionCompleta: expEncontrada.descripcion || '',
              duracion: `${expEncontrada.duracion_horas} horas`,
              incluye: expEncontrada.incluye || ['Experiencia única'],
              informacion_importante: expEncontrada.informacion_importante || [],
              categoria: expEncontrada.tipo === 'publica' ? 'gastronomica' : 'familiar'
            };
            
            setExperiencia(experienciaMapeada);
            // Pista del formulario privado: solo con un número real de la API (C4).
            const incluidas: unknown = expEncontrada.personas_incluidas;
            setPersonasIncluidas(
              typeof incluidas === 'number' && Number.isInteger(incluidas) && incluidas > 0
                ? incluidas
                : null
            );
            console.log(`Experiencia ${slug} cargada desde la API`);
          } else {
            console.error(`Experiencia con slug "${slug}" no encontrada`);
            // No setear experiencia, quedará null para trigger notFound()
          }
        } else {
          console.error('Error cargando experiencias de la API');
        }
      } catch (error) {
        console.error('Error conectando con la API de experiencias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiencia();
  }, [slug]);

  // Detectar si se viene desde un clic en "Solicitar Cotización"
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'solicitar') {
      setShowReservationModal(true);
    }
  }, [searchParams]);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-verde-principal mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando experiencia...</p>
        </div>
      </main>
    );
  }

  if (!experiencia) {
    notFound();
  }

  const isPrivate = experiencia.tipo === 'privada';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      {/* Navegación breadcrumb */}
      <nav className="py-4 px-4 md:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-terracota transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/experiencias" className="hover:text-terracota transition-colors">
              Experiencias
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{experiencia.nombre}</span>
          </div>
        </div>
      </nav>

      {/* Hero de la experiencia */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <OptimizedImage
          src={experiencia.imagen}
          alt={experiencia.nombre}
          fill
          className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          {experiencia.badges.map((badge, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                badge.type === 'popular' ? 'bg-terracota' :
                badge.type === 'nuevo' ? 'bg-verde' :
                badge.type === 'destacado' ? 'bg-terracota' :
                badge.type === 'familiar' ? 'bg-verde' :
                badge.type === 'privada' ? 'bg-terracota' :
                badge.type === 'educativa' ? 'bg-verde-principal' :
                badge.type === 'publica' ? 'bg-verde-principal' :
                'bg-verde-principal'
              }`}
            >
              {badge.icon} {badge.label}
            </span>
          ))}
        </div>

        {/* Precio flotante */}
        <div className="absolute top-6 right-6 bg-terracota text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
          ${formatPrice(experiencia.precio.base)}
        </div>

        {/* Título */}
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white">
            {experiencia.nombre}
          </h1>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Información principal */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-playfair font-bold text-gray-800 mb-6">
                  Descripción de la Experiencia
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {experiencia.descripcionCompleta}
                </p>

                {/* Galería de imágenes */}
                {experiencia.galeria_imagenes && experiencia.galeria_imagenes.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
                      Galería
                    </h3>
                    <div className="relative rounded-xl overflow-hidden mb-3">
                      <div className="aspect-[16/9] relative">
                        <OptimizedImage
                          src={experiencia.galeria_imagenes[galeriaIndex]}
                          alt={`${experiencia.nombre} - Foto ${galeriaIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {experiencia.galeria_imagenes.length > 1 && (
                        <>
                          <button
                            onClick={() => setGaleriaIndex(i => i === 0 ? experiencia.galeria_imagenes!.length - 1 : i - 1)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Anterior"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => setGaleriaIndex(i => i === experiencia.galeria_imagenes!.length - 1 ? 0 : i + 1)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Siguiente"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                            {galeriaIndex + 1} / {experiencia.galeria_imagenes.length}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {experiencia.galeria_imagenes.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGaleriaIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            idx === galeriaIndex ? 'border-terracota' : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <OptimizedImage
                            src={img}
                            alt={`Miniatura ${idx + 1}`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
                  ¿Qué incluye?
                </h3>
                <ul className="space-y-3 mb-8">
                  {experiencia.incluye.map((item, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="text-terracota mr-2">-</span>
                      <span>{item.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2705}\u{274C}\u{1F4CD}]+\s*/gu, '')}</span>
                    </li>
                  ))}
                </ul>

                {/* Información importante */}
                {experiencia.informacion_importante && experiencia.informacion_importante.length > 0 && (
                  <>
                    <h3 className="text-2xl font-playfair font-bold text-gray-800 mb-4">
                      Información importante:
                    </h3>
                    <ul className="space-y-3 mb-8">
                      {experiencia.informacion_importante.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-700">
                          <span className="text-terracota mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar con información de reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-terracota mb-2">
                    ${formatPrice(experiencia.precio.base)}
                  </div>
                  <div className="text-gray-600">
                    {experiencia.precio.capacidad}
                  </div>
                  {experiencia.precio.nino && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Precio niño:</div>
                      <div className="text-xl font-semibold text-verde-principal">
                        ${formatPrice(experiencia.precio.nino)}
                      </div>
                    </div>
                  )}
                  {isPrivate && experiencia.precio.adicional && experiencia.precio.adicional > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">Persona adicional:</div>
                      <div className="text-xl font-semibold text-verde-principal">
                        +${formatPrice(experiencia.precio.adicional)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <span className="text-terracota mr-2">-</span>
                    <span>Duración: {experiencia.duracion}</span>
                  </div>
                  {/* Ubicación y calificación ocultos por solicitud */}
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  {isPrivate ? (
                    <button 
                      onClick={() => setShowReservationModal(true)}
                      className="w-full bg-terracota text-white py-3 px-6 rounded-full font-semibold hover:bg-terracota-oscuro transition-colors duration-300"
                    >
                      Solicitar Cotización
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setShowReservationModal(true)}
                        className="w-full bg-terracota text-white py-3 px-6 rounded-full font-semibold hover:bg-terracota-oscuro transition-colors duration-300"
                      >
                        Reservar Ahora
                      </button>
                      <Link 
                        href="/calendario"
                        className="w-full bg-white text-gray-700 py-3 px-6 rounded-full font-semibold border border-gray-300 hover:bg-gray-100 transition-colors duration-300 block text-center mt-3"
                      >
                        Ver Calendario
                      </Link>
                    </>
                  )}
                </div>

                {/* Información importante desde BD */}
                {experiencia.informacion_importante && experiencia.informacion_importante.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Información importante:</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {experiencia.informacion_importante.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de experiencias relacionadas - Temporalmente removida hasta implementar carga de experiencias relacionadas */}

      {/* Modal de reserva */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-36 px-4 pb-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {isPrivate ? "Solicitar Experiencia Privada" : "Reservar Experiencia"}
              </h3>
              <button
                onClick={cerrarModal}
                aria-label="Cerrar"
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-1">{experiencia.nombre}</h4>
            {!isPrivate && (
              <p className="text-gray-600 mb-4">sábado, 22 de noviembre de 2025 a las 5:30</p>
            )}
            <p className="text-xl font-bold text-terracota mb-6">
              ${formatPrice(experiencia.precio.base)}
              {isPrivate && <span className="text-sm font-normal"> / por persona</span>}
            </p>

            {/* Formulario diferente según el tipo de experiencia */}
            {isPrivate ? (
              /* Formulario para experiencias PRIVADAS */
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="priv-nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    id="priv-nombre"
                    data-testid="priv-nombre"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    maxLength={MAX_NOMBRE}
                    autoComplete="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="priv-correo" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="priv-correo"
                    data-testid="priv-correo"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={MAX_EMAIL}
                    autoComplete="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                  />
                </div>

                <div>
                  <label htmlFor="priv-telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    id="priv-telefono"
                    data-testid="priv-telefono"
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    maxLength={MAX_TELEFONO}
                    autoComplete="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Para WhatsApp necesitamos tu teléfono; para correo, tu email.
                  </p>
                </div>

                <div>
                  <label htmlFor="priv-fecha" className="block text-sm font-medium text-gray-700 mb-1">Fecha deseada</label>
                  <input
                    id="priv-fecha"
                    data-testid="priv-fecha"
                    type="date"
                    min={hoyMexico()}
                    value={privFecha}
                    onChange={(e) => setPrivFecha(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                  />
                </div>

                <div>
                  <label htmlFor="priv-horario" className="block text-sm font-medium text-gray-700 mb-1">Horario preferido</label>
                  <select
                    id="priv-horario"
                    data-testid="priv-horario"
                    value={privHorario}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const opcion = HORARIOS_PRIVADOS.find((h) => h.valor === valor);
                      setPrivHorario(opcion ? opcion.valor : '');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                  >
                    <option value="">Selecciona un horario</option>
                    {HORARIOS_PRIVADOS.map((h) => (
                      <option key={h.valor} value={h.valor}>
                        {h.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="priv-personas" className="block text-sm font-medium text-gray-700 mb-1">Número de personas</label>
                  <input
                    id="priv-personas"
                    data-testid="priv-personas"
                    type="number"
                    inputMode="numeric"
                    min={PERSONAS_MIN}
                    max={PERSONAS_MAX}
                    step={1}
                    value={privPersonas}
                    onChange={(e) => setPrivPersonas(e.target.value)}
                    aria-describedby="priv-personas-pista"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                  />
                  <p id="priv-personas-pista" data-testid="priv-personas-pista" className="mt-1 text-xs text-gray-500">
                    {personasIncluidas !== null
                      ? `Incluye ${personasIncluidas} personas; puedes pedir más o menos`
                      : 'Un aproximado basta; lo confirmamos contigo'}
                  </p>
                </div>

                <div>
                  <label htmlFor="priv-comentarios" className="block text-sm font-medium text-gray-700 mb-1">Comentarios y requerimientos especiales</label>
                  <textarea
                    id="priv-comentarios"
                    data-testid="priv-comentarios"
                    value={privComentarios}
                    onChange={(e) => setPrivComentarios(e.target.value)}
                    maxLength={MAX_COMENTARIOS}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota min-h-[100px]"
                  />
                </div>

                {privError && (
                  <p
                    data-testid="priv-error"
                    role="alert"
                    className="rounded-md border border-terracota/40 bg-terracota/10 px-3 py-2 text-sm text-terracota-oscuro"
                  >
                    {privError}
                  </p>
                )}
              </div>
            ) : (
              /* Formulario para experiencias PÚBLICAS */
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel" 
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios especiales</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-terracota min-h-[100px]"
                  />
                  <p className="mt-1 text-xs text-gray-500 flex items-center">
                    <span className="mr-1">💡</span>
                    <span>Comparte cualquier información que nos ayude a personalizar tu experiencia</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adultos</label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setAdultos(Math.max(1, adultos - 1))}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={adultos}
                        className="flex-1 text-center px-3 py-2 border-l border-r border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setAdultos(adultos + 1)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niños</label>
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setNinos(Math.max(0, ninos - 1))}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={ninos}
                        className="flex-1 text-center px-3 py-2 border-l border-r border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setNinos(ninos + 1)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPrivate ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={cerrarModal}
                  className="w-full py-3 px-6 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  data-testid="priv-whatsapp"
                  onClick={() => handleContactoPrivada('whatsapp')}
                  disabled={enviandoSolicitud}
                  className="w-full py-3 px-6 rounded-md font-medium text-white transition-colors flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contactar por WhatsApp
                </button>
                <button
                  data-testid="priv-email"
                  onClick={() => handleContactoPrivada('email')}
                  disabled={enviandoSolicitud}
                  className="w-full py-3 px-6 rounded-md font-medium text-white transition-colors flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#B15543' }}
                >
                  <Mail size={20} />
                  Contactar por Email
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="w-full py-3 px-6 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompletarReserva}
                  className="w-full py-3 px-6 bg-terracota text-white rounded-md font-medium hover:bg-terracota-oscuro transition-colors"
                >
                  Completar Reserva
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

