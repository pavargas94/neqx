import { createSlice } from '@reduxjs/toolkit'

const reportSlice = createSlice({
  name: 'report',
  initialState: { nota: '' },
  reducers: {
    setNota(state, action) {
      state.nota = action.payload
    },
    limpiarNota(state) {
      state.nota = ''
    },
  },
})

export const { setNota, limpiarNota } = reportSlice.actions
export default reportSlice.reducer
