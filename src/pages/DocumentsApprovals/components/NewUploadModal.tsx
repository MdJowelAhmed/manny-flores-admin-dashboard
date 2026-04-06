import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DOCUMENT_CATEGORY_FILTERS, type DocumentCategoryFilter, type DocumentEntry } from '../documentsApprovalsData'
import { formatDateDisplay } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

const inputClass = 'rounded-lg bg-muted/40 border-gray-200/80 h-11'

function categoryLabelKey(c: DocumentCategoryFilter): string {
  return `documentsApprovals.filterCategories.${c}`
}

interface NewUploadModalProps {
  open: boolean
  onClose: () => void
  onCreated: (doc: DocumentEntry) => void
}

export function NewUploadModal({ open, onClose, onCreated }: NewUploadModalProps) {
  const { t } = useTranslation()
  const [projectTitle, setProjectTitle] = useState('')
  const [category, setCategory] = useState<DocumentCategoryFilter>('customer_contract')
  const [uploadDate, setUploadDate] = useState<Date | undefined>(undefined)
  const [uploadedBy, setUploadedBy] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('12 months')

  useEffect(() => {
    if (open) {
      setProjectTitle('')
      setCategory('customer_contract')
      setUploadDate(new Date())
      setUploadedBy('')
      setBudget('')
      setTimeline('12 months')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const title = projectTitle.trim()
    const by = uploadedBy.trim()
    if (!title || !by || !uploadDate) {
      toast({
        title: t('common.error'),
        description: t('documentsApprovals.uploadFillRequired'),
        variant: 'destructive',
      })
      return
    }

    const typeLabel = t(categoryLabelKey(category))
    const dateStr = formatDateDisplay(uploadDate)
    const bud = Number.parseFloat(budget.replace(/[^0-9.]/g, '')) || 0

    const doc: DocumentEntry = {
      id: `doc-${Date.now()}`,
      projectTitle: title,
      documentTypeLabel: typeLabel,
      documentCategory: category,
      uploadDate: dateStr,
      version: 'v1.0',
      uploadedBy: by,
      budgetAmount: bud,
      timeline: timeline.trim() || '—',
      status: 'review',
      modalSubtitle: typeLabel,
      projectName: title,
      startDate: formatDateDisplay(uploadDate),
      auditTrail: [
        {
          title: 'Document Uploaded (v1.0)',
          by,
          date: dateStr,
        },
      ],
    }

    onCreated(doc)
    toast({
      title: t('common.success'),
      description: t('documentsApprovals.uploadSuccess'),
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('documentsApprovals.newUpload')}
      size="lg"
      className="max-w-lg bg-white sm:rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted-foreground">{t('documentsApprovals.newUploadHint')}</p>

        <FormInput
          label={t('documentsApprovals.documentProjectName')}
          placeholder={t('documentsApprovals.placeholderDocName')}
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          required
          className={cn(inputClass)}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('documentsApprovals.documentType')}</label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as DocumentCategoryFilter)}
          >
            <SelectTrigger className={cn(inputClass, 'w-full')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORY_FILTERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {t(categoryLabelKey(c))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label={t('documentsApprovals.uploadDate')}
            value={uploadDate}
            onChange={setUploadDate}
            className="[&_button]:rounded-lg [&_button]:bg-muted/40 [&_button]:border-gray-200/80 [&_button]:h-11"
          />
          <FormInput
            label={t('documentsApprovals.uploadedBy')}
            placeholder={t('documentsApprovals.placeholderUploader')}
            value={uploadedBy}
            onChange={(e) => setUploadedBy(e.target.value)}
            required
            className={cn(inputClass)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label={t('documentsApprovals.budget')}
            placeholder="880"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            inputMode="decimal"
            className={cn(inputClass)}
          />
          <FormInput
            label={t('common.timeline')}
            placeholder="12 months"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className={cn(inputClass)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('documentsApprovals.fileOptional')}</label>
          <input
            type="file"
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" className="rounded-lg" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('documentsApprovals.submitUpload')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
