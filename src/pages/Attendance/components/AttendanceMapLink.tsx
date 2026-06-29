import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getGoogleMapsUrl,
  hasValidCoordinates,
} from '../attendanceData'

interface AttendanceMapLinkProps {
  latitude?: number | null
  longitude?: number | null
}

export function AttendanceMapLink({ latitude, longitude }: AttendanceMapLinkProps) {
  const { t } = useTranslation()

  if (!hasValidCoordinates(latitude, longitude)) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  const url = getGoogleMapsUrl(latitude!, longitude!)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
    >
      <MapPin className="h-4 w-4 shrink-0" />
      {t('attendance.viewMap')}
    </a>
  )
}
