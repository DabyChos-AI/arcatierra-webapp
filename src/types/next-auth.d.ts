import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
    accessToken?: string
    // Sin refreshToken a propósito: la sesión llega al navegador (R2).
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    accessToken?: string
    refreshToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
  }
}
