"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, Save, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createFlight } from "@/lib/services/flights"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from 'next/image'

// Define a list of colors for entries
const entryColors = [
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

interface Country {
  name: {
    common: string;
  };
  cca2: string;
  flags: {
    svg: string;
    png: string;
  };
}

interface BatchFlight {
  id: string
  flightNumber: string
  date: string
  from: string
  to: string
  days: number
  notes?: string
}

export default function FlightsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [flights, setFlights] = useState<BatchFlight[]>([])
  const [saving, setSaving] = useState(false)
  const [usedCountries, setUsedCountries] = useState<Set<string>>(new Set())
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)

  // Fetch countries from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
        const data = await response.json()
        // Sort countries by name
        const sortedCountries = data.sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        )
        setCountries(sortedCountries)
      } catch (error) {
        console.error('Error fetching countries:', error)
        toast({
          title: "Error",
          description: "Failed to load countries. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [toast])

  // Get color for a country based on its order of appearance
  const getCountryColor = (countryName: string) => {
    const countriesArray = Array.from(usedCountries)
    const index = countriesArray.indexOf(countryName)
    return index >= 0 ? entryColors[index % entryColors.length] : undefined
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const addNewRow = () => {
    setFlights([
      ...flights,
      {
        id: Math.random().toString(36).substring(7),
        flightNumber: "",
        date: new Date().toISOString().split('T')[0],
        from: "Singapore",
        to: "",
        days: 1,
        notes: ""
      }
    ])
    // Update used countries to include Singapore
    setUsedCountries(prev => new Set(Array.from(prev).concat("Singapore")))
  }

  const updateFlight = (id: string, field: keyof BatchFlight, value: string | number) => {
    setFlights(flights.map(flight => {
      if (flight.id !== id) return flight
      
      const updatedFlight = { ...flight, [field]: value }
      
      // Update used countries when a new country is selected
      if ((field === 'from' || field === 'to') && typeof value === 'string') {
        setUsedCountries(prev => new Set(Array.from(prev).concat(value)))
      }
      
      return updatedFlight
    }))
  }

  const removeFlight = (id: string) => {
    setFlights(flights.filter(flight => flight.id !== id))
    
    // Recalculate used countries
    const remainingCountries = new Set<string>()
    flights.forEach(flight => {
      if (flight.id !== id) {
        if (flight.from) remainingCountries.add(flight.from)
        if (flight.to) remainingCountries.add(flight.to)
      }
    })
    setUsedCountries(remainingCountries)
  }

  const handleSave = async () => {
    if (!user) return

    // Validate all flights
    const invalidFlights = flights.filter(flight => 
      !flight.flightNumber || !flight.date || !flight.from || !flight.to || flight.days < 1
    )

    if (invalidFlights.length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for all flights.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      // Save all flights
      await Promise.all(flights.map(flight => 
        createFlight(user.uid, {
          flightNumber: flight.flightNumber,
          date: flight.date,
          from: flight.from,
          to: flight.to,
          days: flight.days,
          notes: flight.notes
        })
      ))

      toast({
        title: "Success",
        description: `Successfully added ${flights.length} flights.`
      })
      
      // Clear the form
      setFlights([])
      setUsedCountries(new Set())
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving flights:', error)
      toast({
        title: "Error",
        description: "Failed to save flights. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const CountrySelect = ({ 
    value, 
    onChange,
    placeholder 
  }: { 
    value: string, 
    onChange: (value: string) => void,
    placeholder: string 
  }) => {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const color = value ? getCountryColor(value) : undefined

    // Filter countries based on search query
    const filteredCountries = countries.filter(country =>
      country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between transition-colors duration-200"
            style={{
              backgroundColor: color,
              borderColor: color ? color.replace('rgb', 'rgba').replace(')', ', 0.5)') : undefined,
              color: color ? '#000000' : undefined
            }}
          >
            <div className="flex items-center gap-2 truncate">
              {value && (
                <Image 
                  src={countries.find(c => c.name.common === value)?.flags.png || ''}
                  alt={`${value} flag`}
                  width={16}
                  height={12}
                  className="object-cover"
                />
              )}
              <span className="truncate" title={value || placeholder}>
                {value ? (value.length > 15 ? `${value.slice(0, 15)}...` : value) : placeholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-2 transition-all duration-200 animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center border-b mb-2">
            <Input
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {loadingCountries ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading countries...
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No country found.
              </div>
            ) : (
              filteredCountries.map((country) => (
                <div
                  key={country.cca2}
                  onClick={() => {
                    onChange(country.name.common)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    value === country.name.common && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Image 
                      src={country.flags.png} 
                      alt={`${country.name.common} flag`}
                      width={16}
                      height={12}
                      className="object-cover"
                    />
                    <span className="flex-1">{country.name.common}</span>
                  </div>
                  {value === country.name.common && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
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
        <h1 className="text-3xl font-bold tracking-tight">Batch Add Flights</h1>
        <p className="text-muted-foreground">
          Add multiple flights at once. Fill in the details for each flight and save them all together.
        </p>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-[2fr_2fr_2fr_2fr_1fr_50px] gap-4 font-medium">
            <div>Flight Number</div>
            <div>Date</div>
            <div>From</div>
            <div>To</div>
            <div>Days</div>
            <div></div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {flights.map((flight) => (
            <div key={flight.id} className="grid grid-cols-[2fr_2fr_2fr_2fr_1fr_50px] gap-4 items-center">
              <Input
                placeholder="e.g. SQ123"
                value={flight.flightNumber}
                onChange={(e) => updateFlight(flight.id, 'flightNumber', e.target.value)}
              />
              <Input
                type="date"
                value={flight.date}
                onChange={(e) => updateFlight(flight.id, 'date', e.target.value)}
              />
              <CountrySelect
                value={flight.from}
                onChange={(value) => updateFlight(flight.id, 'from', value)}
                placeholder="From"
              />
              <CountrySelect
                value={flight.to}
                onChange={(value) => updateFlight(flight.id, 'to', value)}
                placeholder="To"
              />
              <Input
                type="number"
                min="1"
                value={flight.days}
                onChange={(e) => updateFlight(flight.id, 'days', parseInt(e.target.value) || 1)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFlight(flight.id)}
                className="h-10 w-10"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {flights.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No flights added yet. Click &quot;Add Flight&quot; to start.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={addNewRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Flight
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={flights.length === 0 || saving}
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save All Flights"}
        </Button>
      </div>
    </div>
  )
} 