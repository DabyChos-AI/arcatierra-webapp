import { redirect } from 'next/navigation'

/**
 * Redirect a la página principal de favoritos
 * La página principal está en /favoritos (con funcionalidad de carrito)
 */
export default function UsuarioFavoritosPage() {
  redirect('/favoritos')
}
