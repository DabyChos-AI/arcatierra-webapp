// K2 (R11, DR77 del 23-oct): modo oscuro del panel. Sin 'use client' a propósito: layout.tsx (servidor) lee el script.
// Claro por defecto; la elección se guarda en cada aparato (localStorage), nunca en la base. Solo /admin: el atributo
// lo pone el panel y lo quita al salir, así que el sitio público nunca se pinta oscuro.

export type TemaAdmin = 'claro' | 'oscuro'

export const LLAVE_TEMA_ADMIN = 'arca-admin-tema'
export const ATRIBUTO_TEMA_ADMIN = 'data-tema-admin'

// Corre antes de pintar (carga directa de una página del panel), para que el oscuro no parpadee en claro. En una
// navegación del sitio al panel no corre (React no ejecuta scripts insertados): ahí lo pone AdminLayoutClient.
export const SCRIPT_TEMA_ADMIN = `try{if(localStorage.getItem('${LLAVE_TEMA_ADMIN}')==='oscuro')document.documentElement.setAttribute('${ATRIBUTO_TEMA_ADMIN}','oscuro')}catch(e){}`

export function leerTemaGuardado(): TemaAdmin {
  try {
    return window.localStorage.getItem(LLAVE_TEMA_ADMIN) === 'oscuro' ? 'oscuro' : 'claro'
  } catch {
    return 'claro'
  }
}

export function guardarTema(tema: TemaAdmin) {
  try {
    if (tema === 'oscuro') window.localStorage.setItem(LLAVE_TEMA_ADMIN, 'oscuro')
    else window.localStorage.removeItem(LLAVE_TEMA_ADMIN)
  } catch {
    // Navegación privada o almacenamiento bloqueado: el tema dura lo que la pestaña.
  }
}
