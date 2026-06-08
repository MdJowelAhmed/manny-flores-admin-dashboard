import { useState } from 'react'
import { Info, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper, ConfirmDialog } from '@/components/common'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/common/Spinner'
import type {
  CompanyProjectApiDoc,
  CompanyProjectTaskApiDoc,
} from '@/redux/api/companyProjectApi'
import {
  useDeleteCompanyProjectTaskMutation,
  useGetCompanyProjectTasksQuery,
} from '@/redux/api/companyProjectApi'
import { sonnerToast } from '@/utils/toast'
import {
  formatTaskDeadline,
  getTaskPriorityClass,
} from '../companyProjectsUi'
import { EmployeeAvatarStack } from './EmployeeAvatarStack'
import { TaskDetailsModal } from './TaskDetailsModal'

interface ViewTasksModalProps {
  open: boolean
  onClose: () => void
  project: CompanyProjectApiDoc | null
  onAddTask?: () => void
  onEditTask?: (task: CompanyProjectTaskApiDoc) => void
}

export function ViewTasksModal({
  open,
  onClose,
  project,
  onAddTask,
  onEditTask,
}: ViewTasksModalProps) {
  const { t } = useTranslation()
  const [detailsTask, setDetailsTask] = useState<CompanyProjectTaskApiDoc | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<CompanyProjectTaskApiDoc | null>(null)

  const { data: tasksRes, isLoading, isFetching } = useGetCompanyProjectTasksQuery(
    { companyProjectId: project?.id ?? '', page: 1, limit: 50 },
    { skip: !open || !project?.id }
  )

  const [deleteTask, { isLoading: isDeleting }] = useDeleteCompanyProjectTaskMutation()
  const tasks = tasksRes?.data ?? []

  const handleConfirmDelete = () => {
    if (!taskToDelete) return
    sonnerToast.promise(deleteTask({ taskId: taskToDelete.id }).unwrap(), {
      loading: t('common.processing'),
      success: () => {
        setTaskToDelete(null)
        return t('companyProjects.taskDeleted')
      },
      error: (err: { data?: { message?: string } }) =>
        err?.data?.message || t('companyProjects.taskDeleteFailed'),
    })
  }

  return (
    <>
      <ModalWrapper
        open={open}
        onClose={onClose}
        title={t('companyProjects.viewTask')}
        size="full"
        className="max-w-6xl bg-white"
      >
        <div className="flex justify-end mb-4">
          {onAddTask && (
            <Button
              type="button"
              onClick={onAddTask}
              className="bg-primary hover:bg-primary/90 text-white h-10 px-4"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t('companyProjects.addTask')}
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    {t('companyProjects.taskName')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    {t('companyProjects.assignEmployee')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    {t('companyProjects.deadline')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    {t('companyProjects.priority')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    {t('common.description')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      {t('companyProjects.noTasksYet')}
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3.5 font-medium text-gray-900">
                        {task.taskName}
                      </td>
                      <td className="px-4 py-3.5">
                        <EmployeeAvatarStack
                          employees={
                            task.employees?.length
                              ? task.employees
                              : task.employeeIds.map((id) => ({
                                  id,
                                  name: id.slice(0, 8),
                                }))
                          }
                        />
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                        {formatTaskDeadline(task.deadline)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={getTaskPriorityClass(task.priority)}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 max-w-[200px] truncate">
                        {task.description || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailsTask(task)}
                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                            aria-label={t('companyProjects.taskDetails')}
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditTask?.(task)}
                            className="p-2 rounded-md text-sky-600 hover:bg-sky-50"
                            aria-label={t('common.edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskToDelete(task)}
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
        </div>
      </ModalWrapper>

      <TaskDetailsModal
        open={!!detailsTask}
        onClose={() => setDetailsTask(null)}
        project={project}
        task={detailsTask}
        onEdit={onEditTask}
        onDelete={setTaskToDelete}
      />

      <ConfirmDialog
        open={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('companyProjects.deleteTask')}
        description={t('companyProjects.deleteTaskConfirm', {
          name: taskToDelete?.taskName ?? '',
        })}
        confirmText={t('common.delete')}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  )
}
