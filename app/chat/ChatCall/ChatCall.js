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

var peer; // Should peer become a state?

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
    const [userPeer, setUserPeer] = useState(undefined)

    // For timer function
    const [isTimer, setIsTimer] = useState(false)
    const [timer, setTimer] = useState(0)
    const [timeStamp, setTimeStamp] = useState('')

    //Socket Events
    useEffect(() => {
        console.log(socket.connected)
        if(socket.connected){

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
                    console.log('Error Message Triggered')
                    callTerminated()
                } else if(data.purpose === "reject"){
                    console.log("reject triggered")
                    callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
                    callTerminated()
                }
            })
            socket.on('call-error', (data) => {
                console.log('************** Call ERROR *******************')
                console.log(data)
                callTerminated()
            })
            socket.on('call-closed', (data) => {
                console.log('call-closed recieved', data)
                dispatch(callSettingsReset())
                dispatch(chatReducer({
                    MESSAGE: {
                        PURPOSE: `Call closed by: ${data.name}`
                    }
                }))
            })

            // Initiated if the Peer ends the call
            //socket.on('call-exit', (data) => {
            //    if(data.initiator){
            //        if(data.joined.length === 1){
            //            callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, true)
            //        } else {
            //            callMessage(socket, data.callSettings ? data.callSettings : data, timeStamp, false)
            //        }
            //    }
            //    console.log("Call exit triggered")
            //    callTerminated()
            //})
        }

        return(() => {
            socket.off('call-closed')
            socket.off('call-error')
            socket.off('call-message')
        })
    }, [socket.connected])

    // Keep this one
    useEffect(() => {
        if(timer === 30){
            if(callSettings.joined.length === 1 && callSettings.initiator){
                console.log("Triggered missed call")
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

        if(callSettings.joined.length === 2){
            setPeerObject(callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0])
        } else if(callSettings.joined.length === 1){
            setPeerObject(undefined)
        }

    }, [callSettings])

    useEffect(() => {
        if(callSettings.isInCall && callSettings.isActive){
            initWebRTC()
        }
    }, [callSettings.isInCall, callSettings.isActive])

    useEffect(() => {
        console.log(userPeer, peer)
        if((userPeer || peer || userSettings.userPeer) && callSettings.signalData && callSettings.initiator){
            console.log("Sent")
            if(userPeer){
                userPeer.signal(callSettings.signalData)
            } else {
                peer.signal(callSettings.signalData)
            }
        }
    }, [userPeer, peer, callSettings.signalData])

    /*************************/

    function initWebRTC(){
        console.log("Initiated by:", USER_DATA.account_id)
        setTimeStamp('00:00:00')
        setIsTimer(true)
        setTimer(0)

        navigator.mediaDevices.getUserMedia({ 
            video: callSettings.purpose === "video" ? true : false,
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
                    try {
                        userVideo.current.srcObject = userSettings.stream
                    } catch(err){
                        console.log(err)
                        userVideo.current.srcObject = stream
                    }
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
            //peer.on('stream', (stream) => {
            //    setPeerStream(stream)
            //    dispatch(callSettingReducer({
            //        userSettings: { isMuted: false }
            //    }))
            //
            //    if(callSettings.purpose === "video"){
            //        dispatch(callSettingReducer({
            //            userSettings: { isCam: true }
            //        }))
            //    }
            //
            //    setTimer(0)
            //})

            // This is correct
            peer.on('stream', (stream) => {
                setTimer(0)
                setPeerStream(stream)
                dispatch(callSettingReducer({
                    userSettings: { isMuted: false },
                }))
                if(callSettings.purpose === "video"){
                    if(peerVideo.current){
                        peerVideo.current.srcObject = stream
                    }
                    dispatch(callSettingReducer({
                        userSettings: { isCam: true },
                        peerSettings: { isPeerCam: true }
                    }))
                } else {
                    var peerAudioManual = document.querySelector('.peer-audio')
                    if(peerAudio.current){
                        peerAudio.current.srcObject = stream
                    } else if (peerAudioManual) {
                        peerAudioManual.srcObject = stream
                    }
                    dispatch(callSettingReducer({
                        peerSettings: { isPeerMuted: false }
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
                dispatch(chatReducer({
                    ERROR: {
                        PURPOSE: err.message ? err.message : err
                    }
                }))
                callInterupt(err, timeStamp)
            })

            /*************************************************************/
        })
        //.catch((err) => {
        //    console.log(err)
        //    dispatch(chatReducer({
        //        ERROR: {
        //            PURPOSE: err.message
        //        }
        //    }))
        //    socket.emit('call-error', {
        //        error: err.message,
        //        room: callSettings.members.map(e => e.id)
        //    })
        //
        //    callTerminated()
        //})
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

            setScreenCastStream(screenStream)
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