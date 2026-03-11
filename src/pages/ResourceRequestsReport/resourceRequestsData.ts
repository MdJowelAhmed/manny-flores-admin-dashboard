export type ResourceCategory = 'Vehicle' | 'Material' | 'Equipment'
export type UrgencyLevel = 'High' | 'Medium' | 'Low'
export type RequestStatus = 'Approved' | 'Pending' | 'Rejected'

export interface ResourceRequest {
  id: string
  requestId: string
  resource: ResourceCategory
  type: string
  project: string
  urgency: UrgencyLevel
  status: RequestStatus
  equipmentName?: string
  reason?: string
  attachments?: string[]
}

export interface ResourceReport {
  id: string
  date: string
  reportedBy: string
  item: string
  type: string
  category: ResourceCategory
  urgency: UrgencyLevel
  status: string
}

export const RESOURCE_COLORS: Record<ResourceCategory, { text: string; bg: string }> = {
  Vehicle: { text: 'text-cyan-600', bg: 'bg-cyan-50' },
  Material: { text: 'text-purple-600', bg: 'bg-purple-50' },
  Equipment: { text: 'text-amber-600', bg: 'bg-amber-50' },
}

export const mockResourceRequests: ResourceRequest[] = [
  {
    id: 'rr-1',
    requestId: '#187653',
    resource: 'Vehicle',
    type: 'Pickup',
    project: 'Green Villa',
    urgency: 'High',
    status: 'Approved',
    equipmentName: 'Ford F-150',
    reason: 'Lose Connection',
    attachments: ['https://picsum.photos/120/80?random=1', 'https://picsum.photos/120/80?random=2'],
  },
  {
    id: 'rr-2',
    requestId: '#187653',
    resource: 'Material',
    type: 'Pickup',
    project: 'Green Villa',
    urgency: 'High',
    status: 'Approved',
    equipmentName: 'Steel Beams',
    reason: 'Construction materials',
  },
  {
    id: 'rr-3',
    requestId: '#187653',
    resource: 'Equipment',
    type: 'Pickup',
    project: 'Green Villa',
    urgency: 'High',
    status: 'Approved',
    equipmentName: 'Ford F-150',
    reason: 'Lose Connection',
    attachments: ['https://picsum.photos/120/80?random=3', 'https://picsum.photos/120/80?random=4'],
  },
  {
    id: 'rr-4',
    requestId: '#187653',
    resource: 'Vehicle',
    type: 'Pick',
    project: 'Green Villa',
    urgency: 'High',
    status: 'Approved',
  },
  {
    id: 'rr-5',
    requestId: '#187653',
    resource: 'Material',
    type: 'Pickup',
    project: 'Green Villa',
    urgency: 'High',
    status: 'Approved',
  },
  {
    id: 'rr-6',
    requestId: '#187653',
    resource: 'Equipment',
    type: 'Pickup',
    project: 'Green Villa',
    urgency: 'High',
    status: 'Approved',
  },
]

export const mockResourceReports: ResourceReport[] = [
  {
    id: 'rp-1',
    date: '24 October, 2025',
    reportedBy: 'Jhon lura',
    item: 'Fuel',
    type: 'Oil Leak',
    category: 'Vehicle',
    urgency: 'High',
    status: 'Reviewed',
  },
  {
    id: 'rp-2',
    date: '24 October, 2025',
    reportedBy: 'Jhon lura',
    item: 'Cement',
    type: 'Damaged',
    category: 'Material',
    urgency: 'High',
    status: 'Reviewed',
  },
  {
    id: 'rp-3',
    date: '24 October, 2025',
    reportedBy: 'Jhon lura',
    item: 'Excavator',
    type: 'Maintenance',
    category: 'Equipment',
    urgency: 'High',
    status: 'Reviewed',
  },
]
