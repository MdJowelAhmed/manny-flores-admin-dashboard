import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Employee, EmployeeStatus } from '@/types'
import { departmentOptions, roleOptions } from '../employeeManagementData'
import { toast } from '@/utils/toast'
import { parseFlexibleDate, formatDateJoining } from '@/utils/formatters'

interface AddEditEmployeeModalProps {
  open: boolean
  onClose: () => void
  employee: Employee | null
  onSave: (data: Partial<Employee>) => void
}

function parseWorkSchedule(schedule: string): { start: string; end: string } {
  const match = schedule.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i)
  if (match) return { start: match[1], end: match[2] }
  return { start: '09:00 AM', end: '06:00 PM' }
}

function to24Hour(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i)
  if (!match) return '09:00'
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const period = match[3]?.toUpperCase()
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function to12Hour(time24: string): string {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function AddEditEmployeeModal({
  open,
  onClose,
  employee,
  onSave,
}: AddEditEmployeeModalProps) {
  const isEdit = !!employee

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(undefined)
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('')
  const [scheduleStart, setScheduleStart] = useState('09:00')
  const [scheduleEnd, setScheduleEnd] = useState('18:00')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (open) {
      if (employee) {
        setFullName(employee.fullName)
        setEmail(employee.email)
        setJoiningDate(parseFlexibleDate(employee.joiningDate) ?? undefined)
        setDepartment(employee.department)
        setRole(employee.role)
        const { start, end } = parseWorkSchedule(employee.workSchedule)
        setScheduleStart(to24Hour(start))
        setScheduleEnd(to24Hour(end))
        setPassword('')
      } else {
        setFullName('')
        setEmail('')
        setJoiningDate(undefined)
        setDepartment('')
        setRole('')
        setScheduleStart('09:00')
        setScheduleEnd('18:00')
        setPassword('')
      }
    }
  }, [employee, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const workSchedule = `${to12Hour(scheduleStart)} - ${to12Hour(scheduleEnd)}`
    const formattedJoiningDate = joiningDate ? formatDateJoining(joiningDate) : ''
    const payload: Partial<Employee> = {
      fullName: fullName.trim(),
      email: email.trim(),
      joiningDate: formattedJoiningDate,
      department,
      role,
      workSchedule,
    }
    if (isEdit) {
      if (password.trim()) (payload as Record<string, unknown>).password = password.trim()
      onSave(payload)
      toast({ title: 'Success', description: 'Employee updated successfully.', variant: 'success' })
    } else {
      (payload as Record<string, unknown>).password = password.trim()
      payload.status = 'Active' as EmployeeStatus
      onSave(payload)
      toast({ title: 'Success', description: 'Employee added successfully.', variant: 'success' })
    }
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Employee Details' : 'Add Employee'}
      size="lg"
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">

            <FormInput
              label="Employee ID"
              value={employee?.employeeId}
              // disabled
              required
              className=""
            />

            {/* <FormInput
              label=" Name"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border-gray-200"
            /> */}
            <FormInput
              label="Full Name"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border-gray-200"
            />
            <FormInput
              label="Email"
              placeholder="Enter email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-200"
            />
          </div>
        </div>

        {/* Organizational details */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-4">Organizational details</h3>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Joining Date"
              value={joiningDate}
              onChange={setJoiningDate}
              className="border-gray-200"
            />
            <FormSelect
              label="Department"
              value={department}
              options={departmentOptions}
              onChange={setDepartment}
              placeholder="Select department"
            />
            <FormSelect
              label="Role"
              value={role}
              options={roleOptions}
              onChange={setRole}
              placeholder="Select role"
            />
            {/* <div>
              <h3 className="text-sm font-bold text-foreground mb-2">Password</h3>
              <div className="relative">
                <FormInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? 'Enter new password' : 'Enter password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEdit}
                  className="pr-10 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isEdit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Leave blank to keep current password
                </p>
              )}
            </div> */}
          </div>
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2 text-foreground">Working Schedule</h4>
            <div className=" grid grid-cols-2 gap-4 w-full">
              <FormInput
                type="time"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                className="border-gray-200 flex-1"
              />
              <FormInput
                type="time"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
                className="border-gray-200 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Password */}


        <div className="pt-4 border-t border-gray-200 flex justify-end w-full">
          <Button
            type="submit"
            className=" bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium "
          >
           {isEdit ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
