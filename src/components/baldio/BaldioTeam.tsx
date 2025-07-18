'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import OptimizedImage from '@/components/ui/OptimizedImage'
import { Instagram, Twitter, Linkedin } from 'lucide-react'

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  }
}

export default function BaldioTeam() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  }

  const team: TeamMember[] = [
    {
      name: "Ana María Rodríguez",
      role: "Chef Ejecutiva",
      bio: "Formada en Le Cordon Bleu de París y con experiencia en restaurantes de renombre en Europa y América Latina, Ana María regresó a México para crear Baldío, un proyecto que fusiona sus raíces mexicanas con técnicas contemporáneas. Su filosofía culinaria se centra en el respeto al ingrediente y la temporalidad.",
      image: "/images/baldio/chef_ejecutiva.jpg",
      socialMedia: {
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
      }
    },
    {
      name: "Carlos Méndez",
      role: "Chef de Cocina",
      bio: "Especializado en técnicas de fermentación y conservación, Carlos trabaja estrechamente con productores locales para seleccionar los mejores ingredientes. Su enfoque creativo y meticuloso ha sido fundamental en el desarrollo de los platillos emblemáticos de Baldío.",
      image: "/images/baldio/chef_cocina.jpg",
      socialMedia: {
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
      }
    },
    {
      name: "Elena Gutiérrez",
      role: "Sommelier",
      bio: "Certificada por la Court of Master Sommeliers, Elena ha diseñado una carta de vinos que destaca productores mexicanos emergentes junto con etiquetas internacionales seleccionadas. Su pasión por los maridajes poco convencionales aporta una dimensión única a la experiencia Baldío.",
      image: "/images/baldio/sommelier.jpg",
      socialMedia: {
        instagram: "https://instagram.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
      }
    },
    {
      name: "Javier Torres",
      role: "Chef Pastelero",
      bio: "Con formación en el Basque Culinary Center, Javier combina técnicas clásicas de repostería con sabores mexicanos tradicionales. Su trabajo con cacao nacional y frutas autóctonas ha revolucionado la carta de postres de Baldío.",
      image: "/images/baldio/chef_pastelero.jpg",
      socialMedia: {
        instagram: "https://instagram.com",
      }
    }
  ]

  const collaborators = [
    "Comunidad de Chinamperos de Xochimilco",
    "Cooperativa de Pescadores Sustentables del Pacífico",
    "Proyecto Milpa - Conservación de Maíces Criollos",
    "Mezcaleros Tradicionales de Oaxaca",
    "Red de Apicultores de Yucatán",
    "Colectivo de Forrajeros Urbanos"
  ]

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
              Nuestro Equipo
            </motion.h1>
            <motion.div 
              variants={itemVariants}
              className="h-1 w-20 bg-[#B15543] mx-auto mb-8"
            />
            <motion.p 
              variants={itemVariants}
              className="text-[#3A4741]/80 max-w-2xl mx-auto text-lg"
            >
              Detrás de Baldío hay un equipo apasionado y comprometido con la excelencia,
              la sostenibilidad y la celebración de nuestra herencia culinaria.
            </motion.p>
          </div>

          {/* Filosofía del equipo */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants} className="order-2 md:order-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#B15543] mb-6">
                Nuestra Filosofía
              </h2>
              <div className="space-y-4 text-[#3A4741]/80">
                <p>
                  En Baldío creemos que la gastronomía es un acto de conexión con la tierra,
                  con nuestra cultura y con las personas que hacen posible cada platillo.
                </p>
                <p>
                  Trabajamos bajo los principios de respeto al producto, temporalidad y mínimo
                  desperdicio. Nuestro equipo combina técnica, creatividad y pasión para
                  ofrecer experiencias gastronómicas memorables.
                </p>
                <p>
                  Nos esforzamos por mantener relaciones justas con nuestros proveedores y
                  por construir un ambiente laboral donde cada miembro pueda crecer y desarrollarse.
                </p>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="order-1 md:order-2">
              <div className="relative h-96 overflow-hidden rounded-lg">
                <OptimizedImage 
                  src="/images/baldio/equipo_trabajando.jpg" 
                  alt="Equipo de Baldío trabajando" 
                  fill 
                  className="object-cover"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Miembros del equipo */}
          <motion.div variants={containerVariants} className="space-y-8">
            <motion.h2 
              variants={itemVariants}
              className="text-2xl md:text-3xl font-semibold text-[#3A4741] text-center mb-10"
            >
              Conoce a nuestros talentos
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-[#E3DBCB]/10 rounded-lg overflow-hidden"
                >
                  <div className="relative h-80 w-full">
                    <OptimizedImage 
                      src={member.image} 
                      alt={member.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#3A4741] mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[#B15543] font-medium mb-4">{member.role}</p>
                    <p className="text-[#3A4741]/70 text-sm mb-4">{member.bio}</p>
                    
                    {/* Social Media */}
                    {member.socialMedia && (
                      <div className="flex space-x-3">
                        {member.socialMedia.instagram && (
                          <a 
                            href={member.socialMedia.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#3A4741]/70 hover:text-[#B15543] transition-colors"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        )}
                        {member.socialMedia.twitter && (
                          <a 
                            href={member.socialMedia.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#3A4741]/70 hover:text-[#B15543] transition-colors"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                        {member.socialMedia.linkedin && (
                          <a 
                            href={member.socialMedia.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#3A4741]/70 hover:text-[#B15543] transition-colors"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Colaboradores */}
          <motion.div 
            variants={containerVariants}
            className="bg-[#3A4741] text-white p-10 rounded-lg"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl md:text-3xl font-semibold text-[#E3DBCB] mb-8 text-center"
            >
              Nuestros Colaboradores
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-white/80 text-center max-w-3xl mx-auto mb-10"
            >
              En Baldío reconocemos que nuestro trabajo sería imposible sin la dedicación y pasión de nuestros colaboradores.
              Estas son algunas de las organizaciones y productores con quienes trabajamos estrechamente:
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborators.map((collaborator, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white/5 p-5 rounded-md text-center"
                >
                  <p className="text-[#E3DBCB]">{collaborator}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
