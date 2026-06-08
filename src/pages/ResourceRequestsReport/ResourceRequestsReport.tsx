import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SearchInput } from '@/components/common/SearchInput'
import { ResourceRequestTableSection } from './components/ResourceRequestTableSection'
import { ViewRequestDetailsModal } from './components/ViewRequestDetailsModal'
import {
  useGetRequestedMaterialsQuery,
  useUpdateRequestedMaterialStatusMutation,
  useGetRequestedEquipmentsQuery,
  useUpdateRequestedEquipmentStatusMutation,
  useGetRequestedVehiclesQuery,
  useUpdateRequestedVehicleStatusMutation,
  mapMaterialRequestFromApi,
  mapEquipmentRequestFromApi,
  mapVehicleRequestFromApi,
  type ResourceRequestStatusUpdate,
} from '@/redux/api/resouceRequestApi'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import { toast } from '@/utils/toast'
import type {
  ResourceRequestTab,
  ViewableResourceRequest,
} from './resourceRequestsData'

const VALID_TABS: ResourceRequestTab[] = ['materials', 'equipment', 'vehicles']

function parseTab(value: string | null): ResourceRequestTab {
  if (value && VALID_TABS.includes(value as ResourceRequestTab)) {
    return value as ResourceRequestTab
  }
  return 'materials'
}

export default function ResourceRequestsReport() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = parseTab(searchParams.get('tab'))
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage =
    Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGINATION.limit), 10)) ||
    DEFAULT_PAGINATION.limit

  const [searchQuery, setSearchQuery] = useState('')
  const [viewRecord, setViewRecord] = useState<ViewableResourceRequest | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
  }

  const {
    data: materialsResponse,
    isLoading: isMaterialsLoading,
    isFetching: isMaterialsFetching,
  } = useGetRequestedMaterialsQuery(queryParams, { skip: tabParam !== 'materials' })

  const {
    data: equipmentsResponse,
    isLoading: isEquipmentsLoading,
    isFetching: isEquipmentsFetching,
  } = useGetRequestedEquipmentsQuery(queryParams, { skip: tabParam !== 'equipment' })

  const {
    data: vehiclesResponse,
    isLoading: isVehiclesLoading,
    isFetching: isVehiclesFetching,
  } = useGetRequestedVehiclesQuery(queryParams, { skip: tabParam !== 'vehicles' })

  const [updateMaterialStatus] = useUpdateRequestedMaterialStatusMutation()
  const [updateEquipmentStatus] = useUpdateRequestedEquipmentStatusMutation()
  const [updateVehicleStatus] = useUpdateRequestedVehicleStatusMutation()

  const materials = useMemo(
    () => (materialsResponse?.data ?? []).map(mapMaterialRequestFromApi),
    [materialsResponse]
  )
  const equipments = useMemo(
    () => (equipmentsResponse?.data ?? []).map(mapEquipmentRequestFromApi),
    [equipmentsResponse]
  )
  const vehicles = useMemo(
    () => (vehiclesResponse?.data ?? []).map(mapVehicleRequestFromApi),
    [vehiclesResponse]
  )

  const activePagination =
    tabParam === 'materials'
      ? materialsResponse?.pagination
      : tabParam === 'equipment'
        ? equipmentsResponse?.pagination
        : vehiclesResponse?.pagination

  const totalPages = activePagination?.totalPage ?? 1
  const totalItems = activePagination?.total ?? 0

  const isLoading =
    tabParam === 'materials'
      ? isMaterialsLoading || isMaterialsFetching
      : tabParam === 'equipment'
        ? isEquipmentsLoading || isEquipmentsFetching
        : isVehiclesLoading || isVehiclesFetching

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== DEFAULT_PAGINATION.limit ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setTab = (tab: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tab)
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const handleView = (id: string) => {
    if (tabParam === 'materials') {
      const record = materials.find((r) => r.id === id)
      if (record) setViewRecord({ tab: 'materials', record })
      return
    }
    if (tabParam === 'equipment') {
      const record = equipments.find((r) => r.id === id)
      if (record) setViewRecord({ tab: 'equipment', record })
      return
    }
    const record = vehicles.find((r) => r.id === id)
    if (record) setViewRecord({ tab: 'vehicles', record })
  }

  const handleStatusUpdate = async (id: string, status: ResourceRequestStatusUpdate) => {
    setUpdatingId(id)
    try {
      if (tabParam === 'materials') {
        await updateMaterialStatus({ id, status }).unwrap()
      } else if (tabParam === 'equipment') {
        await updateEquipmentStatus({ id, status }).unwrap()
      } else {
        await updateVehicleStatus({ id, status }).unwrap()
      }

      toast({
        variant: 'success',
        title: t('common.success'),
        description:
          status === 'APPROVED'
            ? t('resourceRequests.requestApproved')
            : t('resourceRequests.requestRejected'),
      })

      setViewRecord(null)
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof err.data.message === 'string'
          ? err.data.message
          : t('resourceRequests.statusUpdateFailed')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-end">
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value)
            setPage(1)
          }}
          placeholder={t('resourceRequests.searchRequests')}
          className="w-[280px] bg-white"
          debounceMs={300}
        />
      </div>

      <div className="rounded-xl overflow-hidden shadow-sm">
        <Tabs value={tabParam} onValueChange={setTab} className="w-full">
          <div className="pb-4">
            <TabsList className="h-[40px] bg-gray-100 p-1">
              <TabsTrigger
                value="materials"
                className="px-5 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-l-sm"
              >
                {t('resourceRequests.materials')}
              </TabsTrigger>
              <TabsTrigger
                value="equipment"
                className="px-5 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {t('resourceRequests.equipment')}
              </TabsTrigger>
              <TabsTrigger
                value="vehicles"
                className="px-5 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-r-sm"
              >
                {t('resourceRequests.vehicles')}
              </TabsTrigger>
            </TabsList>
          </div>

          {VALID_TABS.map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {isLoading ? (
                <div className="bg-white rounded-xl px-5 py-10 text-center text-sm text-muted-foreground">
                  {t('common.loading')}
                </div>
              ) : (
                <ResourceRequestTableSection
                  tab={tab}
                  materials={tab === 'materials' ? materials : []}
                  equipments={tab === 'equipment' ? equipments : []}
                  vehicles={tab === 'vehicles' ? vehicles : []}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                  onItemsPerPageChange={setLimit}
                  onView={handleView}
                  onStatusUpdate={handleStatusUpdate}
                  updatingId={updatingId}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <ViewRequestDetailsModal
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        viewRecord={viewRecord}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={updatingId !== null}
      />
    </motion.div>
  )
}
