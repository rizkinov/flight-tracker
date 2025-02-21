import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyCCz4z2MwxTkMchtxhRBL5qoNJpXHGc4NE",
  authDomain: "flight-track-6325c.firebaseapp.com",
  projectId: "flight-track-6325c",
  storageBucket: "flight-track-6325c.firebasestorage.app",
  messagingSenderId: "938847337437",
  appId: "1:938847337437:web:b0c1205cd2abd80c3c9434",
  measurementId: "G-WSN9QVV2P7"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Initialize services
const auth = getAuth(app)
const db = getFirestore(app)

// Initialize Analytics and handle non-browser environments
let analytics = null
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && getAnalytics(app))
}

export { app, auth, db, analytics } 