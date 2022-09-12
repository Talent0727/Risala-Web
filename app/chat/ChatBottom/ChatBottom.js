import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer, arrayEmpty, objectAdd } from "../../features/chat";
import sendMessage from "./functions/sendMessage";

import EmojiWindow from "../EmojiWindow";
import informationManager from "../../modules/informationManager";

export default function ChatBottom({inputRef, socket}){
    const [inputValue, setInputValue] = useState('');
    const emoji_window = useRef(null)
    const fileInput = useRef();

    const imageExtension = ['gif', 'png', 'jpeg', 'jpg', 'svg']

    const [chatHeight, setChatHeight] = useState(1)
    const [initialDisplayHeight, setInitialDisplayHeight] = useState(0)
    const [isTyping, setIsTyping] = useState(false) // <-- This is whether YOU are typing or not

    const dispatch = useDispatch();
    const chat_bottom_height = useSelector((state) => state.chatReducer.value.chat_bottom_height)
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const current = useSelector((state) => state.chatReducer.value.current)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const USER_SEARCH = useSelector((state) => state.chatReducer.value.USER_SEARCH)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const emoji = useSelector((state) => state.chatReducer.value.emoji)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const isFiles = useSelector((state) => state.chatReducer.value.isFiles)
    const files = useSelector((state) => state.chatReducer.value.files)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const uploadFiles = useSelector((state) => state.chatReducer.value.uploadFiles)
    const MESSAGES = useSelector((state) => state.chatReducer.value.MESSAGES)

    useEffect(() => {
        if(reply){
            //console.log(reply.text, USER_DATA, reply)
        }
    }, [reply])

    useEffect(() => {
        //For typing bubble
        if(current){

            //Group Chat Isnt the if, else state redundant below?
            var id = current.members.map((e) => e.id)

            if(inputValue.length > 0 && !newMessage.new_conversation && !isTyping){
                setIsTyping(true)
                socket.emit('typing', { value: inputValue.length, room: current.id, id: id });
            } else if(inputValue === "" || inputValue.length === 0 && isTyping){
                setIsTyping(false)
                socket.emit('typing', { value: false, room: current.id, id: id })
            }
        }

        //console.log(chatHeight)
        //console.log((inputRef.current.scrollHeight / 20) > 6 ? 6 : inputRef.current.scrollHeight / 20)
        //Fix height for display
        if(inputValue.length === 0 || inputValue === "" && chatHeight > 1){
            setChatHeight(1) //Counts number of rows for chatwindow
        } else {
            var row = Math.floor((inputRef.current.scrollHeight / 20) > 6 ? 6 : inputRef.current.scrollHeight / 20)
            setChatHeight(row)
        }
    }, [inputValue])

    //This useEffect hook sets everything to default when you change conversation
    useEffect(() => {
        dispatch(chatReducer({isFiles: false}))
        setInputValue('')
        dispatch(arrayEmpty('files'))
    }, [current])

    function inputChange(e){
        setInputValue(e.target.value)
    }
    
    function emojiSelect(e){
        setInputValue(`${inputRef.current.value}${e.target.textContent}`)
    }

    //For messeger
    var shift = false;
    function inputKeyDown(e){
        if(e.type === "keydown"){
            if(e.key === "Enter"){
                var textWithoutSpaces = inputRef.current.value.split("\n").find(e => e !== '') //Checks if text only is made of spaces, is true if not, else is false
                if(shift === false && ((inputRef.current.value.length > 0 && textWithoutSpaces) || isFiles)){
                    if(current){
                        e.preventDefault()
                        sendMessage(null, inputRef, socket);
                        setInputValue('')
                        dispatch(arrayEmpty('files'))
                    } else if(USER_SEARCH){
                        if(USER_SEARCH.ID){
                            if(USER_SEARCH.ID.length > 0){
                                e.preventDefault()
                                sendMessage(null, inputRef, socket);
                                setInputValue('')
                                dispatch(arrayEmpty('files'))
                            }
                        }
                    } else {
                        setInputValue('')
                    }
                } else if(shift === true){
                    var display = document.querySelector('.chat-display ul')
                    display.scrollTop = display.scrollHeight
                } else{
                    e.preventDefault()
                }
            } else if(e.key === "Shift" && shift === false){
                shift = true;
            }
        } else if(e.type === "keyup"){
            if(e.code === "ShiftLeft" || e.code === "ShiftRight"){
                shift = false;
            }
        } else if(e.type === 'backspace'){
            var row = (inputRef.current.scrollHeight / 20) > 6 ? 6 : inputRef.current.scrollHeight / 20
            console.log(row)
        }
    }

    //Sets height
    useEffect(() => {
        setHeight()
    }, [reply, chatHeight, isFiles])

    useEffect(() => {
        setInitialDisplayHeight(document.querySelector('.chat-main').clientHeight - 151)
    }, [current])

    function setHeight(){
        if(chatHeight > 0){
            var totAdd = (((chatHeight - 1) * 20) + 50);
        } else {
            var totAdd = 40;
        }
        
        if(reply.reply){
            var totAdd = totAdd + 53
        }

        if(isFiles){
            var totAdd = totAdd + 70
        }

        //console.log(totAdd, initialDisplayHeight)
        if(totAdd === 50){
            document.querySelector('.chat-display').style.height = `${initialDisplayHeight}px`
        } else {
            document.querySelector('.chat-display').style.height = `${(initialDisplayHeight - totAdd) + 70}px`
        }

        dispatch(chatReducer({chat_bottom_height: totAdd}))

        setTimeout(() => {
            var display = document.querySelector('.chat-display ul')
            display.scrollTop = display.scrollHeight
        }, 10)
    }

    // FILE INPUT FUNCTIONS

    function fileClick(e){

        if(current){
            chatConfirmed(e)
        } else if(USER_SEARCH){
            if(USER_SEARCH.ID){
                if(USER_SEARCH.ID.length > 0){
                    chatConfirmed(e)
                }
            }
        }

        async function chatConfirmed(e){
            if(e.type === "change" || e._reactName === "onChange"){
                e.preventDefault();
                //console.log(e.target.files[0], files)
                if(e.target.files.length > 0){

                    var type = e.target.files[0].type.split('/')[0]

                    function getDimensions(file, type){
                        return new Promise((resolve, reject) => {
                            if(type === 'image'){
                                let img = new Image()
                                img.onload = () => {
                                    var width = img.naturalWidth
                                    var heigth = img.naturalHeight
                                    window.URL.revokeObjectURL(img.src)
    
                                    resolve({
                                        dimensions: [width, heigth],
                                        file: file
                                    })
                                }
                                img.src = window.URL.createObjectURL(file)
                            } else if(type === 'video'){
                                var url = URL.createObjectURL(file)
                                let video = document.createElement('video')
                                video.src = url
                                video.onloadedmetadata = () => {
                                    var width = video.videoWidth
                                    var height = video.videoHeight

                                    resolve({
                                        dimensions: [width, height],
                                        file: file
                                    })
                                }
                            }
                        })
                    }

                    var fileMediaObject = {
                        path: e.target.files[0].name,
                        size: e.target.files[0].size,
                        type: e.target.files[0].type
                    }

                    if(type === 'image' || type === 'video' && fileMediaObject.size < 20971520){
                        getDimensions(e.target.files[0], type)
                        .then((e) => {
                            console.log(type, fileMediaObject.size)
                            fileMediaObject.dimensions = e.dimensions
                            var newMediaArray = [...uploadFiles.images, fileMediaObject]
    
                            if(files.length === 0){
                                dispatch(chatReducer({
                                    isFiles: true,
                                    files: [e.file],
                                    uploadFiles: {
                                        files: uploadFiles.files,
                                        images: newMediaArray
                                    }
                                }))
                            } else {
                                dispatch(chatReducer({
                                    isFiles: true,
                                    files: [...files, e.file],
                                    uploadFiles: {
                                        files: uploadFiles.files,
                                        images: newMediaArray
                                    }
                                }))
                            }
                        })
                    } else if(type !== 'image' && type !== 'video' && fileMediaObject.size < 20971520) {
                        var newFileArray = [...uploadFiles.files, fileMediaObject]

                        if(files.length === 0){
                            dispatch(chatReducer({
                                isFiles: true,
                                files: [e.target.files[0]],
                                uploadFiles: {
                                    files: newFileArray,
                                    images: uploadFiles.images
                                }
                            }))
                        } else {
                            dispatch(chatReducer({
                                isFiles: true,
                                files: [...files, e.target.files[0]],
                                uploadFiles: {
                                    files: newFileArray,
                                    images: uploadFiles.images
                                }
                            }))
                        }
                    } else {
                        informationManager({ purpose: "error", message: "File size is too large. Maximum file size is 20MB"})
                    }
                }
                
            } else if(e.type === "click"){
                fileInput.current.click()
            }
        }
    }

    //This function removes the file from the state "files"
    function removeFile(index, value){

        if(files.length === 1){
            dispatch(chatReducer({isFiles: false}))
        }
        dispatch(chatReducer({
            files: [...files].filter((e, i) => i !== index),
            uploadFiles: {
                files: [...uploadFiles.files].filter(e => e.path !== value.name),
                images: [...uploadFiles.images].filter(e => e.path !== value.name)
            }
        }))
    }

    return(
        <div 
            className="chat-bottom"
            style={{height: `${chat_bottom_height}px`, paddingTop: reply.reply ? 0 : "10px"}}
        >
            {
                reply.reply &&
                <div className="reply-window">
                    <div className="reply-preview">
                        <span>
                            {
                                reply.replying_to_id === USER_DATA.account_id ?
                                "Replying to yourself" :
                                `Replying to ${reply.replying_to_name}`
                            }
                        </span>
                        <span>
                            {
                                reply.type ? reply.type
                                :
                                reply.text.length > 40 ? (reply.text.substring(0, 40) + '...') : reply.text
                            }
                        </span>
                    </div>
                    <span 
                        className="close-reply-window"
                        onClick={(() => {
                            dispatch(objectAdd({key: 'reply', value: {
                                reply: false,
                                text: undefined,
                                replying_to_name: undefined,
                                replying_to_id: undefined,
                                message_id: undefined
                            }}))
                        })}
                    >
                        &#10005;
                    </span>
                </div>
            }
            <div className="message-box-wrapper">
                <div className="message-insert-options">
                    <div 
                        className="attach-file"
                        onClick={fileClick}
                    >
                        <i className="material-icons" style={{color: chat_settings.color}}>file_copy</i>
                    </div>
                    <input
                        className="file-input" 
                        type="file"
                        style={{display: "none"}}
                        ref={fileInput}
                        onChange={fileClick}
                    >
                    </input>
                </div>
                <div 
                    className="message-box"
                    onClick={(() => inputRef.current.focus())}
                    style={{height: isFiles ? `${((chatHeight - 1) * 20) + 110}px` : `${((chatHeight - 1) * 20) + 40}px`}}
                >
                    {
                        isFiles &&
                        <>
                            <div className="bottom-file-wrapper">
                                {
                                    files.map((value, index) => {
                                        var type = value.type.split('/')[0]
                                        //console.log(value, type)

                                        if(type === "application"){
                                            return(
                                                <div className="file-wrapper">
                                                    <div 
                                                        className="remove"
                                                        onClick={(() => {
                                                            removeFile(index, value)
                                                        })}
                                                    >
                                                        <i className="material-icons">close</i>
                                                    </div>
                                                    <div className="file" title={value.name}>
                                                        <i className="material-icons">description</i>
                                                    </div>
                                                </div>
                                            )
                                        } else if(type === "image"){
                                            return(
                                                <div className="file-wrapper">
                                                    <div 
                                                        className="remove"
                                                        onClick={(() => {
                                                            removeFile(index, value)
                                                        })}
                                                    >
                                                        <i className="material-icons">close</i>
                                                    </div>
                                                    <figure>
                                                        <img src={URL.createObjectURL(value)}/>
                                                    </figure>
                                                </div>
                                            )
                                        } else if(type === "video"){
                                            var file = new Blob(
                                                [value],
                                                {"type": "video\/mp4"}
                                            )
                                            return(
                                                <div className="file-wrapper">
                                                    <div 
                                                        className="remove"
                                                        onClick={(() => {
                                                            removeFile(index, value)
                                                        })}
                                                    >
                                                        <i className="material-icons">close</i>
                                                    </div>
                                                    <i className="material-icons play">play_circle</i>
                                                    <figure>
                                                        <video src={URL.createObjectURL(file)}/>
                                                    </figure>
                                                </div>
                                            )
                                        }
                                    })
                                }
                                <div 
                                    className="add-more"
                                    onClick={fileClick}
                                >
                                    <i className="material-icons">add_to_photos</i>
                                </div>
                            </div>
                        </>

                    }
                    <textarea
                        className="message-input-box"
                        onChange={inputChange}
                        onKeyDown={inputKeyDown}
                        onKeyUp={inputKeyDown}
                        placeholder={"Type a message..."}
                        ref={inputRef}
                        style={{height: `${chatHeight * 20}px`, overflowY: chatHeight >= 6 ? 'auto' : 'hidden'}}
                        value={inputValue}
                    >
                    </textarea>
                    <button 
                        className="emoji-button"
                        onClick={(() => {dispatch(chatReducer({emoji: !emoji}))})}
                    >
                        <span>
                        <svg 
                            style={{fill: chat_settings.color}}
                            xmlns="http://www.w3.org/2000/svg" 
                            height="22" 
                            width="22"
                        >
                            <path d="M15.5 11Q16.15 11 16.575 10.575Q17 10.15 17 9.5Q17 8.85 16.575 8.425Q16.15 8 15.5 8Q14.85 8 14.425 8.425Q14 8.85 14 9.5Q14 10.15 14.425 10.575Q14.85 11 15.5 11ZM8.5 11Q9.15 11 9.575 10.575Q10 10.15 10 9.5Q10 8.85 9.575 8.425Q9.15 8 8.5 8Q7.85 8 7.425 8.425Q7 8.85 7 9.5Q7 10.15 7.425 10.575Q7.85 11 8.5 11ZM12 17.5Q13.775 17.5 15.137 16.525Q16.5 15.55 17.1 14H15.45Q14.925 14.9 14.025 15.45Q13.125 16 12 16Q10.875 16 9.975 15.45Q9.075 14.9 8.55 14H6.9Q7.5 15.55 8.863 16.525Q10.225 17.5 12 17.5ZM12 22Q9.925 22 8.1 21.212Q6.275 20.425 4.925 19.075Q3.575 17.725 2.788 15.9Q2 14.075 2 12Q2 9.925 2.788 8.1Q3.575 6.275 4.925 4.925Q6.275 3.575 8.1 2.787Q9.925 2 12 2Q14.075 2 15.9 2.787Q17.725 3.575 19.075 4.925Q20.425 6.275 21.212 8.1Q22 9.925 22 12Q22 14.075 21.212 15.9Q20.425 17.725 19.075 19.075Q17.725 20.425 15.9 21.212Q14.075 22 12 22Z"/>
                        </svg>
                        </span>
                    </button>
                </div>
                {
                    chat_settings.emoji ?
                    <div 
                        className="chat-emoji"
                        onClick={((e) => {
                            if(current){
                                sendMessage(e.target.textContent, inputRef, socket)
                                setInputValue('')
                                dispatch(arrayEmpty('files'))
                            } else if(USER_SEARCH){
                                if(USER_SEARCH.ID){
                                    if(USER_SEARCH.ID.length > 0){
                                        sendMessage(e.target.textContent, inputRef, socket)
                                        setInputValue('')
                                        dispatch(arrayEmpty('files'))
                                    }
                                }
                            }
                        })}
                    >
                        {chat_settings.emoji}
                    </div>
                    :
                    <div 
                        className="chat-emoji"
                        onClick={((e) => {
                            if(current){
                                sendMessage(e.target.textContent, inputRef, socket)
                                setInputValue('')
                                dispatch(arrayEmpty('files'))
                            } else if(USER_SEARCH){
                                if(USER_SEARCH.ID){
                                    if(USER_SEARCH.ID.length > 0){
                                        sendMessage(e.target.textContent, inputRef, socket)
                                        setInputValue('')
                                        dispatch(arrayEmpty('files'))
                                    }
                                }
                            }
                        })}
                    >
                        &#x1F44D;
                    </div>
                }
            </div>
            {
                emoji &&
                <EmojiWindow 
                    emojiSelect={emojiSelect}
                />
            }
        </div>
    )
}