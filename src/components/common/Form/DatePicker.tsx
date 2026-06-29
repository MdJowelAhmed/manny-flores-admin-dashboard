import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, max, startOfDay } from 'date-fns'
import { cn } from '@/utils/cn'

export interface DatePickerProps {
  value?: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  disablePast?: boolean
  minDate?: Date
  id?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  label,
  className,
  disabled = false,
  disablePast = false,
  minDate,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectableFrom = React.useMemo(() => {
    const today = startOfDay(new Date())
    const minimum = minDate ? startOfDay(minDate) : undefined

    if (disablePast && minimum) return max([today, minimum])
    if (disablePast) return today
    if (minimum) return minimum
    return undefined
  }, [disablePast, minDate])

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium"
        >
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal h-11',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'd/M/yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            defaultMonth={value ?? selectableFrom ?? new Date()}
            captionLayout="dropdown"
            startMonth={selectableFrom ?? new Date(2020, 0, 1)}
            endMonth={new Date(2030, 11, 31)}
            disabled={selectableFrom ? { before: selectableFrom } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
