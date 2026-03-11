import { useState, useEffect, useMemo } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { PayrollRecord, PayType } from '../payrollData'
import {
  payTypeOptions,
  employeeOptions,
  projectOptions,
  hourlyWorkedOptions,
} from '../payrollData'
import { formatCurrency } from '@/utils/formatters'
import { toast } from '@/utils/toast'

interface CreateEditPaymentModalProps {
  open: boolean
  onClose: () => void
  record: PayrollRecord | null
  onSave: (data: Partial<PayrollRecord>) => void
}

function parseHours(str: string): number {
  const match = str.match(/(\d+)\s*hour(?:\s+(\d+)\s*min)?/)
  if (!match) return 0
  const hrs = parseInt(match[1], 10) || 0
  const mins = parseInt(match[2], 10) || 0
  return hrs + mins / 60
}

export function CreateEditPaymentModal({
  open,
  onClose,
  record,
  onSave,
}: CreateEditPaymentModalProps) {
  const isEdit = !!record?.id

  const [paymentType, setPaymentType] = useState<PayType>('Monthly')
  const [employeeName, setEmployeeName] = useState('')
  const [project, setProject] = useState('')
  const [totalHourlyWorked, setTotalHourlyWorked] = useState('')
  const [hourlyPayment, setHourlyPayment] = useState('')
  const [amount, setAmount] = useState('')
  const [overtime, setOvertime] = useState('')

  useEffect(() => {
    if (record) {
      setPaymentType(record.payType)
      setEmployeeName(record.name)
      setProject(record.project)
      setTotalHourlyWorked('12 hour 10 min')
      setHourlyPayment('25')
      setAmount(String(record.amount))
      setOvertime(String(record.overtime))
    } else {
      setPaymentType('Monthly')
      setEmployeeName('')
      setProject('')
      setTotalHourlyWorked('12 hour 10 min')
      setHourlyPayment('12')
      setAmount('1235')
      setOvertime('125')
    }
  }, [record, open])

  const summary = useMemo(() => {
    const hrs = parseHours(totalHourlyWorked)
    const rate = parseFloat(hourlyPayment) || 0
    const amt = parseFloat(amount) || 0
    const ot = parseFloat(overtime) || 0
    const baseAmount = hrs * rate
    const finalAmount = amt > 0 ? amt + ot : baseAmount + ot
    return {
      hrs,
      rate,
      baseAmount,
      overtime: ot,
      finalAmount,
    }
  }, [totalHourlyWorked, hourlyPayment, amount, overtime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount) || 0
    const ot = parseFloat(overtime) || 0
    onSave({
      id: record?.id,
      payrollId: record?.payrollId,
      name: employeeName.trim() || record?.name,
      payType: paymentType,
      project: project.trim() || record?.project,
      overtime: ot,
      amount: amt + ot,
      status: record?.status ?? 'Pending',
    })
    toast({
      title: 'Success',
      description: isEdit ? 'Payment updated successfully.' : 'Payment created successfully.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Payment' : 'Create Payment'}
      size="lg"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Create Payment Type</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            label="Payment type"
            value={paymentType}
            options={payTypeOptions}
            onChange={(v) => setPaymentType(v as PayType)}
          />
          <FormSelect
            label="Employee Name"
            value={employeeName}
            options={employeeOptions}
            onChange={setEmployeeName}
            placeholder="Select employee"
          />
          <FormSelect
            label="Project"
            value={project}
            options={projectOptions}
            onChange={setProject}
            placeholder="Select project"
          />
          <FormSelect
            label="Total Hourly Worked"
            value={totalHourlyWorked}
            options={hourlyWorkedOptions}
            onChange={setTotalHourlyWorked}
          />
          <FormInput
            label="Hourly Payment"
            placeholder="e.g. $12"
            value={hourlyPayment}
            onChange={(e) => setHourlyPayment(e.target.value)}
          />
          <FormInput
            label="Amount"
            placeholder="e.g. $1235"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <FormInput
            label="Overtime"
            placeholder="e.g. $125"
            value={overtime}
            onChange={(e) => setOvertime(e.target.value)}
          />
        </div>

        {/* Payment Summary */}
        <div className="rounded-lg overflow-hidden border border-gray-100 bg-emerald-50/50">
          <h3 className="text-sm font-semibold px-4 py-2 bg-emerald-50">Payment Summary</h3>
          <div className="px-4 py-3 space-y-2 bg-emerald-50/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Amount to Pay ({Math.round(summary.hrs)} hrs × {formatCurrency(summary.rate)}):
              </span>
              <span className="font-medium">{formatCurrency(summary.baseAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overtime:</span>
              <span className="font-medium text-emerald-600">
                +{formatCurrency(summary.overtime)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-primary pt-2 border-t border-emerald-100">
              <span>Final Amount:</span>
              <span>{formatCurrency(summary.finalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
            Payment
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
