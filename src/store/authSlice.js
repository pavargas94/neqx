import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../services/authService'

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authService.signIn(email, password)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.signOut()
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    initialized: false,
    firebaseConfigured: authService.isConfigured(),
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      state.initialized = true
      state.firebaseConfigured = authService.isConfigured()
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setUser, clearAuthError } = authSlice.actions
export default authSlice.reducer
