import React, { useEffect, useState, usState } from "react"
import { callSettingReducer } from "../../../features/callSettings"
import { chatReducer } from "../../../features/chat"
import { useSelector } from "react-redux"

export default function VideoUI({ socket, peerVideo, userVideo }){
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)

    useEffect(() => {
        if(userSettings.isPresenting && peerSettings.isPresenting){
            
        }
    }, [userSettings.isPresenting, peerSettings.isPresenting])

    // This is if you put the presenter in fullscreen.
    // Do not confuse with the other fullscreen setting which is who has the larger screen
    const [fullScreen, setFullScreen] = useState(false) 

    // Style component
    const fullScreenStyle = {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        zIndex: 20,
        border: 'none'
    }

    return(
        <div className="single-call video">
            {
                (userSettings.isPresenting || peerSettings.isPresenting) &&
                <div className="presentation-information-nav">
                    {
                        userSettings.isPresenting &&
                        <>
                            <figure>
                                <img src={ USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                            </figure>
                            <span>You are presenting</span>
                        </>

                    }
                    {
                        peerSettings.isPresenting &&
                        <>
                            <figure>
                                <img src={ peerSettings.peerObject.profile_picture ? peerSettings.peerObject.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                            </figure>
                            <span>
                                {`${peerSettings.peerObject.firstname} ${peerSettings.peerObject.lastname} is presenting`}
                            </span>
                        </>
                    }
                </div>
            }
            <div 
                className={ ((!userSettings.isFullScreen || peerSettings.isPresenting) && !userSettings.isPresenting) ? "peer-screen full-screen" : "peer-screen small-screen" }
                style={ fullScreen ? fullScreenStyle : null }
            >
                {
                    (!peerSettings.isCam && peerSettings.peerObject && !peerSettings.isPresenting) &&
                    <figure>
                        <img src={ peerSettings.peerObject.profile_picture ? peerSettings.peerObject.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                    </figure>
                }
                <div className="video-wrapper">
                    <div
                        className={!peerSettings.isMuted ? "volume-meter" : "volume-meter muted"}
                        style={{backgroundColor: peerSettings.isMuted ? '#e62b2b' : null}}
                    >
                        {
                            peerSettings.isMuted &&
                            <i className="material-icons">mic_off</i>
                        }
                        {
                            !peerSettings.isMuted &&
                            <>
                                <div className="volume-mark-1"></div>
                                <div className="volume-mark-2"></div>
                                <div className="volume-mark-3"></div>
                            </>
                        }
                    </div>
                    {
                        peerSettings.peerObject &&
                        <span>{`${peerSettings.peerObject.firstname} ${peerSettings.peerObject.lastname}`}</span>
                    }
                    {
                        peerSettings.isPresenting &&
                        <i 
                            className="material-icons fullscreen-button"
                            onClick={(() => { setFullScreen(!fullScreen)})}
                            style={fullScreen ? {background: '#e62b2b'} : null}
                        >
                            {fullScreen ? "fullscreen_exit" : "fullscreen"}
                        </i>
                    }
                    <video
                        className={peerSettings.isPresenting ? "peer-video presenting" : "peer-video" }
                        autoPlay
                        playsInline
                        ref={peerVideo}
                    >
                    </video>
                </div>
            </div>
            <div className={ ((userSettings.isFullScreen || userSettings.isPresenting) && !peerSettings.isPresenting) ? "user-window full-screen" : "user-window small-screen" }>
                {
                    !userSettings.isCam && !userSettings.isPresenting &&
                    <figure>
                        <img src={ USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                    </figure>
                }
                {
                    <div className="video-wrapper">
                        <div 
                            className={!userSettings.isMuted ? "volume-meter" : "volume-meter muted"}
                            style={{backgroundColor: userSettings.isMuted ? '#e62b2b' : null}}
                        >
                            {
                                userSettings.isMuted &&
                                <i className="material-icons">mic_off</i>
                            }
                            {
                                !userSettings.isMuted &&
                                <>
                                    <div className="volume-mark-1"></div>
                                    <div className="volume-mark-2"></div>
                                    <div className="volume-mark-3"></div>
                                </>
                            }
                        </div>
                        <span>{`${USER_DATA.firstname} ${USER_DATA.lastname}`}</span>
                        <video
                            className={userSettings.isPresenting ? "user-video presenting" : "user-video" }
                            autoPlay
                            playsInline
                            muted  
                            ref={userVideo}
                        >
                        </video>
                    </div>
                }
            </div>
        </div>
    )
}