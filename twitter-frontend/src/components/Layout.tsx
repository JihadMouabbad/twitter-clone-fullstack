// src/components/Layout.tsx
import React from 'react'
import { Sidebar } from './Sidebar'
import { RightSection } from './RightSection'
import { Outlet } from 'react-router-dom'

export const Layout = () => {
  return (
    <div className="flex justify-center min-h-screen bg-white max-w-7xl mx-auto">
      <Sidebar />
      <div className="w-1/2 border-r border-gray-100 min-h-screen pb-20">
        <Outlet /> {/* Hna fin ghadi yban content (Home ou Profile) */}
      </div>
      <RightSection />
    </div>
  )
}
