// ==================== User Types ====================
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
  address?: string
  city?: string
  country?: string
}

export type UserRole = 'admin' | 'user' | 'moderator' | 'editor'
export type UserStatus = 'active' | 'blocked' | 'pending' | 'inactive'

export interface UserFilters {
  search: string
  status: UserStatus | 'all'
  role: UserRole | 'all'
}

// ==================== Subscriber Types ====================
export interface Subscriber {
  id: string
  userName: string
  email: string
  date: string
  avatar?: string
}

export interface SubscriberFilters {
  search: string
  status: string
}

export interface SendMailPayload {
  dateFrom?: string
  dateTo?: string
  title: string
  description: string
}

// ==================== Push Notification Types ====================
export type NotificationType = 'Promotion' | 'Order Update' | 'Announcement' | 'Reminder'

export interface PushNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  date: string
  status: 'Sent' | 'Pending' | 'Failed'
}

export interface SendNotificationPayload {
  title: string
  message: string
  type: NotificationType
}

// ==================== Product Types ====================
export interface Product {
  id: string
  name: string
  description: string
  image?: string
  images?: string[]
  category: string
  categoryId: string
  price: number
  stock: number
  sku: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock'

export interface ProductFilters {
  search: string
  status: ProductStatus | 'all'
  categoryId: string | 'all'
  priceRange: {
    min: number | null
    max: number | null
  }
}

export interface ProductFormData {
  name: string
  description: string
  categoryId: string
  price: number
  stock: number
  sku: string
  status: ProductStatus
  image?: File | string
}

// ==================== Category Types ====================
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string | null
  status: CategoryStatus
  productCount: number
  createdAt: string
  updatedAt: string
}

export type CategoryStatus = 'active' | 'inactive'

export interface CategoryFilters {
  search: string
  status: CategoryStatus | 'all'
}

export interface CategoryFormData {
  name: string
  description?: string
  parentId?: string | null
  status: CategoryStatus
  image?: File | string
}

// ==================== Car Types ====================
export interface CarOwner {
  name: string
  email: string
  phone: string
}

export interface PricingConfig {
  oneDay: number
  threeDays: number
  sevenDays: number
  fourteenDays: number
  oneMonth: number
}

export interface WeekendConfig {
  selectedDays: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[]
  weekendPrice: number
}

export interface Car {
  id: string
  name: string
  carNumber?: string
  description: string
  image: string
  images?: string[]
  doors: number
  transmission: 'Automatic' | 'Manual'
  seats: number
  suitcases?: string
  location?: string
  fuelPolicy?: 'Full to Full' | 'Full to Empty' | 'Pre-paid' | 'Same to Same' | 'Fair'
  kilometers?: 'Unlimited Mileage' | '200km (per day limit)' | '400km (per day limit)' | '500km (per day limit)' | string
  climate?: 'Automatic' | 'Manual'
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
  amount: number // Legacy field - kept for backward compatibility
  priceDuration: string // Legacy field
  pricing?: PricingConfig // New pricing structure
  weekend?: WeekendConfig // Weekend pricing
  carClass: CarClass
  insuranceCoverage?: string
  termsConditions?: string
  owner?: CarOwner
  rating?: number
  isTopRated?: boolean
  isMostPopular?: boolean
  businessId?: string // For role-based filtering
  businessName?: string // For display purposes
  createdAt: string
  updatedAt: string
}

export interface CarFormData {
  name: string
  doors: number
  suitcases: string
  seats: number
  location: string
  fuelPolicy: string
  kilometers: string
  carClass: CarClass
  transmission: 'Automatic' | 'Manual'
  climate: string
  amount: number
  insuranceCoverage: string
  termsConditions: string
  images?: File[] | string[]
}

export type CarClass = 'Upper Class' | 'Small Cars' | 'Compact Class' | 'Middle Class' | 'Premium Class'

export interface CarFilters {
  search: string
  carClass: CarClass | 'all'
  transmission: ('Automatic' | 'Manual')[] | 'all'
  seats: (2 | 4 | 5 | 7 | 9)[] | 'all'
  fuelType: ('Petrol' | 'Diesel' | 'Electric' | 'Hybrid')[] | 'all'
  doors: (2 | 4 | 5)[] | 'all'
  mileageLimit: ('Unlimited Mileage' | '200km (per day limit)' | '400km (per day limit)' | '500km (per day limit)')[] | 'all'
  fuelPolicy: ('Full to Full' | 'Full to Empty' | 'Pre-paid' | 'Same to Same' | 'Fair')[] | 'all'
  rating: ('Top Rated' | 'Most Popular')[] | 'all'
}

// ==================== Ad / Poster Types ====================
export interface Poster {
  id: string
  imageUrl: string
  title: string
  description: string
  createdAt: string
}

// ==================== Pagination Types ====================
export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationState
}

// ==================== Modal Types ====================
export type ModalType = 
  | 'addUser' 
  | 'editUser' 
  | 'deleteUser'
  | 'addProduct' 
  | 'editProduct' 
  | 'deleteProduct'
  | 'addCategory' 
  | 'editCategory' 
  | 'deleteCategory'
  | 'addCar'
  | 'editCar'
  | 'deleteCar'
  | null

export interface ModalState {
  isOpen: boolean
  type: ModalType
  data?: unknown
}

// ==================== Table Types ====================
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// ==================== Settings Types ====================
export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  address?: string
  city?: string
  country?: string
  bio?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// ==================== Filter Option Types ====================
export interface SelectOption {
  value: string
  label: string
}

// ==================== Dashboard Stats Types ====================
export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  totalRevenue: number
  userGrowth: number
  productGrowth: number
  recentOrders: number
  pendingOrders: number
}

// ==================== Booking Types ====================
export interface Booking {
  id: string
  startDate: string
  endDate: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  carModel: string
  licensePlate: string
  carId?: string
  plan: string
  payment: string
  carImage?: string
  carName?: string, 
  paymentStatus: 'Paid' | 'Pending'
  status: BookingStatus
  businessId?: string // For role-based filtering
  businessName?: string // For display purposes
  // Extended car info
  carInfo?: {
    id: string
    name: string
    image?: string
    transmission?: 'Automatic' | 'Manual'
    seats?: number
    carClass?: string
    location?: string
    amount?: number
    priceDuration?: string
  }
  // Car owner info
  carOwner?: {
    name: string
    email: string
    phone: string
  }
  createdAt?: string
  updatedAt?: string
}

export type BookingStatus = 'Upcoming' | 'Runing' | 'Completed'

export interface BookingFilters {
  search: string
  status: BookingStatus | 'all'
}

export interface BookingFormData {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  carId: string
  startDate: string
  endDate: string
  plan: string
  payment: string
  paymentStatus: 'Paid' | 'Pending'
  status: BookingStatus
}

// ==================== Calendar Types ====================
export type CalendarViewRange = 10 | 15 | 30

export type CalendarPeriod = 'current' | 'previous'

export interface CalendarDay {
  /** ISO date string */
  date: string
  /** Short weekday label, e.g. Mon, Tue */
  label: string
  /** Day of month number */
  dayNumber: number
}

// ==================== Client Types ====================
export interface Client {
  id: string
  name: string
  phone: string
  email: string
  status: ClientStatus
  country: string
  gender?: string
  fullAddress?: string
  licenseNumber?: string
  licenseDocumentUrl?: string
  avatar?: string
  photo?: string
  createdAt: string
  updatedAt: string
}

export type ClientStatus = 'verified' | 'unverified' | 'requested'

export interface ClientFilters {
  search: string
  status: ClientStatus | 'all'
  country: string | 'all'
}

export interface ClientFormData {
  name: string
  phone: string
  email: string
  country: string
  photo?: File | string
}

// ==================== Agency Types ====================
export type AgencyStatus = 'active' | 'inactive'

export interface Agency {
  id: string
  name: string
  ownerName: string
  phone: string
  email: string
  country: string
  address: string
  totalCars: number
  completedOrders: number
  status: AgencyStatus
  logo?: string
  documents?: string[]
  createdAt: string
  updatedAt: string
}

export interface AgencyFilters {
  search: string
  status: AgencyStatus | 'all'
}

export interface AgencyFormData {
  name: string
  ownerName: string
  phone: string
  email: string
  country: string
  address: string
  logo?: File | string
  documents?: File[] | string[]
}

// ==================== FAQ Types ====================
export type FAQPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface FAQ {
  id: string
  question: string
  answer: string
  position: FAQPosition
  createdAt: string
  updatedAt: string
}

export interface FAQFilters {
  search: string
  position: FAQPosition | 'all'
}

export interface FAQFormData {
  question: string
  answer: string
  position: FAQPosition
}

// ==================== Order Types ====================
export type OrderStatus = 'Completed' | 'Processing' | 'Cancelled'

export interface Order {
  id: string
  orderId: string
  title: string
  image: string
  vendor: string
  date: string
  time: string
  itemCount: number
  amount: number
  status: OrderStatus
  transactionId?: string
  location?: string
  customizeItem?: string
  previousBalance?: number
  orderPrice?: number
  newBalance?: number
  tips?: number
  pickupTime?: string
  totalPrice?: number
  createdAt: string
  updatedAt: string
}

export interface OrderFilters {
  search: string
  status: OrderStatus | 'all'
}

// ==================== Transaction Types ====================
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled'

export interface Transaction {
  id: string
  transactionId: string
  date: string
  userName: string
  email: string
  amount: number
  currency?: string
  status: TransactionStatus
  paymentMethod?: string
  description?: string
  businessId?: string // For role-based filtering
  businessName?: string // For display purposes
  createdAt: string
  updatedAt: string
}

export interface TransactionFilters {
  search: string
  status: TransactionStatus | 'all'
}

// ==================== Shop Management Types ====================
export type CustomizeType = 'milk' | 'syrup'

export interface MilkType {
  id: string
  name: string
  price: number
  type: 'milk'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SyrupType {
  id: string
  name: string
  price: number
  type: 'syrup'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShopCategory {
  id: string
  name: string
  shortDescription: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Shop {
  id: string
  shopName: string
  contact: string
  location: string
  openTime: string
  closeTime: string
  offDay?: string
  aboutShop: string
  shopPicture?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShopProductMilkOrSyrup {
  id: string
  name: string
  price: number
}

export interface ShopProduct {
  id: string
  itemsName: string
  price: number
  categoryId: string
  categoryName?: string
  tags: string[]
  customizeType: 'both'
  pickupTime: string
  itemsPicture?: string
  milkTypes?: ShopProductMilkOrSyrup[]
  syrupTypes?: ShopProductMilkOrSyrup[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ==================== Super Admin Controller Types ====================
export type ControllerRole = 'admin' | 'marketing'

export interface Controller {
  id: string
  name: string
  email: string
  phone: string
  role: ControllerRole
  shopId?: string
  shopName?: string
  createdAt: string
  updatedAt: string
}

export interface ControllerFormData {
  name: string
  email: string
  phone: string
  password: string
  role: ControllerRole
  shopId?: string
}

// ==================== Company & Project Types ====================
export type ProjectStatus = 'Active' | 'Completed' | 'Pending'

export interface Project {
  id: string
  projectName: string
  category: string
  customer: string
  email: string
  company: string
  startDate: string
  totalBudget: number
  amountSpent: number
  duration: string
  remaining: number
  paymentMethod?: string
  status: ProjectStatus
  amountDue?: number
  description?: string
}

export interface ProjectFilters {
  search: string
  status: ProjectStatus | 'all'
}

// ==================== Customer Management Types ====================
export interface CustomerProject {
  id: string
  customerName: string
  project: string
  amount: number
  projectDate: string
}

// ==================== Employee Management Types ====================
export type EmployeeStatus = 'Active' | 'inactive'

export interface EmployeeProject {
  id: string
  projectName: string
  task: string
  deadline: string
  status: 'Active' | 'Complete'
}

export interface Employee {
  id: string
  employeeId: string
  fullName: string
  email: string
  department: string
  status: EmployeeStatus
  joiningDate: string
  role: string
  workSchedule: string
  projects?: EmployeeProject[]
}

// ==================== Vehicle Maintenance Types ====================
export type VehicleStatus = 'Available' | 'In Use' | 'Maintenance'

export interface VehicleAssignedEmployee {
  name: string
  project: string
  startDate: string
  location: string
}

export interface Vehicle {
  id: string
  vehicleName: string
  type: string
  assignedTo: string
  usage: string
  nextService: string
  status: VehicleStatus
  model: string
  year: string
  purchaseDate: string
  purchaseCost: string
  insuranceExpiry: string
  assignedEmployee?: VehicleAssignedEmployee
  lastService: string
}

// ==================== Equipment Maintenance Types ====================
export type EquipmentStatus = 'Available' | 'In Use' | 'Maintenance'

export interface EquipmentAssignedEmployee {
  name: string
  project: string
  startDate: string
  location: string
}

export interface Equipment {
  id: string
  equipmentName: string
  type: string
  assignedTo: string
  usage: string
  nextService: string
  status: EquipmentStatus
  model: string
  category: string
  purchaseDate: string
  purchaseCost: string
  warrantyExpiry: string
  assignedEmployee?: EquipmentAssignedEmployee
  lastService: string
}

// ==================== Review Types ====================
export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected'

export interface Review {
  id: string
  customerName: string
  projectName: string
  rating: number
  feedback: string
  status: ReviewStatus
}