import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import Onboarding from './pages/Onboarding'
import Profile from './pages/Profile'
import Mapa from './pages/Mapa'
import Crear from './pages/Crear'
import Comunidades from './pages/Comunidades'
import EventoDetalle from './pages/EventoDetalle'
import ComunidadDetalle from './pages/ComunidadDetalle'
import LugarDetalle from './pages/LugarDetalle'
import AdminPanel from './pages/Admin/AdminPanel'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { USER_ROLES } from './lib/supabase'
import './App.css'

function App() {
  const { user, loading, error, initialize, clearError } = useAuthStore()

  useEffect(() => {
    console.log('🚀 App starting...')
    initialize()
  }, [initialize])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  if (loading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Cargando Vive Villavo...</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show error page if there's a critical error
  if (error && !user) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="font-bold text-lg mb-2">Error de Conexión</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => {
              clearError()
              window.location.reload()
            }}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fef9f3',
              color: '#7c2d12',
              border: '1px solid #F47C26',
            },
          }}
        />
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" /> : <Register />} 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          
          {/* Main app routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mapa" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Mapa />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crear" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Crear />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/comunidades" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Comunidades />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Detail routes */}
          <Route 
            path="/evento/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EventoDetalle />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/comunidad/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ComunidadDetalle />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lugar/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <LugarDetalle />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Layout>
                  <AdminPanel />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App