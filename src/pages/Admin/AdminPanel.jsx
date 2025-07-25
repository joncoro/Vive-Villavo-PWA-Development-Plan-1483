import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAppStore from '../../store/appStore'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCheck, FiX, FiEye, FiCalendar, FiUsers, FiMapPin } = FiIcons

const AdminPanel = () => {
  const [pendingContent, setPendingContent] = useState({ eventos: [], comunidades: [], lugares: [] })
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('eventos')
  const { loadPendingContent, approveContent, rejectContent } = useAppStore()
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await loadPendingContent()
        setPendingContent(content)
      } catch (error) {
        toast.error('Error al cargar contenido pendiente')
      } finally {
        setLoading(false)
      }
    }
    
    loadContent()
  }, [loadPendingContent])
  
  const handleApprove = async (table, id) => {
    try {
      await approveContent(table, id)
      toast.success('Contenido aprobado')
      // Refresh content
      const content = await loadPendingContent()
      setPendingContent(content)
    } catch (error) {
      toast.error('Error al aprobar contenido')
    }
  }
  
  const handleReject = async (table, id) => {
    const reason = prompt('Razón del rechazo:')
    if (!reason) return
    
    try {
      await rejectContent(table, id, reason)
      toast.success('Contenido rechazado')
      // Refresh content
      const content = await loadPendingContent()
      setPendingContent(content)
    } catch (error) {
      toast.error('Error al rechazar contenido')
    }
  }
  
  const tabs = [
    { id: 'eventos', label: 'Eventos', icon: FiCalendar, count: pendingContent.eventos.length },
    { id: 'comunidades', label: 'Comunidades', icon: FiUsers, count: pendingContent.comunidades.length },
    { id: 'lugares', label: 'Lugares', icon: FiMapPin, count: pendingContent.lugares.length },
  ]
  
  const renderContentCard = (item, table) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
    >
      <div className="flex items-start gap-4">
        <img
          src={item.imagen_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200'}
          alt={item.titulo || item.nombre}
          className="w-20 h-20 rounded-xl object-cover"
        />
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {item.titulo || item.nombre}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.descripcion}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <SafeIcon icon={FiMapPin} className="text-xs" />
            <span>{item.ubicacion || item.direccion}</span>
          </div>
          
          {table === 'eventos' && (
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              {item.fecha && (
                <div className="flex items-center gap-1">
                  <SafeIcon icon={FiCalendar} className="text-xs" />
                  <span>{new Date(item.fecha).toLocaleDateString()}</span>
                </div>
              )}
              {item.precio && (
                <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                  ${item.precio.toLocaleString()}
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleApprove(table, item.id)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200"
            >
              <SafeIcon icon={FiCheck} />
              Aprobar
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReject(table, item.id)}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200"
            >
              <SafeIcon icon={FiX} />
              Rechazar
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
  
  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-crema p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Revisa y modera el contenido pendiente de aprobación
          </p>
        </motion.div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors duration-200
                ${selectedTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <SafeIcon icon={tab.icon} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          {pendingContent[selectedTab].length > 0 ? (
            pendingContent[selectedTab].map((item) => 
              renderContentCard(item, selectedTab)
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SafeIcon icon={FiEye} className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay contenido pendiente
              </h3>
              <p className="text-gray-600">
                Todo el contenido de {selectedTab} ha sido revisado.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel