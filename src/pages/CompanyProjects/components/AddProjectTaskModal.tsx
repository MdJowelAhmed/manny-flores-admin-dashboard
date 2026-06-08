import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, Search, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import {
  FormInput,
  FormSelect,
  FormTextarea,
  DatePicker,
} from '@/components/common/Form'
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
import type {
  CompanyProjectApiDoc,
  CompanyProjectTaskApiDoc,
} from '@/redux/api/companyProjectApi'
import {
  useCreateCompanyProjectTaskMutation,
  useUpdateCompanyProjectTaskMutation,
} from '@/redux/api/companyProjectApi'
import { sonnerToast } from '@/utils/toast'
import { taskPriorityOptions } from '../companyProjectsData'

interface EmployeeOption {
  id: string
  name: string
  email?: string
}

interface AddProjectTaskModalProps {
  open: boolean
  onClose: () => void
  project: CompanyProjectApiDoc | null
  task?: CompanyProjectTaskApiDoc | null
  employees: EmployeeOption[]
  onSaved?: () => void
}

export function AddProjectTaskModal({
  open,
  onClose,
  project,
  task = null,
  employees,
  onSaved,
}: AddProjectTaskModalProps) {
  const { t } = useTranslation()
  const isEdit = !!task

  const [taskName, setTaskName] = useState('')
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeesMenuOpen, setEmployeesMenuOpen] = useState(false)
  const [priority, setPriority] = useState('MEDIUM')
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState('')

  const [createTask, { isLoading: isCreating }] = useCreateCompanyProjectTaskMutation()
  const [updateTask, { isLoading: isUpdating }] = useUpdateCompanyProjectTaskMutation()
  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (!open) return

    const teamIdSet = new Set(project?.teamIds?.filter(Boolean) ?? [])

    if (task) {
      setTaskName(task.taskName || '')
      setSelectedEmployeeIds(
        (task.employeeIds?.filter(Boolean) ?? []).filter((id) => teamIdSet.has(id))
      )
      setPriority(task.priority || 'MEDIUM')
      setDeadline(task.deadline ? new Date(task.deadline) : undefined)
      setDescription(task.description || '')
    } else {
      setTaskName('')
      setSelectedEmployeeIds([])
      setPriority('MEDIUM')
      setDeadline(undefined)
      setDescription('')
    }

    setEmployeeSearch('')
    setEmployeesMenuOpen(false)
  }, [open, task, project?.id])

  const teamEmployees = useMemo(() => {
    const teamIdSet = new Set(project?.teamIds?.filter(Boolean) ?? [])
    if (teamIdSet.size === 0) return []

    const mapped = new Map<string, EmployeeOption>()
    employees.forEach((emp) => {
      if (teamIdSet.has(emp.id)) mapped.set(emp.id, emp)
    })

    task?.employees?.forEach((emp) => {
      if (teamIdSet.has(emp.id) && !mapped.has(emp.id)) {
        mapped.set(emp.id, { id: emp.id, name: emp.name })
      }
    })

    return Array.from(mapped.values())
  }, [employees, project?.teamIds, task?.employees])

  const hasTeamMembers = teamEmployees.length > 0

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase()
    if (!q) return teamEmployees
    return teamEmployees.filter((emp) => {
      const name = emp.name.toLowerCase()
      const email = (emp.email ?? '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [teamEmployees, employeeSearch])

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim() || selectedEmployeeIds.length === 0 || !deadline) return

    const taskBody = {
      taskName: taskName.trim(),
      employeeIds: selectedEmployeeIds,
      priority,
      deadline: deadline.toISOString(),
      description: description.trim(),
    }

    if (isEdit && task) {
      sonnerToast.promise(
        updateTask({ taskId: task.id, body: taskBody }).unwrap(),
        {
          loading: t('common.processing'),
          success: () => {
            onSaved?.()
            onClose()
            return t('companyProjects.taskUpdated')
          },
          error: (err: { data?: { message?: string } }) =>
            err?.data?.message || t('companyProjects.taskUpdateFailed'),
        }
      )
      return
    }

    if (!project?.id) return

    sonnerToast.promise(
      createTask({
        companyProjectId: project.id,
        ...taskBody,
      }).unwrap(),
      {
        loading: t('common.processing'),
        success: () => {
          onSaved?.()
          onClose()
          return t('companyProjects.taskCreated')
        },
        error: (err: { data?: { message?: string } }) =>
          err?.data?.message || t('companyProjects.taskCreateFailed'),
      }
    )
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('companyProjects.editTask') : t('companyProjects.addTask')}
      size="lg"
      className="max-w-xl bg-white"
      footer={
        <Button
          type="submit"
          form="company-project-task-form"
          disabled={
            isLoading ||
            !hasTeamMembers ||
            !taskName.trim() ||
            selectedEmployeeIds.length === 0 ||
            !deadline
          }
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white"
        >
          {isLoading ? t('common.processing') : t('companyProjects.saveTask')}
        </Button>
      }
    >
      <form id="company-project-task-form" onSubmit={handleSubmit} className="space-y-4">
        {project && (
          <p className="text-sm text-muted-foreground -mt-1">{project.projectName}</p>
        )}

        <FormInput
          label={t('companyProjects.taskName')}
          placeholder={t('companyProjects.taskNamePlaceholder')}
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            {t('companyProjects.assignEmployee')}
          </label>
          {!hasTeamMembers ? (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-gray-200 px-3 py-3">
              {t('companyProjects.noTeamForTask')}
            </p>
          ) : (
          <DropdownMenu open={employeesMenuOpen} onOpenChange={setEmployeesMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between h-11 rounded-lg"
              >
                <span className="truncate text-left">
                  {selectedEmployeeIds.length > 0
                    ? t('companyProjects.employeesSelected', {
                        count: selectedEmployeeIds.length,
                      })
                    : t('companyProjects.selectEmployees')}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0">
              <DropdownMenuLabel className="p-2 pb-0 font-normal">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder={t('companyProjects.searchEmployees')}
                    className="h-9 pl-9"
                  />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-52 overflow-auto">
                {filteredEmployees.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                    {t('companyProjects.noEmployeesFound')}
                  </p>
                ) : (
                  filteredEmployees.map((emp) => (
                    <DropdownMenuCheckboxItem
                      key={emp.id}
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onCheckedChange={() => toggleEmployee(emp.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{emp.name}</span>
                        {emp.email && (
                          <span className="text-xs text-muted-foreground">{emp.email}</span>
                        )}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          )}

          {hasTeamMembers && selectedEmployeeIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedEmployeeIds.map((id) => {
                const emp = teamEmployees.find((e) => e.id === id)
                return (
                  <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1">
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

        <FormSelect
          label={t('companyProjects.priority')}
          value={priority}
          options={taskPriorityOptions.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey),
          }))}
          onChange={setPriority}
        />

        <DatePicker
          label={t('companyProjects.deadline')}
          value={deadline}
          onChange={setDeadline}
        />

        <FormTextarea
          label={t('common.description')}
          placeholder={t('companyProjects.taskDescriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />

      </form>
    </ModalWrapper>
  )
}
