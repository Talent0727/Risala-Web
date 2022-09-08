import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';
import useLocale from "../../../hooks/useLocale";

export default function ChangeNickname({closeWindow, socket}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const chat = useSelector((state) => state.chatReducer.value.chat)

    const [members, setMembers] = useState(undefined)
    const [target, setTarget] = useState(undefined)
    const [alias, setAlias] = useState(false)
    const [approve, setApprove] = useState(false)

    useEffect(() => {
        setMembers(current.members)
        
        if(current.nicknames){
            setAlias(JSON.parse(current.nicknames))
        }
    }, [current])

    function userClick(id){
        setTarget(id)
    }

    function onInput(e){
        if((e.currentTarget.defaultValue !== "" && e.currentTarget.value !== e.currentTarget.defaultValue) || (e.currentTarget.defaultValue === "" && e.currentTarget.value.length > 0)){
            setApprove(true)
        } else {
            setApprove(false)
        }
    }

    function changeNickname(e){
        if(approve && (e.code === "Enter" || e._reactName === "onClick")){
            var newNickname = document.querySelector(`[data-id="${target}"] input`).value
            var messageObject = {
                time_separator: 2, 
                timestamp: getCurrentTime(), 
                id: current.id, 
                sender_id: USER_DATA.account_id, 
                reciever_id: target,
                text: newNickname,
                nicknames: current.nicknames,
                message_id: uuidv4()
            }
            
            //Emit it so that the changes can be identified by the other user
            socket.emit('message', messageObject)
            
            //Append it into current chat
            dispatch(chatReducer({chat: [...chat, messageObject]}))
            
            var nicknames = current.nicknames
            if(nicknames){
                nicknames = JSON.parse(current.nicknames)

                //Already exists an object
                if(nicknames.find((e) => e.id === target)){
                    nicknames.find((e) => e.id === target).nickname = newNickname

                    var nicknameObject = nicknames
                } else {
                    var nicknameObject = [
                        ...nicknames,
                        {
                            id: target,
                            nickname: newNickname
                        }
                    ]
                }
            } else {
                var nicknameObject = [
                    {
                        id: target,
                        nickname: newNickname
                    }
                ]
            }
            
            //Update server with new data
            postRequest('chat/nicknames', {
                id: current.id,
                nicknames: JSON.stringify(nicknameObject)
            })
            .then((response) => {
                postRequest('chat', {id: USER_DATA.account_id})
                .then((response) => {
                    response.map((e) => {
                        e.members = JSON.parse(e.members)
                        e.settings = JSON.parse(e.settings)
                        e.files = JSON.parse(e.files)
                        e.recent_message = JSON.parse(e.recent_message)
                        e.roles ? e.roles = JSON.parse(e.roles) : null
                    })
                    dispatch(chatReducer({chats: response}))
                    dispatch(chatReducer({current: response.find((e) => e.id === current.id)})) 
                })
            })
            .catch((err) => {
                errorManagement(err)
            })
        }
    }

    return(
        <>
            <div className="chat-dynamic-popup-top">
                <h2>
                    {locale === "en" ? "Nicknames" : "Smeknman"}
                </h2>
                <div 
                    className="popup-close"
                    onClick={closeWindow}
                >
                    <i className="material-icons">close</i>
                </div>
            </div>
            <div className="popup-main change-nickname">
                {
                    members &&
                    members.map((value, index) => {

                        var nickname = false;
                        if(alias && alias.find((e) => e.id === value.id)){
                            nickname = alias.find((e) => e.id === value.id).nickname
                        }

                        return(
                            <div 
                                className="user"
                                data-name={value.firstname + ' ' + value.lastname}
                                data-id={value.id}
                                onClick={(() => { userClick(value.id) })}
                                key={index}
                            >
                                <div className="user-info-wrapper">
                                    <figure>
                                        <img src={value.profile_picture ? value.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                    </figure>
                                    {
                                        target && target === value.id ?
                                        <input
                                            className="nickname-input"
                                            onChange={onInput}
                                            onKeyDown={changeNickname}
                                            defaultValue={nickname ? nickname : null}
                                            placeholder={nickname ? nickname : `${value.firstname} ${value.lastname}`}
                                        >
                                        </input>
                                        :
                                        <div className="alias-wrapper">
                                            {
                                                alias &&
                                                <>
                                                    <span>{nickname}</span>
                                                    <span>{value.firstname + ' ' + value.lastname}</span>
                                                </>
                                            }
                                            {
                                                !alias &&
                                                <>
                                                    <span>{value.firstname + ' ' + value.lastname}</span>
                                                    <span>{locale === "en" ? "Set nickname" : "Ange smeknamn"}</span>
                                                </>
                                            }

                                        </div>
                                    }
                                </div>
                                <div className="" onClick={approve && target === value.id ? changeNickname : null}>
                                    {
                                        approve && target === value.id ?
                                        <i className="material-icons">check</i>
                                        :
                                        <i className="material-icons">drive_file_rename_outline</i>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}