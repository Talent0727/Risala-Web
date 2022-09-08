import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";

export default function CallTop({ isTimer, timeStamp, setTimeStamp, timer, setTimer }){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const callSettings = useSelector((state) => state.chatReducer.value.callSettings)

    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState(undefined)

    useEffect(() => {
        setLoading(true)
        if(current && current.members){
            if(current.members.length > 2){
                setGroup(current.members)
            } else {
                setGroup(undefined)
                var nicknames = current.nicknames

                if(nicknames){
                    nicknames = JSON.parse(current.nicknames)
                    if(nicknames.find((e) => e.id !== USER_DATA.account_id)){
                        setNickname(nicknames.find((e) => e.id !== USER_DATA.account_id).nickname)
                    } else {
                        setNickname(undefined)
                    }
                } else {
                    setNickname(undefined)
                }
            }

            if(current.alias){
                setAlias(current.alias)
            } else {
                if(current && current.alias){
                    setAlias(current.alias)
                } else {
                    setAlias(undefined)
                }
            }
            setLoading(false)
        }
    }, [current, callSettings])

    useEffect(() => {
        if(isTimer){
            var timerInterval = setInterval(() => {
                var hours   = (timer + 1) > 3600 ? Math.floor((timer + 1)/(60*60)) : 0
                var minutes = (timer + 1) > 60 ? Math.floor((timer + 1)/60) >= 60 ? Math.floor((timer + 1)/60) - 60 : Math.floor((timer + 1)/60) : 0
                var seconds = (timer + 1) % 60
                
                var hours = `0${hours}`.slice(-2)
                var minutes = `0${minutes}`.slice(-2)
                var seconds = `0${seconds}`.slice(-2)
                
                setTimeStamp(`${hours}:${minutes}:${seconds}`)
                setTimer(timer + 1)
            }, 1000)
        }

        return(() => {
            clearInterval(timerInterval)
        })
    }, [isTimer, timer])

    return(
        <div className="call-window-top">
            {
                callSettings &&
                <>
                    <div className="message-top">
                    {
                        //(!group && !loading & COUNTER_DATA)
                        (!loading && callSettings.isActive) &&
                        <>
                            <figure>
                                <img src={callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].profile_picture ? callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"} />
                            </figure>
                            {
                                nickname ?
                                <span>{nickname}</span>
                                :
                                <span>{ callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].firstname + ' ' + callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].lastname}</span>
                            }
                        </>
                    }
                    </div>
                    <div className="timer">{timeStamp}</div>
                </>
            }
        </div>
    )
}