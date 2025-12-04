import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { updateProfile } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Music,
  Palmtree,
  MessageCircle,
  Repeat,
  Heart,
  Share,
  Mail,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// Catalogue d'avatars proposés (animaux style dessin animé)
const AVATAR_CATALOG = [
  'https://api.dicebear.com/9.x/bottts/svg?seed=cat',
  'https://api.dicebear.com/9.x/bottts/svg?seed=dog',
  'https://api.dicebear.com/9.x/bottts/svg?seed=lion',
  'https://api.dicebear.com/9.x/bottts/svg?seed=panda',
  'https://api.dicebear.com/9.x/bottts/svg?seed=fox',
  'https://api.dicebear.com/9.x/bottts/svg?seed=rabbit',
  'https://api.dicebear.com/9.x/bottts/svg?seed=koala',
  'https://api.dicebear.com/9.x/bottts/svg?seed=tiger',
  'https://api.dicebear.com/9.x/bottts/svg?seed=bear',
  'https://api.dicebear.com/9.x/bottts/svg?seed=monkey',
]

// Silhouette noir & blanc par défaut si l'utilisateur n'a pas encore de photo
export const DEFAULT_AVATAR =
  'https://cdn-icons-png.flaticon.com/512/149/149071.png'

export const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()

  // Data States
  const [userTweets, setUserTweets] = useState<any[]>([])
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Logic States (Follow/Chat)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  // Settings States
  const [spotifySong, setSpotifySong] = useState('')
  const [isEditingSpotify, setIsEditingSpotify] = useState(false)
  const [vacationMode, setVacationMode] = useState(false)
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false)

  const currentUser = auth.currentUser
  const isMyProfile = currentUser?.uid === userId

  // Changer la photo de profil à partir du catalogue
  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!isMyProfile || !userId || !currentUser) return

    // Sauvegarder dans Firestore
    await setDoc(
      doc(db, 'users', userId),
      {
        photo: avatarUrl,
      },
      { merge: true }
    )

    // Mettre à jour aussi le profil Auth pour garder la cohérence
    await updateProfile(currentUser, {
      photoURL: avatarUrl,
    })

    setIsChoosingAvatar(false)
  }

  // 1. INIT & CHARGEMENT
  useEffect(() => {
    if (!userId) return

    // A. Auto-save si c'est moi
    if (isMyProfile && currentUser) {
      setDoc(
        doc(db, 'users', userId),
        {
          name: currentUser.displayName,
          photo: currentUser.photoURL,
          id: userId,
          usernameSearch: currentUser.displayName?.toLowerCase().trim(),
        },
        { merge: true }
      )
    }

    // B. Écouter Info User
    const unsubUser = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        setUserInfo(data)
        setSpotifySong(data.spotifySong || '')
        setVacationMode(data.vacationMode || false)
      } else {
        setUserInfo({ name: 'Utilisateur', photo: null })
      }
      setLoading(false)
    })

    // C. Charger Tweets
    const fetchTweets = async () => {
      const q = query(collection(db, 'tweets'), where('authorId', '==', userId))
      const snap = await getDocs(q)
      const tweets = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any))
      tweets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setUserTweets(tweets)
    }
    fetchTweets()

    // D. Check Follow Status & Counts
    if (currentUser) {
      // Est-ce que je le suis ?
      const qCheck = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', userId)
      )
      getDocs(qCheck).then((snap) => setIsFollowing(!snap.empty))

      // Compteurs (Temps réel)
      const unsubFollowers = onSnapshot(
        query(collection(db, 'follows'), where('followingId', '==', userId)),
        (s) => setFollowersCount(s.size)
      )
      const unsubFollowing = onSnapshot(
        query(collection(db, 'follows'), where('followerId', '==', userId)),
        (s) => setFollowingCount(s.size)
      )

      return () => {
        unsubUser()
        unsubFollowers()
        unsubFollowing()
      }
    }

    return () => unsubUser()
  }, [userId, isMyProfile, currentUser])

  // 2. FONCTION FOLLOW / UNFOLLOW
  const handleFollow = async () => {
    if (!currentUser || !userId) return
    if (isFollowing) {
      // Unfollow
      const q = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', userId)
      )
      const snap = await getDocs(q)
      snap.forEach(async (d) => await deleteDoc(doc(db, 'follows', d.id)))
      setIsFollowing(false)
    } else {
      // Follow
      await addDoc(collection(db, 'follows'), {
        followerId: currentUser.uid,
        followingId: userId,
        timestamp: new Date(),
      })
      setIsFollowing(true)
    }
  }

  // 3. FONCTION START CHAT (Message)
  const startChat = async () => {
    if (!currentUser || !userId || !userInfo) return
    const chatId = [currentUser.uid, userId].sort().join('_')

    // Créer la conversation si elle n'existe pas
    await setDoc(
      doc(db, 'chats', chatId),
      {
        users: [currentUser.uid, userId],
        userNames: [currentUser.displayName, userInfo.name],
        lastMessage: 'Nouvelle conversation',
        timestamp: new Date(),
      },
      { merge: true }
    )

    navigate(`/messages/${chatId}`)
  }

  // 4. SAUVEGARDER OPTIONS
  const saveOptions = async (newVacation?: boolean, newSong?: string) => {
    if (!isMyProfile) return
    await setDoc(
      doc(db, 'users', userId!),
      {
        vacationMode: newVacation !== undefined ? newVacation : vacationMode,
        spotifySong: newSong !== undefined ? newSong : spotifySong,
      },
      { merge: true }
    )
  }

  if (loading || !userInfo) return <div className="p-10 text-center">Chargement...</div>

  return (
    <div className="bg-white min-h-screen pb-10">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md p-2 flex items-center gap-4 z-20 border-b">
        <ArrowLeft
          className="cursor-pointer p-2 hover:bg-gray-100 rounded-full"
          onClick={() => navigate('/')}
        />
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2 leading-tight">
            {userInfo.name}
            {vacationMode && <Palmtree size={16} className="text-orange-500" />}
          </h2>
          <p className="text-xs text-gray-500">{userTweets.length} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className={`h-48 w-full relative ${vacationMode ? 'bg-orange-100' : 'bg-slate-200'}`}>
        {vacationMode && (
          <div className="absolute inset-0 flex items-center justify-center text-orange-600 font-bold text-xl gap-2">
            <Palmtree /> EN MODE VACANCES <Palmtree />
          </div>
        )}
      </div>

      {/* Avatar & Actions */}
      <div className="px-4 flex justify-between items-start -mt-16 relative z-10">
        <div className="relative">
          <img
            src={userInfo.photo || DEFAULT_AVATAR}
            className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover"
            alt="p"
          />
          {isMyProfile && (
            <button
              onClick={() => setIsChoosingAvatar(true)}
              className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full hover:bg-black transition"
            >
              Modifier
            </button>
          )}
        </div>

        <div className="mt-20 flex gap-2">
          {isMyProfile ? (
            <button
              onClick={() => {
                setVacationMode(!vacationMode)
                saveOptions(!vacationMode, undefined)
              }}
              className={`px-4 py-2 rounded-full font-bold border transition text-sm ${
                vacationMode
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-black border-gray-300 hover:bg-gray-50'
              }`}
            >
              {vacationMode ? 'Désactiver Vacances' : 'Activer Mode Vacances'}
            </button>
          ) : (
            <>
              {/* BOUTON MESSAGE */}
              <button
                onClick={startChat}
                className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
                title="Envoyer un message"
              >
                <Mail size={20} />
              </button>
              {/* BOUTON FOLLOW */}
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-bold transition ${
                  isFollowing
                    ? 'bg-white text-black border border-gray-300 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isFollowing ? 'Abonné' : 'Suivre'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info User */}
      <div className="px-4 mt-3 space-y-3">
        <div>
          <h1 className="font-bold text-xl leading-none">{userInfo.name}</h1>
          <p className="text-gray-500">@{userInfo.usernameSearch || 'user'}</p>
        </div>

        {/* Spotify Integration */}
        <div className="p-3 bg-green-50 rounded-xl border border-green-200 max-w-sm">
          <div className="flex items-center gap-2 text-green-700 font-bold mb-1 text-sm">
            <Music size={16} /> En écoute sur Spotify
          </div>
          {isMyProfile && isEditingSpotify ? (
            <div className="flex gap-2">
              <input
                value={spotifySong}
                onChange={(e) => setSpotifySong(e.target.value)}
                className="flex-1 p-1 text-sm border rounded outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Artiste - Titre"
              />
              <button
                onClick={() => {
                  setIsEditingSpotify(false)
                  saveOptions(undefined, spotifySong)
                }}
                className="text-xs bg-green-600 text-white px-3 rounded font-bold"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-800">{spotifySong || 'Aucune musique'}</p>
              {isMyProfile && (
                <button
                  onClick={() => setIsEditingSpotify(true)}
                  className="text-xs text-gray-400 hover:text-green-600 underline"
                >
                  Modifier
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-1">
            <MapPin size={16} /> Maroc
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} /> Membre actif
          </div>
        </div>

        {/* Stats Abonnés */}
        <div className="flex gap-4 text-sm">
          <span className="text-black font-bold cursor-pointer hover:underline">
            {followingCount} <span className="text-gray-500 font-normal">abonnements</span>
          </span>
          <span className="text-black font-bold cursor-pointer hover:underline">
            {followersCount} <span className="text-gray-500 font-normal">abonnés</span>
          </span>
        </div>
      </div>

      <div className="flex border-b mt-4">
        <div className="flex-1 text-center p-3 hover:bg-gray-50 cursor-pointer font-bold border-b-4 border-blue-500">
          Posts
        </div>
        <div className="flex-1 text-center p-3 hover:bg-gray-50 cursor-pointer text-gray-500">
          Réponses
        </div>
        <div className="flex-1 text-center p-3 hover:bg-gray-50 cursor-pointer text-gray-500">
          J'aime
        </div>
      </div>

      {/* Tweets */}
      <div>
        {userTweets.map((t) => (
          <div
            key={t.id}
            className="p-4 border-b hover:bg-gray-50 flex gap-3 cursor-pointer transition"
            onClick={() => navigate(`/tweet/${t.id}`)}
          >
            <img
              src={userInfo.photo || DEFAULT_AVATAR}
              className="h-10 w-10 rounded-full object-cover"
              alt="av"
            />
            <div className="flex-1">
              <div className="flex gap-1 items-center">
                <span className="font-bold hover:underline">{userInfo.name}</span>
                <span className="text-gray-500 text-sm">
                  · {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="mt-1 text-gray-900 text-[15px]">{t.content}</p>
              <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
                <MessageCircle size={18} />
                <Repeat size={18} />
                <Heart size={18} />
                <Share size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de choix d'avatar */}
      {isMyProfile && isChoosingAvatar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Choisir une photo de profil</h2>
              <button
                onClick={() => setIsChoosingAvatar(false)}
                className="text-gray-500 hover:text-black text-sm"
              >
                Fermer
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Sélectionne un avatar dans le catalogue ci-dessous.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {AVATAR_CATALOG.map((url) => (
                <button
                  key={url}
                  onClick={() => handleAvatarSelect(url)}
                  className="group rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <img
                    src={url}
                    alt="avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
