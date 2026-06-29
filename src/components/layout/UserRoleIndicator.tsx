import { useAppSelector } from '@/redux/hooks'
import { getRoleDisplayName, getRoleBadgeColor } from '@/utils/roleHelpers'
import { cn } from '@/utils/cn'

export function UserRoleIndicator() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return null

  const displayName = getRoleDisplayName(user.role)

  return (
    <div className={cn('px-3 py-2 rounded-lg border', getRoleBadgeColor(user.role))}>
      <p className="text-xs opacity-80">Access Role</p>
      <p className="text-sm font-medium">{displayName}</p>
    </div>
  )
}
