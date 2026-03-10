import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, FormTextarea } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Project, ProjectStatus } from '@/types'
import { projectStatusFilterOptions, paymentMethodOptions } from '../companyProjectsData'
import { toast } from '@/utils/toast'

interface AddEditProjectModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
  onSave: (data: Partial<Project>) => void
}

const customerOptions = [
  { value: 'John Smith', label: 'John Smith' },
  { value: 'Sarah Johnson', label: 'Sarah Johnson' },
  { value: 'Michael Brown', label: 'Michael Brown' },
  { value: 'Lisa Anderson', label: 'Lisa Anderson' },
  { value: 'Robert Williams', label: 'Robert Williams' },
]

export function AddEditProjectModal({ open, onClose, project, onSave }: AddEditProjectModalProps) {
  const isEdit = !!project

  const [projectName, setProjectName] = useState('')
  const [customer, setCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('Active')
  const [amountDue, setAmountDue] = useState('')
  const [startDate, setStartDate] = useState('')
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
      setAmountDue(String(project.amountDue ?? project.remaining))
      setStartDate(project.startDate)
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
      setStartDate('')
      setTotalBudget('')
      setAmountSpent('')
      setEmail('')
      setDescription('')
    }
  }, [project, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(totalBudget) || 0
    const spent = parseFloat(amountSpent) || 0
    const remaining = total - spent

    onSave({
      projectName: projectName.trim(),
      customer: customer.trim(),
      paymentMethod,
      company: company.trim(),
      status: status as ProjectStatus,
      amountDue: parseFloat(amountDue) || remaining,
      startDate,
      totalBudget: total,
      amountSpent: spent,
      remaining,
      email: email.trim(),
      description: description.trim() || undefined,
    })
    toast({
      title: 'Success',
      description: isEdit ? 'Project updated successfully.' : 'Project created successfully.',
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
      className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Project Name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <FormSelect
              label="Customer"
              value={customer}
              options={customerOptions}
              onChange={setCustomer}
              placeholder="Enter customer name"
            />
            <FormSelect
              label="Payment Method"
              value={paymentMethod}
              options={paymentMethodOptions}
              onChange={setPaymentMethod}
            />
            <FormInput
              label="Company"
              placeholder="Enter company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <FormSelect
              label="Status"
              value={status === 'all' ? 'Active' : status}
              options={projectStatusFilterOptions.filter((o) => o.value !== 'all')}
              onChange={(v) => setStatus(v as ProjectStatus)}
            />
            <FormInput
              label="Amount Due"
              placeholder="Enter amount"
              type="number"
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
            />
          </div>
        </div>

        {/* Timeline & Budget */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Timeline & Budget</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Start date"
              placeholder="dd/mm/yyyy"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormInput
              label="Total Budget"
              placeholder="Enter total budget"
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
            <FormInput
              label="Amount Spent"
              placeholder="Enter amount spent"
              type="number"
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Contact */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">Customer Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Customer name"
              placeholder="enter customer name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
            <FormInput
              label="Email"
              placeholder="Enter email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Project Description */}
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
            Save
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
