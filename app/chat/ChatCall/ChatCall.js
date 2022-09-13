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

let screenSharing = false;
let screenCastStreamSaver;

export default function ChatCall({ locale, current, USER_DATA }){
    const dispatch = useDispatch();
    const socket = useContext(SocketContext)
    const callSettings = useSelector((state) => state.callSettingReducer)
    const userSettings = useSelector((state) => state.callSettingReducer.userSettings)
    const peerSettings = useSelector((state) => state.callSettingReducer.peerSettings)
    const timer = useSelector((state) => state.callSettingReducer.timer)
    const isTimer = useSelector((state) => state.callSettingReducer.isTimer)

    const userVideo     = useRef(null);
    const peerVideo     = useRef(null);
    const peerAudio     = useRef(null);
    const callWindow    = useRef(null);

    // For draggable window
    const [dragPosition, setDragPosition] = useState([0, 20])

    // These are call settings for the PEER
    const [userPeer, setUserPeer] = useState(undefined)

    // Reserve states
    const [castStream, setCastStream] = useState(undefined)
    const [isMissed, setIsMissed] = useState(true)

    //Socket Events
    useEffect(() => {
        if(socket.connected && callSettings.isActive){

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

                        // TEST!!!!!!!
                        // Remove fullscreen, peer is now presenting
                        dispatch(callSettingReducer({
                            peerSettings: {
                                isPresenting: true
                            }
                        }))
                    } else {
                        dispatch(callSettingReducer({
                            peerSettings: { isPresenting: false }
                        }))
                    }
                } else if(data.purpose === "error"){
                    informationManager({purpose: 'error', message: `An error has occurred by your peer: ${err}`})
                    callTerminated(socket)
                } else if(data.purpose === "reject"){
                    callMessage(socket, true)
                    callTerminated(socket)
                }
            })
            socket.on('call-error', (data) => {
                informationManager({purpose: 'error', message: `An error occured by your peer: ${data.error}`})
                callTerminated(socket)
            })
            socket.on('call-closed', (data) => {
                if(callSettings.initiator){
                    console.log(isMissed)
                    callMessage(socket, isMissed)
                }

                try {
                    document.querySelectorAll('.call-window video').forEach((video) => {
                        console.log(video)
                        var tracks = video.srcObject.getTracks();
                        tracks.forEach((track) => {
                            console.log(track)
                            track.stop()
                        })
                        video.srcObject = null;
                    })
                } catch(err){
                    console.log(err)
                }
            
                try {
                    userSettings.userPeer.destroy()
                } catch(err){
                    console.log(err)
                }

                dispatch(callSettingsReset())
                var message = data.reason ? data.reason : `Call closed by: ${data.name}`
                informationManager({purpose: 'information', message: message})
            })
        } else if(!callSettings.isActive){
            console.log("Inactive, remove all socket listeners")
            socket.off('call-message')
            socket.off('call-error')
            socket.off('call-closed')
            setIsMissed(true)
        }
    }, [socket.connected, callSettings.isActive])

    // Keep this one
    useEffect(() => {
        if(callSettings.joined.length === 2){
            dispatch(callSettingReducer({
                peerSettings: {
                    peerObject: callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0]
                }
            }))
            setIsMissed(false)
        }

        if(timer === 30 && callSettings.isActive){
            if(callSettings.joined.length === 1 && callSettings.initiator){
                console.log("Triggered missed call")
                callMessage(socket, true)
                callTerminated(socket)
                socket.emit('call-closed', {
                    id: callSettings.id,
                    user_id: USER_DATA.account_id,
                    reason: `Missed call from ${USER_DATA.firstname} ${USER_DATA.lastname}`,
                    room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id),
                    callSettings: callSettings
                })
                dispatch(callSettingReducer({
                    timer: 0
                }))
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
            initiateCall()
        }
    }, [callSettings.isInCall, callSettings.isActive])

    useEffect(() => {
        if((userPeer || userSettings.userPeer) && callSettings.signalData && callSettings.initiator){
            try {
                userSettings.userPeer.signal(callSettings.signalData)
            } catch {
                try {
                    userPeer.signal(callSettings.signalData)
                } catch (err){
                    informationManager({purpose: 'error', message: err.message})
                    callTerminated(socket)
                }
            }
        }
    }, [callSettings.userPeer, userPeer, callSettings.signalData])

    /************************* DRAG FUNCTION ************************'*/
    const [isDragging, setIsDragging] = useState(false)
    const [startPosition, setStartPosition] = useState([0, 0])
    const [elementPosition, setElementPosition] = useState([0, 0])

    function dragWindow(e){
        if(e.type === "mousedown"){
            setIsDragging(true)
            setStartPosition([e.pageX, e.pageY])
        } else if(e.type === "mouseup" && isDragging){
            setIsDragging(false)
            document.removeEventListener('mouseup', dragWindow)
            document.removeEventListener('mousemove', dragWindow)
            bounceEffect()
        } else if(e.type === "mousemove"){
            var differenceX = e.clientX - startPosition[0]
            var differenceY = e.clientY - startPosition[1]
            dragEffect(differenceX, differenceY)
        }

        function dragEffect(differenceX, differenceY){

            // Left drag
            if(differenceX < 0){
                var newPositionX = dragPosition[1] - Math.abs(differenceX)
            } else { // Right drag
                var newPositionX = dragPosition[1] + differenceX
            }

            // Upwards drag
            if(differenceY < 0){
                var newPositionY = dragPosition[0] - Math.abs(differenceY)
            } else { // Downwards drag
                var newPositionY = dragPosition[0] + differenceY
            }

            setDragPosition([newPositionX, newPositionY])
        }

        function bounceEffect(){
            var positionX = dragPosition[0]
            var positionY = dragPosition[1]
            var width = document.querySelector('.call-window').clientWidth 
            var height = document.querySelector('.call-window').clientHeight 
            var left;
            var top;
            
            var leftFiftyMark = (window.innerWidth / 2)
            var leftMax = window.innerWidth
            var topFiftyMark = (window.innerHeight / 2)
            var topMax = window.innerHeight

            if(positionY < 20 || positionY < leftFiftyMark){
                left = '20px'
            } else if(positionY > leftMax || positionY > leftFiftyMark){
                left = `${leftMax - (width + 20)}px`
            }

            if(positionX < 20 || positionX < topFiftyMark){
                top = "20px"
            } else if(positionX > topMax || positionX > topFiftyMark){
                top = `${topMax - (height + 20)}px`
            }

            try {
                callWindow.currentTarget.animate([{ top: top, left: left}], {
                    duration: 1000,
                    easing: "ease",
                    fill: "forwards",
                })
            } catch {
                document.querySelector('.call-window').animate([{ top: top, left: left}], {
                    duration: 1000,
                    easing: "ease",
                    fill: "forwards",
                })
            }
        }
    }

    useEffect(() => {
        if(isDragging){
            document.addEventListener('mouseup', dragWindow)
            document.addEventListener('mousemove', dragWindow)
        }

        return(() => {
            if(isDragging){
                document.removeEventListener('mouseup', dragWindow)
                document.removeEventListener('mousemove', dragWindow)
            }
        })
    }, [isDragging])

    useEffect(() => {
        if(callSettings.isMinimised && callSettings.purpose === "call"){
            var left = ((window.innerWidth / 2) - 150)
            setDragPosition([left, 20])
        }
    }, [callSettings.isMinimised])

    function initiateCall(){
        dispatch(callSettingReducer({
            isTimer: true,
            timer: 0,
            timeStamp: '00:00:00'
        }))

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
            dispatch(callSettingReducer({
                timer: 0,
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
                try {
                    if(peerAudio.current){
                        peerAudio.current.srcObject = stream
                    } else if (peerAudioManual) {
                        peerAudioManual.srcObject = stream
                    }
                } catch {
                    peerAudio.current.srcObject = peerSettings.peerStream
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
            callInterrupt(err, socket)
        })

        userSettings.userPeer.on('error', (err) => {
            console.log(err)
            informationManager({purpose: 'error', message: err.message ? err.message : err})
            callInterrupt(err, socket)
        })
    }

    return(
        <>
            {
                callSettings.isActive && callSettings.isInCall &&
                <div
                    className={
                        (callSettings.isMinimised && callSettings.purpose === "video") ? "call-window minimised video" :
                        callSettings.isMinimised && callSettings.purpose === "call" ? "call-window minimised call" :
                        callSettings.purpose === "video" ? "call-window video" :
                        callSettings.purpose === "call" ? "call-window call" : "call-window"
                    }
                    ref={callWindow}
                    onMouseDown={(callSettings.isMinimised && callSettings.purpose === "call") ? dragWindow : null}
                    style={(callSettings.isMinimised && callSettings.purpose) ? {left: `${dragPosition[0]}px`, top: `${dragPosition[1]}px`} : null}
                >
                    <div className="call-window-main">
                        {
                            callSettings.joined.length <= 2 &&
                            <>
                                {
                                    callSettings.purpose === "call" &&
                                    <CallUI peerAudio={peerAudio} />
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
                        socket={socket}
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
            userSettings.screenStream.getVideoTracks().forEach(function (track) {
                track.stop();
            });
        } catch(err) {
            try {
                screenCastStreamSaver.getVideoTracks().forEach(function (track) {
                    track.stop();
                });
            } catch(err) {
                console.log(err)
                informationManager({purpose: 'error', message: err.message})
            }
        }

        try {
            userVideo.current.srcObject = userSettings.userStream
        } catch(err){
            console.log(err)
            console.error(err)
            informationManager({purpose: 'error', message: err.message})
        }
    

        dispatch(callSettingReducer({
            userSettings: {
                isPresenting: false,
                isFullScreen: false
            }
        }))
    
        // Replace the stream for your peer
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

        //Emit event
        if(peerSettings.peerObject){
            socket.emit('call-message', {
                purpose: 'screen-sharing',
                isSharing: false,
                room: peerSettings.peerObject.id
            })
        }
    }
}