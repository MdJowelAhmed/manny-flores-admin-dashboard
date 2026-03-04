import type { NotificationType } from '@/types'

export const NOTIFICATION_TYPES: { value: NotificationType; label: string }[] = [
  { value: 'Promotion', label: 'Promotion' },
  { value: 'Order Update', label: 'Order Update' },
  { value: 'Announcement', label: 'Announcement' },
  { value: 'Reminder', label: 'Reminder' },
]
