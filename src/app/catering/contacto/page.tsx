'use client';

import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { API_URL } from '@/lib/api';

const TIPOS_EVENTO = [
  'Boda',
  'Cena corporativa',
  'Cumpleaños',
  'Lanzamiento de producto',
  'Conferencia',
  'Cocktail',
  'Aniversario',
  'Reunión familiar',
  'Otro',
] as const;

interface FormState {
  nombre: string;
  email: string;
  telefono: string;
  tipo_evento: string;
  invitados: string;
  fecha_evento: string;
  lugar: string;
  empresa: string;
  presupuesto: string;
  restricciones: string;
  mensaje: string;
}

const INITIAL_STATE: FormState = {
  nombre: '',
  email: '',
  telefono: '',
  tipo_evento: '',
  invitados: '',
  fecha_evento: '',
  lugar: '',
  empresa: '',
  presupuesto: '',
  restricciones: '',
  mensaje: '',
};

const inputClass =
  'w-full px-4 py-2 border border-neutro-borde rounded-lg text-verde-tipografia focus:ring-2 focus:ring-terracota focus:border-transparent outline-none transition';
const labelClass = 'block text-sm font-medium mb-1 text-verde-principal';

export default function CateringContactoPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombre = form.nombre.trim();
    const email = form.email.trim();
    if (!nombre) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const body = {
      nombre,
      email,
      telefono: form.telefono || null,
      tipo_evento: form.tipo_evento || null,
      fecha_evento: form.fecha_evento || null,
      numero_personas: Number(form.invitados) || null,
      empresa: form.empresa || null,
      ubicacion: form.lugar || null,
      restricciones: form.restricciones || null,
      presupuesto_aprox: Number(form.presupuesto) || null,
      mensaje: form.mensaje || null,
    };

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/catering/solicitud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error('request-failed');
      }
      // Consumimos la respuesta (data.message) aunque mostramos copy fijo de éxito.
      await res.json().catch(() => null);
      setSubmitted(true);
      setForm(INITIAL_STATE);
    } catch {
      setError(
        'No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos a catering@arcatierra.com',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutro-light">
      {/* Hero */}
      <section className="bg-verde-principal text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Catering por Arca Tierra
          </h1>
          <p className="text-lg md:text-xl text-neutro-crema max-w-2xl mx-auto">
            Llevamos la experiencia de nuestra cocina chinampera a tu evento. Ingredientes locales,
            productos de la mejor calidad, presentación impecable.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-lg border border-neutro-borde p-6 md:p-10">
          {!submitted ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-verde-dark mb-2">
                  Cuéntanos sobre tu evento
                </h2>
                <p className="text-verde-suave">
                  Nuestro equipo te contactará en menos de 24 horas para cotizar.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-rojo bg-rojo-bg px-4 py-3 text-sm text-rojo"
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="nombre" className={labelClass}>
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      value={form.nombre}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="telefono" className={labelClass}>
                      Número de teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Tipo de evento */}
                  <div>
                    <label htmlFor="tipo_evento" className={labelClass}>
                      Tipo de evento
                    </label>
                    <select
                      id="tipo_evento"
                      name="tipo_evento"
                      value={form.tipo_evento}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Selecciona una opción</option>
                      {TIPOS_EVENTO.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Número de invitados */}
                  <div>
                    <label htmlFor="invitados" className={labelClass}>
                      Número aproximado de invitados
                    </label>
                    <input
                      type="number"
                      id="invitados"
                      name="invitados"
                      min={1}
                      value={form.invitados}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Fecha tentativa */}
                  <div>
                    <label htmlFor="fecha_evento" className={labelClass}>
                      Fecha tentativa del evento
                    </label>
                    <input
                      type="date"
                      id="fecha_evento"
                      name="fecha_evento"
                      value={form.fecha_evento}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Lugar del evento (full) */}
                  <div className="md:col-span-2">
                    <label htmlFor="lugar" className={labelClass}>
                      Lugar del evento
                    </label>
                    <input
                      type="text"
                      id="lugar"
                      name="lugar"
                      value={form.lugar}
                      onChange={handleChange}
                      placeholder="Ciudad, colonia o dirección aproximada"
                      className={`${inputClass} placeholder:text-verde-suave`}
                    />
                  </div>

                  {/* Empresa / Razón social */}
                  <div>
                    <label htmlFor="empresa" className={labelClass}>
                      Empresa / Razón social
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={form.empresa}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Presupuesto aproximado */}
                  <div>
                    <label htmlFor="presupuesto" className={labelClass}>
                      Presupuesto aproximado (MXN)
                    </label>
                    <input
                      type="number"
                      id="presupuesto"
                      name="presupuesto"
                      min={0}
                      value={form.presupuesto}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* Restricciones (full) */}
                  <div className="md:col-span-2">
                    <label htmlFor="restricciones" className={labelClass}>
                      Restricciones alimentarias / alergias
                    </label>
                    <textarea
                      id="restricciones"
                      name="restricciones"
                      rows={2}
                      value={form.restricciones}
                      onChange={handleChange}
                      placeholder="Vegetariano, vegano, sin gluten, alergias, etc."
                      className={`${inputClass} resize-none placeholder:text-verde-suave`}
                    />
                  </div>

                  {/* Mensaje (full) */}
                  <div className="md:col-span-2">
                    <label htmlFor="mensaje" className={labelClass}>
                      Cuéntanos más sobre tu evento
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      value={form.mensaje}
                      onChange={handleChange}
                      placeholder="Cuéntanos qué tienes en mente para tu evento."
                      className={`${inputClass} resize-none placeholder:text-verde-suave`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Enviar solicitud de catering"
                  className="w-full flex items-center justify-center gap-2 bg-terracota-principal hover:bg-terracota-oscuro text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Enviando…' : 'Enviar solicitud'}
                </button>

                <p className="text-center text-sm text-verde-suave">
                  Nuestro equipo te contactará en menos de 24 horas.
                </p>
              </form>
            </>
          ) : (
            <div className="py-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutro-crema text-verde-dark mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-verde-dark mb-2">
                Solicitud recibida — Te contactaremos pronto
              </h2>
              <p className="text-verde-suave mb-6">
                Nuestro equipo te contactará en menos de 24 horas para cotizar tu evento.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                aria-label="Enviar otra solicitud de catering"
                className="inline-flex items-center justify-center gap-2 bg-verde-principal hover:bg-verde-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Enviar otra solicitud
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
