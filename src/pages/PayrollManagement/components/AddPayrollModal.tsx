import { useState, useEffect, useCallback } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { InfiniteScrollSelect } from '@/components/common/InfiniteScrollSelect'
import { useCreatePayrollMutation, } from '@/redux/slices/super-admin/payrollApi'
import { sonnerToast, toast } from '@/utils/toast'



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

export function AddPayrollModal({ open, onClose, customersData, empPage, empOptions, setEmpOptions, setEmpPage, setEmpSearch, empLoading, refetch }: any) {

  console.log(empOptions)

  const [createPayroll, { isLoading }] = useCreatePayrollMutation()

  // ── Form state ──────────────────────────────────────────────────────────────
  const [employeeId, setEmployeeId] = useState('')
  const [salary, setSalary] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [payType, setPayType] = useState('MONTHLY')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(currentYear))

  // ── Employee infinite-scroll state ─────────────────────────────────────────
  // const [empSearch, setEmpSearch] = useState('')
  // const [empPage, setEmpPage] = useState(1)
  // const [empOptions, setEmpOptions] = useState<{ value: string; label: string }[]>([])

  // const { data: customersData, isFetching: empLoading } = useGetAllCustomersQuery({
  //   search: empSearch,
  //   page: empPage,
  // })

  // Accumulate pages into empOptions.
  // Reset the list on page 1 (i.e. after a new search).
  useEffect(() => {
    if (!customersData?.data) return

    const incoming = customersData.data.map((c: any) => ({
      value: c.id,
      // Show name + email so duplicated names (e.g. "My Client") are distinguishable
      label: c.name ? `${c.name} — ${c.email}` : c.email,
    }))

    setEmpOptions((prev: any) => (empPage === 1 ? incoming : [...prev, ...incoming]))
  }, [customersData, empPage])

  // Derived from real pagination data:
  // hasMore = current page < total pages
  const empHasMore =
    !!customersData?.pagination &&
    customersData.pagination.page < customersData.pagination.totalPage

  const handleEmpSearch = useCallback((search: string) => {
    setEmpSearch(search)
    setEmpPage(1)      // back to first page
    setEmpOptions([])  // clear accumulated list so page-1 results replace old ones
  }, [])

  const handleEmpLoadMore = useCallback(() => {
    if (!empLoading && empHasMore) {
      setEmpPage((p: any) => p + 1)
    }
  }, [empLoading, empHasMore])

  // ── Reset whole form when modal opens ──────────────────────────────────────
  useEffect(() => {
    if (open) {
      setEmployeeId('')
      setSalary('')
      setHourlyRate('')
      setPayType('MONTHLY')
      setMonth(String(new Date().getMonth() + 1))
      setYear(String(currentYear))
      setEmpSearch('')
      setEmpPage(1)

      // Re-populate from already-cached customersData instead of clearing to []
      // (RTK Query won't refetch identical params, so the accumulation effect won't re-fire)
      if (customersData?.data) {
        const initial = customersData.data.map((c: any) => ({
          value: c.id,
          label: c.name ? `${c.name} — ${c.email}` : c.email,
        }))
        setEmpOptions(initial)
      } else {
        setEmpOptions([])
      }
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId) {
      toast({ title: 'Error', description: 'Please select an employee.', variant: 'destructive' })
      return
    }

    sonnerToast.promise(
      createPayroll({
        employeeId,
        salary: Number(salary) || 0,
        hourlyRate: Number(hourlyRate) || 0,
        payType,
        paymentTypeStatus: 'UNPAID',
        month: Number(month),
        year: Number(year),
      }).unwrap(),
      {
        loading: 'Creating payroll...',
        success: () => {
          refetch()
          onClose()
          return 'Payroll created successfully.'
        },
        error: (err: any) => err?.data?.message || 'Failed to create payroll',
      }
    )
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Add Payroll" size="md" className="max-w-2xl bg-white">
      <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        <div className="grid grid-cols-2 gap-4">

          {/* Employee — infinite scroll + search */}
          <div className="col-span-2">
            <InfiniteScrollSelect
              label="Employee"
              value={employeeId}
              onChange={setEmployeeId}
              placeholder="Select employee"
              options={empOptions}
              loading={empLoading}
              hasMore={empHasMore}
              onSearch={handleEmpSearch}
              onLoadMore={handleEmpLoadMore}
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
          <FormSelect label="Month" value={month} options={MONTH_OPTIONS} onChange={setMonth} />
          <FormSelect label="Year" value={year} options={YEAR_OPTIONS} onChange={setYear} />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Payroll'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}