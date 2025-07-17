'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tab } from '@headlessui/react';
import { ArrowRight, Check } from 'lucide-react';
import { useQuoteCart } from '../context/QuoteCartContext';

// Datos de los menús basados en el CSV
const MENU_CATEGORIES = [
  {
    name: "Desayunos",
    description: "Inicia el día con ingredientes frescos y orgánicos",
    items: [
      { name: "Desayuno Ejecutivo", price: 180, minPersons: 10, description: "Fruta fresca, yogurt orgánico, granola artesanal, pan integral, café de olla" },
      { name: "Desayuno Continental", price: 220, minPersons: 15, description: "Jugos naturales, fruta de temporada, pan artesanal, mermeladas caseras, café premium" },
      { name: "Desayuno Mexicano", price: 250, minPersons: 20, description: "Chilaquiles verdes, frijoles refritos, fruta fresca, café de olla, agua fresca" },
    ]
  },
  {
    name: "Almuerzos",
    description: "Opciones balanceadas para tu evento de día",
    items: [
      { name: "Almuerzo Saludable", price: 320, minPersons: 15, description: "Ensalada gourmet, proteína orgánica, quinoa, verduras al vapor, postre natural" },
      { name: "Almuerzo Ejecutivo", price: 380, minPersons: 20, description: "Sopa del día, plato fuerte, ensalada, postre, agua fresca, café" },
      { name: "Almuerzo Vegetariano", price: 350, minPersons: 10, description: "Bowl de quinoa, verduras orgánicas, proteína vegetal, postre vegano" },
    ]
  },
  {
    name: "Cenas",
    description: "Experiencias gastronómicas memorables",
    items: [
      { name: "Cena Gourmet", price: 450, minPersons: 25, description: "Entrada, plato fuerte premium, postre artesanal, bebida especial" },
      { name: "Cena Familiar", price: 380, minPersons: 30, description: "Platos para compartir, ensaladas variadas, postres caseros, aguas frescas" },
      { name: "Cena Vegana", price: 420, minPersons: 15, description: "Menú 100% vegano, ingredientes orgánicos, postres sin lácteos" },
    ]
  },
  {
    name: "Eventos",
    description: "Soluciones integrales para todo tipo de celebraciones",
    items: [
      { name: "Cocktail Saludable", price: 280, minPersons: 50, description: "Canapés orgánicos, bebidas naturales, frutas gourmet, snacks saludables" },
      { name: "Buffet Corporativo", price: 350, minPersons: 40, description: "Estación de ensaladas, platos calientes, postres, bebidas ilimitadas" },
      { name: "Boda Sustentable", price: 480, minPersons: 100, description: "Menú completo, decoración natural, servicio premium, bar orgánico" },
    ]
  },
];

export default function MenuPackages() {
  const [activeTab, setActiveTab] = useState(0);
  const { addMenu } = useQuoteCart();

  return (
    <section id="menus" className="py-20 bg-[#F8F7F2]">
      <div className="container mx-auto px-4">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeIn('up', 0.3)}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#464531] mb-4">
            Menús de temporada
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Diseñamos menús de temporada con ingredientes frescos y locales, garantizando sabores deliciosos y responsables. 
            Trabajamos de la mano de nuestros chefs para ofrecer platillos inspirados en la temporada.
          </p>
          <div className="w-16 h-1 bg-terracota mx-auto mt-6"></div>
        </motion.div>

        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex flex-wrap justify-center gap-2 mb-12">
            {MENU_CATEGORIES.map((category, idx) => (
              <Tab
                key={idx}
                className={({ selected }) =>
                  `px-6 py-3 rounded-full font-medium transition-all duration-300 outline-none ${
                    selected
                      ? "bg-terracota text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                {category.name}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            {MENU_CATEGORIES.map((category, idx) => (
              <Tab.Panel key={idx}>
                <motion.div
                  variants={staggerContainer(0.1, 0.2)}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {category.items.map((item, itemIdx) => (
                    <motion.div
                      key={itemIdx}
                      variants={fadeIn('up', 0.2 * (itemIdx + 1))}
                      className="h-full"
                    >
                      <Card className="p-6 h-full flex flex-col border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-xl">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-[#464531]">{item.name}</h3>
                          <div className="bg-terracota/10 px-3 py-1 rounded-full">
                            <span className="text-terracota font-semibold">${item.price}</span>
                            <span className="text-xs text-gray-500">/persona</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-6 flex-grow">{item.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                            <span>Mínimo {item.minPersons} personas</span>
                          </div>
                          
                          <Button 
                            className="w-full bg-white border border-terracota text-verde-tipografia hover:bg-terracota hover:text-white group"
                            onClick={() => addMenu({
                              id: `${category.name.toLowerCase()}-${itemIdx}`,
                              name: item.name,
                              price: item.price,
                              description: item.description,
                              minPersons: item.minPersons,
                              persons: item.minPersons
                            })}
                          >
                            <span>Cotizar</span>
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {/* Nota sobre personalización */}
        <motion.div
          variants={fadeIn('up', 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 p-8 bg-white rounded-xl shadow-lg max-w-3xl mx-auto text-center"
        >
          <h3 className="text-xl font-bold text-[#464531] mb-4">
            ¿Necesitas algo más personalizado?
          </h3>
          
          <p className="text-gray-600 mb-6">
            Nos adaptamos a tus necesidades. Además de hacer menús a la medida, ofrecemos todo tipo de servicio para hacer de tu evento una experiencia inolvidable.
          </p>
          
          <Button 
            className="bg-terracota hover:bg-terracota-oscuro text-white"
            onClick={() => {
              // Scroll al formulario de cotización
              document.getElementById('request-quote')?.scrollIntoView({ behavior: 'smooth' });
              
              // También se podría activar el carrito de cotización con un mensaje personalizado
              window.dispatchEvent(new Event('toggleQuoteCart'));
            }}
          >
            Solicitar menú personalizado
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
