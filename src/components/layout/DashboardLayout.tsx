import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppSelector } from '@/redux/hooks'
import { cn } from '@/utils/cn'

export default function DashboardLayout() {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
        )}
      >
        <Header />
        <main className="p-6 lg:p-8 bg-[#fafafa] min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
