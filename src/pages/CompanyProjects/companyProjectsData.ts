import { Monitor, FileText,  CheckCircle, Circle } from 'lucide-react'
import type { Project } from '@/types'

// Stats for the top section - titleKey is used for i18n
export const projectStats = [
  {
    titleKey: 'companyProjects.totalProject' as const,
    value: 27,
    icon: Monitor,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    titleKey: 'companyProjects.activeProject' as const,
    value: 21,
    icon: FileText,
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    titleKey: 'companyProjects.pendingProject' as const,
    value: 6,
    icon: Circle,
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    titleKey: 'companyProjects.completedProject' as const,
    value: 10,
    icon: CheckCircle,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
]

// Filter options for project status - labelKey is used for i18n
export const projectStatusFilterOptions = [
  { value: 'all', labelKey: 'companyProjects.allStatus' as const },
  { value: 'Active', labelKey: 'common.active' as const },
  { value: 'Completed', labelKey: 'dashboard.completed' as const },
  { value: 'Pending', labelKey: 'dashboard.pending' as const },
]

// Payment method options for edit form
export const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Check', label: 'Check' },
  { value: 'Online', label: 'Online' },
]

// Mock projects data
export const mockProjectsData: Project[] = [
  {
    id: 'proj-001',
    projectName: 'Residential Backyard Renovation',
    category: 'Garden Design & Installation',
    customer: 'John Smith',
    email: 'john.smith@email.com',
    company: 'GreenScape Pro - Main',
    startDate: 'January 15, 2026',
    totalBudget: 45000,
    amountSpent: 28500,
    duration: '8 weeks',
    remaining: 16500,
    paymentMethod: 'Cash',
    status: 'Active',
    amountDue: 16500,
    description:
      'Complete backyard transformation including patio installation, garden beds, irrigation system, and landscape lighting. Customer wants a modern outdoor living space with low-maintenance plants.',
  },
  {
    id: 'proj-002',
    projectName: 'Commercial Office Interior',
    category: 'Interior Design',
    customer: 'Sarah Johnson',
    email: 'sarah.j@corp.com',
    company: 'Metro Builders Inc',
    startDate: 'February 1, 2026',
    totalBudget: 125000,
    amountSpent: 85000,
    duration: '12 weeks',
    remaining: 40000,
    paymentMethod: 'Bank Transfer',
    status: 'Active',
    amountDue: 40000,
    description:
      'Full office interior redesign with modern furniture, lighting systems, and collaborative workspaces.',
  },
  {
    id: 'proj-003',
    projectName: 'Kitchen Remodel',
    category: 'Home Renovation',
    customer: 'Michael Brown',
    email: 'mbrown@email.com',
    company: 'Dream Homes LLC',
    startDate: 'December 10, 2025',
    totalBudget: 35000,
    amountSpent: 35000,
    duration: '6 weeks',
    remaining: 0,
    paymentMethod: 'Card',
    status: 'Completed',
    amountDue: 0,
    description:
      'Complete kitchen remodel with new cabinets, countertops, and appliances.',
  },
  {
    id: 'proj-004',
    projectName: 'Parking Lot Paving',
    category: 'Commercial Landscaping',
    customer: 'Lisa Anderson',
    email: 'lisa@retailcorp.com',
    company: 'Retail Solutions Co',
    startDate: 'March 15, 2026',
    totalBudget: 78000,
    amountSpent: 0,
    duration: '4 weeks',
    remaining: 78000,
    paymentMethod: 'Check',
    status: 'Pending',
    amountDue: 78000,
    description:
      'New asphalt paving for 200-space parking lot with proper drainage and striping.',
  },
  {
    id: 'proj-005',
    projectName: 'Pool & Spa Installation',
    category: 'Outdoor Living',
    customer: 'Robert Williams',
    email: 'rwilliams@email.com',
    company: 'Elite Properties',
    startDate: 'January 20, 2026',
    totalBudget: 92000,
    amountSpent: 52000,
    duration: '10 weeks',
    remaining: 40000,
    paymentMethod: 'Bank Transfer',
    status: 'Active',
    amountDue: 20000,
    description:
      'In-ground pool with spa, waterfall feature, and surrounding deck area.',
  },
]
