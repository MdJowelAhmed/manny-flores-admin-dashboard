import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { VehicleCategory } from '@/types'

interface VehicleCategoryState {
  list: VehicleCategory[]
}

const now = () => new Date().toISOString()

const seed: VehicleCategory[] = [
  { id: 'vc-light', name: 'Light Duty', createdAt: now(), updatedAt: now() },
  { id: 'vc-heavy', name: 'Heavy Duty', createdAt: now(), updatedAt: now() },
  { id: 'vc-special', name: 'Special Purpose', createdAt: now(), updatedAt: now() },
  { id: 'vc-other', name: 'Other', createdAt: now(), updatedAt: now() },
]

const initialState: VehicleCategoryState = {
  list: seed,
}

const vehicleCategorySlice = createSlice({
  name: 'vehicleCategories',
  initialState,
  reducers: {
    setVehicleCategories: (state, action: PayloadAction<VehicleCategory[]>) => {
      state.list = action.payload
    },
    addVehicleCategory: (state, action: PayloadAction<VehicleCategory>) => {
      state.list.unshift(action.payload)
    },
    updateVehicleCategory: (state, action: PayloadAction<VehicleCategory>) => {
      const i = state.list.findIndex((c) => c.id === action.payload.id)
      if (i !== -1) {
        state.list[i] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteVehicleCategory: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload)
    },
  },
})

export const {
  setVehicleCategories,
  addVehicleCategory,
  updateVehicleCategory,
  deleteVehicleCategory,
} = vehicleCategorySlice.actions
export default vehicleCategorySlice.reducer

