import type { Equipment, EquipmentStatus } from '@/types'
import type { SelectOption } from '@/types'

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentStatus, { bg: string; text: string }> = {
  Available: { bg: 'bg-green-100', text: 'text-green-600' },
  'In Use': { bg: 'bg-blue-100', text: 'text-blue-600' },
  Maintenance: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

export const equipmentCategoryOptions: SelectOption[] = [
  { value: 'Small Tool', label: 'Small Tool' },
  { value: 'Heavy Machinery', label: 'Heavy Machinery' },
  { value: 'Power Tool', label: 'Power Tool' },
  { value: 'Hand Tool', label: 'Hand Tool' },
]

export const mockEquipmentData: Equipment[] = [
  {
    id: 'eq-1',
    equipmentName: 'Lawn Cutter',
    type: 'Small Tool',
    assignedTo: 'Jhon Lura',
    usage: '2,567 hrs',
    nextService: 'Mar 15, 2025',
    status: 'Available',
    model: 'Hitachi ZX200',
    category: 'Heavy Machinery',
    purchaseDate: 'Jan 12, 2023',
    purchaseCost: '$587,874.000',
    warrantyExpiry: 'Dec 15, 2024',
    assignedEmployee: {
      name: 'Marcus Jhonson',
      project: 'Oak Ridge Estates',
      startDate: 'Mar 01, 2025',
      location: 'Site B - North Perimeter',
    },
    lastService: 'Mar 01, 2025',
  },
  {
    id: 'eq-2',
    equipmentName: 'Lawn Cutter',
    type: 'Small Tool',
    assignedTo: 'Sarah Smith',
    usage: '1,890 hrs',
    nextService: 'Apr 20, 2025',
    status: 'In Use',
    model: 'Hitachi ZX200',
    category: 'Heavy Machinery',
    purchaseDate: 'Jan 12, 2023',
    purchaseCost: '$587,874.000',
    warrantyExpiry: 'Dec 15, 2024',
    assignedEmployee: {
      name: 'Sarah Smith',
      project: 'Oak Ridge Estates',
      startDate: 'Mar 01, 2025',
      location: 'Site A',
    },
    lastService: 'Mar 01, 2025',
  },
]
