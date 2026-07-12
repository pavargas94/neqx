import { configureStore } from '@reduxjs/toolkit'
import formReducer from './formSlice'
import reportReducer from './reportSlice'

export const store = configureStore({
  reducer: {
    form: formReducer,
    report: reportReducer,
  },
})
