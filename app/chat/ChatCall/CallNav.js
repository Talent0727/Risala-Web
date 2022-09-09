import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";
import callMessage from "../ChatBottom/functions/callMessage";

export default function CallNav({ isPresenting, screenShare, stopScreenShare, isMuted, setIsMuted, setIsFullScreen, isFullScreen, isTimer, timeStamp, setTimeStamp, timer, setTimer, isCam, socket, stream, peerObject, screenCastStream, peer, setIsPresenting, setScreenCastStream, setIsTimer, setIsInCall }){
    const dispatch = useDispatch();
    const callSettings = useSelector((state) => state.chatReducer.value.callSettings)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState(undefined)

    function muteMic(){
        //You are at the moment muted, muted -> unmuted
        if(isMuted){
            stream.getTracks()[0].enabled = true
        } else { //You go from unmuted to muted
            stream.getTracks()[0].enabled = false
        }

        if(peerObject){
            socket.emit('call-message', {
                purpose: 'microphone',
                enabled: !isMuted,
                room: peerObject.id
            })
        }
        setIsMuted(!isMuted)
    }

    function stopCamera(){
        if(isPresenting){
            screenCastStream.getVideoTracks().forEach(function (track) {
                track.stop();
            });
        }

        if(isCam){
            stream.getTracks()[1].enabled = false
        } else { //You go from unmuted to muted
            stream.getTracks()[1].enabled = true
        }
        if(peerObject){
            socket.emit('call-message', {
                purpose: 'camera',
                enabled: !isCam,
                room: peerObject.id
            })
        }
        setIsCam(!isCam)
    }

    function stopScreenShare(){
        screenCastStream.getVideoTracks().forEach(function (track) {
            track.stop();
        });

        userVideo.current.srcObject = stream

        setIsPresenting(false)
        setIsFullScreen(false)
        setScreenCastStream(undefined)

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
        } else if(callSettings.initiator !== USER_DATA.account_id) {
            socket.emit('call-closed', {
                room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id)
            })
        }


        setIsMuted(false)
        setIsInCall(false)
        setIsPresenting(false)
        setIsFullScreen(false)
        setScreenCastStream(undefined)
        peer = null;

        if(callSettings.initiator === USER_DATA.account_id && peerObject){
            callMessage(socket, callSettings, timeStamp)
        }

        dispatch(chatReducer({
            callSettings: {
                id: undefined,
                isActive: false,
                members: [],
                joined: []
            }
        }))
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
                            onClick={(() => { setIsFullScreen(!isFullScreen) })}
                        >
                            {isFullScreen ? "fullscreen" : "fullscreen_exit"}
                        </i>
                        <i
                            className="material-icons"
                            onClick={!isPresenting ? screenShare : stopScreenShare}
                        >
                            {!isPresenting ? "screen_share" : "stop_screen_share"}
                        </i>
                        <i 
                            className="material-icons" 
                            onClick={stopCamera}
                            style={{backgroundColor: !isCam ? "#e62b2b" : null}}
                        >
                            { isCam ? "videocam" : "videocam_off" }
                        </i>
                    </>

                }
                <i 
                    className="material-icons" 
                    onClick={muteMic}
                    title={isMuted ? "Unmute" : "Mute"}
                    style={{backgroundColor: isMuted ? "#e62b2b" : null}}
                >
                    { isMuted ? "mic_off" : "mic" }
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