"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Trash2, FileDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
import { deleteAllFlights, getUserFlights, Flight } from "@/lib/services/flights"
import { FlightList } from "@/components/flights/flight-list"
import { StatsOverview } from "@/components/flights/stats-overview"
import { EmptyState } from "@/components/flights/empty-state"
import { YearSelector } from "@/components/flights/year-selector"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'
import { BatchFlightForm } from "@/components/flights/batch-flight-form"

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [allFlights, setAllFlights] = useState<Flight[]>([])
  const [hasFlights, setHasFlights] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearsFromFlights = new Set(allFlights.map(f => parseInt(f.date.substring(0, 4), 10)))
    yearsFromFlights.add(currentYear)
    return Array.from(yearsFromFlights).sort((a, b) => a - b)
  }, [allFlights])

  const filteredFlights = useMemo(() => {
    const yearStr = String(selectedYear)
    return allFlights.filter(f => f.date.startsWith(yearStr))
  }, [allFlights, selectedYear])

  const loadFlights = async () => {
    if (!user) return
    try {
      const flights = await getUserFlights(user.uid)
      setAllFlights(flights)
      setHasFlights(flights.length > 0)
    } catch (error) {
      console.error('Error loading flights:', error)
      toast({
        title: "Error",
        description: "Failed to load flight data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    if (!user) return
    try {
      const flights = await getUserFlights(user.uid)
      setAllFlights(flights)
      setHasFlights(flights.length > 0)
    } catch (error) {
      console.error('Error refreshing flights:', error)
      toast({
        title: "Error",
        description: "Failed to refresh flight data.",
        variant: "destructive",
      })
    }
  }

  const handleExport = (exportFormat: 'pdf' | 'excel') => {
    if (filteredFlights.length === 0) {
      toast({
        title: "No Data",
        description: `There are no flights to export for ${selectedYear}.`,
        variant: "destructive",
      })
      return
    }

    try {
      const data = filteredFlights.map(flight => ({
        'Flight Number': flight.flightNumber,
        'Date': flight.date,
        'From': flight.from,
        'To': flight.to,
        'Days': flight.days,
        'Notes': flight.notes || ''
      }))

      if (exportFormat === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Flights')
        XLSX.writeFile(workbook, `flights-${selectedYear}.xlsx`)
      } else {
        const doc = new jsPDF() as jsPDFWithAutoTable

        doc.setFontSize(16)
        doc.text(`Flight Records - ${selectedYear}`, 14, 20)

        doc.setFontSize(10)
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30)

        doc.autoTable({
          head: [['Flight Number', 'Date', 'From', 'To', 'Days', 'Notes']],
          body: data.map(row => Object.values(row)),
          startY: 40,
        })

        doc.save(`flights-${selectedYear}.pdf`)
      }

      toast({
        title: "Export Successful",
        description: `Your ${selectedYear} flights have been exported as ${exportFormat.toUpperCase()}.`,
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

    loadFlights()
  }, [user, authLoading, router])

  const handleReset = async () => {
    if (!user) return
    try {
      await deleteAllFlights(user.uid)
      setAllFlights([])
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

  if (!hasFlights) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <YearSelector
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={setSelectedYear}
          />
        </div>
        <p className="text-muted-foreground">
          Overview of your travel statistics and flight records.
        </p>
      </div>

      {/* Statistics */}
      <StatsOverview flights={filteredFlights} selectedYear={selectedYear} />

      {/* Batch Add Flights */}
      <div>
        <div className="flex flex-col space-y-2 mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Add Flights</h2>
          <p className="text-muted-foreground">
            Add multiple flights at once to track your travel days.
          </p>
        </div>
        <BatchFlightForm onSuccess={refreshData} />
      </div>

      {/* Flight History */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Flight History</h2>
            <p className="text-muted-foreground">
              A list of your recent flights.
            </p>
          </div>
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
          </div>
        </div>
        <FlightList flights={filteredFlights} onFlightMutated={refreshData} />
      </div>
    </div>
  )
}
