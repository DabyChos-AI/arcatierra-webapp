'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Calendar, Clock, Users, Phone, Mail } from 'lucide-react'

export default function BaldioReservationForm() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario a un backend
    // Por ahora solo mostraremos un mensaje de éxito
    setFormSubmitted(true)
    
    // Resetear el formulario después de 5 segundos
    setTimeout(() => {
      setFormSubmitted(false)
      const form = e.target as HTMLFormElement
      form.reset()
    }, 5000)
  }

  return (
    <section ref={ref} className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-16"
        >
          {/* Encabezado */}
          <div className="text-center">
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-[#3A4741] mb-6"
            >
              Reservaciones
            </motion.h1>
            <motion.div 
              variants={itemVariants}
              className="h-1 w-20 bg-[#B15543] mx-auto mb-8"
            />
            <motion.p 
              variants={itemVariants}
              className="text-[#3A4741]/80 max-w-2xl mx-auto text-lg"
            >
              Reserva tu mesa en Baldío y disfruta de una experiencia gastronómica única 
              con estrella Michelin. Te recomendamos hacer tu reservación con anticipación.
            </motion.p>
          </div>

          {/* Formulario y políticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulario de reservación */}
            <motion.div
              variants={itemVariants}
              className="bg-[#E3DBCB]/10 p-8 rounded-lg"
            >
              <h2 className="text-2xl font-semibold text-[#3A4741] mb-6">Formulario de Reservación</h2>
              
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md">
                  <p className="text-lg font-medium">¡Gracias por tu reservación!</p>
                  <p className="mt-2">Hemos recibido tu solicitud y nos pondremos en contacto contigo para confirmarla en breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-[#3A4741] font-medium mb-2">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        className="w-full p-3 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none"
                        placeholder="Ej. María López"
                      />
                    </div>
                    <div>
                      <label htmlFor="telefono" className="block text-[#3A4741] font-medium mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-[#3A4741]/40" />
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          required
                          className="w-full p-3 pl-10 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[#3A4741] font-medium mb-2">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-[#3A4741]/40" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full p-3 pl-10 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="fecha" className="block text-[#3A4741] font-medium mb-2">
                        Fecha
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-[#3A4741]/40" />
                        <input
                          type="date"
                          id="fecha"
                          name="fecha"
                          required
                          className="w-full p-3 pl-10 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="hora" className="block text-[#3A4741] font-medium mb-2">
                        Hora
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-5 w-5 text-[#3A4741]/40" />
                        <select
                          id="hora"
                          name="hora"
                          required
                          className="w-full p-3 pl-10 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none appearance-none bg-white"
                        >
                          <option value="">Seleccionar</option>
                          <option value="13:00">13:00</option>
                          <option value="13:30">13:30</option>
                          <option value="14:00">14:00</option>
                          <option value="14:30">14:30</option>
                          <option value="15:00">15:00</option>
                          <option value="15:30">15:30</option>
                          <option value="16:00">16:00</option>
                          <option value="19:00">19:00</option>
                          <option value="19:30">19:30</option>
                          <option value="20:00">20:00</option>
                          <option value="20:30">20:30</option>
                          <option value="21:00">21:00</option>
                          <option value="21:30">21:30</option>
                          <option value="22:00">22:00</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="personas" className="block text-[#3A4741] font-medium mb-2">
                        Personas
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-5 w-5 text-[#3A4741]/40" />
                        <select
                          id="personas"
                          name="personas"
                          required
                          className="w-full p-3 pl-10 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none appearance-none bg-white"
                        >
                          <option value="">Seleccionar</option>
                          <option value="1">1 persona</option>
                          <option value="2">2 personas</option>
                          <option value="3">3 personas</option>
                          <option value="4">4 personas</option>
                          <option value="5">5 personas</option>
                          <option value="6">6 personas</option>
                          <option value="7">7 personas</option>
                          <option value="8">8 personas</option>
                          <option value="group">Más de 8 (grupo)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-[#3A4741] font-medium mb-2">
                      Comentarios adicionales
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      className="w-full p-3 border border-[#E3DBCB] rounded-md focus:ring-2 focus:ring-[#B15543] focus:outline-none"
                      placeholder="Indique cualquier solicitud especial, restricciones alimentarias, celebraciones, etc."
                    ></textarea>
                  </div>

                  <div className="flex items-start mb-6">
                    <div className="flex items-center h-5">
                      <input
                        id="politica"
                        type="checkbox"
                        required
                        className="w-4 h-4 border border-[#E3DBCB] focus:ring-2 focus:ring-[#B15543] focus:outline-none"
                      />
                    </div>
                    <label htmlFor="politica" className="ml-2 text-sm text-[#3A4741]/80">
                      He leído y acepto la política de reservaciones y cancelaciones
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#B15543] hover:bg-[#B15543]/90 transition-colors text-white py-3 px-6 rounded-md font-medium"
                  >
                    Solicitar Reservación
                  </button>
                </form>
              )}
            </motion.div>

            {/* Políticas e información */}
            <motion.div
              variants={itemVariants}
              className="space-y-8"
            >
              <div className="bg-[#3A4741] text-white p-8 rounded-lg">
                <h2 className="text-2xl font-semibold text-[#E3DBCB] mb-6">Información Importante</h2>
                <ul className="space-y-4 text-white/80">
                  <li className="flex items-start gap-3">
                    <div className="bg-[#B15543] rounded-full p-1 mt-1 flex-shrink-0">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#E3DBCB]">Horarios</p>
                      <p>Martes a Domingo: 13:00 - 17:00 | 19:00 - 23:00</p>
                      <p>Lunes: Cerrado</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#B15543] rounded-full p-1 mt-1 flex-shrink-0">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#E3DBCB]">Capacidad</p>
                      <p>Para grupos mayores a 8 personas, por favor contacte directamente al restaurante.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-[#B15543] rounded-full p-1 mt-1 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#E3DBCB]">Menús de Degustación</p>
                      <p>Si desea reservar para disfrutar de nuestros menús de degustación, por favor indíquelo en los comentarios adicionales.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-[#E3DBCB]/30 p-8 rounded-lg">
                <h2 className="text-2xl font-semibold text-[#3A4741] mb-6">Política de Reservaciones</h2>
                <div className="space-y-4 text-[#3A4741]/80">
                  <p>
                    <strong>Confirmación:</strong> Todas las reservaciones requieren confirmación por parte de nuestro equipo, que recibirás vía correo electrónico o teléfono.
                  </p>
                  <p>
                    <strong>Cancelaciones:</strong> Si necesitas cancelar tu reservación, te pedimos hacerlo con al menos 24 horas de anticipación. Las cancelaciones tardías o ausencias podrían generar un cargo.
                  </p>
                  <p>
                    <strong>Retrasos:</strong> Te pedimos puntualidad. Si llegas con más de 15 minutos de retraso, es posible que tu mesa sea asignada a otro comensal.
                  </p>
                  <p>
                    <strong>Menús especiales:</strong> Nuestros menús de degustación requieren un mínimo de 2 personas y deben ser reservados con al menos 48 horas de anticipación.
                  </p>
                </div>
              </div>

              <div className="bg-[#E3DBCB]/30 p-8 rounded-lg">
                <h2 className="text-2xl font-semibold text-[#3A4741] mb-6">Contacto Directo</h2>
                <p className="text-[#3A4741]/80 mb-4">
                  Si prefieres hacer tu reservación por teléfono o tienes alguna consulta específica:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#B15543]" />
                    <span className="text-[#3A4741] font-medium">+52 (55) 1234 5678</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#B15543]" />
                    <span className="text-[#3A4741] font-medium">reservas@baldiorestaurante.com</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
