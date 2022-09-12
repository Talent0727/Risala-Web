import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
        isFullScreen: false,
        userPeer: undefined,
        userStream: null
    },
    peerSettings: {
        isJoined: false,
        isCam: false,
        isMuted: false,
        isPresenting: false,
    },
    screenCastStream: undefined,
    signalData: {
        initSignal: null,
        secondSignal: null,
        thirdSignal: null
    },
    signalData: null
}

export const callSettingsSlice = createSlice({
    name: "callSettings",
    initialState: initialState,
    reducers: {
        callSettingReducer: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                // Is key equal to an object? 
                if(typeof state[key] === "object" && !Array.isArray(state[key])){
                    state[key] = {...state[key], ...value}
                } else {
                    state[key] = value
                }
            }
        },
        callSettingsReset: () => {
            return initialState
        },
    }
})

export const { callSettingReducer, callSettingsReset } = callSettingsSlice.actions;
export default callSettingsSlice.reducer;