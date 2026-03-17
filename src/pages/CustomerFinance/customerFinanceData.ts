import { DollarSign, CreditCard, Wallet, TrendingUp } from 'lucide-react'
import type { Project, } from '@/types'

export const financeStats = [
  { titleKey: 'customerFinance.totalRevenue' as const, value: 542300, icon: DollarSign, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { titleKey: 'customerFinance.cashPayments' as const, value: 186500, icon: CreditCard, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { titleKey: 'customerFinance.financedAmount' as const, value: 355800, icon: Wallet, iconBg: 'bg-purple-200', iconColor: 'text-purple-700' },
  { titleKey: 'customerFinance.pendingPayments' as const, value: 42100, icon: TrendingUp, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
]

export const projectStatusFilterOptions = [
  { value: 'all', labelKey: 'customerFinance.allStatus' as const },
  { value: 'Active', labelKey: 'common.active' as const },
  { value: 'Completed', labelKey: 'dashboard.completed' as const },
  { value: 'Pending', labelKey: 'dashboard.pending' as const },
]

export const paymentMethodOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Financing', label: 'Financing' },
  { value: 'Card', label: 'Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
]



export const mockFinanceProjects: Project[] = [
  {
    id: 'cf-1',
    projectName: 'Lawn Care Package',
    category: 'Lawn Care',
    customer: 'Mike Johnson',
    email: 'mike@email.com',
    company: 'GreenScape Pro-Main',
    startDate: 'January 15, 2026',
    totalBudget: 75000,
    amountSpent: 75000,
    duration: '8 weeks',
    remaining: 0,
    paymentMethod: 'Cash',
    status: 'Completed',
    amountDue: 0,
    description:
      'Complete lawn care package including mowing, edging, fertilization, and seasonal cleanup.',
  },
  {
    id: 'cf-2',
    projectName: 'Office Park Landscaping',
    category: 'Commercial',
    customer: 'ABC Corporation',
    email: 'contact@abc.com',
    company: 'ABC Corporation',
    startDate: 'February 1, 2026',
    totalBudget: 55000,
    amountSpent: 25000,
    duration: '12 weeks',
    remaining: 30000,
    paymentMethod: 'Cash',
    status: 'Active',
    amountDue: 30000,
    description: 'Commercial landscaping for office park entrance and common areas.',
  },
  {
    id: 'cf-3',
    projectName: 'Garden Design & Installation',
    category: 'Residential',
    customer: 'John Smith',
    email: 'john@email.com',
    company: 'Residential Backyard Renovation',
    startDate: 'January 20, 2026',
    totalBudget: 45000,
    amountSpent: 30000,
    duration: '8 weeks',
    remaining: 15000,
    paymentMethod: 'Financing',
    status: 'Active',
    amountDue: 15000,
    description:
      'Complete backyard transformation including patio installation, garden beds, and irrigation.',
  },
]
