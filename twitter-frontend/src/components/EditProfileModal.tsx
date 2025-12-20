import React, { useState } from 'react'
import { X, Camera } from 'lucide-react'
import { db, auth } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'

// Liste de profils par défaut (Avatars)
const DEFAULT_AVATARS = [
    'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
    'https://pbs.twimg.com/media/FjU2lkcWYAgNG6d.jpg',
    'https://i.pinimg.com/736x/c9/e3/e8/c9e3e810a8066b885ca4e882460785fa.jpg',
    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
    'https://cdn-icons-png.flaticon.com/512/9187/9187604.png',
    'https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-2_549209-82.jpg',
    'https://img.freepik.com/premium-vector/avatar-profile-colorful-illustration-1_549209-81.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8r9m8z8ep7s8Z7w7o9e2r4q5t4y2u1i0o_w&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0Z4u7t7x5q8y9v0s1r2t3u4v5w6x7y8z9a0&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1s2r3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8&s',
    'https://wallpapers.com/images/hd/cool-profile-picture-87h46gcobjl5e4xu.jpg',
    'https://wallpapers.com/images/hd/cool-profile-picture-1-1080-x-1080-320257.jpg',
    'https://wallpapers.com/images/hd/cool-profile-picture-minion-1366-x-768-4k2q8s8d8e8w9a0s.jpg',
    'https://images.unsplash.com/photo-1552728089-57bdde30ebd1?w=400&h=400&fit=crop' // Coco
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

            // Update Auth Profile (Client side mostly, but good practice)
            // Note: updateProfile from 'firebase/auth' could be used here too if needed for immediate auth state update

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
