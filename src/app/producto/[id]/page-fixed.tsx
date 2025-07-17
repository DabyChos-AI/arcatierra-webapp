import ClientProductoPage from './client-page';

// Definir el tipo para los parámetros compatible con PageProps de Next.js 15
type ProductoParams = {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

// Este es un Server Component en Next.js 15
export default function ProductoPage({ params }: ProductoParams) {
  // Extraer el ID del producto de los parámetros
  const { id } = params;
  
  // Renderizar el componente cliente pasándole el ID como prop
  return <ClientProductoPage id={id} />;
}
