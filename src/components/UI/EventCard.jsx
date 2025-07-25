import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiCalendar, FiMapPin, FiDollarSign } = FiIcons

const EventCard = ({ evento, className = '' }) => {
  const formattedDate = format(new Date(evento.fecha), 'dd MMM', { locale: es })
  const formattedTime = evento.hora ? format(new Date(`2000-01-01T${evento.hora}`), 'HH:mm') : null
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}
    >
      <Link to={`/evento/${evento.id}`}>
        <div className="relative">
          <img
            src={evento.imagen_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400'}
            alt={evento.titulo}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="flex items-center gap-1 text-primary-600">
              <SafeIcon icon={FiCalendar} className="text-sm" />
              <span className="text-sm font-medium">{formattedDate}</span>
            </div>
          </div>
          {evento.precio && evento.precio > 0 && (
            <div className="absolute top-3 right-3 bg-primary-500 text-white rounded-lg px-2 py-1">
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiDollarSign} className="text-sm" />
                <span className="text-sm font-medium">{evento.precio.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
            {evento.titulo}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {evento.descripcion}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiMapPin} className="text-xs" />
              <span className="truncate">{evento.ubicacion}</span>
            </div>
            {formattedTime && (
              <span className="font-medium">{formattedTime}</span>
            )}
          </div>
          
          {evento.categoria && (
            <div className="mt-3">
              <span className="inline-block bg-sabana-100 text-sabana-800 px-2 py-1 rounded-full text-xs font-medium">
                {evento.categoria}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default EventCard