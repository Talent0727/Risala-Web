import React, { useState, useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";
import { callSettingReducer, callSettingsReset } from "../../features/callSettings";
import Peer from "simple-peer";
import { SocketContext } from "../../components/Socket";

// Components
import CallerWindow     from "./components/CallerWindow";
import CallNav          from "./components/CallNav";
import CallUI           from "./components/CallUI";
import VideoUI          from "./components/VideoUI";

// Functions
import callMessage      from "../ChatBottom/functions/callMessage"
import volumeMeterInit  from "./functions/volumeMeterInit";

let peer; // Should peer become a state?

export default function ChatCall({ locale, current, USER_DATA }){
    const dispatch = useDispatch();
    const socket = useContext(SocketContext)
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)

    const userVideo = useRef(null);
    const peerVideo = useRef(null);
    const peerAudio = useRef(null);

    const [stream, setStream] = useState(); // Your stream (audio or video)
    const [peerStream, setPeerStream] = useState(); //peer stream (audio or video)
    const [screenCastStream, setScreenCastStream] = useState();

    // These are call settings for the PEER
    const [peerObject, setPeerObject] = useState(undefined)

    // For timer function
    const [isTimer, setIsTimer] = useState(false)
    const [timer, setTimer] = useState(0)
    const [timeStamp, setTimeStamp] = useState('')

    const [isOn, setIsOn] = useState(false)

    // Keep this one
    useEffect(() => {
        if(timer === 30){
            if(callSettings.joined.length === 1 && callSettings.initiator){
                callMessage(socket, callSettings, timeStamp, true)
                callTerminated()
                socket.emit('call-exit', {
                    id: callSettings.id,
                    room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                    callSettings: callSettings
                })
                setTimer(0)
            }
        }
    }, [timer, callSettings.joined])

    useEffect(() => {
        if(stream && callSettings.isInCall && !callSettings.isInitiator){
            if(peerStream){
                if(callSettings.purpose === 'call'){
                    peerAudio.current.srcObject = peerStream
                } else if(callSettings.purpose === 'video') {
                    peerVideo.current.srcObject = peerStream
                }
            }
        }
    }, [peerStream, stream, callSettings.isInCall])

    useEffect(() => {
        if(callSettings.isInCall && callSettings.isActive && !isOn){
            initWebRTC()
        }

        if(callSettings.isActive){
            if(callSettings.joined.length >= 2){
                setPeerObject(callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0])
            }
        } else {
            dispatch(callSettingsReset())
            setIsOn(false)
        }

        if(callSettings.joined.length === 2){
            var peerObjectCopy = callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0]
            setPeerObject(peerObjectCopy)
        } else if(callSettings.joined.length === 1){
            setPeerObject(undefined)
        }
    }, [callSettings])

    /*************************/

    function initWebRTC(){
        setTimeStamp('00:00:00')
        setIsTimer(true)
        setIsOn(true)

        navigator.mediaDevices.getUserMedia({ 
            video: callSettings.purpose === "video" ? true : false,
            audio: true
        })
        .then((stream) => {
            setStream(stream)

            if(callSettings.purpose === "video"){
                dispatch(callSettingReducer({ userSettings: { isCam: true }}))
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
                initiator: callSettings.initiator || callSettings.initiatorID === USER_DATA.account_id ? true : false,
                trickle: false,
                stream: stream
            })

            // If you are not the initiator, then send a signal back to the one who sent the signal to
            // begin with in order to "answer" the signal
            if(!peer.initiator || !callSettings.initiator){
                peer.signal(callSettings.signalData)
            }

            peer.on('signal', (signal) => {
                // The reciever
                if(!peer.initiator || !callSettings.initiator){
                    var callObject = {
                        id: callSettings.id,
                        joined: USER_DATA.account_id,
                        room: [...callSettings.joined].filter(e => e !== USER_DATA.account_id),
                        signal: signal
                    }
                    socket.emit('call-join', callObject)
                } else { // The initiator, send initation signal
                    var callObject = {
                        ...callSettings,
                        ['initiator']: false,
                        ['room']: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                        ['isInCall']: false,
                        signalData: signal
                    }
                    socket.emit('call-init', callObject)
                }
            })

            // This is correct
            peer.on('stream', (stream) => {
                setPeerStream(stream)
                dispatch(callSettingReducer({
                    userSettings: { isMuted: false }
                }))

                if(callSettings.purpose === "video"){
                    dispatch(callSettingReducer({
                        userSettings: { isCam: true }
                    }))
                }

                setTimer(0)

                if(callSettings.purpose === "video"){
                    if(peerVideo.current){
                        peerVideo.current.srcObject = stream
                    }
                    dispatch(callSettingReducer({
                        peerSettings: { isPeerCam: true }
                    }))
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
                dispatch(chatReducer({
                    ERROR: {
                        PURPOSE: err.message ? err.message : err
                    }
                }))
                callInterupt(err, timeStamp)
            })

            /**************************************************************/
            socket.on('call-message', (data) => {
                if(data.purpose === "microphone"){
                    dispatch(callSettingReducer({
                        peerSettings: { isPeerMuted: data.enabled }
                    }))
                } else if(data.purpose === "camera"){
                    dispatch(callSettingReducer({
                        peerSettings: { isPeerCam: data.enabled }
                    }))
                } else if(data.purpose === "screen-sharing"){
                    if(data.isSharing){

                        if(userSettings.isPresenting){
                            stopScreenShare()
                        }
                        dispatch(callSettingReducer({
                            userSettings: {
                                isFullScreen: false,
                                isPresenting: false
                            },
                            peerSettings: { isPeerPresenting: true }
                        }))
                    } else {
                        dispatch(callSettingReducer({
                            peerSettings: { isPeerPresenting: false }
                        }))
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
                if(data.initiator){
                    if(data.joined.length === 1){
                        callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
                    } else {
                        callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, false)
                    }
                }
                callTerminated()
            })

            socket.on('call-join', (data) => {
                console.log('******* call-join ***********', data)
                peer.signal(data.signal)
                dispatch(callSettingReducer({
                    isActive: true,
                    joined: [...callSettings.joined, data.joined]
                }))
            })
            
            socket.on('call-error', (data) => {
                console.log('************** Call ERROR *******************')
                console.log(data)
            })

            /*************************************************************/
        })
        .catch((err) => {
            console.log(err)
            dispatch(chatReducer({
                ERROR: {
                    PURPOSE: err.message
                }
            }))
            socket.emit('call-error', {
                error: err.message,
                room: callSettings.members.map(e => e.id)
            })
        
            callTerminated()
        })
    }

    function screenShare(){
        navigator.mediaDevices.getDisplayMedia({ cursor: true })
        .then((screenStream) => {
            if(peer){
                peer.replaceTrack(
                    stream.getVideoTracks()[0],
                    screenStream.getVideoTracks()[0],
                    stream
                );
            }

            dispatch(callSettingReducer({
                userSettings: {
                    isPresenting: true
                }
            }))
            userVideo.current.srcObject = screenStream

            screenStream.getTracks()[0].onended = () => {
                userVideo.current.srcObject = stream
                dispatch(callSettingReducer({
                    userSettings: {
                        isPresenting: false,
                        isFullScreen: false
                    }
                }))
                if(peer){
                    peer.replaceTrack(stream.getVideoTracks()[0]);
                }
                if(peerObject){
                    socket.emit('call-message', {
                        purpose: 'screen-sharing',
                        isSharing: false,
                        room: peerObject.id
                    })
                }
            };
        })

        //Emit event
        if(peerObject){
            socket.emit('call-message', {
                purpose: 'screen-sharing',
                isSharing: true,
                room: peerObject.id
            })
        }
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

    return(
        <>
            {
                callSettings.isActive && callSettings.isInCall &&
                <div className="call-window">
                    <div className="call-window-main">
                        {
                            callSettings.joined.length <= 2 &&
                            <>
                                {
                                    callSettings.purpose === "call" &&
                                    <CallUI
                                        peerObject={peerObject}
                                        peerAudio={peerAudio}
                                    />
                                }
                                {
                                    callSettings.purpose === "video" &&
                                    <VideoUI
                                        peerObject={peerObject}
                                        peerVideo={peerVideo}
                                        userVideo={userVideo}
                                    />
                                }
                            </>
                        }
                        {
                            callSettings.joined.length === 1 &&
                            <audio src="../assets/call_generic_sound.aac" autoPlay loop></audio>
                        }
                    </div>
                    <CallNav 
                        screenShare={screenShare}
                        stopScreenShare={stopScreenShare}
                        stopCamera={stopCamera}
                        isTimer={isTimer}
                        timeStamp={timeStamp}
                        setTimeStamp={setTimeStamp}
                        timer={timer}
                        setTimer={setTimer}
                        socket={socket}
                        stream={stream}
                        peerObject={peerObject}
                        peer={peer}
                        setIsTimer={setIsTimer}
                        userVideo={userVideo}
                    />
                </div>
            }
            {
                callSettings.isActive &&
                <CallerWindow
                    socket={socket}
                />
            }
        </>
    )

    function callTerminated(){
        console.log("Call terminated was triggered")
        if(stream){
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        peer = null;
        dispatch(callSettingsReset())
    }

    function callInterupt(err, timer){
        console.log(timer)
        callMessage(socket, callSettings, timer)

        if(stream){
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        peer = null;

        dispatch(callSettingsReset())
    }
}