import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { userFromToken } from '@/utils/jwt'
import type { AuthUserFromToken } from '@/utils/jwt'
import type { UserRoleType } from '@/types/roles'

export type User = AuthUserFromToken
export type UserRoleValue = UserRoleType

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  passwordResetEmail: string | null
  verificationEmail: string | null
}

function readAuthFromTokenStorage(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  if (typeof localStorage === 'undefined') {
    return { user: null, token: null, isAuthenticated: false }
  }

  const token = localStorage.getItem('token')
  if (!token) {
    return { user: null, token: null, isAuthenticated: false }
  }

  const user = userFromToken(token)
  if (!user) {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    return { user: null, token: null, isAuthenticated: false }
  }

  return { user, token, isAuthenticated: true }
}

function getInitialAuthState(): AuthState {
  const session = readAuthFromTokenStorage()
  return {
    ...session,
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
    loginSuccess: (state, action: PayloadAction<{ token: string; email?: string }>) => {
      const { token, email } = action.payload
      const user = userFromToken(token, email ?? '')

      if (!user) {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = 'Invalid session token'
        return
      }

      state.isLoading = false
      state.isAuthenticated = true
      state.user = user
      state.token = token
      state.error = null
      localStorage.setItem('token', token)
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
      localStorage.removeItem('refreshToken')
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
      const session = readAuthFromTokenStorage()
      state.user = session.user
      state.token = session.token
      state.isAuthenticated = session.isAuthenticated
    },
    setUserProfile: (
      state,
      action: PayloadAction<Partial<Pick<User, 'email' | 'firstName' | 'lastName' | 'avatar'>>>
    ) => {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }
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
  setUserProfile,
} = authSlice.actions

export default authSlice.reducer
