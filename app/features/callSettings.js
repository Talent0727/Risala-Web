import { createSlice } from "@reduxjs/toolkit";

export const callSettingsSlice = createSlice({
    name: "callSettings",
    initialState: {
        isActive: false,
        isInCall: false,
        purpose: undefined,
        id: undefined,
        members: [],
        joined: [],
        initiator: undefined,
        userSettings: {
            isCam: false,
            isMuted: false,
            isPresenting: false
        },
        peerSettings: {
            isPeerMuted: false,
            isPeerCam: false,
            isPeerPresenting: false
        },
        signalData: undefined
    },
    reducers: {
        callSettingReducer: (state, action) => {
            state.value = {...state.value, ...action.payload};
        }
    }
})

export const { callSettingReducer } = callSettingsSlice.actions;
export default callSettingsSlice.reducer;