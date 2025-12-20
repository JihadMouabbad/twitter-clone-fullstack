import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Hash, Bell, Mail, User, MoreHorizontal, Feather, Bookmark, Search, Settings, Monitor, Eye, EyeOff, LayoutTemplate } from 'lucide-react'
import { auth } from '../firebase'
import logo from '../tweeetz_icon.png'
import { useLayout } from '../context/LayoutContext'

export const Sidebar = () => {
  const navigate = useNavigate()
  const { sidebarMode, setSidebarMode, showRightSection, toggleRightSection, toggleSidebarMode, setTweetModalOpen } = useLayout()
  const [showSettings, setShowSettings] = useState(false)

  const goToProfile = () => {
    if (auth.currentUser) {
      navigate(`/profile/${auth.currentUser.uid}`)
    } else {
      alert("Connectez-vous d'abord !")
    }
  }

  const isCompact = sidebarMode === 'compact'

  return (
    <div className={`${isCompact ? 'w-[80px] items-center' : 'w-[275px] items-end'} min-h-screen px-4 py-4 flex flex-col border-r border-gray-100 transition-all duration-300 flex-shrink-0`}>
      <div className={`${isCompact ? 'w-fit' : 'w-full'} space-y-2 relative`}>
        {/* LOGO */}
        <div
          onClick={() => navigate('/')}
          className="p-3 w-fit hover:bg-blue-50 rounded-full cursor-pointer transition mb-4"
        >
          <img src={logo} alt="Twitter Clone Logo" className="h-14 w-14 object-contain rounded-full" />
        </div>

        {/* MENU ITEMS */}
        <div onClick={() => navigate('/')}>
          <MenuItem icon={<Home size={28} />} text="Accueil" active compact={isCompact} />
        </div>
        <div onClick={() => navigate('/explore')}>
          <MenuItem icon={<Hash size={28} />} text="Explorer" compact={isCompact} />
        </div>
        <div onClick={() => navigate('/notifications')}>
          <MenuItem icon={<Bell size={28} />} text="Notifications" compact={isCompact} />
        </div>
        <div onClick={() => navigate('/bookmarks')}>
          <MenuItem icon={<Bookmark size={28} />} text="Signets" compact={isCompact} />
        </div>

        {/* Link Messages */}
        <div onClick={() => navigate('/messages')}>
          <MenuItem icon={<Mail size={28} />} text="Messages" compact={isCompact} />
        </div>

        {/* Link Profil */}
        <div onClick={goToProfile}>
          <MenuItem icon={<User size={28} />} text="Profil" compact={isCompact} />
        </div>

        <div onClick={() => navigate('/search')}>
          <MenuItem icon={<Search size={28} />} text="Recherche" compact={isCompact} />
        </div>

        {/* Settings Toggle */}
        <div onClick={() => setShowSettings(!showSettings)} className="relative">
          <MenuItem icon={<Settings size={28} />} text="Affichage" compact={isCompact} />

          {/* Settings Modal / Popover */}
          {showSettings && (
            <div className="absolute bottom-16 left-0 bg-white shadow-xl border rounded-2xl p-4 w-64 z-50">
              <h3 className="font-bold mb-3">Personnalisation</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Largeur Menu</label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSidebarMode('compact')}
                      className={`flex-1 text-xs py-2 rounded-md transition ${isCompact ? 'bg-white shadow text-blue-500 font-bold' : 'text-gray-500'}`}
                    >
                      Compact
                    </button>
                    <button
                      onClick={() => setSidebarMode('full')}
                      className={`flex-1 text-xs py-2 rounded-md transition ${!isCompact ? 'bg-white shadow text-blue-500 font-bold' : 'text-gray-500'}`}
                    >
                      Normal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Section Droite</label>
                  <button
                    onClick={toggleRightSection}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition border"
                  >
                    <span className="text-sm font-medium">Afficher</span>
                    {showRightSection ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tweet Button */}
        <button
          onClick={() => setTweetModalOpen(true)}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full mt-8 shadow-lg transition flex justify-center items-center ${isCompact ? 'p-4' : 'py-3 px-8 w-full'}`}
        >
          {isCompact ? <Feather size={24} /> : 'Poster'}
        </button>
      </div>
    </div>
  )
}

// Sub-component pour les boutons
const MenuItem = ({ icon, text, active, compact }: any) => (
  <div
    className={`flex items-center ${compact ? 'justify-center' : 'space-x-4'} p-3 rounded-full cursor-pointer transition w-fit ${active ? 'font-bold' : 'hover:bg-gray-100'
      }`}
    title={text}
  >
    {icon}
    {!compact && <span className="text-xl">{text}</span>}
  </div>
)
