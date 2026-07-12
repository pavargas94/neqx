import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DEFAULT_CONSTANTS } from '../data/constants'
import { constantsService } from '../services/constantsService'
import { logout } from './authSlice'

export const fetchFormConstants = createAsyncThunk(
  'constants/fetchFormConstants',
  async () => constantsService.fetchFormConstants(),
)

const constantsSlice = createSlice({
  name: 'constants',
  initialState: {
    data: DEFAULT_CONSTANTS,
    source: 'local',
    loading: false,
    loaded: false,
    error: null,
  },
  reducers: {
    resetConstants(state) {
      state.data = DEFAULT_CONSTANTS
      state.source = 'local'
      state.loading = false
      state.loaded = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormConstants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFormConstants.fulfilled, (state, action) => {
        const { source, ...data } = action.payload
        state.data = data
        state.source = source
        state.loading = false
        state.loaded = true
      })
      .addCase(fetchFormConstants.rejected, (state, action) => {
        state.loading = false
        state.loaded = true
        state.error = action.error.message || 'No se pudieron cargar las constantes.'
        state.data = DEFAULT_CONSTANTS
        state.source = 'local'
      })
      .addCase(logout.fulfilled, (state) => {
        state.data = DEFAULT_CONSTANTS
        state.source = 'local'
        state.loading = false
        state.loaded = false
        state.error = null
      })
  },
})

export const { resetConstants } = constantsSlice.actions
export default constantsSlice.reducer
