import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter, Pencil, FilterIcon, SlidersHorizontal } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
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

export default function CompanyProjects() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>(mockProjectsData)

  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter((p) => p.status === 'Active').length
    const pending = projects.filter((p) => p.status === 'Pending').length
    return { total, active, pending }
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
            stat.title === 'Total Project'
              ? stats.total
              : stat.title === 'Active Project'
                ? stats.active
                : stats.pending
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl px-6 py-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-medium text-muted-foreground">{stat.title}</p>
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
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-accent">Project Status</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search project...."
              className="w-[280px] bg-white"
            />
            <Button
              onClick={handleAddProject}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
            <div className="w-[120px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-primary text-white hover:bg-primary/90">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {/* <SlidersHorizontal /> */}
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-6">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No projects found</div>
          ) : (
            filteredProjects.map((project) => {
              const statusColors = STATUS_COLORS[project.status] ?? { bg: 'bg-gray-100', text: 'text-gray-800' }
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg shadow-sm bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-accent truncate">{project.projectName}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{project.category}</p>
                    <div className="flex flex-wrap gap-4 mt-5">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground block">Budget</span>
                        <span className=" font-bold text-accent">
                          {formatCurrency(project.totalBudget)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-muted-foreground block">Timeline</span>
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
                        Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleViewDetails(project)}
                        className="text-sm  bg-[#FF383C1A] border text-accent"
                      >
                        View details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })
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
