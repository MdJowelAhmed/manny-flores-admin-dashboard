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

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/notifications': 'Notifications',
  '/orders': 'Orders',
  '/booking-management': 'Booking Management',
  '/calender': 'Calendar',
  '/transactions-history': 'Revenue List',
  '/client-management': 'Client Management',
  '/agency-management': 'Agency Management',
  '/users': 'User Management',
  '/products': 'Product Management',
  '/categories': 'Category Management',
  '/settings/profile': 'Profile Settings',
  '/settings/password': 'Change Password',
  '/settings/terms': 'Terms & Conditions',
  '/settings/privacy': 'Privacy Policy',
  '/settings/about-us': 'About Us',
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
  const [language, setLanguage] = useState('en')
  const pageTitle = routeTitles[location.pathname] || 'Dashboard'
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
    setLanguage(language === 'en' ? 'es' : 'en')
    console.log(language)
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
            <h1 className="text-xl font-semibold text-accent">{pageTitle}</h1>
            <p className="text-sm text-accent hidden sm:block">
              Welcome back, {user?.firstName || 'Admin'}
            </p>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="pl-9 bg-muted/50"
            />
          </div>
        </div> */}

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Theme toggle */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-accent" />
            ) : (
              <Sun className="h-5 w-5 text-accent" />
            )}
          </Button> */}

          {/* Language Toggle (English, Spanish) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLanguageToggle}
          >
            {
              language === 'en' ? (
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
            title="Notifications"
            size="md"
            className="bg-white"
            footer={
              <Button
                variant="outline"
                className="w-full"
                onClick={handleViewAllNotifications}
              >
                View All
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
                    {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'superadmin@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/password')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
