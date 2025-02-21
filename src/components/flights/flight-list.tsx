"use client"

import { useEffect, useState, useCallback } from "react"
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
import { useAuth } from "@/lib/auth-context"
import { Flight, getUserFlights, deleteFlight as deleteFlightService, updateFlight as updateFlightService } from "@/lib/services/flights"

interface FlightListProps {
  onFlightsChange?: (hasFlights: boolean) => void
}

export function FlightList({ onFlightsChange }: FlightListProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  const loadFlights = useCallback(async () => {
    if (!user) return
    
    try {
      const userFlights = await getUserFlights(user.uid)
      setFlights(userFlights)
      onFlightsChange?.(userFlights.length > 0)
      setLoading(false)
    } catch (error) {
      console.error('Error loading flights:', error)
      toast({
        title: "Error",
        description: "Failed to load flights. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }, [user, onFlightsChange, toast])

  useEffect(() => {
    loadFlights()
  }, [loadFlights])

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
      loadFlights()
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
      loadFlights()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flight. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading flights...</div>
  }

  if (!flights.length) {
    return <div className="text-center py-8 text-muted-foreground">No flights found.</div>
  }

  return (
    <Table>
      <TableCaption>A list of your recent flights.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Flight #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead className="w-[150px]">Notes</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flights.map((flight) => (
          <TableRow key={flight.id}>
            <TableCell className="font-medium">{flight.flightNumber}</TableCell>
            <TableCell>{flight.date}</TableCell>
            <TableCell>{flight.from}</TableCell>
            <TableCell>{flight.to}</TableCell>
            <TableCell className="truncate">{flight.notes}</TableCell>
            <TableCell>
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