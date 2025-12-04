import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DEFAULT_AVATAR } from '../pages/Profile'

export const TweetDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tweet, setTweet] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [replyContent, setReplyContent] = useState('')

  // 1. Jib Tweet Asli
  useEffect(() => {
    if (!id) return
    const fetchTweet = async () => {
      const docRef = doc(db, 'tweets', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setTweet({ id: docSnap.id, ...docSnap.data() })
      }
    }
    fetchTweet()
  }, [id])

  // 2. Jib Réponses (Real-time) - CORRECTED
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, 'tweets', id, 'replies'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReplies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    // --- FIX HNA: Zidna () bach t-executer ---
    return () => unsubscribe()
  }, [id])

  // 3. Sifet Réponse
  const handleReply = async () => {
    if (!replyContent.trim() || !id) return

    await addDoc(collection(db, 'tweets', id, 'replies'), {
      content: replyContent,
      authorName: auth.currentUser?.displayName,
      authorPhoto: auth.currentUser?.photoURL,
      authorId: auth.currentUser?.uid,
      createdAt: new Date().toISOString(),
    })
    setReplyContent('')
  }

  if (!tweet) return <div>Chargement...</div>

  return (
    <div>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-2 flex items-center gap-4 border-b z-10">
        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="font-bold text-lg">Tweet</h2>
      </div>

      {/* Tweet Principal */}
      <div className="p-4 border-b">
        <div className="flex gap-3 mb-2 items-center">
          <img
            src={tweet.authorPhoto || DEFAULT_AVATAR}
            className="h-12 w-12 rounded-full"
            alt="avatar"
          />
          <div>
            <p className="font-bold text-lg">{tweet.authorName}</p>
            <p className="text-gray-500 text-sm">
              {tweet.createdAt &&
                formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        </div>
        <p className="text-xl text-gray-900 my-4">{tweet.content}</p>
        <div className="py-3 border-y text-gray-500 flex gap-4">
          <span>
            <strong className="text-black">{replies.length}</strong> Réponses
          </span>
          <span>
            <strong className="text-black">{tweet.likes?.length || 0}</strong> J'aime
          </span>
          <span>
            <strong className="text-black">{tweet.retweetCount || 0}</strong> Retweets
          </span>
        </div>
      </div>

      {/* Zone Input Réponse */}
      <div className="p-4 border-b flex gap-3">
        <img
          src={auth.currentUser?.photoURL || DEFAULT_AVATAR}
          className="h-10 w-10 rounded-full"
          alt="me"
        />
        <div className="flex-1">
          <input
            type="text"
            className="w-full p-3 bg-gray-100 rounded-full outline-none"
            placeholder="Postez votre réponse"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleReply}
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold"
            >
              Répondre
            </button>
          </div>
        </div>
      </div>

      {/* Liste Réponses */}
      {replies.map((r) => (
        <div key={r.id} className="p-4 border-b hover:bg-gray-50 flex gap-3">
          <img
            src={r.authorPhoto || DEFAULT_AVATAR}
            className="h-10 w-10 rounded-full"
            alt="avatar"
          />
          <div>
            <div className="flex gap-2 items-center">
              <span className="font-bold">{r.authorName}</span>
              <span className="text-gray-500 text-sm">
                {r.createdAt && formatDistanceToNow(new Date(r.createdAt), { locale: fr })}
              </span>
            </div>
            <p className="mt-1">{r.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
