import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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
let db = null
let secondaryApp = null
let secondaryAuth = null

function ensurePrimaryApp() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  }
  return app
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase no está configurado. Crea un archivo .env.local con las variables VITE_FIREBASE_*.',
    )
  }

  return ensurePrimaryApp()
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase no está configurado. Crea un archivo .env.local con las variables VITE_FIREBASE_*.',
    )
  }

  if (!app) {
    ensurePrimaryApp()
  }

  return auth
}

export function getSecondaryFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase no está configurado. Crea un archivo .env.local con las variables VITE_FIREBASE_*.',
    )
  }

  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, 'Secondary')
    secondaryAuth = getAuth(secondaryApp)
  }

  return secondaryAuth
}

export function getFirestoreDb() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase no está configurado. Crea un archivo .env.local con las variables VITE_FIREBASE_*.',
    )
  }

  if (!app) {
    ensurePrimaryApp()
  }

  if (!db) {
    db = getFirestore(app)
  }

  return db
}
