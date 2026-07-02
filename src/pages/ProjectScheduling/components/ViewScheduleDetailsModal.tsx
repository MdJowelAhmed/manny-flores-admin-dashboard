import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { formatDateDisplay } from '@/utils/formatters'
import {
  ESTIMATE_COMPANY,
  getProjectStatusClasses,
} from '@/pages/Estimate/estimateData'
import type { ScheduledProject } from '../projectSchedulingData'

interface ViewScheduleDetailsModalProps {
  open: boolean
  onClose: () => void
  schedule: ScheduledProject | null
}

function formatIsoDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return formatDateDisplay(d)
}

function initialsFromName(name: string): string {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export function ViewScheduleDetailsModal({
  open,
  onClose,
  schedule,
}: ViewScheduleDetailsModalProps) {
  const { t } = useTranslation()
  const [signatureFailed, setSignatureFailed] = useState(false)

  if (!schedule) return null

  const statusStyle = getProjectStatusClasses(schedule.projectStatus)
  const hasCustomerInfo = !!(
    schedule.customer ||
    schedule.email ||
    schedule.serviceLocation
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projectScheduling.viewDetails')}
      size="full"
      className="max-w-4xl bg-white"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      }
    >
      <div className="space-y-8 text-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white">
              <img src={'/logo3.png'} alt="logo" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <p className="text-xl font-bold">{ESTIMATE_COMPANY.name}</p>
              <p className="text-sm text-gray-500">{ESTIMATE_COMPANY.tagline}</p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {ESTIMATE_COMPANY.address}
                <br />
                {ESTIMATE_COMPANY.phone} · {ESTIMATE_COMPANY.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            {hasCustomerInfo && (
              <>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t('projectScheduling.customerInformation')}
                </p>
                {schedule.customer && (
                  <p className="text-lg font-bold">{schedule.customer}</p>
                )}
                {schedule.email && (
                  <p className="text-sm text-gray-500">{schedule.email}</p>
                )}
                {schedule.serviceLocation && (
                  <p className="mt-1 text-sm text-gray-500 max-w-xs">
                    {schedule.serviceLocation}
                  </p>
                )}
              </>
            )}
            <p className={cn('text-sm text-gray-600', hasCustomerInfo && 'mt-3')}>
              <span className="font-medium">{schedule.projectTitle || '—'}</span>
            </p>
            <p className="text-xs text-gray-500">
              {formatIsoDate(schedule.estimateStartDate)} —{' '}
              {formatIsoDate(schedule.estimateEndDate)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-emerald-50/90 px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">
              {t('projectScheduling.projectInformation')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 px-4 py-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t('projectScheduling.projectName')}
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {schedule.projectTitle || '—'}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t('projectScheduling.status')}
              </p>
              <p
                className={cn(
                  'mt-1 inline-flex items-center gap-1.5 text-sm font-medium',
                  statusStyle.text
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', statusStyle.dot)} />
                {t(`estimate.projectStatus.${schedule.projectStatus}`)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t('projectScheduling.startDate')}
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {formatIsoDate(schedule.estimateStartDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t('projectScheduling.endDate')}
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {formatIsoDate(schedule.estimateEndDate)}
              </p>
            </div>
            {schedule.serviceLocation && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('projectScheduling.serviceLocation')}
                </p>
                <p className="mt-1 font-medium text-gray-900">
                  {schedule.serviceLocation}
                </p>
              </div>
            )}
            {schedule.description?.trim() && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {t('estimate.form.description')}
                </p>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {schedule.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-emerald-50/90 px-4 py-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">
              {t('projectScheduling.assignedEmployees')}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              {schedule.assignedEmployees.length}
            </span>
          </div>
          {schedule.assignedEmployees.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              {t('projectScheduling.noEmployeesAssigned')}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {schedule.assignedEmployees.map((emp) => (
                <li key={emp.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    {emp.profileUrl ? (
                      <AvatarImage src={emp.profileUrl} alt={emp.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {initialsFromName(emp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {emp.name}
                    </p>
                    {emp.email && (
                      <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {schedule.customerSignature && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium uppercase text-gray-500 mb-2">
              {t('projectScheduling.customerSignature')}
            </p>
            <div className="inline-flex h-28 min-w-[12rem] max-w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white px-3">
              {signatureFailed ? (
                <span className="text-xs text-gray-400 italic">
                  {t('projectScheduling.signatureLoadError')}
                </span>
              ) : (
                <img
                  src={schedule.customerSignature}
                  alt={t('projectScheduling.customerSignature')}
                  className="max-h-full max-w-full object-contain"
                  onError={() => setSignatureFailed(true)}
                />
              )}
            </div>
            {schedule.signedAt && (
              <p className="mt-2 text-xs text-gray-500">
                {t('estimate.preview.signedOn', {
                  date: new Date(schedule.signedAt).toLocaleString(),
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}
