'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera } from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  phone?: string
  address?: string
  birthDate?: string
  preferences?: {
    newsletter: boolean
    notifications: boolean
    dietary: string[]
  }
  memberSince: string
  totalOrders: number
  favoriteExperience?: string
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)

  // Mock data del perfil
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      // Simular carga del perfil
      setTimeout(() => {
        // Detectar si es usuario demo
        const isDemoUser = session.user.email === 'prueba@prueba.com' || session.user.name === 'Usuario Prueba'
        
        const userProfile: UserProfile = isDemoUser ? {
          // Usuario demo con datos completos
          name: 'Usuario Prueba',
          email: 'prueba@prueba.com',
          phone: '+52 55 1234 5678',
          address: 'Roma Norte, Ciudad de México, CP 06700',
          birthDate: '1990-05-15',
          preferences: {
            newsletter: true,
            notifications: true,
            dietary: ['vegetariano', 'orgánico']
          },
          memberSince: '2024-01-15',
          totalOrders: 12,
          favoriteExperience: 'Tour Premium por las Chinampas'
        } : {
          // Usuario real con campos editables
          name: session.user.name || 'Usuario',
          email: session.user.email || '',
          phone: '',  // Campo vacío para que el usuario lo llene
          address: '',  // Campo vacío para que el usuario lo llene
          birthDate: '',  // Campo vacío para que el usuario lo llene
          preferences: {
            newsletter: false,
            notifications: false,
            dietary: []
          },
          memberSince: new Date().toISOString().split('T')[0], // Fecha actual
          totalOrders: 0,  // Se actualizará con datos reales
          favoriteExperience: undefined
        }
        setProfile(userProfile)
        setEditedProfile(userProfile)
        setLoading(false)
      }, 1000)
    }
  }, [session, status, router])

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = () => {
    if (editedProfile) {
      setProfile(editedProfile)
      setEditing(false)
      // Aquí iría la lógica para guardar en el servidor
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setEditing(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      })
    }
  }

  const handlePreferenceChange = (field: keyof NonNullable<UserProfile['preferences']>, value: any) => {
    if (editedProfile?.preferences) {
      setEditedProfile({
        ...editedProfile,
        preferences: {
          ...editedProfile.preferences,
          [field]: value
        }
      })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verde-principal mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile || !editedProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar el perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tu información personal y preferencias
            </p>
          </div>
          {!editing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-verde-principal text-white px-4 py-2 rounded-lg hover:bg-verde-oscuro transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-full bg-verde-principal text-white flex items-center justify-center text-2xl font-bold mx-auto">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  {editing && (
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-gray-600">{profile.email}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="h-5 w-5 text-verde-principal" />
                  <span className="text-sm">
                    Miembro desde {new Date(profile.memberSince).toLocaleDateString('es-MX', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="h-5 w-5 text-verde-principal" />
                  <span className="text-sm">{profile.totalOrders} pedidos realizados</span>
                </div>
                {profile.favoriteExperience && (
                  <div className="bg-verde-claro/20 rounded-lg p-3">
                    <p className="text-sm text-verde-oscuro">
                      <strong>Experiencia favorita:</strong><br />
                      {profile.favoriteExperience}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.email}</p>
                  <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.phone || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de nacimiento
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={editedProfile.birthDate || ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('es-MX') : 'No especificado'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                      placeholder="Colonia, Ciudad"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.address || 'No especificado'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Newsletter</p>
                    <p className="text-sm text-gray-600">Recibir información sobre nuevas experiencias</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editedProfile.preferences?.newsletter || false}
                    onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
                    disabled={!editing}
                    className="h-4 w-4 text-verde-principal focus:ring-verde-principal border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones</p>
                    <p className="text-sm text-gray-600">Recibir notificaciones de reservas y pedidos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editedProfile.preferences?.notifications || false}
                    onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    disabled={!editing}
                    className="h-4 w-4 text-verde-principal focus:ring-verde-principal border-gray-300 rounded"
                  />
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-2">Restricciones dietéticas</p>
                  <div className="flex flex-wrap gap-2">
                    {['vegetariano', 'vegano', 'sin gluten', 'sin lactosa'].map((dietary) => (
                      <label key={dietary} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedProfile.preferences?.dietary?.includes(dietary) || false}
                          onChange={(e) => {
                            const current = editedProfile.preferences?.dietary || []
                            if (e.target.checked) {
                              handlePreferenceChange('dietary', [...current, dietary])
                            } else {
                              handlePreferenceChange('dietary', current.filter(d => d !== dietary))
                            }
                          }}
                          disabled={!editing}
                          className="h-4 w-4 text-verde-principal focus:ring-verde-principal border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">{dietary}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
