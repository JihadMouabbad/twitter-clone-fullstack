// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Calendar, MapPin, Music, Palmtree } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const API_URL = 'http://localhost:3001'

export const Profile = () => {
  const { username } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const currentUserId = localStorage.getItem('userId')

  // Pour le mode vacances
  const isMyProfile = profile && profile.id === currentUserId

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/${username}`)
      setProfile(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const toggleVacation = async () => {
    // Hack rapide: On envoie l'inverse de l'état actuel
    // (Note: Faudrait creer une route PUT /users/:id pour faire ça propre)
    alert('Mode Vacances activé ! (Simulation)')
    setProfile({ ...profile, vacationMode: !profile.vacationMode })
  }

  if (!profile) return <div className="p-10 text-center">Chargement...</div>

  return (
    <div>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-2 flex items-center gap-4 z-10 border-b">
        <ArrowLeft className="cursor-pointer" onClick={() => window.history.back()} />
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            {profile.username}
            {profile.vacationMode && <Palmtree size={16} className="text-orange-500" />}
          </h2>
          <p className="text-xs text-gray-500">{profile.tweets.length} tweets</p>
        </div>
      </div>

      <div className="h-48 bg-gray-200 relative">
        {profile.vacationMode && (
          <div className="absolute inset-0 bg-orange-100/50 flex items-center justify-center">
            <span className="bg-orange-500 text-white px-4 py-1 rounded-full font-bold shadow-lg flex items-center gap-2">
              <Palmtree size={18} /> En Mode Vacances
            </span>
          </div>
        )}
      </div>

      <div className="px-4 flex justify-between items-start -mt-16 relative">
        <div className="h-32 w-32 bg-blue-100 rounded-full border-4 border-white flex items-center justify-center text-4xl font-bold text-blue-500">
          {profile.username[0].toUpperCase()}
        </div>

        {isMyProfile ? (
          <button
            onClick={toggleVacation}
            className={`mt-20 px-4 py-2 rounded-full font-bold border transition ${
              profile.vacationMode
                ? 'bg-orange-100 text-orange-600 border-orange-200'
                : 'hover:bg-gray-100'
            }`}
          >
            {profile.vacationMode ? 'Désactiver Vacances' : 'Activer Mode Vacances'}
          </button>
        ) : (
          <button className="mt-20 bg-black text-white px-4 py-2 rounded-full font-bold hover:bg-gray-800 transition">
            Suivre
          </button>
        )}
      </div>

      <div className="px-4 mt-3">
        <h1 className="font-bold text-xl">{profile.displayName || profile.username}</h1>
        <p className="text-gray-500 text-sm">@{profile.username}</p>

        {/* Spotify Widget (Bonus) */}
        <div className="my-4 bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-3 max-w-sm cursor-pointer hover:bg-green-100 transition">
          <div className="bg-green-500 p-2 rounded-full text-white">
            <Music size={20} />
          </div>
          <div>
            <p className="text-xs text-green-700 font-bold uppercase tracking-wider">
              En écoute sur Spotify
            </p>
            <p className="font-bold text-gray-900">Cheb Hasni - Matebkich</p>
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-gray-500 text-sm">
          <div className="flex items-center gap-1">
            <MapPin size={16} /> Maroc
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} /> A rejoint il y a longtemps
          </div>
        </div>

        <div className="flex gap-4 mt-3">
          <p>
            <span className="font-bold text-black">{profile._count?.following || 0}</span>{' '}
            <span className="text-gray-500">abonnements</span>
          </p>
          <p>
            <span className="font-bold text-black">{profile._count?.followedBy || 0}</span>{' '}
            <span className="text-gray-500">abonnés</span>
          </p>
        </div>
      </div>

      {/* Tweets avec Vraie Date */}
      <div className="mt-6 border-t">
        {profile.tweets.map((t: any) => (
          <div key={t.id} className="p-4 border-b hover:bg-gray-50">
            <div className="flex justify-between">
              <p className="font-bold text-sm text-gray-900">@{profile.username}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
            <p className="mt-1">{t.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
