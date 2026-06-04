import { mockMaterialsData } from '@/pages/ManageMaterials/manageMaterialsData'
import { mockEquipmentData } from '@/pages/EquipmentMaintenance/equipmentMaintenanceData'
import { mockVehiclesData } from '@/pages/VehicleMaintenance/vehicleMaintenanceData'

export type EstimateStatus = 'pending' | 'reviewed' | 'signed'

export type EstimateProjectStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'COMPLETED_REQUESTED'
  | 'SCHEDULED'
  | 'CANCELLED'

export const ESTIMATE_PROJECT_STATUSES: EstimateProjectStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'COMPLETED_REQUESTED',
  'SCHEDULED',
  'CANCELLED',
]

export function normalizeProjectStatus(value?: string): EstimateProjectStatus {
  const upper = (value ?? 'PENDING').toUpperCase()
  if (ESTIMATE_PROJECT_STATUSES.includes(upper as EstimateProjectStatus)) {
    return upper as EstimateProjectStatus
  }
  return 'PENDING'
}

export function getProjectStatusClasses(status: EstimateProjectStatus): {
  text: string
  dot: string
} {
  switch (status) {
    case 'PENDING':
      return { text: 'text-orange-500', dot: 'bg-orange-500' }
    case 'IN_PROGRESS':
      return { text: 'text-blue-600', dot: 'bg-blue-500' }
    case 'COMPLETED':
      return { text: 'text-emerald-600', dot: 'bg-emerald-500' }
    case 'COMPLETED_REQUESTED':
      return { text: 'text-amber-700', dot: 'bg-amber-500' }
    case 'SCHEDULED':
      return { text: 'text-violet-600', dot: 'bg-violet-500' }
    case 'CANCELLED':
      return { text: 'text-red-600', dot: 'bg-red-500' }
    default:
      return { text: 'text-gray-500', dot: 'bg-gray-400' }
  }
}

export type EstimateLineType = 'material' | 'equipment' | 'vehicle' | 'custom'

export interface EstimateCatalogOption {
  id: string
  name: string
  unitPrice: number
}

export interface EstimateLineItem {
  id: string
  name: string
  lineType?: EstimateLineType
  materialId?: string
  equipmentId?: string
  vehicleId?: string
  quantity: number
  unitPrice: number
  /** Line total from API (`totalPrice`) when available */
  lineTotal?: number
}

/** Default day rate when equipment has no project rate in admin */
export const ESTIMATE_EQUIPMENT_DAY_RATE = 85

/** Default day rate when vehicle has no project rate in admin */
export const ESTIMATE_VEHICLE_DAY_RATE = 120

export interface EstimateDiscount {
  label: string
  percent: number
}

export interface EstimateRecord {
  id: string
  title: string
  customerName: string
  customerEmail: string
  customerAddress: string
  location: string
  paymentMethod: string
  description: string
  status: EstimateStatus
  projectStatus: EstimateProjectStatus
  lineItems: EstimateLineItem[]
  taxPercent: number
  discount: EstimateDiscount | null
  signedAt?: string
  signatureDataUrl?: string
  invoiceRef?: string
  /** Duration in days (`totalDate` from API). */
  totalDays?: number
  grandTotal?: number
  createdAt?: string
  updatedAt?: string
  createdAtDisplay?: string
  updatedAtDisplay?: string
}

/** @deprecated Use EstimateRecord */
export type EstimateListItem = EstimateRecord

export const ESTIMATE_COMPANY = {
  name: 'Manny Flores Landscaping',
  tagline: 'Professional landscape design & installation',
  address: '1248 Oak Ridge Lane, Beverly Hills, CA 90210',
  phone: '(310) 555-0142',
  email: 'hello@mannyflores.com',
  website: 'www.mannyflores.com',
} as const

/** Common services + admin materials for autocomplete */
export const ESTIMATE_SERVICE_SUGGESTIONS = [
  'Artificial turf installation',
  'Artificial turf',
  'Sod installation',
  'Landscape design — front yard',
  'Irrigation labor',
  'Mulch bed preparation',
  'Tree pruning',
  'Hardscape patio',
  'Retaining wall',
  'Drainage correction',
  'Seasonal cleanup',
  'Lawn mowing service',
] as const

export function getEstimateMaterialCatalog(): EstimateCatalogOption[] {
  return mockMaterialsData.map((m) => ({
    id: m.id,
    name: m.materialName,
    unitPrice: m.unitPrice || 0,
  }))
}

export function getEstimateEquipmentCatalog(): EstimateCatalogOption[] {
  return mockEquipmentData.map((eq) => ({
    id: eq.id,
    name: eq.equipmentName,
    unitPrice: ESTIMATE_EQUIPMENT_DAY_RATE,
  }))
}

export function getEstimateVehicleCatalog(): EstimateCatalogOption[] {
  return mockVehiclesData.map((v) => ({
    id: v.id,
    name: v.vehicleName,
    unitPrice: ESTIMATE_VEHICLE_DAY_RATE,
  }))
}

export function getEstimateItemSuggestions(): string[] {
  const fromMaterials = mockMaterialsData.map((m) => m.materialName.trim()).filter(Boolean)
  const fromEquipment = mockEquipmentData.map((e) => e.equipmentName.trim()).filter(Boolean)
  const fromVehicles = mockVehiclesData.map((v) => v.vehicleName.trim()).filter(Boolean)
  const set = new Set<string>([
    ...ESTIMATE_SERVICE_SUGGESTIONS,
    ...fromMaterials,
    ...fromEquipment,
    ...fromVehicles,
  ])
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function computeEstimateTotals(
  input: Pick<EstimateRecord, 'lineItems' | 'taxPercent' | 'discount'>
) {
  const subtotal = input.lineItems.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0)
  const discountPercent = input.discount?.percent ?? 0
  const discountAmount = subtotal * (Math.min(100, Math.max(0, discountPercent)) / 100)
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxPercent = Math.min(100, Math.max(0, input.taxPercent))
  const taxAmount = afterDiscount * (taxPercent / 100)
  const balanceDue = afterDiscount + taxAmount
  return { subtotal, discountAmount, afterDiscount, taxAmount, balanceDue }
}

export const MOCK_ESTIMATE_ITEMS: EstimateRecord[] = [
  {
    id: 'est-1',
    title: 'Tree Plantation',
    customerName: 'Startech BD',
    customerEmail: 'contact@startech.bd',
    customerAddress: '123 Riverside Drive',
    totalDays: 12,
    location: '123 Riverside Drive',
    paymentMethod: 'Paypal',
    description:
      'Complete lawn mowing for Section A, edge trimming along walkways, and debris removal.',
    status: 'pending',
    projectStatus: 'PENDING',
    lineItems: [
      { id: 'li-1', name: 'Topsoil', materialId: 'mat-1', quantity: 40, unitPrice: 10 },
      { id: 'li-2', name: 'Labor — planting', quantity: 8, unitPrice: 65 },
    ],
    taxPercent: 8.25,
    discount: null,
  },
  {
    id: 'est-2',
    title: 'Artificial Turf — Backyard',
    customerName: 'Startech BD',
    customerEmail: 'contact@startech.bd',
    customerAddress: '123 Riverside Drive, Park Section A',
    totalDays: 12,
    location: '123 Riverside Drive, Park Section A',
    paymentMethod: 'Google pay',
    description: 'Artificial turf install with edging and infill.',
    status: 'signed',
    projectStatus: 'IN_PROGRESS',
    lineItems: [
      { id: 'li-3', name: 'Artificial turf installation', quantity: 900, unitPrice: 8.5 },
      { id: 'li-4', name: 'Mulch', materialId: 'mat-2', quantity: 20, unitPrice: 8 },
    ],
    taxPercent: 8.25,
    discount: { label: 'First Responder Discount', percent: 5 },
    signedAt: '2026-02-10T14:00:00.000Z',
    invoiceRef: '#INV-2026-412',
  },
  {
    id: 'est-3',
    title: 'Landscape Section B',
    customerName: 'Green Valley LLC',
    customerEmail: 'ops@greenvalley.com',
    customerAddress: '88 Oak Street, North Wing',
    totalDays: 14,
    location: '88 Oak Street, North Wing',
    paymentMethod: 'Bank transfer',
    description: 'Soil preparation, mulching, and seasonal planting.',
    status: 'pending',
    projectStatus: 'PENDING',
    lineItems: [{ id: 'li-5', name: 'Mulch bed preparation', quantity: 1, unitPrice: 2400 }],
    taxPercent: 8.25,
    discount: null,
  },
  {
    id: 'est-4',
    title: 'Irrigation System Check',
    customerName: 'AquaFlow Inc.',
    customerEmail: 'service@aquaflow.com',
    customerAddress: '200 Garden Plaza, Lot 4',
    totalDays: 3,
    location: '200 Garden Plaza, Lot 4',
    paymentMethod: 'Card',
    description: 'Inspect drip lines and controller zones.',
    status: 'reviewed',
    projectStatus: 'IN_PROGRESS',
    lineItems: [{ id: 'li-6', name: 'Irrigation labor', quantity: 6, unitPrice: 85 }],
    taxPercent: 10,
    discount: null,
  },
  {
    id: 'est-5',
    title: 'Tree Pruning — Main Avenue',
    customerName: 'Urban Parks Dept',
    customerEmail: 'parks@city.gov',
    customerAddress: 'Main Avenue, Blocks 12–14',
    totalDays: 11,
    location: 'Main Avenue, Blocks 12–14',
    paymentMethod: 'Paypal',
    description: 'Safety pruning and disposal of cuttings.',
    status: 'pending',
    projectStatus: 'SCHEDULED',
    lineItems: [{ id: 'li-7', name: 'Tree pruning', quantity: 1, unitPrice: 3200 }],
    taxPercent: 8.25,
    discount: null,
  },
  {
    id: 'est-6',
    title: 'Seasonal Mulching',
    customerName: 'Oak Ridge HOA',
    customerEmail: 'board@oakridgehoa.org',
    customerAddress: '450 Cedar Lane',
    totalDays: 5,
    location: '450 Cedar Lane',
    paymentMethod: 'Google pay',
    description: 'Spread organic mulch in designated beds.',
    status: 'reviewed',
    projectStatus: 'COMPLETED',
    lineItems: [{ id: 'li-8', name: 'Mulch', materialId: 'mat-2', quantity: 60, unitPrice: 8 }],
    taxPercent: 8.25,
    discount: { label: 'HOA member discount', percent: 3 },
  },
]
