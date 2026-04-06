export type DocumentTrailStatus = 'review' | 'signing' | 'approved' | 'rejected'

export type DocumentCategoryFilter =
  | 'customer_contract'
  | 'financial_loan'
  | 'project_documentation'

export interface AuditTrailEntry {
  title: string
  by: string
  date: string
}

export interface DocumentEntry {
  id: string
  /** Table / modal title */
  projectTitle: string
  /** e.g. Customer Contract — used in subtitle */
  documentTypeLabel: string
  documentCategory: DocumentCategoryFilter
  uploadDate: string
  version: string
  uploadedBy: string
  budgetAmount: number
  timeline: string
  status: DocumentTrailStatus
  /** Modal subtitle under title */
  modalSubtitle: string
  projectName: string
  startDate: string
  auditTrail: AuditTrailEntry[]
}

export const DOCUMENT_CATEGORY_FILTERS: DocumentCategoryFilter[] = [
  'customer_contract',
  'financial_loan',
  'project_documentation',
]

/** Select filter options — same pattern as Company Projects */
export const documentCategoryFilterOptions = [
  { value: 'all', labelKey: 'documentsApprovals.filterAll' as const },
  {
    value: 'customer_contract',
    labelKey: 'documentsApprovals.filterCategories.customer_contract' as const,
  },
  {
    value: 'financial_loan',
    labelKey: 'documentsApprovals.filterCategories.financial_loan' as const,
  },
  {
    value: 'project_documentation',
    labelKey: 'documentsApprovals.filterCategories.project_documentation' as const,
  },
] as const

export const mockDocumentsData: DocumentEntry[] = [
  {
    id: 'doc-1',
    projectTitle: 'Residential Backyard Renovation',
    documentTypeLabel: 'Customer Contract',
    documentCategory: 'customer_contract',
    uploadDate: 'Feb 18, 2026',
    version: 'v2.1',
    uploadedBy: 'Mike Ross',
    budgetAmount: 880,
    timeline: '12 months',
    status: 'review',
    modalSubtitle: 'Customer Contract',
    projectName: 'Residential Backyard Renovation',
    startDate: 'January 15, 2026',
    auditTrail: [
      {
        title: 'Document Uploaded (v2.1)',
        by: 'Mike Ross',
        date: 'Feb 10, 2026',
      },
    ],
  },
  {
    id: 'doc-2',
    projectTitle: 'Permit: Springfield North Utility',
    documentTypeLabel: 'Project Documentation',
    documentCategory: 'project_documentation',
    uploadDate: 'Feb 12, 2026',
    version: 'v3.0',
    uploadedBy: 'Mike Ross',
    budgetAmount: 500,
    timeline: '6 months',
    status: 'approved',
    modalSubtitle: 'Project Documentation',
    projectName: 'Springfield North Utility',
    startDate: 'January 15, 2026',
    auditTrail: [
      {
        title: 'Document Uploaded (v2.1)',
        by: 'Mike Ross',
        date: 'Feb 10, 2026',
      },
      {
        title: 'Version updated (v3.0)',
        by: 'Mike Ross',
        date: 'Feb 12, 2026',
      },
    ],
  },
  {
    id: 'doc-3',
    projectTitle: 'Office Park Financing',
    documentTypeLabel: 'Financial/Loan Docs',
    documentCategory: 'financial_loan',
    uploadDate: 'Feb 8, 2026',
    version: 'v1.0',
    uploadedBy: 'Sarah Miller',
    budgetAmount: 125000,
    timeline: '18 months',
    status: 'signing',
    modalSubtitle: 'Financial/Loan Docs',
    projectName: 'Office Park Financing',
    startDate: 'Feb 1, 2026',
    auditTrail: [
      {
        title: 'Document Uploaded (v1.0)',
        by: 'Sarah Miller',
        date: 'Feb 5, 2026',
      },
    ],
  },
  {
    id: 'doc-4',
    projectTitle: 'Warehouse Floor Coating',
    documentTypeLabel: 'Customer Contract',
    documentCategory: 'customer_contract',
    uploadDate: 'Feb 5, 2026',
    version: 'v1.2',
    uploadedBy: 'Tom Wilson',
    budgetAmount: 3500,
    timeline: '2 months',
    status: 'approved',
    modalSubtitle: 'Customer Contract',
    projectName: 'Warehouse Floor Coating',
    startDate: 'Jan 28, 2026',
    auditTrail: [
      {
        title: 'Document Uploaded (v1.2)',
        by: 'Tom Wilson',
        date: 'Feb 1, 2026',
      },
    ],
  },
]
