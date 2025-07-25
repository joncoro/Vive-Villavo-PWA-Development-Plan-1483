import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../store/appStore'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiMapPin, FiPlus } = FiIcons

const Comunidades = () => {
  const { comunidades, loading, loadComunidades } = useAppStore()
  
  useEffect(() => {
    loadComunidades()
  }, [loadComunidades])
  
  return (
    <div className="min-h-screen bg-crema p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Comunidades de Villavo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Conecta con personas que comparten tus intereses
          </p>
          
          <Link
            to="/crear"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200"
          >
            <SafeIcon icon={FiPlus} />
            Crear comunidad
          </Link>
        </motion.div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm h-64 animate-pulse">
                <div className="bg-gray-200 h-32 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-3 rounded w-full"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comunidades.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {comunidades.map((comunidad, index) => (
              <motion.div
                key={comunidad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <Link to={`/comunidad/${comunidad.id}`}>
                  <div className="relative">
                    <img
                      src={comunidad.imagen_url || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400'}
                      alt={comunidad.nombre}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <div className="flex items-center gap-1 text-sabana-600">
                        <SafeIcon icon={FiUsers} className="text-sm" />
                        <span className="text-sm font-medium">Comunidad</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {comunidad.nombre}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {comunidad.descripcion}
                    </p>
                    
                    {comunidad.intereses && comunidad.intereses.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {comunidad.intereses.slice(0, 3).map((interes) => (
                          <span
                            key={interes}
                            className="bg-sabana-100 text-sabana-800 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {interes}
                          </span>
                        ))}
                        {comunidad.intereses.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{comunidad.intereses.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiUsers} className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Aún no hay comunidades!
            </h3>
            <p className="text-gray-600 mb-6">
              Sé el primero en crear una comunidad para conectar con otros.
            </p>
            <Link
              to="/crear"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200"
            >
              <SafeIcon icon={FiPlus} />
              Crear la primera comunidad
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Comunidades