import { configureStore } from '@reduxjs/toolkit'
import formReducer from './formSlice'
import reportReducer from './reportSlice'
import authReducer from './authSlice'
import constantsReducer from './constantsSlice'

export const store = configureStore({
  reducer: {
    form: formReducer,
    report: reportReducer,
    auth: authReducer,
    constants: constantsReducer,
  },
})
