import { configureStore } from '@reduxjs/toolkit'
import complaints from './complaintsSlice'
import intake from './intakeSlice'
import chat from './chatSlice'

export const store = configureStore({ reducer: { complaints, intake, chat } })
