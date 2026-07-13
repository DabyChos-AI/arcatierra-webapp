/**
 * Mensajes del banner rotativo superior
 * Se muestran en rotación cada 5 segundos
 */

export interface AnnouncementMessage {
  id: number;
  text: string;
  linkText: string;
  linkUrl: string;
}

export const announcementMessages: AnnouncementMessage[] = [
  {
    id: 1,
    text: "Apoya la Escuela Campesina en la Séptima Cena por las Chinampas",
    linkText: "Más detalles",
    linkUrl: "https://www.arcatierra.com/producto/cena-por-las-chinampas/"
  },
  {
    id: 2,
    text: "Nuevos quesos de cabra artesanales de Sierra Encantada",
    linkText: "Compra aquí",
    linkUrl: "https://www.arcatierra.com/producto/queso-artesanal-de-cabra-sierra-encantada-150-g/"
  },
  {
    id: 3,
    text: "¿Necesitas ideas para cocinar lo que hay en tu canasta?",
    linkText: "Encuentra recetas",
    linkUrl: "https://arcatierra.dabychos.com/recetas"
  }
];
