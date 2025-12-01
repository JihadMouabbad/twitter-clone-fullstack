import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { Bell, X } from 'lucide-react'

export const NotificationToast = () => {
  const [notification, setNotification] = useState<any>(null)
  const currentUser = auth.currentUser

  useEffect(() => {
    if (!currentUser) return

    // Écouter les changements sur TOUS les chats où je suis
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        // "modified" ya3ni chi hed sifet message jdid f chat deja kayn
        if (change.type === 'modified') {
          const data = change.doc.data()
          const chatId = change.doc.id

          // 1. Wach ana li sifet l-message? (Ila ana, matla3ch notif)
          if (data.lastMessageSenderId === currentUser.uid) return

          // 2. Filter "Temps Réel" (Bach ma ytl3ouch les anciens messages au chargement)
          // On vérifie si le message a été envoyé il y a moins de 2 secondes
          // (Note: hasPendingWrites est true quand c'est local, on ignore pour éviter doublons)
          if (snapshot.metadata.hasPendingWrites) return

          // 3. Check "Mode Vacances"
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists() && userDoc.data().vacationMode) {
            console.log('Notif bloquée par Mode Vacances 🏖️')
            return
          }

          // 4. AFFICHER LA NOTIF
          setNotification({
            sender: data.lastSenderName || 'Nouveau message',
            text: data.lastMessage,
            id: chatId,
          })

          // Sawt d Notif (Optionnel - Zwin f démo)
          // const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          // audio.play().catch(e => console.log(e));

          // T-khbba mora 4 sec
          setTimeout(() => setNotification(null), 4000)
        }
      })
    })

    return () => unsubscribe()
  }, [currentUser])

  if (!notification) return null

  return (
    <div className="fixed top-5 right-5 z-[100] animate-bounce cursor-pointer">
      <div className="bg-blue-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] border border-blue-400">
        <div className="bg-white/20 p-2 rounded-full">
          <Bell size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">{notification.sender}</h4>
          <p className="text-xs truncate max-w-[200px] opacity-90">{notification.text}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setNotification(null)
          }}
        >
          <X size={18} className="hover:text-gray-300" />
        </button>
      </div>
    </div>
  )
}
