import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  FileText,
  Shield,
  Car,
  Building,
  Calendar,
  CreditCard,
  HelpCircle,
  ListOrdered,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleSidebar } from '@/redux/slices/uiSlice'
import { cn } from '@/utils/cn'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },

  {
    title: 'Car List',
    href: '/cars',
    icon: Car,
  },
  
  {
    title: 'Booking Management',
    href: '/booking-management',
    icon: ListOrdered,
  },


  {
    title: 'Agency Management',
    href: '/agency-management',
    icon: Building,
  },
  {
    title: 'Calendar',
    href: '/calender',
    icon: Calendar,
  },
  {
    title: 'Transactions History',
    href: '/transactions-history',
    icon: CreditCard,
  },
  {
    title: 'Client Management',
    href: '/clients',
    icon: Users,
  },
]

const settingsItems: NavItem[] = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Password',
    href: '/settings/password',
    icon: Lock,
  },
  {
    title: 'Terms',
    href: '/settings/terms',
    icon: FileText,
  },
  {
    title: 'Privacy',
    href: '/settings/privacy',
    icon: Shield,
  },
  {
    title: 'FAQ',
    href: '/settings/faq',
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)
  const location = useLocation()

  const isSettingsActive = location.pathname.startsWith('/settings')

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity',
          sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => dispatch(toggleSidebar())}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card shadow-xl transition-all duration-300',
          'flex flex-col',
          sidebarCollapsed ? 'w-[80px]' : 'w-[280px]',
          'lg:translate-x-0',
          sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-36 px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <div className="text-primary text-white font-bold text-lg">
                <img src="/assets/logo.png" alt="Motly" className="h-10 w-10" />
              </div>
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-xl text-accent">Dashboard</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-accent" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-accent" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                Main Menu
              </p>
            )}
            {navItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>

          <Separator className="my-4" />

          {/* Settings Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                Settings
              </p>
            )}
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/settings/profile"
                    className={cn(
                      'flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      'hover:bg-primary hover:text-accent-foreground',
                      isSettingsActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-muted-foreground'
                    )}
                  > 
                    <Settings
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isSettingsActive
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            ) : (
              settingsItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={sidebarCollapsed}
                />
              ))
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          {!sidebarCollapsed && (
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Motly v1.0
            </p>
          )}
        </div>
      </aside>
    </>
  )
}

interface SidebarNavItemProps {
  item: NavItem
  collapsed: boolean
}

function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const Icon = item.icon

  const linkContent = (
    <NavLink
  to={item.href}
  className={({ isActive }) =>
    cn(
      'group flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200',
      'hover:bg-[#a78133] hover:text-[#fff]',
      collapsed && 'justify-center',
      isActive ? 'bg-[#a78133] text-[#fff] shadow-md' : 'text-[#656565]'
    )
  }
>
  <Icon className="h-5 w-5 flex-shrink-0 text-current" />
  {!collapsed && <span className="font-medium">{item.title}</span>}
</NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}




