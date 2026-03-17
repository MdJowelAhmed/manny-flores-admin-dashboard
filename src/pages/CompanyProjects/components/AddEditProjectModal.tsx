import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, FormTextarea, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Project, ProjectStatus } from '@/types'
import { projectStatusFilterOptions, paymentMethodOptions } from '../companyProjectsData'
import { toast } from '@/utils/toast'
import { parseFlexibleDate, formatDateLong } from '@/utils/formatters'

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
  const { t } = useTranslation()
  const isEdit = !!project

  const [projectName, setProjectName] = useState('')
  const [customer, setCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('Active')
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
      setAmountDue(String(project.amountDue ?? project.remaining))
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
      startDate: startDate ? formatDateLong(startDate) : '',
      totalBudget: total,
      amountSpent: spent,
      remaining,
      email: email.trim(),
      description: description.trim() || undefined,
    })
    toast({
      title: t('common.success'),
      description: isEdit ? t('companyProjects.projectUpdated') : t('companyProjects.projectCreated'),
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('companyProjects.editProject') : t('companyProjects.addProject')}
      size="xl"
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">{t('companyProjects.basicInformation')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('companyProjects.projectName')}
              placeholder={t('companyProjects.projectNamePlaceholder')}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <FormSelect
              label={t('companyProjects.customer')}
              value={customer}
              options={customerOptions}
              onChange={setCustomer}
              placeholder={t('companyProjects.customerPlaceholder')}
            />
            <FormSelect
              label={t('companyProjects.paymentMethod')}
              value={paymentMethod}
              options={paymentMethodOptions}
              onChange={setPaymentMethod}
            />
            <FormInput
              label={t('companyProjects.company')}
              placeholder={t('companyProjects.companyPlaceholder')}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <FormSelect
              label={t('common.status')}
              value={status === 'all' ? 'Active' : status}
              options={projectStatusFilterOptions
                .filter((o) => o.value !== 'all')
                .map((o) => ({ value: o.value, label: t(o.labelKey) }))}
              onChange={(v) => setStatus(v as ProjectStatus)}
            />
            <FormInput
              label={t('companyProjects.amountDue')}
              placeholder={t('companyProjects.amountPlaceholder')}
              type="number"
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
            />
          </div>
        </div>

        {/* Timeline & Budget */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">{t('companyProjects.timelineBudget')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label={t('companyProjects.startDate')}
              value={startDate}
              onChange={setStartDate}
            />
            <FormInput
              label={t('companyProjects.totalBudget')}
              placeholder={t('companyProjects.totalBudgetPlaceholder')}
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
            <FormInput
              label={t('companyProjects.amountSpent')}
              placeholder={t('companyProjects.amountSpentPlaceholder')}
              type="number"
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
            />
          </div>
        </div>

        {/* Customer Contact */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">{t('companyProjects.customerContact')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('companyProjects.customer')}
              placeholder={t('companyProjects.customerPlaceholder')}
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
            <FormInput
              label={t('common.email')}
              placeholder={t('companyProjects.emailPlaceholder')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Project Description */}
        <div>
          <FormTextarea
            label={t('companyProjects.projectDescription')}
            placeholder={t('companyProjects.projectDescriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 ">
        
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
            {t('companyProjects.saveProject')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
