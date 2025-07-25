import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userRole, profile, loading, error } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Verificando autenticación...</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (error && !user) {
    return <Navigate to="/login" />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // Check if user needs onboarding
  if (profile && (!profile.intereses || profile.intereses.length === 0)) {
    // Don't redirect to onboarding if already on onboarding page
    if (window.location.hash !== '#/onboarding') {
      return <Navigate to="/onboarding" />
    }
  }

  // Check role permissions
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute