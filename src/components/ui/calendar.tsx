import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/utils/cn'
import 'react-day-picker/style.css'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('rdp-compact p-1.5 text-sm', className)}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
