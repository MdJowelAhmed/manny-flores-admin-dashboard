import { useState, useMemo } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
// import { AvailableCars, RentalCars, TotalBooking, TotalRevenue } from '@/components/common/svg/DashboardSVG'
import { StatCard } from './StatCard'
import { EarningsSummaryChart } from './EarningsSummaryChart'
import { RentStatusChart } from './RentStatusChart'
import { RecentActivityCard } from './RecentActivityCard'
import { yearlyData } from './dashboardData'
import { BarChart2Icon, BarChartHorizontalIcon, DollarSign, ListOrdered, User, UserPlus } from 'lucide-react'
// import { TotalRevenue } from '@/components/common/svg/DashboardSVG'

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState('2024')

  const chartData = useMemo(() => yearlyData[selectedYear], [selectedYear])

  const stats = [
    {
      title: 'Total Orders',
      value: formatCompactNumber(12543),
      change: 12.5,
      icon: ListOrdered,
      description: 'vs last month',
    },
    {
      title: 'Total Sales',
      value: formatCompactNumber(3420),
      change: 8.2,
      icon: DollarSign,
      description: 'vs last month',
    },
    {
      title: 'New Customers',
      value: '156',
      change: 3.1,
      icon: UserPlus,
      description: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(845320),
      change: -2.4,
      icon: BarChart2Icon,
      description: 'vs last month',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Chart Section - Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
       <div className='col-span-8'>
         <EarningsSummaryChart
          chartData={chartData}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear} 
          
        />
       </div>
       <div className='col-span-4'>
        <RentStatusChart />
       </div>
      </div>

      {/* Recent Activity */}
      <div>
        <RecentActivityCard />
      </div>
    </div>
  )
}
