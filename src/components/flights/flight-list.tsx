"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FlightActions } from "./flight-actions"
import { useToast } from "@/components/ui/use-toast"
import { Flight, deleteFlight as deleteFlightService, updateFlight as updateFlightService } from "@/lib/services/flights"
import { getFlightDaysInYear } from "@/lib/flight-utils"
import { format } from "date-fns"

interface FlightListProps {
  flights: Flight[]
  selectedYear: number
  onFlightMutated?: () => void
}

export function FlightList({ flights, selectedYear, onFlightMutated }: FlightListProps) {
  const { toast } = useToast()

  const handleEdit = async (flight: Flight) => {
    try {
      await updateFlightService(flight.id, {
        flightNumber: flight.flightNumber,
        date: flight.date,
        from: flight.from,
        to: flight.to,
        notes: flight.notes,
      })
      toast({
        title: "Flight updated",
        description: `Flight ${flight.flightNumber} has been updated.`,
      })
      onFlightMutated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update flight. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFlightService(id)
      toast({
        title: "Flight deleted",
        description: "The flight has been deleted.",
        variant: "destructive",
      })
      onFlightMutated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flight. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!flights.length) {
    return <div className="text-center py-8 text-muted-foreground">No flights found.</div>
  }

  return (
    <Table>
      <TableCaption>A list of your recent flights.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Flight</TableHead>
          <TableHead className="w-[150px]">From</TableHead>
          <TableHead className="w-[150px]">To</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flights.map((flight) => (
          <TableRow key={flight.id}>
            <TableCell>{flight.flightNumber}</TableCell>
            <TableCell className="truncate" title={flight.from}>
              {flight.from.length > 15 ? `${flight.from.slice(0, 15)}...` : flight.from}
            </TableCell>
            <TableCell className="truncate" title={flight.to}>
              {flight.to.length > 15 ? `${flight.to.slice(0, 15)}...` : flight.to}
            </TableCell>
            <TableCell>{format(new Date(flight.date), 'LLL dd, y')}</TableCell>
            <TableCell>
              {(() => {
                const daysInYear = getFlightDaysInYear(flight, selectedYear)
                return daysInYear < flight.days
                  ? <span title={`${flight.days} days total`}>{daysInYear} <span className="text-muted-foreground">of {flight.days}</span></span>
                  : flight.days
              })()}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {flight.notes}
            </TableCell>
            <TableCell className="text-right">
              <FlightActions
                flight={flight}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
