import React, { useState } from 'react'
import { X, Camera } from 'lucide-react'
import { db, auth } from '../firebase'
import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore'

// Liste de profils par défaut (Avatars)
const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop', // Chat Simba
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop', // Chien Rex
    'https://images.unsplash.com/photo-1552728089-57bdde30ebd1?w=400&h=400&fit=crop', // Perroquet Coco
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop', // Hamster
    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&h=400&fit=crop', // Chat Lunettes
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop', // Chien Cool
    'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop', // Singe
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop', // Bulldog
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop', // Chiot
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop', // Chat
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop', // Chien
    'https://images.unsplash.com/photo-1503777119540-ce54b422baff?w=400&h=400&fit=crop'  // Chat mignon
]

interface EditProfileModalProps {
    user: any
    onClose: () => void
}

export const EditProfileModal = ({ user, onClose }: EditProfileModalProps) => {
    const [name, setName] = useState(user.name || '')
    const [bio, setBio] = useState(user.bio || '')
    const [photo, setPhoto] = useState(user.photo || DEFAULT_AVATARS[0])
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!auth.currentUser) return
        setLoading(true)
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid)
            await updateDoc(userRef, {
                name,
                bio,
                photo,
                photoURL: photo, // Update both fields for compatibility
            })

            // BATCH UPDATE TWEETS
            const tweetsQuery = query(collection(db, 'tweets'), where('authorId', '==', auth.currentUser.uid))
            const tweetsSnapshot = await getDocs(tweetsQuery)

            const updatePromises = tweetsSnapshot.docs.map(docSnap =>
                updateDoc(doc(db, 'tweets', docSnap.id), {
                    authorName: name,
                    authorPhoto: photo
                })
            )

            await Promise.all(updatePromises)

            setLoading(false)
            onClose()
        } catch (error) {
            console.error("Error updating profile:", error)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-4 relative animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <X size={20} />
                        </button>
                        <h2 className="font-bold text-lg">Éditer le profil</h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Enreg...' : 'Enregistrer'}
                    </button>
                </div>

                {/* Banner Placeholder */}
                <div className="h-32 bg-gray-200 w-full mb-12 relative">
                    {/* Avatar Preview */}
                    <div className="absolute -bottom-10 left-4">
                        <img
                            src={photo}
                            alt="avatar"
                            className="w-24 h-24 rounded-full border-4 border-white object-cover bg-white"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition cursor-pointer">
                            <Camera className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4 px-2">

                    {/* Default Avatars Selection */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2 font-bold">Choisir un avatar par défaut :</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {DEFAULT_AVATARS.map((avatar, index) => (
                                <img
                                    key={index}
                                    src={avatar}
                                    alt={`avatar-${index}`}
                                    onClick={() => setPhoto(avatar)}
                                    className={`w-10 h-10 rounded-full cursor-pointer border-2 transition ${photo === avatar ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="border border-gray-300 rounded p-2 focus-within:border-blue-500 transition">
                        <label className="text-xs text-gray-500 block">Nom</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full outline-none text-lg"
                        />
                    </div>

                    <div className="border border-gray-300 rounded p-2 focus-within:border-blue-500 transition">
                        <label className="text-xs text-gray-500 block">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full outline-none resize-none"
                            rows={3}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
