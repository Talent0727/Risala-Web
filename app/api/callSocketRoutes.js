import store from "../features/store";
import { chatReducer } from "../features/chat";
import { callSettingReducer } from "../features/callSettings";

const state         =   store.getState().chatReducer.value
const callSettings  =   store.getState().callSettingReducer
const USER_DATA     =   state.USER_DATA

function callInit(data, socket, state){
    if(!data.initiator && !callSettings.isActive){
        store.dispatch(callSettingReducer({...data}))
    } else if(callSettings.id !== data.id) {
        console.log(callSettings, data.initiator)
        // You are already busy in a call, so perhaps this could be tweaked better
        socket.emit('call-closed', {
            id: callSettings.id,
            user_id: USER_DATA.account_id,
            name: `${USER_DATA.firstname} ${USER_DATA.lastname}`,
            reason: `${USER_DATA.firstname} ${USER_DATA.lastname} is busy in another call`,
            room: data.joined.filter(e => e.id !== USER_DATA.account_id)
        })
    }
}

function callJoin(data){
    store.dispatch(callSettingReducer({
        signalData: data.signal,
        joined: [...store.getState().callSettingReducer.joined, data.joined]
    }))
}

export { callInit, callJoin }