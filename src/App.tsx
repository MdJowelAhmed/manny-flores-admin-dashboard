import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute'
import { UserRole } from '@/types/roles'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { loadUserFromStorage } from '@/redux/slices/authSlice'

// Auth Pages
import { Login, ForgotPassword, VerifyEmail, ResetPassword } from '@/pages/Auth'

// Dashboard Pages
import Dashboard from '@/pages/Dashboard'
import UserList from '@/pages/Users/UserList'
import ProductList from '@/pages/Products/ProductList'
import CategoryList from '@/pages/Categories/CategoryList'
import ProfileSettings from '@/pages/Settings/Profile/ProfileSettings'
import ChangePassword from '@/pages/Settings/ChangePassword/ChangePassword'
import TermsSettings from '@/pages/Settings/Terms/TermsSettings'
import PrivacySettings from '@/pages/Settings/Privacy/PrivacySettings'
import BookingManagement from './pages/Booking/BookingManagement'
import OrderList from './pages/Orders/OrderList'
// import AddCar from './pages/carlist/AddCar'
import ClientManagement from './pages/ClientManagement/ClientManagement'
import AgencyManagement from './pages/agency-management/AgencyManagement'
import Calender from './pages/calender/Calender'
import TransactionsHistory from './pages/transictions-history/TransactionsHistory'
import FAQ from './pages/FAQ/FAQ'
import NotFound from './pages/NotFound/NotFound'
import Customise from './pages/ShopManagement/Customise/Customise'
import ShopCategory from './pages/ShopManagement/Category/ShopCategory'
import ShopList from './pages/ShopManagement/Shop/ShopList'
import ShopProducts from './pages/ShopManagement/Products/ShopProducts'
import SubscriberList from './pages/Subscribers/SubscriberList'
import AdManagement from './pages/AdManagement/AdManagement'
import PushNotificationList from './pages/PushNotification/PushNotificationList'
import ControllerList from './pages/Controllers/ControllerList'
import CompanyProjects from './pages/CompanyProjects/CompanyProjects'
import CustomerManagement from './pages/CustomerManagement/CustomerManagement'
import EmployeeManagement from './pages/EmployeeManagement/EmployeeManagement'
import VehicleMaintenance from './pages/VehicleMaintenance/VehicleMaintenance'
import EquipmentMaintenance from './pages/EquipmentMaintenance/EquipmentMaintenance'
import ReviewList from './pages/Reviews/ReviewList'
import Communication from './pages/Communication/Communication'
import DocumentsApprovals from './pages/DocumentsApprovals/DocumentsApprovals'
import ProjectScheduling from './pages/ProjectScheduling/ProjectScheduling'
import ManageMaterials from './pages/ManageMaterials/ManageMaterials'
import CustomerFinance from './pages/CustomerFinance/CustomerFinance'
import Attendance from './pages/Attendance/Attendance'
import PayrollManagement from './pages/PayrollManagement/PayrollManagement'
import AttendanceDetail from './pages/Attendance/AttendanceDetail'

function AppEntryRedirect() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Navigate to="/dashboard" replace />
}

function App() {
  const dispatch = useAppDispatch()

  // Load user from storage on app mount
  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  return (
    <TooltipProvider>
      <Routes>
        {/* Auth Routes - No sidebar/header */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AppEntryRedirect />} />

          {/* Dashboard - All roles */}
          <Route
            path="dashboard"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING]}>
                <Dashboard />
              </RoleBasedRoute>
            }
          />

          {/* User Management - Super Admin only */}
          <Route
            path="users"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <UserList />
              </RoleBasedRoute>
            }
          />

          {/* Subscribers - Super Admin, Admin, Marketing */}
          <Route
            path="subscribers"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING]}>
                <SubscriberList />
              </RoleBasedRoute>
            }
          />

          {/* Ad Management - Super Admin, Marketing */}
          <Route
            path="ad-management"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.MARKETING]}>
                <AdManagement />
              </RoleBasedRoute>
            }
          />

          {/* Push Notification - Super Admin, Admin, Marketing */}
          <Route
            path="push-notification"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING]}>
                <PushNotificationList />
              </RoleBasedRoute>
            }
          />

          {/* Controllers - Super Admin only */}
          <Route
            path="controllers"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <ControllerList />
              </RoleBasedRoute>
            }
          />

          {/* Agency Management - Super Admin only */}
          <Route
            path="agency-management"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <AgencyManagement />
              </RoleBasedRoute>
            }
          />

          {/* Company & Projects - Super Admin, Admin */}
          <Route
            path="company-projects"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <CompanyProjects />
              </RoleBasedRoute>
            }
          />

          {/* Customer Management - Super Admin, Admin */}
          <Route
            path="customer-management"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <CustomerManagement />
              </RoleBasedRoute>
            }
          />

          {/* Employee Management - Super Admin, Admin */}
          <Route
            path="employee-management"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <EmployeeManagement />
              </RoleBasedRoute>
            }
          />

          {/* Vehicle Maintenance - Super Admin, Admin */}
          <Route
            path="vehicle-maintenance"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <VehicleMaintenance />
              </RoleBasedRoute>
            }
          />

          {/* Equipment Maintenance - Super Admin, Admin */}
          <Route
            path="equipment-maintenance"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <EquipmentMaintenance />
              </RoleBasedRoute>
            }
          />

          {/* Reviews - Super Admin, Admin, Marketing */}
          <Route
            path="reviews"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING]}>
                <ReviewList />
              </RoleBasedRoute>
            }
          />

          {/* Communication - Super Admin, Admin, Marketing */}
          <Route
            path="communication"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING]}>
                <Communication />
              </RoleBasedRoute>
            }
          />

          {/* Documents & Approvals - Super Admin, Admin */}
          <Route
            path="documents-approvals"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <DocumentsApprovals />
              </RoleBasedRoute>
            }
          />

          {/* Project Scheduling - Super Admin, Admin */}
          <Route
            path="project-scheduling"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <ProjectScheduling />
              </RoleBasedRoute>
            }
          />

          {/* Manage Materials - Super Admin, Admin */}
          <Route
            path="manage-materials"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <ManageMaterials />
              </RoleBasedRoute>
            }
          />

          {/* Customer & Finance - Super Admin, Admin */}
          <Route
            path="customer-finance"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <CustomerFinance />
              </RoleBasedRoute>
            }
          />

          {/* Payroll Management - Super Admin, Admin */}
          <Route
            path="payroll-management"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <PayrollManagement />
              </RoleBasedRoute>
            }
          />

          {/* Attendance - Super Admin, Admin */}
          <Route path="attendance">
            <Route
              index
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <Attendance />
                </RoleBasedRoute>
              }
            />
            <Route
              path="employee/:employeeSlug"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <AttendanceDetail />
                </RoleBasedRoute>
              }
            />
          </Route>

          {/* Revenue - Super Admin, Admin */}
          <Route
            path="transactions-history"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <TransactionsHistory />
              </RoleBasedRoute>
            }
          />

          {/* Orders - Super Admin, Admin */}
          <Route
            path="orders"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                <OrderList />
              </RoleBasedRoute>
            }
          />

          {/* Super Admin only */}
          <Route path="booking-management" element={<BookingManagement />} />
          <Route path="calender" element={<Calender />} />
          <Route path="clients" element={<ClientManagement />} />
          <Route path="products" element={<ProductList />} />
          <Route path="categories" element={<CategoryList />} />

          {/* Shop Management - Super Admin, Admin (Shop page is super-admin only, handled in Sidebar) */}
          <Route path="shop-management">
            <Route index element={<Navigate to="/shop-management/customise" replace />} />
            <Route
              path="customise"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <Customise />
                </RoleBasedRoute>
              }
            />
            <Route
              path="category"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <ShopCategory />
                </RoleBasedRoute>
              }
            />
            <Route
              path="shop"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <ShopList />
                </RoleBasedRoute>
              }
            />
            <Route
              path="products"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <ShopProducts />
                </RoleBasedRoute>
              }
            />
          </Route>

          {/* Settings - Super Admin, Admin (Profile) */}
          <Route path="settings">
            <Route
              path="profile"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <ProfileSettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="password"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <ChangePassword />
                </RoleBasedRoute>
              }
            />
            <Route
              path="terms"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <TermsSettings />
                </RoleBasedRoute>
              }
            />
            <Route
              path="privacy"
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <PrivacySettings />
                </RoleBasedRoute>
              }
            />
            <Route path="faq" element={<FAQ />} />
          </Route>
        </Route>

        {/* Catch all - 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  )
}

export default App
