import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Info, Lock, Plus, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import { EstimateItemModal } from './components/EstimateItemModal'
import { AddEstimateModal } from './components/AddEstimateModal'
import { MOCK_ESTIMATE_ITEMS, type EstimateListItem } from './estimateData'

export default function EstimatePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '10', 10) || 10

  const [items, setItems] = useState<EstimateListItem[]>(MOCK_ESTIMATE_ITEMS)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<EstimateListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EstimateListItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const { user } = useAppSelector((s) => s.auth)
  const userRole = (user?.role as UserRole) ?? UserRole.SUPER_ADMIN
  const canCreate = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN

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

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }, [items, currentPage, itemsPerPage])

  const openModal = (item: EstimateListItem) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }

  const handleLock = () => {
    toast({
      title: t('estimate.lockNotice'),
      variant: 'info',
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setItems((prev) => prev.filter((row) => row.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast({ title: t('estimate.deletedSuccess'), variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t('estimate.pageTitle')}</h1>
        {canCreate && (
          <Button
            type="button"
            className="bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('estimate.addNew')}
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#E6F7EF] text-left text-gray-800">
                <th className="px-5 py-4 font-bold text-gray-800">
                  {t('estimate.table.projectName')}
                </th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.location')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.startDate')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.endDate')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.payment')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.status')}</th>
                <th className="px-5 py-4 font-bold text-gray-800 text-right w-[140px]">
                  {t('estimate.table.action')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 bg-white hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-5 py-4 text-gray-900 align-middle">{row.title}</td>
                  <td className="px-5 py-4 text-gray-700 align-middle">{row.location}</td>
                  <td className="px-5 py-4 text-gray-700 align-middle whitespace-nowrap">
                    {row.deadlineFrom}
                  </td>
                  <td className="px-5 py-4 text-gray-700 align-middle whitespace-nowrap">
                    {row.deadlineTo}
                  </td>
                  <td className="px-5 py-4 text-gray-700 align-middle">{row.paymentMethod}</td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 font-medium',
                        row.status === 'reviewed' ? 'text-emerald-600' : 'text-orange-500'
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          row.status === 'reviewed' ? 'bg-emerald-500' : 'bg-orange-500'
                        )}
                      />
                      {row.status === 'reviewed'
                        ? t('estimate.status.reviewed')
                        : t('estimate.status.pending')}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-600 hover:text-gray-900"
                            onClick={() => openModal(row)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('estimate.actions.details')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-600 hover:text-gray-900"
                            onClick={handleLock}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('estimate.actions.lock')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('estimate.actions.delete')}</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
          showItemsPerPage
          className="border-t border-gray-100"
        />
      </div>

      <EstimateItemModal open={modalOpen} onClose={closeModal} item={selectedItem} />

      <AddEstimateModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={(item) => {
          setItems((prev) => [item, ...prev])
          setPage(1)
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('estimate.deleteTitle')}
        description={t('estimate.deleteDescription')}
        confirmText={t('estimate.deleteConfirm')}
        cancelText={t('estimate.deleteCancel')}
        variant="danger"
      />
    </div>
  )
}
