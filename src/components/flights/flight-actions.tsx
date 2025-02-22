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
import { DateRange } from "react-day-picker"
import { format, addDays, differenceInDays } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

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
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: new Date(flight.date),
      to: addDays(new Date(flight.date), flight.days - 1)
    })

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

    // Reset form and date range when dialog opens
    useEffect(() => {
      if (open) {
        const startDate = new Date(flight.date)
        const endDate = addDays(startDate, flight.days - 1)
        
        setDateRange({ from: startDate, to: endDate })
        
        form.reset({
          flightNumber: flight.flightNumber,
          date: format(startDate, 'yyyy-MM-dd'),
          from: flight.from,
          to: flight.to,
          days: flight.days,
          notes: flight.notes || ""
        })
      }
    }, [open, flight, form])

    // Update date range when days change
    useEffect(() => {
      const subscription = form.watch((value, { name }) => {
        if (name === 'days') {
          const days = value.days as number
          if (days && days > 0 && dateRange?.from) {
            const newEndDate = addDays(dateRange.from, days - 1)
            setDateRange({ from: dateRange.from, to: newEndDate })
          }
        }
      })
      return () => subscription.unsubscribe()
    }, [form, dateRange?.from])

    async function onSubmit(data: FlightFormValues) {
      if (!user) return

      setLoading(true)
      try {
        await updateFlight(flight.id, data, user.isAnonymous)
        
        toast({
          title: "Flight updated",
          description: `Flight ${data.flightNumber} has been updated.`,
        })
        
        onOpenChange(false)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>
              Make changes to your flight details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="flightNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SQ123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select departure country"
                        id="edit-from-country"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <CountrySelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select arrival country"
                        id="edit-to-country"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Travel Period</FormLabel>
                      <FormControl>
                        <div className="w-full">
                          <DateRangePicker
                            date={dateRange}
                            onDateChange={(range) => {
                              setDateRange(range)
                              if (range?.from) {
                                field.onChange(format(range.from, 'yyyy-MM-dd'))
                                const days = range.to ? 
                                  differenceInDays(range.to, range.from) + 1 : 
                                  1
                                form.setValue('days', days)
                              } else {
                                field.onChange('')
                                form.setValue('days', 1)
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days in Destination</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10)
                            if (value > 0) {
                              field.onChange(value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional notes about your flight"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={() => setIsEditOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit flight</span>
      </Button>
      <EditFlightDialog 
        flight={flight} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />

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