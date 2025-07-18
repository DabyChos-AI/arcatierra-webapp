'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'

interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

export default function BaldioMenu() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState<'comida' | 'vinos' | 'bebidas'>('comida')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const comidaMenu: Record<string, MenuItem[]> = {
    "Experiencias": [
      {
        name: "Experiencia Baldío",
        description: "Menú degustación completo",
        price: "$1,500",
        category: "Experiencias"
      },
      {
        name: "Experiencia Baldío + Maridaje",
        description: "Maridaje x Tierra de Peña x Bichi",
        price: "$2,600",
        category: "Experiencias"
      },
    ],
    "Entradas": [
      {
        name: "Focaccia de Maíz",
        description: "Aceite de cilantro, puré de cebolla con chintextle",
        price: "$180",
        category: "Entradas"
      },
      {
        name: "Tostada de calabaza",
        description: "'Guaca brócoli', gusano de maguey, flores chinamperas",
        price: "$220",
        category: "Entradas"
      },
      {
        name: "Dolma de Cerdo & Hoja Santa",
        description: "Salsa de cacahuate, naranja",
        price: "$220",
        category: "Entradas"
      },
      {
        name: "Esquites",
        description: "Epazote & machaca de búfalo",
        price: "$220",
        category: "Entradas"
      },
      {
        name: "Calabazas",
        description: "Crema caramelizada, romero",
        price: "$230",
        category: "Entradas"
      },
      {
        name: "Mezcla de Jitomates de Amanalco",
        description: "Chayote encurtido, sikil pak",
        price: "$260",
        category: "Entradas"
      },
      {
        name: "Kale a las Brasas",
        description: "Colinabo, vinagreta de apionabo, manzana, queso ahumado y salsa de suero",
        price: "$280",
        category: "Entradas"
      },
      {
        name: "Cebollas a la Parrilla",
        description: "'Mantequilla de chapulines', jamaica",
        price: "$220",
        category: "Entradas"
      },
      {
        name: "Vegetales Chinamperos",
        description: "Pipián verde, ajo negro",
        price: "$300",
        category: "Entradas"
      },
      {
        name: "Crudo de Pesca del Día",
        description: "Leche de tigre, salsa macha y pepino",
        price: "$400",
        category: "Entradas"
      },
    ],
    "Platos Fuertes": [
      {
        name: "Tamal y Barbacoa de Hongos",
        description: "Con guacachile, salsa borracha y acompañamiento de verduras encurtidas",
        price: "$320",
        category: "Platos Fuertes"
      },
      {
        name: "Trucha Nemi Natura",
        description: "En su propio caramelo con tomate rostizado",
        price: "$400",
        category: "Platos Fuertes"
      },
      {
        name: "Lomo de Cerdo Pelón Mexicano",
        description: "Mole de guayaba y hojas de la chinampa",
        price: "$450",
        category: "Platos Fuertes"
      },
      {
        name: "Cerdo Pelón con Mole de Tamarindo",
        description: "Para taquear en lechugas chinamperas y kimchi casero (para compartir)",
        price: "$600",
        category: "Platos Fuertes"
      },
    ],
    "Postres": [
      {
        name: "Helado de Yogurt y Betabel",
        description: "Betabeles de la chinampa encurtidos, shiso",
        price: "$195",
        category: "Postres"
      },
      {
        name: "Helado de horchata",
        description: "Merengue de elote",
        price: "$195",
        category: "Postres"
      },
      {
        name: "Sandwich de chocolate",
        description: "Mermelada de chipotle",
        price: "$220",
        category: "Postres"
      },
      {
        name: "Bizcocho de Maíz",
        description: "Helado & praline de mezquite, galleta de amaranto, pixtle & rosita de cacao",
        price: "$220",
        category: "Postres"
      },
    ],
    "Extras": [
      {
        name: "Orden de tostadas",
        description: "4 piezas",
        price: "$50",
        category: "Extras"
      },
      {
        name: "Orden de tortillas",
        description: "4 piezas",
        price: "$50",
        category: "Extras"
      },
      {
        name: "Orden de focaccia de maíz",
        description: "",
        price: "$90",
        category: "Extras"
      },
    ]
  }
  
  const vinosMenu: Record<string, MenuItem[]> = {
    "Tierra de Peña": [
      {
        name: "Apapacho 2023",
        description: "Tierra de Peña x Luis Aburto, blanco con skin contact, Moscatel de Alejandría, Colón, Querétaro",
        price: "$330 / $1,900",
        category: "Tierra de Peña"
      },
      {
        name: "Tempranillo en la mañana 2023",
        description: "Tierra de Peña x Luis Aburto, tinto, Tempranillo, Colón, Querétaro",
        price: "$330 / $1,900",
        category: "Tierra de Peña"
      },
      {
        name: "Tierra viva 2022",
        description: "Tierra de Peña x Luis Aburto, tinto, Cabernet Sauvignon – Merlot – Tempranillo, Colón, Querétaro",
        price: "$330 / $1,900",
        category: "Tierra de Peña"
      },
    ],
    "Bichi": [
      {
        name: "Petmex 2023",
        description: "Bichi x Noël Tellez, pet-nat, Docetto – Lambrusco – Misión, Tecate, Baja California",
        price: "$310 / $1,850",
        category: "Bichi"
      },
      {
        name: "Gorda Yori 2024",
        description: "Bichi x Noël Tellez, naranja, Sauvignon blanc, Tecate, Baja California",
        price: "$360 / $2,100",
        category: "Bichi"
      },
      {
        name: "No Sapiens 2023",
        description: "Bichi x Noël Tellez, tinto, Dolcetto, Tecate, Baja California",
        price: "$310 / $1,850",
        category: "Bichi"
      },
    ],
    "Por copa (125 ml)": [
      {
        name: "Zafado 2023",
        description: "Altos Norte x José Vega y Karim Hernández, Pet-nat rosado, Malbec – Tempranillo, Altos de Jalisco",
        price: "$300",
        category: "Por copa"
      },
      {
        name: "Uvas orgánicas 2024",
        description: "Casa Madero x Christian Rojas, Chenin Blanc, Valle de Parras – Coahuila",
        price: "$280",
        category: "Por copa"
      },
      {
        name: "La Poubelle 2024",
        description: "Pijoan x Silvana Pijoan, Sauvignon Blanc, Valle de Guadalupe – Baja California",
        price: "$280",
        category: "Por copa"
      },
      {
        name: "No te soporto 2021",
        description: "Viñas del tigre x Aldo Quesada, Vino fortificado con grappa tipo oporto (60 ml), Valle de Guadalupe – Baja California",
        price: "$240",
        category: "Por copa"
      },
    ],
    "Vino por botella": [
      {
        name: "Burbujas",
        description: "Piel de luna, Zafado, Tóxico y más",
        price: "$1,670-$1,800",
        category: "Vino por botella"
      },
      {
        name: "Blancos",
        description: "Uvas orgánicas, Todos Contentos, Fractura, Viognier y más",
        price: "$1,400-$2,100",
        category: "Vino por botella"
      },
      {
        name: "Tintos",
        description: "Néctar de Campo, No Sapiens, Grenache, Tempranillo en la mañana y más",
        price: "$1,700-$1,900",
        category: "Vino por botella"
      },
    ],
  }
  
  const bebidasMenu: Record<string, MenuItem[]> = {
    "Coctelería": [
      {
        name: "Mistela Spritz",
        description: "Mistela Pijoan, pet-nat rosado Altos Norte, soda, jarabe de miel, tintura de mandarina (250 ml)",
        price: "$320",
        category: "Coctelería"
      },
      {
        name: "Sin maíz no hay país",
        description: "Pox Tres Almas, licor de maíz palomero, miso de maíz, jarabe ahumado de pelo de elote (90 ml)",
        price: "$220",
        category: "Coctelería"
      },
      {
        name: "Mai tai pulquero",
        description: "Destilado de pulque Mezotera, ron añejo Paranubes, Sabroso mandarichelo, pulque curado de cacahuate (250 ml)",
        price: "$280",
        category: "Coctelería"
      },
      {
        name: "Negroni chinampero",
        description: "Gin Satvrnal, Vermouth de Casa, bitter chinampero, tintura de mandarina (90 ml)",
        price: "$230",
        category: "Coctelería"
      },
    ],
    "Cerveza y Fermentos": [
      {
        name: "Morenos, Lager",
        description: "Cerveza de draft (355 ml)",
        price: "$130",
        category: "Cerveza"
      },
      {
        name: "Doble Ipa, Baldio",
        description: "Cerveza de draft (355 ml)",
        price: "$130",
        category: "Cerveza"
      },
      {
        name: "Pulque natural",
        description: "Fermento casero (250 ml)",
        price: "$90",
        category: "Fermentos"
      },
      {
        name: "Tepache de temporada",
        description: "Mora azul, Fresa y miel, o Tamarindo (250 ml)",
        price: "$120",
        category: "Fermentos"
      },
    ],
    "Agaves y Destilados": [
      {
        name: "Mezcal Criollo",
        description: "Cartucho, Angustifolia, San José Chalmita, 50% (45 ml)",
        price: "$230",
        category: "Agaves"
      },
      {
        name: "Tequila Cascahuín Blanco",
        description: "Jalisco, 38% (45 ml)",
        price: "$200",
        category: "Agaves"
      },
      {
        name: "Sotol Desierto",
        description: "Flor del Desierto, 47% (45 ml)",
        price: "$220",
        category: "Sotol"
      },
      {
        name: "Whisky de maíz negro",
        description: "Juan del Campo, 42% (45 ml)",
        price: "$190",
        category: "Whisky"
      },
    ],
    "Café y Bebidas Sin Alcohol": [
      {
        name: "Espresso",
        description: "(45 ml)",
        price: "$50",
        category: "Café"
      },
      {
        name: "Americano filtrado en Chemex",
        description: "(200 ml)",
        price: "$60",
        category: "Café"
      },
      {
        name: "Infusión – terruño",
        description: "Con pelo de elote, vainilla, maguey, cáscara de cacao, rosita de cacao, mezquite (45 ml)",
        price: "$70",
        category: "Infusiones"
      },
      {
        name: "Agua de jengibre",
        description: "",
        price: "$40",
        category: "Aguas"
      },
    ],
  }
  
  let menu: Record<string, MenuItem[]>;
  switch (activeTab) {
    case 'vinos':
      menu = vinosMenu;
      break;
    case 'bebidas':
      menu = bebidasMenu;
      break;
    case 'comida':
    default:
      menu = comidaMenu;
      break;
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
          <div className="text-center mb-16">
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-[#3A4741] mb-6"
            >
              Nuestro Menú
            </motion.h1>
            <motion.div 
              variants={itemVariants}
              className="h-1 w-24 bg-[#B15543] mx-auto mb-8"
            />
            <motion.p 
              variants={itemVariants}
              className="text-[#3A4741]/80 max-w-2xl mx-auto text-lg"
            >
              Nuestro menú evoluciona constantemente con las estaciones y la disponibilidad de ingredientes.
              Estos son algunos de nuestros platillos destacados.
            </motion.p>
            
            {/* Tabs de navegación */}
            <div className="flex justify-center items-center mt-8 border-b border-[#E3DBCB]">
              <button
                onClick={() => setActiveTab('comida')}
                className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${activeTab === 'comida' 
                  ? 'text-[#B15543] border-b-2 border-[#B15543]' 
                  : 'text-[#3A4741]/70 hover:text-[#B15543]/80'}`}
              >
                Comida
              </button>
              <button
                onClick={() => setActiveTab('vinos')}
                className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${activeTab === 'vinos' 
                  ? 'text-[#B15543] border-b-2 border-[#B15543]' 
                  : 'text-[#3A4741]/70 hover:text-[#B15543]/80'}`}
              >
                Vinos
              </button>
              <button
                onClick={() => setActiveTab('bebidas')}
                className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${activeTab === 'bebidas' 
                  ? 'text-[#B15543] border-b-2 border-[#B15543]' 
                  : 'text-[#3A4741]/70 hover:text-[#B15543]/80'}`}
              >
                Bebidas
              </button>
            </div>
          </div>

          {/* Imagen decorativa */}
          <motion.div 
            variants={itemVariants}
            className="relative h-64 w-full mb-16 overflow-hidden rounded-lg"
          >
            <OptimizedImage 
              src="/images/baldio/menu_header.jpg" 
              alt="Platillos de Baldío" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3A4741]/70 to-transparent flex items-center">
              <div className="text-white max-w-md px-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-4">Cocina de Temporada</h2>
                <p className="text-white/90">
                  Nuestro menú refleja los ciclos de la naturaleza y la frescura de los ingredientes de temporada.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Categorías del Menú */}
          {Object.entries(menu).map(([category, items]) => (
            <motion.div
              key={category}
              variants={containerVariants}
              className="mb-16"
            >
              <motion.h2 
                variants={itemVariants}
                className="text-2xl md:text-3xl font-semibold text-[#B15543] mb-6 border-b border-[#E3DBCB] pb-3"
              >
                {category}
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-[#E3DBCB]/10 p-6 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-medium text-[#3A4741]">{item.name}</h3>
                      <span className="text-[#B15543] font-semibold">{item.price}</span>
                    </div>
                    <p className="text-[#3A4741]/70">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Menús Degustación */}
          <motion.div
            variants={containerVariants}
            className="bg-[#3A4741] p-8 rounded-lg text-white"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl md:text-3xl font-semibold text-[#E3DBCB] mb-6 text-center"
            >
              Menús Degustación
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                variants={itemVariants}
                className="bg-white/10 p-6 rounded-lg text-center"
              >
                <h3 className="text-2xl font-medium text-white mb-2">Menú Tierra</h3>
                <p className="text-[#E3DBCB] mb-4">
                  7 tiempos que reflejan la riqueza de nuestra tierra y la temporada
                </p>
                <div className="text-2xl font-bold text-[#B15543] mb-4">$1,200 por persona</div>
                <p className="text-white/70 text-sm">
                  Maridaje opcional: $850 adicionales
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white/10 p-6 rounded-lg text-center"
              >
                <h3 className="text-2xl font-medium text-white mb-2">Menú Baldío</h3>
                <p className="text-[#E3DBCB] mb-4">
                  12 tiempos de experiencia gastronómica completa con los mejores platillos
                </p>
                <div className="text-2xl font-bold text-[#B15543] mb-4">$1,800 por persona</div>
                <p className="text-white/70 text-sm">
                  Maridaje opcional: $1,200 adicionales
                </p>
              </motion.div>
            </div>
            
            <motion.p 
              variants={itemVariants}
              className="text-white/70 text-center mt-6"
            >
              * Todos nuestros menús degustación requieren reservación previa
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
