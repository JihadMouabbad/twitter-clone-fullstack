import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, MessageCircle, Heart, Repeat } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const API_URL = 'http://localhost:3001'

export const TweetDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tweet, setTweet] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    fetchTweet()
  }, [id])

  const fetchTweet = async () => {
    try {
      const res = await axios.get(`${API_URL}/tweets/${id}`)
      setTweet(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleReply = async () => {
    if (!replyContent) return
    await axios.post(`${API_URL}/reply`, {
      content: replyContent,
      authorId: userId,
      parentId: id,
    })
    setReplyContent('')
    fetchTweet() // Refresh bach tban reponse
  }

  if (!tweet) return <div>Chargement...</div>

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-2 flex items-center gap-4 border-b">
        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="font-bold text-lg">Tweet</h2>
      </div>

      {/* Le Tweet Principal (Grand format) */}
      <div className="p-4 border-b">
        <div className="flex gap-3 mb-2">
          <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
          <div>
            <p className="font-bold text-lg">{tweet.author.displayName || tweet.author.username}</p>
            <p className="text-gray-500">@{tweet.author.username}</p>
          </div>
        </div>

        <p className="text-xl text-gray-900 my-4">{tweet.content}</p>

        <p className="text-gray-500 py-3 border-b text-sm">
          {new Date(tweet.createdAt).toLocaleDateString()} · Twitter Web App
        </p>

        <div className="flex gap-6 py-3 border-b text-gray-500">
          <p>
            <span className="font-bold text-black">{tweet._count.replies}</span> Réponses
          </p>
          <p>
            <span className="font-bold text-black">{tweet._count.likes}</span> J'aime
          </p>
        </div>
      </div>

      {/* Zone de réponse */}
      <div className="p-4 border-b flex gap-3">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <input
            type="text"
            className="w-full p-2 outline-none text-lg placeholder-gray-500"
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

      {/* Liste des Réponses */}
      {tweet.replies.map((reply: any) => (
        <div key={reply.id} className="p-4 border-b hover:bg-gray-50 flex gap-3">
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          <div>
            <div className="flex gap-2">
              <span className="font-bold">{reply.author.username}</span>
              <span className="text-gray-500">
                · {formatDistanceToNow(new Date(reply.createdAt))}
              </span>
            </div>
            <p className="mt-1">{reply.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
