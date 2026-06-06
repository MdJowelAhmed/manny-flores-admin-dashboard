import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Info, Pencil, Plus, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  useAddEstimateMutation,
  useDeleteEstimateMutation,
  useGetEstimatesQuery,
  useUpdateEstimateMutation,
  buildEstimatePayload,
  mapEstimateFromApi,
} from '@/redux/api/estimateApi'
import { EstimateItemModal } from './components/EstimateItemModal'
import { AddEstimateModal } from './components/AddEstimateModal'
import { getProjectStatusClasses, type EstimateRecord } from './estimateData'
import { formatCurrency } from '@/utils/formatters'

export default function EstimatePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = parseInt(searchParams.get('limit') || '10', 10) || 10

  const [items, setItems] = useState<EstimateRecord[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const { data: estimateData, isLoading } = useGetEstimatesQuery({
    page: currentPage,
    limit: itemsPerPage,
  })
  const [addEstimate] = useAddEstimateMutation()
  const [updateEstimate] = useUpdateEstimateMutation()
  const [deleteEstimate] = useDeleteEstimateMutation()

  useEffect(() => {
    if (!estimateData?.data) return
    setItems(estimateData.data.map(mapEstimateFromApi))
  }, [estimateData])

  const [selectedItem, setSelectedItem] = useState<EstimateRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EstimateRecord | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editEstimate, setEditEstimate] = useState<EstimateRecord | null>(null)

  const { user } = useAppSelector((s) => s.auth)
  const userRole = (user?.role as UserRole) ?? UserRole.SUPER_ADMIN
  const canCreate = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN

  const setPage = useCallback(
    (p: number) => {
      const next = new URLSearchParams(searchParams)
      p > 1 ? next.set('page', String(p)) : next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const setLimit = useCallback(
    (l: number) => {
      const next = new URLSearchParams(searchParams)
      l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
      next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const totalItems = estimateData?.pagination?.total ?? 0
  const totalPages = Math.max(
    1,
    estimateData?.pagination?.totalPage ?? Math.ceil(Math.max(totalItems, 1) / itemsPerPage)
  )

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage, setPage])

  const paginatedItems = items

  const openModal = (item: EstimateRecord) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedItem(null)
  }



  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteEstimate(deleteTarget.id)
      .unwrap()
      .then(() => {
        setItems((prev) => prev.filter((row) => row.id !== deleteTarget.id))
        toast({ title: t('estimate.deletedSuccess'), variant: 'success' })
      })
      .catch((err: unknown) => {
        const message =
          (err as { data?: { message?: string } })?.data?.message ?? t('common.somethingWentWrong')
        toast({ title: t('common.error'), description: message, variant: 'destructive' })
      })
      .finally(() => setDeleteTarget(null))
  }

  const handleCreateEstimate = async (item: EstimateRecord) => {
    const payload = buildEstimatePayload(item)
    const res = await addEstimate(payload).unwrap()
    const mapped = mapEstimateFromApi(res.data)
    setItems((prev) => [mapped, ...prev])
    setPage(1)
  }

  const handleUpdateEstimate = async (item: EstimateRecord) => {
    const payload = buildEstimatePayload(item)
    const res = await updateEstimate({ id: item.id, ...payload }).unwrap()
    const mapped = res.data ? mapEstimateFromApi(res.data) : item
    setItems((prev) => prev.map((row) => (row.id === item.id ? mapped : row)))
    setEditEstimate(null)
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
                
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.clientName')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.location')}</th>
                
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.totalCost')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.totalDays')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.created')}</th>
                <th className="px-5 py-4 font-bold text-gray-800">{t('estimate.table.status')}</th>
                <th className="px-5 py-4 font-bold text-gray-800 text-right w-[140px]">
                  {t('estimate.table.action')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((row) => {
                const statusStyle = getProjectStatusClasses(row.projectStatus)
                return (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 bg-white hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-5 py-4 text-gray-900 align-middle max-w-[200px] truncate" title={row.title}>
                    {row.title}
                  </td>
                  <td className="px-5 py-4 text-gray-700 align-middle">{row.customerName}</td>
                  <td className="px-5 py-4 text-gray-700 align-middle max-w-[180px] truncate" title={row.location}>
                    {row.location}
                  </td>
                  <td className="px-5 py-4 text-gray-700 align-middle tabular-nums">
                    {formatCurrency(row.grandTotal ?? 0)}
                  </td>
                  <td className="px-5 py-4 text-gray-700 align-middle tabular-nums whitespace-nowrap">
                    {row.totalDays != null ? row.totalDays : '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-700 align-middle whitespace-nowrap">
                    {row.createdAtDisplay ?? '—'}
                  </td>
          
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 font-medium',
                        statusStyle.text
                      )}
                    >
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', statusStyle.dot)} />
                      {t(`estimate.projectStatus.${row.projectStatus}`)}
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
                    
                      {canCreate && row.projectStatus === 'PENDING' && row.status !== 'signed' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-gray-600 hover:text-gray-900"
                              onClick={() => setEditEstimate(row)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('common.edit')}</TooltipContent>
                        </Tooltip>
                      )}
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
              )})}
              {!isLoading && paginatedItems.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-gray-500" colSpan={8}>
                    {t('common.noDataFound')}
                  </td>
                </tr>
              )}
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
        onCreate={handleCreateEstimate}
      />

      <AddEstimateModal
        open={editEstimate !== null}
        onClose={() => setEditEstimate(null)}
        editEstimate={editEstimate}
        onCreate={handleCreateEstimate}
        onUpdate={handleUpdateEstimate}
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
