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
              if (!range) {
                onSelect(undefined)
                return
              }

              // If we have both dates, use them directly
              if (range.from && range.to) {
                // Ensure the end date is inclusive by using the actual selected date
                onSelect({
                  from: range.from,
                  to: range.to
                })
                return
              }

              // If we only have a start date, set it as both start and end
              if (range.from && !range.to) {
                onSelect({
                  from: range.from,
                  to: range.from
                })
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
                onSelect(undefined)
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