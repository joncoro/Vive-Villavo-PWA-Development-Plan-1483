import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import useAppStore from '../store/appStore'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiMail, FiStar, FiEdit3, FiLogOut, FiSave, FiX } = FiIcons

const Profile = () => {
  const { user, profile, userRole, signOut, updateProfile } = useAuthStore()
  const { userRewards } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: ''
  })

  // Actualizar formData cuando cambie el perfil
  useEffect(() => {
    if (profile && user) {
      setFormData({
        nombre: profile.nombre || '',
        email: user.email || ''
      })
    }
  }, [profile, user])

  const handleSave = async () => {
    // Validaciones básicas
    if (!formData.nombre || !formData.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (formData.nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres')
      return
    }

    if (formData.nombre.trim().length > 50) {
      toast.error('El nombre no puede tener más de 50 caracteres')
      return
    }

    setLoading(true)
    
    try {
      console.log('🚀 Iniciando actualización del perfil...')
      
      const updates = { 
        nombre: formData.nombre.trim()
      }

      console.log('📤 Enviando actualización:', updates)

      const result = await updateProfile(updates)
      
      console.log('✅ Perfil actualizado exitosamente:', result)
      
      setEditing(false)
      toast.success('Perfil actualizado correctamente')
      
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error)
      
      // Mostrar mensaje de error específico
      const errorMessage = error.message || 'Error desconocido al actualizar perfil'
      toast.error(errorMessage)
      
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData({
      nombre: profile?.nombre || '',
      email: user?.email || ''
    })
    setEditing(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Sesión cerrada')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  // Mostrar loading si no hay datos
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-crema p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUser} className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile.nombre || 'Usuario'}
                  </h1>
                  <p className="text-primary-100 capitalize">{userRole}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <SafeIcon icon={FiStar} className="text-yellow-300" />
                  <span className="text-2xl font-bold">{userRewards}</span>
                </div>
                <p className="text-primary-100 text-sm">puntos</p>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Información personal
              </h2>
              <button
                onClick={() => editing ? handleCancel() : setEditing(true)}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
                disabled={loading}
              >
                <SafeIcon icon={editing ? FiX : FiEdit3} />
                <span>{editing ? 'Cancelar' : 'Editar'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ingresa tu nombre completo"
                    disabled={loading}
                    maxLength={50}
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                    {profile.nombre || 'No especificado'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  El correo no se puede modificar
                </p>
              </div>

              {/* Intereses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intereses
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.intereses && profile.intereses.length > 0 ? (
                    profile.intereses.map((interes) => (
                      <span
                        key={interes}
                        className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {interes}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No has seleccionado intereses aún
                    </p>
                  )}
                </div>
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={FiSave} />
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </motion.button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors duration-200"
            >
              <SafeIcon icon={FiLogOut} />
              Cerrar sesión
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile