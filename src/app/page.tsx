"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default function HomePage() {
  const { user, loading, signIn, signInAsGuest } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to FlightTrack
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your flights and monitor travel statistics
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={signIn} className="w-full">
            <Icons.google className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue without account
              </span>
            </div>
          </div>
          <Button onClick={signInAsGuest} variant="outline" className="w-full">
            Continue as Guest
          </Button>
          <p className="px-8 text-center text-xs text-muted-foreground">
            Guest data will be automatically deleted after 24 hours
          </p>
        </div>
      </div>
    </div>
  )
} 