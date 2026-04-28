import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleSidebar } from '@/redux/slices/uiSlice'
import { logout } from '@/redux/slices/authSlice'
import { getInitials } from '@/utils/formatters'
import { SAMPLE_NOTIFICATIONS } from '@/pages/Notifications/notificationData'
import type { Notification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'

const routeTitleKeys: Record<string, string> = {
  '/dashboard': 'header.routeTitles.dashboard',
  '/notifications': 'header.routeTitles.notifications',
  '/recent-projects': 'header.routeTitles.recentProjects',
  '/company-projects': 'header.routeTitles.companyProjects',
  '/customer-management': 'header.routeTitles.customerManagement',
  '/employee-management': 'header.routeTitles.employeeManagement',
  '/attendance': 'header.routeTitles.attendance',
  '/communication': 'header.routeTitles.communication',
  '/customer-finance': 'header.routeTitles.customerFinance',
  '/payments': 'header.routeTitles.payments',
  '/manage-materials': 'header.routeTitles.manageMaterials',
  '/project-scheduling': 'header.routeTitles.projectScheduling',
  '/documents-approvals': 'header.routeTitles.documentsApprovals',
  '/payroll-management': 'header.routeTitles.payrollManagement',
  '/resource-requests-report': 'header.routeTitles.resourceRequestsReport',
  '/change-orders': 'header.routeTitles.changeOrders',
  '/vehicle-maintenance': 'header.routeTitles.vehicleMaintenance',
  '/equipment-maintenance': 'header.routeTitles.equipmentMaintenance',
  '/reviews': 'header.routeTitles.reviews',
  '/daily-safety-reports': 'header.routeTitles.dailySafetyReports',
  '/orders': 'header.routeTitles.orders',
  '/booking-management': 'header.routeTitles.bookingManagement',
  '/calender': 'header.routeTitles.calendar',
  '/transactions-history': 'header.routeTitles.revenueList',
  '/client-management': 'header.routeTitles.clientManagement',
  '/agency-management': 'header.routeTitles.agencyManagement',
  '/users': 'header.routeTitles.userManagement',
  '/products': 'header.routeTitles.productManagement',
  '/categories': 'header.routeTitles.categoryManagement',
  '/settings/profile': 'header.routeTitles.profileSettings',
  '/settings/password': 'header.routeTitles.changePassword',
  '/settings/terms': 'header.routeTitles.termsConditions',
  '/settings/privacy': 'header.routeTitles.privacyPolicy',
  '/settings/about-us': 'header.routeTitles.aboutUs',
}

const RECENT_NOTIFICATIONS_COUNT = 3

function NotificationItem({ notification }: { notification: Notification }) {


  return (
    <div className="py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-accent">{notification.title}</p>
          <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
          </div>
      </div>
    </div>
  )
}

export function Header() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [notificationModalOpen, setNotificationModalOpen] = useState(false)
  // const { theme } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language

  const titleKey = routeTitleKeys[location.pathname] || 'header.routeTitles.dashboard'
  const pageTitle = t(titleKey)
  const recentNotifications = SAMPLE_NOTIFICATIONS.slice(0, RECENT_NOTIFICATIONS_COUNT)

  const handleViewAllNotifications = () => {
    setNotificationModalOpen(false)
    navigate('/notifications')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/auth/login')
  }

  const handleLanguageToggle = () => {
    const newLang = currentLanguage === 'en' ? 'es' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="sticky top-0 z-30 h-20 shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm lg:text-xl font-semibold text-accent">{pageTitle}</h1>
            <p className="text-sm text-accent hidden sm:block">
              {t('header.welcomeBack')} {user?.firstName || 'Admin'}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Language Toggle (English, Spanish) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLanguageToggle}
          >
            {
              currentLanguage === 'en' ? (
                <div className="h-8 w-8 text-accent flex items-center gap-2">
                  <img src="/assets/english.png" alt="English" className="h-6 w-7 rounded-full" />
                  <span className="text-xs text-accent">ENG</span>
                </div>
              ) : (
                <div className="h-8 w-8 text-accent flex items-center gap-2">
                  <img src="/assets/spain.png" alt="Spanish" className="h-6 w-7 rounded-full" />
                  <span className="text-xs text-accent">ESP</span>
                </div>
              )
            }
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationModalOpen(true)}
          >
            <Bell className="h-8 w-8 text-accent" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <ModalWrapper
            open={notificationModalOpen}
            onClose={() => setNotificationModalOpen(false)}
            title={t('header.notifications')}
            size="md"
            className="bg-white"
            footer={
              <Button
                variant="outline"
                className="w-full"
                onClick={handleViewAllNotifications}
              >
                {t('header.viewAll')}
              </Button>
            }
          >
            <div className="space-y-0">
              {recentNotifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          </ModalWrapper>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-white bg-primary" >
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : t('header.adminUser')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'superadmin@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                <User className="h-4 w-4 mr-2" />
                {t('header.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/password')}>
                <Settings className="h-4 w-4 mr-2" />
                {t('header.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t('header.logOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
