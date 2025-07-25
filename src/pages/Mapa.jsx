import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../store/appStore'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMapPin, FiCalendar, FiUsers, FiNavigation } = FiIcons

const Mapa = () => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const { eventos, comunidades, lugares, loadEventos, loadComunidades, loadLugares } = useAppStore()
  
  useEffect(() => {
    loadEventos()
    loadComunidades()
    loadLugares()
  }, [loadEventos, loadComunidades, loadLugares])
  
  useEffect(() => {
    // Initialize Google Maps
    const initMap = () => {
      if (!window.google) {
        console.error('Google Maps API not loaded')
        return
      }
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 4.1420, lng: -73.6266 }, // Villavicencio coordinates
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })
      
      setMap(mapInstance)
    }
    
    if (window.google) {
      initMap()
    } else {
      // Load Google Maps API
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.onload = initMap
      document.head.appendChild(script)
    }
  }, [])
  
  useEffect(() => {
    if (!map) return
    
    // Clear existing markers
    // Add markers for eventos
    eventos.forEach(evento => {
      if (evento.geolocalizacion) {
        const [lat, lng] = evento.geolocalizacion.split(',').map(Number)
        
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: evento.titulo,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#F47C26" stroke="white" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="20">📅</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        })
        
        marker.addListener('click', () => {
          setSelectedItem({ type: 'evento', data: evento })
        })
      }
    })
    
    // Add markers for comunidades
    comunidades.forEach(comunidad => {
      if (comunidad.geolocalizacion) {
        const [lat, lng] = comunidad.geolocalizacion.split(',').map(Number)
        
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: comunidad.nombre,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#22c55e" stroke="white" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="20">👥</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        })
        
        marker.addListener('click', () => {
          setSelectedItem({ type: 'comunidad', data: comunidad })
        })
      }
    })
    
    // Add markers for lugares
    lugares.forEach(lugar => {
      if (lugar.geolocalizacion) {
        const [lat, lng] = lugar.geolocalizacion.split(',').map(Number)
        
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: lugar.nombre,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#f1a02e" stroke="white" stroke-width="2"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="20">📍</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40)
          }
        })
        
        marker.addListener('click', () => {
          setSelectedItem({ type: 'lugar', data: lugar })
        })
      }
    })
  }, [map, eventos, comunidades, lugares])
  
  const getItemIcon = (type) => {
    const icons = {
      evento: FiCalendar,
      comunidad: FiUsers,
      lugar: FiMapPin
    }
    return icons[type]
  }
  
  const getItemColor = (type) => {
    const colors = {
      evento: 'text-primary-600',
      comunidad: 'text-sabana-600',
      lugar: 'text-tierra-600'
    }
    return colors[type]
  }
  
  const getItemLink = (type, id) => {
    const routes = {
      evento: `/evento/${id}`,
      comunidad: `/comunidad/${id}`,
      lugar: `/lugar/${id}`
    }
    return routes[type]
  }
  
  return (
    <div className="h-screen relative">
      {/* Map */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-lg p-4 z-10">
        <h3 className="font-semibold text-gray-900 mb-3">Leyenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs">
              📅
            </div>
            <span className="text-sm text-gray-700">Eventos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sabana-500 rounded-full flex items-center justify-center text-white text-xs">
              👥
            </div>
            <span className="text-sm text-gray-700">Comunidades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-tierra-500 rounded-full flex items-center justify-center text-white text-xs">
              📍
            </div>
            <span className="text-sm text-gray-700">Lugares</span>
          </div>
        </div>
      </div>
      
      {/* Selected Item Card */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 z-10"
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${getItemColor(selectedItem.type)} bg-gray-100`}>
              <SafeIcon icon={getItemIcon(selectedItem.type)} className="text-xl" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedItem.data.titulo || selectedItem.data.nombre}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {selectedItem.data.descripcion}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">
                  {selectedItem.type}
                </span>
                <a
                  href={`#${getItemLink(selectedItem.type, selectedItem.data.id)}`}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors duration-200"
                >
                  Ver detalles
                </a>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <SafeIcon icon={FiNavigation} className="text-lg rotate-45" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Mapa