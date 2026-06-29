import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ESTIMATE_COMPANY } from '@/pages/Estimate/estimateData'
import { CompanyPublicEstimateContent } from './CompanyPublicEstimateContent'

export default function CompanyPublicEstimate() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
          <div className="px-6 pb-0 pt-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {t('companyProjects.publicEstimate.previewTitle')}
            </h1>
          </div>

          <div className="space-y-6 px-6 pb-6 pt-4">
            <CompanyPublicEstimateContent projectId={id ?? ''} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {ESTIMATE_COMPANY.name}.{' '}
          {t('common.allRightsReserved')}
        </p>
      </main>
    </div>
  )
}
