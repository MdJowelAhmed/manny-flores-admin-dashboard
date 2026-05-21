import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import type { Employee } from '@/types'
import type { ScheduledProject } from '../projectSchedulingData'

interface AssignEmployeeModalProps {
  open: boolean
  onClose: () => void
  schedule: ScheduledProject | null
  employees: Employee[]
  onAssign: (projectId: string, employeeId: string) => Promise<void>
  isSaving?: boolean
}

export function AssignEmployeeModal({
  open,
  onClose,
  schedule,
  employees,
  onAssign,
  isSaving = false,
}: AssignEmployeeModalProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSearch('')
    setSelectedId(null)
  }, [open])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const available = employees.filter(
      (e) => !schedule?.assignedEmployeeIds.includes(e.id)
    )
    if (!q) return available
    return available.filter((e) => {
      const name = (e.fullName ?? '').toLowerCase()
      const email = (e.email ?? '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [employees, search, schedule?.assignedEmployeeIds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedule?.id || !selectedId) return
    await onAssign(schedule.id, selectedId)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projectScheduling.assignEmployee')}
      size="md"
      className="max-w-md bg-white sm:rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {schedule && (
          <p className="text-sm text-gray-900">{schedule.projectTitle}</p>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-900" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('projectScheduling.searchEmployees')}
            className="h-10 rounded-lg pl-9"
          />
        </div>

        <div className="max-h-56 overflow-auto rounded-lg border border-gray-100 divide-y">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-900 text-center">
              {t('projectScheduling.noEmployeesFound')}
            </p>
          ) : (
            filtered.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => setSelectedId(emp.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-muted/50',
                  selectedId === emp.id && 'bg-primary/10'
                )}
              >
                <span className="font-medium text-gray-900 block">{emp.fullName}</span>
                <span className="text-xs text-gray-900">{emp.email}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {/* <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button> */}
          <Button
            type="submit"
            disabled={!selectedId || isSaving}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {t('projectScheduling.assignEmployee')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
