import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmployeeSummaryCard } from '@/pages/EmployeeManagement/components/EmployeeSummaryCard'
import { BuilderTable } from './components/BuilderTable'
import { ViewBuilderDetailsModal } from './components/ViewBuilderDetailsModal'
import { AddEditBuilderModal } from './components/AddEditBuilderModal'
import { builderStats } from './builderManagementData'
import type { Employee } from '@/types'
import { toast } from '@/utils/toast'
import { useTranslation } from 'react-i18next'
import {
  useDeleteEmployeeManageMutation,
  useGetBuildersQuery,
  useUpdateEmployeeManageMutation,
} from '@/redux/slices/super-admin/employeeManagement'

export default function BuilderManagement() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get('search') ?? ''
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))

  const {
    data: buildersData,
    error,
    refetch,
  } = useGetBuildersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
  })

  const [deleteBuilder] = useDeleteEmployeeManageMutation()
  const [updateBuilderManage] = useUpdateEmployeeManageMutation()

  const setSearch = (value: string) => {
    const next = new URLSearchParams(searchParams)
    value ? next.set('search', value) : next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    page > 1 ? next.set('page', String(page)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (limit: number) => {
    const next = new URLSearchParams(searchParams)
    limit !== 10 ? next.set('limit', String(limit)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const builders: Employee[] = useMemo(() => {
    return (
      buildersData?.data?.map((item: any) => ({
        id: item.id,
        employeeId: item.id.slice(0, 8),
        fullName: item.name,
        email: item.email,
        department: item.city || 'N/A',
        status: item.isBanned ? 'inactive' : 'Active',
        joiningDate: item.createdAt,
        role: item.role || 'BUILDER',
        workSchedule: item.country || 'N/A',
        contact: item.contact,
        isBanned: item.isBanned ?? false,
        profile: item.profile,
      })) || []
    )
  }, [buildersData])

  const stats = useMemo(() => {
    const total = buildersData?.pagination?.total || 0
    const active = builders.filter((b) => !b.isBanned).length
    const inactive = builders.filter((b) => b.isBanned).length

    return { total, active, inactive }
  }, [builders, buildersData])

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedBuilder, setSelectedBuilder] = useState<Employee | null>(null)
  const [builderToDelete, setBuilderToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleView = (builder: Employee) => {
    setSelectedBuilder(builder)
    setIsViewModalOpen(true)
  }

  const handleEdit = (builder: Employee, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedBuilder(builder)
    setIsViewModalOpen(false)
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditFromView = () => {
    if (selectedBuilder) {
      setIsViewModalOpen(false)
      setIsAddEditModalOpen(true)
    }
  }

  const handleAdd = () => {
    setSelectedBuilder(null)
    setIsAddEditModalOpen(true)
  }

  const handleSave = () => {
    setIsAddEditModalOpen(false)
    setSelectedBuilder(null)
  }

  const handleStatusChange = async (builder: Employee, checked: boolean) => {
    try {
      await updateBuilderManage({
        id: builder.id,
        data: {
          isBanned: !checked,
        },
      }).unwrap()
      refetch()
      toast({
        title: t('common.success'),
        description: checked
          ? t('builderManagement.builderActivated')
          : t('builderManagement.builderBanned'),
        variant: 'success',
      })
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.data?.message || t('builderManagement.statusUpdateFailed'),
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (builder: Employee) => {
    setBuilderToDelete(builder)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!builderToDelete) return

    setIsDeleting(true)

    try {
      await deleteBuilder(builderToDelete.id).unwrap()

      toast({
        variant: 'success',
        title: t('builderManagement.builderDeleted'),
        description: t('builderManagement.builderRemoved', {
          name: builderToDelete.fullName,
        }),
      })
      refetch()
      setIsConfirmOpen(false)
      setBuilderToDelete(null)

      if (selectedBuilder?.id === builderToDelete.id) {
        setSelectedBuilder(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('builderManagement.errorDeleteBuilder'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-red-500">{t('common.somethingWentWrong')}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {builderStats.map((stat, index) => {
          const Icon = stat.icon
          const value =
            stat.titleKey === 'builderManagement.totalBuilder'
              ? stats.total
              : stat.titleKey === 'builderManagement.activeNow'
                ? stats.active
                : stats.inactive

          return (
            <EmployeeSummaryCard
              key={stat.titleKey}
              title={t(stat.titleKey)}
              value={value}
              icon={Icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
              index={index}
            />
          )
        })}
      </div>

      <div className="border-0">
        <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-accent">{t('builderManagement.trackBuilder')}</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder={t('builderManagement.searchBuilder')}
              className="w-full sm:w-[280px] bg-white"
              debounceMs={300}
            />

            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('builderManagement.addBuilder')}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <BuilderTable
            builders={builders}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />

          {buildersData?.pagination && (
            <div className="border-t border-gray-100 px-6 py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={buildersData.pagination.totalPage}
                totalItems={buildersData.pagination.total}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      </div>

      <ViewBuilderDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedBuilder(null)
        }}
        builder={selectedBuilder}
        onEdit={handleOpenEditFromView}
      />

      <AddEditBuilderModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedBuilder(null)
        }}
        builder={selectedBuilder}
        onSave={handleSave}
        refetch={refetch}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setBuilderToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('builderManagement.deleteBuilder')}
        description={t('builderManagement.deleteConfirmation', {
          name: builderToDelete?.fullName,
        })}
        confirmText={t('common.delete')}
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
