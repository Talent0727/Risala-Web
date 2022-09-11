import React from "react";
import store from "../features/store";
import { chatReducer } from "../features/chat";
import { errorManagement, postRequest } from "./api";

function socketMessage(data){
    const state = store.getState().chatReducer.value
    const chat = state.chat
    const chats = state.chats
    const filesAndMedia = state.filesAndMedia
    const chat_settings = state.chat_settings
    const current = state.current
    const USER_DATA = state.USER_DATA
    const MESSAGES = state.MESSAGES

    console.log(data)

    //Updates files and Media in Chat Settings window
    if(data.file_paths){
        updateFilesAndMedia()
        .then((response) => {
            console.log(response)
        })
        .catch((err) => {
            errorManagement(err)
        })
    }

    if(current){
        //Is this in selected chat
        if(data.id === current.id && data.id !== undefined && current.id !== undefined){
            if(data.time_separator !== 4){
                if(data.time_separator === true || data.time_separator === 1){
                    var timeseparator = {
                        time_separator: 1,
                        timestamp: data.timestamp,
                        id: data.id,
                        message_id: data.message_id_time
                    }
                    data.time_separator = null;
    
                    store.dispatch(chatReducer({chat: [...chat, timeseparator, data]})) //passed down to ChatDisplay
                } else {
                    store.dispatch(chatReducer({chat: [...chat, data]})) //passed down to ChatDisplay
                }
    
                var display = document.querySelector('.chat-list-wrapper')
                var position = display.scrollTop / (display.scrollHeight - display.clientHeight)
                if(position > 0.9){
                    var display = document.querySelector('.chat-list-wrapper')
                    setTimeout(() => {
                        display.scrollTop = display.scrollHeight
                    }, 100)
                }
    
                //Dynamic update of Chats
                var newChats = [...chats].filter((e) => e.id === data.id)[0]
    
                var newChat = {
                    id:         newChats.id,
                    members:    newChats.members,
                    settings:   newChats.settings,
                    files:      newChats.files,
                    alias:      newChats.alias,
                    nickname:   newChats.nickname,
                    roles:      newChats.roles,
                    recent_message: {
                        text:       data.text,
                        files:      data.files,
                        file_paths: data.file_paths,
                        sender_id:  data.sender_id,
                        timestamp:  data.timestamp
                    }
                }
    
                if(data.time_separator === 2){
    
                    function removeEmojis(str){
                        var emojiRE = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
                        return str.replace(emojiRE, '')
                    }
    
                    var only_emoji = removeEmojis(data.text)
    
                    //Change Alias
                    if(data.reciever_id === current.id && only_emoji !== ""){
                        newChat.nickname = data.text
                        document.querySelector(`[data_id="${current.id}"] .preview-text`).innerHTML = data.text
                    } else if(data.text === "Removed"){
                        var newChats = [...chats].filter((e) => e.id === data.id)[0]
                        var newChat = {
                            id:         newChats.id,
                            members:    data.members,
                            settings:   newChats.settings,
                            files:      newChats.files,
                            alias:      newChats.alias,
                            nickname:   newChats.nickname,
                            roles:      newChats.roles,
                            recent_message: {
                                text:       data.text,
                                files:      data.files,
                                file_paths: data.file_paths,
                                sender_id:  data.sender_id,
                                timestamp:  data.timestamp
                            }
                        }
    
                        var newCurrent = {
                            ...current,
                            ['members']: data.members
                        }
    
                        console.log(newCurrent)
    
                        store.dispatch(chatReducer({
                            current: newCurrent,
                            chats: [newChat, ...chats.filter((e) => e.id !== data.id)]
                        }))
    
                    } else if(data.text === "Added" && data.groupMembers){
                        var newCurrent = {
                            ...current,
                            ['members']: data.groupMembers
                        }
    
                        console.log(newCurrent)
    
                        store.dispatch(chatReducer({
                            current: newCurrent,
                            chats: [newChat, ...chats.filter((e) => e.id !== data.id)]
                        }))
    
                    } else if(data.text === "Admin"){
                        var roles = {
                            admin: current.members.filter(e => e.firstname === data.reciever_id).id,
                            creator: current.roles.creator
                        }
                        var newCurrent = {
                            ...current,
                            ['roles']: roles
                        }
    
                        store.dispatch(chatReducer({ current: newCurrent }))
    
                    } else if(only_emoji === ""){
    
                        var newCurrent = {
                            ...current,
                            ['settings']: {
                                color: current.settings.color,
                                emoji: data.text
                            }
                        }
    
                        store.dispatch(chatReducer({
                            current: newCurrent,
                            chat_settings: {
                                color: current.settings.color,
                                emoji: data.text
                            }
                        }))
                    }
                } else if (data.time_separator === 3) {
                    if(current.id === data.id){
                        var newCurrent = {
                            ...current,
                            ['settings']: {
                                color: data.text,
                                emoji: current.settings.emoji
                            }
                        }
    
                        store.dispatch(chatReducer({
                            current: newCurrent,
                            chat_settings: {
                                color: data.text,
                                emoji: current.settings.emoji
                            }
                        }))
                    }
                } else {
                    store.dispatch(chatReducer({chats: [newChat, ...chats.filter((e) => e.id !== data.id)]}))
                } 
            } else {
                var newChats = [...chats].filter((e) => e.id === data.id)[0]

                var infoObject = JSON.parse(data.text)
                var senderObject = data.members.find(e => e.id === data.sender_id)
                var textPurpose = infoObject.purpose === "call" ? "Audio call" : "Video call"
                textPurpose = infoObject.isMissed ? `Missed ${textPurpose.toLocaleLowerCase()}` : textPurpose
                var recentMessageText = `${textPurpose} from ${senderObject.firstname}`;
    
                var newChat = {
                    id:         newChats.id,
                    members:    newChats.members,
                    settings:   newChats.settings,
                    files:      newChats.files,
                    alias:      newChats.alias,
                    nickname:   newChats.nickname,
                    roles:      newChats.roles,
                    recent_message: {
                        text:       recentMessageText,
                        files:      data.files,
                        file_paths: data.file_paths,
                        sender_id:  data.sender_id,
                        timestamp:  data.timestamp
                    }
                }

                if(data.isTimeSeparator && current.id === data.id){
                    var timeseparator = {
                        time_separator: 1,
                        timestamp: data.timestamp,
                        id: data.id,
                        message_id: data.message_id_time
                    }
                    store.dispatch(chatReducer({
                        chat: [...chat, timeseparator, data],
                        chats: [newChat, ...chats.filter((e) => e.id !== data.id)]  
                    }))
                } else if(current.id === data.id) {
                    store.dispatch(chatReducer({
                        chat: [...chat, data],
                        chats: [newChat, ...chats.filter((e) => e.id !== data.id)]
                    }))
                }

                if(current.id === data.id){
                    var display = document.querySelector('.chat-list-wrapper')
                    var position = display.scrollTop / (display.scrollHeight - display.clientHeight)
                    if(position > 0.9){
                        var display = document.querySelector('.chat-list-wrapper')
                        setTimeout(() => {
                            display.scrollTop = display.scrollHeight
                        }, 100)
                    }
                }
            }

        } else {
            postRequest('chat', {id: USER_DATA.account_id})
            .then((response) => {
                response.map((e) => {
                    e.members = JSON.parse(e.members)
                    e.settings = JSON.parse(e.settings)
                    e.files = JSON.parse(e.files)
                    e.recent_message = JSON.parse(e.recent_message)
                    e.roles ? e.roles = JSON.parse(e.roles) : null
                })
                store.dispatch(chatReducer({chats: response}))  
            })
            .catch((err) => {
                errorManagement(err)
            })
        }
    } else {
        //Might not be optimal, optimize this part
        postRequest('chat', {id: USER_DATA.account_id})
        .then((response) => {
            response.map((e) => {
                e.members = JSON.parse(e.members)
                e.settings = JSON.parse(e.settings)
                e.files = JSON.parse(e.files)
                e.recent_message = JSON.parse(e.recent_message)
                e.roles ? e.roles = JSON.parse(e.roles) : null
            })
            store.dispatch(chatReducer({chats: response}))  
        })
        .catch((err) => {
            errorManagement(err)
        })
    }


    function updateFilesAndMedia(){
        return new Promise((resolve, reject) => {
            if(typeof data.file_paths === "string"){
                var file = JSON.parse(data.file_paths)

                if(filesAndMedia){
                    var images = [...filesAndMedia.images]
                    var files = [...filesAndMedia.files]
                }

                for(let i = 0; i < file.length; i++){
                    var fileExtension = file[i].type.split('/')[0]
                    if(fileExtension === "image" || fileExtension === "video"){
                        images.push(file[i])
                    } else {
                        files.push(file[i])
                    }
                }
                var newObject = {
                    files: files,
                    images: images
                }

                store.dispatch(chatReducer({filesAndMedia: newObject}))
                resolve(true)
            }
        })
    }
}

//This function is 100% complete
function socketTyping(data){
    const state = store.getState().chatReducer.value
    const typing = state.typing

    if(data.value !== 0 && data.value !== false){
        if(typing.chat_id.length === 0){
            store.dispatch(chatReducer({typing: {
                is_typing: true,
                chat_id: [data.room]
            }}))
        } else if(typing.chat_id.find(e => e !== data.room)) {

            //This step is to ensure that we dont add a duplicate
            store.dispatch(chatReducer({typing: {
                is_typing: true,
                chat_id: [data.room, ...typing.chat_id]
            }}))
        }
    } else if(!data.value){
        if(typing.chat_id.length > 1){
            var chat_id = typing.chat_id.filter(e => e !== data.room)
            store.dispatch(chatReducer({typing: {
                is_typing: false,
                chat_id: chat_id
            }}))
        } else {
            store.dispatch(chatReducer({typing: {
                is_typing: false,
                chat_id: []
            }}))
        }
    }
}

function socketRemove(data){
    const state = store.getState().chatReducer.value
    const chat = state.chat
    const chats = state.chats
    const current = state.current
    const USER_DATA = state.USER_DATA
    const isChat_window = state.isChat_window

    //Needs to be optimized
    if(data.current_id === current.id && data.message_id){
        var targetedChat = chat.find(e => e.id === current.id)
        var newChat = chat.filter(e => !data.message_id.includes(e.message_id))
        console.log(data.message_id)
        console.log(newChat)

        if(targetedChat.length <= 2){
            postRequest('chat/delete-conv', {id: current.id})
            .then((response) => {
                setIsLoading(false)
                if(current.length > 1){
                    if(chats[1].id !== current.id){
                        dispatch(chatReducer({current: chats[1]}))
                    } else {
                        if(chats.indexOf(e => e.id !== current.id)){
                            dispatch(chatReducer({current: chats[chats.indexOf(e => e.id !== current.id)]}))
                        }
                    }
                }
                dispatch(chatReducer({moreOptions:{visible: false}}))
                
            })
            .catch((err) => {
                errorManagement(err)
                console.log(err)
            })
        } else {
            //Multiple message ids has been passed
            try{
                console.log(data.message_id, typeof data.message_id)
                if(typeof data.message_id === "object" && data.message_id.length >= 2){
                    //for(let i = 0; i < data.message_id.length; i++){
                    //    console.log(data.message_id[i])
                    //    console.log(document.querySelector(`[message_id="${data.message_id[i]}"]`))
                    //    if(document.querySelector(`[message_id="${data.message_id[i]}"]`)){
                    //        var target = document.querySelector(`[message_id="${data.message_id[i]}"]`)
                    //        target.classList.add('removed')
                    //        if(target.querySelector('.message')){
                    //            //target.querySelector('.message').textContent = "Message removed"
                    //            target.remove();
                    //        } else {
                    //            target.remove();
                    //        }
                    //        
                    //    }
                    //}
                    store.dispatch(chatReducer({
                        chat: [...chat].filter(e => !data.message_id.includes(e.message_id))
                    }))
                } else if(data.message_id.length === 1 || typeof data.message_id === "string") {
                    store.dispatch(chatReducer({
                        chat: [...chat].filter(e => !data.message_id.includes(e.message_id))
                    }))
                }
            } catch (err) {
                errorManagement(err)
                console.log(err)
            }
        }
    
    } else {
        if(data.current_id && !data.message_id){
            postRequest('chat/delete-conv', {id: data.current_id})
            .then((response) => {
                store.dispatch(chatReducer({moreOptions:{visible: false}}))
            })
            .catch((err) => {
                errorManagement(err)
                console.log(err)
            })

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
                store.dispatch(chatReducer({
                    chats: response,
                    current: response.find(e => e.id !== data.current_id),
                    isChat_window: false
                }))
            })
            .catch((err) => {
                errorManagement(err)
            })
        }
    }
}

function socketJoin(data){
    const state = store.getState().chatReducer.value
    const chat = state.chat
    const chats = state.chats
    const current = state.current
    const USER_DATA = state.USER_DATA

    console.log("Join emitted")
    console.log(data)

    postRequest('chat', {id: USER_DATA.account_id})
    .then((response) => {
        response.map((e) => {
            e.members = JSON.parse(e.members)
            e.settings = JSON.parse(e.settings)
            e.files = JSON.parse(e.files)
            e.recent_message = JSON.parse(e.recent_message)
            e.roles ? e.roles = JSON.parse(e.roles) : null
        })
        store.dispatch(chatReducer({
            chats: response
        }))  
    })
    .catch((err) => {
        errorManagement(err)
        console.log(err)
    })
}

function socketExit(data){
    const state = store.getState().chatReducer.value
    const chats = state.chats
    const current = state.current
    const noConversations = state.noConversations

    if(data.id){
        if(chats.length === 1){
            store.dispatch(chatReducer({
                chat: [],
                chats: undefined,
                noConversations: true
            }))
        } else {
            store.dispatch(chatReducer({
                current: chats.find(e => e.id !== data.id),
                chats: chats.filter(e => e.id !== data.id)
            }))
            document.querySelector(`[data_id="${chats[0].id}"]`).click()
        }
    }
}

function socketConnect(data){
    
}

export { socketMessage, socketTyping, socketRemove, socketExit, socketJoin, socketConnect }