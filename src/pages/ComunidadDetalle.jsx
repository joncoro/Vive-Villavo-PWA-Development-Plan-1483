import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiArrowLeft, FiUserPlus } = FiIcons

const ComunidadDetalle = () => {
  const { id } = useParams()
  const [comunidad, setComunidad] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadComunidad = async () => {
      try {
        const { data, error } = await supabase
          .from('comunidades_vv23')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setComunidad(data)
      } catch (error) {
        console.error('Error loading comunidad:', error)
        toast.error('Error al cargar la comunidad')
      } finally {
        setLoading(false)
      }
    }

    loadComunidad()
  }, [id])

  const handleJoin = () => {
    toast.success('¡Te has unido a la comunidad!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!comunidad) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comunidad no encontrada</h2>
          <Link to="/comunidades" className="text-primary-600 hover:text-primary-500">
            Volver a comunidades
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
          src={comunidad.imagen_url || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800'}
          alt={comunidad.nombre}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-4 left-4">
          <Link
            to="/comunidades"
            className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {comunidad.nombre}
          </h1>

          <div className="flex items-center gap-3 text-gray-600 mb-8">
            <SafeIcon icon={FiUsers} className="text-sabana-500" />
            <span>Comunidad</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Descripción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {comunidad.descripcion}
            </p>
          </div>

          {comunidad.intereses && comunidad.intereses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Intereses
              </h2>
              <div className="flex flex-wrap gap-2">
                {comunidad.intereses.map((interes) => (
                  <span
                    key={interes}
                    className="bg-sabana-100 text-sabana-800 px-3 py-2 rounded-full text-sm font-medium"
                  >
                    {interes}
                  </span>
                ))}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoin}
            className="w-full bg-sabana-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-sabana-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiUserPlus} />
            Unirse a la comunidad
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default ComunidadDetalle