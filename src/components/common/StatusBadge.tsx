
import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS, ROLE_COLORS } from '@/utils/constants'
import { capitalize } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status: string
  type?: 'status' | 'role'
  className?: string
}

export function StatusBadge({ status, type = 'status', className }: StatusBadgeProps) {
  const colors = type === 'role' ? ROLE_COLORS : STATUS_COLORS
  const colorConfig = colors[status] || { bg: 'bg-secondary-foreground', text: 'text-primary' }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-0',
        colorConfig.bg,
        colorConfig.text,
        className
      )}
    >
      {capitalize(status.replace(/_/g, ' '))}
    </Badge>
  )
}













