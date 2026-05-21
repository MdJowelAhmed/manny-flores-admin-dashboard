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
import { changeReasonOptions } from '../changeOrdersData'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { useCreateChangeOrderMutation } from '@/redux/slices/super-admin/changeOrdersApi'

const inputClass = 'rounded-lg bg-muted/40 border-gray-200/80 h-11'

interface NewChangeOrderModalProps {
  open: boolean
  onClose: () => void
  onCreate: () => void
  projectLoading: boolean
  projectFetching: boolean
  projectRefetch: () => void
  projectPage: number
  setProjectPage: React.Dispatch<React.SetStateAction<number>>
  projects: any[]
  setProjects: React.Dispatch<React.SetStateAction<any[]>>
  getProjectsApi: any
}

export function NewChangeOrderModal({
  open,
  onClose,
  onCreate,
  projectLoading,
  projectFetching,
  projectRefetch,
  projectPage,
  setProjectPage,
  projects,
  setProjects,
  getProjectsApi,
}: NewChangeOrderModalProps) {
  const { t } = useTranslation()
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [reasonKey, setReasonKey] = useState(changeReasonOptions[0]?.value ?? '')
  const [description, setDescription] = useState('')
  const [additionalCost, setAdditionalCost] = useState('0')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const [createChangeOrder, { isLoading: isCreating }] = useCreateChangeOrderMutation()

  // Accumulate pages — data is directly getProjectsApi?.data (flat array)
  useEffect(() => {
    const incoming = getProjectsApi?.data
    if (!Array.isArray(incoming)) return
    setProjects((prev: any) => (projectPage === 1 ? incoming : [...prev, ...incoming]))
  }, [getProjectsApi?.data, projectPage, setProjects])

  // Reset state and trigger a fresh fetch on opening
  useEffect(() => {
    if (!open) return
    setSelectedProjectId('')
    setReasonKey(changeReasonOptions[0]?.value ?? '')
    setDescription('')
    setAdditionalCost('0')
    setSelectedFiles([])
    setProjectPage(1)
    setProjects([])
    projectRefetch()
  }, [open])

  const pagination = getProjectsApi?.pagination
  const hasMore = pagination ? projectPage < pagination.totalPage : false

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const nearBottom = scrollHeight - scrollTop <= clientHeight + 20
    if (nearBottom && !projectFetching && hasMore) {
      setProjectPage((p: any) => p + 1)
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
    formData.append('projectId', selectedProjectId)
    formData.append('reasonForChange', reasonKey)
    formData.append('description', description.trim())
    formData.append('additionalCost', cleanCost.toString())

    // Append multiple files
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
    } catch (err: any) {
      console.error('Create Change Order Error:', err)
      toast({
        title: t('common.error'),
        description: err?.data?.message || 'Failed to create Change Order',
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('changeOrders.newChangeOrder')}
      size="xl"
      className="max-w-3xl bg-white "
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Select Project Dropdown */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('changeOrders.selectProject')}</label>
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
                <SelectValue placeholder={t('changeOrders.selectProjectPlaceholder')} />
              )}
            </SelectTrigger>
            <SelectContent>
              <div
                className="max-h-52 overflow-y-auto"
                onScroll={handleDropdownScroll}
              >
                {getProjectsApi?.data?.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.estimates?.projectName ?? "Project ID: " + project.id.slice(0, 8)}
                  </SelectItem>
                ))}

                {/* Loading spinner */}
                {projectFetching && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* All loaded */}
                {!hasMore && !projectFetching && projects.length > 0 && (
                  <p className="text-xs text-center text-muted-foreground py-2">
                    {t('common.allLoaded')}
                  </p>
                )}

                {/* Empty */}
                {!projectLoading && !projectFetching && projects.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-3">
                    {t('common.noData')}
                  </p>
                )}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Reason for Change Dropdown */}
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

        {/* Description of Work */}
        <FormTextarea
          label={t('changeOrders.descriptionOfWork')}
          placeholder={t('changeOrders.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-lg bg-muted/40 border-gray-200/80 min-h-[100px]"
        />

        {/* Financial Impact / Additional Cost */}
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

        {/* File upload documentation (multiple) */}
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

          {/* Selected files listing with remove capability */}
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
