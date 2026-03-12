import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, FormTextarea, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Project, ProjectStatus } from '@/types'
import {
  projectStatusFilterOptions,
  paymentMethodOptions,
} from '../customerFinanceData'
import { toast } from '@/utils/toast'
import { parseFlexibleDate, formatDateLong } from '@/utils/formatters'

interface AddEditProjectFinanceModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
  onSave: (data: Partial<Project>) => void
}

const customerOptions = [
  { value: 'Mike Johnson', label: 'Mike Johnson' },
  { value: 'ABC Corporation', label: 'ABC Corporation' },
  { value: 'John Smith', label: 'John Smith' },
]

export function AddEditProjectFinanceModal({
  open,
  onClose,
  project,
  onSave,
}: AddEditProjectFinanceModalProps) {
  const isEdit = !!project?.id

  const [projectName, setProjectName] = useState('')
  const [customer, setCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('Active')
  const [amountDue, setAmountDue] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [totalBudget, setTotalBudget] = useState('')
  const [amountSpent, setAmountSpent] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (project) {
      setProjectName(project.projectName)
      setCustomer(project.customer)
      setPaymentMethod(project.paymentMethod ?? 'Cash')
      setCompany(project.company)
      setStatus(project.status)
      setAmountDue(String(project.amountDue ?? project.remaining ?? 0))
      setStartDate(parseFlexibleDate(project.startDate) ?? undefined)
      setTotalBudget(String(project.totalBudget))
      setAmountSpent(String(project.amountSpent))
      setEmail(project.email)
      setDescription(project.description ?? '')
    } else {
      setProjectName('')
      setCustomer('')
      setPaymentMethod('Cash')
      setCompany('')
      setStatus('Active')
      setAmountDue('')
      setStartDate(undefined)
      setTotalBudget('')
      setAmountSpent('')
      setEmail('')
      setDescription('')
    }
  }, [project, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(String(totalBudget).replace(/[^0-9.-]/g, '')) || 0
    const spent = parseFloat(String(amountSpent).replace(/[^0-9.-]/g, '')) || 0
    const remaining = total - spent

    onSave({
      projectName: projectName.trim(),
      customer: customer.trim(),
      paymentMethod,
      company: company.trim(),
      status,
      amountDue: parseFloat(String(amountDue).replace(/[^0-9.-]/g, '')) || remaining,
      startDate: startDate ? formatDateLong(startDate) : '',
      totalBudget: total,
      amountSpent: spent,
      remaining,
      email: email.trim(),
      description: description.trim() || undefined,
    })
    toast({
      title: 'Success',
      description: isEdit ? 'Project updated successfully.' : 'Project added successfully.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Add Project'}
      size="xl"
      className="max-w-2xl bg-white"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Project Name"
              placeholder="e.g. Lawn Care Package"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <FormSelect
              label="Customer"
              value={customer}
              options={customerOptions}
              onChange={setCustomer}
              placeholder="Select customer"
            />
            <FormSelect
              label="Payment Method"
              value={paymentMethod}
              options={paymentMethodOptions}
              onChange={setPaymentMethod}
            />
            <FormInput
              label="Company"
              placeholder="e.g. GreenScape Pro-Main"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <FormSelect
              label="Status"
              value={status}
              options={projectStatusFilterOptions.filter((o) => o.value !== 'all')}
              onChange={(v) => setStatus(v as ProjectStatus)}
            />
            <FormInput
              label="Amount Due"
              placeholder="e.g. 45870"
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Timeline & Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={setStartDate}
            />
            <FormInput
              label="Total Budget"
              placeholder="e.g. 45880"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
            <FormInput
              label="Amount Spent"
              placeholder="e.g. 15650"
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Customer Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Customer name"
              value={customer}
              options={customerOptions}
              onChange={setCustomer}
              placeholder="Select customer"
            />
            <FormInput
              label="Email"
              placeholder="e.g. mike@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <FormTextarea
            label="Project Description"
            placeholder="Enter project description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
         
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
            {isEdit ? 'Update Project' : 'Add Project'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

