import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { callSettingReducer, callSettingsReset } from "../../../features/callSettings";
import informationManager from "../../../modules/informationManager";
import Peer from "simple-peer";

export default function CallerWindow({ socket }){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const callSettings = useSelector((state) => state.callSettingReducer)

    function acceptCall(){
        navigator.mediaDevices.getUserMedia({
            video: callSettings.purpose === "video" ? true : false,
            audio: true
        })
        .then((stream) => {
            initCall(stream)
        })
        .catch((err) => {
            informationManager({purpose: 'error', message: `${err.message} Please allow your browser to access the camera/microphone.`})
            console.log(err)
            socket.emit('call-closed', {
                id: callSettings.id,
                user_id: USER_DATA.account_id,
                name: `${USER_DATA.firstname} ${USER_DATA.lastname}`,
                reason: `Call could not be initiated due to permission issues regarding camera/microphone by peer ${USER_DATA.firstname}`,
                room: callSettings.joined.filter(e => e.id !== USER_DATA.account_id)
            })
            dispatch(callSettingsReset())
        })

        function initCall(stream, cameraError = false){
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream
            })

            dispatch(callSettingReducer({
                isInCall: true,
                joined: [...callSettings.joined, USER_DATA.account_id],
                signalData: callSettings.signalData,
                userSettings: {
                    isCam: (callSettings.purpose === "video" && !cameraError) ? true : false,
                    isCamError: cameraError ? true : false,
                    isMuted: false,
                    userPeer: peer,
                    userStream: stream
                }
            }))
        }
    }

    function rejectCall(){
        socket.emit('call-closed', {
            id: callSettings.id,
            user_id: USER_DATA.account_id,
            name: `${USER_DATA.firstname} ${USER_DATA.lastname}`,
            reason: `Call rejected by ${USER_DATA.firstname} ${USER_DATA.lastname}`,
            room: callSettings.joined.filter(e => e.id !== USER_DATA.account_id)
        })
        dispatch(callSettingsReset())
    }

    return(
        <>
            {
                (!callSettings.initiator && !callSettings.joined.find(e => e.id === USER_DATA.account_id) && callSettings.isActive) &&
                <div className="caller-window">
                    <figure>
                        {
                            callSettings.members &&
                            <img src={callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].profile_picture ? callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"} />
                        }
                    </figure>
                    <span>
                        { callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].firstname + ' ' + callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].lastname }
                    </span>
                    <div className="button-options">
                        <div className="button">
                            <div>
                                <i className="material-icons" onClick={rejectCall}>close</i>
                            </div>
                            <span>Decline</span>
                        </div>
                        <div className="button">
                            <div>
                                <i className="material-icons" onClick={acceptCall}>check</i>
                            </div>
                            <span>Accept</span>
                        </div>
                    </div>
                    <audio src="../assets/call_generic_sound.aac" autoPlay loop></audio>
                </div>
            }
        </>
    )
}