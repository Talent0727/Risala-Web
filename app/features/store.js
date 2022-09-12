import { configureStore } from '@reduxjs/toolkit'

/******************* Redux States *******************/
import chatSlice            from '../features/chat';
import callSettingsSlice    from './callSettings';
/****************************************************/

const store = configureStore({ 
  middleware: getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
  reducer: {
    chatReducer: chatSlice,
    callSettingReducer: callSettingsSlice
  },
})

export default store