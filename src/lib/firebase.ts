import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore'
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics'

// Log the environment variables to help debug configuration issues
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'present' : 'missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'present' : 'missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'present' : 'missing',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'present' : 'missing',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'present' : 'missing',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'present' : 'missing',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'present' : 'missing'
})

// Determine if we're running locally
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Use the Firebase project domain for auth, even on localhost
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Log the actual config being used
console.log('Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? 'present' : 'missing',
  isLocalhost
})

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApp()
    }
    
    // Initialize services
    auth = getAuth(app)
    db = getFirestore(app)
    
    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser doesn\'t support persistence.')
      }
    })

    // Initialize Analytics only in production
    if (process.env.NODE_ENV === 'production') {
      isSupported().then(yes => {
        if (yes) {
          analytics = getAnalytics(app)
        }
      })
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error)
  }
} else {
  // Server-side initialization
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApp()
  }
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db, analytics } 