// R15 v2 · F5 (contacto · legales): «Datos que recolectamos» del aviso de privacidad = los datos que piden los formularios de HOY, uno por
// renglón (D-F5-06; D-F5-11 P-11). Nada de prosa: el nombre de cada formulario es su título de hoy y cada dato es su etiqueta de hoy (sin el
// «*» ni el «(opcional)»). `fuente` = archivo:línea del texto de hoy; `f5-contacto/pruebas/datos-contra-hoy.mjs` comprueba que cada texto esté
// en su línea y que ningún formulario de la lista pida un dato que aquí no esté (si un formulario de hoy cambia, la prueba falla).
// Fuera de la lista (no son datos de la persona): las casillas de aceptación, las trampas «Sitio web», el método de pago, el código de
// descuento, la elección entre direcciones guardadas, «Establecer como dirección principal» y el inicio de sesión (no pide datos nuevos).

export interface DatoFormulario {
  etiqueta: string
  fuente: string
}

export interface FormularioDeHoy {
  clave: string
  titulo: string
  fuente: string
  datos: readonly DatoFormulario[]
}

const d = (etiqueta: string, fuente: string): DatoFormulario => ({ etiqueta, fuente })

export const FORMULARIOS_DE_HOY: readonly FormularioDeHoy[] = [
  {
    clave: 'contacto',
    titulo: 'Contacto',
    fuente: 'src/app/contacto/page.tsx:141',
    datos: [
      d('Nombre', 'src/app/contacto/page.tsx:160'),
      d('Correo electrónico', 'src/app/contacto/page.tsx:176'),
      d('Asunto', 'src/app/contacto/page.tsx:195'),
      d('Mensaje', 'src/app/contacto/page.tsx:211'),
    ],
  },
  {
    clave: 'newsletter',
    titulo: 'Newsletter',
    fuente: 'src/components/layout/Footer.tsx:170',
    datos: [d('Tu correo', 'src/components/layout/NewsletterForm.tsx:108')],
  },
  {
    clave: 'compra',
    titulo: 'Finalizar compra',
    fuente: 'src/app/checkout/page.tsx:183',
    datos: [
      d('Nombre', 'src/components/CheckoutFormSingleStep.tsx:890'),
      d('Apellido', 'src/components/CheckoutFormSingleStep.tsx:904'),
      d('Código de país', 'src/components/CheckoutFormSingleStep.tsx:920'),
      d('Teléfono', 'src/components/CheckoutFormSingleStep.tsx:930'),
      d('Email', 'src/components/CheckoutFormSingleStep.tsx:947'),
      d('RFC', 'src/components/CheckoutFormSingleStep.tsx:969'),
      d('Código postal y colonia', 'src/components/checkout/DireccionEntrega.tsx:282'),
      d('Calle', 'src/components/checkout/DireccionEntrega.tsx:294'),
      d('Número exterior', 'src/components/checkout/DireccionEntrega.tsx:311'),
      d('Número interior', 'src/components/checkout/DireccionEntrega.tsx:326'),
      d('Referencias para el repartidor', 'src/components/checkout/DireccionEntrega.tsx:342'),
      d('Nombre (Casa, Oficina)', 'src/components/checkout/DireccionEntrega.tsx:359'),
      d('Notas de entrega', 'src/components/CheckoutFormSingleStep.tsx:1081'),
      d('Alergias o restricciones de comida', 'src/components/CheckoutFormSingleStep.tsx:1128'),
    ],
  },
  {
    clave: 'suscripcion',
    titulo: 'Canastas Agroecológicas de Temporada',
    fuente: 'src/app/suscripciones/page.tsx:365',
    datos: [
      d('Nombre completo', 'src/components/SubscriptionCheckoutForm.tsx:294'),
      d('Teléfono', 'src/components/SubscriptionCheckoutForm.tsx:306'),
      d('Correo electrónico', 'src/components/SubscriptionCheckoutForm.tsx:329'),
      d('Dirección completa', 'src/components/SubscriptionCheckoutForm.tsx:382'),
      d('Zona de entrega', 'src/components/SubscriptionCheckoutForm.tsx:395'),
      d('Referencias de entrega', 'src/components/SubscriptionCheckoutForm.tsx:408'),
      d('Día preferido de entrega', 'src/components/SubscriptionCheckoutForm.tsx:457'),
      d('Alergias o restricciones alimentarias', 'src/components/SubscriptionCheckoutForm.tsx:513'),
    ],
  },
  {
    clave: 'experiencia-privada',
    titulo: 'Solicitar Experiencia Privada',
    fuente: 'src/app/experiencias/[slug]/page.tsx:720',
    datos: [
      d('Nombre completo', 'src/app/experiencias/[slug]/page.tsx:750'),
      d('Email', 'src/app/experiencias/[slug]/page.tsx:765'),
      d('Teléfono', 'src/app/experiencias/[slug]/page.tsx:779'),
      d('Fecha deseada', 'src/app/experiencias/[slug]/page.tsx:796'),
      d('Horario preferido', 'src/app/experiencias/[slug]/page.tsx:809'),
      d('Número de personas', 'src/app/experiencias/[slug]/page.tsx:831'),
      d('Comentarios y requerimientos especiales', 'src/app/experiencias/[slug]/page.tsx:853'),
    ],
  },
  {
    clave: 'catering',
    titulo: 'Cuéntanos sobre tu evento',
    fuente: 'src/app/catering/contacto/page.tsx:138',
    datos: [
      d('Nombre completo', 'src/app/catering/contacto/page.tsx:159'),
      d('Correo electrónico', 'src/app/catering/contacto/page.tsx:175'),
      d('Número de teléfono', 'src/app/catering/contacto/page.tsx:191'),
      d('Tipo de evento', 'src/app/catering/contacto/page.tsx:206'),
      d('Número aproximado de invitados', 'src/app/catering/contacto/page.tsx:227'),
      d('Fecha tentativa del evento', 'src/app/catering/contacto/page.tsx:243'),
      d('Lugar del evento', 'src/app/catering/contacto/page.tsx:258'),
      d('Empresa / Razón social', 'src/app/catering/contacto/page.tsx:274'),
      d('Presupuesto aproximado (MXN)', 'src/app/catering/contacto/page.tsx:289'),
      d('Restricciones alimentarias / alergias', 'src/app/catering/contacto/page.tsx:305'),
      d('Cuéntanos más sobre tu evento', 'src/app/catering/contacto/page.tsx:321'),
    ],
  },
  {
    clave: 'catering-cotizacion',
    titulo: 'Cotiza tu evento',
    fuente: 'src/components/catering/QuoteRequestModal.tsx:172',
    datos: [
      d('Nombre completo', 'src/components/catering/QuoteRequestModal.tsx:198'),
      d('Correo electrónico', 'src/components/catering/QuoteRequestModal.tsx:213'),
      d('Teléfono', 'src/components/catering/QuoteRequestModal.tsx:228'),
      d('Tipo de evento', 'src/components/catering/QuoteRequestModal.tsx:250'),
      d('Número de invitados', 'src/components/catering/QuoteRequestModal.tsx:271'),
      d('Fecha del evento', 'src/components/catering/QuoteRequestModal.tsx:287'),
      d('Lugar del evento', 'src/components/catering/QuoteRequestModal.tsx:301'),
      d('Detalles adicionales', 'src/components/catering/QuoteRequestModal.tsx:317'),
    ],
  },
  {
    clave: 'catering-corporativa',
    titulo: 'Solicitar Propuesta Corporativa',
    fuente: 'src/components/catering/CorporateRequestModal.tsx:216',
    datos: [
      d('Nombre completo', 'src/components/catering/CorporateRequestModal.tsx:260'),
      d('Empresa', 'src/components/catering/CorporateRequestModal.tsx:276'),
      d('Correo electrónico', 'src/components/catering/CorporateRequestModal.tsx:295'),
      d('Teléfono', 'src/components/catering/CorporateRequestModal.tsx:311'),
      d('Tipo de evento', 'src/components/catering/CorporateRequestModal.tsx:330'),
      d('Número estimado de asistentes', 'src/components/catering/CorporateRequestModal.tsx:351'),
      d('Fecha tentativa del evento', 'src/components/catering/CorporateRequestModal.tsx:372'),
      d('Detalles adicionales', 'src/components/catering/CorporateRequestModal.tsx:386'),
    ],
  },
  {
    clave: 'restaurantes',
    titulo: 'Servicio a Restaurantes',
    fuente: 'src/app/restaurantes/page.tsx:296',
    datos: [
      d('Tu nombre', 'src/app/restaurantes/page.tsx:453'),
      d('Nombre del restaurante', 'src/app/restaurantes/page.tsx:473'),
      d('Email', 'src/app/restaurantes/page.tsx:495'),
      d('Teléfono', 'src/app/restaurantes/page.tsx:515'),
      d('Cuéntanos sobre tu restaurante y qué buscas', 'src/app/restaurantes/page.tsx:536'),
    ],
  },
  {
    clave: 'cuenta',
    titulo: 'Crea tu cuenta para comenzar',
    fuente: 'src/app/auth/signin/page.tsx:156',
    datos: [
      d('Nombre completo', 'src/app/auth/signin/page.tsx:257'),
      d('Email', 'src/app/auth/signin/page.tsx:270'),
      d('Contraseña', 'src/app/auth/signin/page.tsx:283'),
      d('Confirmar contraseña', 'src/app/auth/signin/page.tsx:297'),
    ],
  },
  {
    clave: 'crear-cuenta',
    titulo: 'Crear tu cuenta',
    fuente: 'src/app/crear-cuenta/CreateAccountContent.tsx:157',
    datos: [
      d('Contraseña', 'src/app/crear-cuenta/CreateAccountContent.tsx:176'),
      d('Confirmar contraseña', 'src/app/crear-cuenta/CreateAccountContent.tsx:200'),
    ],
  },
  {
    clave: 'perfil',
    titulo: 'Mi Perfil',
    fuente: 'src/app/usuario/perfil/page.tsx:281',
    datos: [
      d('Nombre completo', 'src/app/usuario/perfil/page.tsx:368'),
      d('Email', 'src/app/usuario/perfil/page.tsx:384'),
      d('País', 'src/app/usuario/perfil/page.tsx:394'),
      d('Teléfono', 'src/app/usuario/perfil/page.tsx:422'),
      d('Fecha de nacimiento', 'src/app/usuario/perfil/page.tsx:443'),
      d('Zona de entrega', 'src/app/usuario/perfil/page.tsx:464'),
      d('Dirección (calle y número)', 'src/app/usuario/perfil/page.tsx:499'),
      d('Día favorito de entrega', 'src/app/usuario/perfil/page.tsx:517'),
      d('Restricciones dietéticas', 'src/app/usuario/perfil/page.tsx:600'),
    ],
  },
  {
    clave: 'direcciones',
    titulo: 'Mis Direcciones',
    fuente: 'src/app/usuario/dashboard/page.tsx:560',
    datos: [
      d('Nombre de la dirección', 'src/app/usuario/dashboard/page.tsx:728'),
      d('Calle', 'src/app/usuario/dashboard/page.tsx:743'),
      d('Número ext.', 'src/app/usuario/dashboard/page.tsx:757'),
      d('Número int.', 'src/app/usuario/dashboard/page.tsx:770'),
      d('Zona de entrega', 'src/app/usuario/dashboard/page.tsx:785'),
      d('Referencias de entrega', 'src/app/usuario/dashboard/page.tsx:823'),
      d('Día preferido de entrega', 'src/app/usuario/dashboard/page.tsx:842'),
      d('Alergias o restricciones alimentarias', 'src/app/usuario/dashboard/page.tsx:883'),
    ],
  },
  {
    clave: 'portal',
    titulo: 'Pedir cambio o cancelación',
    fuente: 'src/app/reserva/[token]/page.tsx:239',
    datos: [
      d('¿Qué necesitas?', 'src/app/reserva/[token]/components/SolicitudForm.tsx:125'),
      d('Fecha que prefieres', 'src/app/reserva/[token]/components/SolicitudForm.tsx:156'),
      d('Mensaje', 'src/app/reserva/[token]/components/SolicitudForm.tsx:177'),
    ],
  },
]
