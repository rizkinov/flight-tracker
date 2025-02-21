"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FlightList } from "@/components/flights/flight-list"
import { StatsOverview } from "@/components/flights/stats-overview"
import { EmptyState } from "@/components/flights/empty-state"
import { Plus, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteAllFlights } from "@/lib/services/flights"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [hasFlights, setHasFlights] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleReset = async () => {
    try {
      await deleteAllFlights(user!.uid)
      setHasFlights(false)
      toast({
        title: "Data reset successful",
        description: "All flights have been deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your travel statistics and flight records.
        </p>
      </div>
      
      {hasFlights ? (
        <>
          <StatsOverview />

          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Flight History</h2>
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your flight records
                        and reset your dashboard to its initial state.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Reset All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Link href="/flights">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Flight
                  </Button>
                </Link>
              </div>
            </div>
            <FlightList onFlightsChange={setHasFlights} />
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
} 