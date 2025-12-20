import React, { useState } from 'react'
import { X, Image, Smile, Calendar, MapPin, AlignLeft } from 'lucide-react'
import { addDoc, collection } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useLayout } from '../context/LayoutContext'

export const ComposeTweetModal = () => {
    const { tweetModalOpen, setTweetModalOpen } = useLayout()
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    if (!tweetModalOpen) return null

    const handlePost = async () => {
        if (!content.trim() || !auth.currentUser) return
        setLoading(true)
        try {
            await addDoc(collection(db, 'tweets'), {
                content: content,
                authorName: auth.currentUser.displayName,
                authorPhoto: auth.currentUser.photoURL,
                authorId: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                likes: [],
                retweetCount: 0,
            })
            setContent('')
            setTweetModalOpen(false)
        } catch (error) {
            console.error("Error posting tweet:", error)
            alert("Erreur lors de l'envoi du tweet.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24" onClick={() => setTweetModalOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg p-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={() => setTweetModalOpen(false)}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition"
                >
                    <X size={20} />
                </button>

                <div className="flex gap-4 mt-10">
                    <img
                        src={auth.currentUser?.photoURL || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Quoi de neuf ?"
                            className="w-full text-xl outline-none resize-none placeholder-gray-500 min-h-[120px]"
                        />

                        <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                            <div className="flex gap-2 text-blue-500">
                                <div className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition"><Image size={20} /></div>
                                <div className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition"><AlignLeft size={20} /></div>
                                <div className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition"><Smile size={20} /></div>
                                <div className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition"><Calendar size={20} /></div>
                                <div className="p-2 hover:bg-blue-50 rounded-full cursor-pointer transition"><MapPin size={20} /></div>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={!content.trim() || loading}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {loading ? 'Envoi...' : 'Poster'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
