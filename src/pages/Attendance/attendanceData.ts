import { Users, UserCheck, UserX, Clock } from 'lucide-react'

export type AttendanceStatus = 'Present' | 'Late' | 'Absent'

export interface AttendanceRecord {
  id: string
  date: string
  employee: string
  project: string
  checkIn: string
  checkOut: string
  totalHours: string
  status: AttendanceStatus
}

export const attendanceStats = [
  {
    title: 'Total Employee',
    value: 250,
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Present Today',
    value: 167,
    icon: UserCheck,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Absent Today',
    value: 42,
    icon: UserX,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Late Arrivals',
    value: 15,
    icon: Clock,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
]

export const STATUS_STYLES: Record<AttendanceStatus, { bg: string; text: string }> = {
  Present: { bg: 'bg-emerald-500', text: 'text-white' },
  Late: { bg: 'bg-amber-500', text: 'text-white' },
  Absent: { bg: 'bg-red-500', text: 'text-white' },
}

export const statusOptions = [
  { value: 'Present', label: 'Present' },
  { value: 'Late', label: 'Late' },
  { value: 'Absent', label: 'Absent' },
]

export function getEmployeeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function getEmployeeName(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export const employeeProfiles: Record<string, { role: string; avatar?: string }> = {
  'Jhon Lura': { role: 'Supervisor' },
  'Sarah Miller': { role: 'Designer' },
  'Mike Johnson': { role: 'Technician' },
  'Emily Brown': { role: 'Manager' },
  'Tom Wilson': { role: 'Coordinator' },
}

export const mockAttendanceData: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '24 Oct, 2026',
    employee: 'Jhon Lura',
    project: 'Green Villa',
    checkIn: '08:52 PM',
    checkOut: '05:30 PM',
    totalHours: '8h 38m',
    status: 'Late',
  },
  {
    id: 'att-2',
    date: '24 Oct, 2026',
    employee: 'Sarah Miller',
    project: 'Office Park',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    totalHours: '9h 0m',
    status: 'Present',
  },
  {
    id: 'att-3',
    date: '24 Oct, 2026',
    employee: 'Mike Johnson',
    project: 'Lawn Care',
    checkIn: '09:15 AM',
    checkOut: '05:45 PM',
    totalHours: '8h 30m',
    status: 'Late',
  },
  {
    id: 'att-4',
    date: '23 Oct, 2026',
    employee: 'Emily Brown',
    project: 'Garden Design',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    totalHours: '9h 0m',
    status: 'Present',
  },
  {
    id: 'att-5',
    date: '23 Oct, 2026',
    employee: 'Tom Wilson',
    project: 'Green Villa',
    checkIn: '--:--',
    checkOut: '--:--',
    totalHours: '--:--',
    status: 'Absent',
  },
  {
    id: 'att-6',
    date: '24 Oct, 2026',
    employee: 'Jhon Lura',
    project: 'Green Villa',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    totalHours: '9h 0m',
    status: 'Present',
  },
  {
    id: 'att-7',
    date: '23 Oct, 2026',
    employee: 'Jhon Lura',
    project: 'Green Villa',
    checkIn: '09:10 AM',
    checkOut: '06:15 PM',
    totalHours: '9h 5m',
    status: 'Present',
  },
  {
    id: 'att-8',
    date: '22 Oct, 2026',
    employee: 'Jhon Lura',
    project: 'Green Villa',
    checkIn: '08:55 AM',
    checkOut: '05:45 PM',
    totalHours: '8h 50m',
    status: 'Late',
  },
]
