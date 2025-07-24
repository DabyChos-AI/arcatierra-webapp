import type { Metadata } from 'next';

// Esta función se ejecuta en el servidor
export async function generateMetadata() {
  // El catálogo ahora es estático y se carga automáticamente desde productos.ts
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
