import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Typing({ typingAudio, chatDisplayWindow }) {
    const dispatch = useDispatch()
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const current = useSelector((state) => state.chatReducer.value.current)
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)

    const [match, setMatch] = useState(false)

    useEffect(() => {

        if((typing.is_typing === true || typing.chat_id.length > 0 && current) && !newMessage.is_searching ){
            if(typing.chat_id.filter(e => e === current.id).length === 1){
                setMatch(true)
            } else {
                setMatch(false)
            }
        } else {
            setMatch(false)
        }

        var chatList = chatDisplayWindow.current
        var position = chatList.scrollTop / (chatList.scrollHeight - chatList.clientHeight)
        
        //Most be fixed
        if(position > 0.9 && typing.is_typing){
            if(current.id === typing.chat_id[0]){
                var display = document.querySelector('.chat-list-wrapper')
                display.scrollTop = display.scrollHeight
            }
        }

    }, [typing, current, match, newMessage])

    return(
        match &&
        <>
            <div className="typing-window">
                <div className="typing-bubble">
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                </div>
                <div className="ddd"></div>
                <div className="ccc"></div>
            </div>
            <audio 
                ref={typingAudio}
                src='https://risala.codenoury.se/assets/typing_sound.mp3' 
                autoPlay 
                loop 
            ></audio>
        </>
    )
}