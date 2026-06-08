import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { imageUrl } from '@/components/common/getImageUrl'

export interface EmployeeAvatarItem {
  id: string
  name: string
  profile?: string | null
}

interface EmployeeAvatarStackProps {
  employees: EmployeeAvatarItem[]
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function EmployeeAvatarStack({
  employees,
  max = 4,
  size = 'sm',
  className,
}: EmployeeAvatarStackProps) {
  const visible = employees.slice(0, max)
  const extra = employees.length - visible.length
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'

  if (employees.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {visible.map((emp) => (
          <Avatar
            key={emp.id}
            className={cn(dim, 'border-2 border-white ring-1 ring-gray-100')}
          >
            {emp.profile ? (
              <AvatarImage src={imageUrl(emp.profile)} alt={emp.name} />
            ) : null}
            <AvatarFallback className="text-[10px] bg-muted">
              {initials(emp.name || '?')}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-2 text-xs text-muted-foreground">+{extra}</span>
      )}
    </div>
  )
}
