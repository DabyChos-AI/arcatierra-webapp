'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { API_URL } from '@/lib/api'

interface UploadedImage {
  url: string
  filename?: string
}

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  categoria?: string
  label?: string
  placeholder?: string
  className?: string
}

interface GalleryUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  categoria?: string
  label?: string
  maxImages?: number
  className?: string
}

// API_URL imported from @/lib/api

export function ImageUploader({
  value,
  onChange,
  categoria = 'experiencias',
  label = 'Imagen',
  placeholder = 'Arrastra una imagen o haz clic para seleccionar',
  className = ''
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('categoria', categoria)

      const response = await fetch(`/api/admin/upload/imagen`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onChange(data.primary_url)
      } else {
        setError(data.detail || 'Error al subir imagen')
      }
    } catch (err) {
      setError('Error de conexión al subir imagen')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        uploadFile(file)
      } else {
        setError('Solo se permiten imágenes')
      }
    }
  }, [categoria])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📷 {label}
        </label>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={value.startsWith('/') ? value : `${API_URL}${value}`}
            alt="Imagen subida"
            className="w-full h-48 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/experiencias-placeholder.jpg'
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {value}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
              <p className="text-sm text-gray-600">Subiendo y optimizando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-sm text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP (máx. 10MB)</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mt-2">
        <p className="text-xs text-gray-500">
          O pega una URL directamente:
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="mt-1 w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  )
}

export function GalleryUploader({
  value = [],
  onChange,
  categoria = 'experiencias',
  label = 'Galería de Imágenes',
  maxImages = 10,
  className = ''
}: GalleryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFiles = async (files: FileList) => {
    if (value.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          formData.append('files', file)
        }
      })
      formData.append('categoria', categoria)

      const response = await fetch(`/api/admin/upload/imagenes-multiple`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success && data.uploaded.length > 0) {
        const newUrls = data.uploaded.map((img: UploadedImage) => img.url)
        onChange([...value, ...newUrls])
      }

      if (data.errors?.length > 0) {
        setError(`${data.errors.length} imagen(es) no se pudieron subir`)
      }
    } catch (err) {
      setError('Error de conexión al subir imágenes')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      uploadFiles(files)
    }
  }, [value, categoria])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleRemove = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🖼️ {label} ({value.length}/{maxImages})
        </label>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url.startsWith('/') || url.startsWith('http') ? url : `${API_URL}${url}`}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/experiencias-placeholder.jpg'
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
              <p className="text-sm text-gray-600">Subiendo imágenes...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">Arrastra imágenes o haz clic</p>
              <p className="text-xs text-gray-400">Puedes seleccionar múltiples</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

export default ImageUploader
