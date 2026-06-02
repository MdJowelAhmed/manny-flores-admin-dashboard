import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Pencil, Search, Trash2, Users } from 'lucide-react'
import { ConfirmDialog, ModalWrapper } from '@/components/common'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import { formatDateDisplay } from '@/utils/formatters'
import type { Employee } from '@/types'
import {
  useDeleteTeamMutation,
  useGetTeamsQuery,
  type TeamApiDoc,
  type TeamEmployee,
} from '@/redux/api/teamApi'
import { AddTeamModal } from './AddTeamModal'

interface ViewTeamListModalProps {
  open: boolean
  onClose: () => void
  employees: Employee[]
}

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '?'
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

function formatIsoDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return formatDateDisplay(d)
}

export function ViewTeamListModal({
  open,
  onClose,
  employees,
}: ViewTeamListModalProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [editTarget, setEditTarget] = useState<TeamApiDoc | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamApiDoc | null>(null)

  const { data, isLoading, isFetching } = useGetTeamsQuery(
    { page: 1, limit: 100 },
    { skip: !open }
  )

  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation()

  const teams: TeamApiDoc[] = useMemo(() => data?.data ?? [], [data])

  /** Employees that belong to teams OTHER than the one being edited. They
   *  cannot be added to the edited team (one employee → one team rule). */
  const blockedEmployeeIds = useMemo(() => {
    if (!editTarget) return []
    const set = new Set<string>()
    teams.forEach((team) => {
      if (team.id === editTarget.id) return
      team.employees?.forEach((emp) => emp.id && set.add(emp.id))
    })
    return Array.from(set)
  }, [teams, editTarget])

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teams
    return teams.filter((team) => {
      if (team.teamName?.toLowerCase().includes(q)) return true
      return team.employees?.some((emp) => {
        const name = (emp.name ?? '').toLowerCase()
        const email = (emp.email ?? '').toLowerCase()
        return name.includes(q) || email.includes(q)
      })
    })
  }, [teams, search])

  const loading = isLoading || isFetching

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTeam(deleteTarget.id).unwrap()
      toast({
        title: t('common.success'),
        description: t('projectScheduling.teamDeleted', 'Team deleted successfully.'),
        variant: 'success',
      })
      setDeleteTarget(null)
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        t('projectScheduling.teamDeleteFailed', 'Could not delete the team. Please try again.')
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projectScheduling.viewTeamList', 'Team list')}
      description={t(
        'projectScheduling.viewTeamListDescription',
        'All teams and the employees assigned to each of them.'
      )}
      size="full"
      className="max-w-3xl bg-white sm:rounded-2xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(
              'projectScheduling.searchTeams',
              'Search teams or employees...'
            )}
            className="h-11 rounded-lg pl-9 bg-muted/40 border-gray-200/80"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground rounded-xl border border-dashed">
            <Users className="h-8 w-8 mb-2 text-muted-foreground/50" />
            {teams.length === 0
              ? t('projectScheduling.noTeamsFound', 'No teams created yet.')
              : t('projectScheduling.noMatchingTeams', 'No teams match your search.')}
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={() => setEditTarget(team)}
                onDelete={() => setDeleteTarget(team)}
              />
            ))}
          </div>
        )}
      </div>

      <AddTeamModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        team={editTarget}
        employees={employees}
        blockedEmployeeIds={blockedEmployeeIds}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('projectScheduling.deleteTeam', 'Delete team')}
        description={t('projectScheduling.deleteTeamConfirm', {
          name: deleteTarget?.teamName ?? '',
          defaultValue:
            'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
        })}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </ModalWrapper>
  )
}

function TeamCard({
  team,
  onEdit,
  onDelete,
}: {
  team: TeamApiDoc
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const memberCount = team.employees?.length ?? 0
  const hasSchedule = !!(team.startDate || team.endDate)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {team.teamName || '—'}
            </h3>
            <Badge variant="info" className="text-[10px] font-semibold">
              {memberCount === 1
                ? t('projectScheduling.memberCount', { count: memberCount, defaultValue: '{{count}} member' })
                : t('projectScheduling.memberCountPlural', { count: memberCount, defaultValue: '{{count}} members' })}
            </Badge>
          </div>
          {hasSchedule && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatIsoDate(team.startDate)} — {formatIsoDate(team.endDate)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 rounded-lg border-gray-200 text-gray-700 hover:bg-muted/50"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            {t('common.edit', 'Edit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="h-8 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {t('common.delete', 'Delete')}
          </Button>
        </div>
      </div>

      {memberCount === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground italic">
          {t('projectScheduling.noEmployeesAssigned')}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
          {team.employees.map((emp) => (
            <MemberRow key={emp.id} member={emp} />
          ))}
        </ul>
      )}
    </div>
  )
}

function MemberRow({ member }: { member: TeamEmployee }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5 bg-white">
      <Avatar className="h-9 w-9 border border-gray-200">
        {member.profile ? (
          <AvatarImage src={member.profile} alt={member.name} />
        ) : null}
        <AvatarFallback className="text-xs">
          {initialsFromName(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">
          {member.name || '—'}
        </p>
        {member.email && (
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        )}
      </div>
      {member.role && (
        <span
          className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
            'bg-emerald-50 text-emerald-700 border border-emerald-100'
          )}
        >
          {member.role}
        </span>
      )}
    </li>
  )
}
