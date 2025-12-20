import React, { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { Heart, Repeat, User, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const currentUser = auth.currentUser

    useEffect(() => {
        if (!currentUser) return

        const q = query(
            collection(db, 'notifications'),
            where('toUserId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
            setLoading(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart className="fill-red-500 text-red-500" size={24} />
            case 'retweet': return <Repeat className="text-green-500" size={24} />
            case 'follow': return <User className="fill-blue-500 text-blue-500" size={24} />
            default: return <Star className="text-blue-500" size={24} />
        }
    }

    const getText = (notif: any) => {
        switch (notif.type) {
            case 'like': return 'a aimé votre tweet'
            case 'retweet': return 'a retweeté votre tweet'
            case 'follow': return 'vous a suivi'
            default: return 'a interagi avec vous'
        }
    }

    if (loading) return <div className="p-10 text-center">Chargement...</div>

    return (
        <div className="border-x min-h-screen pb-10">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b z-10">
                <h1 className="font-bold text-xl">Notifications</h1>
            </div>

            {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Star size={40} className="text-gray-300" />
                    </div>
                    <p className="text-xl font-bold text-gray-600">Vous n'avez aucune notif</p>
                    <p className="text-sm">Quand il se passera quelque chose, vous le verrez ici.</p>
                </div>
            )}

            {notifications.map(n => (
                <div
                    key={n.id}
                    className="p-4 border-b hover:bg-gray-50 flex gap-4 cursor-pointer transition"
                    onClick={() => {
                        if (n.tweetId) navigate(`/tweet/${n.tweetId}`)
                        else if (n.fromUserId) navigate(`/profile/${n.fromUserId}`)
                    }}
                >
                    <div className="mt-1">
                        {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <img
                                src={n.fromUserPhoto || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
                                className="w-8 h-8 rounded-full object-cover"
                                alt="u"
                            />
                            <span className="font-bold">{n.fromUserName}</span>
                            <span className="text-gray-500 text-sm">
                                · {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: fr }) : ''}
                            </span>
                        </div>
                        <p className="text-gray-900">
                            {getText(n)}
                            {n.tweetContent && <span className="text-gray-500 block text-sm mt-1 border-l-2 pl-2 border-gray-200 line-clamp-2">"{n.tweetContent}"</span>}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
