import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";
import { callSettingReducer, callSettingsReset } from "../../features/callSettings";
import callMessage from "../ChatBottom/functions/callMessage";

export default function CallNav({ screenShare, stopScreenShare, isTimer, timeStamp, setTimeStamp, timer, setTimer, socket, stream, peerObject, screenCastStream, peer, setScreenCastStream, setIsTimer, userVideo }){
    const dispatch = useDispatch();
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState(undefined)

    function muteMic(){
        //You are at the moment muted, muted -> unmuted
        if(userSettings.isMuted){
            stream.getTracks()[0].enabled = true
        } else { //You go from unmuted to muted
            stream.getTracks()[0].enabled = false
        }

        try{
            if(peerObject){
                socket.emit('call-message', {
                    purpose: 'microphone',
                    enabled: !userSettings.isMuted,
                    room: peerObject.id
                })
            }
            dispatch(callSettingReducer({
                userSettings:{ 
                    isMuted : !userSettings.isMuted
                }}
            ))
        } catch (err){
            console.log(err)
        }
    }

    function stopCamera(){
        if(userSettings.isPresenting){
            screenCastStream.getVideoTracks().forEach(function (track) {
                track.stop();
            });
        }

        if(userSettings.isCam){
            stream.getTracks()[1].enabled = false
        } else { //You go from unmuted to muted
            stream.getTracks()[1].enabled = true
        }

        if(peerObject){
            socket.emit('call-message', {
                purpose: 'camera',
                enabled: !userSettings.isCam,
                room: peerObject.id
            })
        }
        dispatch(callSettingReducer({userSettings:{ isCam: !userSettings.isCam}}))
    }

    function stopScreenShare(){
        screenCastStream.getVideoTracks().forEach(function (track) {
            track.stop();
        });

        userVideo.current.srcObject = stream

        dispatch(callSettingReducer({
            userSettings: {
                isPresenting: false,
                isFullScreen: false
            }
        }))

        if(peer){
            peer.replaceTrack(
              screenCastStream.getVideoTracks()[0],
              stream.getVideoTracks()[0],
              stream
            );
        }

        //Emit event
        if(peerObject){
            socket.emit('call-message', {
                purpose: 'screen-sharing',
                isSharing: false,
                room: peerObject.id
            })
        }
    }

    // Initiated if YOU hang up
    function hangUp(){
        if(stream){
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }

        if(callSettings.joined.length >= 2){
            socket.emit('call-exit', {
                id: callSettings.id,
                joined: callSettings.joined,
                room: callSettings.joined.filter(e => e != USER_DATA.account_id),
                callSettings: callSettings,
                timeStamp: timeStamp,
                initiator: callSettings.initiator
            })
        } else if(!callSettings.initiator) {
            socket.emit('call-closed', {
                room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id)
            })
        }

        peer = null;

        if(callSettings.initiator && peerObject){
            callMessage(socket, callSettings, timeStamp)
        }

        dispatch(callSettingsReset())
        setIsTimer(false)
    }

    useEffect(() => {
        setLoading(true)
        if(current && current.members){
            if(current.members.length > 2){
                setGroup(current.members)
            } else {
                setGroup(undefined)
                var nicknames = current.nicknames

                if(nicknames){
                    nicknames = JSON.parse(current.nicknames)
                    if(nicknames.find((e) => e.id !== USER_DATA.account_id)){
                        setNickname(nicknames.find((e) => e.id !== USER_DATA.account_id).nickname)
                    } else {
                        setNickname(undefined)
                    }
                } else {
                    setNickname(undefined)
                }
            }

            if(current.alias){
                setAlias(current.alias)
            } else {
                if(current && current.alias){
                    setAlias(current.alias)
                } else {
                    setAlias(undefined)
                }
            }
            setLoading(false)
        }
    }, [current, callSettings])

    useEffect(() => {
        if(isTimer){
            var timerInterval = setInterval(() => {
                var hours   = (timer + 1) > 3600 ? Math.floor((timer + 1)/(60*60)) : 0
                var minutes = (timer + 1) > 60 ? Math.floor((timer + 1)/60) >= 60 ? Math.floor((timer + 1)/60) - 60 : Math.floor((timer + 1)/60) : 0
                var seconds = (timer + 1) % 60
                
                var hours = `0${hours}`.slice(-2)
                var minutes = `0${minutes}`.slice(-2)
                var seconds = `0${seconds}`.slice(-2)
                
                setTimeStamp(`${hours}:${minutes}:${seconds}`)
                setTimer(timer + 1)
            }, 1000)
        }

        return(() => {
            clearInterval(timerInterval)
        })
    }, [isTimer, timer])

    function setFullScreen(){
        dispatch(callSettingReducer({
            userSettings: {
                isFullScreen: !userSettings.isFullScreen
            }
        }))
    }

    return(
        <div className="call-window-nav">
            <div className="info-wrapper">
                {
                    (!loading && callSettings.isActive) &&
                    <>
                        <figure>
                            <img src={callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].profile_picture ? callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"} />
                        </figure>
                        {
                            nickname ?
                            <span>{nickname}</span>
                            :
                            <span>{ callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].firstname + ' ' + callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].lastname}</span>
                        }
                    </>
                }
            </div>
            <div className="call-main-buttons">
                {
                    callSettings.purpose === "video" &&
                    <>
                        <i 
                            className="material-icons" 
                            onClick={setFullScreen}
                        >
                            {userSettings.isFullScreen ? "fullscreen" : "fullscreen_exit"}
                        </i>
                        <i
                            className="material-icons"
                            onClick={!userSettings.isPresenting ? screenShare : stopScreenShare}
                        >
                            {!userSettings.isPresenting ? "screen_share" : "stop_screen_share"}
                        </i>
                        <i 
                            className="material-icons" 
                            onClick={stopCamera}
                            style={{backgroundColor: !userSettings.isCam ? "#e62b2b" : null}}
                        >
                            { userSettings.isCam ? "videocam" : "videocam_off" }
                        </i>
                    </>

                }
                <i 
                    className="material-icons" 
                    onClick={muteMic}
                    title={userSettings.isMuted ? "Unmute" : "Mute"}
                    style={{backgroundColor: userSettings.isMuted ? "#e62b2b" : null}}
                >
                    { userSettings.isMuted ? "mic_off" : "mic" }
                </i>
                <i 
                    className="material-icons call-end"
                    title="Hang up" 
                    onClick={hangUp}
                >
                    call_end
                </i>
            </div>
            <div className="timer">{timeStamp}</div>
        </div>
    )
}