/**
 * NextAuth Route Handler
 * Configuración movida a /lib/auth-config.ts
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-config'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
