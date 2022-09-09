import React, { useState, useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";
import Peer from "simple-peer";
import volumeMeterInit from "./functions/volumeMeterInit";
import { SocketContext } from "../../components/Socket";

import CallTop          from "./CallTop";
import CallerWindow     from "./CallerWindow";
import callMessage       from "../ChatBottom/functions/callMessage"
import CallNav from "./CallNav";

let peer;

export default function ChatCall({ locale, current, USER_DATA, inputRef }){
    const dispatch = useDispatch();
    const socket = useContext(SocketContext)
    const callSettings = useSelector((state) => state.chatReducer.value.callSettings)

    const userVideo = useRef(null);
    const userAudio = useRef(null);
    const peerVideo = useRef(null);
    const peerAudio = useRef(null);

    const [isActive, setIsActive] = useState(false) //Is there a call (outgoing, ingoing) active at the moment
    const [isInCall, setIsInCall] = useState(false) // If your in the call, then render UI. Else render callerWindow

    const [stream, setStream] = useState(); // Your stream (audio or video)
    const [peerStream, setPeerStream] = useState(); //peer stream (audio or video)
    const [screenCastStream, setScreenCastStream] = useState();

    // These are call settings for YOU
    const [isPresenting, setIsPresenting] = useState(false) //
    const [isAudio, setIsAudio] = useState(false)
    const [isVideo, setIsVideo] = useState(false) //Redundant?
    const [isMuted, setIsMuted] = useState(false)
    const [isCam, setIsCam] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)

    // These are call settings for the PEER
    const [isPeerMuted, setIsPeerMuted] = useState(false)
    const [isPeerCam, setIsPeerCam] = useState(false)
    const [isPeerPresenting, setIsPeerPresenting] = useState(false)
    const [peerObject, setPeerObject] = useState(undefined)
    const [userPeer, setUserPeer] = useState(undefined) // this is your peer profile

    // For timer function
    const [isTimer, setIsTimer] = useState(false)
    const [timer, setTimer] = useState(0)
    const [timeStamp, setTimeStamp] = useState('')

    const [isJoined, setIsJoined] = useState(false)

    // Keep this one
    useEffect(() => {
        console.log(callSettings.joined, callSettings.joined.length)
        if(timer === 30 && callSettings){
            if(callSettings.joined.length <= 1 && callSettings.initiator === USER_DATA.account_id){
                callMessage(socket, callSettings, timeStamp, true)
                callTerminated()
                socket.emit('call-exit', {
                    id: callSettings.id,
                    room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                    callSettings: callSettings
                })
                setTimer(0)
            } else {
                setIsJoined(true)
            }
        }
    }, [timer, callSettings.joined])

    useEffect(() => {
        if(callSettings){
            // Call is active & you initated the call
            if(callSettings.isActive && callSettings.initiator){
                if(callSettings.initiator === USER_DATA.account_id && !isInCall){
                    setIsInCall(true)
                } else if(callSettings.joined.find(e => e === USER_DATA.account_id)) {
                    setIsInCall(true)
                }

                if(callSettings.joined.length === 2){
                    var peerObjectCopy = callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0]
                    setPeerObject(peerObjectCopy)
                } else if(callSettings.joined.length === 1){
                    setPeerObject(undefined)
                }
    
                if(callSettings.isInit && !isActive){
                    if(callSettings.purpose === "call" && !isCam){
                        setIsActive(true)
                        setIsMuted(false)
                    } else {
                        setIsCam(false)
                    }
                }
                
            } else { // You did NOT initate the call
                setIsInCall(false)
            }

        } else {
            setIsInCall(false)
            setIsActive(false)
        }
    }, [callSettings])

    useEffect(() => {

        if(callSettings.isActive){
            if(callSettings.joined.length >= 2){
                setPeerObject(callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0])
                setIsJoined(true)
            }
        } else {
            setPeerObject(false)
            setIsMuted(false)
            setIsAudio(false)
            setIsCam(false)
            setIsPeerCam(false)
            setIsPeerMuted(false)
            setIsPeerCam(false)
            setPeerObject(undefined)
            setUserPeer(undefined)
            setIsPeerPresenting(false)
            setIsPresenting(false)
            setIsJoined(false)
        }
    }, [callSettings])

    useEffect(() => {
        if(isInCall && callSettings.isActive){
            initWebRTC()
        }
    }, [isInCall, callSettings.isActive])

    /*************************/

    function initWebRTC(){
        setTimeStamp('00:00:00')
        setIsTimer(true)

        if(callSettings.purpose === "video"){
            setIsVideo(true)
        } else {
            setIsAudio(true)
        }

        navigator.mediaDevices.getUserMedia({ 
            video: callSettings.purpose === "video" ? true : false,
            audio: true
        })
        .then((stream) => {
            setStream(stream)

            if(callSettings.purpose === "video"){
                setIsCam(true)
                if(userVideo.current){
                    userVideo.current.srcObject = stream
                } else {
                    document.querySelector('.user-video').srcObject = stream
                }
            }

            if(callSettings.purpose === "video"){
                var volumeMeter = document.querySelector('.user-window .volume-meter')
            } else {
                var volumeMeter = document.querySelector('.volume-meter')
            }

            volumeMeterInit(stream, volumeMeter, callSettings.purpose)

            peer = new Peer({
                initiator: callSettings.initiator === USER_DATA.account_id ? true : false,
                trickle: false,
                stream: stream
            })

            setUserPeer(peer)

            // If you are not the initiator, then send a signal back to the one who sent the signal to
            // begin with in order to "answer" the signal
            if(!peer.initiator || callSettings.initiator !== USER_DATA.account_id){
                peer.signal(callSettings.signalData)
            }

            peer.on('signal', (signal) => {
                // The reciever
                if(!peer.initiator || callSettings.initiator !== USER_DATA.account_id){

                    var callObject = {
                        id: callSettings.id,
                        joined: USER_DATA.account_id,
                        room: [...callSettings.joined].filter(e => e !== USER_DATA.account_id),
                        signal: signal
                    }

                    socket.emit('call-join', callObject)
                } else { // The initiator, send initation signal
                    var callObject = {
                        isActive:   callSettings.isActive,
                        purpose:    callSettings.purpose,
                        id:         callSettings.id,
                        joined:     callSettings.joined,
                        room:       callSettings.room,
                        members:    callSettings.members,
                        initiator:  callSettings.initiator,
                        signalData: signal,
                    }
    
                    socket.emit('call-init', callObject)
                }
            })

            // This is correct
            peer.on('stream', (stream) => {
                setIsMuted(false)
                callSettings.purpose === "video" ? setIsCam(true) : null
                setTimer(0)
                setPeerStream(stream)
                if(callSettings.purpose === "video"){
                    if(peerVideo.current){
                        peerVideo.current.srcObject = stream
                    }
                    setIsPeerCam(true)
                } else {
                    var peerAudioManual = document.querySelector('.peer-audio')
                    if(peerAudio.current){
                        peerAudio.current.srcObject = stream
                    } else if (peerAudioManual) {
                        peerAudioManual.srcObject = stream
                    }
                }

                if(callSettings.purpose === "video"){
                    var volumeMeter = document.querySelector('.peer-screen .volume-meter')
                } else {
                    var volumeMeter = document.querySelectorAll('.volume-meter')[1]
                }

                if(volumeMeter){
                    volumeMeterInit(stream, volumeMeter, callSettings.purpose)
                } else {
                    setTimeout(() => {
                        volumeMeterInit(stream, volumeMeter, callSettings.purpose)
                    }, 1000)
                }
            })

            // If the call was interrupted
            peer.on('close', (err) => {
                console.log(err)
                callInterupt(err, timeStamp)
                peer = null;
            })

            peer.on('error', (err) => {
                console.log(err)
                peer = null;
                callInterupt(err, timeStamp)
            })

            /**************************************************************/
            socket.on('call-message', (data) => {
                if(data.purpose === "microphone"){
                    setIsPeerMuted(data.enabled)
                } else if(data.purpose === "camera"){
                    setIsPeerCam(data.enabled)
                } else if(data.purpose === "screen-sharing"){
                    if(data.isSharing){
                        if(isPresenting){
                            stopScreenShare()
                        }
                        setIsPeerPresenting(true)
                        setIsPresenting(false)
                        setIsFullScreen(false)
                    } else {
                        setIsPeerPresenting(false)
                    }
                } else if(data.purpose === "error"){
                    dispatch(chatReducer({
                        ERROR: {
                            PURPOSE: `An error has occurred by your peer: ${err}`
                        }
                    }))
                    callTerminated()
                } else if(data.purpose === "reject"){
                    console.log("reject triggered")
                    callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
                    callTerminated()
                }
            })

            // Initiated if the Peer ends the call
            socket.on('call-exit', (data) => {
                if(data.initiator === USER_DATA.account_id || data.callSettings.initiator === USER_DATA.account_id){
                    if(data.joined.length === 1){
                        callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
                    } else {
                        callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, false)
                    }
                }
                callTerminated()
            })

            socket.on('call-join', (data) => {
                peer.signal(data.signal)
                dispatch(chatReducer({
                    callSettings: {
                        id: callSettings.id,
                        isActive: true,
                        joined: [...callSettings.joined, data.joined],
                        members: callSettings.members,
                        room: callSettings.joined,
                        initiator: callSettings.initiator,
                        purpose: callSettings.purpose
                    }
                }))
            })

            /*************************************************************/
        })
        .catch((err) => {
            dispatch(chatReducer({
                ERROR: {
                    PURPOSE: err.message
                }
            }))
            socket.emit('call-message', {
                purpose: 'error',
                error: err.message,
                room: callSettings.joined.filter(e => e.id !== USER_DATA.account_id)
            })

            callTerminated()
        })
    }

    return(
        <>
            {
                isInCall === true && callSettings.isActive &&
                <div className="call-window">
                    <div className="call-window-main">
                    {
                        callSettings.joined.length <= 2 &&
                        <>
                            {
                                (callSettings.purpose === "call" && !isCam) &&
                                <div className="caller-ui call">
                                    <div className="volume-meter-wrapper">
                                        <figure className={isMuted ? "muted" : null}>
                                            {
                                                isMuted &&
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
                                            <figure className={isPeerMuted ? "muted" : null}>
                                                {
                                                    isPeerMuted &&
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
                                            muted={isPeerMuted ? true : false}
                                        ></audio>
                                    </div>
                                </div>
                            }
                            {
                               callSettings.purpose === "video" &&
                                <div className="single-call video">
                                    <div className={ ((!isFullScreen || isPeerPresenting) && !isPresenting) ? "peer-screen full-screen" : "peer-screen small-screen" }>
                                        {
                                            (!isPeerCam && peerObject) &&
                                            <figure>
                                                <img src={ peerObject.profile_picture ? peerObject.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                                            </figure>
                                        }
                                        <div className="video-wrapper">
                                            <div className={!isPeerMuted ? "volume-meter" : "volume-meter muted"}>
                                                {
                                                    isPeerMuted &&
                                                    <i className="material-icons">mic_off</i>
                                                }
                                                {
                                                    !isPeerMuted &&
                                                    <>
                                                        <div className="volume-mark-1"></div>
                                                        <div className="volume-mark-2"></div>
                                                        <div className="volume-mark-3"></div>
                                                    </>
                                                }
                                            </div>
                                            <video
                                                className={isPeerPresenting ? "peer-video presenting" : "peer-video" }
                                                autoPlay
                                                playsInline
                                                ref={peerVideo}
                                            >
                                            </video>
                                        </div>
                                    </div>
                                    <div className={ ((isFullScreen || isPresenting) && !isPeerPresenting) ? "user-window full-screen" : "user-window small-screen" }>
                                        {
                                            !isCam &&
                                            <figure>
                                                <img src={ USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" }/>
                                            </figure>
                                        }
                                        {
                                            <div className="video-wrapper">
                                                <div className={!isMuted ? "volume-meter" : "volume-meter muted"}>
                                                    {
                                                        isMuted &&
                                                        <i className="material-icons">mic_off</i>
                                                    }
                                                    {
                                                        !isMuted &&
                                                        <>
                                                            <div className="volume-mark-1"></div>
                                                            <div className="volume-mark-2"></div>
                                                            <div className="volume-mark-3"></div>
                                                        </>
                                                    }
                                                </div>
                                                <video
                                                    className={isPresenting ? "user-video presenting" : "user-video" }
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
                            }
                            {
                                callSettings.joined.length === 1 &&
                                <audio src="../assets/call_generic_sound.aac" autoPlay loop></audio>
                            }
                        </>
                    }
                    </div>
                    <CallNav 
                        callSettings={callSettings}
                        isPresenting={isPresenting}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                        setIsFullScreen={setIsFullScreen}
                        isFullScreen={isFullScreen}
                        current={current}
                        USER_DATA={USER_DATA}
                        isTimer={isTimer}
                        timeStamp={timeStamp}
                        setTimeStamp={setTimeStamp}
                        timer={timer}
                        setTimer={setTimer}
                        isCam={isCam}
                        socket={socket}
                        stream={stream}
                        peerObject={peerObject}
                        screenCastStream={screenCastStream}
                        peer={peer}
                        setIsPresenting={setIsPresenting}
                        setScreenCastStream={setScreenCastStream}
                        setIsTimer={setIsTimer}
                        setIsInCall={setIsInCall}
                    />
                </div>
            }
            {
                callSettings.isActive &&
                <CallerWindow
                    socket={socket}
                    isInCall={isInCall}
                    setIsInCall={setIsInCall}
                    setStream={setStream}
                    setPeerStream={setPeerStream}
                />
            }
        </>
    )

    function callTerminated(){
        console.log("Call terminated was triggered")
        
        setIsActive(false)
        setIsInCall(false)
        setIsPresenting(false)
        setIsPeerPresenting(false)
        if(stream){
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        peer = null;
        dispatch(chatReducer({
            callSettings: {
                id: undefined,
                isActive: false,
                members: [],
                joined: []
            }
        }))
    }

    function callInterupt(err, timer){
        console.log(timer)
        callMessage(socket, callSettings, timer)

        if(stream){
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        setIsMuted(false)
        setIsInCall(false)
        setIsPresenting(false)
        setIsFullScreen(false)
        setScreenCastStream(undefined)
        setIsTimer(false)
        peer = null;

        if(err){
            dispatch(chatReducer({
                callSettings: {
                    id: undefined,
                    isActive: false,
                    members: [],
                    joined: []
                },
                ERROR: {
                    PURPOSE: err
                }
            }))
        } else {
            dispatch(chatReducer({
                callSettings: {
                    id: undefined,
                    isActive: false,
                    members: [],
                    joined: []
                }
            }))
        }
    }
}