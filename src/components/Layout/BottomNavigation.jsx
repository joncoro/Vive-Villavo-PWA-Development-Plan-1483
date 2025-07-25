import React from 'react'
import { NavLink } from 'react-router-dom'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiHome, FiMap, FiPlus, FiUsers, FiUser } = FiIcons

const BottomNavigation = () => {
  const navItems = [
    { path: '/', icon: FiHome, label: 'Inicio' },
    { path: '/mapa', icon: FiMap, label: 'Mapa' },
    { path: '/crear', icon: FiPlus, label: 'Crear' },
    { path: '/comunidades', icon: FiUsers, label: 'Comunidades' },
    { path: '/perfil', icon: FiUser, label: 'Perfil' },
  ]
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-400'
              }`
            }
          >
            <SafeIcon icon={icon} className="text-2xl mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation