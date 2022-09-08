import store from "../features/store";
import { chatReducer } from "../features/chat";
import { postRequest } from "./api";

const state         =   store.getState().chatReducer.value
const USER_DATA     =   state.USER_DATA
const callSettings  =   state.callSettings
const current       =   state.current

function callInit(data){

    if(data.initiator){
        if(data.initiator === USER_DATA.account_id){

        } else {
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
        }
    }
}

function callJoin(data){
    store.dispatch(chatReducer({
        callSettings: {
            isActive: true,
            members: data.members,
            joined: data.joined,
            id: data.id,
            initiator: data.initiator,
            purpose: data.purpose,
            returnedSignalData: data.returnedSignalData
        }
    }))
}

export { callInit, callJoin }