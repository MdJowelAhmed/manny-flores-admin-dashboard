export interface ScheduledProject {
  id: string
  scheduledDate: string // e.g. "Feb 19, 2026"
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
  /** Profile image URLs for assigned crew */
  assignedAvatarUrls: string[]
}

export const mockScheduledProjects: ScheduledProject[] = [
  {
    id: 'sch-1',
    scheduledDate: 'Feb 19, 2026',
    projectTitle: 'Residential Backyard Renovation',
    category: 'Garden Design & Installation',
    project: 'Backyard Renovation',
    uploadDate: 'Feb 18, 2026',
    uploadedBy: 'John Davis',
    team: 'Team A',
    customer: 'John Davis',
    email: 'john@email.com',
    company: 'Garden Design & Installation',
    serviceLocation: '12 Maple Ave, Springfield',
    eta: '09:30 AM',
    assignedAvatarUrls: [
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=33',
      'https://i.pravatar.cc/150?img=47',
    ],
  },
  {
    id: 'sch-2',
    scheduledDate: 'Feb 25, 2026',
    projectTitle: 'Green Villa Project',
    category: 'Green Garden',
    project: 'Green Villa Project',
    uploadDate: 'Feb 28, 2026',
    uploadedBy: 'Jhon Lura',
    team: 'Team B',
    customer: 'Jhon Lura',
    email: 'jhon@email.com',
    company: 'Green Villa Inc',
    serviceLocation: '88 Oak Rd, Riverside',
    eta: '10:00 AM',
    assignedAvatarUrls: [
      'https://i.pravatar.cc/150?img=15',
      'https://i.pravatar.cc/150?img=27',
    ],
  },
  {
    id: 'sch-3',
    scheduledDate: 'Feb 25, 2026',
    projectTitle: 'Office Park Landscaping',
    category: 'Commercial Landscaping',
    project: 'Office Park',
    uploadDate: 'Feb 22, 2026',
    uploadedBy: 'Sarah Miller',
    team: 'Team A',
    customer: 'Sarah Miller',
    email: 'sarah@email.com',
    company: 'Office Park Corp',
    serviceLocation: '400 Commerce Blvd, Metro City',
    eta: '08:45 AM',
    assignedAvatarUrls: [
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=14',
      'https://i.pravatar.cc/150?img=60',
    ],
  },
]
