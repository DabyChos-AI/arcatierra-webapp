/**
 * NextAuth Configuration
 * Configuración de autenticación para Arca Tierra
 */

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Por ahora, configuración básica para desarrollo
        // En producción esto se conectaría a tu base de datos
        if (credentials?.email && credentials?.password) {
          // Usuario demo para desarrollo
          if (credentials.email === 'demo@arcatierra.com' && credentials.password === 'demo123') {
            return {
              id: '1',
              email: credentials.email,
              name: 'Usuario Demo',
            }
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key',
})

export { handler as GET, handler as POST }

