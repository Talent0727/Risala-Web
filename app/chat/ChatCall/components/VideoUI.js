import { callSettingReducer } from "../../../features/callSettings"
import { chatReducer } from "../../../features/chat"
import { useSelector } from "react-redux"

export default function VideoUI({ peerObject, peerVideo, userVideo }){
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)

    return(
        <div className="single-call video">
            {
                (userSettings.isPresenting || peerSettings.isPeerPresenting) &&
                <div className="presentation-information-nav">
                    {
                        userSettings.isPresenting &&
                        <>
                            <figure>
                                <img src={ USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                            </figure>
                            <span>
                                {`${USER_DATA.firstname} ${USER_DATA.lastname} is presenting`}
                            </span>
                        </>

                    }
                    {
                        peerSettings.isPeerPresenting &&
                        <>
                            <figure>
                                <img src={ peerObject.profile_picture ? peerObject.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                            </figure>
                            <span>
                                {`${peerObject.firstname} ${peerObject.lastname} is presenting`}
                            </span>
                        </>
                    }
                </div>
            }
            <div className={ ((!userSettings.isFullScreen || peerSettings.isPeerPresenting) && !userSettings.isPresenting) ? "peer-screen full-screen" : "peer-screen small-screen" }>
                {
                    (!peerSettings.isPeerCam && peerObject && !peerSettings.isPeerPresenting) &&
                    <figure>
                        <img src={ peerObject.profile_picture ? peerObject.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                    </figure>
                }
                <div className="video-wrapper">
                    <div
                        className={!peerSettings.isPeerMuted ? "volume-meter" : "volume-meter muted"}
                        style={{backgroundColor: peerSettings.isPeerMuted ? '#e62b2b' : null}}
                    >
                        {
                            peerSettings.isPeerMuted &&
                            <i className="material-icons">mic_off</i>
                        }
                        {
                            !peerSettings.isPeerMuted &&
                            <>
                                <div className="volume-mark-1"></div>
                                <div className="volume-mark-2"></div>
                                <div className="volume-mark-3"></div>
                            </>
                        }
                    </div>
                    <video
                        className={peerSettings.isPeerPresenting ? "peer-video presenting" : "peer-video" }
                        autoPlay
                        playsInline
                        ref={peerVideo}
                    >
                    </video>
                </div>
            </div>
            <div className={ ((userSettings.isFullScreen || userSettings.isPresenting) && !peerSettings.isPeerPresenting) ? "user-window full-screen" : "user-window small-screen" }>
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