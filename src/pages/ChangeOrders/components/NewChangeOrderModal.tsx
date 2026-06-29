import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Loader2 } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormTextarea } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { changeReasonOptions, type ChangeOrderProjectType } from '../changeOrdersData'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { useCreateChangeOrderMutation } from '@/redux/slices/super-admin/changeOrdersApi'
import { useGetProjectsQuery } from '@/redux/slices/super-admin/documentsApprovalApi'
import { useGetCompanyProjectsQuery } from '@/redux/api/companyProjectApi'

const inputClass = 'rounded-lg bg-muted/40 border-gray-200/80 h-11'

const getProjectEstimate = (project: {
  estimate?: { id?: string; projectName?: string }
  estimates?: { id?: string; projectName?: string } | null
}) => project?.estimate ?? project?.estimates ?? null

interface NewChangeOrderModalProps {
  open: boolean
  onClose: () => void
  onCreate: () => void
  projectType: ChangeOrderProjectType
}

export function NewChangeOrderModal({
  open,
  onClose,
  onCreate,
  projectType,
}: NewChangeOrderModalProps) {
  const { t } = useTranslation()
  const isCompanyTab = projectType === 'company'

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [reasonKey, setReasonKey] = useState(changeReasonOptions[0]?.value ?? '')
  const [description, setDescription] = useState('')
  const [additionalCost, setAdditionalCost] = useState('0')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const [customerProjectPage, setCustomerProjectPage] = useState(1)
  const [customerProjects, setCustomerProjects] = useState<any[]>([])

  const [createChangeOrder, { isLoading: isCreating }] = useCreateChangeOrderMutation()

  const {
    data: customerProjectsApi,
    isLoading: customerProjectLoading,
    isFetching: customerProjectFetching,
    refetch: customerProjectRefetch,
  } = useGetProjectsQuery(
    { page: customerProjectPage, limit: 40 },
    { skip: !open || isCompanyTab }
  )

  const {
    data: companyProjectsApi,
    isLoading: companyProjectLoading,
    isFetching: companyProjectFetching,
    refetch: companyProjectRefetch,
  } = useGetCompanyProjectsQuery(
    { page: 1, limit: 100 },
    { skip: !open || !isCompanyTab }
  )

  const projectLoading = isCompanyTab ? companyProjectLoading : customerProjectLoading

  useEffect(() => {
    const incoming = customerProjectsApi?.data
    if (!Array.isArray(incoming) || isCompanyTab) return
    setCustomerProjects((prev) =>
      customerProjectPage === 1 ? incoming : [...prev, ...incoming]
    )
  }, [customerProjectsApi?.data, customerProjectPage, isCompanyTab])

  useEffect(() => {
    if (!open) return
    setSelectedProjectId('')
    setReasonKey(changeReasonOptions[0]?.value ?? '')
    setDescription('')
    setAdditionalCost('0')
    setSelectedFiles([])
    setCustomerProjectPage(1)
    setCustomerProjects([])

    if (isCompanyTab) {
      companyProjectRefetch()
    } else {
      const incoming = customerProjectsApi?.data
      if (Array.isArray(incoming)) {
        setCustomerProjects(incoming)
      }
      customerProjectRefetch()
    }
  }, [open, projectType]) // eslint-disable-line react-hooks/exhaustive-deps

  const customerPagination = customerProjectsApi?.pagination
  const customerHasMore = customerPagination
    ? customerProjectPage < customerPagination.totalPage
    : false

  const customerProjectsWithEstimate = customerProjects.filter((project) =>
    getProjectEstimate(project)?.id
  )

  const companyProjects = companyProjectsApi?.data ?? []

  const handleCustomerDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const nearBottom = scrollHeight - scrollTop <= clientHeight + 20
    if (nearBottom && !customerProjectFetching && customerHasMore) {
      setCustomerProjectPage((p) => p + 1)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArray])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      toast({
        title: t('common.error'),
        description: t('changeOrders.selectProjectPlaceholder'),
        variant: 'destructive',
      })
      return
    }

    const cleanCost = Number.parseFloat(additionalCost.replace(/[^0-9.-]/g, '')) || 0

    const formData = new FormData()
    formData.append('projectType', projectType)
    if (isCompanyTab) {
      formData.append('companyProjectId', selectedProjectId)
    } else {
      formData.append('estimateScheduleId', selectedProjectId)
    }
    formData.append('reasonForChange', reasonKey)
    formData.append('description', description.trim())
    formData.append('additionalCost', cleanCost.toString())

    selectedFiles.forEach((file) => {
      formData.append('documentation', file)
    })

    try {
      await createChangeOrder(formData).unwrap()
      toast({
        title: t('common.success'),
        description: t('changeOrders.newOrderCreated'),
        variant: 'success',
      })
      onCreate()
      onClose()
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof err.data.message === 'string'
          ? err.data.message
          : 'Failed to create Change Order'
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('changeOrders.newChangeOrder')}
      description={
        isCompanyTab
          ? t('changeOrders.newChangeOrderCompanyDesc')
          : t('changeOrders.newChangeOrderCustomerDesc')
      }
      size="xl"
      className="max-w-3xl bg-white "
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            {isCompanyTab
              ? t('changeOrders.selectCompanyProject')
              : t('changeOrders.selectProject')}
          </label>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={projectLoading}
          >
            <SelectTrigger className={cn(inputClass, 'w-full')}>
              {projectLoading ? (
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </span>
              ) : (
                <SelectValue
                  placeholder={
                    isCompanyTab
                      ? t('changeOrders.selectCompanyProjectPlaceholder')
                      : t('changeOrders.selectProjectPlaceholder')
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {isCompanyTab ? (
                <div className="max-h-52 overflow-y-auto">
                  {companyProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectName}
                      {project.companyName ? ` — ${project.companyName}` : ''}
                    </SelectItem>
                  ))}

                  {companyProjectFetching && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {!companyProjectLoading && !companyProjectFetching && companyProjects.length === 0 && (
                    <p className="text-xs text-center text-muted-foreground py-3">
                      {t('common.noData')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto" onScroll={handleCustomerDropdownScroll}>
                  {customerProjectsWithEstimate.map((project) => {
                    const estimate = getProjectEstimate(project)
                    return (
                      <SelectItem key={project.id} value={project.id}>
                        {estimate?.projectName}
                      </SelectItem>
                    )
                  })}

                  {customerProjectFetching && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {!customerHasMore &&
                    !customerProjectFetching &&
                    customerProjectsWithEstimate.length > 0 && (
                      <p className="text-xs text-center text-muted-foreground py-2">
                        {t('common.allLoaded')}
                      </p>
                    )}

                  {!customerProjectLoading &&
                    !customerProjectFetching &&
                    customerProjectsWithEstimate.length === 0 && (
                      <p className="text-xs text-center text-muted-foreground py-3">
                        {t('common.noData')}
                      </p>
                    )}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('changeOrders.reasonForChangeSelect')}</label>
          <Select value={reasonKey} onValueChange={setReasonKey}>
            <SelectTrigger className={cn(inputClass, 'w-full')}>
              <SelectValue placeholder={t('changeOrders.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {changeReasonOptions.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {t(r.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormTextarea
          label={t('changeOrders.descriptionOfWork')}
          placeholder={t('changeOrders.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-lg bg-muted/40 border-gray-200/80 min-h-[100px]"
        />

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            {t('changeOrders.financialImpactDetails')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label={t('changeOrders.additionalCost')}
              value={additionalCost}
              onChange={(e) => setAdditionalCost(e.target.value)}
              inputMode="decimal"
              className={cn(inputClass)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t('changeOrders.documentation')}</label>
          <div
            className={cn(
              'rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20',
              'px-4 py-8 text-center cursor-pointer hover:border-primary/40 transition-colors'
            )}
          >
            <input
              type="file"
              className="hidden"
              id="co-upload"
              accept=".png,.jpg,.jpeg"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="co-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-orange-500/15">
                <Upload className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground max-w-sm">{t('changeOrders.uploadHint')}</span>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {t('changeOrders.selectedFiles') || 'Selected Files:'}
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-muted/40 rounded-lg border border-gray-100 text-xs"
                  >
                    <span className="truncate max-w-[450px] font-medium text-foreground" title={file.name}>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-red-500 hover:text-red-700 font-semibold px-2 shrink-0"
                    >
                      {t('common.remove') || 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
          <Button
            type="submit"
            disabled={isCreating}
            className="rounded-lg bg-primary hover:bg-primary/90 text-white min-w-[140px]"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.processing')}
              </span>
            ) : (
              t('changeOrders.generateChangeOrder')
            )}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
