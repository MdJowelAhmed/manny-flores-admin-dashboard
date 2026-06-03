export interface DriverOption {
  id: string
  name: string
  phone?: string
}

/** One material line (same order shares one driver via MaterialOrderSubmitPayload) */
export interface MaterialOrderLineInput {
  materialId: string
  quantity: number
}

export interface MaterialOrderSubmitPayload {
  driverId: string
  lines: MaterialOrderLineInput[]
}

/** UI model aligned with `GET /materials` response fields. */
export interface Material {
  id: string
  materialName: string
  category: string
  categoryId: string
  unitPrice: number
  quantity: number
  stock: number
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export function getAvailableStock(m: Material): number {
  return Math.max(0, m.stock)
}

export const mockDrivers: DriverOption[] = [
  { id: 'drv-1', name: 'Marcus Reed', phone: '+1 555-0101' },
  { id: 'drv-2', name: 'Elena Vasquez', phone: '+1 555-0102' },
  { id: 'drv-3', name: 'James Porter', phone: '+1 555-0103' },
  { id: 'drv-4', name: 'Sarah Kim', phone: '+1 555-0104' },
]

/** Fallback catalog for estimate / invoice flows when API list is not wired. */
export const mockMaterialsData: Material[] = [
  {
    id: 'mat-1',
    materialName: 'Topsoil',
    category: 'Soil',
    categoryId: 'mc-soil',
    unitPrice: 5,
    quantity: 2,
    stock: 120,
  },
  {
    id: 'mat-2',
    materialName: 'Mulch',
    category: 'Soil',
    categoryId: 'mc-soil',
    unitPrice: 4,
    quantity: 5,
    stock: 85,
  },
]
