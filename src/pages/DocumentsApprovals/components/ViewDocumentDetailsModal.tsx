import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/common/Spinner.tsx'
import { imageUrl } from '@/redux/baseApi'

interface ViewDocumentDetailsModalProps {
  open: boolean
  onClose: () => void
  document: any | null
}

export function ViewDocumentDetailsModal({
  open,
  onClose,
  document: doc,
}: ViewDocumentDetailsModalProps) {
  const { t } = useTranslation()
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const docType = doc?.documentType?.toUpperCase() || ''
  const isPdf = docType === 'PDF' || doc?.documentUrl?.toLowerCase().endsWith('.pdf')
  const isImage = docType === 'IMAGE' || doc?.documentUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i)

  const fullDocUrl = doc?.documentUrl?.startsWith('http')
    ? doc.documentUrl
    : `${imageUrl}${doc?.documentUrl || ''}`

  useEffect(() => {
    if (!open || !doc || (!isPdf && !isImage)) {
      setPreviewBlobUrl(null)
      setPreviewError(null)
      return
    }

    let active = true
    let createdUrl: string | null = null

    const fetchPreview = async () => {
      setLoadingPreview(true)
      setPreviewError(null)
      try {
        const response = await fetch(fullDocUrl)
        if (!response.ok) {
          throw new Error(`Failed to load document (${response.status})`)
        }
        const blob = await response.blob()
        if (active) {
          const blobUrl = URL.createObjectURL(blob)
          createdUrl = blobUrl
          setPreviewBlobUrl(blobUrl)
        }
      } catch (err: any) {
        console.error('Error fetching preview blob:', err)
        if (active) {
          setPreviewError(err.message || 'Failed to generate preview')
        }
      } finally {
        if (active) {
          setLoadingPreview(false)
        }
      }
    }

    fetchPreview()

    return () => {
      active = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [open, doc, isPdf, isImage, fullDocUrl])

  if (!doc) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={doc.projectName || t('documentsApprovals.documentName') || 'Document Details'}
      size="xl"
      className="max-w-4xl bg-white"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
            {t('common.close')}
          </Button>
          <a
            href={fullDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Download className="h-4 w-4" />
            {t('documentsApprovals.fullReport') || 'Download'}
          </a>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Info summary */}
        <div className="bg-muted/10 p-4 rounded-xl border border-gray-100 space-y-2">
          <div className="flex justify-between text-sm py-1 border-b border-gray-100">
            <span className="text-muted-foreground">{t('documentsApprovals.projectName') || 'Name'}:</span>
            <span className="font-semibold text-slate-800">{doc.projectName}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">{t('documentsApprovals.documentType') || 'Type'}:</span>
            <span className="font-semibold text-slate-800">{doc.documentType || docType}</span>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Document Preview</h3>
          <div className="w-full flex items-center justify-center bg-slate-50 border rounded-xl overflow-hidden min-h-[300px]">
            {isPdf ? (
              loadingPreview ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-3 min-h-[300px]">
                  <Spinner />
                  <p className="text-sm text-muted-foreground">Loading PDF Preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="p-4 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100">
                    <FileText className="h-12 w-12" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Preview Not Available (Network Policy)</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      The PDF server is configured to prevent embedded loading in browser pages. Please click the **Download** button below to view the file.
                    </p>
                  </div>
                </div>
              ) : previewBlobUrl ? (
                <iframe
                  src={`${previewBlobUrl}#toolbar=0`}
                  title={doc.projectName}
                  className="w-full h-[500px] border-0"
                />
              ) : (
                <iframe
                  src={`${fullDocUrl}#toolbar=0`}
                  title={doc.projectName}
                  className="w-full h-[500px] border-0"
                />
              )
            ) : isImage ? (
              loadingPreview ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-3 min-h-[300px]">
                  <Spinner />
                  <p className="text-sm text-muted-foreground">Loading Image Preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="p-4 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100">
                    <FileText className="h-12 w-12" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Preview Not Available (Network Policy)</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      The image server is configured to prevent cross-origin loading. Please click the **Download** button below to view the file.
                    </p>
                  </div>
                </div>
              ) : previewBlobUrl ? (
                <img
                  src={previewBlobUrl}
                  alt={doc.projectName}
                  className="max-w-full max-h-[500px] object-contain p-2 rounded-lg"
                />
              ) : (
                <img
                  src={fullDocUrl}
                  alt={doc.projectName}
                  className="max-w-full max-h-[500px] object-contain p-2 rounded-lg"
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="p-4 rounded-full bg-slate-100">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Preview not available for document type {doc.documentType || 'DOCS'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please use the download button below to view the file contents.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

