
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { CompanyPublicEstimateContent } from '@/pages/companyPublicEstimate/CompanyPublicEstimateContent'

interface BuilderProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  projectId: string | null
  onDecisionComplete?: () => void
  readOnly?: boolean
  showShareLink?: boolean
}

export function BuilderProjectDetailsModal({
  open,
  onClose,
  projectId,
  onDecisionComplete,
  readOnly = false,
  // showShareLink = false,
}: BuilderProjectDetailsModalProps) {
  const { t } = useTranslation()

  // const handleCopyApprovalLink = async () => {
  //   if (!projectId) return
  //   const url = `${window.location.origin}/company-estimate/${projectId}`
  //   try {
  //     await navigator.clipboard.writeText(url)
  //     toast.success(t('companyProjects.publicEstimate.shareLinkCopied'))
  //   } catch {
  //     toast.error(t('common.error'))
  //   }
  // }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('companyProjects.publicEstimate.previewTitle')}
      size="full"
      className="max-w-5xl bg-white"
      // footer={
      //   showShareLink ? (
      //     <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      //       <Button
      //         type="button"
      //         variant="outline"
      //         onClick={handleCopyApprovalLink}
      //         className="h-11 px-4"
      //       >
      //         <Link2 className="mr-2 h-4 w-4" />
      //         {t('companyProjects.publicEstimate.shareLink')}
      //       </Button>
      //       <Button
      //         onClick={onClose}
      //         className="h-11 bg-primary px-8 text-white hover:bg-primary/90"
      //       >
      //         {t('common.close')}
      //       </Button>
      //     </div>
      //   ) : undefined
      // }
    >
      {projectId ? (
        <CompanyPublicEstimateContent
          projectId={projectId}
          onDecisionComplete={onDecisionComplete}
          readOnly={readOnly}
        />
      ) : null}
    </ModalWrapper>
  )
}
