import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import useAppStore from '../store/appStore'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCalendar, FiUsers, FiMapPin, FiImage, FiType, FiClock, FiDollarSign } = FiIcons

const contentTypes = [
  {
    id: 'evento',
    label: 'Evento',
    icon: FiCalendar,
    description: 'Organiza un evento en la ciudad'
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    icon: FiUsers,
    description: 'Crea una comunidad de interés'
  },
  {
    id: 'lugar',
    label: 'Lugar',
    icon: FiMapPin,
    description: 'Comparte un lugar especial'
  },
]

const Crear = () => {
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { createEvento, createComunidad, createLugar } = useAppStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    if (!selectedType) {
      toast.error('Selecciona un tipo de contenido')
      return
    }

    if (!user?.id) {
      toast.error('Error: Usuario no identificado')
      return
    }

    setLoading(true)
    try {
      let result

      switch (selectedType) {
        case 'evento':
          // Validar campos específicos para eventos
          if (!data.titulo || !data.descripcion || !data.fecha || !data.ubicacion) {
            toast.error('Por favor completa todos los campos requeridos')
            return
          }

          result = await createEvento({
            titulo: data.titulo.trim(),
            descripcion: data.descripcion.trim(),
            fecha: data.fecha,
            hora: data.hora || null,
            ubicacion: data.ubicacion.trim(),
            precio: data.precio ? parseInt(data.precio) : 0,
            categoria: data.categoria || null,
            imagen_url: data.imagen_url?.trim() || null,
            creado_por: user.id
          })
          break

        case 'comunidad':
          // Validar campos específicos para comunidades
          if (!data.titulo || !data.descripcion) {
            toast.error('Por favor completa todos los campos requeridos')
            return
          }

          result = await createComunidad({
            nombre: data.titulo.trim(),
            descripcion: data.descripcion.trim(),
            ubicacion: data.ubicacion?.trim() || null,
            imagen_url: data.imagen_url?.trim() || null,
            intereses: [], // Se puede expandir después
            creado_por: user.id
          })
          break

        case 'lugar':
          // Validar campos específicos para lugares
          if (!data.titulo || !data.descripcion || !data.ubicacion) {
            toast.error('Por favor completa todos los campos requeridos')
            return
          }

          result = await createLugar({
            nombre: data.titulo.trim(),
            descripcion: data.descripcion.trim(),
            direccion: data.ubicacion.trim(),
            tipo: data.tipo || null,
            imagen_url: data.imagen_url?.trim() || null,
            creado_por: user.id
          })
          break

        default:
          throw new Error('Tipo de contenido no válido')
      }

      if (result) {
        toast.success('¡Contenido enviado para revisión!')
        reset()
        setSelectedType(null)
      }
    } catch (error) {
      console.error('Error creating content:', error)
      const errorMessage = error.message || 'Error desconocido al crear contenido'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-crema p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Crea contenido para Villavo
          </h1>
          <p className="text-lg text-gray-600">
            Comparte eventos, comunidades y lugares especiales con la ciudad
          </p>
        </motion.div>

        {!selectedType ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6"
          >
            {contentTypes.map((type, index) => (
              <motion.button
                key={type.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(type.id)}
                className="bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <SafeIcon icon={type.icon} className="text-2xl text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {type.label}
                    </h3>
                    <p className="text-gray-600">
                      {type.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  setSelectedType(null)
                  reset()
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ←
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                Crear {contentTypes.find(t => t.id === selectedType)?.label}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo título/nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span>
                  {selectedType === 'evento' ? 'Título del evento' : 'Nombre'}
                </label>
                <div className="relative">
                  <SafeIcon icon={FiType} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register('titulo', { 
                      required: 'Este campo es requerido',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                      maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={selectedType === 'evento' ? 'Ej: Concierto en el parque' : 'Ej: Comunidad de fotografía'}
                  />
                </div>
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
                )}
              </div>

              {/* Campo descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span>
                  Descripción
                </label>
                <textarea
                  {...register('descripcion', { 
                    required: 'Este campo es requerido',
                    minLength: { value: 10, message: 'Mínimo 10 caracteres' },
                    maxLength: { value: 500, message: 'Máximo 500 caracteres' }
                  })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Describe los detalles..."
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
                )}
              </div>

              {/* Campo ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span>
                  {selectedType === 'lugar' ? 'Dirección' : 'Ubicación'}
                </label>
                <div className="relative">
                  <SafeIcon icon={FiMapPin} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register('ubicacion', { 
                      required: selectedType === 'comunidad' ? false : 'Este campo es requerido',
                      minLength: { value: 5, message: 'Mínimo 5 caracteres' }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Centro de Villavicencio"
                  />
                </div>
                {errors.ubicacion && (
                  <p className="mt-1 text-sm text-red-600">{errors.ubicacion.message}</p>
                )}
              </div>

              {/* Campo imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen URL
                </label>
                <div className="relative">
                  <SafeIcon icon={FiImage} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    {...register('imagen_url', {
                      pattern: {
                        value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                        message: 'URL de imagen no válida'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                {errors.imagen_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.imagen_url.message}</p>
                )}
              </div>

              {/* Campos específicos para eventos */}
              {selectedType === 'evento' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="text-red-500">*</span>
                        Fecha
                      </label>
                      <input
                        type="date"
                        {...register('fecha', { 
                          required: 'Este campo es requerido',
                          validate: (value) => {
                            const selectedDate = new Date(value)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return selectedDate >= today || 'La fecha debe ser hoy o posterior'
                          }
                        })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {errors.fecha && (
                        <p className="mt-1 text-sm text-red-600">{errors.fecha.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="time"
                          {...register('hora')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio (COP)
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiDollarSign} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        max="10000000"
                        step="1000"
                        {...register('precio', {
                          min: { value: 0, message: 'El precio no puede ser negativo' },
                          max: { value: 10000000, message: 'Precio máximo: $10,000,000' }
                        })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0 (gratis)"
                      />
                    </div>
                    {errors.precio && (
                      <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      {...register('categoria')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="musica">Música</option>
                      <option value="arte">Arte</option>
                      <option value="deporte">Deporte</option>
                      <option value="gastronomia">Gastronomía</option>
                      <option value="cultura">Cultura</option>
                      <option value="tecnologia">Tecnología</option>
                      <option value="educacion">Educación</option>
                      <option value="salud">Salud y Bienestar</option>
                    </select>
                  </div>
                </>
              )}

              {/* Campos específicos para lugares */}
              {selectedType === 'lugar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de lugar
                  </label>
                  <select
                    {...register('tipo')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="parque">Parque</option>
                    <option value="museo">Museo</option>
                    <option value="tienda">Tienda</option>
                    <option value="cafe">Café</option>
                    <option value="bar">Bar</option>
                    <option value="centro_comercial">Centro Comercial</option>
                    <option value="hotel">Hotel</option>
                    <option value="clinica">Clínica/Hospital</option>
                    <option value="educativo">Centro Educativo</option>
                  </select>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar para revisión'
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Crear