/**
 * Slides del Hero principal
 * Slideshow con 4 imágenes y contenido
 */

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  overlayPosition: 'left' | 'center' | 'right';
}

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Despierta donde nace la vida.",
    subtitle: "Vive los colores, la neblina y la frescura de Xochimilco al amanecer.",
    image: "/images/home/Banner_Hero-Experiencia_del_mes.jpg",
    ctaText: "Ver experiencia",
    ctaLink: "/experiencias",
    overlayPosition: "left"
  },
  {
    id: 2,
    title: "Come mejor, elige lo real.",
    subtitle: "Desde las chinampas de Xochimilco, rábanos que dan color a tus preparaciones. Crujientes, versátiles y llenos de vida.",
    image: "/images/home/Banner_Producto_del_mes-rabanos.jpg",
    ctaText: "Comprar ahora",
    ctaLink: "/tienda",
    overlayPosition: "left"
  },
  {
    id: 3,
    title: "Tu mesa puede cambiar el campo.",
    subtitle: "La mejor inversión para ti, tu familia y las familias que cultivan tu alimento.",
    image: "/images/home/Banner_Hero-Suscripcion.jpg",
    ctaText: "Suscríbete ahora",
    ctaLink: "/suscripciones",
    overlayPosition: "left"
  },
  {
    id: 4,
    title: "Conservar sembrando.",
    subtitle: "Cada una de tus visitas ayuda a la restauración biocultural de la zona chinampera en Xochimilco",
    image: "/images/home/Banner_Sostenibilidad.JPG",
    ctaText: "Conocer más",
    ctaLink: "/impacto",
    overlayPosition: "left"
  }
];
