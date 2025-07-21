'use client'

import dynamic from 'next/dynamic'

// Componente con NoSSR estricto para evitar prerendering
const CreateAccountPageNoSSR = dynamic(() => import('./CreateAccountContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B15543] mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
})

export default function CreateAccountPage() {
  return <CreateAccountPageNoSSR />
}
