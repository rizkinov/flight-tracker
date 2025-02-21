"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BaseCountrySelector } from "./base-country-selector"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { getUserFlights, Flight } from "@/lib/services/flights"

interface CountryData {
  name: string
  days: number
  color: string
}

const COLORS = {
  "United Kingdom": "#60a5fa", // Blue-400
  "France": "#f97316",        // Orange-500
  "Germany": "#2dd4bf",       // Teal-400
  "Netherlands": "#f472b6",   // Pink-400
}

export function StatsOverview() {
  const { user } = useAuth()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFlights() {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        const userFlights = await getUserFlights(user.uid)
        setFlights(userFlights)
      } catch (error) {
        console.error('Error loading flights:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFlights()
  }, [user])

  const stats = useMemo(() => {
    const countryDays = new Map<string, number>()
    let totalDays = 0
    let longestStay = 0
    let mostVisitedCountry = ""
    let mostVisitedDays = 0

    flights.forEach(flight => {
      const days = flight.days || 1 // Default to 1 day if not specified
      totalDays += days

      // Update country stats
      const currentDays = countryDays.get(flight.to) || 0
      const newDays = currentDays + days
      countryDays.set(flight.to, newDays)

      // Update longest stay
      if (days > longestStay) {
        longestStay = days
      }

      // Update most visited
      if (newDays > mostVisitedDays) {
        mostVisitedCountry = flight.to
        mostVisitedDays = newDays
      }
    })

    const countryData: CountryData[] = Array.from(countryDays.entries())
      .map(([name, days]) => ({
        name,
        days,
        color: COLORS[name as keyof typeof COLORS] || "#94a3b8" // Default to slate-400
      }))

    const avgStayDuration = flights.length ? Math.round(totalDays / flights.length) : 0

    return {
      countryData,
      totalFlights: flights.length,
      avgStayDuration,
      longestStay,
      mostVisitedCountry,
      totalDays
    }
  }, [flights])

  // Tax threshold calculations
  const maxDaysOutside = 183
  const daysOutsideBaseCountry = stats.totalDays
  const daysLeft = maxDaysOutside - daysOutsideBaseCountry
  const percentageUsed = (daysOutsideBaseCountry / maxDaysOutside) * 100

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>
          <BaseCountrySelector />
        </div>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Loading statistics...</div>
        </div>
      </div>
    )
  }

  if (!flights.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>
          <BaseCountrySelector />
        </div>

        <Card className="p-8">
          <CardHeader className="text-center">
            <CardTitle>No Flight Data Available</CardTitle>
            <CardDescription>
              Add your first flight to start seeing your travel statistics and tax residency tracking.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>
        <BaseCountrySelector />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column - Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Days in Countries</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.countryData}
                  dataKey="days"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${entry.days})`}
                >
                  {stats.countryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="opacity-90 hover:opacity-100 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }} 
                />
                <Legend 
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right column - Stats Grid */}
        <div className="grid gap-4 grid-cols-2 grid-rows-2 h-full">
          <Card>
            <CardHeader>
              <CardTitle>Total Flights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalFlights}</div>
              <p className="text-xs text-muted-foreground">
                Flights tracked this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Stay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.avgStayDuration}</div>
              <p className="text-xs text-muted-foreground">
                Days per destination
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Longest Stay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.longestStay}</div>
              <p className="text-xs text-muted-foreground">
                Days in one location
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Visited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{stats.mostVisitedCountry}</div>
              <p className="text-xs text-muted-foreground">
                Highest days count
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Full width Tax Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tax Residency Status</CardTitle>
            <CardDescription>183-day rule threshold tracker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Days used: {daysOutsideBaseCountry}</span>
                <span>Days remaining: {daysLeft}</span>
              </div>
              <Progress value={percentageUsed} className="h-2" />
              {percentageUsed > 80 && (
                <p className="text-sm text-destructive">
                  Warning: Approaching tax residency threshold
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 