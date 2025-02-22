"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import { format, isWithinInterval, startOfDay, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface FlightCalendarProps {
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
  dateRange: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  defaultMonth?: Date
  numberOfMonths?: number
  initialFocus?: boolean
}

export function FlightCalendar({
  className,
  classNames,
  showOutsideDays = true,
  dateRange,
  onSelect,
  ...props
}: FlightCalendarProps) {

  // Custom day content to show the travel indicator
  const renderDay = (day: Date) => {
    const dayInMonth = format(day, "d")
    let isInRange = false
    let isRangeStart = false
    let isRangeEnd = false

    if (dateRange?.from && dateRange?.to) {
      const start = startOfDay(dateRange.from)
      const end = startOfDay(dateRange.to)
      isInRange = isWithinInterval(day, { start, end })
      isRangeStart = format(day, "yyyy-MM-dd") === format(start, "yyyy-MM-dd")
      isRangeEnd = format(day, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")
    }

    return (
      <div className="relative h-9 w-9 p-0">
        {/* Travel period indicator */}
        {isInRange && (
          <div
            className={cn(
              "absolute inset-0 bg-primary/10",
              isRangeStart && "rounded-l-md",
              isRangeEnd && "rounded-r-md"
            )}
          />
        )}
        {/* Day number */}
        <div className={cn(
          "relative z-10 flex h-full w-full items-center justify-center",
          isRangeStart && "rounded-l-md bg-primary text-primary-foreground",
          isRangeEnd && "rounded-r-md bg-primary text-primary-foreground"
        )}>
          {dayInMonth}
        </div>
      </div>
    )
  }

  return (
    <DayPicker
      mode="range"
      selected={dateRange}
      onSelect={onSelect}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal relative",
          "focus-within:relative focus-within:z-20",
          "hover:bg-accent hover:text-accent-foreground",
          "aria-selected:opacity-100"
        ),
        day_selected: "bg-primary text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        day_range_start: "rounded-l-md",
        day_range_end: "rounded-r-md",
        day_range_middle: "bg-primary/10",
        ...classNames,
      }}
      formatters={{ formatCaption: (date) => format(date, "MMMM yyyy") }}
      footer={
        <div className="mt-3 text-xs text-muted-foreground">
          {dateRange?.from && dateRange?.to && (
            <>
              {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
              <br />
              {differenceInDays(dateRange.to, dateRange.from) + 1} days in destination
            </>
          )}
        </div>
      }
      {...props}
    />
  )
} 