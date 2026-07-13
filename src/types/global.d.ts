// Declaraciones globales para TypeScript

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      N8N_WEBHOOK_URL?: string
      MP_ACCESS_TOKEN?: string
    }
  }
}

export {}
