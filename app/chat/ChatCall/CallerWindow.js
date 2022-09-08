import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";

export default function CallerWindow({ socket, isInitiator, isInCall, setIsInCall, callMessage }){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const callSettings = useSelector((state) => state.chatReducer.value.callSettings)

    function acceptCall(){
        var callObject = {
            id: callSettings.id,
            isActive: true,
            joined: [...callSettings.joined, USER_DATA.account_id],
            members: callSettings.members,
            room: callSettings.joined,
            initiator: callSettings.initiator,
            purpose: callSettings.purpose,
            signalData: callSettings.signalData
        }
        
        dispatch(chatReducer({callSettings: callObject}))
    }

    function rejectCall(){
        socket.emit('call-exit', {
            id: callSettings.id,
            isActive: true,
            joined: callSettings.joined,
            members: callSettings.members,
            room: callSettings.joined,
            initiator: callSettings.initiator,
            purpose: callSettings.purpose,
            room: callSettings.joined.filter(e => e !== USER_DATA.account_id)
        })
        dispatch(chatReducer({
            callSettings: {
                id: undefined,
                isActive: false,
                members: [],
                joined: []
            }
        }))
    }

    return(
        <>
            {
                (callSettings.initiator !== USER_DATA.account_id && isInCall === false && callSettings.members.length > 0) &&
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