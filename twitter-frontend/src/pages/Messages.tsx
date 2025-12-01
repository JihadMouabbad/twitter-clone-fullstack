import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDocs,
  deleteDoc,
} from 'firebase/firestore'
import { Send, User, Users, Plus, X, Reply, Settings, Trash2, ArrowLeft } from 'lucide-react'

export const Messages = () => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const currentUser = auth.currentUser

  // Modals
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [replyTo, setReplyTo] = useState<any>(null)

  // 1. Charger Conversations
  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, 'chats'), where('users', 'array-contains', currentUser.uid))
    const unsub = onSnapshot(q, (snap) => {
      const chats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any))
      // Trier par date
      chats.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
      setConversations(chats)
    })
    return () => unsub()
  }, [currentUser])

  // 2. Charger Messages
  useEffect(() => {
    if (!chatId) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)))
    )
    return () => unsub()
  }, [chatId])

  // 3. Envoyer Message
  const sendMessage = async (e: any) => {
    e.preventDefault()
    if (!newMessage.trim() || !chatId || !currentUser) return

    const msgData: any = {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      createdAt: new Date(),
    }
    if (replyTo) {
      msgData.replyToId = replyTo.id
      msgData.replyToText = replyTo.text
      msgData.replyToName = replyTo.senderName
    }

    await addDoc(collection(db, 'chats', chatId, 'messages'), msgData)
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: newMessage,
      lastSenderName: currentUser.displayName,
      lastMessageSenderId: currentUser.uid,
      timestamp: new Date(),
    })
    setNewMessage('')
    setReplyTo(null)
  }

  // 4. Créer Groupe
  const createGroup = async () => {
    if (!groupName.trim() || !currentUser) return
    await addDoc(collection(db, 'chats'), {
      users: [currentUser.uid],
      userNames: [currentUser.displayName],
      isGroup: true,
      groupName: groupName,
      lastMessage: 'Groupe créé',
      timestamp: new Date(),
    })
    setShowGroupModal(false)
    setGroupName('')
  }

  // 5. AJOUTER MEMBRE (CORRIGÉ)
  const addMember = async () => {
    if (!memberSearch.trim() || !chatId) return

    // Recherche insensible à la casse (lowercase)
    const searchTerm = memberSearch.toLowerCase().trim()
    const q = query(collection(db, 'users'), where('usernameSearch', '==', searchTerm))

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      alert(
        "Utilisateur introuvable ! \n\nConseil: Demandez à l'utilisateur de visiter sa page Profil une fois pour activer son compte."
      )
      return
    }

    const userFound = querySnapshot.docs[0].data()
    const userFoundId = querySnapshot.docs[0].id

    // Ajouter au groupe
    const chatRef = doc(db, 'chats', chatId)
    await updateDoc(chatRef, {
      users: arrayUnion(userFoundId),
      userNames: arrayUnion(userFound.name),
    })

    alert(`${userFound.name} ajouté au groupe !`)
    setShowAddMember(false)
    setMemberSearch('')
  }

  // 6. SUPPRIMER GROUPE / QUITTER
  const deleteChat = async () => {
    if (
      !chatId ||
      !window.confirm('Voulez-vous vraiment supprimer cette conversation pour tout le monde ?')
    )
      return

    try {
      await deleteDoc(doc(db, 'chats', chatId))
      navigate('/messages')
    } catch (e) {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Modal Add Member */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold mb-4">Ajouter un membre</h3>
            <p className="text-xs text-gray-500 mb-2">Entrez le nom exact (ex: Hamza)</p>
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Nom..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddMember(false)} className="text-gray-500">
                Annuler
              </button>
              <button onClick={addMember} className="bg-green-500 text-white px-4 py-2 rounded">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal New Group */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold mb-4">Nouveau Groupe</h3>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Nom du groupe"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowGroupModal(false)} className="text-gray-500">
                Annuler
              </button>
              <button onClick={createGroup} className="bg-blue-500 text-white px-4 py-2 rounded">
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAUCHE: Liste Chats */}
      <div
        className={`w-full md:w-1/3 border-r flex flex-col ${chatId ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold text-xl">Messages</span>
          <button onClick={() => setShowGroupModal(true)}>
            <Plus className="bg-gray-100 p-2 rounded-full w-8 h-8 cursor-pointer" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => {
            const isGroup = chat.isGroup
            const displayName = isGroup
              ? chat.groupName
              : chat.userNames?.find((n: string) => n !== currentUser?.displayName) || 'Utilisateur'
            return (
              <div
                key={chat.id}
                onClick={() => navigate(`/messages/${chat.id}`)}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  chatId === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  <div
                    className={`p-2 rounded-full ${
                      isGroup ? 'bg-orange-100 text-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    {isGroup ? <Users size={16} /> : <User size={16} />}
                  </div>
                  {displayName}
                </div>
                <div className="text-gray-500 text-sm truncate pl-10 mt-1">
                  {chat.lastSenderName && (
                    <span className="font-bold text-black">{chat.lastSenderName}: </span>
                  )}
                  {chat.lastMessage}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DROITE: Chat Room */}
      <div className={`w-full md:w-2/3 flex flex-col ${!chatId ? 'hidden md:flex' : 'flex'}`}>
        {!chatId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">
            Sélectionnez une conversation
          </div>
        ) : (
          <>
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <button className="md:hidden mr-2" onClick={() => navigate('/messages')}>
                  <ArrowLeft size={20} /> {/* Petite flèche retour mobile */}
                </button>
                <span className="font-bold">Discussion</span>
              </div>

              <div className="flex gap-2">
                {/* Bouton Ajouter Membre */}
                <button
                  onClick={() => setShowAddMember(true)}
                  title="Ajouter membre"
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <Settings size={20} className="text-gray-600" />
                </button>
                {/* Bouton Supprimer Groupe */}
                <button
                  onClick={deleteChat}
                  title="Supprimer la conversation"
                  className="p-2 hover:bg-red-100 rounded-full"
                >
                  <Trash2 size={20} className="text-red-500" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.uid
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && <span className="text-xs text-gray-500 ml-2">{msg.senderName}</span>}
                    <div
                      className={`max-w-xs p-3 rounded-2xl ${
                        isMe ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {msg.replyToText && (
                        <div className="text-xs opacity-75 border-l-2 pl-2 mb-1">
                          Rep: {msg.replyToText}
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="text-xs text-gray-400 mt-1 hover:text-blue-500"
                    >
                      Répondre
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Input Zone */}
            <div className="p-4 border-t bg-white">
              {replyTo && (
                <div className="text-xs bg-gray-100 p-2 mb-2 rounded flex justify-between border-l-4 border-blue-500">
                  <span>Réponse à: {replyTo.text}</span>
                  <button onClick={() => setReplyTo(null)}>
                    <X size={14} />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-3 bg-gray-100 rounded-full outline-none"
                  placeholder="Message..."
                />
                <button
                  type="submit"
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
