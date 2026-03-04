import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import productReducer from './slices/productSlice'
import categoryReducer from './slices/categorySlice'
import uiReducer from './slices/uiSlice'
import bookingReducer from './slices/bookingSlice'
import carReducer from './slices/carSlice'
import clientReducer from './slices/clientSlice'
import agencyReducer from './slices/agencySlice'
import calendarReducer from './slices/calendarSlice'
import transactionReducer from './slices/transactionSlice'
import orderReducer from './slices/orderSlice'
import faqReducer from './slices/faqSlice'
import milkTypeReducer from './slices/milkTypeSlice'
import syrupTypeReducer from './slices/syrupTypeSlice'
import shopCategoryReducer from './slices/shopCategorySlice'
import shopReducer from './slices/shopSlice'
import shopProductReducer from './slices/shopProductSlice'
import subscriberReducer from './slices/subscriberSlice'
import pushNotificationReducer from './slices/pushNotificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    categories: categoryReducer,
    ui: uiReducer,
    bookings: bookingReducer,
    cars: carReducer,
    clients: clientReducer,
    agencies: agencyReducer,
    calendar: calendarReducer,
    transactions: transactionReducer,
    orders: orderReducer,
    faqs: faqReducer,
    milkTypes: milkTypeReducer,
    syrupTypes: syrupTypeReducer,
    shopCategories: shopCategoryReducer,
    shops: shopReducer,
    shopProducts: shopProductReducer,
    subscribers: subscriberReducer,
    pushNotifications: pushNotificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
