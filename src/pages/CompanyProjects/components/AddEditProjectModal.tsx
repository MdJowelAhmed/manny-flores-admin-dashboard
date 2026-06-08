import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import {
  FormInput,
  FormSelect,
  FormTextarea,
  DatePicker,
} from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { ProjectStatus } from '@/types'
import {
  projectStatusFilterOptions,
  paymentMethodOptions,
} from '../companyProjectsData'
import { sonnerToast } from '@/utils/toast'
import { InfiniteScrollSelect } from '@/components/common/InfiniteScrollSelect'
import {
  useCreateCompanyProjectMutation,
  useUpdateCompanyProjectMutation,
} from '@/redux/api/companyProjectApi'
import { mapPaymentTypeToStatus } from '../CompanyProjects'

interface AddEditProjectModalProps {
  open: boolean
  onClose: () => void
  project: any | null
  refetch: () => void

  customersRes: any
  custPage: number
  custOptions: any[]
  setCustOptions: React.Dispatch<React.SetStateAction<any[]>>
  setCustPage: React.Dispatch<React.SetStateAction<number>>
  setCustSearch: (search: string) => void
  custLoading: boolean
}



export function AddEditProjectModal({
  open,
  onClose,
  project,
  refetch,

  customersRes,
  custPage,
  custOptions,
  setCustOptions,
  setCustPage,
  setCustSearch,
  custLoading,
}: AddEditProjectModalProps) {
  const { t } = useTranslation()

  const isEdit = !!project

  const [createProject, { isLoading: isCreating }] =
    useCreateCompanyProjectMutation()

  const [updateProject, { isLoading: isUpdating }] =
    useUpdateCompanyProjectMutation()

  const isLoading = isCreating || isUpdating

  // ─────────────────────────────────────────────
  // FORM STATES
  // ─────────────────────────────────────────────

  const [projectName, setProjectName] = useState('')
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('Active')
  const [amountDue, setAmountDue] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [totalBudget, setTotalBudget] = useState('')
  const [description, setDescription] = useState('')

  // ─────────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────────

  const custHasMore =
    !!customersRes?.pagination &&
    customersRes.pagination.page < customersRes.pagination.totalPage

  // ─────────────────────────────────────────────
  // RESET SEARCH + PAGE WHEN OPEN
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    setCustSearch('')
    setCustPage(1)
  }, [open, setCustPage, setCustSearch])

  // ─────────────────────────────────────────────
  // APPEND CUSTOMER OPTIONS
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!customersRes?.data) return

    setCustOptions((prev) => {
      const existing = new Set(prev.map((o: any) => o.value))

      const mapped = customersRes.data.map((c: any) => ({
        value: c.email,
        label: c.name ? `${c.name} — ${c.email}` : c.email,
      }))

      const filtered = mapped.filter(
        (item: any) => !existing.has(item.value)
      )

      if (custPage === 1) {
        return mapped
      }

      return [...prev, ...filtered]
    })
  }, [customersRes, custPage, setCustOptions])

  // ─────────────────────────────────────────────
  // PRELOAD PROJECT DATA
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!open) return

    if (project) {
      const projectEmail =
        project.customerEmail || project.email || ''

      const projectCustomer =
        project.customerName || project.customer || ''

      setProjectName(project.projectName || '')
      setCustomer(projectCustomer)
      setEmail(projectEmail)

      setPaymentMethod(project.paymentMethod || 'CASH')

      setCompany(project.companyName || project.company || '')

      setStatus(
        mapPaymentTypeToStatus(
          project.paymentType || project.status
        ) as ProjectStatus
      )

      setAmountDue(
        String(project.amountDue ?? project.remaining ?? '')
      )
      setStartDate(
        project.startDate
          ? new Date(project.startDate)
          : undefined
      )

      setEndDate(
        project.endDate
          ? new Date(project.endDate)
          : undefined
      )

      setTotalBudget(String(project.totalBudget ?? ''))

      setDescription(
        project.description || project.projectDescription || ''
      )

      // ensure selected project customer exists in dropdown
      if (projectEmail) {
        setCustOptions((prev) => {
          const exists = prev.some(
            (o: any) => o.value === projectEmail
          )

          if (exists) return prev

          return [
            {
              value: projectEmail,
              label: projectCustomer
                ? `${projectCustomer} — ${projectEmail}`
                : projectEmail,
            },
            ...prev,
          ]
        })
      }
    } else {
      setProjectName('')
      setCustomer('')
      setEmail('')
      setPaymentMethod('CASH')
      setCompany('')
      setStatus('Active')
      setAmountDue('')
      setStartDate(undefined)
      setEndDate(undefined)
      setTotalBudget('')
      setDescription('')
    }
  }, [project, open, setCustOptions])

  // ─────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────

  const handleCustSearch = useCallback(
    (search: string) => {
      setCustPage(1)
      setCustSearch(search)
    },
    [setCustPage, setCustSearch]
  )

  // ─────────────────────────────────────────────
  // LOAD MORE
  // ─────────────────────────────────────────────

  const handleCustLoadMore = useCallback(() => {
    if (custLoading || !custHasMore) return

    setCustPage((prev) => prev + 1)
  }, [custLoading, custHasMore, setCustPage])

  // ─────────────────────────────────────────────
  // CUSTOMER CHANGE
  // ─────────────────────────────────────────────

  const handleCustomerChange = (selectedEmail: string) => {
    setEmail(selectedEmail)

    if (!selectedEmail) {
      setCustomer('')
      return
    }

    const selected = custOptions.find(
      (o: any) => o.value === selectedEmail
    )

    if (selected) {
      const name = selected.label.split(' — ')[0]
      setCustomer(name || '')
    }
  }

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const body = {
      projectName: projectName.trim(),
      customerName: customer.trim(),
      customerEmail: email.trim(),

      paymentMethod: paymentMethod,

      companyName: company.trim(),

      paymentType:
        (status === 'all' ? 'ACTIVE' : status).toUpperCase(),

      amountDue: parseFloat(amountDue) || 0,

      startDate: startDate
        ? startDate.toISOString()
        : null,

      endDate: endDate
        ? endDate.toISOString()
        : null,

      totalBudget: parseFloat(totalBudget) || 0,

      description:
        description.trim() || undefined,
    }

    if (isEdit) {
      sonnerToast.promise(
        updateProject({
          id: project.id,
          body,
        }).unwrap(),
        {
          loading: t('common.processing'),

          success: () => {
            refetch()
            onClose()

            return t('companyProjects.projectUpdated')
          },

          error: (err: any) =>
            err?.data?.message || t('common.error'),
        }
      )
    } else {
      sonnerToast.promise(
        createProject(body).unwrap(),
        {
          loading: t('common.processing'),

          success: () => {
            refetch()
            onClose()

            return t('companyProjects.projectCreated')
          },

          error: (err: any) =>
            err?.data?.message || t('common.error'),
        }
      )
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={
        isEdit
          ? t('companyProjects.editProject')
          : t('companyProjects.addProject')
      }
      size="xl"
      className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* BASIC INFO */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">
            {t('companyProjects.basicInformation')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('companyProjects.projectName')}
              placeholder={t(
                'companyProjects.projectNamePlaceholder'
              )}
              value={projectName}
              onChange={(e) =>
                setProjectName(e.target.value)
              }
              required
            />

            <InfiniteScrollSelect
              label={t('companyProjects.customer')}
              value={email}
              options={custOptions}
              onChange={handleCustomerChange}
              placeholder={t(
                'companyProjects.customerPlaceholder'
              )}
              loading={custLoading}
              hasMore={custHasMore}
              onSearch={handleCustSearch}
              onLoadMore={handleCustLoadMore}
            />

            <FormSelect
              label={t('companyProjects.paymentMethod')}
              value={paymentMethod}
              options={paymentMethodOptions}
              onChange={setPaymentMethod}
            />

            <FormInput
              label={t('companyProjects.company')}
              placeholder={t(
                'companyProjects.companyPlaceholder'
              )}
              value={company}
              onChange={(e) =>
                setCompany(e.target.value)
              }
            />

            <FormSelect
              label={t('common.status')}
              value={
                status === 'all'
                  ? 'Active'
                  : status
              }
              options={projectStatusFilterOptions
                .filter((o) => o.value !== 'all')
                .map((o) => ({
                  value: o.value,
                  label: t(o.labelKey),
                }))}
              onChange={(v) =>
                setStatus(v as ProjectStatus)
              }
            />

            <FormInput
              label={t('companyProjects.amountDue')}
              placeholder={t(
                'companyProjects.amountPlaceholder'
              )}
              type="number"
              value={amountDue}
              onChange={(e) =>
                setAmountDue(e.target.value)
              }
            />
          </div>
        </div>

        {/* TIMELINE */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">
            {t('companyProjects.timelineBudget')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label={t('companyProjects.startDate')}
              value={startDate}
              onChange={setStartDate}
            />

            <DatePicker
              label={t('companyProjects.endDate')}
              value={endDate}
              onChange={setEndDate}
            />

            <FormInput
              label={t('companyProjects.totalBudget')}
              placeholder={t(
                'companyProjects.totalBudgetPlaceholder'
              )}
              type="number"
              value={totalBudget}
              onChange={(e) =>
                setTotalBudget(e.target.value)
              }
            />
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">
            {t('companyProjects.customerContact')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('companyProjects.customer')}
              placeholder={t(
                'companyProjects.customerPlaceholder'
              )}
              value={customer}
              onChange={(e) =>
                setCustomer(e.target.value)
              }
            />

            <FormInput
              label={t('common.email')}
              placeholder={t(
                'companyProjects.emailPlaceholder'
              )}
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <FormTextarea
            label={t(
              'companyProjects.projectDescription'
            )}
            placeholder={t(
              'companyProjects.projectDescriptionPlaceholder'
            )}
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={4}
            className="resize-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading
              ? t('common.processing')
              : t('companyProjects.saveProject')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}