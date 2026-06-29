import { useState, useMemo } from 'react'
import { StatCard } from './StatCard'
import { RevenueChart } from './RevenueChart'
import { RecentActivityCard } from './RecentActivityCard'
import { years } from './dashboardData'
import { DollarSignIcon, FileCheck, ListOrdered, Users } from 'lucide-react'
import { PieChartComponent } from './PieChart'
import { Chatbot } from './Chatbot/Chatbot'
import { useTranslation } from 'react-i18next'
import { useOverviewProjectStatusQuery, useOverviewRevenueExpenseQuery, useOverviewStatsQuery } from '@/redux/slices/super-admin/overviewApi'
import Spinner from '@/components/common/Spinner'

const currentYear = String(new Date().getFullYear())

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(
    years.includes(currentYear) ? currentYear : years[0]
  )
  const { t } = useTranslation()

  const { data: overviewStatsApi, isLoading: statsLoading } = useOverviewStatsQuery()
  const { data: projectStatusApi, isLoading: projectStatusLoading } = useOverviewProjectStatusQuery()
  const { data: revenueExpenseApi, isLoading: revenueExpenseLoading } = useOverviewRevenueExpenseQuery({
    year: selectedYear,
  })

  const chartData = useMemo(() => {
    const apiMonths = revenueExpenseApi?.data?.months
    if (!apiMonths || !Array.isArray(apiMonths)) return []

    return apiMonths.map((item) => ({
      month: item.month,
      revenue: item.revenue ?? 0,
      project: item.project ?? 0,
    }))
  }, [revenueExpenseApi?.data?.months])

  const stats = [
    {
      title: t('dashboard.activeProjects'),
      value: overviewStatsApi?.data?.activeProjectCountLength ?? 0,
      icon: ListOrdered,
      description: t('dashboard.vsLastMonth'),
    },
    {
      title: t('dashboard.totalEmployees'),
      value: overviewStatsApi?.data?.allUsersCount ?? 0,
      icon: Users,
      description: t('dashboard.vsLastMonth'),
    },
    {
      title: t('dashboard.totalRevenue'),
      value: overviewStatsApi?.data?.totalRevenue ?? 0,
      icon: DollarSignIcon,
      description: t('dashboard.vsLastMonth'),
    },
    {
      title: t('dashboard.pendingApprovals'),
      value: overviewStatsApi?.data?.estimateProjectCountLength ?? 0,
      icon: FileCheck,
      description: t('dashboard.vsLastMonth'),
    },
  ]
  if (statsLoading || projectStatusLoading || revenueExpenseLoading) {
    return <Spinner />
  }
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats?.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Chart Section - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className='col-span-8'>
          <RevenueChart
            chartData={chartData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}

          />
        </div>
        <div className='col-span-4'>
          <PieChartComponent projectStatusApi={projectStatusApi} />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <RecentActivityCard />
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
