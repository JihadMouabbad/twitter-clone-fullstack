import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from './firebase'

// Imports
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Profile } from './pages/Profile'
import { TweetDetails } from './pages/TweetDetails'
import { Messages } from './pages/Messages'
import { Search } from './pages/Search'
import { Hashtags } from './pages/Hashtags'
import { NotificationToast } from './components/NotificationToast' // <-- NOUVEAU

import { Heart, MessageCircle, Repeat, Share, LogOut } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DEFAULT_AVATAR } from './pages/Profile'

// ... (Garde ton composant Home tel quel, je ne le répète pas pour gagner de la place, il ne change pas)
// ... COPIE TON COMPOSANT "Home" D'AVANT ICI ...
// (Si tu as besoin que je remette tout le Home dis le moi, mais c'est le même qu'avant)

const RichText = ({ text }: { text: string }) => {
  const parts = text.split(/((?:#|@)\w+)/g)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <span key={i} className="text-blue-500 font-bold">
            {part}
          </span>
        ) : part.startsWith('@') ? (
          <span key={i} className="text-blue-500">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  )
} 

const Home = () => {
  // ... (Ton code Home existant)
  // ... Pour ne pas te perdre, garde le code Home de l'étape précédente.
  // ... Je mets juste le App modifié en bas :
  const [tweets, setTweets] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/login')
      else setUser(currentUser)
    })
    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    const q = query(collection(db, 'tweets'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTweets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  const handlePost = async () => {
    if (!content.trim()) return
    await addDoc(collection(db, 'tweets'), {
      content: content,
      authorName: user.displayName,
      authorPhoto: user.photoURL || DEFAULT_AVATAR,
      authorId: user.uid,
      createdAt: new Date().toISOString(),
      likes: [],
      retweetCount: 0,
    })
    setContent('')
  }

  const handleLike = async (tweet: any) => {
    const tweetRef = doc(db, 'tweets', tweet.id)
    const isLiked = tweet.likes?.includes(user.uid)
    await updateDoc(tweetRef, {
      likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    })
  }

  const handleRetweet = async (t: any) => {
    if (!window.confirm('Retweeter ce post ?')) return
    const originalRef = doc(db, 'tweets', t.id)
    await updateDoc(originalRef, { retweetCount: increment(1) })
    await addDoc(collection(db, 'tweets'), {
      content: t.content,
      authorName: user.displayName,
      authorPhoto: user.photoURL || DEFAULT_AVATAR,
      authorId: user.uid,
      createdAt: new Date().toISOString(),
      likes: [],
      retweetCount: 0,
      isRetweet: true,
      originalAuthor: t.authorName,
    })
  }

  return (
    <>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b z-10 flex justify-between items-center">
        <h1 className="font-bold text-xl">Accueil</h1>
        <button onClick={() => signOut(auth)} className="text-gray-500 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </div>
      <div className="p-4 border-b flex gap-3">
        <img
          src={user?.photoURL || DEFAULT_AVATAR}
          className="h-10 w-10 rounded-full"
          alt="moi"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xl outline-none resize-none placeholder-gray-500"
            placeholder="Quoi de neuf ?"
            rows={2}
          />
          <div className="flex justify-end border-t pt-2 mt-2">
            <button
              onClick={handlePost}
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold"
            >
              Poster
            </button>
          </div>
        </div>
      </div>
      {tweets.map((t) => (
        <div
          key={t.id}
          onClick={() => navigate(`/tweet/${t.id}`)}
          className="p-4 border-b hover:bg-gray-50 flex gap-3 cursor-pointer transition"
        >
          <img
            src={t.authorPhoto || DEFAULT_AVATAR}
            className="h-10 w-10 rounded-full hover:opacity-80"
            alt="avatar"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/profile/${t.authorId}`)
            }}
          />
          <div className="flex-1">
            {t.isRetweet && (
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1 font-bold">
                <Repeat size={12} /> {t.authorName} a retweeté
              </p>
            )}
            <div className="flex gap-1 items-center">
              <span
                className="font-bold hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/profile/${t.authorId}`)
                }}
              >
                {t.isRetweet ? t.originalAuthor : t.authorName}
              </span>
              <span className="text-gray-500 text-sm">
                · {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: fr })}
              </span>
            </div>
            <p className="mt-1 text-gray-900">{t.content}</p>
            <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
              <button className="hover:text-blue-500 flex gap-1 items-center">
                <MessageCircle size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRetweet(t)
                }}
                className="hover:text-green-500 flex gap-1 items-center group"
              >
                <Repeat size={18} className="group-hover:bg-green-50 rounded-full" />
                <span className="text-xs">{t.retweetCount || 0}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike(t)
                }}
                className={`flex gap-1 items-center group ${
                  t.likes?.includes(user?.uid) ? 'text-red-500' : 'hover:text-red-500'
                }`}
              >
                <Heart size={18} className={t.likes?.includes(user?.uid) ? 'fill-red-500' : ''} />
                <span className="text-xs">{t.likes?.length || 0}</span>
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

function App() {
  return (
    <BrowserRouter>
      {/* Ajout des Notifications Globales */}
      <NotificationToast />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="tweet/:id" element={<TweetDetails />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:chatId" element={<Messages />} />
          <Route path="search" element={<Search />} />
          <Route path="hashtags" element={<Hashtags />} />
          <Route path="hashtags/:tag" element={<Hashtags />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
