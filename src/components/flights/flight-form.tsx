"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'
import { createFlight } from '@/lib/services/flights'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
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
import { DateRange } from 'react-day-picker'
import { format, addDays, differenceInDays } from 'date-fns'
import { DateRangePicker } from "@/components/ui/date-range-picker"

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

const formSchema = z.object({
  flightNumber: z.string().min(1, "Flight number is required"),
  from: z.string().min(1, "Departure city is required"),
  to: z.string().min(1, "Arrival city is required"),
  date: z.string().min(1, "Date is required"),
  days: z.number().min(1, "Must stay at least 1 day"),
  notes: z.string().optional(),
})

type FlightFormValues = z.infer<typeof formSchema>

interface FlightFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
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

export function FlightForm({ open, onOpenChange, onSuccess }: FlightFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [usedCountries, setUsedCountries] = useState<Set<string>>(new Set())
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 1)
  })

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

  const form = useForm<FlightFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flightNumber: "",
      date: new Date().toISOString().split('T')[0],
      from: "Singapore",
      to: "",
      days: 1,
      notes: ""
    }
  })

  // Update days when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const days = differenceInDays(dateRange.to, dateRange.from) + 1
      form.setValue('days', days)
      form.setValue('date', format(dateRange.from, 'yyyy-MM-dd'))
    }
  }, [dateRange, form])

  // Update date range when days change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'days' && dateRange?.from) {
        const days = value.days as number
        if (days && days > 0) {
          setDateRange({
            from: dateRange.from,
            to: addDays(dateRange.from, days - 1)
          })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, dateRange])

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
          className="w-full justify-between transition-colors duration-200"
          onClick={handleOpen}
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

        {isOpen && (
          <div 
            className="absolute z-[99999] w-full mt-2 rounded-md border bg-popover shadow-md transition-all duration-200 animate-in fade-in-0 zoom-in-95"
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

  async function onSubmit(data: FlightFormValues) {
    console.log('Form submission started', { data, user: user?.uid })
    
    if (!user) {
      console.error('No user found during submission')
      return
    }

    setLoading(true)
    try {
      console.log('Attempting to create flight in Firebase...')
      const result = await createFlight(user.uid, data, user.isAnonymous)
      console.log('Flight created successfully', result)
      
      toast({
        title: "Flight added",
        description: `Flight ${data.flightNumber} from ${data.from} to ${data.to} has been added.`,
      })
      
      form.reset()
      setUsedCountries(new Set())
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Detailed error adding flight:', error)
      toast({
        title: "Error",
        description: "Failed to add flight. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Log form errors during validation
  const formState = form.formState
  console.log('Form state:', { 
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    errors: formState.errors 
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Flight</DialogTitle>
          <DialogDescription>
            Add a new flight to track your travel days.
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
                      id="from-country"
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
                      id="to-country"
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
                    <DateRangePicker
                      date={dateRange}
                      onDateChange={(range) => {
                        if (range?.from && range?.to) {
                          const days = differenceInDays(range.to, range.from) + 1
                          setDateRange(range)
                          field.onChange(format(range.from, 'yyyy-MM-dd'))
                          form.setValue('days', days)
                        }
                      }}
                    />
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
                {loading ? "Adding..." : "Add Flight"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 