import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )
}

let app = null
let auth = null

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase no está configurado. Crea un archivo .env.local con las variables VITE_FIREBASE_*.',
    )
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  }

  return auth
}
