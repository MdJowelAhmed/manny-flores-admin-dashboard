import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { CompanyPublicEstimateContent } from '@/pages/companyPublicEstimate/CompanyPublicEstimateContent'

interface BuilderProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  projectId: string | null
  onDecisionComplete?: () => void
}

export function BuilderProjectDetailsModal({
  open,
  onClose,
  projectId,
  onDecisionComplete,
}: BuilderProjectDetailsModalProps) {
  const { t } = useTranslation()

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('companyProjects.publicEstimate.previewTitle')}
      size="full"
      className="max-w-5xl bg-white"
    >
      {projectId ? (
        <CompanyPublicEstimateContent
          projectId={projectId}
          onDecisionComplete={onDecisionComplete}
        />
      ) : null}
    </ModalWrapper>
  )
}
