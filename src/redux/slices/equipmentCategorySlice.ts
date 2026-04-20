import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { EquipmentCategory } from '@/types'

interface EquipmentCategoryState {
  list: EquipmentCategory[]
}

const now = () => new Date().toISOString()

const seed: EquipmentCategory[] = [
  { id: 'ec-small', name: 'Small Tool', createdAt: now(), updatedAt: now() },
  { id: 'ec-heavy', name: 'Heavy Machinery', createdAt: now(), updatedAt: now() },
  { id: 'ec-power', name: 'Power Tool', createdAt: now(), updatedAt: now() },
  { id: 'ec-hand', name: 'Hand Tool', createdAt: now(), updatedAt: now() },
]

const initialState: EquipmentCategoryState = {
  list: seed,
}

const equipmentCategorySlice = createSlice({
  name: 'equipmentCategories',
  initialState,
  reducers: {
    setEquipmentCategories: (state, action: PayloadAction<EquipmentCategory[]>) => {
      state.list = action.payload
    },
    addEquipmentCategory: (state, action: PayloadAction<EquipmentCategory>) => {
      state.list.unshift(action.payload)
    },
    updateEquipmentCategory: (state, action: PayloadAction<EquipmentCategory>) => {
      const i = state.list.findIndex((c) => c.id === action.payload.id)
      if (i !== -1) {
        state.list[i] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteEquipmentCategory: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload)
    },
  },
})

export const {
  setEquipmentCategories,
  addEquipmentCategory,
  updateEquipmentCategory,
  deleteEquipmentCategory,
} = equipmentCategorySlice.actions
export default equipmentCategorySlice.reducer

