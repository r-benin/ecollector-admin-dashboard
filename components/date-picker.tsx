"use client"
 
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"
 
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface datePickerProps {
    disabledDates: Date[] | []
    date: Date | undefined,
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
    disabled?: boolean
}
 
export default function DatePicker( { disabledDates, date, setDate, disabled } : datePickerProps ) { 
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
          disabled={disabled}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Select a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={[{before: new Date()}, ...disabledDates]}/>
      </PopoverContent>
    </Popover>
  )
}