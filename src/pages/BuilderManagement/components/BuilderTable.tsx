import { motion } from 'framer-motion'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { Switch } from '@/components/ui/switch'
// import { cn } from '@/utils/cn'
import type { Employee } from '@/types'
import { PiChatCircleTextBold } from 'react-icons/pi'
import { useCreateInitialChatMutation } from '@/redux/slices/super-admin/chatApi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface BuilderTableProps {
  builders: Employee[]
  onView: (builder: Employee) => void
  onEdit: (builder: Employee, e: React.MouseEvent) => void
  onDelete: (builder: Employee) => void
  onStatusChange: (builder: Employee, checked: boolean) => void
}

export function BuilderTable({
  builders,
  onView,
  onEdit,
  onDelete,
  // onStatusChange,
}: BuilderTableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createInitialChat] = useCreateInitialChatMutation()

  const handleChat = async (id: string) => {
    await createInitialChat(id).then((res) => {
      if (res?.data?.success) {
        navigate('/communication')
      }
    })
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent">
            <th className="px-6 py-4 text-left text-sm font-bold">{t('builderManagement.builderId')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('builderManagement.fullName')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('common.email')}</th>
            {/* <th className="px-6 py-4 text-left text-sm font-bold">{t('common.status')}</th> */}
            <th className="px-6 py-4 text-right text-sm font-bold">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {builders?.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                {t('builderManagement.noBuildersFound')}
              </td>
            </tr>
          ) : (
            builders?.map((builder, index) => (
              <motion.tr
                key={builder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">
                  <span className="text-sm font-medium text-slate-700">{builder.employeeId}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm font-medium text-slate-800">{builder.fullName}</span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-slate-600">{builder.email}</span>
                </td>
                {/* <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!builder.isBanned}
                      onCheckedChange={(checked) => onStatusChange(builder, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span
                      className={cn(
                        'inline-flex px-3 py-1 rounded text-xs font-medium',
                        builder.isBanned ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {builder.isBanned ? t('builderManagement.banned') : t('builderManagement.active')}
                    </span>
                  </div>
                </td> */}
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onView(builder)}
                      className="h-8 w-8 border-none text-blue-500 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={(e) => onEdit(builder, e)}
                      className="h-8 w-8 border-none text-blue-500 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => handleChat(builder.id)}
                      className="h-9 w-9 border-none text-primary bg-primary/50 rounded-full cursor-pointer"
                    >
                      <PiChatCircleTextBold size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onDelete(builder)}
                      className="h-8 w-8 border-none text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
