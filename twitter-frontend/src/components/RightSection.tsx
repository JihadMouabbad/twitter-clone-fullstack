import React from 'react'
import { Search, Music } from 'lucide-react'

export const RightSection = () => {
  return (
    <div className="w-1/4 hidden lg:block px-6 py-2 space-y-4">
      <div className="sticky top-2 bg-white pt-2 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Recherche"
            className="w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Spotify Widget Fixé */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Music size={20} className="text-green-500" /> Spotify
        </h2>
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition">
          <img
            src="https://i.scdn.co/image/ab67616d0000b27315583569472e61df3f707f17"
            alt="album"
            className="w-12 h-12 rounded-md"
          />
          <div>
            <p className="text-sm font-bold">Matebkich</p>
            <p className="text-xs text-gray-500">Cheb Hasni</p>
          </div>
          <div className="ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h2 className="font-bold text-xl">Tendances pour vous</h2>
        <TrendItem category="Tech · Trending" title="#DevMaroc" tweets="10.5K" />
        <TrendItem category="Music · Trending" title="Cheb Hasni" tweets="52K" />
        <TrendItem category="Politics · Trending" title="Casablanca" tweets="1.2M" />
      </div>
    </div>
  )
}

const TrendItem = ({ category, title, tweets }: any) => (
  <div className="cursor-pointer hover:bg-gray-200 p-2 rounded transition">
    <p className="text-xs text-gray-500">{category}</p>
    <p className="font-bold text-sm">{title}</p>
    <p className="text-xs text-gray-500">{tweets} Tweets</p>
  </div>
)
