import { motion } from 'framer-motion'
import { Info, Unlock, Trash2 } from 'lucide-react'
import { Truck, Package, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResourceRequest, ResourceCategory } from '../resourceRequestsData'
import { RESOURCE_COLORS } from '../resourceRequestsData'
import { cn } from '@/utils/cn'

const RESOURCE_ICONS: Record<ResourceCategory, React.ElementType> = {
  Vehicle: Truck,
  Material: Package,
  Equipment: Wrench,
}

interface RequestTableProps {
  records: ResourceRequest[]
  onView: (r: ResourceRequest) => void
  onEdit: (r: ResourceRequest, e: React.MouseEvent) => void
  onDelete: (r: ResourceRequest) => void
}

export function RequestTable({
  records,
  onView,
  onEdit,
  onDelete,
}: RequestTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-[#CCF3F5] text-accent">
            <th className="px-4 py-3 text-left text-sm font-semibold rounded-tl-lg">
              Request ID
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Resource</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Project</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Urgency</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-right text-sm font-semibold rounded-tr-lg">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-muted-foreground text-sm"
              >
                No resource requests found
              </td>
            </tr>
          ) : (
            records.map((r, index) => {
              const colors = RESOURCE_COLORS[r.resource]
              const IconComp = RESOURCE_ICONS[r.resource]
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-700">{r.requestId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-sm font-medium',
                        colors.text
                      )}
                    >
                      <IconComp className="h-4 w-4 shrink-0" />
                      {r.resource}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.project}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        r.urgency === 'High' ? 'text-red-600' : 'text-slate-700'
                      )}
                    >
                      {r.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm">{r.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onView(r)}
                        className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => onEdit(r, e)}
                        className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50"
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(r)}
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
