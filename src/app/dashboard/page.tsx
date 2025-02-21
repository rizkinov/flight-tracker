"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FlightList } from "@/components/flights/flight-list"
import { StatsOverview } from "@/components/flights/stats-overview"
import { EmptyState } from "@/components/flights/empty-state"
import { Plus, Trash2, FileDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteAllFlights, getUserFlights } from "@/lib/services/flights"
import { useToast } from "@/components/ui/use-toast"
import { FlightForm } from "@/components/flights/flight-form"

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [hasFlights, setHasFlights] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddFlight, setShowAddFlight] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshData = async () => {
    if (!user) return
    try {
      const flights = await getUserFlights(user.uid)
      setHasFlights(flights.length > 0)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Error refreshing flights:', error)
      toast({
        title: "Error",
        description: "Failed to refresh flight data.",
        variant: "destructive",
      })
    }
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!user) return

    try {
      const flights = await getUserFlights(user.uid)
      
      if (flights.length === 0) {
        toast({
          title: "No Data",
          description: "There are no flights to export.",
          variant: "destructive",
        })
        return
      }

      // Prepare the data for export
      const data = flights.map(flight => ({
        'Flight Number': flight.flightNumber,
        'Date': flight.date,
        'From': flight.from,
        'To': flight.to,
        'Days': flight.days,
        'Notes': flight.notes || ''
      }))

      if (format === 'excel') {
        // Create Excel file
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Flights')
        XLSX.writeFile(workbook, 'flights.xlsx')
      } else {
        // Create PDF file
        const doc = new jsPDF() as jsPDFWithAutoTable
        
        // Add title
        doc.setFontSize(16)
        doc.text('Flight Records', 14, 20)
        
        // Add timestamp
        doc.setFontSize(10)
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30)
        
        // Add table
        doc.autoTable({
          head: [['Flight Number', 'Date', 'From', 'To', 'Days', 'Notes']],
          body: data.map(row => Object.values(row)),
          startY: 40,
        })
        
        doc.save('flights.pdf')
      }

      toast({
        title: "Export Successful",
        description: `Your flights have been exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error('Error exporting flights:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export flights. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    async function checkFlights() {
      if (!user) return
      try {
        const flights = await getUserFlights(user.uid)
        setHasFlights(flights.length > 0)
      } catch (error) {
        console.error('Error checking flights:', error)
        toast({
          title: "Error",
          description: "Failed to load flight data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkFlights()
  }, [user, authLoading, router, toast])

  const handleReset = async () => {
    if (!user) return
    try {
      await deleteAllFlights(user.uid)
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

  if (authLoading || loading) {
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
          <StatsOverview key={refreshKey} />
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <FileDown className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={() => setShowAddFlight(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Flight
                </Button>
              </div>
            </div>
            <FlightList key={refreshKey} onFlightsChange={setHasFlights} />
          </div>
        </>
      ) : (
        <EmptyState />
      )}

      <FlightForm 
        open={showAddFlight} 
        onOpenChange={setShowAddFlight}
        onSuccess={refreshData}
      />
    </div>
  )
} 