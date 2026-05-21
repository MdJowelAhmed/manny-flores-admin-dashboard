import { Users, User, Calendar } from 'lucide-react'
import type { EmployeeStatus } from '@/types'
import type { SelectOption } from '@/types'

export const employeeStats = [
  {
    titleKey: 'employeeManagement.totalEmployee' as const,
    icon: Users,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    titleKey: 'employeeManagement.activeNow' as const,
    icon: User,
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    titleKey: 'employeeManagement.absent' as const,
    icon: Calendar,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
]

export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, { bg: string; text: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-600' },
  // Leave: { bg: 'bg-orange-100', text: 'text-orange-600' },
  inactive: { bg: 'bg-muted', text: 'text-muted-foreground' },
}

export const departmentOptions: SelectOption[] = [
  { value: 'Operation', label: 'Operation' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
]

export const roleOptions = [
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
]

