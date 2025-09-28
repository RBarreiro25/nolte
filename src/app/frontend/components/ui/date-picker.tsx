"use client"
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Label } from "./label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface DatePickerProps {
  value?: Date | string | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  includeTime?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  includeTime = false,
  minDate,
  maxDate
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState('10:00')
  const dateValue = React.useMemo(() => {
    return value ? (typeof value === 'string' ? new Date(value) : value) : null
  }, [value])

  React.useEffect(() => {
    if (dateValue && includeTime) {
      const hours = String(dateValue.getHours()).padStart(2, '0')
      const minutes = String(dateValue.getMinutes()).padStart(2, '0')
      setTimeValue(`${hours}:${minutes}`)
    }
  }, [dateValue, includeTime])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(null)
      setOpen(false)
      return
    }

    if (includeTime) {
      const [hours, minutes] = timeValue.split(':').map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      onChange(newDate)
    } else {
      onChange(selectedDate)
    }
    setOpen(false)
  }

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime)
    if (dateValue) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDate = new Date(dateValue)
      newDate.setHours(hours, minutes, 0, 0)
      onChange(newDate)
    }
  }

  if (includeTime) {
    return (
      <div className={`flex flex-col sm:flex-row gap-4 ${className || ''}`}>
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="px-1 font-primary">
            Date
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="input-futuristic justify-between font-normal w-32"
                disabled={disabled}
              >
                {dateValue ? dateValue.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker" className="px-1 font-primary">
            Time
          </Label>
          <Input
            type="time"
            id="time-picker"
            step="1"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="input-futuristic bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            disabled={disabled}
          />
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`input-futuristic justify-between font-normal w-full ${className || ''}`}
          disabled={disabled}
        >
          {dateValue ? dateValue.toLocaleDateString() : placeholder}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue || undefined}
          onSelect={handleDateSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}

export function Calendar24() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          defaultValue="10:30:00"
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}