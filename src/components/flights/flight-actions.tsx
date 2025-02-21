"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Check, ChevronsUpDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Flight } from "@/lib/services/flights"
import { useToast } from "@/components/ui/use-toast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import Image from 'next/image'

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

interface FlightActionsProps {
  flight: Flight
  onEdit: (flight: Flight) => void
  onDelete: (id: string) => void
}

// Define colors for entries
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

export function FlightActions({ flight, onEdit, onDelete }: FlightActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editedFlight, setEditedFlight] = useState(flight)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [usedCountries, setUsedCountries] = useState<Set<string>>(new Set([flight.from, flight.to]))
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { toast } = useToast()

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

  const CountrySelect = ({ 
    value, 
    onChange,
    placeholder,
    id  // Add id parameter
  }: { 
    value: string, 
    onChange: (value: string) => void,
    placeholder: string,
    id: string  // Add id to props
  }) => {
    const isOpen = activeDropdown === id
    const [searchQuery, setSearchQuery] = useState("")
    const color = value ? getCountryColor(value) : undefined

    // Filter countries based on search query
    const filteredCountries = countries.filter(country =>
      country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleOpen = () => {
      setActiveDropdown(isOpen ? null : id)
      if (!isOpen) {
        setSearchQuery("")
      }
    }

    return (
      <div className="relative w-full">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          onClick={handleOpen}
          style={{
            backgroundColor: color,
            borderColor: color ? color.replace('rgb', 'rgba').replace(')', ', 0.5)') : undefined
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
            <span className="truncate">{value || placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {isOpen && (
          <div 
            className="absolute z-[99999] w-full mt-2 rounded-md border bg-popover shadow-md"
            style={{ minWidth: "300px" }}
          >
            <div className="p-2">
              <Input
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div 
              className="max-h-[200px] overflow-y-auto p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {loadingCountries ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading countries...
                </div>
              ) : filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No country found.
                </div>
              ) : (
                <div className="grid gap-1">
                  {filteredCountries.map((country) => (
                    <div
                      key={country.cca2}
                      onClick={() => {
                        onChange(country.name.common);
                        setSearchQuery("");
                        setActiveDropdown(null);
                        setUsedCountries(prev => new Set(Array.from(prev).concat(country.name.common)));
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
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleEdit = () => {
    onEdit(editedFlight)
    setIsEditOpen(false)
  }

  return (
    <div className="flex gap-2">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit flight</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>
              Make changes to your flight details here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="flightNumber" className="text-right">
                Flight #
              </Label>
              <Input
                id="flightNumber"
                value={editedFlight.flightNumber}
                onChange={(e) =>
                  setEditedFlight({ ...editedFlight, flightNumber: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={editedFlight.date}
                onChange={(e) =>
                  setEditedFlight({ ...editedFlight, date: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">
                From
              </Label>
              <div className="col-span-3">
                <CountrySelect
                  value={editedFlight.from}
                  onChange={(value) => setEditedFlight({ ...editedFlight, from: value })}
                  placeholder="Select departure country"
                  id="edit-from-country"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                To
              </Label>
              <div className="col-span-3">
                <CountrySelect
                  value={editedFlight.to}
                  onChange={(value) => setEditedFlight({ ...editedFlight, to: value })}
                  placeholder="Select arrival country"
                  id="edit-to-country"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days" className="text-right">
                Days
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={editedFlight.days}
                onChange={(e) =>
                  setEditedFlight({ ...editedFlight, days: parseInt(e.target.value, 10) || 1 })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={editedFlight.notes}
                onChange={(e) =>
                  setEditedFlight({ ...editedFlight, notes: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete flight</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              flight record for {flight.flightNumber}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(flight.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 