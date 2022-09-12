import React, { useState, useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";
import { callSettingReducer, callSettingsReset } from "../../features/callSettings";
import Peer from "simple-peer";
import { SocketContext } from "../../components/Socket";
import informationManager from "../../modules/informationManager";

// Components
import CallerWindow     from "./components/CallerWindow";
import CallNav          from "./components/CallNav";
import CallUI           from "./components/CallUI";
import VideoUI          from "./components/VideoUI";

// Functions
import callMessage      from "../ChatBottom/functions/callMessage"
import volumeMeterInit  from "./functions/volumeMeterInit";

var peer; // Should peer become a state?

export default function ChatCall({ locale, current, USER_DATA }){
    const dispatch = useDispatch();
    const socket = useContext(SocketContext)
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)
    const MESSAGES = useSelector((state) => state.chatReducer.value.MESSAGES)

    const userVideo = useRef(null);
    const peerVideo = useRef(null);
    const peerAudio = useRef(null);

    const [stream, setStream] = useState(); // Your stream (audio or video)
    const [peerStream, setPeerStream] = useState(); //peer stream (audio or video)
    const [screenCastStream, setScreenCastStream] = useState();

    // These are call settings for the PEER
    const [peerObject, setPeerObject] = useState(undefined)
    const [userPeer, setUserPeer] = useState(undefined)

    // For timer function
    const [isTimer, setIsTimer] = useState(false)
    const [timer, setTimer] = useState(0)
    const [timeStamp, setTimeStamp] = useState('')

    //Socket Events
    useEffect(() => {
        if(socket.connected){

            socket.on('call-message', (data) => {
                if(data.purpose === "microphone"){
                    dispatch(callSettingReducer({
                        peerSettings: { isMuted: data.enabled }
                    }))
                } else if(data.purpose === "camera"){
                    dispatch(callSettingReducer({
                        peerSettings: { isCam: data.enabled }
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
                            peerSettings: { isPresenting: true }
                        }))
                    } else {
                        dispatch(callSettingReducer({
                            peerSettings: { isPresenting: false }
                        }))
                    }
                } else if(data.purpose === "error"){
                    dispatch(chatReducer({
                        MESSAGS: [...MESSAGES, {purpose: 'error', message: `An error has occurred by your peer: ${err}`}],
                    }))
                    callTerminated()
                } else if(data.purpose === "reject"){
                    callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
                    callTerminated()
                }
            })
            socket.on('call-error', (data) => {
                if(userSettings.isPresenting){
                    stopScreenShare(true)
                } 
                informationManager({purpose: 'error', message: `An error occured by your peer: ${data.error}`})
                callTerminated()
            })
            socket.on('call-closed', (data) => {
                if(userSettings.isPresenting){
                    stopScreenShare(true)
                } else {
                    dispatch(callSettingsReset())
                    var message = data.reason ? data.reason : `Call closed by: ${data.name}`
                    informationManager({purpose: 'information', message: message})
                }
            })
        }
    }, [socket.connected])

    // Keep this one
    useEffect(() => {
        if(timer === 30){
            if(callSettings.joined.length === 1 && callSettings.initiator){
                console.log("Triggered missed call")
                callMessage(socket, callSettings, timeStamp, true)
                callTerminated()
                socket.emit('call-closed', {
                    id: callSettings.id,
                    user_id: USER_DATA.account_id,
                    reason: `Missed call from ${USER_DATA.firstname} ${USER_DATA.lastname}`,
                    room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                    callSettings: callSettings
                })
                setTimer(0)
            }
        } else if(timer === 10 && callSettings.joined.length === 1 && callSettings.initiator && callSettings.isActive){
            var callObject = {
                ...callSettings,
                ['initiator']: false,
                ['room']: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                ['isInCall']: false,
                signalData: userSettings.firstSignal
            }
            socket.emit('call-init', callObject)
        }
    }, [timer, callSettings.joined])

    useEffect(() => {

        if(callSettings.joined.length === 2){
            setPeerObject(callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0])
        } else if(callSettings.joined.length === 1){
            setPeerObject(undefined)
        }

    }, [callSettings])

    useEffect(() => {
        if(callSettings.isInCall && callSettings.isActive){
            //initWebRTC()
            initiateCall()
        }
    }, [callSettings.isInCall, callSettings.isActive])

    useEffect(() => {
        if((userPeer || peer || userSettings.userPeer) && callSettings.signalData && callSettings.initiator){
            if(userPeer){
                userPeer.signal(callSettings.signalData)
            } else if(!userPeer && peer) {
                peer.signal(callSettings.signalData)
            }
        }
    }, [userPeer, peer, callSettings.signalData])

    /*************************/

    function initWebRTC(){
        setTimeStamp('00:00:00')
        setIsTimer(true)
        setTimer(0)

        navigator.mediaDevices.getUserMedia({ 
            video: (callSettings.purpose === "video" && !noVideo) ? true : false,
            audio: true
        })
        .then((stream) => {
            setStream(stream)
            peer = new Peer({
                initiator: callSettings.initiator,
                trickle: false,
                stream: stream
            })

            setUserPeer(peer)
            dispatch(callSettingReducer({
                userSettings: {
                    userPeer: peer
                }
            }))

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

            // If you are not the initiator, then send a signal back to the one who sent the signal to
            // begin with in order to "answer" the signal
            // This is the 2nd signal
            if(!callSettings.initiator){
                console.log("Signal")
                peer.signal(callSettings.signalData)
            }

            peer.on('signal', (signal) => {
                // The reciever
                if(!callSettings.initiator){
                    var callObject = {
                        id: callSettings.id,
                        joined: USER_DATA.account_id,
                        room: [...callSettings.joined].filter(e => e !== USER_DATA.account_id),
                        signal: signal
                    }
                    socket.emit('call-join', callObject)
                } else { // The initiator, send initation signal
                    dispatch(callSettingReducer({
                        userSettings: {
                            firstSignal: signal
                        }
                    }))

                    var callObject = {
                        ...callSettings,
                        ['initiator']: false,
                        ['room']: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                        ['isInCall']: false,
                        signalData: signal
                    }
                    socket.emit('call-init', callObject) // The first "signal" is sent here
                }
            })

            // This is correct
            peer.on('stream', (stream) => {
                setTimer(0)
                setPeerStream(stream)
                dispatch(callSettingReducer({
                    userSettings: { isMuted: false },
                }))

                if(callSettings.purpose === "video"){
                    peerVideo.current.srcObject = stream
                    dispatch(callSettingReducer({
                        userSettings: { isCam: true },
                        peerSettings: { isCam: true }
                    }))
                } else {
                    var peerAudioManual = document.querySelector('.peer-audio')
                    if(peerAudio.current){
                        peerAudio.current.srcObject = stream
                    } else if (peerAudioManual) {
                        peerAudioManual.srcObject = stream
                    }
                    dispatch(callSettingReducer({
                        peerSettings: { isMuted: false }
                    }))
                }

                if(callSettings.purpose === "video"){
                    var volumeMeter = document.querySelector('.peer-screen .volume-meter')
                } else {
                    var volumeMeter = document.querySelectorAll('.volume-meter')[1]
                }

                volumeMeterInit(stream, volumeMeter, callSettings.purpose)
            })

            // If the call was interrupted
            peer.on('close', (err) => {
                console.log(err)
                callInterupt(err, timeStamp)
            })

            peer.on('error', (err) => {
                console.log(err)
                informationManager({purpose: 'error', message: err.message ? err.message : err})
                callInterupt(err, timeStamp)
            })
        })
        .catch((err) => {
            console.error(err)
            console.log(err, err instanceof DOMException, err.message === "The request is not allowed by the user agent or the platform in the current context.")
            if(err instanceof DOMException){
                if(err.message === "The request is not allowed by the user agent or the platform in the current context."){
                    
                    if(callSettings.purpose === "video"){
                        informationManager({purpose: 'error', message: `${err.message} Please grant camera access in order to continue.`})

                    } else {
                        informationManager({purpose: 'error', message: `${err.message} Please grant microphone access in order to continue.`})
                    }
                } else if(err.message === "Requested device not found" && callSettings.purpose === "video"){
                    console.log("Error with video and camera access")
                    console.log(err)
                    informationManager({purpose: 'error', message: err.message})
        
                    socket.emit('call-error', {
                        error: err.message,
                        room: callSettings.members.map(e => e.id)
                    })
                
                    callTerminated()
                } else if(err.message === "Permission denied"){
                    informationManager({purpose: 'error', message: `${err.message} by you`})
                }
            }
        })
    }

    function initiateCall(){
        setTimeStamp('00:00:00')
        setIsTimer(true)
        setTimer(0)
        setStream(userSettings.userStream)

        peer = new Peer({
            initiator: callSettings.initiator,
            trickle: false,
            stream: userSettings.userStream
        })

        setUserPeer(peer)
        dispatch(callSettingReducer({
            userSettings: {
                userPeer: peer
            }
        }))

        if(callSettings.purpose === "video"){
            dispatch(callSettingReducer({ userSettings: { isCam: true }}))
            if(userVideo.current){
                userVideo.current.srcObject = userSettings.userStream
            } else {
                document.querySelector('.user-video').srcObject = userSettings.userStream
            }
        }

        if(callSettings.purpose === "video"){
            var volumeMeter = document.querySelector('.user-window .volume-meter')
        } else {
            var volumeMeter = document.querySelector('.volume-meter')
        }

        volumeMeterInit(userSettings.userStream, volumeMeter, callSettings.purpose)

        // If you are not the initiator, then send a signal back to the one who sent the signal to
        // begin with in order to "answer" the signal
        // This is the 2nd signal
        if(!callSettings.initiator){
            console.log("Signal")
            peer.signal(callSettings.signalData)
        }

        peer.on('signal', (signal) => {
            // The reciever
            if(!callSettings.initiator){
                var callObject = {
                    id: callSettings.id,
                    joined: USER_DATA.account_id,
                    room: [...callSettings.joined].filter(e => e !== USER_DATA.account_id),
                    signal: signal
                }
                socket.emit('call-join', callObject)
            } else { // The initiator, send initation signal
                dispatch(callSettingReducer({
                    userSettings: {
                        firstSignal: signal
                    }
                }))

                var callObject = {
                    ...callSettings,
                    ['initiator']: false,
                    ['room']: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                    ['isInCall']: false,
                    signalData: signal
                }
                socket.emit('call-init', callObject) // The first "signal" is sent here
            }
        })

        // This is correct
        peer.on('stream', (stream) => {
            setTimer(0)
            setPeerStream(stream)
            dispatch(callSettingReducer({
                userSettings: { isMuted: false },
            }))

            if(callSettings.purpose === "video"){
                peerVideo.current.srcObject = stream
                dispatch(callSettingReducer({
                    userSettings: { isCam: true },
                    peerSettings: { isCam: true }
                }))
            } else {
                var peerAudioManual = document.querySelector('.peer-audio')
                if(peerAudio.current){
                    peerAudio.current.srcObject = stream
                } else if (peerAudioManual) {
                    peerAudioManual.srcObject = stream
                }
                dispatch(callSettingReducer({
                    peerSettings: { isMuted: false }
                }))
            }

            if(callSettings.purpose === "video"){
                var volumeMeter = document.querySelector('.peer-screen .volume-meter')
            } else {
                var volumeMeter = document.querySelectorAll('.volume-meter')[1]
            }

            volumeMeterInit(stream, volumeMeter, callSettings.purpose)
        })

        // If the call was interrupted
        peer.on('close', (err) => {
            console.log(err)
            callInterupt(err, timeStamp)
        })

        peer.on('error', (err) => {
            console.log(err)
            informationManager({purpose: 'error', message: err.message ? err.message : err})
            callInterupt(err, timeStamp)
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
    

    function stopScreenShare(isClosing = false){
        if(screenCastStream){
            screenCastStream.getVideoTracks().forEach(function (track) {
                track.stop();
            });
        }

        if(!isClosing){
            try {
                userVideo.current.srcObject = stream
            } catch(err){
                console.log(err)
                console.error(err)
            }
    
            dispatch(callSettingReducer({
                userSettings: {
                    isPresenting: false,
                    isFullScreen: false
                }
            }))
    
            if(peer){
                try {
                    peer.replaceTrack(
                        screenCastStream.getVideoTracks()[0],
                        stream.getVideoTracks()[0],
                        stream
                    );
                } catch(err){
                    console.log(err)
                    try {
                        var previousStream = stream.getVideoTracks()[0];
                        peer.replaceTrack(previousStream)
                    } catch(err){
                        console.log(err)
                        informationManager({purpose: 'error', message: "Could not replace video track, please reload the page"})
                    }
                }
            }

            //Emit event
            if(peerObject){
                socket.emit('call-message', {
                    purpose: 'screen-sharing',
                    isSharing: false,
                    room: peerObject.id
                })
            }
        } else {
            dispatch(callSettingsReset())
            var message = data.reason ? data.reason : `Call closed by: ${data.name}`
            informationManager({purpose: 'information', message: message})
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
                            (callSettings.initiator && callSettings.joined.length === 1) &&
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
                        setUserPeer={setUserPeer}
                    />
                </div>
            }
            {
                (callSettings.isActive && !callSettings.initiator && !callSettings.isInCall) &&
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
        socket.emit('call-closed', {
            id: callSettings.id,
            user_id: USER_DATA.account_id,
            name: `${USER_DATA.firstname} ${USER_DATA.lastname}`,
            room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id)
        })
        dispatch(callSettingsReset())
        setStream(undefined)
        setPeerStream(undefined)
        setScreenCastStream(undefined)
    }

    function callInterupt(err, timer){
        console.log(err)
        if(callSettings.initiator){
            callMessage(socket, callSettings, timer)
        }
        
        socket.emit('call-error', {
            userID: USER_DATA.account_id,
            message: err,
            room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id)
        })

        if(stream){
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
    
        dispatch(callSettingsReset())
        setStream(undefined)
        setPeerStream(undefined)
        setScreenCastStream(undefined)
    }
}