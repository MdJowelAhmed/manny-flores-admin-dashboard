import { ChevronDown, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/cn'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

interface SubscriberFilterDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SubscriberFilterDropdown({
  value,
  onChange,
  className,
}: SubscriberFilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'w-40 bg-secondary text-white hover:bg-primary/90 border-primary rounded-md',
          'focus:ring-primary focus:ring-offset-0',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 shrink-0" />
          <SelectValue placeholder="Filter" />
          <ChevronDown className="h-4 w-4 ml-auto" />
        </div>
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
  )
}
