import { useSelector } from "react-redux"
import { callSettingReducer } from "../../../features/callSettings"

export default function CallUI({ peerObject, peerAudio}){
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    return(
        <div className="caller-ui call">
            <div className="volume-meter-wrapper">
                <figure className={userSettings.isMuted ? "muted" : null}>
                    {
                        userSettings.isMuted &&
                        <i className="material-icons">mic_off</i>
                    }
                    <img src={ USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                </figure>
                <div className="volume-meter" data-value=""></div>
                {
                    !peerObject &&
                    <span style={{position: "absolute", bottom: "-40px"}}>Ringing...</span>
                }
            </div>
            {
                peerObject &&
                <div className="volume-meter-wrapper">
                    <figure className={peerSettings.isPeerMuted ? "muted" : null}>
                        {
                            peerSettings.isPeerMuted &&
                            <i className="material-icons">mic_off</i>
                        }
                        <img src={ peerObject.profile_picture ? peerObject.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                    </figure>
                    <div className="volume-meter" data-value=""></div>
                </div>
            }
            <div className="audio-block">
                <audio 
                    className="peer-audio" 
                    ref={peerAudio} 
                    autoPlay 
                    muted={peerSettings.isPeerMuted ? true : false}
                ></audio>
            </div>
        </div>
    )
}