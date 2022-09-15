import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { callSettingReducer, callSettingsReset } from "../../../features/callSettings";

// Functions
import callMessage      from "../../ChatBottom/functions/callMessage";
import informationManager from "../../../modules/informationManager";

export default function CallNav({ socket, screenShare, stopScreenShare }){
    const dispatch = useDispatch();
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const timer = useSelector((state) => state.callSettingReducer.timer)
    const isTimer = useSelector((state) => state.callSettingReducer.isTimer)
    const timeStamp = useSelector((state) => state.callSettingReducer.timeStamp)

    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState(undefined)

    function stopCamera(){
        //if(userSettings.isPresenting){
        //    userSettings.screenStream.getVideoTracks().forEach(function (track) {
        //        track.stop();
        //    });
        //}

        if(userSettings.isCam){
            userSettings.userStream.getTracks()[1].enabled = false
        } else { //You go from hidden camera to visible camera
            userSettings.userStream.getTracks()[1].enabled = true
        }

        if(peerSettings.peerObject){
            console.log(peerSettings.peerObject)
            socket.emit('call-message', {
                purpose: 'camera',
                enabled: !userSettings.isCam,
                room: peerSettings.peerObject.id
            })
        }
        dispatch(callSettingReducer({userSettings:{ isCam: !userSettings.isCam}}))
    }

    function muteMic(){
        //You are at the moment muted, muted -> unmuted
        if(userSettings.isMuted){
            userSettings.userStream.getTracks()[0].enabled = true
        } else { //You go from unmuted to muted
            userSettings.userStream.getTracks()[0].enabled = false
        }

        try{
            if(peerSettings.peerObject){
                socket.emit('call-message', {
                    purpose: 'microphone',
                    enabled: !userSettings.isMuted,
                    room: peerSettings.peerObject.id
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

    // Initiated if YOU hang up
    function hangUp(){
        try {
            document.querySelectorAll('.call-window video').forEach((video) => {
                var tracks = video.srcObject.getTracks();
                tracks.forEach((track) => {
                    track.stop()
                })
                video.srcObject = null;
            })
        } catch (err){
            console.log(err)
        }

        socket.emit('call-closed', {
            id: callSettings.id,
            user_id: USER_DATA.account_id,
            name: `${USER_DATA.firstname} ${USER_DATA.lastname}`,
            room: callSettings.joined.filter(e => e !== USER_DATA.account_id)
        })

        if(callSettings.initiator && peerSettings.peerObject){
            callMessage(socket, timeStamp)
        }

        dispatch(callSettingsReset())
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
                
                dispatch(callSettingReducer({
                    timeStamp: `${hours}:${minutes}:${seconds}`,
                    timer: timer + 1
                }))
            }, 1000)
        }

        return(() => {
            clearInterval(timerInterval)
        })
    }, [isTimer, timer])

    function setFullScreen(){
        if(!userSettings.isPresenting && !peerSettings.isPresenting){
            dispatch(callSettingReducer({
                userSettings: {
                    isFullScreen: !userSettings.isFullScreen
                }
            }))
        }
    }

    function minimizeWindow(){
        if(userSettings.isPresenting){
            informationManager({purpose: 'information', message: "Call can't be minimised while in presentation mode. Please stop the presentation in order to proceed"})
        } else if(!callSettings.isMinimised) {
            dispatch(callSettingReducer({
                isMinimised: true
            }))
        } else if(callSettings.isMinimised){
            document.querySelector('.call-window').classList.add('expand')
            setTimeout(() => {
                document.querySelector('.call-window').style.top = 0;
                document.querySelector('.call-window').style.left = 0;
                dispatch(callSettingReducer({
                    isMinimised: false
                }))
            }, 600);
        }
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
                <i 
                    className="material-icons"
                    onClick={minimizeWindow}
                    style={callSettings.isMinimised ? {backgroundColor: '#ffffffb3'} : null}
                >
                    {!callSettings.isMinimised ? "forum" : "expand"}
                </i>
                {
                    callSettings.purpose === "video" &&
                    <>
                        <i 
                            className="material-icons" 
                            onClick={setFullScreen}
                            style={userSettings.isFullScreen ? {backgroundColor: '#ffffffb3'} : null}
                        >
                            {userSettings.isFullScreen ? "fullscreen" : "fullscreen_exit"}
                        </i>
                        <i
                            className="material-icons"
                            onClick={!userSettings.isPresenting ? screenShare : stopScreenShare}
                            style={userSettings.isPresenting ? {backgroundColor: '#ffffffb3'} : null}
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