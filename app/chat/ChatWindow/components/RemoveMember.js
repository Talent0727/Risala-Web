import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import useLocale from "../../../hooks/useLocale";
import { postRequest, errorManagement } from "../../../api/api";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function RemoveMember({closeWindow, socket}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const selectedUser = useSelector((state) => state.chatReducer.value.selectedUser)

    const [isSelf, setIsSelf] = useState(false)

    useEffect(() => {
        if(selectedUser){
            if(selectedUser.account_id === USER_DATA.account_id){
                setIsSelf(true)
            } else {
                setIsSelf(false)
            }
        } else {
            setIsSelf(false)
        }
    }, [selectedUser])

    function removeUser(){

        var data = {
            time_separator: 2, 
            timestamp: getCurrentTime(), 
            id: current.id, 
            sender_id: USER_DATA.account_id, 
            reciever_id: selectedUser.firstname,
            text: 'Removed',
            message_id: uuidv4(),
            files: null,
            file_paths: null,
            reply_to_id: null,
            reply_text: null,
            reply_to_message_id: null,
            reply_to_name: null,
            room: current.members.filter(e => e.id !== selectedUser.id).map(e => e.id),
            members: current.members.filter(e => e.id !== selectedUser.id)
        }

        var newMembers = [...current.members].filter(e => e.id !== selectedUser.id)
        var newCurrent = {
            ...current,
            ['members']: newMembers
        }

        postRequest('chat/members', {
            members: JSON.stringify(current.members.filter(e => e.id !== selectedUser.id)),
            id: current.id,
            update: true
        })
        .then((response) => {
            dispatch(chatReducer({
                isChat_window: false,
                chat: [...chat, data],
                current: newCurrent
            }))
            socket.emit('message', (data))
            socket.emit('group-exit', ({room: selectedUser.id, id: current.id}))
        })
        .catch((err) => {
            errorManagement(err)
            console.log(err)
        })
    }

    return(
        <>
            <div className="chat-dynamic-popup-top" style={{justifyContent: "flex-start"}}>
                {
                    isSelf ?
                    <h2 style={{width: "80%", fontSize: "22px"}}>
                        {locale === "en" ? "Do you want to leave the chat?" : "Vill du lämna chatten?"}
                    </h2>
                    :
                    <h2 style={{width: "80%", fontSize: "22px"}}>
                        {locale === "en" ? "Do you want to remove the user from the chat?" : "Vill du ta bort personen från chatten?"}
                    </h2>
                }
                <div 
                    className="popup-close"
                    onClick={closeWindow}
                >
                    <i className="material-icons">close</i>
                </div>
            </div>
            <div className="popup-main" style={{padding: "16px 10px"}}>
                {
                    isSelf ?
                    <span>
                        {
                            locale === "en" ? 
                            "Are you sure you want to leave the group chat? You will no longer be able to send or recieve new messages for this group" : 
                            "Är du säker på att du vill lämna gruppchatten? Du kommer inte längre att kunna skicka eller ta emot nya meddelanden"
                        }
                    </span>
                    :
                    <span>
                        {
                            locale === "en" ? 
                            "Do you want to remove the user from the conversation? The user will no longer be able to send or recieve new messages" : 
                            "Vill du ta bort personen från konversationen? Personen kommer inte längre att kunna skicka eller ta emot nya meddelanden"
                        }
                    </span>
                }
            </div>
            <div className="button-wrapper">
                <button className="button-cancel" onClick={closeWindow}>
                    {locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                {
                    isSelf?
                    <button
                        className={"button button-yellow-square confirm"}
                        onClick={removeUser}
                        style={{margin: "0px", width: "150px"}}
                    >
                        {locale === "en" ? "Leave chat" : "Lämna gruppchat"}
                    </button>
                    :
                    <button
                        className={"button button-yellow-square confirm"}
                        onClick={removeUser}
                        style={{margin: "0px", width: "150px"}}
                    >
                        {locale === "en" ? "Remove user" : "Ta bort användare"}
                    </button>
                }
            </div>

        </>
    )
}