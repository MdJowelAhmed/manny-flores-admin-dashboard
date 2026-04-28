import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

interface SendDocumentRequestModalProps {
  open: boolean
  onClose: () => void
}

export function SendDocumentRequestModal({ open, onClose }: SendDocumentRequestModalProps) {
  const { t } = useTranslation()
  const [userName, setUserName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    setUserName('')
    setFile(null)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !file) {
      toast({ title: t('common.error'), description: t('documentsApprovals.requestRequired'), variant: 'destructive' })
      return
    }
    await new Promise((r) => setTimeout(r, 350))
    toast({ title: t('common.success'), description: t('documentsApprovals.requestSent'), variant: 'success' })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('documentsApprovals.sendDocumentRequest')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="send-document-request-form" className="rounded-lg bg-primary hover:bg-primary/90 text-white">
            {t('common.submit')}
          </Button>
        </div>
      }
    >
      <form id="send-document-request-form" onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label={t('documentsApprovals.userName')}
          placeholder={t('projectScheduling.placeholderProjectName')}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
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
            <div className="text-xs text-muted-foreground mt-2">{t('documentsApprovals.fileHint')}</div>
          </label>
        </div>
      </form>
    </ModalWrapper>
  )
}

