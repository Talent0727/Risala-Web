import { configureStore } from '@reduxjs/toolkit'

/******************* Redux States *******************/
import languageReducer      from '../features/language';
import chatSlice            from '../features/chat';
import callSettingsSlice    from './callSettings';
/****************************************************/

const store = configureStore({ 
  middleware: getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
  reducer: {
    language: languageReducer,
    chatReducer: chatSlice,
    callSettingReducer: callSettingsSlice
  },
})

export default store