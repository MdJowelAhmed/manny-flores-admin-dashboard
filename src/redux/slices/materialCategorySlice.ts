import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { MaterialCategory } from '@/types'

interface MaterialCategoryState {
  list: MaterialCategory[]
}

const now = () => new Date().toISOString()

const seed: MaterialCategory[] = [
  { id: 'mc-soil', name: 'Soil', createdAt: now(), updatedAt: now() },
  { id: 'mc-raw', name: 'Raw Material', createdAt: now(), updatedAt: now() },
  { id: 'mc-building', name: 'Building', createdAt: now(), updatedAt: now() },
  { id: 'mc-other', name: 'Other', createdAt: now(), updatedAt: now() },
]

const initialState: MaterialCategoryState = {
  list: seed,
}

const materialCategorySlice = createSlice({
  name: 'materialCategories',
  initialState,
  reducers: {
    setMaterialCategories: (state, action: PayloadAction<MaterialCategory[]>) => {
      state.list = action.payload
    },
    addMaterialCategory: (state, action: PayloadAction<MaterialCategory>) => {
      state.list.unshift(action.payload)
    },
    updateMaterialCategory: (state, action: PayloadAction<MaterialCategory>) => {
      const i = state.list.findIndex((c) => c.id === action.payload.id)
      if (i !== -1) {
        state.list[i] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteMaterialCategory: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload)
    },
  },
})

export const {
  setMaterialCategories,
  addMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
} = materialCategorySlice.actions
export default materialCategorySlice.reducer
