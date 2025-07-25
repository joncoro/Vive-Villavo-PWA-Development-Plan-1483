import React from 'react'
import BottomNavigation from './BottomNavigation'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-crema">
      <main className="pb-20">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}

export default Layout