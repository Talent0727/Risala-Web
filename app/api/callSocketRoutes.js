import store from "../features/store";
import { chatReducer } from "../features/chat";
import { postRequest } from "./api";

const state         =   store.getState().chatReducer.value
const USER_DATA     =   state.USER_DATA
const callSettings  =   state.callSettings
const current       =   state.current

function callInit(data, socket){
    if(data.initiator){
        if(data.initiator !== USER_DATA.account_id && !callSettings.isActive){
            store.dispatch(chatReducer({
                callSettings: {
                    isActive: true,
                    members: data.members,
                    joined: data.joined,
                    id: data.id,
                    initiator: data.initiator,
                    purpose: data.purpose,
                    signalData: data.signalData ? data.signalData : null
                }
            }))
        } else {
            // You are already busy in a call, so perhaps this could be tweaked better
            socket.emit('call-closed', {
                user: USER_DATA.account_id,
                room: data.joined.filter(e => e.id !== USER_DATA.account_id)
            })
        }
    }
}

function callClosed(data){
    if(callSettings.joined.length < 2 || callSettings.members.length === 2){
        store.dispatch(chatReducer({
            callSettings: {
                id: undefined,
                isActive: false,
                members: [],
                joined: []
            }
        }))
    } else {
        // This is for potential group calls
    }
}

export { callInit, callClosed }