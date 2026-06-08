import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { CompanyProjectApiDoc } from '@/redux/api/companyProjectApi'
import { sonnerToast } from '@/utils/toast'
import { useAssignCompanyProjectTeamMutation } from '@/redux/api/companyProjectApi'
import { AddEmployeeToTeamModal, type TeamEmployeeOption } from './AddEmployeeToTeamModal'

interface AssignTeamModalProps {
  open: boolean
  onClose: () => void
  project: CompanyProjectApiDoc | null
  employees: TeamEmployeeOption[]
  onAssigned?: () => void
}

export function AssignTeamModal({
  open,
  onClose,
  project,
  employees,
  onAssigned,
}: AssignTeamModalProps) {
  const { t } = useTranslation()
  const [teamIds, setTeamIds] = useState<string[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [assignTeam, { isLoading }] = useAssignCompanyProjectTeamMutation()

  useEffect(() => {
    if (!open) return
    setTeamIds(project?.teamIds?.filter(Boolean) ?? [])
    setIsAddOpen(false)
  }, [open, project])

  const assignedRows = useMemo(
    () =>
      teamIds.map((id) => {
        const emp = employees.find((e) => e.id === id)
        return {
          id,
          name: emp?.name ?? id.slice(0, 8),
          role: emp?.role ?? '—',
        }
      }),
    [teamIds, employees]
  )

  const persistTeam = async (nextIds: string[]) => {
    if (!project?.id) return
    setTeamIds(nextIds)
    await assignTeam({
      projectId: project.id,
      body: { teamIds: nextIds },
    }).unwrap()
    onAssigned?.()
  }

  const handleAddEmployees = async (newIds: string[]) => {
    if (!project?.id || newIds.length === 0) return
    const nextIds = [...new Set([...teamIds, ...newIds])]

    sonnerToast.promise(persistTeam(nextIds), {
      loading: t('common.processing'),
      success: () => {
        setIsAddOpen(false)
        return t('companyProjects.teamAssigned')
      },
      error: (err: { data?: { message?: string } }) =>
        err?.data?.message || t('companyProjects.teamAssignFailed'),
    })
  }

  const handleRemove = (employeeId: string) => {
    if (!project?.id) return
    const nextIds = teamIds.filter((id) => id !== employeeId)

    sonnerToast.promise(persistTeam(nextIds), {
      loading: t('common.processing'),
      success: () => t('companyProjects.employeeRemoved'),
      error: (err: { data?: { message?: string } }) =>
        err?.data?.message || t('companyProjects.teamAssignFailed'),
    })
  }

  return (
    <>
      <ModalWrapper
        open={open}
        onClose={onClose}
        title={t('companyProjects.assignEmployee')}
        size="lg"
        className="max-w-2xl bg-white"
      >
        <div className="flex justify-end -mt-1 mb-4">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('common.add')}
          </Button>
        </div>

        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">
                  {t('employeeManagement.fullName')}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  {t('employeeManagement.role')}
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                  {t('common.action')}
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                    {t('companyProjects.noTeamAssigned')}
                  </td>
                </tr>
              ) : (
                assignedRows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3.5 text-gray-600">{row.role}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setIsAddOpen(true)}
                          className="p-2 rounded-md text-sky-600 hover:bg-sky-50"
                          aria-label={t('common.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(row.id)}
                          disabled={isLoading}
                          className="p-2 rounded-md text-rose-600 hover:bg-rose-50"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ModalWrapper>

      <AddEmployeeToTeamModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        employees={employees}
        assignedIds={teamIds}
        onSave={handleAddEmployees}
        isSaving={isLoading}
      />
    </>
  )
}
