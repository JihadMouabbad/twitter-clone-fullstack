import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, startAt, endAt, orderBy, getDocs } from 'firebase/firestore'
import { Search } from 'lucide-react'

export const SearchUsers = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Initialize from URL param if present
    useEffect(() => {
        const queryParam = searchParams.get('q')
        if (queryParam) {
            setSearchTerm(queryParam)
            handleSearch(queryParam)
        }
    }, [searchParams])

    const handleSearch = async (term: string) => {
        if (!term.trim()) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const lowerTerm = term.toLowerCase()
            const usersRef = collection(db, 'users')
            const q = query(
                usersRef,
                orderBy('usernameSearch'),
                startAt(lowerTerm),
                endAt(lowerTerm + '\uf8ff')
            )

            const snapshot = await getDocs(q)
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setResults(users)
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setLoading(false)
        }
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setSearchTerm(val)
        handleSearch(val)
    }

    return (
        <div className="border-x min-h-screen pb-20">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b z-10">
                <div className="relative group">
                    <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500" size={20} />
                    <input
                        type="text"
                        className="w-full bg-gray-100 rounded-full py-2 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        placeholder="Chercher des utilisateurs..."
                        value={searchTerm}
                        onChange={onInputChange}
                        autoFocus
                    />
                </div>
            </div>

            <div className="p-4">
                {loading && <div className="text-center text-gray-500">Recherche...</div>}

                {!loading && results.length === 0 && searchTerm && (
                    <div className="text-center text-gray-500 mt-10">
                        Aucun résultat pour "{searchTerm}"
                    </div>
                )}

                {results.map(user => (
                    <div
                        key={user.id}
                        className="flex items-center gap-3 p-4 border-b hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => navigate(`/profile/${user.id}`)}
                    >
                        <img
                            src={user.photo || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="font-bold hover:underline">{user.name}</p>
                            <p className="text-gray-500 text-sm">@{user.usernameSearch || 'user'}</p>
                            {user.bio && <p className="text-gray-900 text-sm mt-1 line-clamp-1">{user.bio}</p>}
                        </div>
                    </div>
                ))}

                {!searchTerm && (
                    <div className="text-center mt-20 text-gray-400">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Cherchez des amis ou des profils</p>
                    </div>
                )}
            </div>
        </div>
    )
}
