import React from 'react'
import { Hash, MessageCircle, Heart, Repeat, Share } from 'lucide-react'

// Mock Data for Explore
const TRENDING_HASHTAGS = [
    { tag: '#Maroc', count: '120K' },
    { tag: '#TechMatin', count: '45K' },
    { tag: '#ChatMignon', count: '32K' },
    { tag: '#HumourDuJour', count: '15K' },
    { tag: '#DevLife', count: '10K' },
]

const MOCK_EXPLORE_POSTS = [
    {
        id: 1,
        authorName: 'Nature Photography',
        handle: 'nature_pics',
        avatar: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=100&h=100&fit=crop',
        content: "Le coucher de soleil sur l'Atlas est magnifique ce soir ! 🌅 #Maroc #Nature",
        likes: 1240,
        retweets: 450,
        time: '2h'
    },
    {
        id: 2,
        authorName: 'Tech News 24/7',
        handle: 'technews24',
        avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
        content: "La nouvelle mise à jour de React est incroyable. La gestion des hooks est encore plus fluide. #DevLife #TechMatin",
        likes: 856,
        retweets: 230,
        time: '4h'
    },
    {
        id: 3,
        authorName: 'Funny Cats',
        handle: 'funnycats_off',
        avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100&fit=crop',
        content: "Quand tu réalises que c'est lundi... 😿 #ChatMignon #HumourDuJour",
        likes: 5400,
        retweets: 1200,
        time: '6h'
    },
    {
        id: 4,
        authorName: 'Cuisine Facile',
        handle: 'miam_miam',
        avatar: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=100&h=100&fit=crop',
        content: "Petit tajine du dimanche ! Qui veut la recette ? 🥘 #Maroc #Food",
        likes: 3200,
        retweets: 890,
        time: '12h'
    }
]

export const Explore = () => {
    return (
        <div className="border-x min-h-screen pb-20">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b z-10">
                <h1 className="font-bold text-xl flex items-center gap-2">
                    <Hash /> Explorer
                </h1>
            </div>

            {/* Trending Hashtags Header */}
            <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-lg mb-4">Tendances du moment</h2>
                <div className="flex flex-wrap gap-2">
                    {TRENDING_HASHTAGS.map((t, i) => (
                        <div key={i} className="bg-white border rounded-full px-4 py-2 text-sm font-bold text-blue-500 cursor-pointer hover:bg-blue-50 transition">
                            {t.tag} <span className="text-gray-400 font-normal text-xs ml-1">{t.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mock Posts Feed */}
            <div>
                {MOCK_EXPLORE_POSTS.map(post => (
                    <div key={post.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer transition">
                        <div className="flex gap-3">
                            <img
                                src={post.avatar}
                                alt={post.authorName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{post.authorName}</span>
                                    <span className="text-gray-500 text-sm">@{post.handle} · {post.time}</span>
                                </div>
                                <p className="mt-1 text-gray-900">{post.content}</p>

                                {/* Fake Metrics */}
                                <div className="flex justify-between mt-3 text-gray-500 max-w-xs text-sm">
                                    <div className="flex items-center gap-1 hover:text-blue-500"><MessageCircle size={16} /> 12</div>
                                    <div className="flex items-center gap-1 hover:text-green-500"><Repeat size={16} /> {post.retweets}</div>
                                    <div className="flex items-center gap-1 hover:text-red-500"><Heart size={16} /> {post.likes}</div>
                                    <div className="flex items-center gap-1 hover:text-blue-500"><Share size={16} /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="p-6 text-center text-gray-400 text-sm">
                    Fin des résultats simulés
                </div>
            </div>
        </div>
    )
}
