import { Users, User, Calendar } from 'lucide-react'
import type { Employee, EmployeeStatus } from '@/types'
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

export const roleOptions: SelectOption[] = [
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Worker', label: 'Worker' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Developer', label: 'Developer' },
]

export const mockEmployeesData: Employee[] = [
  {
    id: 'emp-1',
    employeeId: '#187653',
    fullName: 'Jhon Lura',
    email: 'jhon@mail.com',
    department: 'Operation',
    status: 'Active',
    joiningDate: '12 February, 2026',
    role: 'Project Manager',
    workSchedule: '08:00 AM - 05:00 PM',
    projects: [
      {
        id: 'p1',
        projectName: 'Green Villa',
        task: 'Plant Tree',
        deadline: '12 February, 2025',
        status: 'Active',
      },
      {
        id: 'p2',
        projectName: 'Tolly Tesla',
        task: 'Plant Tree',
        deadline: '12 February, 2025',
        status: 'Complete',
      },
    ],
  },
  {
    id: 'emp-2',
    employeeId: '#187654',
    fullName: 'Sarah Smith',
    email: 'sarah@mail.com',
    department: 'Sales',
    status: 'inactive',
    joiningDate: '15 January, 2026',
    role: 'Worker',
    workSchedule: '09:00 AM - 06:00 PM',
    projects: [],
  },
  {
    id: 'emp-3',
    employeeId: '#187655',
    fullName: 'Michael Brown',
    email: 'michael@mail.com',
    department: 'IT',
    status: 'Active',
    joiningDate: '20 March, 2026',
    role: 'Developer',
    workSchedule: '09:00 AM - 06:00 PM',
    projects: [],
  },
  {
    id: 'emp-4',
    employeeId: '#187656',
    fullName: 'Emily Davis',
    email: 'emily@mail.com',
    department: 'Marketing',
    status: 'Active',
    joiningDate: '5 February, 2026',
    role: 'Supervisor',
    workSchedule: '08:30 AM - 05:30 PM',
    projects: [],
  },
  {
    id: 'emp-5',
    employeeId: '#187657',
    fullName: 'David Wilson',
    email: 'david@mail.com',
    department: 'Operation',
    status: 'inactive',
    joiningDate: '10 January, 2026',
    role: 'Worker',
    workSchedule: '08:00 AM - 05:00 PM',
    projects: [],
  },
  {
    id: 'emp-6',
    employeeId: '#187658',
    fullName: 'Lisa Anderson',
    email: 'lisa@mail.com',
    department: 'HR',
    status: 'Active',
    joiningDate: '25 February, 2026',
    role: 'Project Manager',
    workSchedule: '09:00 AM - 06:00 PM',
    projects: [],
  },
  {
    id: 'emp-7',
    employeeId: '#187659',
    fullName: 'James Taylor',
    email: 'james@mail.com',
    department: 'Sales',
    status: 'Active',
    joiningDate: '1 March, 2026',
    role: 'Supervisor',
    workSchedule: '08:00 AM - 05:00 PM',
    projects: [],
  },
  {
    id: 'emp-8',
    employeeId: '#187660',
    fullName: 'Maria Garcia',
    email: 'maria@mail.com',
    department: 'Operation',
    status: 'inactive',
    joiningDate: '18 February, 2026',
    role: 'Worker',
    workSchedule: '09:00 AM - 06:00 PM',
    projects: [],
  },
]
