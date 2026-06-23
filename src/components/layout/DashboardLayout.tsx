import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAppSelector } from '@/redux/hooks'
import { cn } from '@/utils/cn'
import { Header } from './Header'

export default function DashboardLayout() {
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          // Sidebar is always expanded on desktop; on mobile it overlays content
          'lg:ml-[280px]',
          sidebarCollapsed && 'lg:ml-[280px]'
        )}
      >
        <Header />
        <main className="p-6 lg:p-8 bg-[#fafafa] min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
