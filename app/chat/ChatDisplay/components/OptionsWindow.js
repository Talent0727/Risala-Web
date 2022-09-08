import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";

export default function OptionsWindow({chatDisplayWindow}){
    const dispatch = useDispatch();
    const moreOptions = useSelector((state) => state.chatReducer.value.moreOptions)
    const emoji = useSelector((state) => state.chatReducer.value.emoji)
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window)
    const current = useSelector((state) => state.chatReducer.value.current)

    const OptionsWindowRef = useRef()
    const chatMainWindow = document.querySelector('.chat')

    const [isListening, setIsListening] = useState(false)

    useEffect(() => {

        if(moreOptions.visible){
            setIsListening(true)
            chatMainWindow.addEventListener('click', clickDetection)
        } else if(!moreOptions.visible){
            setIsListening(false)
            chatMainWindow.removeEventListener('click', clickDetection)
        }

        return(() => {
            if(moreOptions.visible){
                chatMainWindow.removeEventListener('click', clickDetection)
            }
        })
    }, [moreOptions, isListening])


    useEffect(() => {

        if(moreOptions.visible && !isChat_window && chatDisplayWindow){
            chatDisplayWindow.current.addEventListener('scroll', removeMoreOptions)
        }

        return(() => {
            if(moreOptions.visible && !isChat_window && chatDisplayWindow){
                chatDisplayWindow.current.removeEventListener('scroll', removeMoreOptions)
            }
        })

    }, [moreOptions, isChat_window, current])

    function removeMoreOptions(e){
        if(moreOptions.visible){
            dispatch(chatReducer({moreOptions:{visible: false}}))
        }
    }

    function clickDetection(e){

        if(moreOptions.visible){
            var optionsWindow = OptionsWindowRef.current
            if(!optionsWindow.contains(e.target)){
                dispatch(chatReducer({moreOptions:{visible: false}}))
            } else {
                if(moreOptions.message_id && current.id && document.querySelector(`[message_id="${moreOptions.message_id}"]`).className !== "recieved-message"){
                    dispatch(chatReducer({
                        chat_window: { purpose: 'remove_message' },
                        isChat_window: true
                    }))
                } else {
                    dispatch(chatReducer({ moreOptions: { visible: false }}))
                    alert("You can only remove your own messages")
                }
            }
        }

        if(emoji){
            var emojiWindow = document.querySelector('.emoji-window')
            if(!emojiWindow.contains(e.target)){
                dispatch(chatReducer({emoji: !emoji}))
            }
        }
    }

    return(
        <div 
            className="options-window hidden"
            style={{top: `${moreOptions.top - 60}px`, left: `${moreOptions.left}px`, display: moreOptions.visible ? 'block' : 'none'}}
            ref={OptionsWindowRef}
        >
            <div className="options-remove">Remove</div>
        </div>
    )
}