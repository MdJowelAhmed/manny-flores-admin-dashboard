export interface JobAllocationRow {
  id: string
  projectName: string
  qty: number
  totalCost: number
  status: string
  date: string
}

export interface Material {
  id: string
  materialName: string
  category: string
  unit: string
  /** Total stock on hand */
  currentStock: number
  /** Amount reserved for active jobs */
  allocated: number
  supplier: string
  /** Cost / unit price (internal) */
  costPrice: number
  /** Rate charged per unit on projects */
  projectRate: number
  assignedProject: string
  unitPrice: number
  minimumStock: number
  supplierEmail: string
  supplierContact: string
  lastPurchaseDate: string
  assignedProjects: string[]
  jobAllocations: JobAllocationRow[]
}

export function getAvailableStock(m: Material): number {
  return Math.max(0, m.currentStock - m.allocated)
}

export function getStockStatus(
  m: Material
): 'low' | 'healthy' {
  const avail = getAvailableStock(m)
  return avail <= m.minimumStock ? 'low' : 'healthy'
}

export const MATERIAL_CATEGORIES = ['Soil', 'Raw Material', 'Building', 'Other'] as const

export const mockMaterialsData: Material[] = [
  {
    id: 'mat-1',
    materialName: 'Topsoil',
    category: 'Soil',
    unit: 'bag',
    currentStock: 120,
    allocated: 30,
    supplier: 'Agro Co.',
    costPrice: 5,
    projectRate: 10,
    assignedProject: 'Garden Design & Installation',
    unitPrice: 5,
    minimumStock: 2,
    supplierEmail: 'agro@mail.com',
    supplierContact: '+2847 4387 2389',
    lastPurchaseDate: '10 Feb, 2025',
    assignedProjects: [
      'Garden Design & Installation',
      'Garden Design & Installation',
    ],
    jobAllocations: [
      {
        id: 'job-1',
        projectName: 'Garden Design & Installation',
        qty: 120,
        totalCost: 500,
        status: 'Delivered',
        date: '20-12-2025',
      },
      {
        id: 'job-2',
        projectName: 'Garden Design & Installation',
        qty: 120,
        totalCost: 500,
        status: 'Delivered',
        date: '20-12-2025',
      },
    ],
  },
  {
    id: 'mat-2',
    materialName: 'Mulch',
    category: 'Soil',
    unit: 'bag',
    currentStock: 85,
    allocated: 40,
    supplier: 'Landscape Supply',
    costPrice: 4,
    projectRate: 8,
    assignedProject: 'Garden Design',
    unitPrice: 8,
    minimumStock: 5,
    supplierEmail: 'landscape@mail.com',
    supplierContact: '+2847 4387 2390',
    lastPurchaseDate: '15 Jan, 2025',
    assignedProjects: ['Garden Design'],
    jobAllocations: [
      {
        id: 'job-3',
        projectName: 'Garden Design',
        qty: 40,
        totalCost: 320,
        status: 'Delivered',
        date: '18-12-2025',
      },
    ],
  },
  {
    id: 'mat-3',
    materialName: 'Concrete Mix',
    category: 'Raw Material',
    unit: 'kg',
    currentStock: 500,
    allocated: 200,
    supplier: 'BuildCo',
    costPrice: 0.15,
    projectRate: 0.25,
    assignedProject: 'Patio Installation',
    unitPrice: 0.2,
    minimumStock: 100,
    supplierEmail: 'buildco@mail.com',
    supplierContact: '+2847 4387 2400',
    lastPurchaseDate: '20 Feb, 2025',
    assignedProjects: ['Patio Installation'],
    jobAllocations: [
      {
        id: 'job-4',
        projectName: 'Patio Installation',
        qty: 200,
        totalCost: 50,
        status: 'In transit',
        date: '22-12-2025',
      },
    ],
  },
  {
    id: 'mat-4',
    materialName: 'Pea Gravel',
    category: 'Raw Material',
    unit: 'bag',
    currentStock: 18,
    allocated: 12,
    supplier: 'Stone Yard',
    costPrice: 9,
    projectRate: 15,
    assignedProject: 'Driveway Project',
    unitPrice: 9,
    minimumStock: 8,
    supplierEmail: 'stone@mail.com',
    supplierContact: '+2847 4387 2410',
    lastPurchaseDate: '01 Mar, 2025',
    assignedProjects: ['Driveway Project'],
    jobAllocations: [
      {
        id: 'job-5',
        projectName: 'Driveway Project',
        qty: 12,
        totalCost: 180,
        status: 'Pending',
        date: '05-01-2026',
      },
    ],
  },
]
