export type ResourceRequestTab = 'materials' | 'equipment' | 'vehicles'

export interface MaterialRequestItem {
  id: string
  materialName: string
  material?: { name?: string }
  quantityNeeded: number
  urgencyLevel: string
  reason: string
  employeeId: string
  status: string
  createdAt: string
}

export interface EquipmentRequestItem {
  id: string
  equipmentName: string
  urgencyLevel: string
  reason: string
  employeeId: string
  status: string
  createdAt: string
}

export interface VehicleRequestItem {
  id: string
  vehicleType: string
  projectName: string
  urgencyLevel: string
  reason: string
  employeeId: string
  status: string
  createdAt: string
}

export type ViewableResourceRequest =
  | { tab: 'materials'; record: MaterialRequestItem }
  | { tab: 'equipment'; record: EquipmentRequestItem }
  | { tab: 'vehicles'; record: VehicleRequestItem }

export function isPendingResourceStatus(status: string) {
  return status?.toUpperCase() === 'PENDING'
}

export function formatUrgencyLevel(level: string) {
  const normalized = level?.toUpperCase()
  if (normalized === 'HIGH') return 'High'
  if (normalized === 'MEDIUM') return 'Medium'
  if (normalized === 'LOW') return 'Low'
  return level || '—'
}

export function isHighUrgency(level: string) {
  return level?.toUpperCase() === 'HIGH'
}
