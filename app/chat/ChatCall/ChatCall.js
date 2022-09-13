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
import { callTerminated, callInterrupt } from "./functions/closeCalls";

var peer; // Should peer become a state?
let screenSharing = false;
let screenCastStreamSaver;

export default function ChatCall({ locale, current, USER_DATA }){
    const dispatch = useDispatch();
    const socket = useContext(SocketContext)
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)

    const userVideo = useRef(null);
    const peerVideo = useRef(null);
    const peerAudio = useRef(null);

    // These are call settings for the PEER
    const [userPeer, setUserPeer] = useState(undefined)

    // Reserve states
    const [castStream, setCastStream] = useState(undefined)

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
                        console.log("Peer is presenting now")
                        if(userSettings.isPresenting || screenSharing){
                            console.log("Stop presenting")
                            stopScreenShare(false, true)
                        } else {
                            // Remove fullscreen, peer is now presenting
                            dispatch(callSettingReducer({
                                userSettings: {
                                    isFullScreen: false
                                },
                                peerSettings: {
                                    isPresenting: true
                                }
                            }))
                        }
                    } else {
                        dispatch(callSettingReducer({
                            peerSettings: { isPresenting: false }
                        }))
                    }
                } else if(data.purpose === "error"){
                    informationManager({purpose: 'error', message: `An error has occurred by your peer: ${err}`})
                    callTerminated(socket)
                } else if(data.purpose === "reject"){
                    callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
                    callTerminated(socket)
                }
            })
            socket.on('call-error', (data) => {
                if(userSettings.isPresenting){
                    stopScreenShare(true)
                } 
                informationManager({purpose: 'error', message: `An error occured by your peer: ${data.error}`})
                callTerminated(socket)
            })
            socket.on('call-closed', (data) => {
                if(callSettings.initiator){
                    callMessage(socket, callSettings, timeStamp, callSettings.joined.length === 1 ? true : false)
                }

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
        if(callSettings.joined.length === 2){
            dispatch(callSettingReducer({
                peerSettings: {
                    peerObject: callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0]
                }
            }))
        }

        if(timer === 30){
            if(callSettings.joined.length === 1 && callSettings.initiator){
                console.log("Triggered missed call")
                callMessage(socket, callSettings, timeStamp, true)
                callTerminated(socket)
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
        if(callSettings.isInCall && callSettings.isActive){
            //initWebRTC()
            initiateCall()
        }
    }, [callSettings.isInCall, callSettings.isActive])

    useEffect(() => {
        if((userPeer || peer || userSettings.userPeer) && callSettings.signalData && callSettings.initiator){
            if(userSettings.userPeer){
                userSettings.userPeer.signal(callSettings.signalData)
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
                callInterrupt(err, timeStamp, socket)
            })

            peer.on('error', (err) => {
                console.log(err)
                informationManager({purpose: 'error', message: err.message ? err.message : err})
                callInterrupt(err, timeStamp, socket)
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
                
                    callTerminated(socket)
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

        setUserPeer(userSettings.userPeer)

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
        try {
            if(!callSettings.initiator){
                console.log("Signal")
                userSettings.userPeer.signal(callSettings.signalData)
            }
        } catch (err) {
            informationManager({purpose: 'error', message: err.message})
        }

        userSettings.userPeer.on('signal', (signal) => {
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
        userSettings.userPeer.on('stream', (stream) => {
            setTimer(0)
            dispatch(callSettingReducer({
                userSettings: { isMuted: false },
                peerSettings: { peerStream: stream }
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
        userSettings.userPeer.on('close', (err) => {
            console.log(err)
            callInterrupt(err, timeStamp, socket)
        })

        userSettings.userPeer.on('error', (err) => {
            console.log(err)
            informationManager({purpose: 'error', message: err.message ? err.message : err})
            callInterrupt(err, timeStamp, socket)
        })
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
                                        peerAudio={peerAudio}
                                    />
                                }
                                {
                                    callSettings.purpose === "video" &&
                                    <VideoUI
                                        socket={socket}
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
                        isTimer={isTimer}
                        timeStamp={timeStamp}
                        setTimeStamp={setTimeStamp}
                        timer={timer}
                        setTimer={setTimer}
                        socket={socket}
                        setIsTimer={setIsTimer}
                        userVideo={userVideo}
                    />
                </div>
            }
            {
                (callSettings.isActive && !callSettings.initiator && !callSettings.isInCall) &&
                <CallerWindow socket={socket}/>
            }
        </>
    )

    function screenShare(){
        screenSharing = true;
        navigator.mediaDevices.getDisplayMedia({ cursor: true })
        .then((screenStream) => {
            setCastStream(screenStream)
            screenCastStreamSaver = screenStream
            dispatch(callSettingReducer({
                userSettings: {
                    screenStream: screenStream,
                    isPresenting: true
                },
                peerSettings: {
                    isPresenting: false
                }
            }))
    
            if(userSettings.userPeer){
                userSettings.userPeer.replaceTrack(
                    userSettings.userStream.getVideoTracks()[0],
                    screenStream.getVideoTracks()[0],
                    userSettings.userStream
                );
                
                //Emit event
                if(peerSettings.peerObject){
                    socket.emit('call-message', {
                        purpose: 'screen-sharing',
                        isSharing: true,
                        room: peerSettings.peerObject.id
                    })
                }
            }

            userVideo.current.srcObject = screenStream
    
            screenStream.getTracks()[0].onended = (screenCastStream) => {
                console.log(screenCastStream)
                try {
                    userSettings.userPeer.replaceTrack(
                        screenCastStream.currentTarget,
                        userSettings.userStream.getVideoTracks()[0],
                        userSettings.userStream
                    );
                    userVideo.current.srcObject = userSettings.userStream
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

    function stopScreenShare(isClosing = false, peerOvertake = false){
        screenSharing = false;

        // Try to close down casStream
        try {
            userSettings.castStream.getVideoTracks().forEach(function (track) {
                track.stop();
            });

            if(peerOvertake){
                dispatch(callSettingReducer({
                    userSettings: {
                        isFullScreen: false,
                        isPresenting: false
                    },
                    peerSettings: { isPresenting: true }
                }))
            }
        } catch(err) {
            console.log(err)
            console.error(err)

            if(castStream){
                try {
                    castStream.getVideoTracks().forEach(function (track) {
                        track.stop();
                    });
                } catch(err){
                    console.log(err)
                }
            } else {
                try {
                    screenCastStreamSaver.getVideoTracks().forEach(function (track) {
                        track.stop();
                    });
                } catch(err) {
                    console.log(err)
                    informationManager({purpose: 'error', message: err.message})
                }
            }
        }

        if(peerOvertake){
            if(userSettings.userPeer){
                if(userSettings.screenStream){
                    try {
                        userSettings.userPeer.replaceTrack(
                            userSettings.screenStream.getVideoTracks()[0],
                            userSettings.userStream.getVideoTracks()[0],
                            userSettings.userStream
                        );
                    } catch (err){
                        informationManager({purpose: 'error', message: err.message})
                    }
                } else if(castStream){
                    try {
                        userSettings.userPeer.replaceTrack(
                            castStream.getVideoTracks()[0],
                            userSettings.userStream.getVideoTracks()[0],
                            userSettings.userStream
                        );
                    } catch (err){
                        informationManager({purpose: 'error', message: err.message})
                    }
                } else {
                    try {
                        userSettings.userPeer.replaceTrack(
                            screenCastStreamSaver.getVideoTracks()[0],
                            userSettings.userStream.getVideoTracks()[0],
                            userSettings.userStream
                        );
                    } catch (err){
                        informationManager({purpose: 'error', message: err.message})
                    }
                }
            } else {
                informationManager({purpose: 'error', message: "Peer could not be found! Please close the call and reload the page"})
            }
    
    
            //Emit event
            if(peerSettings.peerObject){
                socket.emit('call-message', {
                    purpose: 'screen-sharing',
                    isSharing: false,
                    room: peerSettings.peerObject.id
                })
            }

            dispatch(callSettingReducer({
                userSettings: {
                    isFullScreen: false,
                    isPresenting: false
                },
                peerSettings: { isPresenting: true }
            }))
        }
    
        if(!isClosing && !peerOvertake){
            try {
                userVideo.current.srcObject = userSettings.userStream
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
        
    
            if(userSettings.userPeer){
                try {
                    userSettings.userPeer.replaceTrack(
                        userSettings.screenStream.getVideoTracks()[0],
                        userSettings.userStream.getVideoTracks()[0],
                        userSettings.userStream
                    );
                } catch(err){
                    console.log(err)
                    try {
                        userSettings.userPeer.replaceTrack(userSettings.userStream.getVideoTracks()[0])
                    } catch(err){
                        console.log(err)
                        informationManager({purpose: 'error', message: "Could not replace video track, please reload the page"})
                    }
                }
            }
    
    
            //Emit event
            if(peerSettings.peerObject){
                socket.emit('call-message', {
                    purpose: 'screen-sharing',
                    isSharing: false,
                    room: peerSettings.peerObject.id
                })
            }
        } else {
            dispatch(callSettingsReset())
            var message = data.reason ? data.reason : `Call closed by: ${data.name}`
            informationManager({purpose: 'information', message: message})
        }
    }
}