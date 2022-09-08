import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import useLocale from "../../../hooks/useLocale";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function ChangeColor({closeWindow, socket}){
    const locale = useLocale()
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    function colorSelect(e){
        if(e.currentTarget.classList.contains('button')){
            var color = document.querySelector('.color-palette.selected').getAttribute('data-color')

            var data = {
                time_separator: 3, 
                timestamp: getCurrentTime(), 
                id: current.id, 
                sender_id: USER_DATA.account_id, 
                reciever_id: current.id,
                text: color,
                message_id: uuidv4(),
                files: null,
                file_paths: null,
                reply_to_id: null,
                reply_text: null,
                reply_to_message_id: null,
                reply_to_name: null,
                room: current.members.map(e => e.id),
            }

            postRequest('chat/update-settings', {
                id: current.id, 
                settings: JSON.stringify({
                    color: color,
                    emoji: chat_settings.emoji
                }
            )})
            .then((response) => {
                dispatch(chatReducer({
                    chat_settings: {
                        color: color,
                        emoji: chat_settings.emoji
                    },
                    chat: [...chat, data]
                }))
                socket.emit('message', (data))
            })
            .catch((err) => {
                errorManagement(err)
                console.error(err)
            })
        } else {
            if(document.querySelectorAll('.color-palette.selected').length > 0){
                document.querySelectorAll('.color-palette.selected')[0].classList.toggle('selected')
            }
            e.currentTarget.classList.toggle('selected')
        }
    }

    return(
        <>
            <div className="chat-dynamic-popup-top">
                <h2>
                    {locale === "en" ? "Themes" : "Teman"}
                </h2>
                <span className="popup-close"  onClick={closeWindow}>
                    &#10005;
                </span>
            </div>
            <div className="popup-main color">
                <div className="color-palette" onClick={colorSelect} data-color="#606060"><div style={{backgroundColor: "#606060"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#f25c54"><div style={{backgroundColor: "#f25c54"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#4d3ec2"><div style={{backgroundColor: "#4d3ec2"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#a797ff"><div style={{backgroundColor: "#a797ff"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#fb45de"><div style={{backgroundColor: "#fb45de"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#ff311e"><div style={{backgroundColor: "#ff311e"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#09f"><div style={{backgroundColor: "#09f"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#ffb301"><div style={{backgroundColor: "#ffb301"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#5e007e"><div style={{backgroundColor: "#5e007e"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#6edf00"><div style={{backgroundColor: "#6edf00"}}></div></div>
                <div className="color-palette" onClick={colorSelect} data-color="#e1872c"><div style={{backgroundColor: "#e1872c"}}></div></div>
            </div>
            <div className="button-wrapper">
                <button className="button-cancel" onClick={closeWindow}>
                    {locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                <button className="button button-yellow-square" onClick={colorSelect}>
                    {locale === "en" ? "Save" : "Spara"}
                </button>
            </div>
        </>
    )
}