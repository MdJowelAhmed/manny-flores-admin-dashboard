import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { ResourceRequestStatusUpdate } from '@/redux/api/resouceRequestApi'
import type {
  EquipmentRequestItem,
  MaterialRequestItem,
  ResourceRequestTab,
  VehicleRequestItem,
} from '../resourceRequestsData'
import { formatUrgencyLevel, isHighUrgency, isPendingResourceStatus } from '../resourceRequestsData'

interface ResourceRequestTableSectionProps {
  tab: ResourceRequestTab
  materials?: MaterialRequestItem[]
  equipments?: EquipmentRequestItem[]
  vehicles?: VehicleRequestItem[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (limit: number) => void
  onView: (id: string) => void
  onStatusUpdate: (id: string, status: ResourceRequestStatusUpdate) => void
  updatingId?: string | null
}

function UrgencyCell({ level }: { level: string }) {
  return (
    <span
      className={cn(
        'text-sm font-medium',
        isHighUrgency(level) ? 'text-red-600' : 'text-slate-700'
      )}
    >
      {formatUrgencyLevel(level)}
    </span>
  )
}

function StatusActions({
  id,
  status,
  isUpdating,
  onStatusUpdate,
}: {
  id: string
  status: string
  isUpdating: boolean
  onStatusUpdate: (id: string, status: ResourceRequestStatusUpdate) => void
}) {
  const { t } = useTranslation()

  if (!isPendingResourceStatus(status)) {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isUpdating}
          className="h-8 gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
        >
          {t('resourceRequests.updateStatus')}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          className="cursor-pointer text-emerald-700 focus:text-emerald-700"
          disabled={isUpdating}
          onClick={() => onStatusUpdate(id, 'APPROVED')}
        >
          {t('resourceRequests.approve')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isUpdating}
          onClick={() => onStatusUpdate(id, 'REJECTED')}
        >
          {t('resourceRequests.reject')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ResourceRequestTableSection({
  tab,
  materials = [],
  equipments = [],
  vehicles = [],
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onView,
  onStatusUpdate,
  updatingId,
}: ResourceRequestTableSectionProps) {
  const { t } = useTranslation()

  const renderMaterialsTable = () => (
    <table className="w-full min-w-[900px]">
      <thead>
        <tr className="bg-secondary-foreground text-accent">
          <th className="px-6 py-4 text-left text-sm font-semibold rounded-tl-lg">
            {t('resourceRequests.materialName')}
          </th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.quantity')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.urgency')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.reason')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.status')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.requestDate')}</th>
          <th className="px-6 py-4 text-right text-sm font-semibold rounded-tr-lg">{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {materials.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
              {t('resourceRequests.noRequestsFound')}
            </td>
          </tr>
        ) : (
          materials.map((r, index) => (
            <motion.tr
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * index }}
              className="hover:bg-gray-50/50 transition-colors shadow-sm"
            >
              <td className="px-4 py-3 text-sm text-slate-700 font-medium">{r.material?.name ?? r.materialName}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{r.quantityNeeded}</td>
              <td className="px-4 py-3">
                <UrgencyCell level={r.urgencyLevel} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 max-w-[220px] truncate" title={r.reason}>
                {r.reason}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                {formatDateTime(r.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onView(r.id)}
                    className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <StatusActions
                    id={r.id}
                    status={r.status}
                    isUpdating={updatingId === r.id}
                    onStatusUpdate={onStatusUpdate}
                  />
                </div>
              </td>
            </motion.tr>
          ))
        )}
      </tbody>
    </table>
  )

  const renderEquipmentsTable = () => (
    <table className="w-full min-w-[850px]">
      <thead>
        <tr className="bg-secondary-foreground text-accent">
          <th className="px-6 py-4 text-left text-sm font-semibold rounded-tl-lg">
            {t('resourceRequests.equipmentName')}
          </th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.urgency')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.reason')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.status')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.requestDate')}</th>
          <th className="px-6 py-4 text-right text-sm font-semibold rounded-tr-lg">{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {equipments.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
              {t('resourceRequests.noRequestsFound')}
            </td>
          </tr>
        ) : (
          equipments.map((r, index) => (
            <motion.tr
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * index }}
              className="hover:bg-gray-50/50 transition-colors shadow-sm"
            >
              <td className="px-4 py-3 text-sm text-slate-700 font-medium">{r.equipmentName}</td>
              <td className="px-4 py-3">
                <UrgencyCell level={r.urgencyLevel} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 max-w-[260px] truncate" title={r.reason}>
                {r.reason}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                {formatDateTime(r.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onView(r.id)}
                    className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <StatusActions
                    id={r.id}
                    status={r.status}
                    isUpdating={updatingId === r.id}
                    onStatusUpdate={onStatusUpdate}
                  />
                </div>
              </td>
            </motion.tr>
          ))
        )}
      </tbody>
    </table>
  )

  const renderVehiclesTable = () => (
    <table className="w-full min-w-[900px]">
      <thead>
        <tr className="bg-secondary-foreground text-accent">
          <th className="px-6 py-4 text-left text-sm font-semibold rounded-tl-lg">
            {t('resourceRequests.vehicleType')}
          </th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('projectScheduling.project')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.urgency')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.reason')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.status')}</th>
          <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.requestDate')}</th>
          <th className="px-6 py-4 text-right text-sm font-semibold rounded-tr-lg">{t('common.actions')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {vehicles.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
              {t('resourceRequests.noRequestsFound')}
            </td>
          </tr>
        ) : (
          vehicles.map((r, index) => (
            <motion.tr
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * index }}
              className="hover:bg-gray-50/50 transition-colors shadow-sm"
            >
              <td className="px-4 py-3 text-sm text-slate-700 font-medium capitalize">{r.vehicleType}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{r.projectName}</td>
              <td className="px-4 py-3">
                <UrgencyCell level={r.urgencyLevel} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 max-w-[220px] truncate" title={r.reason}>
                {r.reason}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                {formatDateTime(r.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onView(r.id)}
                    className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                  <StatusActions
                    id={r.id}
                    status={r.status}
                    isUpdating={updatingId === r.id}
                    onStatusUpdate={onStatusUpdate}
                  />
                </div>
              </td>
            </motion.tr>
          ))
        )}
      </tbody>
    </table>
  )

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="w-full overflow-auto">
        {tab === 'materials' && renderMaterialsTable()}
        {tab === 'equipment' && renderEquipmentsTable()}
        {tab === 'vehicles' && renderVehiclesTable()}
      </div>

      {totalItems > 0 && (
        <div className="border-t border-gray-100 px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            showItemsPerPage
          />
        </div>
      )}
    </div>
  )
}
