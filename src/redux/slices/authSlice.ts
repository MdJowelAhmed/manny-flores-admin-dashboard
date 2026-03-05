import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserRole } from '@/types/roles'

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole]

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRoleValue
  businessId?: string
  businessName?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  passwordResetEmail: string | null
  verificationEmail: string | null
}

function getInitialAuthState(): AuthState {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  let user: User | null = null
  if (token && userStr) {
    try {
      const parsed = JSON.parse(userStr) as User
      if (Object.values(UserRole).includes(parsed.role)) {
        user = parsed
      }
    } catch {
      // Invalid user data in storage
    }
  }
  return {
    user,
    token,
    isAuthenticated: !!(token && user),
    isLoading: false,
    error: null,
    passwordResetEmail: null,
    verificationEmail: null,
  }
}

const initialState: AuthState = getInitialAuthState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    setPasswordResetEmail: (state, action: PayloadAction<string>) => {
      state.passwordResetEmail = action.payload
    },
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      if (token && userStr) {
        try {
          const parsed = JSON.parse(userStr) as User
          if (Object.values(UserRole).includes(parsed.role)) {
            state.user = parsed
            state.token = token
            state.isAuthenticated = true
          }
        } catch {
          // Invalid user data in storage
        }
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setPasswordResetEmail,
  setVerificationEmail,
  clearError,
  setLoading,
  loadUserFromStorage,
} = authSlice.actions

export default authSlice.reducer












