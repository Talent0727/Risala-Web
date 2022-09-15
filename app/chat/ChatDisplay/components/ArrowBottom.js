import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";


export default function ArrowBottom(){
    const current = useSelector((state) => state.chatReducer.value.current)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const [arrowBotton, setArrowBotton] = useState(false)
    const [isListening, setIsListening] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            document.querySelector('.chat-list-wrapper').addEventListener('scroll', isTypingScrollDetect)
        }, 500)

        return(() => {
            if(isListening){
                document.querySelector('.chat-list-wrapper').removeEventListener('scroll', isTypingScrollDetect)
            }
        })
    }, [current])

    function isTypingScrollDetect(e){
        setIsListening(true)
        var chatList = document.querySelector('.chat-list-wrapper')
        var position = chatList?.scrollTop / (chatList?.scrollHeight - chatList?.clientHeight)

        if(position < 0.9){
            setArrowBotton(true)
        } else if(position > 0.95){
            setArrowBotton(false)
        }
    }

    function arrowClick(){
        setArrowBotton(false)
        var display = document.querySelector('.chat-list-wrapper')
        display.scrollTop = display.scrollHeight
    }

    const displayArrow = { display: 'flex' }
    const hideArrow = { display: 'none' }

    return(
        <div 
            className="arrow-bottom-button"
            onClick={arrowClick}
            style={(arrowBotton && !reply.reply) ? displayArrow : hideArrow}
        >
            <i className="material-icons">keyboard_arrow_down</i>
        </div>
    )
}