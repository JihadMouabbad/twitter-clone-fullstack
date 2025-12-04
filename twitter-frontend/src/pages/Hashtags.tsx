import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { Hash } from 'lucide-react'

type Tweet = {
  id: string
  content: string
  authorName?: string
  authorPhoto?: string
  createdAt?: string
}

export const Hashtags = () => {
  const navigate = useNavigate()
  const { tag } = useParams()
  const [tweets, setTweets] = useState<Tweet[]>([])

  useEffect(() => {
    const q = query(collection(db, 'tweets'))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setTweets(list as Tweet[])
    })
    return () => unsub()
  }, [])

  // Extraire tous les hashtags et compter
  const hashtagStats = useMemo(() => {
    const counts: Record<string, number> = {}
    const regex = /#(\w+)/g

    tweets.forEach((t) => {
      const text = t.content || ''
      let match
      while ((match = regex.exec(text)) !== null) {
        const key = match[1]
        counts[key] = (counts[key] || 0) + 1
      }
    })

    const entries = Object.entries(counts).map(([name, count]) => ({ name, count }))
    entries.sort((a, b) => b.count - a.count)
    return entries
  }, [tweets])

  const tweetsForSelectedTag = useMemo(() => {
    if (!tag) return []
    const needle = `#${tag}`
    return tweets.filter((t) => (t.content || '').includes(needle))
  }, [tag, tweets])

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b">
        <div className="p-4 flex flex-col gap-1">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <Hash /> Tendances & Hashtags
          </h1>
          {tag && (
            <p className="text-sm text-gray-500">
              Affichage des tweets pour <span className="font-bold">#{tag}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 px-4 py-4">
        {/* Liste des hashtags */}
        <div className="space-y-2">
          <h2 className="font-bold mb-1">Tous les hashtags</h2>
          <div className="border rounded-xl divide-y">
            {hashtagStats.length === 0 && (
              <div className="p-3 text-sm text-gray-500">
                Aucun hashtag détecté pour le moment.
              </div>
            )}
            {hashtagStats.map((h) => (
              <div
                key={h.name}
                onClick={() => navigate(`/hashtags/${h.name}`)}
                className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                  tag === h.name ? 'bg-blue-50' : ''
                }`}
              >
                <div>
                  <p className="font-bold text-sm text-blue-500">#{h.name}</p>
                  <p className="text-xs text-gray-500">{h.count} tweets</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tweets pour un hashtag */}
        <div className="space-y-2">
          <h2 className="font-bold mb-1">
            {tag ? `Tweets avec #${tag}` : 'Sélectionnez un hashtag'}
          </h2>
          <div className="space-y-3">
            {tag && tweetsForSelectedTag.length === 0 && (
              <p className="text-sm text-gray-500">
                Aucun tweet trouvé pour ce hashtag pour le moment.
              </p>
            )}
            {tweetsForSelectedTag.map((t) => (
              <div
                key={t.id}
                className="p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition flex gap-3"
                onClick={() => navigate(`/tweet/${t.id}`)}
              >
                <img
                  src={
                    t.authorPhoto ||
                    'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                  }
                  alt={t.authorName}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold text-sm">{t.authorName}</p>
                  <p className="text-sm text-gray-800 mt-1">{t.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


