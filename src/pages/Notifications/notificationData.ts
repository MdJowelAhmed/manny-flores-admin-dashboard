import type { Notification } from '@/types/notification'

export const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New project assignment',
    message: 'You have been assigned to the Downtown Office Renovation project.',
    timestamp: '2026-03-13T10:30:00Z',
    isRead: false,
  },
  {
    id: '2',
    title: 'Document approval required',
    message: 'Building permit document is pending your approval.',
    timestamp: '2026-03-13T09:15:00Z',
    isRead: false,
  },
  {
    id: '3',
    title: 'Meeting reminder',
    message: 'Team standup meeting starts in 30 minutes.',
    timestamp: '2026-03-13T08:45:00Z',
    isRead: false,
  },
  {
    id: '4',
    title: 'Budget update',
    message: 'Project budget has been updated. Review the changes.',
    timestamp: '2026-03-12T16:20:00Z',
    isRead: true,
  },
  {
    id: '5',
    title: 'Safety report submitted',
    message: 'Daily safety report has been submitted for March 12.',
    timestamp: '2026-03-12T14:00:00Z',
    isRead: true,
  },
]
