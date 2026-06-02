import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, Search, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import type { Employee } from '@/types'
import {
  useAddTeamMutation,
  useUpdateTeamMutation,
  type TeamApiDoc,
} from '@/redux/api/teamApi'

export interface TeamDraft {
  id?: string
  name: string
  employeeIds: string[]
}

interface AddTeamModalProps {
  open: boolean
  onClose: () => void
  employees: Employee[]
  /** IDs of employees already assigned to other teams. They are filtered
   *  out of the dropdown and search entirely so they cannot be picked.
   *  When editing, the edited team's own members are kept selectable. */
  blockedEmployeeIds?: string[]
  /** When provided, the modal works in edit mode (pre-filled + PATCH). */
  team?: TeamApiDoc | null
  onCreated?: (team: TeamDraft) => void
  onUpdated?: () => void
}

interface EmployeeOption {
  id: string
  name: string
  email?: string
  subtitle?: string
}

const inputClass =
  'rounded-lg bg-muted/50 border-gray-200/80 focus-visible:ring-primary/30 h-11'

export function AddTeamModal({
  open,
  onClose,
  employees,
  blockedEmployeeIds = [],
  team = null,
  onCreated,
  onUpdated,
}: AddTeamModalProps) {
  const { t } = useTranslation()
  const isEditMode = !!team

  const [teamName, setTeamName] = useState('')
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeesMenuOpen, setEmployeesMenuOpen] = useState(false)

  const [addTeam, { isLoading: isCreating }] = useAddTeamMutation()
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation()
  const isSaving = isCreating || isUpdating

  const currentMemberIds = useMemo(
    () => team?.employees?.map((e) => e.id).filter(Boolean) ?? [],
    [team]
  )

  useEffect(() => {
    if (!open) return
    setTeamName(team?.teamName ?? '')
    setSelectedEmployeeIds(team ? currentMemberIds : [])
    setEmployeeSearch('')
    setEmployeesMenuOpen(false)
  }, [open, team, currentMemberIds])

  // Employees on other teams are blocked, but never the edited team's own members.
  const blockedSet = useMemo(() => {
    const set = new Set(blockedEmployeeIds.filter(Boolean))
    currentMemberIds.forEach((id) => set.delete(id))
    return set
  }, [blockedEmployeeIds, currentMemberIds])

  /** Normalize the global employee list, and (in edit mode) merge in the
   *  team's existing members so members not returned by the employees
   *  endpoint (e.g. USER role) are still shown and remain selectable. */
  const allOptions = useMemo<EmployeeOption[]>(() => {
    const map = new Map<string, EmployeeOption>()
    employees.forEach((e) => {
      if (!e.id) return
      map.set(e.id, {
        id: e.id,
        name: e.fullName,
        email: e.email,
        subtitle: e.employeeId,
      })
    })
    team?.employees?.forEach((e) => {
      if (!e.id || map.has(e.id)) return
      map.set(e.id, {
        id: e.id,
        name: e.name,
        email: e.email,
        subtitle: e.role,
      })
    })
    return Array.from(map.values())
  }, [employees, team])

  const availableEmployees = useMemo(
    () => allOptions.filter((e) => !blockedSet.has(e.id)),
    [allOptions, blockedSet]
  )

  const selectedEmployees = useMemo(() => {
    const set = new Set(selectedEmployeeIds)
    return availableEmployees.filter((e) => set.has(e.id))
  }, [availableEmployees, selectedEmployeeIds])

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    if (!q) return availableEmployees
    return availableEmployees.filter((e) => {
      const name = (e.name ?? '').toLowerCase()
      const email = (e.email ?? '').toLowerCase()
      const sub = (e.subtitle ?? '').toLowerCase()
      return name.includes(q) || email.includes(q) || sub.includes(q)
    })
  }, [employeeSearch, availableEmployees])

  const toggleEmployee = (id: string) => {
    if (blockedSet.has(id)) return
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const removeSelected = (id: string) => {
    setSelectedEmployeeIds((prev) => prev.filter((x) => x !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = teamName.trim()
    if (!name) {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.teamNameRequired'),
        variant: 'destructive',
      })
      return
    }
    const employeeId = selectedEmployeeIds.filter((id) => !blockedSet.has(id))
    if (employeeId.length === 0) {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.teamMembersRequired'),
        variant: 'destructive',
      })
      return
    }

    try {
      if (isEditMode && team) {
        await updateTeam({ id: team.id, teamName: name, employeeId }).unwrap()
        toast({
          title: t('common.success'),
          description: t('projectScheduling.teamUpdated', 'Team updated successfully.'),
          variant: 'success',
        })
        onUpdated?.()
      } else {
        const response = await addTeam({ teamName: name, employeeId }).unwrap()
        onCreated?.({
          id: response?.data?.id,
          name: response?.data?.teamName ?? name,
          employeeIds: response?.data?.employees?.map((emp) => emp.id) ?? employeeId,
        })
        toast({
          title: t('common.success'),
          description: t('projectScheduling.teamCreated'),
          variant: 'success',
        })
      }
      onClose()
    } catch (err) {
      const fallback = isEditMode
        ? t('projectScheduling.teamUpdateFailed', 'Could not update the team. Please try again.')
        : t('projectScheduling.teamCreateFailed', 'Could not create the team. Please try again.')
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? fallback
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
      title={
        isEditMode
          ? t('projectScheduling.editTeam', 'Edit team')
          : t('projectScheduling.addTeam')
      }
      size="lg"
      className="max-w-xl bg-white sm:rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-1">
        <FormInput
          label={t('projectScheduling.teamName')}
          placeholder={t('projectScheduling.placeholderTeamName')}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className={cn(inputClass)}
        />

        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">
            {t('projectScheduling.teamMembers')}
            <span className="text-destructive ml-1">*</span>
          </span>

          <DropdownMenu open={employeesMenuOpen} onOpenChange={setEmployeesMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex h-11 w-full items-center justify-between rounded-lg border border-gray-200/80 bg-muted/50 px-3 text-sm text-gray-900',
                  'hover:bg-secondary-foreground transition-colors'
                )}
              >
                <span className="truncate text-muted-foreground">
                  {selectedEmployeeIds.length > 0
                    ? t('projectScheduling.employeesSelected', { count: selectedEmployeeIds.length })
                    : t('projectScheduling.selectEmployees')}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-60" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width] p-2"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder={t('projectScheduling.searchEmployees')}
                    className="h-10 rounded-lg bg-white border-gray-200/80 pl-9"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <div className="max-h-64 overflow-auto pr-1">
                {filteredEmployees.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    {availableEmployees.length === 0
                      ? t(
                          'projectScheduling.allEmployeesInTeams',
                          'All employees are already in a team.'
                        )
                      : t('projectScheduling.noEmployeesFound')}
                  </div>
                ) : (
                  filteredEmployees.map((emp) => {
                    const checked = selectedEmployeeIds.includes(emp.id)
                    return (
                      <DropdownMenuCheckboxItem
                        key={emp.id}
                        checked={checked}
                        onCheckedChange={() => toggleEmployee(emp.id)}
                        className="py-2"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {emp.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {emp.subtitle} {emp.email ? `• ${emp.email}` : ''}
                          </div>
                        </div>
                      </DropdownMenuCheckboxItem>
                    )
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedEmployees.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedEmployees.map((emp) => (
                <Badge key={emp.id} variant="info" className="gap-1.5 pr-1.5">
                  <span className="truncate max-w-[160px]">{emp.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(emp.id)}
                    className="rounded-full p-0.5 hover:bg-primary/15 transition-colors"
                    aria-label={t('projectScheduling.removeEmployee')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border-gray-200 min-w-[100px]"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            isLoading={isSaving}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg min-w-[120px]"
          >
            {isEditMode
              ? t('common.saveChanges', 'Save changes')
              : t('projectScheduling.createTeam')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
