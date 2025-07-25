import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useAppStore from '../store/appStore'
import MoodSelector from '../components/UI/MoodSelector'
import EventCard from '../components/UI/EventCard'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiSun, FiMoon, FiCloud, FiStar, FiRefreshCw } = FiIcons

const Home = () => {
  const { user, profile } = useAuthStore()
  const { 
    eventos, 
    userMood, 
    userRewards, 
    loading, 
    loadEventos, 
    loadUserMood, 
    loadUserRewards, 
    updateUserMood 
  } = useAppStore()
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const [debugInfo, setDebugInfo] = useState({
    eventosCount: 0,
    loadStatus: 'not started',
    lastUpdate: null
  })

  useEffect(() => {
    if (user) {
      console.log('🏠 Home mounted, loading data for user:', user.id)
      loadData()
      loadUserMood(user.id)
      loadUserRewards(user.id)
    }
  }, [user])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) setTimeOfDay('morning')
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
  }, [])

  // Actualizar la información de debug cuando cambian los eventos o el estado de carga
  useEffect(() => {
    setDebugInfo({
      eventosCount: eventos.length,
      loadStatus: loading ? 'loading' : 'completed',
      lastUpdate: new Date().toLocaleTimeString()
    })
  }, [eventos, loading])

  const loadData = () => {
    console.log('🔄 Loading eventos with thisMonth filter...')
    loadEventos({ thisMonth: true })
  }

  const getGreeting = () => {
    const greetings = {
      morning: '¡Buenos días',
      afternoon: '¡Buenas tardes',
      evening: '¡Buenas noches'
    }
    return greetings[timeOfDay]
  }

  const getTimeIcon = () => {
    const icons = {
      morning: FiSun,
      afternoon: FiCloud,
      evening: FiMoon
    }
    return icons[timeOfDay]
  }

  const handleMoodSelect = async (mood) => {
    try {
      await updateUserMood(user.id, mood)
    } catch (error) {
      console.error('Error updating mood:', error)
    }
  }

  const handleRefreshEvents = () => {
    console.log('🔄 Refreshing events...')
    loadData()
  }

  return (
    <div className="min-h-screen bg-crema">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SafeIcon icon={getTimeIcon()} className="text-2xl" />
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {profile?.nombre?.split(' ')[0] || 'Villavo'}!
              </h1>
            </div>
            <p className="text-primary-100">
              ¿Cómo te sientes hoy?
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
            <SafeIcon icon={FiStar} className="text-yellow-300" />
            <span className="font-semibold">{userRewards} pts</span>
          </div>
        </div>

        <MoodSelector
          selectedMood={userMood}
          onMoodSelect={handleMoodSelect}
          className="mb-6"
        />
      </motion.div>

      {/* Events Section */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Lo que se vive este mes en Villavo
              </h2>
              <p className="text-gray-600">
                Eventos aprobados en tu ciudad
              </p>
            </div>
            <button
              onClick={handleRefreshEvents}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
              disabled={loading}
            >
              <SafeIcon 
                icon={FiRefreshCw} 
                className={`text-lg ${loading ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
          
          {/* Debug info - Solo en desarrollo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
            <p className="text-blue-800">
              <strong>Debug:</strong> {debugInfo.eventosCount} eventos encontrados | 
              Estado: {debugInfo.loadStatus} | 
              Última actualización: {debugInfo.lastUpdate}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm h-80 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-2xl"></div>
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-3 rounded w-full"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : eventos.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {eventos.map((evento, index) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EventCard evento={evento} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiStar} className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Aún no hay eventos aprobados este mes!
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Tienes una idea? Crea algo nuevo y compártelo con la ciudad.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.hash = '/crear'}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200"
            >
              Crear evento
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Home