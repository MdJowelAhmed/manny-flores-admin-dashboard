import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import type { AttendanceRecord, AttendanceStatus } from './attendanceData'
import { STATUS_STYLES } from './attendanceData'
import { cn } from '@/utils/cn'

interface AttendanceDetailTableProps {
  records: AttendanceRecord[]
  onView?: (r: AttendanceRecord) => void
  onEdit?: (r: AttendanceRecord, e: React.MouseEvent) => void
  onLock?: (r: AttendanceRecord) => void
  onDelete?: (r: AttendanceRecord) => void
  onStatusChange?: (r: AttendanceRecord, isActive: boolean) => void
}

export function AttendanceDetailTable({
  records,
  onStatusChange,
}: AttendanceDetailTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent ">
            <th className="px-4 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Check In</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Check Out</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Work hour</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Attendance</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Status</th>
            {/* <th className="px-4 py-4 text-right text-sm font-semibold">Action</th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                No records found
              </td>
            </tr>
          ) : (
            records.map((r, index) => {
              const style = STATUS_STYLES[r.status as AttendanceStatus]
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className={cn('hover:bg-gray-50/50 transition-colors shadow-sm', index % 2 === 1 && 'bg-gray-50/30')}
                >
                  <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.checkIn}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.checkOut}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.totalHours}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex px-3 py-1 rounded-full text-xs font-medium w-16 text-center',
                        style?.bg ?? 'bg-gray-100',
                        style?.text ?? 'text-slate-700'
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-36">
                    {onStatusChange ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={r.isActive !== false}
                          onCheckedChange={(checked) => {
                            onStatusChange(r, checked)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span
                          className={cn(
                            'text-xs font-medium',
                            r.isActive !== false ? 'text-emerald-600' : 'text-muted-foreground'
                          )}
                        >
                          {r.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={cn(
                          'text-xs font-medium',
                          r.isActive !== false ? 'text-emerald-600' : 'text-muted-foreground'
                        )}
                      >
                        {r.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  {/* <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onView(r)}
                        className="h-8 w-8 text-sky-500 hover:bg-sky-50"
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      {onLock && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onLock(r)}
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Lock className="h-5 w-5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => onEdit(r, e)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(r)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td> */}
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
