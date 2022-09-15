import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { chatReducer } from "../../../features/chat";
import isUrl from 'is-url'

import Files                from "./Files";
import MessageMoreOptions   from "./MessageMoreOptions";
import removeEmojis         from "../functions/removeEmojis";
import messageStyler from "../functions/messageStyler";

export default function SentMessage({index, value, optionSelect, timestamp, array, inputRef}){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const current = useSelector((state) => state.chatReducer.value.current)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)

    const [isFocused, setIsFocused] = useState(false)

    //Nicknames
    if(value.id === current.id){
        if(current.nicknames){
            var nickname = JSON.parse(current.nicknames)
        } else {
            var nickname = null
        }
    } else {
        var nickname = null
    }

    // This section checks if the previous message was from the same sender, during the same date
    var sender = value.sender_id
    var senderTime = value.timestamp.substring(0, 10)
    var styler = messageStyler(index, array, sender, senderTime)
    let previousMatch = styler[0];
    let nextMatch = styler[1];

    /* Checks whether a string is a url or not*/
    if(value.text){
        var url = isUrl(value.text) ? true : false;
    }

    /********************************** REPLY ********************************************/
    var reply = false;
    if(value.reply_text !== undefined && value.reply_text !== null && value.reply_text !== ""){
        reply = true;

        //If group <-- This will be needed to be updated soon
        if(current.members.length > 2){
            if(nickname){
                if(nickname.find((e => e.id === value.reply_to_id))){
                    var replied_text = `You replied to ${nickname.find((e => e.id === value.reply_to_id)).nickname}`
                } else {
                    var replied_text = `You replied to ${value.reply_to_name}`
                }
            }
        } else {
            if(USER_DATA.account_id === value.reply_to_id){
                var replied_text = 'You replied to yourself'
            } else if(USER_DATA.account_id !== value.reply_to_id){
                if(nickname){
                    if(nickname.find((e => e.id === value.reply_to_id))){
                        var replied_text = `You replied to ${nickname.find((e => e.id === value.reply_to_id)).nickname}`
                    } else {
                        var replied_text = `You replied to ${value.reply_to_name}`
                    }
                } else {
                    var replied_text = `You replied to ${value.reply_to_name}`
                }
            }
        }


        //Have you replied to an image or file?
        //Update
        var fileReply = false;
        if(value.reply_text){
            try {
                var isMedia = JSON.parse(value.reply_text)
                //console.log(isMedia, current.id)
                
                if(isMedia.length === 1){
                    //console.log(current.files.files.map(e => e.path).some(e => isMedia[0].includes(e))) //Can we find the same path in files
                    
                    if(current.files.files.map(e => e.path).some(e => isMedia[0].includes(e))){
                        isMedia = false;
                        fileReply = true;
                    }
                }
            } catch {
                var isMedia = false;
            }
        }
    }
    /************************************************************************************/

    /********************************** Files *******************************************/
    var file = false;
    var filePath = false;
    if(value.files === "1" || value.files === true){
        file = true;
        filePath = JSON.parse(value.file_paths)
    }
    /************************************************************************************/

    /********************************** Emoji *******************************************/
    if(!file && value.text){
        var only_emoji = removeEmojis(value.text)
    }
    /************************************************************************************/

    if(fileReply){
        filePath = JSON.parse(value.reply_text)
    }

    //Styled components for Aspect Ratios
    const oneToOne = { maxWidth: '200px', maxHeight: '200px'}
    const sixteenToNine = { maxWidth: '364px', maxHeigth: '201px'}
    const nineToSixteen = { maxWidth: '201px', maxHeigth: '364px'}

    function styleMessageBuble(){
        if(nextMatch && previousMatch){
            return '20px 6px 6px 20px'
        } else if(nextMatch && !previousMatch){
            return '20px 20px 6px 20px'
        } else if(previousMatch && !nextMatch){
            return '20px 6px 20px 20px'
        } else {
            return null
        }
    }

    function scrollToReply(message_id){
        var elementWithMessageId = document.querySelector(`[message_id="${message_id}"]`)
        var positionFromTopOfScrollableDiv = elementWithMessageId.offsetTop

        var chatListWrapper = document.querySelector('.chat-list-wrapper')
        chatListWrapper.scrollTop = positionFromTopOfScrollableDiv - 150
    }

    function fileClick(e){
        dispatch(chatReducer({
            imageCarousel: {
                images: filesAndMedia.images,
                selected: e
            }
        }))
    }

    function doubleClick(e){
        var target = e.target

        //if(!target.classList.contains('focused-message')){
        //    setIsFocused(true)
        //    target.classList.add('focused-message')
        //} else {
        //    setIsFocused(false)
        //    target.classList.remove('focused-message')
        //}
        //
        //console.log(e.target)
    }

    return(
        <>
            <li
                id={value.message_id}
                className={reply === true ? "sent-message reply" : "sent-message"}
                message_id={value.message_id}
                timestamp={value.timestamp}
                key={value.message_id}
                file={file ? `[${filePath.map(e => `"${e.path}"`)}]` : null}
                title={timestamp}
            >
                <span className="message-time-stamp">
                    {timestamp}
                </span>
                {
                    reply === true ?
                    <div className="message-wrapper">
                        <MessageMoreOptions 
                            sent={true} 
                            inputRef={inputRef} 
                        />
                        <div className="reply-wrapper">
                            <a 
                                className="reply-from"
                                message_id={value.reply_to_message_id}
                                onClick={(() => { scrollToReply(value.reply_to_message_id) })}
                            >
                                <svg  x="0px" y="0px" width="48.8px" height="46.3px" viewBox="0 0 48.8 46.3">
                                    <path d="M17.4,24.1c0,0.2,0,0.3,0,0.5c0,2.3,0,4.6,0,6.8c0,1.2-0.9,2-2,1.9c-0.4-0.1-0.8-0.3-1.1-0.6
                                    	c-1.6-1.7-3.2-3.4-4.8-5.1c-3-3.2-5.9-6.3-8.9-9.5c-0.6-0.6-0.8-1.3-0.5-2.1c0.1-0.3,0.3-0.5,0.5-0.7c4.6-4.9,9.2-9.8,13.8-14.6
                                    	c0.6-0.6,1.3-0.8,2-0.5c0.7,0.4,1.1,1,1.1,1.8c0,2.3,0,4.6,0,6.8c0,0.1,0,0.3,0,0.4c0.1,0,0.3,0,0.4,0c3,0,5.9,0,8.9,0.1
                                    	c3.4,0.1,6.8,0.7,10.1,1.8c2.7,1,5.2,2.3,7.2,4.5c2.1,2.2,3.4,4.9,4,7.9c0.5,2.5,0.7,5,0.7,7.5c-0.1,2.1-0.5,4.1-1.1,6
                                    	c-0.8,2.8-1.9,5.4-3,8c-0.1,0.3-0.3,0.5-0.4,0.7c-0.3,0.4-0.6,0.5-1,0.3c-0.3-0.1-0.6-0.5-0.6-0.9c0-0.6,0.1-1.1,0.1-1.7
                                    	c0.2-3,0.2-6-0.5-9c-0.5-2.1-1.2-4.1-2.7-5.8c-1.8-1.9-3.9-3.1-6.4-3.8c-2.1-0.5-4.2-0.9-6.4-0.9c-3.1-0.1-6.1-0.1-9.2-0.1
                                    	C17.6,24.1,17.6,24.1,17.4,24.1z"/>
                                </svg>
                                <span>
                                    {replied_text}
                                </span>
                            </a>
                            {
                                isMedia && value.reply_text &&
                                <div className="reply-chat-bubble media">
                                    {
                                        isMedia.map((e, i) => {

                                            try {
                                                var mediaObject = filesAndMedia.images.filter(mediaObject => mediaObject.path === e)[0]
                                            } catch {
                                                var mediaObject = current.files.images.filter(mediaObject => mediaObject.path === e)[0]
                                            }
                                            
                                            //console.log(mediaObject)
                                            if(mediaObject){
                                                var aspectRatio = mediaObject.dimensions[0] / mediaObject.dimensions[1]
                                                var type = mediaObject.type.split('/')[0]
                                                var style = null
                                                
                                                if(aspectRatio > 1.7 && aspectRatio < 1.8){ //16:9
                                                    style = sixteenToNine
                                                } else if(aspectRatio === 1){
                                                    style = oneToOne
                                                } else {
                                                    style = nineToSixteen
                                                }
                                            }


                                            if(type === "image"){
                                                return(
                                                    <figure 
                                                        style={style ? style : null}
                                                        key={e + 'reply'}
                                                        onClick={(() => { fileClick(e) })}
                                                    >
                                                        <img src={e}/>
                                                    </figure>
                                                )
                                            } else {
                                                return(
                                                    <figure 
                                                        style={style ? style : null}
                                                        key={e + 'replyu'}
                                                        onClick={(() => { fileClick(e) })}
                                                    >
                                                        <video src={e} controls/>
                                                    </figure>
                                                )
                                            }
                                        })
                                    }
                                </div>
                            }
                            {
                                !isMedia && value.reply_text && !fileReply &&
                                <div className="reply-chat-bubble">
                                    {value.reply_text}
                                </div>
                            }
                            {
                                fileReply &&
                                <div>
                                    <Files 
                                        value={value}
                                        filePath={filePath}
                                        recieved={false}
                                        fileReply={true}
                                        key={value.message_id + 'file'}
                                    />
                                </div>
                            }
                            { /******** Has the sender only sent emojis? ************/
                                (only_emoji === "" && value.text !== "") &&
                                <div className="message emoji">
                                    {value.text}
                                </div>
                            }
                            {
                                (file && filePath) &&
                                <div className="message file" style={{backgroundColor: chat_settings.color}}>
                                    <Files
                                        value={value}
                                        filePath={filePath}
                                        recieved={false}
                                        key={value.message_id + 'file'}
                                    />
                                </div>
                            }
                            {
                                ((!file && !filePath && only_emoji !== "") || fileReply) &&
                                <div 
                                    className="message" 
                                    style={{backgroundColor: chat_settings.color, marginTop: fileReply ? '-20px' : null, borderRadius: styleMessageBuble()}}
                                >
                                    {
                                        !url ?
                                        `${value.text}`
                                        :
                                        <a href={value.text} target="_blank">{value.text}</a>
                                    }
                                </div>
                            } 
                        </div>
                    </div>
                    :
                    <NotReply/>
                }
            </li>
        </>
    )

    function NotReply(){
        return(
            <div className="message-wrapper">
                <MessageMoreOptions 
                    sent={true}
                    inputRef={inputRef}
                />
                {
                    (only_emoji === "" && value.text !== "") &&
                    <div className="message emoji">
                        {value.text}
                    </div>
                }
                {
                    (file && filePath) &&
                    <Files
                        value={value}
                        filePath={filePath}
                        recieved={false}
                        key={value.message_id + 'file'}
                    />
                }
                {
                    (only_emoji !== "" && !file && !filePath) &&
                    <div 
                        className="message" 
                        onDoubleClick={doubleClick}
                        style={{backgroundColor: chat_settings.color, borderRadius: styleMessageBuble()}}
                    >
                        {
                            !url ?
                            `${value.text}`
                            :
                            <a href={value.text} target="_blank">{value.text}</a>
                        }
                    </div>
                }
            </div>
        )
    }
}