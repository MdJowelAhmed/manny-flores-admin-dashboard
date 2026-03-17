import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewProjectFinanceModal } from './components/ViewProjectFinanceModal'
import { AddEditProjectFinanceModal } from './components/AddEditProjectFinanceModal'
import {
  financeStats,
  mockFinanceProjects,
  projectStatusFilterOptions,
} from './customerFinanceData'
import type { Project, ProjectStatus } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export default function CustomerFinance() {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<Project[]>(mockFinanceProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const handleViewDetails = (p: Project) => {
    setSelectedProject(p)
    setIsViewModalOpen(true)
  }

  const handleEdit = (p: Project, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedProject(p)
    setIsAddEditModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedProject(null)
    setIsAddEditModalOpen(true)
  }

  const handleSave = (data: Partial<Project>) => {
    if (selectedProject?.id) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? {
                ...p,
                ...data,
                remaining: (data.totalBudget ?? p.totalBudget) - (data.amountSpent ?? p.amountSpent),
              }
            : p
        )
      )
    } else {
      const total = data.totalBudget ?? 0
      const spent = data.amountSpent ?? 0
      const newProject: Project = {
        id: `cf-${Date.now()}`,
        projectName: data.projectName ?? '',
        category: data.category ?? 'General',
        customer: data.customer ?? '',
        email: data.email ?? '',
        company: data.company ?? '',
        startDate: data.startDate ?? '',
        totalBudget: total,
        amountSpent: spent,
        duration: data.duration ?? '0 weeks',
        remaining: total - spent,
        paymentMethod: data.paymentMethod ?? 'Cash',
        status: (data.status as ProjectStatus) ?? 'Active',
        amountDue: data.amountDue ?? total - spent,
        description: data.description,
      }
      setProjects((prev) => [newProject, ...prev])
    }
    setIsAddEditModalOpen(false)
    setSelectedProject(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Finance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {financeStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t(stat.titleKey)}</p>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    {formatCurrency(stat.value)}
                  </h3>
                </div>
                <div className={cn('p-2.5 rounded-full', stat.iconBg)}>
                  <Icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Project Status */}
      <div>
        <div className="flex flex-row items-center justify-between gap-4 pb-4">
          <h2 className="text-lg font-bold text-accent">{t('customerFinance.projectStatus')}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('customerFinance.searchCustomer')}
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] bg-primary text-white hover:bg-primary/90 border-0">
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                <SelectValue placeholder={t('customerFinance.filter')} />
              </SelectTrigger>
              <SelectContent>
                {projectStatusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('customerFinance.addProject')}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {t('customerFinance.noProjectsFound')}
            </div>
          ) : (
            filteredProjects.map((p) => {
              const paidPercent =
                p.totalBudget > 0 ? Math.round((p.amountSpent / p.totalBudget) * 100) : 0
              const isCompleted = p.status === 'Completed'
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-accent">{p.customer}</h4>
                        <p className="text-sm text-muted-foreground">{p.projectName}</p>
                      </div>
                      <span
                        className={cn(
                          'px-3 py-1 rounded text-xs font-medium shrink-0',
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                      <div>
                        <span className="text-xs text-muted-foreground block">{t('customerFinance.totalAmount')}</span>
                        <span className="text-sm font-bold">{formatCurrency(p.totalBudget)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">{t('customerFinance.paid')}</span>
                        <span className="text-sm font-medium text-emerald-600">
                          {formatCurrency(p.amountSpent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">{t('customerFinance.balance')}</span>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            p.remaining > 0 ? 'text-amber-600' : 'text-emerald-600'
                          )}
                        >
                          {formatCurrency(p.remaining)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">{t('customerFinance.paymentMethod')}</span>
                        <span className="text-sm font-medium">{p.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-10 mt-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${paidPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0">
                        {t('customerFinance.percentPaid', { percent: paidPercent })}
                      </span>


                      <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleEdit(p, e)}
                      className="bg-secondary-foreground text-accent hover:bg-secondary-foreground/90 px-8 lg:px-10"
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(p)}
                      className="bg-secondary-foreground text-accent hover:bg-secondary-foreground/90 "
                    >
                      {t('customerFinance.viewDetails')}
                    </Button>
                  </div>
                    </div>


                  </div>
                 
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      <ViewProjectFinanceModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />

      <AddEditProjectFinanceModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        onSave={handleSave}
      />
    </motion.div>
  )
}
