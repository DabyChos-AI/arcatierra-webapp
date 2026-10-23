'use client';

import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { aviso } from '@/components/ui/Avisos';
import { API_URL } from '@/lib/api';
import type { ContactoPayload } from '@/types/mensajes';
import { CONTACTO, CORREO_EXPERIENCIAS, CORREO_GENERAL, ICONO_TIKTOK_PATH } from '@/lib/contacto';
import { Youtube } from 'lucide-react';

// TEL3: título y descripción en contacto/layout.tsx (esta página es 'use client'); teléfono y redes de lib/contacto.ts

// WF11 (R11b, DR71): el formulario guarda el mensaje de verdad (antes hacía `console.log`). POST /api/contacto (público,
// 5/min por IP) → bandeja «Mensajes» del panel y aviso en la campana; no se manda correo a nadie (L1). Patrón de
// /restaurantes (REST1): el botón se puede pulsar siempre, si falta un dato dice cuál y enfoca el campo; candado contra
// doble clic. `sitio` es un campo trampa oculto (un bot lo llena; el backend responde igual y no guarda). Topes = el modelo.
interface FormContacto {
  nombre: string
  email: string
  asunto: string
  mensaje: string
}
type CampoContacto = keyof FormContacto | 'privacidad'

const FORM_VACIO: FormContacto = { nombre: '', email: '', asunto: '', mensaje: '' }
const MAXIMO: Record<keyof FormContacto, number> = { nombre: 120, email: 255, asunto: 150, mensaje: 5000 }
const ETIQUETA_CAMPO: Record<string, string> = {
  nombre: 'tu nombre',
  email: 'el correo',
  asunto: 'el asunto',
  mensaje: 'el mensaje',
  acepto_privacidad: 'la casilla de privacidad',
}
const TEXTO_ENVIADO = 'Recibimos tu mensaje. Te respondemos por correo.'
const TEXTO_NO_ENVIADO = 'No pudimos enviar tu mensaje. Intenta de nuevo en un momento.'
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** El primer dato que falta o está mal, o null si todo sirve (el backend valida igual). */
function campoInvalido(f: FormContacto, acepto: boolean): { campo: CampoContacto; motivo: string } | null {
  if (f.nombre.trim().length < 2) return { campo: 'nombre', motivo: 'Escribe tu nombre.' }
  if (!CORREO_VALIDO.test(f.email.trim())) return { campo: 'email', motivo: 'Escribe un correo válido.' }
  if (!f.mensaje.trim()) return { campo: 'mensaje', motivo: 'Escribe tu mensaje.' }
  if (!acepto) return { campo: 'privacidad', motivo: 'Para enviarlo, acepta la Política de Privacidad.' }
  return null
}

/** `detail` de FastAPI en texto: un 4xx lo trae como texto; un 422 de Pydantic, como lista de `{loc, msg}`. */
function detalleLegible(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) return detail
  if (Array.isArray(detail)) {
    const campos = detail
      .map((d) => {
        const loc = d && typeof d === 'object' && 'loc' in d ? (d as { loc: unknown }).loc : null
        const campo = Array.isArray(loc) ? loc[loc.length - 1] : null
        return typeof campo === 'string' && campo in ETIQUETA_CAMPO ? ETIQUETA_CAMPO[campo] : null
      })
      .filter((c): c is string => c !== null)
    const unicos = Array.from(new Set(campos))
    if (unicos.length > 0) return `Revisa ${unicos.join(', ')}.`
  }
  return 'Revisa los datos del formulario.'
}

const CLASE_CAMPO =
  'w-full px-4 py-3 rounded-lg bg-white border focus:outline-none focus:ring-2 focus:ring-terracota-principal'

export default function ContactoPage() {
  const [form, setForm] = useState<FormContacto>(FORM_VACIO)
  const [acepto, setAcepto] = useState(false)
  const [sitio, setSitio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [invalido, setInvalido] = useState<CampoContacto | null>(null)
  const enviandoRef = useRef(false)
  const refs = {
    nombre: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    asunto: useRef<HTMLInputElement>(null),
    mensaje: useRef<HTMLTextAreaElement>(null),
    privacidad: useRef<HTMLInputElement>(null),
  }

  const cambiar = (campo: keyof FormContacto, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    if (invalido === campo) setInvalido(null)
  }

  const borde = (campo: CampoContacto) => (invalido === campo ? 'border-terracota-principal' : 'border-gray-300')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enviandoRef.current) return
    const falta = campoInvalido(form, acepto)
    if (falta) {
      setInvalido(falta.campo)
      aviso.error(falta.motivo)
      refs[falta.campo].current?.focus()
      return
    }
    const asunto = form.asunto.trim()
    // `sitio` lleva lo que traiga la trampa (vacío para una persona).
    const body: ContactoPayload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      asunto: asunto || null,
      mensaje: form.mensaje.trim(),
      acepto_privacidad: true,
      sitio,
    }
    enviandoRef.current = true
    setEnviando(true)
    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const datos: unknown = await res.json().catch(() => null)
      if (res.ok) {
        const message = datos && typeof datos === 'object' ? (datos as { message?: unknown }).message : null
        aviso.exito(typeof message === 'string' && message.trim() ? message : TEXTO_ENVIADO)
        setForm(FORM_VACIO)
        setAcepto(false)
        setInvalido(null)
        return
      }
      const detail = datos && typeof datos === 'object' ? (datos as { detail?: unknown }).detail : null
      aviso.error(res.status >= 400 && res.status < 500 ? detalleLegible(detail) : TEXTO_NO_ENVIADO)
    } catch {
      aviso.error(TEXTO_NO_ENVIADO)
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  };

  return (
    <>
      <section className="relative bg-neutro-crema py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-verde-principal">Contacto</h1>
            <p className="text-xl text-verde-tipografia max-w-2xl mx-auto">
              Estamos aquí para responder tus preguntas sobre nuestros productos, servicios y experiencias en las chinampas.
            </p>
          </div>
        </div>
      </section>

      <main className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Formulario de contacto. R11b: toda la página usa la paleta de tailwind.config.ts; las clases «arcatierra-*» no existen
                (solo eran variables CSS) y dejaban el botón y la franja final invisibles. */}
            <div className="bg-neutro-crema rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-verde-principal">Envíanos un mensaje</h2>
              
              <form onSubmit={handleSubmit} noValidate data-testid="contacto-formulario" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-verde-tipografia mb-2">Nombre</label>
                    <input
                      ref={refs.nombre}
                      type="text"
                      id="nombre"
                      name="nombre"
                      data-testid="contacto-nombre"
                      autoComplete="name"
                      maxLength={MAXIMO.nombre}
                      value={form.nombre}
                      onChange={(e) => cambiar('nombre', e.target.value)}
                      aria-invalid={invalido === 'nombre' || undefined}
                      className={`${CLASE_CAMPO} ${borde('nombre')}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-verde-tipografia mb-2">Correo electrónico</label>
                    <input
                      ref={refs.email}
                      type="email"
                      id="email"
                      name="email"
                      data-testid="contacto-email"
                      autoComplete="email"
                      maxLength={MAXIMO.email}
                      value={form.email}
                      onChange={(e) => cambiar('email', e.target.value)}
                      aria-invalid={invalido === 'email' || undefined}
                      className={`${CLASE_CAMPO} ${borde('email')}`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-verde-tipografia mb-2">
                    Asunto <span className="text-sm text-verde-suave">(opcional)</span>
                  </label>
                  <input
                    ref={refs.asunto}
                    type="text"
                    id="asunto"
                    name="asunto"
                    data-testid="contacto-asunto"
                    maxLength={MAXIMO.asunto}
                    value={form.asunto}
                    onChange={(e) => cambiar('asunto', e.target.value)}
                    className={`${CLASE_CAMPO} ${borde('asunto')}`}
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-verde-tipografia mb-2">Mensaje</label>
                  <textarea
                    ref={refs.mensaje}
                    id="mensaje"
                    name="mensaje"
                    data-testid="contacto-mensaje"
                    rows={5}
                    maxLength={MAXIMO.mensaje}
                    value={form.mensaje}
                    onChange={(e) => cambiar('mensaje', e.target.value)}
                    aria-invalid={invalido === 'mensaje' || undefined}
                    className={`${CLASE_CAMPO} ${borde('mensaje')}`}
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    ref={refs.privacidad}
                    type="checkbox"
                    id="privacidad"
                    name="privacidad"
                    data-testid="contacto-privacidad"
                    checked={acepto}
                    onChange={(e) => {
                      setAcepto(e.target.checked)
                      if (invalido === 'privacidad') setInvalido(null)
                    }}
                    aria-invalid={invalido === 'privacidad' || undefined}
                    className="h-5 w-5 text-terracota-principal focus:ring-terracota-principal"
                  />
                  <label htmlFor="privacidad" className="ml-2 text-sm text-verde-tipografia">
                    He leído y acepto la <Link href="/privacidad" className="text-terracota-principal hover:underline">Política de Privacidad</Link>
                  </label>
                </div>

                {/* Trampa: invisible para personas y lectores de pantalla; un bot que la llena no deja nada guardado. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor="contacto-sitio">Sitio web</label>
                  <input
                    type="text"
                    id="contacto-sitio"
                    name="sitio"
                    data-testid="contacto-sitio"
                    tabIndex={-1}
                    autoComplete="off"
                    value={sitio}
                    onChange={(e) => setSitio(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  data-testid="contacto-enviar"
                  disabled={enviando}
                  className="bg-terracota-principal hover:bg-terracota-oscuro text-white font-semibold py-3 px-6 rounded-lg transition duration-300 disabled:opacity-60"
                >
                  {enviando ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            </div>

            {/* Información de contacto */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-6 text-verde-principal">Otras formas de contactarnos</h2>
              
              {/* Teléfono */}
              <div className="bg-neutro-crema p-6 rounded-xl shadow-md">
                <div className="flex items-start">
                  <div className="bg-terracota-principal rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-verde-principal">Teléfono</h3>
                    <a href={CONTACTO.telefonoHref} className="text-verde-tipografia hover:underline" data-testid="contacto-telefono">
                      {CONTACTO.telefonoVisible}
                    </a>
                    <p className="text-sm text-verde-suave mt-1">Lunes a viernes: 9:00 - 18:00</p>
                    <p className="text-sm text-verde-suave">Sábados: 9:00 - 14:00</p>
                  </div>
                </div>
              </div>
              
              {/* Email */}
              <div className="bg-neutro-crema p-6 rounded-xl shadow-md">
                <div className="flex items-start">
                  <div className="bg-terracota-principal rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-verde-principal">Correo electrónico</h3>
                    <a href={`mailto:${CORREO_GENERAL}`} className="text-terracota-principal hover:underline" data-testid="contacto-correo-general">{CORREO_GENERAL}</a>
                    <p className="text-sm text-verde-suave mt-2">Experiencias y visitas a las chinampas:</p>
                    <a href={`mailto:${CORREO_EXPERIENCIAS}`} className="text-terracota-principal hover:underline" data-testid="contacto-correo-experiencias">{CORREO_EXPERIENCIAS}</a>
                    <p className="text-sm text-verde-suave mt-1">Respondemos en menos de 24 horas</p>
                  </div>
                </div>
              </div>
              
              {/* Ubicación */}
              <div className="bg-neutro-crema p-6 rounded-xl shadow-md">
                <div className="flex items-start">
                  <div className="bg-terracota-principal rounded-full p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-verde-principal">Visítanos</h3>
                    <p className="text-verde-tipografia">Chinampas de Xochimilco, CDMX</p>
                    <p className="text-sm text-verde-suave mt-1">Visitas con cita previa</p>
                    <Link href="/experiencias" className="inline-block mt-3 text-terracota-principal hover:text-terracota-oscuro font-medium">
                      Agenda una experiencia →
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Redes sociales */}
              <div className="mt-8">
                <h3 className="font-bold text-xl mb-4 text-verde-principal">Síguenos en redes sociales</h3>
                <div className="flex space-x-4">
                  <a href={CONTACTO.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Arca Tierra" data-testid="contacto-red-instagram" className="bg-terracota-principal hover:bg-terracota-oscuro text-white p-3 rounded-full transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href={CONTACTO.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook de Arca Tierra" data-testid="contacto-red-facebook" className="bg-terracota-principal hover:bg-terracota-oscuro text-white p-3 rounded-full transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </a>
                  <a href={CONTACTO.redes.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok de Arca Tierra" data-testid="contacto-red-tiktok" className="bg-terracota-principal hover:bg-terracota-oscuro text-white p-3 rounded-full transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={ICONO_TIKTOK_PATH} />
                    </svg>
                  </a>
                  <a href={CONTACTO.redes.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube de Arca Tierra" data-testid="contacto-red-youtube" className="bg-terracota-principal hover:bg-terracota-oscuro text-white p-3 rounded-full transition duration-300">
                    <Youtube className="h-6 w-6" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="bg-verde-principal text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Prefieres hablar personalmente?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Agenda una visita a nuestras chinampas en Xochimilco y conoce de primera mano
            nuestro proyecto de agricultura regenerativa.
          </p>
          <Link 
            href="/experiencias" 
            className="inline-block bg-terracota-principal hover:bg-terracota-oscuro text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Explorar experiencias
          </Link>
        </div>
      </section>
    </>
  );
}
