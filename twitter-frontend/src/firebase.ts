// src/firebase.ts
import { initializeApp } from 'firebase/app'
// Zidna hadu bach nkhdmo b Auth w Database
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration dyalek (S7i7a 100%)
const firebaseConfig = {
  apiKey: 'AIzaSyCxVHz0Vm7cvbcGG6tIXa-diOh2qxM6NcU',
  authDomain: 'twitter-clone-9aa99.firebaseapp.com',
  projectId: 'twitter-clone-9aa99',
  storageBucket: 'twitter-clone-9aa99.firebasestorage.app',
  messagingSenderId: '884749762532',
  appId: '1:884749762532:web:3470ed7a6f69b517c711f1',
  measurementId: 'G-CCRT60P08N',
}

// 1. Lancer Firebase
const app = initializeApp(firebaseConfig)

// 2. EXPORTER LES OUTILS (Hado houma li kanou naqsin)
// Bla hadu, App.tsx ma ghadi yl9a ma yakhod
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
