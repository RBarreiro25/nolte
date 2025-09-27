"use client"

import * as React from "react"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface SelectOption {
  value: string
  label: string
}

interface FuturisticSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  className?: string
  disabled?: boolean
}

export function FuturisticSelect({
  value,
  onValueChange,
  placeholder = "Select option",
  options,
  className,
  disabled = false
}: FuturisticSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find(option => option.value === value)

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "select-futuristic justify-between font-normal w-full",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[120px] p-0" align="start">
        <div className="select-content-futuristic p-1">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "select-item-futuristic flex items-center justify-between cursor-pointer",
                value === option.value && "bg-primary/10"
              )}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
