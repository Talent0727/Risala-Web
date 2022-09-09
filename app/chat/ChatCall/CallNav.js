import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";

export default function CallNav({ callSettings, isPresenting, screenShare, stopScreenShare, stopCamera, isMuted, muteMic, hangUp, setIsFullScreen, isFullScreen, current, USER_DATA, isTimer, timeStamp, setTimeStamp, timer, setTimer, isCam }){
    const dispatch = useDispatch();

    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState(undefined)

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
                            {
                                !isPresenting ? "screen_share" : "stop_screen_share"
                            }
                        </i>
                        <i 
                            className="material-icons" 
                            onClick={stopCamera}
                            style={{backgroundColor: !isCam ? "#e62b2b" : null}}
                        >
                            { isCam ? "videocam_off" : "videocam" }
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