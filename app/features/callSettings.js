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
            isPresenting: false,
            isFullScreen: false,
            stream: undefined
        },
        peerSettings: {
            isPeerMuted: false,
            isPeerCam: false,
            isPeerPresenting: false,
            peerStream: undefined
        },
        signalData: undefined
    },
    reducers: {
        callSettingReducer: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value
            }
        },
        callSettingsReset: (state) => {
            state = {
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
            }
        }
    }
})

export const { callSettingReducer, callSettingsReset } = callSettingsSlice.actions;
export default callSettingsSlice.reducer;