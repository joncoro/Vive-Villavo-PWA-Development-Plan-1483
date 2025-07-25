import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMapPin, FiArrowLeft, FiNavigation } = FiIcons

const LugarDetalle = () => {
  const { id } = useParams()
  const [lugar, setLugar] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLugar = async () => {
      try {
        const { data, error } = await supabase
          .from('lugares_vv23')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setLugar(data)
      } catch (error) {
        console.error('Error loading lugar:', error)
        toast.error('Error al cargar el lugar')
      } finally {
        setLoading(false)
      }
    }

    loadLugar()
  }, [id])

  const handleGetDirections = () => {
    if (lugar.geolocalizacion) {
      const [lat, lng] = lugar.geolocalizacion.split(',')
      window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(lugar.direccion || lugar.nombre)}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!lugar) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lugar no encontrado</h2>
          <Link to="/mapa" className="text-primary-600 hover:text-primary-500">
            Volver al mapa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Header */}
      <div className="relative">
        <img
          src={lugar.imagen_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
          alt={lugar.nombre}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-4 left-4">
          <Link
            to="/mapa"
            className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} />
          </Link>
        </div>
        {lugar.tipo && (
          <div className="absolute top-4 right-4 bg-tierra-500 text-white rounded-xl px-3 py-2">
            <span className="font-semibold capitalize">{lugar.tipo}</span>
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
            {lugar.nombre}
          </h1>

          <div className="flex items-center gap-3 text-gray-600 mb-8">
            <SafeIcon icon={FiMapPin} className="text-tierra-500" />
            <span>{lugar.direccion}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {lugar.descripcion}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGetDirections}
            className="w-full bg-tierra-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-tierra-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiNavigation} />
            Cómo llegar
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default LugarDetalle