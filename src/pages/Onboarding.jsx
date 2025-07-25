import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const interesesOptions = [
  { id: 'musica', label: 'Música', emoji: '🎵' },
  { id: 'arte', label: 'Arte', emoji: '🎨' },
  { id: 'deporte', label: 'Deporte', emoji: '⚽' },
  { id: 'gastronomia', label: 'Gastronomía', emoji: '🍽️' },
  { id: 'naturaleza', label: 'Naturaleza', emoji: '🌿' },
  { id: 'tecnologia', label: 'Tecnología', emoji: '💻' },
  { id: 'cultura', label: 'Cultura', emoji: '🏛️' },
  { id: 'fotografia', label: 'Fotografía', emoji: '📸' },
  { id: 'baile', label: 'Baile', emoji: '💃' },
  { id: 'teatro', label: 'Teatro', emoji: '🎭' },
  { id: 'lectura', label: 'Lectura', emoji: '📚' },
  { id: 'viajes', label: 'Viajes', emoji: '✈️' },
]

const Onboarding = () => {
  const [selectedIntereses, setSelectedIntereses] = useState([])
  const [loading, setLoading] = useState(false)
  const { updateProfile } = useAuthStore()
  const navigate = useNavigate()
  
  const toggleInteres = (interes) => {
    setSelectedIntereses(prev => 
      prev.includes(interes)
        ? prev.filter(i => i !== interes)
        : [...prev, interes]
    )
  }
  
  const handleComplete = async () => {
    if (selectedIntereses.length === 0) {
      toast.error('Selecciona al menos un interés')
      return
    }
    
    setLoading(true)
    try {
      await updateProfile({ intereses: selectedIntereses })
      toast.success('¡Perfil completado! Bienvenido a Vive Villavo')
      navigate('/')
    } catch (error) {
      toast.error('Error al guardar tus intereses')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-sabana-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Personaliza tu experiencia!
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona tus intereses para descubrir eventos y comunidades perfectas para ti
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            ¿Qué te apasiona?
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {interesesOptions.map((interes, index) => (
              <motion.button
                key={interes.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInteres(interes.id)}
                className={`
                  p-4 rounded-2xl border-2 transition-all duration-200
                  ${selectedIntereses.includes(interes.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-2xl mb-2">{interes.emoji}</div>
                <div className="font-medium text-sm">{interes.label}</div>
              </motion.button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">
              Has seleccionado {selectedIntereses.length} intereses
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={loading || selectedIntereses.length === 0}
              className="w-full md:w-auto px-8 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Completar perfil'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Onboarding