import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pagination } from '@/components/common/Pagination'
import { CustomerTable } from './components/CustomerTable'
import { useGetCustomersQuery, mapCustomerFromApi } from '@/redux/api/customerApi'
import { useTranslation } from 'react-i18next'

export default function CustomerManagement() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))

  const { data, isLoading, isFetching } = useGetCustomersQuery({
    page: currentPage,
    limit: itemsPerPage,
  })

  const customers = useMemo(
    () => (data?.data ?? []).map(mapCustomerFromApi),
    [data?.data]
  )

  const totalItems = data?.pagination?.total ?? customers.length
  const totalPages = Math.max(
    1,
    data?.pagination?.totalPage ?? Math.ceil(Math.max(totalItems, 1) / itemsPerPage)
  )

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800">{t('customerManagement.pageTitle')}</h1>
        <p className="text-sm text-slate-500">{t('customerManagement.pageDescription')}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <CustomerTable customers={customers} isLoading={isLoading || isFetching} />

        {(totalItems > 0 || isLoading) && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={setLimit}
            showItemsPerPage
            className="border-t border-gray-100 px-4 py-3"
          />
        )}
      </div>
    </motion.div>
  )
}
