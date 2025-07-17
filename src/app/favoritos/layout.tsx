import { cargarProductosDesdeCSV } from '@/data/productos';

// Esta función se ejecuta en el servidor
export async function generateMetadata() {
  await cargarProductosDesdeCSV();
  return {
    title: 'Favoritos Arca Tierra - Tus productos preferidos',
    description: 'Guarda y administra tus productos favoritos de Arca Tierra para compras futuras.',
  };
}

// Este es un componente de servidor que carga los datos
export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
