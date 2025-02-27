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

const COLORS = [
  "#fecdd3", // Light Pink
  "#bfdbfe", // Light Blue
  "#bbf7d0", // Light Green
  "#ddd6fe", // Light Purple
  "#fed7aa", // Light Orange
  "#e9d5ff", // Light Violet
  "#fde68a", // Light Yellow
  "#a5f3fc", // Light Cyan
  "#c7d2fe", // Light Indigo
  "#f5d0fe", // Light Magenta
]

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
    let longestStayCountry = ""
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
        longestStayCountry = flight.to
      }

      // Update most visited
      if (newDays > mostVisitedDays) {
        mostVisitedCountry = flight.to
        mostVisitedDays = newDays
      }
    })

    const countryData: CountryData[] = Array.from(countryDays.entries())
      .map(([name, days], index) => ({
        name,
        days,
        color: COLORS[index % COLORS.length]
      }))

    const avgStayDuration = flights.length ? Math.round(totalDays / flights.length) : 0

    return {
      countryData,
      totalFlights: flights.length,
      avgStayDuration,
      longestStay,
      longestStayCountry,
      mostVisitedCountry,
      totalDays
    }
  }, [flights])

  // Tax residency calculations
  const currentYear = new Date().getFullYear()
  const isLeapYear = (year: number) => {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)
  }
  const daysInYear = isLeapYear(currentYear) ? 366 : 365
  const minDaysRequired = 183
  const maxTravelDays = daysInYear - minDaysRequired // Maximum days allowed outside Singapore
  const daysInSingapore = daysInYear - stats.totalDays // Days not traveling are considered as days in Singapore
  const remainingTravelDays = Math.max(0, maxTravelDays - stats.totalDays)
  
  // Calculate percentage based on travel days used
  const travelDaysPercentage = Math.min(100, Math.round((stats.totalDays / maxTravelDays) * 100))

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Loading statistics...</div>
        </div>
      </div>
    )
  }

  if (!flights.length) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>
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
      <h2 className="text-2xl font-semibold tracking-tight">Statistics</h2>

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
                  cy="45%"
                  outerRadius={100}
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
                  formatter={(value) => (
                    <span 
                      className="text-xs text-muted-foreground"
                      title={value}
                    >
                      {value.length > 15 ? `${value.slice(0, 15)}...` : value}
                    </span>
                  )}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{
                    fontSize: '10px',
                    paddingTop: '20px',
                  }}
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
              <p className="text-sm text-muted-foreground" title={stats.longestStayCountry}>
                Days in {stats.longestStayCountry.length > 15 ? `${stats.longestStayCountry.slice(0, 15)}...` : stats.longestStayCountry}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Visited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" title={stats.mostVisitedCountry}>
                {stats.mostVisitedCountry.length > 15 ? `${stats.mostVisitedCountry.slice(0, 15)}...` : stats.mostVisitedCountry}
              </div>
              <p className="text-xs text-muted-foreground">
                Highest days count
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Full width Tax Status */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Singapore Tax Residency Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Days traveled: {stats.totalDays}</span>
                <span>Days remaining: {remainingTravelDays}</span>
              </div>
              <Progress value={travelDaysPercentage} className="h-2" />
              {daysInSingapore < minDaysRequired ? (
                <p className="text-sm text-destructive">
                  You need {minDaysRequired - daysInSingapore} more days in Singapore to qualify for tax residency
                </p>
              ) : remainingTravelDays > 0 ? (
                <p className="text-sm text-green-600">
                  You can travel for up to {remainingTravelDays} more days while maintaining tax residency
                </p>
              ) : (
                <p className="text-sm text-destructive">
                  You have exceeded the maximum travel days for maintaining tax residency
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 