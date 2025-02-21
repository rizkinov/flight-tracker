import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

export function useAuthCookie() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Set auth cookie when user is logged in
      document.cookie = `auth=${user.uid}; path=/; max-age=2592000; SameSite=Strict; Secure`
    } else {
      // Remove auth cookie when user is logged out
      document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
  }, [user])
} 