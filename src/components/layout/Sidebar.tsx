import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { UserRole, hasFeatureAccess, type FeatureKey } from '@/types/roles'
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  User,
  Lock,
  FileText,
  Shield,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Store,
  Layers,
  Coffee,
  Package,
  Mail,
  Bell,
  ImageIcon,
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
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleSidebar } from '@/redux/slices/uiSlice'
import { cn } from '@/utils/cn'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  feature?: FeatureKey
  children?: (NavItem & { feature?: FeatureKey })[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    feature: 'dashboard',
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingBag,
    feature: 'orders',
  },
  {
    title: 'Shop Management',
    href: '/shop-management/customise',
    icon: Store,
    feature: 'shop-management',
    children: [
      {
        title: 'Customise',
        href: '/shop-management/customise',
        icon: Coffee,
      },
      {
        title: 'Category',
        href: '/shop-management/category',
        icon: Layers,
      },
      {
        title: 'Shop',
        href: '/shop-management/shop',
        icon: Store,
        feature: 'shop-management-shop',
      },
      {
        title: 'Products',
        href: '/shop-management/products',
        icon: Package,
      },
    ],
  },
  // {
  //   title: 'Booking Management',
  //   href: '/booking-management',
  //   icon: ListOrdered,
  // },


  // {
  //   title: 'Agency Management',
  //   href: '/agency-management',
  //   icon: Building,
  // },
  // {
  //   title: 'Calendar',
  //   href: '/calender',
  //   icon: Calendar,
  // },
  {
    title: 'Company & Projects',
    href: '/company-projects',
    icon: Building2,
    feature: 'company-projects',
  },
  {
    title: 'Customer Management',
    href: '/customer-management',
    icon: UserCircle,
    feature: 'customer-management',
  },
  {
    title: 'Customer & Finance',
    href: '/customer-finance',
    icon: Wallet,
    feature: 'customer-finance',
  },
  {
    title: 'Employee Management',
    href: '/employee-management',
    icon: UserCog,
    feature: 'employee-management',
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: ClipboardCheck,
    feature: 'attendance',
  },
  {
    title: 'Vehicle Maintenance',
    href: '/vehicle-maintenance',
    icon: Truck,
    feature: 'vehicle-maintenance',
  },
  {
    title: 'Equipment Maintenance',
    href: '/equipment-maintenance',
    icon: Wrench,
    feature: 'equipment-maintenance',
  },
  {
    title: 'Review',
    href: '/reviews',
    icon: Star,
    feature: 'reviews',
  },
  {
    title: 'Communication',
    href: '/communication',
    icon: MessageCircle,
    feature: 'communication',
  },
  {
    title: 'Documents & Approvals',
    href: '/documents-approvals',
    icon: FileCheck,
    feature: 'documents-approvals',
  },
  {
    title: 'Project Scheduling',
    href: '/project-scheduling',
    icon: CalendarDays,
    feature: 'project-scheduling',
  },
  {
    title: 'Manage Materials',
    href: '/manage-materials',
    icon: Package2,
    feature: 'manage-materials',
  },
  {
    title: 'Revenue',
    href: '/transactions-history',
    icon: CreditCard,
    feature: 'revenue',
  },
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
    feature: 'user-management',
  },
  {
    title: 'Subscribers',
    href: '/subscribers',
    icon: Mail,
    feature: 'subscribers',
  },
  {
    title: 'Ad Management',
    href: '/ad-management',
    icon: ImageIcon,
    feature: 'ad-management',
  },
  {
    title: 'Push Notification',
    href: '/push-notification',
    icon: Bell,
    feature: 'push-notification',
  },
  {
    title: 'Controllers',
    href: '/controllers',
    icon: ShieldCheck,
    feature: 'controllers',
  },
]

const settingsItems: NavItem[] = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    feature: 'profile',
  },
  {
    title: 'Password',
    href: '/settings/password',
    icon: Lock,
    feature: 'profile',
  },
  {
    title: 'Terms',
    href: '/settings/terms',
    icon: FileText,
    feature: 'profile',
  },
  {
    title: 'Privacy',
    href: '/settings/privacy',
    icon: Shield,
    feature: 'profile',
  },
  // {
  //   title: 'FAQ',
  //   href: '/settings/faq',
  //   icon: HelpCircle,
  // },
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

  const userRole = (user?.role as UserRole) ?? UserRole.SUPER_ADMIN
  const filteredNavItems = filterNavByRole(navItems, userRole)
  const filteredSettingsItems = filterNavByRole(settingsItems, userRole)

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
          'fixed top-0 left-0 z-50 h-full bg-card shadow-sm transition-all duration-300',
          'flex flex-col',
          sidebarCollapsed ? 'w-[80px]' : 'w-[280px]',
          'lg:translate-x-0',
          sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-28 px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="">
              <div className="text-primary text-white font-bold text-lg">
                {/* <img src="/assets/logo.png" alt="Motly" className="" /> */}
                <span className="text-primary font-bold text-2xl">LOGO</span>
              </div>
            </div>
            {/* {!sidebarCollapsed && (
              <span className="font-display font-bold text-xl text-accent">Dashboard</span>
            )} */}
          </div>
          {/* <Button
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
          </Button> */}
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
              © 2026 coffecito v1.0
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
  const hasChildren = item.children && item.children.length > 0
  const isParentActive = hasChildren
    ? item.children!.some((c) => location.pathname === c.href || location.pathname.startsWith(c.href + '/'))
    : false
  const [isExpanded, setIsExpanded] = React.useState(isParentActive)

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
            isParentActive ? 'bg-[#00A63E]/80 text-[#fff]' : 'text-[#656565]'
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0 text-current" />
          <span className="font-medium flex-1 text-left">{item.title}</span>
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
                      isActive ? 'bg-[#195ABE] text-[#fff] shadow-md' : 'text-[#656565]'
                    )
                  }
                >
                  <ChildIcon className="h-4 w-4 flex-shrink-0 text-current" />
                  <span className="text-sm font-medium">{child.title}</span>
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
          isActive ? 'bg-[#00A63E] text-[#fff] shadow-md' : 'text-[#656565]'
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




