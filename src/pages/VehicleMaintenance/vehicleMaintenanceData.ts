import type { Vehicle, VehicleStatus } from '@/types'
import type { SelectOption } from '@/types'

export interface VehicleAssignedEmployeeItem {
  id: string
  name: string
  email?: string
  profile?: string
}

/** UI model aligned with `GET /vehicles` response fields. */
export interface VehicleListItem {
  id: string
  model: string
  year: number
  type: string
  categoryId: string
  category: string
  purchaseDate: string
  purchaseCost: number
  insuranceExpires: string
  maintenanceLastServiceDate?: string
  maintenanceNextServiceDate?: string
  assignEmployeeId?: string | null
  assignedEmployee?: VehicleAssignedEmployeeItem | null
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, { bg: string; text: string }> = {
  Available: { bg: 'bg-green-100', text: 'text-green-600' },
  'In Use': { bg: 'bg-blue-100', text: 'text-blue-600' },
  Maintenance: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

export const vehicleTypeOptions: SelectOption[] = [
  { value: 'pickup Truck', label: 'Pickup Truck' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
]

export const mockVehiclesData: Vehicle[] = [
  {
    id: 'v-1',
    vehicleName: 'Ford F-150 #45',
    category: 'Light Duty',
    type: 'Pickup Truck',
    assignedTo: 'Jhon Lura',
    usage: '120 km',
    nextService: 'Mar 15, 2025',
    status: 'Available',
    model: 'Ford F-150',
    year: '2023',
    purchaseDate: 'Jan 12, 2023',
    purchaseCost: '$587,874.000',
    insuranceExpiry: 'Dec 15, 2024',
    assignedEmployee: {
      name: 'Marcus Jhonson',
      project: 'Oak Ridge Estates',
      startDate: 'Mar 01, 2025',
      location: 'Site B - North Perimeter',
    },
    lastService: 'Mar 01, 2025',
  },
  {
    id: 'v-2',
    vehicleName: 'Ford F-150 #46',
    category: 'Light Duty',
    type: 'Pickup Truck',
    assignedTo: 'Sarah Smith',
    usage: '85 km',
    nextService: 'Apr 20, 2025',
    status: 'Available',
    model: 'Ford F-150',
    year: '2023',
    purchaseDate: 'Jan 12, 2023',
    purchaseCost: '$587,874.000',
    insuranceExpiry: 'Dec 15, 2024',
    assignedEmployee: {
      name: 'Sarah Smith',
      project: 'Oak Ridge Estates',
      startDate: 'Mar 01, 2025',
      location: 'Site A',
    },
    lastService: 'Mar 01, 2025',
  },
  {
    id: 'v-3',
    vehicleName: 'Chevy Silverado #12',
    category: 'Heavy Duty',
    type: 'Truck',
    assignedTo: 'Michael Brown',
    usage: '200 km',
    nextService: 'May 10, 2025',
    status: 'Available',
    model: 'Chevy Silverado',
    year: '2022',
    purchaseDate: 'Feb 15, 2022',
    purchaseCost: '$452,000.000',
    insuranceExpiry: 'Jun 15, 2025',
    assignedEmployee: {
      name: 'Michael Brown',
      project: 'Green Villa',
      startDate: 'Jan 15, 2025',
      location: 'Site C',
    },
    lastService: 'Feb 10, 2025',
  },
]
