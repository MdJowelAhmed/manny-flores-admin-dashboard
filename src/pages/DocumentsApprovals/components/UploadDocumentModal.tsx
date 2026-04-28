import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { formatDateDisplay } from '@/utils/formatters'
import type { DocumentEntry } from '../documentsApprovalsData'

interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
  onCreated: (doc: DocumentEntry) => void
}

export function UploadDocumentModal({ open, onClose, onCreated }: UploadDocumentModalProps) {
  const { t } = useTranslation()
  const [projectName, setProjectName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    setProjectName('')
    setFile(null)
  }, [open])

  const hint = useMemo(() => t('documentsApprovals.fileHint'), [t])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = projectName.trim()
    if (!name || !file) {
      toast({ title: t('common.error'), description: t('documentsApprovals.uploadDocRequired'), variant: 'destructive' })
      return
    }

    const dateStr = formatDateDisplay(new Date())
    const doc: DocumentEntry = {
      id: `doc-${Date.now()}`,
      projectTitle: name,
      documentTypeLabel: t('documentsApprovals.uploadedDocumentLabel', { file: file.name }),
      documentCategory: 'project_documentation',
      uploadDate: dateStr,
      version: 'v1.0',
      uploadedBy: t('documentsApprovals.placeholderUploader'),
      budgetAmount: 0,
      timeline: '—',
      status: 'review',
      modalSubtitle: t('documentsApprovals.uploadDocument'),
      projectName: name,
      startDate: dateStr,
      auditTrail: [
        {
          title: t('documentsApprovals.auditUploaded'),
          by: t('documentsApprovals.placeholderUploader'),
          date: dateStr,
        },
      ],
    }
    onCreated(doc)
    toast({ title: t('common.success'), description: t('documentsApprovals.uploadSuccess'), variant: 'success' })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('documentsApprovals.uploadDocument')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="upload-document-form" className="rounded-lg bg-primary hover:bg-primary/90 text-white">
            {t('common.submit')}
          </Button>
        </div>
      }
    >
      <form id="upload-document-form" onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label={t('documentsApprovals.projectName')}
          placeholder={t('projectScheduling.placeholderProjectName')}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          className="rounded-lg bg-muted/20 border-gray-200/80 h-11"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('documentsApprovals.uploadDocument')}</label>
          <label
            className={cn(
              'block w-full rounded-xl border border-gray-200 bg-muted/10',
              'px-4 py-10 text-center cursor-pointer hover:bg-muted/20 transition-colors'
            )}
          >
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            />
            <div className="text-sm font-medium text-slate-800">
              {file ? file.name : t('documentsApprovals.uploadDocumentCta')}
            </div>
            <div className="text-xs text-muted-foreground mt-2">{hint}</div>
          </label>
        </div>
      </form>
    </ModalWrapper>
  )
}

