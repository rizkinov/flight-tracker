"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  GoogleAuthProvider, 
  User, 
  onAuthStateChanged, 
  signInWithPopup,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence,
  inMemoryPersistence
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Listen for auth state changes
  useEffect(() => {
    console.log('Setting up auth state listener...')
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', { 
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : 'No user'
      })
      setUser(user)
      setLoading(false)

      // Handle routing based on auth state
      const currentPath = window.location.pathname
      if (user && currentPath === '/') {
        console.log('Authenticated user on landing page, redirecting to dashboard')
        router.push('/dashboard')
      } else if (!user && currentPath !== '/' && currentPath !== '/login') {
        console.log('Unauthenticated user on protected page, redirecting to home')
        router.push('/')
      }
    })

    return () => {
      console.log('Cleaning up auth state listener')
      unsubscribe()
    }
  }, [router])

  const signIn = async () => {
    try {
      console.log('Starting sign in process...')
      
      // First set persistence to LOCAL
      console.log('Setting persistence to LOCAL')
      await setPersistence(auth, browserLocalPersistence)
      
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      console.log('Initiating popup sign in')
      const result = await signInWithPopup(auth, provider)
      console.log('Sign in successful:', {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName
        }
      })
      
      setUser(result.user)
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      })
      router.push('/dashboard')
      // Add window reload after a short delay to ensure the router.push completes
      setTimeout(() => {
        window.location.reload()
      }, 100)
    } catch (error: any) {
      console.error('Error during sign in:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to start sign-in process. Please try again.",
        variant: "destructive",
      })
    }
  }

  const signOut = async () => {
    try {
      console.log('Starting sign out process...')
      await firebaseSignOut(auth)
      console.log('Successfully signed out')
      setUser(null)
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
      router.push('/')
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 