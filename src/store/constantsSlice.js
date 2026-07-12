import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DEFAULT_CONSTANTS } from '../data/constants'
import { constantsService } from '../services/constantsService'
import { logout } from './authSlice'

export const fetchFormConstants = createAsyncThunk(
  'constants/fetchFormConstants',
  async () => constantsService.fetchFormConstants(),
)

export const saveFormConstants = createAsyncThunk(
  'constants/saveFormConstants',
  async (data, { rejectWithValue }) => {
    try {
      return await constantsService.updateFormConstants(data)
    } catch (error) {
      return rejectWithValue(error.message || 'No se pudieron guardar los cambios.')
    }
  },
)

const constantsSlice = createSlice({
  name: 'constants',
  initialState: {
    data: DEFAULT_CONSTANTS,
    source: 'local',
    loading: false,
    loaded: false,
    saving: false,
    error: null,
    saveError: null,
    saveSuccess: false,
  },
  reducers: {
    resetConstants(state) {
      state.data = DEFAULT_CONSTANTS
      state.source = 'local'
      state.loading = false
      state.loaded = false
      state.saving = false
      state.error = null
      state.saveError = null
      state.saveSuccess = false
    },
    clearSaveStatus(state) {
      state.saveError = null
      state.saveSuccess = false
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
      .addCase(saveFormConstants.pending, (state) => {
        state.saving = true
        state.saveError = null
        state.saveSuccess = false
      })
      .addCase(saveFormConstants.fulfilled, (state, action) => {
        state.data = action.payload
        state.source = 'firestore'
        state.saving = false
        state.saveSuccess = true
      })
      .addCase(saveFormConstants.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.data = DEFAULT_CONSTANTS
        state.source = 'local'
        state.loading = false
        state.loaded = false
        state.saving = false
        state.error = null
        state.saveError = null
        state.saveSuccess = false
      })
  },
})

export const { resetConstants, clearSaveStatus } = constantsSlice.actions
export default constantsSlice.reducer
