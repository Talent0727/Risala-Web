import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import useLocale from "../../../hooks/useLocale";

export default function RemoveMessage({loading, setIsLoading, closeWindow, socket}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window) //true or false
    const moreOptions = useSelector((state) => state.chatReducer.value.moreOptions)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)
    const noConversation = useSelector((state) => state.chatReducer.value.noConversation)

    function removeMessageClick(){
        const imageExtension = ['gif', 'png', 'jpeg', 'jpg', 'svg', 'mkv', 'mp4', 'mpe', 'mpeg', 'mpeg4']
        console.log(moreOptions.message_id)

        if(moreOptions.message_id && current.id){
            var messages = document.querySelectorAll('.message')
            var list = messages[messages.length - 1].closest('li')
            var message_id = list.getAttribute('message_id')

            var filePaths = undefined;
            var text = undefined;

            if(moreOptions.message_id === message_id){
                if(messages[messages.length - 2] && messages[messages.length - 2] !== undefined){ // <-- more messages exists
                    notLastMessage()
                } else { // <-- this is the last message
                    lastMessage()
                }
            } else {
                if(messages[messages.length - 2] && messages[messages.length - 2] !== undefined){ // <-- more messages exists
                    notLastMessage()
                } else { // <-- this is the last message
                    lastMessage()
                }
            }

            function notLastMessage(){
                console.log("Not Last Message")
                var list = messages[messages.length - 2].closest('li')

                //Has file
                //This section gets the files of the message which is contained as a string as an attribute for the specific list message (li)
                //the split is supposed to then convert the string into array of file(s)
                if(document.querySelector(`[message_id="${moreOptions.message_id}"]`).getAttribute('file')){
                    filePaths = JSON.parse(document.querySelector(`[message_id="${moreOptions.message_id}"]`).getAttribute('file'))
                    console.log(filePaths)
                    
                }

                if(list.getAttribute('file')){ //<--- File
                    text = messages[messages.length - 2].textContent //Should probably be replaced
                } else { // <-- no files
                    text = messages[messages.length - 2].textContent
                }

                //Get the timestamp
                var timestamp = list.getAttribute('timestamp') 

                if(current.members.length > 2){
                    var sender_id = list.getAttribute('user_id')
                    if(!list.classList.contains('recieved-message')){
                        var sender_id = USER_DATA.account_id
                    }
                } else {
                    if(list.classList.contains('recieved-message')){
                        var sender_id = COUNTER_DATA[0].id
                    } else {
                        var sender_id = USER_DATA.account_id
                    }
                }

                var recent_message = {
                    text: text,
                    files: null,
                    file_paths: null,
                    sender_id: sender_id,
                    timestamp: timestamp,
                }

                //An array so we can append messages to be removed
                var message_id = []
                message_id.push(moreOptions.message_id)

                var target = document.querySelector(`[message_id="${moreOptions.message_id}"]`)

                //If the previous message is a timestamp and the next chat is one as well or null
                if(target.previousElementSibling.className === "separator"){
                    if(!target.nextElementSibling){ // <-- There is no message after the one selected
                        
                        console.log(target.previousElementSibling)
                        console.log(target.previousElementSibling.getAttribute('message_id'))
                        var addedMessageID = (target.previousElementSibling.getAttribute('message_id'))
                        message_id.push(addedMessageID) //Append the message_id
                        var newChat = [...chat].filter((e) => (e.message_id !== (moreOptions.message_id) && e.message_id !== addedMessageID)) 
                    
                    } else if(target.nextElementSibling){ // <-- There is a message after the one you have selected
                        if(target.nextElementSibling.className === "separator"){
                            var addedMessageID = (target.previousElementSibling.getAttribute('message_id'))
                            message_id.push(addedMessageID) //Append the message_id
                            var newChat = [...chat].filter((e) => (e.message_id !== (moreOptions.message_id) && e.message_id !== addedMessageID))
                        } else {
                            console.log("this is else if nextElement is separator")
                        }
                    }
                } else {
                    var newChat = [...chat].filter(e => e.message_id !== (moreOptions.message_id))
                }

                /**************** FILE & MEDIA UPDATE *****************/
                if(filePaths){
                    if(filesAndMedia){
                        var images = [...filesAndMedia.images]
                        var files = [...filesAndMedia.files]
                    } else if(current.files){
                        var images = [...current.files.images]
                        var files = [...current.files.files]
                    }

                    //NEW METHOD
                    var newObject = {
                        files: files.filter(e => !filePaths.includes(e.path)),
                        images: images.filter(e => !filePaths.includes(e.path))
                    }

                    dispatch(chatReducer({filesAndMedia: newObject}))
                } else {
                    var newObject = undefined;
                }
                console.log(message_id)
                if(!message_id){
                    console.log(moreOptions.message_id)
                } else {
                    setIsLoading(true)
                    if(current.members.length > 2){
                        var id = COUNTER_DATA.map((e) => e.id)
                    } else {
                        var id = COUNTER_DATA[0].id
                    }
            
                    //Emit message removal so other users can see it
                    socket.emit('remove', {
                        message_id: message_id ? message_id : moreOptions.message_id, 
                        current_id: current.id, 
                        recent_message: JSON.stringify(recent_message), 
                        filePaths: filePaths,
                        newFile: (newObject !== null || newObject !== undefined) ? JSON.stringify(newObject) : JSON.stringify({files: [], media: []}),
                        id: id
                    })
                    dispatch(chatReducer({
                        chat: [...chat].filter(e => !message_id.includes(e.message_id))
                    }))
                    setIsLoading(false)
                    dispatch(chatReducer({moreOptions:{visible: false}}))
    
                    //Update chats
                    postRequest('chat', {id: USER_DATA.account_id})
                    .then((response) => {
                        response.map((e) => {
                            e.members = JSON.parse(e.members)
                            e.settings = JSON.parse(e.settings)
                            e.files = JSON.parse(e.files)
                            e.recent_message = JSON.parse(e.recent_message)
                            e.roles ? e.roles = JSON.parse(e.roles) : null
                        })
                        console.log(response)
                        dispatch(chatReducer({
                            chats: response,
                            isChat_window: !isChat_window
                        }))
                    })
                    .catch((err) => {
                        console.log(err)
                        errorManagement(err)
                    })
                }
            }

            function lastMessage(){
                console.log("last message triggered")
                socket.emit('remove', {current_id: current.id, id: COUNTER_DATA.map((e) => e.id)})
                setIsLoading(true)
                postRequest('chat/delete-conv', {id: current.id})
                .then((response) => {
                    if(response === true){
                        setIsLoading(false)
                        postRequest('chat', {id: USER_DATA.account_id})
                        .then((response) => {
                            if(response.length > 0){
                                response.map((e) => {
                                    e.members = JSON.parse(e.members)
                                    e.settings = JSON.parse(e.settings)
                                    e.files = JSON.parse(e.files)
                                    e.recent_message = JSON.parse(e.recent_message)
                                    e.roles ? e.roles = JSON.parse(e.roles) : null
                                })
                                dispatch(chatReducer({
                                    chats: response,
                                    current: response[0],
                                    isChat_window: !isChat_window
                                })) 
                            } else {
                                //Last conversation, no more conversations exists
                                dispatch(chatReducer({
                                    chats: undefined,
                                    chat: [],
                                    current: undefined,
                                    isChat_window: false,
                                    noConversation: true
                                }))
                            }
                        })
                        .catch((err) => {
                            errorManagement(err)
                        })
                    }
                })
                .catch((err) => {
                    errorManagement(err)
                    console.log(err)
                })
                dispatch(chatReducer({moreOptions:{visible: false}}))
            }
        } else {
            console.log("No Message ID could be found")
        }
    }
    
    return(
        <>
            <div className="chat-dynamic-popup-top">
                <h2>
                    Remove Message
                </h2>
                <span className="popup-close" onClick={closeWindow}>
                    &#10005;
                </span>
            </div>
            <div className="popup-main remove">
                {
                    locale === "en" ? 
                    "You are about to remove a message, and this action cannot be undone. Are you sure that you want to remove this message?" 
                    : "Du är påväg på att ta bort ett meddelande. Var god och bekfräfta ifall du är säker på att du vill ta bort meddelandet då denna handling inte kan återkallas."
                }
            </div>
            <div className="button-wrapper">
                <button className="button-cancel" onClick={closeWindow}>
                    {locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                <button className="button button-yellow-square" onClick={removeMessageClick}>
                    {locale === "en" ? "Remove" : "Ta bort"}
                </button>
            </div>
        </>
    )
}