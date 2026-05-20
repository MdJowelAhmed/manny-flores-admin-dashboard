import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { sonnerToast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { useUploadDocumentMutation } from '@/redux/slices/super-admin/documentsApprovalApi'

interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function UploadDocumentModal({ open, onClose, onCreated }: UploadDocumentModalProps) {
  const { t } = useTranslation()
  const [projectName, setProjectName] = useState('')
  const [documentType, setDocumentType] = useState<string>('pdf')
  const [file, setFile] = useState<File | null>(null)
  
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation()

  useEffect(() => {
    if (!open) return
    setProjectName('')
    setDocumentType('pdf')
    setFile(null)
  }, [open])

  const hint = useMemo(() => t('documentsApprovals.fileHint'), [t])

  const documentTypeOptions = useMemo(() => [
    { value: 'image', label: 'Image' },
    { value: 'pdf', label: 'PDF' },
    { value: 'docs', label: 'Document (DOCS)' },
  ], [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      sonnerToast.error(t('documentsApprovals.uploadDocRequired') || 'Please choose a file to upload.')
      return
    }

    const formData = new FormData()
    if (projectName.trim()) {
      formData.append('projectName', projectName.trim())
    }
    formData.append('documentType', documentType)
    formData.append('documentUrl', file)

    const promise = uploadDocument(formData).unwrap()

    try {
      await sonnerToast.promise(promise, {
        loading: t('common.processing') || 'Uploading document...',
        success: t('documentsApprovals.uploadSuccess') || 'Document uploaded successfully!',
        error: (err: any) => err?.data?.message || 'Failed to upload document.',
      })
      onCreated()
      onClose()
    } catch (err) {
      console.error('Upload error:', err)
    }
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
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg" disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            form="upload-document-form" 
            className="rounded-lg bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? t('common.processing') : t('common.submit')}
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
              required
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


