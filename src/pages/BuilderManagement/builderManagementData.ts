import { Users, User, Calendar } from 'lucide-react'

export const builderStats = [
  {
    titleKey: 'builderManagement.totalBuilder' as const,
    icon: Users,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    titleKey: 'builderManagement.activeNow' as const,
    icon: User,
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    titleKey: 'builderManagement.inactive' as const,
    icon: Calendar,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
]

export const BUILDER_ROLE = 'BUILDER'
