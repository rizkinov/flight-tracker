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
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
    console.log('Firebase app initialized successfully:', app.name)
  } else {
    app = getApp()
    console.log('Using existing Firebase app:', app.name)
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error)
  throw error
}

// Initialize services
let auth: Auth
try {
  auth = getAuth(app)
  console.log('Firebase auth initialized successfully')
} catch (error) {
  console.error('Error initializing Firebase auth:', error)
  throw error
}

let db: Firestore
try {
  db = getFirestore(app)
  console.log('Firebase Firestore initialized successfully')
} catch (error) {
  console.error('Error initializing Firestore:', error)
  throw error
}

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support persistence.')
    } else {
      console.error('Error enabling persistence:', err)
    }
  })
}

// Initialize Analytics only in production
let analytics: Analytics | null = null
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  isSupported().then(yes => {
    if (yes) {
      try {
        analytics = getAnalytics(app)
        console.log('Firebase Analytics initialized successfully')
      } catch (error) {
        console.error('Error initializing Firebase Analytics:', error)
      }
    } else {
      console.log('Firebase Analytics not supported in this environment')
    }
  }).catch(error => {
    console.error('Error checking Analytics support:', error)
  })
}

export { app, auth, db, analytics } 