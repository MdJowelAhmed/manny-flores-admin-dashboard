import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { AttendanceRecord, AttendanceStatus } from '../attendanceData'
import { statusOptions } from '../attendanceData'
import { toast } from '@/utils/toast'

interface AddEditAttendanceModalProps {
  open: boolean
  onClose: () => void
  record: AttendanceRecord | null
  onSave: (data: Partial<AttendanceRecord>) => void
}

export function AddEditAttendanceModal({
  open,
  onClose,
  record,
  onSave,
}: AddEditAttendanceModalProps) {
  const isEdit = !!record?.id

  const [dateInput, setDateInput] = useState('')
  const [employee, setEmployee] = useState('')
  const [project, setProject] = useState('')
  const [status, setStatus] = useState<AttendanceStatus>('Present')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  useEffect(() => {
    if (record) {
      setEmployee(record.employee)
      setProject(record.project)
      setDateInput(formatToInput(record.date))
      setStatus(record.status)
      setCheckIn(record.checkIn === '--:--' ? '' : record.checkIn)
      setCheckOut(record.checkOut === '--:--' ? '' : record.checkOut)
    } else {
      setEmployee('')
      setProject('')
      const today = new Date()
      setDateInput(today.toISOString().slice(0, 10))
      setStatus('Present')
      setCheckIn('09:00 am')
      setCheckOut('06:00 pm')
    }
  }, [record, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dateStr = formatFromInput(dateInput)
    const total = computeTotalHours(checkIn, checkOut)
    onSave({
      id: record?.id,
      date: dateStr,
      status,
      checkIn: checkIn || '--:--',
      checkOut: checkOut || '--:--',
      totalHours: total,
      employee: (employee.trim() || record?.employee) ?? '',
      project: (project.trim() || record?.project) ?? '',
    })
    toast({
      title: 'Success',
      description: isEdit ? 'Attendance updated successfully.' : 'Attendance added successfully.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Attendance' : 'Add Attendance'}
      size="md"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Attendance Date</label>
          <div className="relative">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="flex h-11 w-full rounded-sm border border-input bg-background px-3 py-2 pl-9 text-sm"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Employee"
              placeholder="e.g. Jhon Lura"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
            />
            <FormInput
              label="Project"
              placeholder="e.g. Green Villa"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>
        )}

        <FormSelect
          label="Status"
          value={status}
          options={statusOptions}
          onChange={(v) => setStatus(v as AttendanceStatus)}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Check In"
            placeholder="e.g. 09:00 am"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <FormInput
            label="Check Out"
            placeholder="e.g. 06:00 pm"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
            Save Change
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

function formatToInput(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr.replace(/(\d+)\s+(\w+),\s*(\d+)/, '$2 $1 $3'))
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function formatFromInput(isoDate: string): string {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function computeTotalHours(inStr: string, outStr: string): string {
  if (!inStr || !outStr || inStr === '--:--' || outStr === '--:--') return '--:--'
  const parse = (s: string) => {
    const lower = s.toLowerCase()
    const [h, m] = (lower.match(/(\d+):(\d+)/) || ['0:0', '0', '0']).slice(1).map(Number)
    const isPm = lower.includes('pm') && h !== 12
    const isAm = lower.includes('am') && h === 12
    let h24 = h
    if (isPm) h24 = h + 12
    if (isAm) h24 = 0
    return h24 * 60 + m
  }
  const diff = parse(outStr) - parse(inStr)
  if (diff <= 0) return '--:--'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}h ${m}m`
}
