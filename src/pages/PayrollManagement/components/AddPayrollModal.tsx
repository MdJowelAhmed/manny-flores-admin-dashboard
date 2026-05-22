import { useState, useMemo, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { useCreatePayrollMutation, useGetAllCustomersQuery } from '@/redux/slices/super-admin/payrollApi'
import { sonnerToast, toast } from '@/utils/toast'

interface AddPayrollModalProps {
  open: boolean
  onClose: () => void
  // customersData: any
}

const PAY_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'PROJECT_BASED', label: 'Project Based' },
]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(0, i).toLocaleString('default', { month: 'long' }),
}))

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - 5 + i),
  label: String(currentYear - 5 + i),
}))

export function AddPayrollModal({
  open,
  onClose,
}: AddPayrollModalProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: customersData } = useGetAllCustomersQuery({ search, page })

  const [createPayroll, { isLoading }] = useCreatePayrollMutation()

  const [employeeId, setEmployeeId] = useState('')
  const [salary, setSalary] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [payType, setPayType] = useState('MONTHLY')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(currentYear))

  useEffect(() => {
    if (open) {
      setEmployeeId('')
      setSalary('')
      setHourlyRate('')
      setPayType('MONTHLY')
      setMonth(String(new Date().getMonth() + 1))
      setYear(String(currentYear))
    }
  }, [open])

  const employeeOptions = useMemo(() => {
    if (!customersData?.data) return []
    return customersData.data.map((c: any) => ({
      value: c.id,
      label: c.name || c.id,
    }))
  }, [customersData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId) {
      toast({ title: 'Error', description: 'Please select an employee.', variant: 'destructive' })
      return
    }

    try {
      sonnerToast.promise(createPayroll({
        employeeId,
        salary: Number(salary) || 0,
        hourlyRate: Number(hourlyRate) || 0,
        payType,
        paymentTypeStatus: 'NOT-PAID',
        month: Number(month),
        year: Number(year),
      }).unwrap(), {
        loading: 'Creating payroll...',
        success: () => {
          onClose()
          setEmployeeId("")
          return 'Payroll created successfully.'
        },
        error: (err: any) => err?.data?.message || 'Failed to create payroll',
      })


    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create payroll',
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Add Payroll"
      size="md"
      className="max-w-2xl bg-white"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormSelect
              label="Employee"
              value={employeeId}
              options={employeeOptions}
              onChange={setEmployeeId}
              placeholder="Select employee"
            />
          </div>
          <FormSelect
            label="Payment Type"
            value={payType}
            options={PAY_TYPE_OPTIONS}
            onChange={setPayType}
          />
          <FormInput
            label="Salary"
            placeholder="e.g. 30000"
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
          <FormInput
            label="Hourly Rate"
            placeholder="e.g. 150"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />
          <FormSelect
            label="Month"
            value={month}
            options={MONTH_OPTIONS}
            onChange={setMonth}
          />
          <FormSelect
            label="Year"
            value={year}
            options={YEAR_OPTIONS}
            onChange={setYear}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Payroll'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
