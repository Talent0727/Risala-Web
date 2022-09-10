import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { callSettingReducer, callSettingsReset } from "../../../features/callSettings";

export default function CallerWindow({ socket }){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const callSettings = useSelector((state) => state.callSettingReducer)

    function acceptCall(){
        dispatch(callSettingReducer({
            isInCall: true,
            joined: [...callSettings.joined, USER_DATA.account_id],
            signalData: callSettings.signalData
        }))
    }

    function rejectCall(){
        socket.emit('call-closed', {
            user: USER_DATA.account_id,
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