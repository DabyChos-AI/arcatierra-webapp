'use client'

import AdminTopbar from '../components/AdminTopbar'

export default function PersonalPage() {
  return (
    <div className="flex flex-col h-full">
      <AdminTopbar />
      <div className="p-6">
        <h1 className="font-display text-3xl text-verde mb-2">Personal</h1>
        <div className="bg-amarillo-bg border border-amarillo/30 rounded-lg p-4">
          <p className="text-verde">En construccion — Fase E.</p>
        </div>
      </div>
    </div>
  )
}
