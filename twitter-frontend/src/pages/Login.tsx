import React from 'react'
import { auth, googleProvider, db } from '../firebase'
import { signInWithPopup } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { DEFAULT_AVATAR } from './Profile'
import { useNavigate } from 'react-router-dom'

export const Login = () => {
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Sauvegarder / mettre à jour le profil dans Firestore
      await setDoc(
        doc(db, 'users', user.uid),
        {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL || DEFAULT_AVATAR,
          usernameSearch: user.displayName?.toLowerCase().trim(),
        },
        { merge: true }
      )

      navigate('/')
    } catch (error) {
      console.error('Erreur Login:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <svg viewBox="0 0 24 24" className="h-12 w-12 text-blue-500 fill-current mx-auto mb-6">
          <g>
            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
          </g>
        </svg>
        <h1 className="text-2xl font-bold mb-6">Ça se passe maintenant.</h1>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 p-3 rounded-full hover:bg-gray-50 transition font-bold text-gray-700"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="h-6 w-6"
            alt="G"
          />
          Continuer avec Google
        </button>
      </div>
    </div>
  )
}
