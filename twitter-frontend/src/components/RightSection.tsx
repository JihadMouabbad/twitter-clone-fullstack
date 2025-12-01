import React from 'react'
import { Search } from 'lucide-react'

export const RightSection = () => {
  return (
    <div className="w-1/4 hidden lg:block px-6 py-2 space-y-4">
      {/* Search Bar */}
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

      {/* Bonus: Spotify Card Placeholder */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h2 className="font-bold text-lg mb-2">En écoute 🎵</h2>
        <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            S
          </div>
          <div>
            <p className="text-sm font-bold">Connecter Spotify</p>
            <p className="text-xs text-gray-500">Partagez votre vibe</p>
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h2 className="font-bold text-xl">Tendances pour vous</h2>
        <TrendItem category="Tech · Trending" title="#MarocDev" tweets="10.5K" />
        <TrendItem category="Music · Trending" title="Cheb Hasni" tweets="52K" />
        <TrendItem category="Politics · Trending" title="Election" tweets="1.2M" />
      </div>
    </div>
  )
}

const TrendItem = ({ category, title, tweets }: any) => (
  <div className="cursor-pointer hover:bg-gray-100 p-2 rounded transition">
    <p className="text-xs text-gray-500">{category}</p>
    <p className="font-bold text-sm">{title}</p>
    <p className="text-xs text-gray-500">{tweets} Tweets</p>
  </div>
)
