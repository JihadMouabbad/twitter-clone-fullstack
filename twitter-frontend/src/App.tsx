// src/App.tsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Layout } from './components/Layout'
import { Profile } from './pages/Profile'
import { Login } from './pages/Login'
import { TweetDetails } from './pages/TweetDetails' // <--- 1. Importina page jdida
import { Heart, MessageCircle, Repeat, Share } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const API_URL = 'http://localhost:3001'

// Helper pour Hashtags
const RichText = ({ text }: { text: string }) => {
  const parts = text.split(/((?:#|@)\w+)/g)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('#') || part.startsWith('@') ? (
          <span key={i} className="text-blue-500 hover:underline cursor-pointer">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  )
}

// --- COMPOSANT HOME (FEED) ---
const Home = () => {
  const [tweets, setTweets] = useState<any[]>([])
  const [content, setContent] = useState('')
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) navigate('/login')
    fetchTweets()
  }, [])

  const fetchTweets = async () => {
    try {
      const res = await axios.get(`${API_URL}/tweets`)
      setTweets(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handlePost = async () => {
    if (!content) return
    await axios.post(`${API_URL}/tweets`, { content, authorId: userId })
    setContent('')
    fetchTweets()
  }

  const handleRetweet = async (tweetId: string) => {
    try {
      await axios.post(`${API_URL}/retweet`, { userId, tweetId })
      fetchTweets()
      alert('Retweeté ! 🔄')
    } catch (e) {
      alert('Erreur retweet')
    }
  }

  const handleLike = async (tweetId: string) => {
    try {
      await axios.post(`${API_URL}/likes`, { userId, tweetId })
      fetchTweets()
    } catch (e) {
      /* Deja liké */
    }
  }

  return (
    <>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b z-10 font-bold text-xl">
        Accueil
      </div>

      {/* Zone de Tweet */}
      <div className="p-4 border-b flex gap-3">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xl outline-none resize-none placeholder-gray-500"
            placeholder="Quoi de neuf ?"
          />
          <div className="flex justify-end border-t pt-2 mt-2">
            <button
              onClick={handlePost}
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600"
            >
              Poster
            </button>
          </div>
        </div>
      </div>

      {/* Liste des Tweets */}
      {tweets.map((t) => (
        <div
          key={t.id}
          onClick={() => navigate(`/tweet/${t.id}`)} // <--- 2. Hna zedna Click bach ydik l detail
          className="p-4 border-b hover:bg-gray-50 flex gap-3 cursor-pointer transition"
        >
          <Link to={`/profile/${t.author.username}`} onClick={(e) => e.stopPropagation()}>
            <div className="h-10 w-10 bg-gray-300 rounded-full hover:opacity-80"></div>
          </Link>

          <div className="flex-1">
            {t.isRetweet && (
              <div className="text-gray-500 text-xs font-bold flex items-center gap-1 mb-1">
                <Repeat size={12} /> a retweeté
              </div>
            )}

            <div className="flex gap-1 items-center">
              <Link
                to={`/profile/${t.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold hover:underline"
              >
                {t.author.displayName || t.author.username}
              </Link>
              <span className="text-gray-500 text-sm">
                @{t.author.username} · {formatDistanceToNow(new Date(t.createdAt))}
              </span>
            </div>

            <p className="mt-1 text-gray-900">
              <RichText text={t.content} />
            </p>

            <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
              <button className="hover:text-blue-500 flex gap-1 items-center">
                <MessageCircle size={18} /> {t._count?.replies || 0}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRetweet(t.id)
                }}
                className="hover:text-green-500 flex gap-1 items-center group"
              >
                <Repeat size={18} className="group-hover:bg-green-50 rounded-full" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike(t.id)
                }}
                className="hover:text-red-500 flex gap-1 items-center group"
              >
                <Heart
                  size={18}
                  className={t._count?.likes > 0 ? 'fill-red-500 text-red-500' : ''}
                />
                <span className="text-xs">{t._count?.likes || 0}</span>
              </button>

              <button className="hover:text-blue-500">
                <Share size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// --- ROUTEUR PRINCIPAL ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page Login bou7dha (mafihach Sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* Layout fih Sidebar + Widgets */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="profile/:username" element={<Profile />} />

          {/* ---> 3. HNA ZEDNA ROUTE DYAL TWEET DETAIL <--- */}
          <Route path="tweet/:id" element={<TweetDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
