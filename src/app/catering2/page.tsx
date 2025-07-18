'use client';

import React from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeIn, staggerContainer } from '@/lib/animations';

// Componentes de la página
import HeroBanner from './components/HeroBanner';
import ServiceDescription from './components/ServiceDescription';
import ClientLogos from './components/ClientLogos';
import MenuPackages from './components/MenuPackages';
import ServiciosAdicionales from './components/ServiciosAdicionales';
import Testimonials from './components/Testimonials';
import RequestQuote from './components/RequestQuote';

export default function CateringPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Banner principal */}
      <HeroBanner />
      
      {/* Descripción del servicio */}
      <ServiceDescription />
      
      {/* Logos de clientes */}
      <ClientLogos />
      
      {/* Paquetes de menú */}
      <MenuPackages />
      
      {/* Servicios adicionales */}
      <ServiciosAdicionales />
      
      {/* Testimonios */}
      <Testimonials />
      
      {/* Formulario de cotización */}
      <RequestQuote />
    </main>
  );
}
