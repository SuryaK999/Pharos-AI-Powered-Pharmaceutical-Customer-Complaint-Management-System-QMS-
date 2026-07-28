import { configureStore } from '@reduxjs/toolkit'
import complaints from './complaintsSlice'
import intake from './intakeSlice'

export const store = configureStore({ reducer: { complaints, intake } })
