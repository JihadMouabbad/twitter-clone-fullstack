import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export const Login = () => {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return

    try {
      // Connecter ou Créer l'utilisateur
      const res = await axios.post('http://localhost:3001/users', { username })

      // Sauvegarder dans le navigateur
      localStorage.setItem('userId', res.data.id)
      localStorage.setItem('username', res.data.username)

      // Aller à l'accueil
      navigate('/')
    } catch (error) {
      alert('Erreur de connexion serveur')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        {/* Logo Twitter */}
        <svg viewBox="0 0 24 24" className="h-12 w-12 text-blue-500 fill-current mx-auto mb-6">
          <g>
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
          </g>
        </svg>

        <h1 className="text-3xl font-bold mb-8">Connectez-vous à Twitter</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur (ex: Hamza)"
            className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-black text-white p-4 rounded-full font-bold text-lg hover:bg-gray-800 transition"
          >
            Suivant
          </button>
        </form>
      </div>
    </div>
  )
}
