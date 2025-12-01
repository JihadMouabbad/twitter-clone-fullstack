import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar' // Assure-toi que tu as Sidebar.tsx aussi
import { RightSection } from './RightSection' // Assure-toi que tu as RightSection.tsx

export const Layout = () => {
  return (
    <div className="flex justify-center min-h-screen bg-white max-w-7xl mx-auto">
      <Sidebar />
      <div className="w-1/2 border-r border-gray-100 min-h-screen pb-20">
        <Outlet />
      </div>
      <RightSection />
    </div>
  )
}
