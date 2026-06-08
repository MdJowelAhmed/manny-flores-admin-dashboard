import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, Search, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
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
export interface TeamEmployeeOption {
  id: string
  name: string
  email?: string
  role?: string
}

interface AddEmployeeToTeamModalProps {
  open: boolean
  onClose: () => void
  employees: TeamEmployeeOption[]
  assignedIds: string[]
  onSave: (employeeIds: string[]) => void
  isSaving?: boolean
}

export function AddEmployeeToTeamModal({
  open,
  onClose,
  employees,
  assignedIds,
  onSave,
  isSaving = false,
}: AddEmployeeToTeamModalProps) {
  const { t } = useTranslation()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelectedIds([])
    setSearch('')
    setMenuOpen(false)
  }, [open])

  const availableEmployees = useMemo(
    () => employees.filter((emp) => !assignedIds.includes(emp.id)),
    [employees, assignedIds]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return availableEmployees
    return availableEmployees.filter((emp) => {
      const name = emp.name.toLowerCase()
      const email = (emp.email ?? '').toLowerCase()
      const role = (emp.role ?? '').toLowerCase()
      return name.includes(q) || email.includes(q) || role.includes(q)
    })
  }, [availableEmployees, search])

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectedRolePreview = useMemo(() => {
    if (selectedIds.length !== 1) return ''
    return employees.find((e) => e.id === selectedIds[0])?.role ?? ''
  }, [employees, selectedIds])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) return
    onSave(selectedIds)
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('companyProjects.addEmployee')}
      size="md"
      className="max-w-md bg-white"
      footer={
        <Button
          type="submit"
          form="add-employee-team-form"
          disabled={isSaving || selectedIds.length === 0}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white"
        >
          {isSaving ? t('common.processing') : t('common.save')}
        </Button>
      }
    >
      <form id="add-employee-team-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('companyProjects.assignEmployee')}
          </label>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-11 rounded-lg"
              >
                <span className="truncate text-left text-muted-foreground">
                  {t('companyProjects.selectEmployees')}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
              <DropdownMenuLabel className="p-2 pb-0 font-normal">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('companyProjects.searchEmployees')}
                    className="h-9 pl-9"
                  />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-52 overflow-auto">
                {filtered.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                    {t('companyProjects.noEmployeesFound')}
                  </p>
                ) : (
                  filtered.map((emp) => (
                    <DropdownMenuCheckboxItem
                      key={emp.id}
                      checked={selectedIds.includes(emp.id)}
                      onCheckedChange={() => toggleEmployee(emp.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{emp.name}</span>
                        {emp.role && (
                          <span className="text-xs text-muted-foreground">{emp.role}</span>
                        )}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedIds.map((id) => {
                const emp = employees.find((e) => e.id === id)
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs gap-1 pr-1"
                  >
                    {emp?.name ?? id.slice(0, 8)}
                    <button
                      type="button"
                      onClick={() => toggleEmployee(id)}
                      className="rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
        </div>

        {selectedRolePreview && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {t('employeeManagement.role')}
            </label>
            <div className="h-11 rounded-lg border border-gray-200 px-3 flex items-center text-sm text-muted-foreground bg-muted/30">
              {selectedRolePreview}
            </div>
          </div>
        )}
      </form>
    </ModalWrapper>
  )
}
