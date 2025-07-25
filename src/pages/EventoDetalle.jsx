import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import useAppStore from '../store/appStore'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiStar, FiArrowLeft } = FiIcons

const EventoDetalle = () => {
  const { id } = useParams()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { addReward } = useAppStore()

  useEffect(() => {
    const loadEvento = async () => {
      try {
        const { data, error } = await supabase
          .from('eventos_vv23')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setEvento(data)
      } catch (error) {
        console.error('Error loading evento:', error)
        toast.error('Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }

    loadEvento()
  }, [id])

  const handleAttend = async () => {
    if (!evento.precio || evento.precio === 0) {
      toast.success('¡Asistencia confirmada!')
      return
    }

    try {
      // Simulate payment and add rewards
      await addReward(user.id, evento.id, evento.precio)
      toast.success(`¡Asistencia confirmada! Ganaste ${Math.floor(evento.precio / 1000)} puntos`)
    } catch (error) {
      toast.error('Error al confirmar asistencia')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-500">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = format(new Date(evento.fecha), 'EEEE, dd MMMM yyyy', { locale: es })
  const formattedTime = evento.hora ? format(new Date(`2000-01-01T${evento.hora}`), 'HH:mm') : null

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="relative">
        <img
          src={evento.imagen_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'}
          alt={evento.titulo}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} />
          </Link>
        </div>
        {evento.precio && evento.precio > 0 && (
          <div className="absolute top-4 right-4 bg-primary-500 text-white rounded-xl px-3 py-2">
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiDollarSign} />
              <span className="font-semibold">{evento.precio.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {evento.titulo}
          </h1>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-600">
              <SafeIcon icon={FiCalendar} className="text-primary-500" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            {formattedTime && (
              <div className="flex items-center gap-3 text-gray-600">
                <SafeIcon icon={FiClock} className="text-primary-500" />
                <span>{formattedTime}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <SafeIcon icon={FiMapPin} className="text-primary-500" />
              <span>{evento.ubicacion}</span>
            </div>
            {evento.categoria && (
              <div className="flex items-center gap-3">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                  {evento.categoria}
                </span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {evento.descripcion}
            </p>
          </div>

          {evento.precio && evento.precio > 0 && (
            <div className="bg-primary-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <SafeIcon icon={FiStar} className="text-primary-600" />
                <h3 className="text-lg font-semibold text-primary-900">
                  Gana puntos con tu asistencia
                </h3>
              </div>
              <p className="text-primary-700">
                Al asistir a este evento ganarás <strong>{Math.floor(evento.precio / 1000)} puntos</strong> que podrás usar en futuros eventos.
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAttend}
            className="w-full bg-primary-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 transition-colors duration-200"
          >
            {evento.precio && evento.precio > 0 ? 'Comprar entrada' : 'Confirmar asistencia'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default EventoDetalle