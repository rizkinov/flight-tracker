import { addDays, differenceInDays, max, min } from "date-fns"
import { Flight } from "@/lib/services/flights"

/**
 * Returns the end date of a flight (last day of stay).
 * Start date counts as day 1, so end = start + days - 1.
 */
export function getFlightEndDate(flight: Flight): Date {
  return addDays(new Date(flight.date), flight.days - 1)
}

/**
 * Calculates how many days of a flight fall within a given year.
 * For a flight Dec 24–Jan 5 (13 days), year 2025 returns 8, year 2026 returns 5.
 */
export function getFlightDaysInYear(flight: Flight, year: number): number {
  const flightStart = new Date(flight.date)
  const flightEnd = getFlightEndDate(flight)
  const yearStart = new Date(year, 0, 1) // Jan 1
  const yearEnd = new Date(year, 11, 31) // Dec 31

  const overlapStart = max([flightStart, yearStart])
  const overlapEnd = min([flightEnd, yearEnd])

  if (overlapStart > overlapEnd) return 0
  return differenceInDays(overlapEnd, overlapStart) + 1
}

/**
 * Returns true if any days of the flight fall within the given year.
 */
export function flightOverlapsYear(flight: Flight, year: number): boolean {
  return getFlightDaysInYear(flight, year) > 0
}
