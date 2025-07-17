import ClientProductoPage from './client-page';

// Este es un Server Component en Next.js 15
export default async function ProductoPage({ params }: { params: { id: string } }) {
  // Await el params para cumplir con el tipo Promise<any>
  const resolvedParams = await Promise.resolve(params);
  const { id } = resolvedParams;
  return <ClientProductoPage id={id} />;
}