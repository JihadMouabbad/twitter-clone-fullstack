import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Hash, Bell, Mail, User, MoreHorizontal } from 'lucide-react'
import { auth } from '../firebase'

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
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-500 fill-current">
            <g>
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
            </g>
          </svg>
        </div>

        {/* MENU ITEMS */}
        <div onClick={() => navigate('/')}>
          <MenuItem icon={<Home size={26} />} text="Accueil" active />
        </div>
        <div onClick={() => navigate('/search')}>
          <MenuItem icon={<Hash size={26} />} text="Search" />
        </div>
        <div onClick={() => navigate('/hashtags')}>
          <MenuItem icon={<Bell size={26} />} text="Hashtags" />
        </div>

        {/* Link Messages */}
        <div onClick={() => navigate('/messages')}>
          <MenuItem icon={<Mail size={26} />} text="Messages" />
        </div>

        {/* Link Profil */}
        <div onClick={goToProfile}>
          <MenuItem icon={<User size={26} />} text="Profil" />
        </div>

        <MenuItem icon={<MoreHorizontal size={26} />} text="Plus" />

        {/* Tweet Button (inchangé visuellement, juste navigation vers l'accueil pour poster) */}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full w-full mt-4 shadow-lg transition"
          onClick={() => navigate('/')}
        >
          Poster
        </button>
      </div>
    </div>
  )
}

// Sub-component pour les boutons
const MenuItem = ({ icon, text, active }: any) => (
  <div
    className={`flex items-center space-x-4 p-3 rounded-full cursor-pointer transition w-fit ${
      active ? 'font-bold' : 'hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="text-xl hidden xl:block">{text}</span>
  </div>
)
