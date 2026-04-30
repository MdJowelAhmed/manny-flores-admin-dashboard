import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { UserRole, hasFeatureAccess, type FeatureKey } from '@/types/roles'
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  User,
  Lock,
  FileText,
  Shield,
  ShieldCheck,

  Building2,
  UserCircle,
  UserCog,
  Truck,
  Wrench,
  Star,
  MessageCircle,
  FileCheck,
  CalendarDays,
  Package2,
  Wallet,
  ClipboardCheck,
  DollarSign,
  FileBarChart,
  ClipboardList,
  // FolderKanban,
  Info,
  BadgeDollarSign,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setSidebarCollapsed, toggleSidebar } from '@/redux/slices/uiSlice'
import { cn } from '@/utils/cn'
import { useTranslation } from 'react-i18next'

interface NavItem {
  title: string
  titleKey: string
  href: string
  icon: React.ElementType
  feature?: FeatureKey
  children?: (NavItem & { feature?: FeatureKey })[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    titleKey: 'sidebar.dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    feature: 'dashboard',
  },
  // {
  //   title: 'Recent Projects',
  //   titleKey: 'sidebar.recentProjects',
  //   href: '/recent-projects',
  //   icon: FolderKanban,
  //   feature: 'recent-projects',
  // },

  {
    title: 'Customer Management',
    titleKey: 'sidebar.customerManagement',
    href: '/customer-management',
    icon: UserCircle,
    feature: 'customer-management',
  },
  {
    title: 'Estimate',
    titleKey: 'sidebar.estimate',
    href: '/estimate',
    icon: FileText,
    feature: 'estimate',
  },

  {
    title: 'Invoice',
    titleKey: 'sidebar.invoice',
    href: '/invoice',
    icon: FileText,
    feature: 'invoice',
  },
  {
    title: 'Company & Projects',
    titleKey: 'sidebar.companyProjects',
    href: '/company-projects',
    icon: Building2,
    feature: 'company-projects',
  },
  {
    title: 'Employee Management',
    titleKey: 'sidebar.employeeManagement',
    href: '/employee-management',
    icon: UserCog,
    feature: 'employee-management',
  },
  {
    title: 'Attendance',
    titleKey: 'sidebar.attendance',
    href: '/attendance',
    icon: ClipboardCheck,
    feature: 'attendance',
  },
  {
    title: 'Communication',
    titleKey: 'sidebar.communication',
    href: '/communication',
    icon: MessageCircle,
    feature: 'communication',
  },
  {
    title: 'Customer & Finance',
    titleKey: 'sidebar.customerFinance',
    href: '/customer-finance',
    icon: Wallet,
    feature: 'customer-finance',
  },
  {
    title: 'Payment',
    titleKey: 'sidebar.payment',
    href: '/payments',
    icon: BadgeDollarSign,
    feature: 'payments',
  },
  {
    title: 'Manage Materials',
    titleKey: 'sidebar.manageMaterials',
    href: '/manage-materials',
    icon: Package2,
    feature: 'manage-materials',
  },
  {
    title: 'Project Scheduling',
    titleKey: 'sidebar.projectScheduling',
    href: '/project-scheduling',
    icon: CalendarDays,
    feature: 'project-scheduling',
  },
  {
    title: 'Documents & Approvals',
    titleKey: 'sidebar.documentsApprovals',
    href: '/documents-approvals',
    icon: FileCheck,
    feature: 'documents-approvals',
  },
  {
    title: 'Payroll management',
    titleKey: 'sidebar.payrollManagement',
    href: '/payroll-management',
    icon: DollarSign,
    feature: 'payroll-management',
  },
  {
    title: 'Resource Requests & Report',
    titleKey: 'sidebar.resourceRequestsReport',
    href: '/resource-requests-report',
    icon: FileBarChart,
    feature: 'resource-requests-report',
  },
  {
    title: 'Change Orders',
    titleKey: 'sidebar.changeOrders',
    href: '/change-orders',
    icon: ClipboardList,
    feature: 'change-orders',
  },
  {
    title: 'Vehicle Maintenance',
    titleKey: 'sidebar.vehicleMaintenance',
    href: '/vehicle-maintenance',
    icon: Truck,
    feature: 'vehicle-maintenance',
  },
  {
    title: 'Equipment Maintenance',
    titleKey: 'sidebar.equipmentMaintenance',
    href: '/equipment-maintenance',
    icon: Wrench,
    feature: 'equipment-maintenance',
  },
  {
    title: 'Review',
    titleKey: 'sidebar.review',
    href: '/reviews',
    icon: Star,
    feature: 'reviews',
  },
  {
    title: 'Daily Safety Reports',
    titleKey: 'sidebar.dailySafetyReports',
    href: '/daily-safety-reports',
    icon: ShieldCheck,
    feature: 'daily-safety-reports',
  },
]

const settingsItems: NavItem[] = [
  {
    title: 'Profile',
    titleKey: 'sidebar.profile',
    href: '/settings/profile',
    icon: User,
    feature: 'profile',
  },
  {
    title: 'Password',
    titleKey: 'sidebar.password',
    href: '/settings/password',
    icon: Lock,
    feature: 'profile',
  },
  {
    title: 'Terms',
    titleKey: 'sidebar.terms',
    href: '/settings/terms',
    icon: FileText,
    feature: 'profile',
  },
  {
    title: 'Privacy',
    titleKey: 'sidebar.privacy',
    href: '/settings/privacy',
    icon: Shield,
    feature: 'profile',
  },
  {
    title: 'About Us',
    titleKey: 'sidebar.aboutUs',
    href: '/settings/about-us',
    icon: Info,
    feature: 'profile',
  },
]

function filterNavByRole(items: NavItem[], userRole: UserRole): NavItem[] {
  return items
    .map((item) => {
      if (!item.children) {
        const feature = item.feature
        if (!feature || hasFeatureAccess(userRole, feature)) return item
        return null
      }
      const filteredChildren = item.children.filter((child) => {
        const childFeature = child.feature ?? item.feature
        if (!childFeature) return true
        return hasFeatureAccess(userRole, childFeature)
      })
      const hasParentAccess = item.feature
        ? hasFeatureAccess(userRole, item.feature)
        : true
      if (!hasParentAccess || filteredChildren.length === 0) return null
      return { ...item, children: filteredChildren }
    })
    .filter((item): item is NavItem => item !== null)
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const { t } = useTranslation()

  const userRole = (user?.role as UserRole) ?? UserRole.SUPER_ADMIN
  const filteredNavItems = filterNavByRole(navItems, userRole)
  const filteredSettingsItems = filterNavByRole(settingsItems, userRole)

  const isSettingsActive = location.pathname.startsWith('/settings')

  // Ensure desktop view is always expanded without needing a reload
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024 // Tailwind's lg breakpoint
      if (isDesktop && sidebarCollapsed) {
        dispatch(setSidebarCollapsed(false))
      }
    }

    // Run once on mount
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [dispatch, sidebarCollapsed])

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40  bg-black/50 backdrop-blur-sm lg:hidden transition-opacity',
          sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => dispatch(toggleSidebar())}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white shadow-sm transition-all duration-300',
          'flex flex-col',
          sidebarCollapsed ? 'w-[280px]' : 'w-[280px]',
          'lg:translate-x-0',
          sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-28 px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="">
              <div className="text-primary text-white font-bold text-lg  w-72  mx-auto hidden lg:block">
                <img src="/assets/image3.svg" alt="manny Flores" className="" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                {t('sidebar.mainMenu')}
              </p>
            )}
            {filteredNavItems.map((item) => (
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
                {t('sidebar.settings')}
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
                <TooltipContent side="right">{t('sidebar.settings')}</TooltipContent>
              </Tooltip>
            ) : (
              filteredSettingsItems.map((item) => (
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
              {t('sidebar.footer')}
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
  const location = useLocation()
  const { t } = useTranslation()
  const hasChildren = item.children && item.children.length > 0
  const isParentActive = hasChildren
    ? item.children!.some((c) => location.pathname === c.href || location.pathname.startsWith(c.href + '/'))
    : false
  const [isExpanded, setIsExpanded] = React.useState(isParentActive)

  const translatedTitle = t(item.titleKey)

  React.useEffect(() => {
    if (isParentActive) setIsExpanded(true)
  }, [isParentActive])

  if (hasChildren && !collapsed) {
    return (
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'group flex w-full items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200',
            'hover:bg-[#00A63E] hover:text-[#fff]',
            isParentActive ? 'bg-[#00A63E] text-[#fff] font-semibold' : 'text-[#374151]'
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0 text-current" />
          <span className="font-medium flex-1 text-left">{translatedTitle}</span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
        {isExpanded && (
          <div className="ml-4 space-y-0.5 border-l-2 border-[#00A63E]/30 pl-3">
            {item.children!.map((child) => {
              const ChildIcon = child.icon
              return (
                <NavLink
                  key={child.href}
                  to={child.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200',
                      'hover:bg-[#00A63E] hover:text-[#fff]',
                      isActive
                        ? 'bg-[#00A63E] text-[#fff] font-semibold'
                        : 'text-[#4B5563]'
                    )
                  }
                >
                  <ChildIcon className="h-4 w-4 flex-shrink-0 text-current" />
                  <span className="text-sm font-medium">{t(child.titleKey)}</span>
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const linkContent = (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200',
          'hover:bg-[#00A63E] hover:text-[#fff]',
          collapsed && 'justify-center',
          isActive
            ? 'bg-[#00A63E] text-[#fff] font-semibold'
            : 'text-[#4B5563]'
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0 text-current" />
      {!collapsed && <span className="font-medium">{translatedTitle}</span>}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{translatedTitle}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}
