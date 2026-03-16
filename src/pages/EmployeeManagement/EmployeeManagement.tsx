import { useMemo, useState, useEffect } from 'react'
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
import {
  employeeStats,
  mockEmployeesData,
} from './employeeManagementData'
import type { Employee, EmployeeStatus } from '@/types'
import { toast } from '@/utils/toast'

export default function EmployeeManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const setSearch = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v ? next.set('search', v) : next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const [employees, setEmployees] = useState<Employee[]>(mockEmployeesData)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter((e) => e.status === 'Active').length
    const onLeave = employees.filter((e) => e.status === 'inactive').length
    return { total, active, onLeave }
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [employees, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(start, start + itemsPerPage)
  }, [filteredEmployees, currentPage, itemsPerPage])

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsViewModalOpen(true)
  }

  const handleEdit = (employee: Employee, e: React.MouseEvent) => {
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

  const handleSave = (data: Partial<Employee>) => {
    if (selectedEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === selectedEmployee.id ? { ...e, ...data } : e
        )
      )
    } else {
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        employeeId: `#${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: data.fullName ?? '',
        email: data.email ?? '',
        department: data.department ?? '',
        status: data.status ?? 'Active',
        joiningDate: data.joiningDate ?? '',
        role: data.role ?? '',
        workSchedule: data.workSchedule ?? '',
      }
      setEmployees((prev) => [newEmployee, ...prev])
    }
    setIsAddEditModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleStatusChange = (employee: Employee, newStatus: EmployeeStatus) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? { ...e, status: newStatus } : e))
    )
    toast({
      variant: 'success',
      title: 'Status Updated',
      description: `${employee.fullName} is now ${newStatus}.`,
    })
  }

  const handleDelete = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id))
      toast({
        variant: 'success',
        title: 'Employee Deleted',
        description: `${employeeToDelete.fullName} has been removed.`,
      })
      setIsConfirmOpen(false)
      setEmployeeToDelete(null)
      if (selectedEmployee?.id === employeeToDelete.id) {
        setSelectedEmployee(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete employee.', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {employeeStats.map((stat, index) => {
          const Icon = stat.icon
          const value =
            stat.title === 'Total Employee'
              ? stats.total
              : stat.title === 'Active Now'
                ? stats.active
                : stats.onLeave
          return (
            <EmployeeSummaryCard
              key={stat.title}
              title={stat.title}
              value={value}
              icon={Icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
              index={index}
            />
          )
        })}
      </div>

      {/* Track Employee Section */}
      <div className="border-0">
        <div className="flex flex-row items-center justify-between pb-6">
          <h2 className="text-xl font-bold text-accent">Track Employee</h2>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder="Search employee..."
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <EmployeeTable
            employees={paginatedEmployees}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />

          {filteredEmployees.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredEmployees.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewEmployeeDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedEmployee(null)
        }}
        employee={selectedEmployee}
        onEdit={handleOpenEditFromView}
      />

      <AddEditEmployeeModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedEmployee(null)
        }}
        employee={selectedEmployee}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setEmployeeToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        description={`Are you sure you want to delete "${employeeToDelete?.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
