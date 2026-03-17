import { Users, FolderClock, Wallet } from 'lucide-react'

export type PayType = 'Project Based' | 'Daily Wage' | 'Monthly'
export type PaymentStatus = 'Paid' | 'Pending'

export interface PayrollRecord {
  id: string
  payrollId: string
  name: string
  payType: PayType
  project: string
  overtime: number
  amount: number
  status: PaymentStatus
}

export const payrollStats = [
  { titleKey: 'payrollManagement.totalEmployeesPaid' as const, value: 250, icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { titleKey: 'payrollManagement.totalPending' as const, value: 235, icon: FolderClock, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { titleKey: 'payrollManagement.totalPayrollAmount' as const, value: 15, icon: Wallet, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
]

export const PAY_TYPE_STYLES: Record<PayType, { bg: string; text: string }> = {
  'Project Based': { bg: 'bg-purple-500', text: 'text-white' },
  'Daily Wage': { bg: 'bg-sky-100', text: 'text-sky-700' },
  Monthly: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

export const payTypeOptions = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Project Based', label: 'Project Based' },
  { value: 'Daily Wage', label: 'Daily Wage' },
]

export const employeeOptions = [
  { value: 'Jhon Lura', label: 'Jhon Lura' },
  { value: 'Arjit Sharma', label: 'Arjit Sharma' },
  { value: 'Sarah Miller', label: 'Sarah Miller' },
]

export const projectOptions = [
  { value: 'Green Villa', label: 'Green Villa' },
  { value: 'Green Velly', label: 'Green Velly' },
]

export const hourlyWorkedOptions = [
  { value: '12 hour 10 min', label: '12 hour 10 min' },
  { value: '8 hour 0 min', label: '8 hour 0 min' },
  { value: '10 hour 30 min', label: '10 hour 30 min' },
]

export const mockPayrollData: PayrollRecord[] = [
  {
    id: 'pr-1',
    payrollId: '#187653',
    name: 'Jhon Lura',
    payType: 'Project Based',
    project: 'Green Velly',
    overtime: 650,
    amount: 1234,
    status: 'Paid',
  },
  {
    id: 'pr-2',
    payrollId: '#187654',
    name: 'Arjit Sharma',
    payType: 'Daily Wage',
    project: 'Green Villa',
    overtime: 125,
    amount: 1235,
    status: 'Pending',
  },
  {
    id: 'pr-3',
    payrollId: '#187655',
    name: 'Sarah Miller',
    payType: 'Monthly',
    project: 'Green Villa',
    overtime: 0,
    amount: 3200,
    status: 'Paid',
  },
]
