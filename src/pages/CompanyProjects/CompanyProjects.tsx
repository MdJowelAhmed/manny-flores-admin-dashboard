import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, SlidersHorizontal } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { projectStats, mockProjectsData, projectStatusFilterOptions } from './companyProjectsData'
import { ViewProjectDetailsModal } from './components/ViewProjectDetailsModal'
import { AddEditProjectModal } from './components/AddEditProjectModal'
import type { Project, ProjectStatus } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { STATUS_COLORS } from '@/utils/constants'
import { useTranslation } from 'react-i18next'

export default function CompanyProjects() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get('search') ?? ''
  const statusFilter = searchParams.get('status') ?? 'all'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const setSearch = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v ? next.set('search', v) : next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setStatus = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v && v !== 'all' ? next.set('status', v) : next.delete('status')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>(mockProjectsData)

  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter((p) => p.status === 'Active').length
    const pending = projects.filter((p) => p.status === 'Pending').length
    const completed = projects.filter((p) => p.status === 'Completed').length
    return { total, active, pending, completed }
  }, [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProjects.slice(start, start + itemsPerPage)
  }, [filteredProjects, currentPage, itemsPerPage])

  const handleStatusFilterChange = (value: string) => {
    setStatus(value)
  }
  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleAddProject = () => {
    setSelectedProject(null)
    setIsAddModalOpen(true)
  }

  const handleSaveProject = (data: Partial<Project>) => {
    if (selectedProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === selectedProject.id
            ? { ...p, ...data, remaining: (data.totalBudget ?? p.totalBudget) - (data.amountSpent ?? p.amountSpent) }
            : p
        )
      )
    } else {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        projectName: data.projectName ?? '',
        category: data.category ?? 'General',
        customer: data.customer ?? '',
        email: data.email ?? '',
        company: data.company ?? '',
        startDate: data.startDate ?? '',
        totalBudget: data.totalBudget ?? 0,
        amountSpent: data.amountSpent ?? 0,
        duration: data.duration ?? '0 weeks',
        remaining: data.remaining ?? 0,
        paymentMethod: data.paymentMethod,
        status: (data.status as ProjectStatus) ?? 'Active',
        amountDue: data.amountDue,
        description: data.description,
      }
      setProjects((prev) => [newProject, ...prev])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectStats.map((stat, index) => {
          const Icon = stat.icon
          const value =
            stat.titleKey === 'companyProjects.totalProject'
              ? stats.total
              : stat.titleKey === 'companyProjects.activeProject'
                ? stats.active
                : stat.titleKey === 'companyProjects.pendingProject'
                  ? stats.pending
                  : stats.completed
          return (
            <motion.div
              key={stat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl px-6 py-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-medium text-muted-foreground">{t(stat.titleKey)}</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className={cn('p-3 rounded-lg', stat.iconBgColor)}>
                  <Icon className={cn('h-8 w-8', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Project Status Section */}
      <div className=" border-0 ">
        <div className="flex flex-row items-center justify-between pb-6">
          <h2 className="text-xl font-bold text-accent">{t('companyProjects.projectStatus')}</h2>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('companyProjects.searchProject')}
              className="w-[280px] bg-white"
              debounceMs={150}
            />
          
            <div className="w-[120px]">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full bg-primary text-white hover:bg-primary/90">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('companyProjects.filter')} />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddProject}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('companyProjects.addProject')}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">{t('companyProjects.noProjectsFound')}</div>
          ) : (
            paginatedProjects.map((project) => {
              const statusColors = STATUS_COLORS[project.status] ?? { bg: 'bg-gray-100', text: 'text-gray-800' }
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg shadow-sm bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-accent truncate">{project.projectName}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{project.category}</p>
                    <div className="flex flex-wrap gap-4 mt-5">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground block">{t('companyProjects.budget')}</span>
                        <span className=" font-bold text-accent">
                          {formatCurrency(project.totalBudget)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground block">{t('companyProjects.timeline')}</span>
                        <span className=" font-bold text-accent ">{project.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end  justify-between h-full  gap-10">
                    <div
                      className={cn(
                        'px-4 py-2 rounded-sm text-xs font-semibold bg-[#FF383C1A]',
                      
                        statusColors.text
                      )}
                    >
                      {project.status}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleEdit(project, e)}
                        className="bg-[#FF383C1A] border   text-accent"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleViewDetails(project)}
                        className="text-sm  bg-[#FF383C1A] border text-accent"
                      >
                        {t('companyProjects.viewDetails')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}

          {/* Pagination */}
          {filteredProjects.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProjects.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewProjectDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />

      <AddEditProjectModal
        open={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedProject(null)
        }}
        project={isEditModalOpen ? selectedProject : null}
        onSave={handleSaveProject}
      />
    </motion.div>
  )
}
