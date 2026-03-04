import { ChevronDown, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'
import { NOTIFICATION_TYPES } from '../constants'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
] as const

interface NotificationFilterDropdownProps {
  typeValue: string
  statusValue: string
  onTypeChange: (value: string) => void
  onStatusChange: (value: string) => void
  className?: string
}

export function NotificationFilterDropdown({
  typeValue,
  statusValue,
  onTypeChange,
  onStatusChange,
  className,
}: NotificationFilterDropdownProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={typeValue} onValueChange={onTypeChange}>
        <SelectTrigger
          className={cn(
            'w-40 bg-primary text-primary-foreground hover:bg-primary/90 border-primary rounded-md',
            'focus:ring-primary focus:ring-offset-0'
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0" />
            <SelectValue placeholder="Type" />
            <ChevronDown className="h-4 w-4 ml-auto" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">
            All Types
          </SelectItem>
          {NOTIFICATION_TYPES.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger
          className={cn(
            'w-40 bg-primary text-primary-foreground hover:bg-primary/90 border-primary rounded-md',
            'focus:ring-primary focus:ring-offset-0'
          )}
        >
          <SelectValue placeholder="Status" />
          <ChevronDown className="h-4 w-4 ml-auto" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
