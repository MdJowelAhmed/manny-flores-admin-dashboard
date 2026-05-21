import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { sonnerToast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { useUpdateDocumentMutation } from '@/redux/slices/super-admin/documentsApprovalApi'

interface EditDocumentModalProps {
  open: boolean
  onClose: () => void
  documentsRefetch: () => void
  document: any | null
}

export function EditDocumentModal({ open, onClose, documentsRefetch, document: doc }: EditDocumentModalProps) {
  const { t } = useTranslation()
  const [projectName, setProjectName] = useState('')
  const [documentType, setDocumentType] = useState<string>('pdf')
  const [file, setFile] = useState<File | null>(null)

  const [updateDocument, { isLoading }] = useUpdateDocumentMutation()

  useEffect(() => {
    if (!open || !doc) return
    setProjectName(doc.projectName || '')
    setDocumentType(doc.documentType?.toLowerCase() || 'pdf')
    setFile(null)
  }, [open, doc])

  const hint = useMemo(() => t('documentsApprovals.fileHint'), [t])

  const documentTypeOptions = useMemo(() => [
    { value: 'image', label: 'Image' },
    { value: 'pdf', label: 'PDF' },
    { value: 'docs', label: 'Document (DOCS)' },
  ], [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!doc) return

    const formData = new FormData()
    formData.append('projectName', projectName.trim())
    formData.append('documentType', documentType)

    if (file) {
      formData.append('documentUrl', file)
    } else if (doc.documentUrl) {
      formData.append('documentUrl', doc.documentUrl)
    }

    const promise = updateDocument({ id: doc.id, data: formData }).unwrap()

    try {
      sonnerToast.promise(promise, {
        loading: t('common.processing') || 'Updating document...',
        success: () => {
          documentsRefetch()
          onClose()
          return t('common.updated') || 'Document updated successfully!'
        },
        error: (err: any) => err?.data?.message || 'Failed to update document.',
      })
    } catch (err) {
      console.error('Update error:', err)
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('common.edit') || 'Edit Document'}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg" disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="edit-document-form"
            className="rounded-lg bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? t('common.processing') : t('common.saveChanges')}
          </Button>
        </div>
      }
    >
      <form id="edit-document-form" onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label={t('documentsApprovals.projectName')}
          placeholder={t('projectScheduling.placeholderProjectName')}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          className="rounded-lg bg-muted/20 border-gray-200/80 h-11"
        />

        <FormSelect
          label={t('documentsApprovals.documentType') || 'Document Type'}
          value={documentType}
          options={documentTypeOptions}
          onChange={(val) => setDocumentType(val)}
          required
          className="w-full"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t('documentsApprovals.uploadDocument')} ({t('common.optional') || 'optional new file'})
          </label>
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
