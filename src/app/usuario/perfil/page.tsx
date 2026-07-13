'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera } from 'lucide-react'
import CountryCodeSelector from '@/components/ui/CountryCodeSelector'
import PostalCodeSelector from '@/components/ui/PostalCodeSelector'

// Mapeo de código de marcación a código de país ISO para banderas
const dialCodeToCountry: Record<string, string> = {
  '+52': 'MX', '+1': 'US', '+34': 'ES', '+54': 'AR', '+57': 'CO',
  '+56': 'CL', '+51': 'PE', '+55': 'BR', '+593': 'EC', '+58': 'VE',
  '+502': 'GT', '+53': 'CU', '+1809': 'DO', '+504': 'HN', '+503': 'SV',
  '+505': 'NI', '+506': 'CR', '+507': 'PA', '+598': 'UY', '+595': 'PY',
  '+591': 'BO', '+44': 'GB', '+33': 'FR', '+49': 'DE', '+39': 'IT',
  '+351': 'PT', '+81': 'JP', '+86': 'CN', '+91': 'IN', '+61': 'AU',
}

const getCountryCode = (dialCode: string): string => {
  return dialCodeToCountry[dialCode] || 'MX'
}

interface ZonaEntrega {
  id: number
  codigo_postal: string
  colonia: string
  municipio: string
  lunes: boolean
  martes: boolean
  miercoles: boolean
  jueves: boolean
  viernes: boolean
  sabado: boolean
  domingo: boolean
  tiempo_minimo_dias: number
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  codigoPais?: string
  address?: string
  codigoPostal?: string
  diaFavoritoEntrega?: string
  birthDate?: string
  preferences?: {
    newsletter: boolean
    notifications: boolean
    dietaryRestrictions?: {
      vegetarian: boolean
      vegan: boolean
      glutenFree: boolean
      lactoseFree: boolean
    }
  }
  memberSince: string
  totalOrders: number
  favoriteExperience?: string
  // Datos reales de la API
  apellidos?: string
  nombre_completo?: string
  direcciones?: any[]
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [zonaEntrega, setZonaEntrega] = useState<ZonaEntrega | null>(null)

  // Cargar datos reales del usuario desde la API
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.id) {
      const fetchUserProfile = async () => {
        try {
          setLoading(true)
          
          // Llamar al proxy interno (evita CORS)
          const response = await fetch('/api/auth/me', {
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const userData = await response.json()
            
            // Obtener direcciones del usuario
            const direccionesResponse = await fetch('/api/direcciones/', {
              headers: {
                'Content-Type': 'application/json',
              },
            })
            
            const direcciones = direccionesResponse.ok ? await direccionesResponse.json() : []
            const direccionPrincipal = direcciones.find((d: any) => d.activa) || direcciones[0]
            
            const userProfile: UserProfile = {
              id: userData.id,
              name: userData.nombre_completo || userData.nombre,
              email: userData.email,
              phone: userData.telefono || '',
              codigoPais: userData.codigo_pais || '+52',
              address: direccionPrincipal ? 
                `${direccionPrincipal.calle} ${direccionPrincipal.numero_exterior}, ${direccionPrincipal.colonia}, ${direccionPrincipal.alcaldia}` 
                : '',
              birthDate: userData.fecha_nacimiento || '',
              preferences: {
                newsletter: userData.preferencias?.newsletter || false,
                notifications: userData.preferencias?.notificaciones || false,
                dietaryRestrictions: {
                  vegetarian: userData.preferencias?.restricciones_dieteticas?.includes('vegetariano') || false,
                  vegan: userData.preferencias?.restricciones_dieteticas?.includes('vegano') || false,
                  glutenFree: userData.preferencias?.restricciones_dieteticas?.includes('sin_gluten') || false,
                  lactoseFree: userData.preferencias?.restricciones_dieteticas?.includes('sin_lactosa') || false
                }
              },
              memberSince: userData.fecha_registro || new Date().toISOString().split('T')[0],
              totalOrders: 0,
              apellidos: userData.apellidos,
              nombre_completo: userData.nombre_completo,
              direcciones: direcciones
            }
            
            setProfile(userProfile)
            setEditedProfile(userProfile)
          } else {
            console.error('Error al cargar perfil:', await response.text())
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchUserProfile()
    }
  }, [session, status, router])

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    if (editedProfile) {
      try {
        // Preparar restricciones dietéticas
        const restrictions: string[] = []
        if (editedProfile.preferences?.dietaryRestrictions) {
          if (editedProfile.preferences.dietaryRestrictions.vegetarian) restrictions.push('vegetariano')
          if (editedProfile.preferences.dietaryRestrictions.vegan) restrictions.push('vegano')
          if (editedProfile.preferences.dietaryRestrictions.glutenFree) restrictions.push('sin_gluten')
          if (editedProfile.preferences.dietaryRestrictions.lactoseFree) restrictions.push('sin_lactosa')
        }
        
        // Preparar datos para el backend
        const updateData = {
          nombre: editedProfile.name?.split(' ')[0],
          apellidos: editedProfile.name?.split(' ').slice(1).join(' '),
          nombre_completo: editedProfile.name,
          telefono: editedProfile.phone,
          direccion_principal: editedProfile.address,
          fecha_nacimiento: editedProfile.birthDate || null,
          preferencias: {
            newsletter: editedProfile.preferences?.newsletter || false,
            notificaciones: editedProfile.preferences?.notifications || false,
            restricciones_dieteticas: restrictions
          }
        }
        
        console.log('🔄 Guardando perfil...', updateData)
        console.log('📍 URL: /api/auth/me (proxy interno)')
        
        // Llamar al proxy interno de Next.js (sin CORS)
        const response = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        })
        
        console.log('📡 Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Error response:', errorText)
          let error
          try {
            error = JSON.parse(errorText)
          } catch {
            error = { detail: errorText }
          }
          throw new Error(error.detail || 'Error actualizando perfil')
        }
        
        const updatedUser = await response.json()
        console.log('✅ Perfil actualizado:', updatedUser)
        
        setProfile(editedProfile)
        setEditing(false)
        alert('Perfil actualizado exitosamente')
      } catch (error) {
        console.error('❌ Error guardando perfil:', error)
        alert(`Error guardando los cambios: ${error}`)
      }
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
                  <div className="flex gap-2">
                    <div className="w-28 flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      {editing ? (
                        <CountryCodeSelector
                          value={editedProfile.codigoPais || ''}
                          onChange={(code) => handleInputChange('codigoPais', code)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 h-[42px]">
                          {profile.codigoPais ? (
                            <>
                              <img 
                                src={`https://flagcdn.com/w40/${getCountryCode(profile.codigoPais).toLowerCase()}.png`}
                                alt="País"
                                className="w-6 h-4 object-cover rounded-sm"
                              />
                              <span className="text-gray-900 font-medium">{profile.codigoPais}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                          placeholder="9992921500"
                        />
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 h-[42px] flex items-center">
                          <span className="text-gray-900">{profile.phone || 'No especificado'}</span>
                        </div>
                      )}
                    </div>
                  </div>
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
                      {profile.birthDate ? (() => {
                        const [year, month, day] = profile.birthDate.split('-');
                        return `${day}/${month}/${year}`;
                      })() : 'No especificado'}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona de entrega
                  </label>
                  {editing ? (
                    <PostalCodeSelector
                      value={editedProfile.codigoPostal || ''}
                      onChange={(cp, zona) => {
                        setZonaEntrega(zona)
                        handleInputChange('codigoPostal', cp)
                      }}
                      onRecogerEnMatriz={() => {
                        handleInputChange('address', 'Calle Anatole France 307, Polanco Reforma, Miguel Hidalgo, CDMX')
                        handleInputChange('codigoPostal', '11550')
                      }}
                    />
                  ) : (
                    <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                      {profile.codigoPostal && zonaEntrega ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-900">
                            CP {zonaEntrega.codigo_postal} - {zonaEntrega.colonia}, {zonaEntrega.municipio}
                          </span>
                        </div>
                      ) : profile.codigoPostal ? (
                        <span className="text-gray-900">CP {profile.codigoPostal}</span>
                      ) : (
                        <span className="text-gray-400">No especificado</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección (calle y número)
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-verde-principal focus:border-transparent"
                      placeholder="Ej: Av. Insurgentes Sur 1234"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.address || 'No especificado'}</p>
                  )}
                </div>

                {zonaEntrega && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Día favorito de entrega
                    </label>
                    {editing ? (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'lunes', label: 'Lunes' },
                          { key: 'martes', label: 'Martes' },
                          { key: 'miercoles', label: 'Miércoles' },
                          { key: 'jueves', label: 'Jueves' },
                          { key: 'viernes', label: 'Viernes' },
                          { key: 'sabado', label: 'Sábado' },
                          { key: 'domingo', label: 'Domingo' },
                        ].map(({ key, label }) => {
                          const disponible = zonaEntrega[key as keyof ZonaEntrega] as boolean
                          const seleccionado = editedProfile.diaFavoritoEntrega === key
                          return (
                            <button
                              key={key}
                              type="button"
                              disabled={!disponible}
                              onClick={() => handleInputChange('diaFavoritoEntrega', key)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                !disponible
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : seleccionado
                                  ? 'bg-verde-principal text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {label}
                              {!disponible && ' (No disponible)'}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                        {profile.diaFavoritoEntrega ? (
                          <span className="text-gray-900 capitalize">{profile.diaFavoritoEntrega}</span>
                        ) : (
                          <span className="text-gray-400">No especificado</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                    {[
                      { key: 'vegetarian', label: 'Vegetariano' },
                      { key: 'vegan', label: 'Vegano' },
                      { key: 'glutenFree', label: 'Sin Gluten' },
                      { key: 'lactoseFree', label: 'Sin Lactosa' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editedProfile.preferences?.dietaryRestrictions?.[item.key as keyof typeof editedProfile.preferences.dietaryRestrictions] || false}
                          onChange={(e) => {
                            const current = editedProfile.preferences?.dietaryRestrictions || {
                              vegetarian: false,
                              vegan: false,
                              glutenFree: false,
                              lactoseFree: false
                            }
                            handlePreferenceChange('dietaryRestrictions', {
                              ...current,
                              [item.key]: e.target.checked
                            })
                          }}
                          disabled={!editing}
                          className="h-4 w-4 text-verde-principal focus:ring-verde-principal border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
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
