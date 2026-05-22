import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/formatters'
import type { Customer } from '@/redux/api/customerApi'
import { useTranslation } from 'react-i18next'

interface CustomerTableProps {
  customers: Customer[]
  isLoading?: boolean
}

function nameParts(name: string): [string, string] {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return [parts[0] ?? '', '']
  return [parts[0], parts.slice(1).join(' ')]
}

export function CustomerTable({ customers, isLoading }: CustomerTableProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="bg-gray-50/90">
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
              {t('customerManagement.customer')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
              {t('customerManagement.email')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
              {t('customerManagement.contact')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
              {t('customerManagement.joinedDate')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
              {t('customerManagement.status')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {!isLoading && customers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                {t('customerManagement.noCustomersFound')}
              </td>
            </tr>
          ) : (
            customers.map((customer, index) => {
              const [first, last] = nameParts(customer.name)
              return (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * index }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0 border border-gray-200">
                        {customer.profileUrl ? (
                          <AvatarImage src={customer.profileUrl} alt={customer.name} />
                        ) : null}
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
                          {getInitials(first, last)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-slate-800">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{customer.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{customer.contact}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                    {customer.createdAt}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                        customer.isBanned
                          ? 'bg-red-50 text-red-600'
                          : customer.verified
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                      )}
                    >
                      {customer.isBanned
                        ? t('customerManagement.banned')
                        : customer.verified
                          ? t('customerManagement.verified')
                          : t('customerManagement.unverified')}
                    </span>
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
