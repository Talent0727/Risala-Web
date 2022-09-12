import store from "../../../features/store";
import { callSettingReducer } from "../../../features/callSettings";

export default function screenShare(){
    const state = store.getState().callSettingReducer
    const userSettings = state.userSettings
    const peerSettings = state.peerSettings


    navigator.mediaDevices.getDisplayMedia({ cursor: true })
    .then((screenStream) => {
        if(peer){
            peer.replaceTrack(
                stream.getVideoTracks()[0],
                screenStream.getVideoTracks()[0],
                stream
            );
            
            //Emit event
            if(peerObject){
                socket.emit('call-message', {
                    purpose: 'screen-sharing',
                    isSharing: true,
                    room: peerObject.id
                })
            }
        }

        setScreenCastStream(screenStream)
        dispatch(callSettingReducer({
            userSettings: {
                isPresenting: true
            }
        }))
        userVideo.current.srcObject = screenStream

        screenStream.getTracks()[0].onended = (screenCastStream) => {
            console.log(screenCastStream)
            try {
                if(peer){
                    peer.replaceTrack(
                        screenCastStream.currentTarget,
                        stream.getVideoTracks()[0],
                        stream
                    );
                } else if(userPeer && !peer){
                    userPeer.replaceTrack(
                        screenCastStream.currentTarget,
                        stream.getVideoTracks()[0],
                        stream
                    );
                } 
                userVideo.current.srcObject = stream
                dispatch(callSettingReducer({
                    userSettings: {
                        isPresenting: false,
                    }
                }))
                socket.emit('call-message', {
                    purpose: 'screen-sharing',
                    user_id: USER_DATA.account_id,
                    isSharing: false,
                    room: callSettings.joined.filter(e => e !== USER_DATA.account_id)
                })
                
            } catch(err){
                console.log(err)
                informationManager({ purpose: 'error', message: 'Could not get camera stream back, please present again, and close the presentation through the button below (Do not click the button from the browser that says "Stop sharing")'})
            }
        };
    })
    .catch((err) => {
        console.log(err)
        console.log(err.message)
        console.log(err instanceof DOMException)

        if(err instanceof DOMException){
            //dispatch(chatReducer({
            //    MESSAGES: [...MESSAGES, {purpose: 'error', message: `${err.message} Please enable screen sharing in your browser`}]
            //}))
            informationManager({purpose: 'error', message: `${err.message} Please enable screen sharing in your browser`})
            //socket.emit('call-error', {
            //    id: callSettings.id,
            //    error: err.message,
            //    room: callSettings.joined.filter(e => e !== USER_DATA.account_id)
            //})
        }
    })
}