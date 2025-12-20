import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Hash, Bell, Mail, User, MoreHorizontal, Feather, Bookmark, Search } from 'lucide-react'
import { auth } from '../firebase'
import logo from '../tweeetz_icon.png'

export const Sidebar = () => {
  const navigate = useNavigate()

  const goToProfile = () => {
    if (auth.currentUser) {
      navigate(`/profile/${auth.currentUser.uid}`)
    } else {
      alert("Connectez-vous d'abord !")
    }
  }

  return (
    <div className="w-1/4 min-h-screen px-4 py-4 flex flex-col items-end border-r border-gray-100">
      <div className="w-64 space-y-2">
        {/* LOGO */}
        <div
          onClick={() => navigate('/')}
          className="p-3 w-fit hover:bg-blue-50 rounded-full cursor-pointer transition"
        >
          <img src={logo} alt="Twitter Clone Logo" className="h-16 w-16 object-contain rounded-full" />
        </div>

        {/* MENU ITEMS */}
        <div onClick={() => navigate('/')}>
          <MenuItem icon={<Home size={26} />} text="Accueil" active />
        </div>
        <div onClick={() => navigate('/explore')}>
          <MenuItem icon={<Hash size={26} />} text="Explorer" />
        </div>
        <div onClick={() => navigate('/notifications')}>
          <MenuItem icon={<Bell size={26} />} text="Notifications" />
        </div>
        <div onClick={() => navigate('/bookmarks')}>
          <MenuItem icon={<Bookmark size={26} />} text="Signets" />
        </div>

        {/* Link Messages */}
        <div onClick={() => navigate('/messages')}>
          <MenuItem icon={<Mail size={26} />} text="Messages" />
        </div>

        {/* Link Profil */}
        <div onClick={goToProfile}>
          <MenuItem icon={<User size={26} />} text="Profil" />
        </div>

        <div onClick={() => navigate('/search')}>
          <MenuItem icon={<Search size={26} />} text="Recherche" />
        </div>

        {/* Tweet Button */}
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full w-full mt-4 shadow-lg transition">
          Poster
        </button>
      </div>
    </div>
  )
}

// Sub-component pour les boutons
const MenuItem = ({ icon, text, active }: any) => (
  <div
    className={`flex items-center space-x-4 p-3 rounded-full cursor-pointer transition w-fit ${active ? 'font-bold' : 'hover:bg-gray-100'
      }`}
  >
    {icon}
    <span className="text-xl hidden xl:block">{text}</span>
  </div>
)
