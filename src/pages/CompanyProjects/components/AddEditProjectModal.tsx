import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { ImageUploader } from '@/components/common/ImageUploader'
import {
  FormInput,
  FormSelect,
  FormTextarea,
  DatePicker,
} from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { paymentMethodOptions } from '../companyProjectsData'
import { sonnerToast } from '@/utils/toast'
import { InfiniteScrollSelect } from '@/components/common/InfiniteScrollSelect'
import {
  useCreateCompanyProjectMutation,
  useUpdateCompanyProjectMutation,
  buildCompanyProjectRequestBody,
  normalizeProjectDocumentation,
  type CompanyProjectDocument,
} from '@/redux/api/companyProjectApi'
import { ACCEPTED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE } from '@/utils/constants'
import { imageUrlAbsolute } from '@/components/common/getImageUrl'
import { FileText, X } from 'lucide-react'

interface BuilderOption {
  value: string
  label: string
  name: string
  email: string
}

interface AddEditProjectModalProps {
  open: boolean
  onClose: () => void
  project: any | null
  refetch: () => void

  buildersRes: any
  builderPage: number
  builderOptions: BuilderOption[]
  setBuilderOptions: React.Dispatch<React.SetStateAction<BuilderOption[]>>
  setBuilderPage: React.Dispatch<React.SetStateAction<number>>
  setBuilderSearch: (search: string) => void
  builderLoading: boolean
}

export function AddEditProjectModal({
  open,
  onClose,
  project,
  refetch,
  buildersRes,
  builderPage,
  builderOptions,
  setBuilderOptions,
  setBuilderPage,
  setBuilderSearch,
  builderLoading,
}: AddEditProjectModalProps) {
  const { t } = useTranslation()
  const isEdit = !!project

  const [createProject, { isLoading: isCreating }] =
    useCreateCompanyProjectMutation()
  const [updateProject, { isLoading: isUpdating }] =
    useUpdateCompanyProjectMutation()

  const isLoading = isCreating || isUpdating

  const [projectName, setProjectName] = useState('')
  const [builderId, setBuilderId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [company, setCompany] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingDocuments, setExistingDocuments] = useState<CompanyProjectDocument[]>([])

  const dueAmount = useMemo(() => {
    const total = parseFloat(totalBudget) || 0
    const paid = payAmount.trim() === '' ? 0 : parseFloat(payAmount) || 0
    return Math.max(0, total - paid)
  }, [totalBudget, payAmount])

  const builderHasMore =
    !!buildersRes?.pagination &&
    buildersRes.pagination.page < buildersRes.pagination.totalPage

  useEffect(() => {
    if (!open) return
    setBuilderSearch('')
    setBuilderPage(1)
  }, [open, setBuilderPage, setBuilderSearch])

  useEffect(() => {
    if (!buildersRes?.data) return

    setBuilderOptions((prev) => {
      const existing = new Set(prev.map((o) => o.value))

      const mapped: BuilderOption[] = buildersRes.data.map((b: any) => ({
        value: b.id,
        label: b.name ? `${b.name} — ${b.email}` : b.email,
        name: b.name || '',
        email: b.email || '',
      }))

      const filtered = mapped.filter((item) => !existing.has(item.value))

      if (builderPage === 1) {
        return mapped
      }

      return [...prev, ...filtered]
    })
  }, [buildersRes, builderPage, setBuilderOptions])

  const ensureBuilderOption = useCallback(
    (id: string, name: string, builderEmail: string) => {
      if (!id) return

      setBuilderOptions((prev) => {
        if (prev.some((o) => o.value === id)) return prev

        return [
          {
            value: id,
            label: name ? `${name} — ${builderEmail}` : builderEmail,
            name,
            email: builderEmail,
          },
          ...prev,
        ]
      })
    },
    [setBuilderOptions]
  )

  useEffect(() => {
    if (!open) return

    if (project) {
      const projectBuilderId = project.builderId || project.builder?.id || ''
      const projectCustomer =
        project.builder?.name || project.customerName || project.customer || ''
      const projectEmail =
        project.builder?.email || project.customerEmail || project.email || ''

      setProjectName(project.projectName || '')
      setBuilderId(projectBuilderId)
      setPaymentMethod(project.paymentMethod || 'CASH')
      setCompany(project.companyName || project.company || '')
      setTotalBudget(String(project.totalBudget ?? ''))
      setPayAmount(project.payAmount != null ? String(project.payAmount) : '')
      setStartDate(project.startDate ? new Date(project.startDate) : undefined)
      setEndDate(project.endDate ? new Date(project.endDate) : undefined)
      setDescription(project.description || '')
      setExistingDocuments(normalizeProjectDocumentation(project.documentation))
      setSelectedFiles([])

      if (projectBuilderId) {
        ensureBuilderOption(projectBuilderId, projectCustomer, projectEmail)
      }
    } else {
      setProjectName('')
      setBuilderId('')
      setPaymentMethod('CASH')
      setCompany('')
      setTotalBudget('')
      setPayAmount('')
      setStartDate(undefined)
      setEndDate(undefined)
      setDescription('')
      setExistingDocuments([])
      setSelectedFiles([])
    }
  }, [project, open, ensureBuilderOption])

  const handleBuilderSearch = useCallback(
    (search: string) => {
      setBuilderPage(1)
      setBuilderSearch(search)
    },
    [setBuilderPage, setBuilderSearch]
  )

  const handleBuilderLoadMore = useCallback(() => {
    if (builderLoading || !builderHasMore) return
    setBuilderPage((prev) => prev + 1)
  }, [builderLoading, builderHasMore, setBuilderPage])

  const handleBuilderChange = (selectedBuilderId: string) => {
    setBuilderId(selectedBuilderId)

    if (!selectedBuilderId) return

    const selected = builderOptions.find((o) => o.value === selectedBuilderId)
    if (selected) {
      ensureBuilderOption(selected.value, selected.name, selected.email)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!builderId) {
      sonnerToast.error(t('companyProjects.builderRequired'))
      return
    }

    const payload = {
      projectName: projectName.trim(),
      builderId,
      paymentMethod,
      companyName: company.trim(),
      paymentType: project?.paymentType || 'ACTIVE',
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      totalBudget: parseFloat(totalBudget) || 0,
      payAmount: payAmount.trim() === '' ? 0 : parseFloat(payAmount) || 0,
      amountDue: dueAmount,
      description: description.trim(),
    }

    const existingDocumentation = existingDocuments.map((doc) => doc.url)
    const requestBody = buildCompanyProjectRequestBody(payload, {
      newFiles: selectedFiles,
      existingDocumentation: isEdit ? existingDocumentation : [],
      preferJson: isEdit,
    })

    if (isEdit) {
      sonnerToast.promise(
        updateProject({ id: project.id, body: requestBody }).unwrap(),
        {
          loading: t('common.processing'),
          success: () => {
            refetch()
            onClose()
            return t('companyProjects.projectUpdated')
          },
          error: (err: any) => err?.data?.message || t('common.error'),
        }
      )
    } else {
      sonnerToast.promise(createProject(requestBody as FormData).unwrap(), {
        loading: t('common.processing'),
        success: () => {
          refetch()
          onClose()
          return t('companyProjects.projectCreated')
        },
        error: (err: any) => err?.data?.message || t('common.error'),
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('companyProjects.editProject') : t('companyProjects.addProject')}
      size="xl"
      className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">
            {t('companyProjects.basicInformation')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label={t('companyProjects.projectName')}
              placeholder={t('companyProjects.projectNamePlaceholder')}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />

            <InfiniteScrollSelect
              label={t('companyProjects.selectClientBuilder')}
              value={builderId}
              options={builderOptions}
              onChange={handleBuilderChange}
              placeholder={t('companyProjects.selectClientBuilderPlaceholder')}
              loading={builderLoading}
              hasMore={builderHasMore}
              onSearch={handleBuilderSearch}
              onLoadMore={handleBuilderLoadMore}
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
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 text-foreground">
            {t('companyProjects.timelineBudget')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label={t('companyProjects.totalAmount')}
              placeholder={t('companyProjects.totalBudgetPlaceholder')}
              type="number"
              min="0"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />

            <FormInput
              label={t('companyProjects.payAmount')}
              placeholder={t('companyProjects.payAmountPlaceholder')}
              type="number"
              min="0"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />

            <FormInput
              label={t('companyProjects.amountDue')}
              type="number"
              value={dueAmount.toFixed(2)}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        <ImageUploader
          multiple
          label={t('companyProjects.uploadDocuments')}
          hint={t('companyProjects.uploadDocumentsTypes')}
          files={selectedFiles}
          onFilesChange={setSelectedFiles}
          acceptedTypes={ACCEPTED_DOCUMENT_TYPES}
          maxSize={MAX_DOCUMENT_SIZE}
        />

        {existingDocuments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('companyProjects.existingDocuments')}
            </p>
            <div className="space-y-2">
              {existingDocuments.map((doc) => (
                <div
                  key={doc.id || doc.url}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-muted/20"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                    <a
                      href={imageUrlAbsolute(doc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline truncate"
                    >
                      {doc.name}
                    </a>
                  </div>
                  {isEdit && (
                    <button
                      type="button"
                      onClick={() =>
                        setExistingDocuments((prev) =>
                          prev.filter((item) => item.url !== doc.url)
                        )
                      }
                      className="text-red-500 hover:text-red-700 shrink-0"
                      aria-label={t('companyProjects.removeDocument')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? t('common.processing') : t('companyProjects.saveProject')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
