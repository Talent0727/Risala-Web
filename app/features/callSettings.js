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
        initiator: false,
        initiatorID: undefined,
        userSettings: {
            isCam: false,
            isMuted: false,
            isPresenting: false,
            isFullScreen: false
        },
        peerSettings: {
            isPeerMuted: false,
            isPeerCam: false,
            isPeerPresenting: false,
        },
        signalData: undefined
    },
    reducers: {
        callSettingReducer: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                console.log(state[key])
                
                console.log(key, state[key], value, action.payload)
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
                initiator: false,
                initiatorID: undefined,
                userSettings: {
                    isCam: false,
                    isMuted: false,
                    isPresenting: false,
                    isFullScreen: false
                },
                peerSettings: {
                    isPeerMuted: false,
                    isPeerCam: false,
                    isPeerPresenting: false,
                },
                signalData: undefined
            }
            console.log(state)
        }
    }
})

export const { callSettingReducer, callSettingsReset } = callSettingsSlice.actions;
export default callSettingsSlice.reducer;