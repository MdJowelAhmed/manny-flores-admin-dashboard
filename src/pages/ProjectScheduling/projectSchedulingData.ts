import type { EstimateProjectStatus } from '@/pages/Estimate/estimateData'

export interface AssignedEmployee {
  id: string
  name: string
  email?: string
  profileUrl: string | null
}

export interface ScheduledProject {
  id: string
  estimateId: string
  status: string
  projectStatus: EstimateProjectStatus
  scheduledDate: string
  estimateStartDate: string
  estimateEndDate: string
  projectTitle: string
  category: string
  project: string
  uploadDate: string
  uploadedBy: string
  team: string
  customer: string
  email: string
  company: string
  serviceLocation: string
  eta: string
  assignedAvatarUrls: string[]
  assignedEmployeeIds: string[]
  assignedEmployees: AssignedEmployee[]
}
