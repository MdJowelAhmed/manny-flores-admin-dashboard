import { useAppSelector } from '@/redux/hooks'
import { getRoleDisplayName } from '@/utils/roleHelpers'

export function UserRoleIndicator() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return null

  const displayName = getRoleDisplayName(user.role)

  return (
    <div className="px-3 py-2 rounded-lg border bg-muted/50">
      <p className="text-xs text-muted-foreground">Access Role</p>
      <p className="text-sm font-medium">{displayName}</p>
    </div>
  )
}
