'use client';

import React, { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { CheckCircle, Users, Leaf, Heart, ShoppingCart, Calendar, Phone, MapPin, ArrowRight, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Nuevos componentes del redesign
import HeroSlideshow from '@/components/HeroSlideshow';
import CategorySlider from '@/components/CategorySlider';
import VirtudesSection from '@/components/VirtudesSection';
import CanastasGrid from '@/components/CanastasGrid';
import ExperienciasGrid from '@/components/ExperienciasGrid';

// Datos de métricas de ejemplo
const metricas = {
  familiasBeneficiadas: 120,
  co2Ahorrado: "2.5 ton",
  aguaAhorrada: "750K L",
  productoresRed: 25
};

// Página de inicio
export default function HomePage() {
  // Estado para favoritos
  const [favoritos, setFavoritos] = useState<string[]>([]);
  
  // Estado para carrito
  const [carrito, setCarrito] = useState<{
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    tipo: 'producto' | 'experiencia';
    modo?: 'suscripcion' | 'unico';
  }[]>([]);


  // Cargar favoritos desde localStorage al inicio
  useEffect(() => {
    const favoritosGuardados = localStorage.getItem('arcaTierraFavoritos');
    if (favoritosGuardados) {
      setFavoritos(JSON.parse(favoritosGuardados));
    }

    const carritoGuardado = localStorage.getItem('arcaTierraCarrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  // Función para alternar favoritos
  const toggleFavorito = (id: string) => {
    const nuevosFavoritos = favoritos.includes(id)
      ? favoritos.filter(favId => favId !== id)
      : [...favoritos, id];
    
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('arcaTierraFavoritos', JSON.stringify(nuevosFavoritos));
  };

  // Función para agregar al carrito
  const agregarAlCarrito = (
    id: string,
    nombre: string,
    precio: number,
    tipo: 'producto' | 'experiencia',
    modo?: 'suscripcion' | 'unico'
  ) => {
    // Verificar si ya existe en el carrito
    const itemExistente = carrito.find(item => item.id === id && item.modo === modo);
    
    let nuevoCarrito;
    if (itemExistente) {
      // Incrementar cantidad
      nuevoCarrito = carrito.map(item => 
        (item.id === id && item.modo === modo) 
          ? {...item, cantidad: item.cantidad + 1} 
          : item
      );
    } else {
      // Añadir nuevo item
      nuevoCarrito = [
        ...carrito, 
        {
          id,
          nombre,
          precio,
          cantidad: 1,
          tipo,
          modo
        }
      ];
    }

    setCarrito(nuevoCarrito);
    localStorage.setItem('arcaTierraCarrito', JSON.stringify(nuevoCarrito));
  };

  return (
    <>
      <main className="min-h-screen pt-[88px]">
        {/* HERO SLIDESHOW - NUEVO */}
        {/* pt-[88px] = 28px banner + 60px header */}
        <HeroSlideshow />

        {/* VIRTUDES ARCATIERRA - NUEVO */}
        <VirtudesSection />

        {/* COMPRA POR CATEGORÍAS - NUEVO */}
        <CategorySlider />

        {/* CANASTAS / PRODUCTOS DESTACADOS */}
        <section id="canastas" className="py-12 sm:py-16 md:py-20 bg-neutro-claro">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Tu despensa agroecológica, sin complicaciones
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                Suscríbete y recibe cada semana o cada dos semanas todo lo que necesitas:
                frutas y verduras frescas, tortillas, queso, huevo, proteína y más alimentos del campo.
                Deja que la tierra te organice el menú.
              </p>
              
              {/* Beneficios en lista simple */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-gray-700 mb-8">
                <span className="flex items-center gap-2">
                  <span className="text-terracota">✓</span> Frescos y de temporada
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-terracota">✓</span> 5% de descuento siempre
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-terracota">✓</span> Entrega semanal o quincenal
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-terracota">✓</span> Cancela cuando quieras
                </span>
              </div>
            </div>

            <CanastasGrid />
            
            <div className="text-center mt-10">
              <Link href="/suscripciones">
                <Button variant="outline" className="border-terracota text-terracota hover:bg-terracota hover:text-white px-6 py-3">
                  Ver todas las canastas
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* EXPERIENCIAS - TEMPORALMENTE DESHABILITADO */}
        {/* <section id="experiencias" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Experiencias
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aprende, conecta y vive experiencias únicas relacionadas con la 
                gastronomía mexicana y la agricultura sustentable.
              </p>
            </div>

            <ExperienciasGrid />
            
            <div className="text-center mt-10">
              <Link href="/experiencias">
                <Button variant="outline" className="border-terracota text-terracota hover:bg-terracota hover:text-white px-6 py-3">
                  Ver todas las experiencias
                </Button>
              </Link>
            </div>
          </div>
        </section> */}

        {/* PROPUESTA DE VALOR / BANDERAS - Diseño simple sin cards */}
        <section className="py-12 sm:py-16 md:py-20 bg-neutro-claro">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-12 text-center">
              Sembramos un futuro abundante
            </h2>
            
            {/* Lista simple de valores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <h3 className="text-lg font-bold text-verde mb-2">Agroecología</h3>
                <p className="text-gray-600 text-sm">
                  Sin pesticidas ni transgénicos
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-verde mb-2">Impacto social</h3>
                <p className="text-gray-600 text-sm">
                  Comercio justo con productores
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-verde mb-2">Calidad garantizada</h3>
                <p className="text-gray-600 text-sm">
                  Productos frescos seleccionados
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-verde mb-2">Soporte personal</h3>
                <p className="text-gray-600 text-sm">
                  Te acompañamos en cada paso
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA FINAL */}
        <section className="py-12 sm:py-16 md:py-20 bg-verde text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6 text-amber-200">
              Únete a nuestra comunidad
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Conéctate con productores locales, participa en experiencias únicas y 
              disfruta de alimentos frescos cultivados de manera sustentable.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/tienda">
                <Button size="lg" className="bg-white text-verde hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                  <ShoppingCart className="mr-2 h-5 w-5" /> Explorar Tienda
                </Button>
              </Link>
              <Link href="/nosotros">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-verde px-8 py-6 text-lg font-semibold">
                  Conoce Más
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
