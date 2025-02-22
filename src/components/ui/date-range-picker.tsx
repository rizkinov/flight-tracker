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
  selected,
  onSelect,
}: {
  className?: string
  selected?: DateRange
  onSelect: (date: DateRange | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)

  // Handle day selection with proper clearing behavior
  const handleSelect = (range: DateRange | undefined) => {
    // If a range is already selected and user clicks the start date, clear the selection
    if (selected?.from && range?.from && 
        selected.from.getTime() === range.from.getTime() && 
        (!range.to || range.to.getTime() === range.from.getTime())) {
      onSelect(undefined)
      return
    }

    // If user selects a date earlier than current start date, reset and start new selection
    if (selected?.from && range?.from && range.from < selected.from) {
      onSelect({ from: range.from, to: undefined })
      return
    }

    onSelect(range)
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
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected?.from ? (
              selected.to ? (
                <>
                  {format(selected.from, "LLL dd, y")} -{" "}
                  {format(selected.to, "LLL dd, y")}
                </>
              ) : (
                format(selected.from, "LLL dd, y")
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
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSelect(undefined)
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selected?.from && !selected.to) {
                  // If only start date is selected, set end date to same day
                  onSelect({ from: selected.from, to: selected.from })
                }
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