import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Music } from 'lucide-react'
import { useLayout } from '../context/LayoutContext'

export const RightSection = () => {
  const navigate = useNavigate()
  const { showRightSection } = useLayout()

  if (!showRightSection) return null;

  return (
    <div className="w-1/4 hidden lg:block px-6 py-2 space-y-4">
      <div className="sticky top-2 bg-white pt-2 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Recherche"
            className="w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = `/explore?q=${(e.target as HTMLInputElement).value}`
              }
            }}
          />
        </div>
      </div>

      {/* Spotify Widget Fixé */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Music size={20} className="text-green-500" /> Spotify
        </h2>
        <div className="space-y-3">
          <SpotifyItem
            title="Matebkich"
            artist="Cheb Hasni"
            img="https://cdn-images.dzcdn.net/images/artist/b1d4c2271e1141753443d34608381831/500x500.jpg"
            isActive={true}
          />
          <SpotifyItem
            title="Blinding Lights"
            artist="The Weeknd"
            img="https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36"
          />
          <SpotifyItem
            title="Shape of You"
            artist="Ed Sheeran"
            img="https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h2 className="font-bold text-xl">Tendances pour vous</h2>
        <TrendItem category="Tech · Trending" title="#DevMaroc" tweets="10.5K" navigate={navigate} />
        <TrendItem category="Music · Trending" title="Cheb Hasni" tweets="52K" navigate={navigate} />
        <TrendItem category="Politics · Trending" title="Casablanca" tweets="1.2M" navigate={navigate} />
      </div>

      {/* SUGGESTIONS ANIMAUX */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h2 className="font-bold text-xl">Suggestions</h2>
        <SuggestionItem
          id="simba"
          name="Simba le Chat"
          handle="@king_simba"
          img="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop"
          navigate={navigate}
        />
        <SuggestionItem
          id="rex"
          name="Rex le Chien"
          handle="@rex_officiel"
          img="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop"
          navigate={navigate}
        />
        <SuggestionItem
          id="coco"
          name="Coco Perroquet"
          handle="@coco_talks"
          img="https://images.unsplash.com/photo-1552728089-57bdde30ebd1?w=100&h=100&fit=crop"
          navigate={navigate}
        />
      </div>
    </div>
  )
}

const TrendItem = ({ category, title, tweets, navigate }: any) => (
  <div
    onClick={() => navigate(`/explore?q=${encodeURIComponent(title)}`)}
    className="cursor-pointer hover:bg-gray-200 p-2 rounded transition"
  >
    <p className="text-xs text-gray-500">{category}</p>
    <p className="font-bold text-sm">{title}</p>
    <p className="text-xs text-gray-500">{tweets} Tweets</p>
  </div>
)

const SuggestionItem = ({ name, handle, img }: any) => {
  const [isFollowed, setIsFollowed] = React.useState(false)

  return (
    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-200 p-2 rounded transition">
      <div className="flex items-center gap-2">
        <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover" />
        <div className="text-sm">
          <p className="font-bold">{name}</p>
          <p className="text-gray-500">{handle}</p>
        </div>
      </div>
      <button
        onClick={() => setIsFollowed(!isFollowed)}
        className={`text-xs font-bold px-3 py-1 rounded-full transition ${isFollowed
          ? 'bg-transparent border border-gray-300 text-black hover:bg-red-50 hover:text-red-500 hover:border-red-500'
          : 'bg-black text-white hover:bg-gray-800'
          }`}
      >
        {isFollowed ? 'Suivi' : 'Suivre'}
      </button>
    </div>
  )
}

const SpotifyItem = ({ title, artist, img, isActive }: any) => (
  <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition">
    <img
      src={img}
      alt="album"
      className="w-12 h-12 rounded-md object-cover"
    />
    <div>
      <p className="text-sm font-bold line-clamp-1">{title}</p>
      <p className="text-xs text-gray-500">{artist}</p>
    </div>
    {isActive && (
      <div className="ml-auto">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    )}
  </div>
)
