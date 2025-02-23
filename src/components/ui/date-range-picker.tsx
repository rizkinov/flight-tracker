"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

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

  console.log('DateRangePicker render:', { selected, open })

  // Keep internal state in sync with props
  React.useEffect(() => {
    console.log('DateRangePicker selected prop changed:', selected)
  }, [selected])

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
            onSelect={(range) => {
              console.log('Calendar onSelect:', { range, currentSelected: selected })
              
              if (!range) {
                console.log('Range cleared')
                onSelect(undefined)
                return
              }
              
              // If we have both dates or neither, just pass through
              if ((range.from && range.to) || (!range.from && !range.to)) {
                console.log('Complete range or cleared:', range)
                onSelect(range)
                return
              }
              
              // If we only have a start date
              if (range.from && !range.to) {
                console.log('Only start date, setting end to same:', range.from)
                const newRange = { from: range.from, to: range.from }
                onSelect(newRange)
                return
              }
            }}
            numberOfMonths={2}
          />
          <div className="flex items-center justify-end gap-2 p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('Clear button clicked')
                onSelect(undefined)
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                console.log('Done button clicked')
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