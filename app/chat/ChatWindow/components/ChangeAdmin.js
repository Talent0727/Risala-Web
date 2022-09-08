import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import useLocale from "../../../hooks/useLocale";
import { postRequest, errorManagement } from "../../../api/api";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function ChangeAdmin({closeWindow, socket}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const selectedUser = useSelector((state) => state.chatReducer.value.selectedUser)

    function changeAdmin(e){

        var data = {
            time_separator: 2, 
            timestamp: getCurrentTime(), 
            id: current.id, 
            sender_id: USER_DATA.account_id, 
            reciever_id: selectedUser.firstname,
            text: 'Admin',
            message_id: uuidv4(),
            files: null,
            file_paths: null,
            reply_to_id: null,
            reply_text: null,
            reply_to_message_id: null,
            reply_to_name: null,
            room: current.members.map(e => e.id),
        }

        var roles = {
            admin: selectedUser.id,
            creator: current.roles.creator
        }
        var newCurrent = {
            ...current,
            ['roles']: roles
        }

        postRequest('chat/roles', {
            roles: JSON.stringify(roles),
            id: current.id,
        })
        .then((response) => {
            dispatch(chatReducer({
                isChat_window: false,
                chat: [...chat, data],
                current: newCurrent
            }))
            socket.emit('message', (data))
        })
        .catch((err) => {
            errorManagement(err)
            console.log(err)
        })
    }

    return(
        <>
            <div className="chat-dynamic-popup-top" style={{justifyContent: "flex-start"}}>
                <h2 style={{width: "80%", fontSize: "22px"}}>
                    {
                        locale === "en" ? 
                        "Do you want to assign a member as group admin?" : 
                        "Vill du ge bort rollen som gruppadministratör?"
                    }
                </h2>
                <div 
                    className="popup-close"
                    onClick={closeWindow}
                >
                    <i className="material-icons">close</i>
                </div>
            </div>
            <div className="popup-main" style={{padding: "16px 10px"}}>
                {
                    locale === "en" ? 
                    `Do you want to make ${selectedUser.firstname} the group admin?` : 
                    `Vill du göra ${selectedUser.firstname} till gruppadministratör?`
                }
            </div>
            <div className="button-wrapper">
                <button className="button-cancel" onClick={closeWindow}>
                    {locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                <button 
                    className={"button button-yellow-square confirm"}
                    onClick={changeAdmin}
                    style={{margin: "0px", width: "150px"}}
                >
                    {locale === "en" ? "Confirm" : "Bekfräfta"}
                </button>
            </div>

        </>
    )
}