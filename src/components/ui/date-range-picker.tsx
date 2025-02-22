"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange, DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
  className,
  date,
  onDateChange,
  allowReset = true,
}: {
  className?: string
  date?: DateRange
  onDateChange: (date: DateRange | undefined) => void
  allowReset?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (newRange: DateRange | undefined) => {
    // If clicking an already selected start date, clear the selection
    if (newRange?.from && date?.from && 
        newRange.from.getTime() === date.from.getTime() && 
        !newRange.to) {
      onDateChange(undefined)
      return
    }

    // If clicking an already selected end date, clear only the end date
    if (newRange?.from && date?.to && 
        newRange.to?.getTime() === date.to.getTime()) {
      onDateChange({ from: date.from, to: undefined })
      return
    }

    // If only start date selected, set only start date
    if (newRange?.from && !newRange.to) {
      onDateChange({ from: newRange.from, to: undefined })
      return
    }

    // Otherwise use the range as is
    onDateChange(newRange)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick travel period</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
          />
          {allowReset && (
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDateChange(undefined)
                  setOpen(false)
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setOpen(false)
                }}
              >
                Done
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
} 