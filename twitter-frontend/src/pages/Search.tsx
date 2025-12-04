import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  doc,
  deleteDoc,
  where,
} from 'firebase/firestore'
import { Search as SearchIcon, User, Mail, Trash2, Plus } from 'lucide-react'

type DefaultProfile = {
  id: string
  name: string
  username?: string
  photo?: string
}

export const Search = () => {
  const navigate = useNavigate()
  const currentUser = auth.currentUser

  const [searchTerm, setSearchTerm] = useState('')
  const [userResults, setUserResults] = useState<any[]>([])
  const [tweetResults, setTweetResults] = useState<any[]>([])

  const [defaultProfiles, setDefaultProfiles] = useState<DefaultProfile[]>([])
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileUsername, setNewProfileUsername] = useState('')
  const [newProfilePhoto, setNewProfilePhoto] = useState('')

  // Charger le catalogue de profils par défaut
  useEffect(() => {
    const q = query(collection(db, 'defaultProfiles'))
    const unsub = onSnapshot(q, (snap) => {
      const list: DefaultProfile[] = snap.docs.map((d) => {
        const data = d.data() as any
        return {
          id: d.id,
          name: data.name,
          username: data.username,
          photo: data.photo,
        }
      })
      setDefaultProfiles(list)
    })
    return () => unsub()
  }, [])

  // Lancer la recherche simple (nom utilisateur + contenu tweet)
  const doSearch = async (term: string) => {
    const value = term.trim().toLowerCase()
    if (!value) {
      setUserResults([])
      setTweetResults([])
      return
    }

    // Recherche utilisateurs (via usernameSearch)
    const qUsers = query(
      collection(db, 'users'),
      where('usernameSearch', '>=', value),
      where('usernameSearch', '<=', value + '\uf8ff')
    )
    const usersSnap = await getDocs(qUsers)
    setUserResults(usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })))

    // Recherche tweets (filtrage côté client)
    const qTweets = query(collection(db, 'tweets'))
    const tweetsSnap = await getDocs(qTweets)
    const allTweets = tweetsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any))
    setTweetResults(
      allTweets.filter((t) =>
        (t.content || '').toLowerCase().includes(value)
      )
    )
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(searchTerm)
  }

  const handleCreateDefaultProfile = async () => {
    if (!newProfileName.trim()) return

    const id = newProfileUsername.trim().toLowerCase() || newProfileName.trim().toLowerCase()
    await setDoc(doc(db, 'defaultProfiles', id), {
      name: newProfileName.trim(),
      username: newProfileUsername.trim() || null,
      photo: newProfilePhoto.trim() || null,
    })

    setNewProfileName('')
    setNewProfileUsername('')
    setNewProfilePhoto('')
  }

  const handleDeleteDefaultProfile = async (id: string) => {
    if (!window.confirm('Supprimer ce profil du catalogue ?')) return
    await deleteDoc(doc(db, 'defaultProfiles', id))
  }

  const startChatWithUser = async (userId: string, userName: string) => {
    if (!currentUser) {
      alert('Connectez-vous pour envoyer un message privé.')
      return
    }
    if (currentUser.uid === userId) {
      navigate(`/profile/${userId}`)
      return
    }
    const chatId = [currentUser.uid, userId].sort().join('_')
    await setDoc(
      doc(db, 'chats', chatId),
      {
        users: [currentUser.uid, userId],
        userNames: [currentUser.displayName, userName],
        lastMessage: 'Nouvelle conversation',
        timestamp: new Date(),
      },
      { merge: true }
    )
    navigate(`/messages/${chatId}`)
  }

  const hasResults = useMemo(
    () => userResults.length > 0 || tweetResults.length > 0,
    [userResults.length, tweetResults.length]
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b">
        <div className="p-4">
          <h1 className="font-bold text-xl mb-3">Recherche</h1>
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Rechercher un utilisateur ou un tweet"
              className="w-full bg-gray-100 rounded-full py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
          </form>
        </div>
      </div>

      <div className="px-4 py-4 space-y-8">
        {/* Résultats Utilisateurs */}
        {hasResults && (
          <>
            <div>
              <h2 className="font-bold mb-2">Profils trouvés</h2>
              {userResults.length === 0 && (
                <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
              )}
              <div className="space-y-3">
                {userResults.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate(`/profile/${u.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          u.photo ||
                          'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                        }
                        alt={u.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-sm">{u.name || 'Utilisateur'}</p>
                        <p className="text-xs text-gray-500">
                          @{u.usernameSearch || 'user'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startChatWithUser(u.id, u.name || 'Utilisateur')
                      }}
                      className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
                      title="Envoyer un message privé"
                    >
                      <Mail size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Résultats Tweets */}
            <div>
              <h2 className="font-bold mb-2">Tweets trouvés</h2>
              {tweetResults.length === 0 && (
                <p className="text-sm text-gray-500">Aucun tweet trouvé.</p>
              )}
              <div className="space-y-3">
                {tweetResults.map((t) => (
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
          </>
        )}

        {/* Catalogue de profils par défaut */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg">Catalogue de profils par défaut</h2>
          </div>

          <div className="grid gap-3">
            {defaultProfiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 border rounded-xl bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      p.photo ||
                      'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                    }
                    alt={p.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1">
                      <User size={14} /> {p.name}
                    </p>
                    {p.username && (
                      <p className="text-xs text-gray-500">@{p.username}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDefaultProfile(p.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Supprimer du catalogue"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {defaultProfiles.length === 0 && (
              <p className="text-sm text-gray-500">
                Aucun profil par défaut pour le moment. Ajoutez-en ci-dessous.
              </p>
            )}
          </div>

          {/* Formulaire ajout profil par défaut */}
          <div className="mt-4 p-3 border rounded-xl bg-white space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Plus size={16} />
              <span className="font-bold text-sm">Ajouter un profil au catalogue</span>
            </div>
            <div className="grid gap-2">
              <input
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
                placeholder="Nom (obligatoire)"
              />
              <input
                value={newProfileUsername}
                onChange={(e) => setNewProfileUsername(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
                placeholder="Username (optionnel)"
              />
              <input
                value={newProfilePhoto}
                onChange={(e) => setNewProfilePhoto(e.target.value)}
                className="w-full border rounded-full px-4 py-2 text-sm"
                placeholder="URL photo (optionnel)"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateDefaultProfile}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-sm transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


