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

export interface TeamDraft {
  id: string
  name: string
  employeeIds: string[]
}

interface AddTeamModalProps {
  open: boolean
  onClose: () => void
  employees: Employee[]
  onCreateTeam: (team: TeamDraft) => void
}

const inputClass =
  'rounded-lg bg-muted/50 border-gray-200/80 focus-visible:ring-primary/30 h-11'

function uniqById(list: Employee[]) {
  const map = new Map<string, Employee>()
  list.forEach((e) => map.set(e.id, e))
  return Array.from(map.values())
}

export function AddTeamModal({
  open,
  onClose,
  employees,
  onCreateTeam,
}: AddTeamModalProps) {
  const { t } = useTranslation()
  const [teamName, setTeamName] = useState('')
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])

  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeesMenuOpen, setEmployeesMenuOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setTeamName('')
    setSelectedEmployeeIds([])
    setEmployeeSearch('')
    setEmployeesMenuOpen(false)
  }, [open])

  const selectedEmployees = useMemo(() => {
    const set = new Set(selectedEmployeeIds)
    return employees.filter((e) => set.has(e.id))
  }, [employees, selectedEmployeeIds])

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) => {
      const name = (e.fullName ?? '').toLowerCase()
      const email = (e.email ?? '').toLowerCase()
      const empId = (e.employeeId ?? '').toLowerCase()
      return name.includes(q) || email.includes(q) || empId.includes(q)
    })
  }, [employeeSearch, employees])

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return [...prev, id]
    })
  }

  const removeSelected = (id: string) => {
    setSelectedEmployeeIds((prev) => prev.filter((x) => x !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
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
    if (selectedEmployeeIds.length === 0) {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.teamMembersRequired'),
        variant: 'destructive',
      })
      return
    }

    const team: TeamDraft = {
      id: `team-${Date.now()}`,
      name,
      employeeIds: [...selectedEmployeeIds],
    }

    onCreateTeam({
      ...team,
      employeeIds: uniqById(selectedEmployees).map((e) => e.id),
    })

    toast({
      title: t('common.success'),
      description: t('projectScheduling.teamCreated'),
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projectScheduling.addTeam')}
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
                  'flex h-11 w-full items-center justify-between rounded-lg border border-gray-200/80 bg-muted/50 px-3 text-sm',
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
                    {t('projectScheduling.noEmployeesFound')}
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
                            {emp.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {emp.employeeId} {emp.email ? `• ${emp.email}` : ''}
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
                  <span className="truncate max-w-[160px]">{emp.fullName}</span>
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
            className="rounded-lg border-gray-200 min-w-[100px]"
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-lg min-w-[120px]">
            {t('projectScheduling.createTeam')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

