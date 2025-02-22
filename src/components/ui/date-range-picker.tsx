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
  allowReset = false,
}: {
  className?: string
  date?: DateRange
  onDateChange: (date: DateRange | undefined) => void
  allowReset?: boolean
}) {
  const [open, setOpen] = React.useState(false)

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
            onSelect={(newRange) => {
              // If there's no new selection, reset everything
              if (!newRange) {
                onDateChange(undefined)
                return
              }

              // Only allow reset behavior if allowReset is true (single flight forms)
              if (allowReset && date?.from && newRange.from && 
                  date.from.getTime() === newRange.from.getTime()) {
                onDateChange(undefined)
                return
              }

              // For a new single date selection
              if (newRange.from && !newRange.to) {
                // In batch mode, just set the from date
                if (!allowReset) {
                  onDateChange({ from: newRange.from, to: undefined })
                } else {
                  // In single flight mode, set both dates to the same day
                  onDateChange({ from: newRange.from, to: newRange.from })
                }
                return
              }

              // For a range selection, use it as is
              onDateChange(newRange)
            }}
            numberOfMonths={2}
          />
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
        </PopoverContent>
      </Popover>
    </div>
  )
} 