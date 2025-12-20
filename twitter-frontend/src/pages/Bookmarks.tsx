import React, { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore' // Fixed imports
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { MessageCircle, Repeat, Heart, Share, Bookmark } from 'lucide-react'

export const Bookmarks = () => {
    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const currentUser = auth.currentUser

    useEffect(() => {
        if (!currentUser) return

        // Fetch user bookmarks from subcollection or array. 
        // We will use a subcollection 'bookmarks' for scalability/ease here given we didn't add array in Update.
        // actually let's assume we use a subcollection `users/{uid}/bookmarks` where docId = tweetId

        const fetchBookmarks = async () => {
            const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks')
            const q = query(bookmarksRef, orderBy('savedAt', 'desc'))
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                setBookmarks([])
                setLoading(false)
                return
            }

            // Now fetch actual tweets
            const tweetsData = await Promise.all(snapshot.docs.map(async (bDoc) => {
                const tweetRef = doc(db, 'tweets', bDoc.id)
                const tweetSnap = await getDoc(tweetRef)
                if (tweetSnap.exists()) {
                    return { id: tweetSnap.id, ...tweetSnap.data(), savedAt: bDoc.data().savedAt }
                }
                return null
            }))

            setBookmarks(tweetsData.filter(Boolean))
            setLoading(false)
        }

        fetchBookmarks()
    }, [currentUser])

    if (loading) return <div className="p-10 text-center">Chargement...</div>

    return (
        <div className="border-x min-h-screen pb-10">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b z-10 flex gap-4 items-center">
                <h1 className="font-bold text-xl">Signets</h1>
                <p className="text-sm text-gray-500">@{currentUser?.displayName}</p>
            </div>

            {bookmarks.length === 0 && (
                <div className="text-center mt-20 text-gray-400">
                    <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Sauvegardez des Tweets pour les retrouver plus tard.</p>
                </div>
            )}

            {bookmarks.map((t) => (
                <div
                    key={t.id}
                    onClick={() => navigate(`/tweet/${t.id}`)}
                    className="p-4 border-b hover:bg-gray-50 flex gap-3 cursor-pointer transition"
                >
                    <img
                        src={t.authorPhoto || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
                        className="h-10 w-10 rounded-full hover:opacity-80"
                        alt="avatar"
                    />
                    <div className="flex-1">
                        <div className="flex gap-1 items-center">
                            <span className="font-bold hover:underline">{t.isRetweet ? t.originalAuthor : t.authorName}</span>
                            <span className="text-gray-500 text-sm">
                                · {t.createdAt && formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: fr })}
                            </span>
                        </div>
                        <p className="mt-1 text-gray-900">{t.content}</p>
                        <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
                            <MessageCircle size={18} />
                            <Repeat size={18} />
                            <Heart size={18} />
                            <Bookmark size={18} className="fill-blue-500 text-blue-500" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
