import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmployeeSummaryCard } from './components/EmployeeSummaryCard'
import { EmployeeTable } from './components/EmployeeTable'
import { ViewEmployeeDetailsModal } from './components/ViewEmployeeDetailsModal'
import { AddEditEmployeeModal } from './components/AddEditEmployeeModal'
import { employeeStats } from './employeeManagementData'
import type { Employee } from '@/types'
import { toast } from '@/utils/toast'
import { useTranslation } from 'react-i18next'
import {
  useAllEmployeeManageQuery,
  useDeleteEmployeeManageMutation,
  useEmployeeManageOverviewQuery,
  useUpdateEmployeeManageMutation,
} from '@/redux/slices/super-admin/employeeManagement'

export default function EmployeeManagement() {
  const { t } = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get('search') ?? ''
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10)
  )
  const itemsPerPage = Math.max(
    1,
    parseInt(searchParams.get('limit') || '10', 10)
  )

  // =========================
  // API CALLS
  // =========================

  const {
    data: allEmployeeManage,
    // isLoading, 
    error,
    refetch
  } = useAllEmployeeManageQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
  })

  const { data: employeeManageOverview } =
    useEmployeeManageOverviewQuery()

  const [deleteEmployee] =
    useDeleteEmployeeManageMutation()

  const [updateEmployeeManage] = useUpdateEmployeeManageMutation()



  // =========================
  // URL PARAM HANDLERS
  // =========================

  const setSearch = (value: string) => {
    const next = new URLSearchParams(searchParams)

    value ? next.set('search', value) : next.delete('search')

    next.delete('page')

    setSearchParams(next, { replace: true })
  }

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams)

    page > 1
      ? next.set('page', String(page))
      : next.delete('page')

    setSearchParams(next, { replace: true })
  }

  const setLimit = (limit: number) => {
    const next = new URLSearchParams(searchParams)

    limit !== 10
      ? next.set('limit', String(limit))
      : next.delete('limit')

    next.delete('page')

    setSearchParams(next, { replace: true })
  }

  // =========================
  // TABLE DATA FORMAT
  // =========================

  const employees: Employee[] = useMemo(() => {
    return (
      allEmployeeManage?.data?.map((employee: any) => ({
        id: employee.id,
        employeeId: employee.id.slice(0, 8),
        fullName: employee.name,
        email: employee.email,
        department: employee.city || 'N/A',
        status: employee.isBanned ? 'inactive' : 'Active',
        joiningDate: employee.createdAt,
        role: employee.role,
        workSchedule: employee.country || 'N/A',
        contact: employee.contact,
        verified: employee.verified,
        profile: employee.profile,
        isBanned: employee.isBanned ?? false,
      })) || []
    )
  }, [allEmployeeManage])

  // =========================
  // OVERVIEW STATS
  // =========================

  const stats = {
    total: employeeManageOverview?.data?.totalEmployees || 0,
    active: employeeManageOverview?.data?.activeEmployees || 0,
    onLeave: employeeManageOverview?.data?.absentEmployees || 0,
  }

  // =========================
  // LOCAL STATES
  // =========================

  const [isViewModalOpen, setIsViewModalOpen] =
    useState(false)

  const [isAddEditModalOpen, setIsAddEditModalOpen] =
    useState(false)

  const [isConfirmOpen, setIsConfirmOpen] =
    useState(false)

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null)

  const [employeeToDelete, setEmployeeToDelete] =
    useState<Employee | null>(null)

  const [isDeleting, setIsDeleting] =
    useState(false)

  // =========================
  // HANDLERS
  // =========================

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewModalOpen(true)
  }

  const handleEdit = (
    employee: Employee,
    e: React.MouseEvent
  ) => {
    e?.stopPropagation?.()

    setSelectedEmployee(employee)

    setIsViewModalOpen(false)

    setIsAddEditModalOpen(true)
  }

  const handleOpenEditFromView = () => {
    if (selectedEmployee) {
      setIsViewModalOpen(false)
      setIsAddEditModalOpen(true)
    }
  }

  const handleAdd = () => {
    setSelectedEmployee(null)
    setIsAddEditModalOpen(true)
  }

  const handleSave = () => {
    setIsAddEditModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleStatusChange = async (employee: Employee, checked: boolean) => {
    try {
      await updateEmployeeManage({
        id: employee.id,
        data: {
          isBanned: !checked,
        },
      }).unwrap()
      refetch()
      toast({
        title: 'Success',
        description: checked
          ? 'Employee activated'
          : 'Employee banned',
        variant: 'success',
      })

      // optional: refetch or update local cache
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Status update failed',
        variant: 'destructive',
      })
    }
  }
  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return

    setIsDeleting(true)

    try {
      await deleteEmployee(employeeToDelete?.id).unwrap()

      toast({
        variant: 'success',
        title: t('employeeManagement.employeeDeleted'),
        description: t(
          'employeeManagement.employeeRemoved',
          {
            name: employeeToDelete.fullName,
          }
        ),
      })
      refetch()
      setIsConfirmOpen(false)
      setEmployeeToDelete(null)

      if (
        selectedEmployee?.id === employeeToDelete.id
      ) {
        setSelectedEmployee(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t(
          'employeeManagement.errorDeleteEmployee'
        ),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // =========================
  // ERROR UI
  // =========================

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-red-500">
          {t('common.somethingWentWrong')}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ========================= */}
      {/* OVERVIEW CARDS */}
      {/* ========================= */}

      <div className="grid gap-4 md:grid-cols-3">
        {employeeStats.map((stat, index) => {
          const Icon = stat.icon

          const value =
            stat.titleKey ===
              'employeeManagement.totalEmployee'
              ? stats.total
              : stat.titleKey ===
                'employeeManagement.activeNow'
                ? stats.active
                : stats.onLeave

          return (
            <EmployeeSummaryCard
              key={stat.titleKey}
              title={t(stat.titleKey)}
              value={value}
              icon={Icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
              index={index}
            />
          )
        })}
      </div>

      {/* ========================= */}
      {/* EMPLOYEE TABLE */}
      {/* ========================= */}

      <div className="border-0">
        <div className="flex flex-row items-center justify-between pb-6">
          <h2 className="text-xl font-bold text-accent">
            {t('employeeManagement.trackEmployee')}
          </h2>

          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder={t(
                'employeeManagement.searchEmployee'
              )}
              className="w-[280px] bg-white"
              debounceMs={300}
            />

            <Button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />

              {t('employeeManagement.addEmployee')}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <EmployeeTable
            employees={employees}
            // loading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />

          {allEmployeeManage?.pagination && (
            <div className="border-t border-gray-100 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={
                  allEmployeeManage.pagination.totalPage
                }
                totalItems={
                  allEmployeeManage.pagination.total
                }
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* VIEW MODAL */}
      {/* ========================= */}

      <ViewEmployeeDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedEmployee(null)
        }}
        employee={selectedEmployee}
        onEdit={handleOpenEditFromView}
      />

      {/* ========================= */}
      {/* ADD / EDIT MODAL */}
      {/* ========================= */}

      <AddEditEmployeeModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedEmployee(null)
        }}
        employee={selectedEmployee}
        onSave={handleSave}
        refetch={refetch}
      />

      {/* ========================= */}
      {/* DELETE CONFIRM MODAL */}
      {/* ========================= */}

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setEmployeeToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('employeeManagement.deleteEmployee')}
        description={t(
          'employeeManagement.deleteConfirmation',
          {
            name: employeeToDelete?.fullName,
          }
        )}
        confirmText={t('common.delete')}
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}