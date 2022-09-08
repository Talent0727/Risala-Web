import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import EmojiWindow from "../../EmojiWindow";
import useLocale from "../../../hooks/useLocale";
import { v4 as uuidv4 } from 'uuid';
import getCurrentTime from "../../../modules/time";

export default function ChangeEmoji({closeWindow, socket}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    
    const [tempEmoji, setTempEmoji] = useState(undefined)

    function emojiSelect(){
        if(tempEmoji){
            postRequest('chat/update-settings', {id: current.id, settings: JSON.stringify({
                color: chat_settings.color,
                emoji: tempEmoji
            })})
            .then((response) => {
                var messageObject = {
                    time_separator: 2, 
                    timestamp: getCurrentTime(), 
                    id: current.id, 
                    sender_id: USER_DATA.account_id, 
                    reciever_id: current.id,
                    text: tempEmoji,
                    message_id: uuidv4(),
                    files: null,
                    file_paths: null,
                    reply_to_id: null,
                    reply_text: null,
                    reply_to_message_id: null,
                    reply_to_name: null,
                    room: current.members.map(e => e.id)
                }
                socket.emit('message', (messageObject))

                dispatch(chatReducer({
                    chat_settings: {
                        color: chat_settings.color,
                        emoji: tempEmoji
                    },
                    chat: [...chat, messageObject]
                }))
            })
            .catch((err) => {
                errorManagement(err)
                console.error(err)  
            })
        }
    }

    return(
        <>
            <div className="chat-dynamic-popup-top">
                <h2>Emoji</h2>
                <span className="popup-close" onClick={(() => {
                    closeWindow()
                    setTempEmoji(undefined)
                })}>
                    &#10005;
                </span>
            </div>
            <div className="popup-main emoji">
                <EmojiWindow
                    tempEmoji={tempEmoji}
                    setTempEmoji={setTempEmoji}
                    settings={true}
                />
            </div>
            <div className="button-wrapper" style={{justifyContent: "space-between"}}>
                <div style={{display: "flex", alignItems: "center",}}>
                    <span>Selected Emoji: </span>
                    <span style={{marginLeft: "14px", fontSize: "22px"}}>{tempEmoji ? tempEmoji : chat_settings.emoji}</span>
                </div>
                <div>
                    <button className="button-cancel" onClick={closeWindow}>
                        {locale === "en" ? "Cancel" : "Avbryt"}
                    </button>
                    <button className="button button-yellow-square" onClick={emojiSelect}>
                        {locale === "en" ? "Save" : "Spara"}
                    </button>
                </div>
            </div>
        </>
    )
}