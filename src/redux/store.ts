import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './baseApi'
import './api/authApi'
import './api/customerApi'
import './api/notificationApi'
import './api/categoryApi'
import './api/materialsApi'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import uiReducer from './slices/uiSlice'
import transactionReducer from './slices/transactionSlice'
import orderReducer from './slices/orderSlice'
import faqReducer from './slices/faqSlice'
import materialCategoryReducer from './slices/materialCategorySlice'
import vehicleCategoryReducer from './slices/vehicleCategorySlice'
import equipmentCategoryReducer from './slices/equipmentCategorySlice'
import subscriberReducer from './slices/subscriberSlice'
import pushNotificationReducer from './slices/pushNotificationSlice'
import controllerReducer from './slices/controllerSlice'
import adReducer from './slices/adSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    users: userReducer,
    ui: uiReducer,
    transactions: transactionReducer,
    orders: orderReducer,
    faqs: faqReducer,
    materialCategories: materialCategoryReducer,
    vehicleCategories: vehicleCategoryReducer,
    equipmentCategories: equipmentCategoryReducer,
    subscribers: subscriberReducer,
    pushNotifications: pushNotificationReducer,
    controllers: controllerReducer,
    ads: adReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
