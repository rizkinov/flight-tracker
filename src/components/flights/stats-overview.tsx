"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { BaseCountrySelector } from "./base-country-selector"
import { Progress } from "@/components/ui/progress"

const dummyCountryData = [
  { name: "United Kingdom", days: 15, color: "#60a5fa" },  // Blue-400: cool
  { name: "France", days: 10, color: "#f97316" },         // Orange-500: warm
  { name: "Germany", days: 8, color: "#2dd4bf" },         // Teal-400: cool
  { name: "Netherlands", days: 7, color: "#f472b6" },     // Pink-400: warm
]

const totalFlights = 6
const daysInBaseCountry = 15
const totalDays = dummyCountryData.reduce((acc, curr) => acc + curr.days, 0)
const daysOutsideBaseCountry = totalDays - daysInBaseCountry

// Tax threshold calculations
const maxDaysOutside = 183
const daysLeft = maxDaysOutside - daysOutsideBaseCountry
const percentageUsed = (daysOutsideBaseCountry / maxDaysOutside) * 100

// Travel pattern stats
const avgStayDuration = Math.round(totalDays / totalFlights)
const longestStay = Math.max(...dummyCountryData.map(country => country.days))
const mostVisitedCountry = dummyCountryData.reduce((a, b) => a.days > b.days ? a : b).name

export function StatsOverview() {
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
                  data={dummyCountryData}
                  dataKey="days"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name} (${entry.days})`}
                >
                  {dummyCountryData.map((entry, index) => (
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
              <div className="text-4xl font-bold">{totalFlights}</div>
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
              <div className="text-4xl font-bold">{avgStayDuration}</div>
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
              <div className="text-4xl font-bold">{longestStay}</div>
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
              <div className="text-2xl font-bold truncate">{mostVisitedCountry}</div>
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