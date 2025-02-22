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
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateFlight } from "@/lib/services/flights"

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

const formSchema = z.object({
  flightNumber: z.string().min(1, "Flight number is required"),
  from: z.string().min(1, "Departure city is required"),
  to: z.string().min(1, "Arrival city is required"),
  date: z.string().min(1, "Date is required"),
  days: z.number().min(1, "Must stay at least 1 day"),
  notes: z.string().optional(),
})

type FlightFormValues = z.infer<typeof formSchema>

interface EditFlightDialogProps {
  flight: {
    id: string;
    flightNumber: string;
    date: string;
    from: string;
    to: string;
    days: number;
    notes?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlightActions({ flight, onEdit, onDelete }: FlightActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editedFlight, setEditedFlight] = useState(flight)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [usedCountries, setUsedCountries] = useState<Set<string>>(new Set([flight.from, flight.to]))
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

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
    id
  }: { 
    value: string, 
    onChange: (value: string) => void,
    placeholder: string,
    id: string
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
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
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
              <span className="truncate">{value || placeholder}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[300px] p-0 transition-all duration-200 animate-in fade-in-0 zoom-in-95"
          align="start"
          side="bottom"
        >
          <div className="flex items-center border-b p-2">
            <Input
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(country.name.common);
                      setSearchQuery("");
                      setOpen(false);
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
        </PopoverContent>
      </Popover>
    )
  }

  const handleEdit = () => {
    onEdit(editedFlight)
    setIsEditOpen(false)
  }

  const EditFlightDialog = ({ flight, open, onOpenChange }: EditFlightDialogProps) => {
    const { user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<FlightFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        flightNumber: flight.flightNumber,
        date: flight.date,
        from: flight.from,
        to: flight.to,
        days: flight.days,
        notes: flight.notes || ""
      }
    })

    async function onSubmit(data: FlightFormValues) {
      if (!user) return

      setLoading(true)
      try {
        await updateFlight(flight.id, data)
        toast({
          title: "Flight updated",
          description: `Flight ${data.flightNumber} has been updated.`,
        })
        onOpenChange(false)
        // Force a hard refresh to get the latest data
        window.location.reload()
      } catch (error) {
        console.error('Error updating flight:', error)
        toast({
          title: "Error",
          description: "Failed to update flight. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit flight</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl gap-6 z-50">
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>
              Make changes to your flight details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="flightNumber" className="text-right">
                Flight #
              </Label>
              <Input
                id="flightNumber"
                value={form.watch('flightNumber')}
                onChange={(e) => form.setValue('flightNumber', e.target.value)}
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
                value={form.watch('date')}
                onChange={(e) => form.setValue('date', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="from" className="text-right">
                From
              </Label>
              <div className="col-span-3">
                <CountrySelect
                  value={form.watch('from')}
                  onChange={(value) => form.setValue('from', value)}
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
                  value={form.watch('to')}
                  onChange={(value) => form.setValue('to', value)}
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
                value={form.watch('days')}
                onChange={(e) => form.setValue('days', parseInt(e.target.value, 10) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={form.watch('notes')}
                onChange={(e) => form.setValue('notes', e.target.value)}
                className="col-span-3"
              />
            </div>
          </form>
          <DialogFooter>
            <Button type="submit" onClick={() => form.handleSubmit(onSubmit)()} disabled={loading}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex gap-2">
      <EditFlightDialog flight={flight} open={isEditOpen} onOpenChange={setIsEditOpen} />

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