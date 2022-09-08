import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import useLocale from "../../../hooks/useLocale";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function ChangeName({closeWindow, socket}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const moreOptions = useSelector((state) => state.chatReducer.value.moreOptions)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    const input = useRef()
    const [count, setCount] = useState(0)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        if(current && current.alias){
            setCount(current.alias.length)
        }
    }, [current])

    function inputFunction(e){
        setCount(e.currentTarget.value.length)

        if(e.currentTarget.value.length > 0){
            if(current && current.alias){
                if(e.currentTarget.value !== current.alias){
                    setIsActive(true)
                } else {
                    setIsActive(false)
                }
            } else{
                setIsActive(true)
            }
        } else {
            setIsActive(false)
        }
    }

    //Add event for change in groupchat name
    function changeName(e){


        var data = {
            time_separator: 2, 
            timestamp: getCurrentTime(), 
            id: current.id, 
            sender_id: USER_DATA.account_id, 
            reciever_id: current.id,
            text: input.current.value,
            message_id: uuidv4(),
            files: null,
            file_paths: null,
            reply_to_id: null,
            reply_text: null,
            reply_to_message_id: null,
            reply_to_name: null,
            room: current.members.map(e => e.id),
        }

        postRequest('chat/alias', {id: current.id, alias: input.current.value})
        .then((response) => {
            dispatch(chatReducer({
                moreOptions: { visible: false },
                chat: [...chat, data],
                isChat_window: false,
            }))
            socket.emit('message', data)
        })
        .catch((err) => {
            errorManagement(err)
            console.log(err)
        })
    }

    return(
        <>
            <div className="chat-dynamic-popup-top">
                <h2>
                    {locale === "en" ? "Change group chat" : "Ändra chattnamn"}
                </h2>
            </div>
            <div className="popup-main change-name">
                <p>
                    {locale === "en" ? "If you change the name of the group, the name will be changed for everyone as well" : "Om du ändrar namnet på en gruppchatt ändras det för alla"}
                </p>
                <input
                    onChange={inputFunction}
                    ref={input}
                    defaultValue={current.alias ? current.alias : ""}
                >
                </input>
                <span className="word-count">{count}/60</span>
            </div>
            <div className="button-wrapper">
                <button className="button-cancel" onClick={closeWindow}>
                    {locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                <button 
                    className={isActive ? "button button-yellow-square" : "button button-yellow-square deactivated"} 
                    onClick={isActive ? changeName : null}
                >
                    {locale === "en" ? "Save" : "Spara"}
                </button>
            </div>
        </>
    )
}