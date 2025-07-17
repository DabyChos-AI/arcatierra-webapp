import { cargarProductosDesdeCSV } from '@/data/productos';

// Esta función se ejecuta en el servidor
export async function generateMetadata() {
  await cargarProductosDesdeCSV();
  return {
    title: 'Tienda Arca Tierra - Productos orgánicos y agroecológicos',
    description: 'Explora nuestra variedad de productos orgánicos, agroecológicos y locales. Apoya a pequeños productores y comunidades mientras cuidas de tu salud y del planeta.',
  };
}

// Este es un componente de servidor que carga los datos
export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
