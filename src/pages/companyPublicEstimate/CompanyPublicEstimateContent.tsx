import { useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CheckCircle2, Download, ExternalLink, FileText, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  dataUrlToSignatureFile,
  useGetSinglePublicCompanyProjectQuery,
  useSubmitCompanyProjectDecisionMutation,
} from '@/redux/api/companyProjectApi'
import { imageUrl, imageUrlAbsolute } from '@/components/common/getImageUrl'
import { ESTIMATE_COMPANY } from '@/pages/Estimate/estimateData'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { getProjectDuration } from '@/pages/CompanyProjects/CompanyProjects'
import {
  companyProjectStatusBadgeVariant,
  formatCompanyProjectStatusLabel,
  normalizeCompanyProjectStatus,
} from './companyPublicEstimateUtils'
import Spinner from '@/components/common/Spinner'
import { generateInvoicePdf } from '@/pages/Invoice/invoicePdf'

type DecisionMode = 'idle' | 'approving' | 'rejecting'

function safeFormatSignedDate(iso?: string): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'dd/MM/yyyy')
  } catch {
    return iso
  }
}

interface CompanyPublicEstimateContentProps {
  projectId: string
  onDecisionComplete?: () => void
  /** Admin view: same layout, no approve/reject actions */
  readOnly?: boolean
}

export function CompanyPublicEstimateContent({
  projectId,
  onDecisionComplete,
  readOnly = false,
}: CompanyPublicEstimateContentProps) {
  const { t } = useTranslation()

  const { data: projectResponse, isLoading, isError, refetch } =
    useGetSinglePublicCompanyProjectQuery(projectId, { skip: !projectId })
  const [submitDecision, { isLoading: isSubmitting }] =
    useSubmitCompanyProjectDecisionMutation()

  const doc = projectResponse?.data

  const projectStatus = normalizeCompanyProjectStatus(doc?.projectStatus)
  const statusLabel = formatCompanyProjectStatusLabel(projectStatus)
  const signatureUrl = doc?.signatures ?? undefined
  const isApproved =
    !!signatureUrl ||
    projectStatus === 'IN_PROGRESS' ||
    projectStatus === 'ACTIVE' ||
    projectStatus === 'COMPLETED'
  const isRejected = projectStatus === 'CANCELLED'
  const isPending = projectStatus === 'PENDING'
  const showDecisionSection = !readOnly && isPending && !isApproved && !isRejected

  const [mode, setMode] = useState<DecisionMode>('idle')

  const approvedAtIso = doc?.updatedAt
  const approvedAtStr = useMemo(
    () => (isApproved ? safeFormatSignedDate(approvedAtIso) : ''),
    [isApproved, approvedAtIso]
  )

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const printableRef = useRef<HTMLDivElement | null>(null)
  const drawingRef = useRef(false)
  const [sigDataUrl, setSigDataUrl] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setSigDataUrl('')
    setMode('idle')
  }, [projectId])

  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const nextW = Math.max(1, Math.floor(rect.width * dpr))
    const nextH = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width === nextW && canvas.height === nextH) return
    canvas.width = nextW
    canvas.height = nextH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.lineWidth = 2.2 * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111827'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    if (mode !== 'approving') return
    resizeCanvas()
    const onResize = () => resizeCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mode])

  const getPoint = (e: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / Math.max(1, rect.width)
    const scaleY = canvas.height / Math.max(1, rect.height)
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const beginDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawingRef.current = true
    canvas.setPointerCapture(e.pointerId)
    const p = getPoint(e.nativeEvent, canvas)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const p = getPoint(e.nativeEvent, canvas)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const endDraw = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      setSigDataUrl(canvas.toDataURL('image/png'))
    } catch {
      // ignore
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setSigDataUrl('')
  }

  const handleApprove = async () => {
    if (!sigDataUrl || !projectId || !doc) return
    try {
      await submitDecision({
        id: projectId,
        projectStatus: 'IN_PROGRESS',
        signatureFile: dataUrlToSignatureFile(sigDataUrl),
      }).unwrap()
      await refetch()
      onDecisionComplete?.()
      toast.success(t('companyProjects.publicEstimate.approveSuccess'))
      setMode('idle')
    } catch {
      toast.error(t('companyProjects.publicEstimate.approveError'))
    }
  }

  const handleReject = async () => {
    if (!projectId || !doc) return
    try {
      await submitDecision({
        id: projectId,
        projectStatus: 'CANCELLED',
      }).unwrap()
      await refetch()
      onDecisionComplete?.()
      toast.success(t('companyProjects.publicEstimate.rejectSuccess'))
      setMode('idle')
    } catch {
      toast.error(t('companyProjects.publicEstimate.rejectError'))
    }
  }

  const handleDownloadPdf = async () => {
    if (!printableRef.current || !doc) return
    const safeName =
      (doc.projectName || 'estimate')
        .replace(/[^a-z0-9-_]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'estimate'
    const fileName = `company-estimate-${safeName}.pdf`

    setIsDownloading(true)
    try {
      await generateInvoicePdf(printableRef.current, fileName, 'download')
      toast.success(t('companyProjects.publicEstimate.downloadSuccess'))
    } catch {
      toast.error(t('companyProjects.publicEstimate.downloadError'))
    } finally {
      setIsDownloading(false)
    }
  }

  const documentation = doc?.documentation ?? []

  if (!projectId) {
    return (
      <div className="py-12 text-center text-sm text-red-600">
        {t('companyProjects.publicEstimate.invalidLink')}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (isError || !doc) {
    return (
      <div className="py-12 text-center text-sm text-red-600">
        {t('companyProjects.publicEstimate.loadError')}
      </div>
    )
  }

  const downloadButton = (
    <Button
      type="button"
      variant="outline"
      className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
      onClick={handleDownloadPdf}
      disabled={isDownloading || isSubmitting}
    >
      {isDownloading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {t('companyProjects.publicEstimate.downloadPdf')}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div ref={printableRef} className="space-y-6 bg-white p-1 text-gray-900">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
              <img
                src="/image3.svg"
                alt={ESTIMATE_COMPANY.name}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-gray-900">
                {ESTIMATE_COMPANY.name}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">{ESTIMATE_COMPANY.tagline}</p>
            </div>
          </div>
          <div className="space-y-0.5 pl-[52px] text-xs leading-relaxed text-gray-500">
            <p>{ESTIMATE_COMPANY.address}</p>
            <p>
              {ESTIMATE_COMPANY.phone} · {ESTIMATE_COMPANY.email}
            </p>
          </div>
        </div>

        <div className="space-y-1 sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            {t('companyProjects.publicEstimate.preparedFor')}
          </p>
          <p className="text-base font-bold text-gray-900">
            {doc.companyName || doc.projectName}
          </p>
          <p className="text-sm text-gray-500">
            {doc.builder?.email || doc.customerEmail || '—'}
          </p>
          <p className="pt-2 text-sm font-medium text-gray-700">{doc.projectName}</p>
          <p className="text-sm text-gray-500">
            {t('companyProjects.timeline')}: {getProjectDuration(doc.startDate, doc.endDate)}
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Badge variant={companyProjectStatusBadgeVariant(projectStatus)}>
              {statusLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="px-5 py-3.5 text-gray-500">{t('companyProjects.startDate')}</td>
              <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                {formatDate(doc.startDate)}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-5 py-3.5 text-gray-500">{t('companyProjects.endDate')}</td>
              <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                {formatDate(doc.endDate)}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-5 py-3.5 text-gray-500">{t('companyProjects.paymentMethod')}</td>
              <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                {doc.paymentMethod}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-5 py-3.5 text-gray-500">{t('companyProjects.totalAmount')}</td>
              <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                {formatCurrency(doc.totalBudget)}
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="px-5 py-3.5 text-gray-500">{t('companyProjects.payAmount')}</td>
              <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                {formatCurrency(doc.payAmount ?? 0)}
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3.5 font-semibold text-gray-900">
                {t('companyProjects.amountDue')}
              </td>
              <td className="px-5 py-3.5 text-right text-base font-bold text-[#22c55e]">
                {formatCurrency(doc.amountDue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {doc.description ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('companyProjects.projectDescription')}
          </p>
          <p className="mt-2 text-sm text-gray-700">{doc.description}</p>
        </div>
      ) : null}

      {documentation.length > 0 ? (
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">
            {t('companyProjects.projectDocuments')}
          </p>
          <ul className="mt-3 space-y-2">
            {documentation.map((filePath, index) => {
              const fileName = filePath.split('/').pop() || `Document ${index + 1}`
              return (
                <li key={`${filePath}-${index}`}>
                  <a
                    href={imageUrlAbsolute(filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {fileName}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {isApproved ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              {t('companyProjects.publicEstimate.approvedTitle')}
            </p>
            {approvedAtStr ? (
              <span className="text-xs font-medium text-green-700">
                {t('companyProjects.publicEstimate.signedOn')} {approvedAtStr}
              </span>
            ) : null}
          </div>
          {signatureUrl ? (
            <div className="mt-3 rounded-lg border border-green-200 bg-white p-4">
              <img
                src={imageUrl(signatureUrl)}
                alt={t('companyProjects.publicEstimate.signature')}
                className="mx-auto max-h-28 w-full object-contain"
              />
            </div>
          ) : null}
        </div>
      ) : isRejected ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-800">
            <XCircle className="h-4 w-4" />
            {t('companyProjects.publicEstimate.rejectedTitle')}
          </p>
        </div>
      ) : null}
      </div>

      {readOnly || isApproved || isRejected ? (
        <div className="flex justify-end">{downloadButton}</div>
      ) : showDecisionSection ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          {mode === 'idle' ? (
            <>
              <p className="text-sm font-semibold text-gray-900">
                {t('companyProjects.publicEstimate.reviewDecisionTitle')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {t('companyProjects.publicEstimate.reviewDecisionHint')}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                {downloadButton}
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg border-red-200 bg-white px-6 font-semibold text-red-600 hover:bg-red-50"
                  onClick={() => setMode('rejecting')}
                  disabled={isSubmitting || isDownloading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('companyProjects.publicEstimate.rejectProject')}
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
                  onClick={() => setMode('approving')}
                  disabled={isSubmitting || isDownloading}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('companyProjects.publicEstimate.approveProject')}
                </Button>
              </div>
            </>
          ) : mode === 'approving' ? (
            <>
              <p className="text-sm font-semibold text-gray-900">
                {t('companyProjects.publicEstimate.signature')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {t('companyProjects.publicEstimate.signatureHint')}
              </p>
              <div className="mt-3 rounded-lg border border-gray-200 bg-white">
                <canvas
                  ref={canvasRef}
                  className="block h-28 w-full touch-none rounded-lg"
                  onPointerDown={beginDraw}
                  onPointerMove={draw}
                  onPointerUp={endDraw}
                  onPointerCancel={endDraw}
                  aria-label={t('companyProjects.publicEstimate.signature')}
                />
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={clearSignature}
                  disabled={isSubmitting}
                >
                  {t('companyProjects.publicEstimate.clearSignature')}
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-lg text-gray-600"
                    onClick={() => {
                      setMode('idle')
                      clearSignature()
                    }}
                    disabled={isSubmitting}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="button"
                    className="h-10 rounded-lg bg-[#22c55e] px-6 font-semibold text-white hover:bg-[#16a34a]"
                    disabled={!sigDataUrl || isSubmitting}
                    onClick={handleApprove}
                  >
                    {isSubmitting
                      ? t('common.submitting')
                      : t('companyProjects.publicEstimate.confirmApprove')}
                  </Button>
                </div>
              </div>
              {!sigDataUrl ? (
                <p className="mt-2 text-xs text-gray-500">
                  {t('companyProjects.publicEstimate.signatureRequired')}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900">
                {t('companyProjects.publicEstimate.rejectConfirmTitle')}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {t('companyProjects.publicEstimate.rejectConfirmHint')}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-lg text-gray-600"
                  onClick={() => setMode('idle')}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  className="h-10 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-700"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t('common.submitting')
                    : t('companyProjects.publicEstimate.confirmReject')}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
