import type { SelectOption } from '@/types'

export const USER_ROLES: SelectOption[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'editor', label: 'Editor' },
  { value: 'user', label: 'User' },
]

export const USER_STATUSES: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
]

export const PRODUCT_STATUSES: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export const CATEGORY_STATUSES: SelectOption[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-success/10', text: 'text-success' },
  blocked: { bg: 'bg-destructive/10', text: 'text-destructive' },
  pending: { bg: 'bg-warning/10', text: 'text-warning' },
  inactive: { bg: 'bg-muted', text: 'text-muted-foreground' },
  draft: { bg: 'bg-muted', text: 'text-muted-foreground' },
  out_of_stock: { bg: 'bg-destructive/10', text: 'text-destructive' },
  Pending: { bg: 'bg-orange-100', text: 'text-orange-800' },
  Completed: { bg: 'bg-green-100', text: 'text-green-800' },
  Failed: { bg: 'bg-red-100', text: 'text-red-800' },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-800' },
  Active: { bg: 'bg-orange-100', text: 'text-orange-800' },
}

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'bg-primary/10', text: 'text-primary' },
  moderator: { bg: 'bg-warning/10', text: 'text-warning' },
  editor: { bg: 'bg-success/10', text: 'text-success' },
  user: { bg: 'bg-muted', text: 'text-muted-foreground' },
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB












