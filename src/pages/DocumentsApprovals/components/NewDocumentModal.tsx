import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { formatDateDisplay } from '@/utils/formatters'
import type { DocumentEntry } from '../documentsApprovalsData'

interface NewDocumentModalProps {
  open: boolean
  onClose: () => void
  onCreated: (doc: DocumentEntry) => void
}

export function NewDocumentModal({ open, onClose, onCreated }: NewDocumentModalProps) {
  const { t } = useTranslation()
  const [projectName, setProjectName] = useState('')
  const [uploadDate, setUploadDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    setProjectName('')
    setUploadDate(new Date())
  }, [open])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const name = projectName.trim()
    if (!name || !uploadDate) {
      toast({ title: t('common.error'), description: t('documentsApprovals.newDocRequired'), variant: 'destructive' })
      return
    }

    const dateStr = formatDateDisplay(uploadDate)
    const doc: DocumentEntry = {
      id: `doc-${Date.now()}`,
      projectTitle: name,
      documentTypeLabel: t('documentsApprovals.defaultDocType'),
      documentCategory: 'project_documentation',
      uploadDate: dateStr,
      version: 'v2.1',
      uploadedBy: t('documentsApprovals.placeholderUploader'),
      budgetAmount: 0,
      timeline: '—',
      status: 'review',
      modalSubtitle: t('documentsApprovals.defaultDocType'),
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
    toast({ title: t('common.success'), description: t('documentsApprovals.newDocCreated'), variant: 'success' })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('documentsApprovals.newDocument')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="new-document-form" className="rounded-lg bg-primary hover:bg-primary/90 text-white">
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <form id="new-document-form" onSubmit={handleSave} className="space-y-4">
        <FormInput
          label={t('documentsApprovals.projectName')}
          placeholder={t('projectScheduling.placeholderProjectName')}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          className="rounded-lg bg-muted/20 border-gray-200/80 h-11"
        />
        <DatePicker
          label={t('documentsApprovals.uploadDate')}
          value={uploadDate}
          onChange={setUploadDate}
          className="[&_button]:rounded-lg [&_button]:bg-muted/20 [&_button]:border-gray-200/80 [&_button]:h-11"
        />
      </form>
    </ModalWrapper>
  )
}

