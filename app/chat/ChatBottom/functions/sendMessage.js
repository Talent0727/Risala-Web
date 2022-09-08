import React from "react";
import store from "../../../features/store";
import { chatReducer, arrayEmpty } from "../../../features/chat";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';
import { postRequest, errorManagement } from "../../../api/api";


/***************************************************
                Send Message Function

    - This file needs to be reduced, and optimized
    - Split the function into two parts,
        * Files
        * Message with no files

***************************************************/

export default function sendMessage(value, inputRef, socket){
    const state = store.getState().chatReducer.value
    const chats = state.chats
    const chat = state.chat
    const current = state.current
    const newMessage = state.newMessage
    const COUNTER_DATA = state.COUNTER_DATA
    const USER_DATA = state.USER_DATA
    const USER_SEARCH = state.USER_SEARCH
    const reply = state.reply
    const isFiles = state.isFiles
    const files = state.files
    const filesAndMedia = state.filesAndMedia
    const chat_settings = state.chat_settings
    const uploadFiles = state.uploadFiles

    store.dispatch(chatReducer({ // <-- What is this? 
        isChat_window: true,
        chat_window: {
            purpose: "remove"
        }
    }))

    //Is the text value retrieved as a parameter in the function or directly from
    //The ref (textarea)
    if(!value){
        var textValue = inputRef.current.value
    } else{
        var textValue = value
    }

    //New Conversation
    if(newMessage.new_conversation === true){
        var userObject = {
            id: USER_DATA.account_id,
            firstname: USER_DATA.firstname,
            lastname: USER_DATA.lastname,
            profile_picture: USER_DATA.profile_picture
        }
        var members = [...USER_SEARCH.MEMBERS, userObject]

        var messageObject = {
            text: textValue,
            timestamp: getCurrentTime(),
            files: null,
            file_paths: null,
            new: true,
            members: JSON.stringify(members)
        }
        
        if(USER_SEARCH.ID.length === 1 || USER_SEARCH.NAMES.length === 1){
            messageObject.id = `${USER_DATA.account_id}-${USER_SEARCH.ID[0]}`
            messageObject.reciever_id = USER_SEARCH.ID[0]
            messageObject.sender_id = USER_DATA.account_id
            messageObject.room = USER_SEARCH.ID[0]
        } else {
            //Retrieve search array from USER_SEARCH.ID, then append user ID
            //Reciever will always be the group id, created by uuid()
            //To ensure the same id, chatID variable will hold the new uuid value
            var chatID = uuidv4()

            //Group message
            messageObject.id = chatID
            messageObject.group = true
            messageObject.reciever_id = chatID
            messageObject.sender_id = USER_DATA.account_id
            messageObject.room = members.map((e) => e.id)
        }

        if(isFiles){
            var formData = new FormData
            for(let i = 0; i < files.length; i++){
                formData.append(`File-${i + 1}`, files[i])
            }

            postRequest('chat/upload', formData, {headers: {"Content-Type": "multipart/form-data"}})
            .then((response) => {
                if(response){
                    messageObject.files = true
                    messageObject.file_paths = JSON.stringify(response)
                }

                updateChats(messageObject, current.id)
                fileUpdateChat()
                store.dispatch(chatReducer({
                    isFiles: false
                }))
            })
            .catch((err) => {
                throw err
            })
        }

    } 
    //Existing Conversation
    else if(current.id) {
        var messageObject = {
            id: current.id,
            sender_id: USER_DATA.account_id,
            text: textValue,
            timestamp: getCurrentTime(),
            files: null,
            file_paths: null,
        }

        if(reply.reply === true){
            messageObject.reply_text = reply.text
            messageObject.reply_to_message_id = reply.message_id
            messageObject.reply = true
        }

        //If uuid, then it confirms that the current chat is a group chat, since they only use uuid
        //Whereas normal chat uses a
        if(current.members.length > 2){
            messageObject.reciever_id = current.id
            messageObject.room = COUNTER_DATA.map((e) => e.id)
            if(reply.reply){
                messageObject.reply_to_name = reply.replying_to_name
                messageObject.reply_to_id = reply.replying_to_id
            }
        } else {
            messageObject.reciever_id = COUNTER_DATA[0].id
            messageObject.room = COUNTER_DATA[0].id
            if(reply.reply){
                messageObject.reply_to_name = reply.replying_to_name
                messageObject.reply_to_id = reply.replying_to_id
            }
        }

        /****************  FOR FILE UPLOAD LOOK AT THE FUNCTION BELOW   *****************/
        //Is there files attached to the message?
        //If so, run the async function (promise), which returns filepaths
        if(isFiles){
            var formData = new FormData
            for(let i = 0; i < files.length; i++){
                formData.append(`File-${i + 1}`, files[i])
            }

            postRequest('chat/upload', formData, {headers: {"Content-Type": "multipart/form-data"}})
            .then((response) => {
                if(response){
                    messageObject.files = true

                    var uploadFileState = [...uploadFiles.files]
                    var uploadImagesState = [...uploadFiles.images]

                    var fixedFileState = []
                    var fixedImageState = []

                    // Replace the path into the uploadFiles state of files
                    for(let i = 0; i < response.length; i++){
                        var originalFileName = response[i].substring(21)

                        //Find uploaded file in the uploadFiles state, replace the original name
                        // which is found in key 'path', with the path from response.
                        if(uploadFileState.find(e => e.path === originalFileName)){
                            var tempObject = {...uploadFileState.find(e => e.path === originalFileName)}
                            tempObject.path = response[i]
                            fixedFileState.push(tempObject)
                            //uploadFileState.find(e => e.path === originalFileName).path = response[i]
                        } else if(uploadImagesState.find(e => e.path === originalFileName)){
                            var tempObject = {...uploadImagesState.find(e => e.path === originalFileName)}
                            tempObject.path = response[i]
                            fixedImageState.push(tempObject)
                            //uploadImagesState.find(e => e.path === originalFileName).path = response[i]
                        }
                    }

                    //var aggregatedFilePath = [...uploadFileState, ...uploadImagesState]
                    var aggregatedFilePath = [...fixedFileState, ...fixedImageState]
                    messageObject.file_paths = JSON.stringify(aggregatedFilePath)
                }

                updateChats(messageObject, current.id, aggregatedFilePath)
                fileUpdateChat(fixedFileState, fixedImageState, aggregatedFilePath)
                store.dispatch(chatReducer({ isFiles: false }))
            })
            .catch((err) => {
                throw err
            })
        } else{
            updateChats(messageObject, current.id)
        }
    }

    /******************** This section adds or skipps adding a time-stamp (separator) ******************************/
    
    if(!isFiles){

        //Looks if a time separator should be appended
        var match = 
        chat
        .filter(e => !e.time_separator < 4)
        .map(value => value.timestamp.substring(0, 10))
        .filter((v, i, a) => a.indexOf(v) === i)
        .find(e => e === getCurrentTime().substring(0, 10))
    
        
        messageObject.message_id = uuidv4()
        if(!match || newMessage.new_conversation === true || typeof match !== "string"){
            messageObject.message_id_time = uuidv4()
            messageObject = {...messageObject, ...{time_separator: true}}
        } else{
            messageObject = {...messageObject, ...{time_separator: false}}
        }
        
        socket.emit('typing', { value: false })
        socket.emit('message', messageObject);

        store.dispatch(chatReducer({reply: { reply: false }}))

        //If a new conversation was initiated, then select the new conversation automatically
        if(newMessage.new_conversation){

            var newObject = {
                id: messageObject.id,
                members: JSON.parse(messageObject.members),
                settings: {color: "#e1872c", emoji: "👍"},
                files: {files: [], images: []},
                alias: null,
                nicknames: null,
                recent_message: {
                    text: messageObject.text,
                    files: null,
                    file_paths: null,
                    sender_id: USER_DATA.account_id,
                    timestamp: getCurrentTime()
                },
                roles: null
            }
            var newChat = [
                {
                    id: messageObject.id,
                    sender_id: null,
                    reciever_id: null,
                    text: null,
                    files: null,
                    file_paths: null,
                    timestamp: getCurrentTime(),
                    message_id: messageObject.message_id,
                    reply_to_id: null,
                    reply_text: null,
                    reply_to_name: null,
                    time_separator: 1
                },
                {
                    id: messageObject.id,
                    sender_id: USER_DATA.account_id,
                    reciever_id: messageObject.reciever_id,
                    text: messageObject.text,
                    files: null,
                    file_paths: null,
                    timestamp: getCurrentTime(true),
                    message_id: messageObject.message_id_time,
                    reply_to_id: null,
                    reply_text: null,
                    reply_to_name: null,
                    time_separator: null
                }
            ]

            //Update Chats
            store.dispatch(chatReducer({
                chats: [newObject, ...chats],
                current: newObject,
                chat: newChat,
                chat_settings: { color: "#e1872c", emoji: "👍" }
            }))

            mutationObserver(messageObject.id)
        } else {
            //New conversation WAS NOT selected, push the new message like normal
            if(messageObject.time_separator === true){
                messageObject.time_separator = null;
                store.dispatch(chatReducer({chat: [
                    ...chat, 
                    {time_separator: 1, timestamp: getCurrentTime(), id: current.id, message_id: messageObject.message_id_time}, 
                    messageObject
                ]}))
            } else {
                store.dispatch(chatReducer({chat: [...chat, messageObject]}))
            }
        }

        store.dispatch(chatReducer({
            newMessage: {
                is_searching: false,
                new_conversation: false
            },
            isChat_window: false,
            chat_window: undefined
        }))
        store.dispatch(arrayEmpty('USER_SEARCH'))
    }

    //If files is attached to a message, pushes message out to peer/group
    function fileUpdateChat(fileArray, imageArray, aggregatedFilePath){
        var match = 
        chat
        .filter(e => !e.time_separator < 4)
        .map(value => value.timestamp.substring(0, 10))
        .filter((v, i, a) => a.indexOf(v) === i)
        .find(e => e === getCurrentTime()
        .substring(0, 10))

        //Only files, no images/videos
        if(fileArray.length > 0 && imageArray.length === 0){
            var filePaths = messageObject.file_paths
            delete messageObject.file_paths

            var timeSeparatorObject = {
                time_separator: 1,
                timestamp: getCurrentTime(),
                room: messageObject.room,
                id: current.id,
                message_id: uuidv4()
            }

            var tempArrayOfMessages = []

            if(match === undefined || newMessage.new_conversation === true){
                socket.emit('message', timeSeparatorObject)
            }

            // File message
            for(let i = 0; i < fileArray.length; i++){
                var tempMessageObject = {
                    id: messageObject.id,
                    message_id: uuidv4(),
                    sender_id: messageObject.sender_id,
                    reciever_id: messageObject.reciever_id,
                    room: messageObject.room,
                    text: '',
                    timestamp: getCurrentTime(true),
                    files: true,
                    file_paths: JSON.stringify([fileArray[i]])
                }

                tempArrayOfMessages.push(tempMessageObject)
                socket.emit('message', tempMessageObject)
            }

            // None file message
            if(messageObject.text !== ""){
                setTimeout(() => {
                    var tempMessageObject = {
                        id: messageObject.id,
                        message_id: uuidv4(),
                        sender_id: messageObject.sender_id,
                        reciever_id: messageObject.reciever_id,
                        room: messageObject.room,
                        text: messageObject.text,
                        timestamp: getCurrentTime(true),
                        files: false,
                        file_paths: null
                    }
                    socket.emit('message', tempMessageObject)
                    tempArrayOfMessages.push(tempMessageObject)
                }, 100);
            }

            if(match === undefined || newMessage.new_conversation === true){
                store.dispatch(chatReducer({chat: [...chat, timeSeparatorObject, ...tempArrayOfMessages]}))
            } else {
                store.dispatch(chatReducer({chat: [...chat, ...tempArrayOfMessages]}))
            }

        } else if(fileArray.length > 0 && imageArray.length > 0){ //We have both image & file

            var filePaths = messageObject.file_paths
            delete messageObject.file_paths

            var timeSeparatorObject = {
                time_separator: 1,
                timestamp: getCurrentTime(),
                room: messageObject.room,
                id: current.id,
                message_id: uuidv4()
            }

            var tempArrayOfMessages = []

            if(match === undefined || newMessage.new_conversation === true){
                socket.emit('message', timeSeparatorObject)
            }

            // File message
            for(let i = 0; i < fileArray.length; i++){
                var tempMessageObject = {
                    id: messageObject.id,
                    message_id: uuidv4(),
                    sender_id: messageObject.sender_id,
                    reciever_id: messageObject.reciever_id,
                    room: messageObject.room,
                    text: '',
                    timestamp: getCurrentTime(true),
                    files: true,
                    file_paths: JSON.stringify([fileArray[i]])
                }

                tempArrayOfMessages.push(tempMessageObject)
                socket.emit('message', tempMessageObject)
            }

            // None file message (DOES INCLUDE IMAGES)
            var tempMessageObject = {
                id: messageObject.id,
                message_id: uuidv4(),
                sender_id: messageObject.sender_id,
                reciever_id: messageObject.reciever_id,
                room: messageObject.room,
                text: messageObject.text,
                timestamp: getCurrentTime(true),
                files: true,
                file_paths: JSON.stringify(imageArray)
            }
            socket.emit('message', tempMessageObject)
            tempArrayOfMessages.push(tempMessageObject)

            if(match === undefined || newMessage.new_conversation === true){
                store.dispatch(chatReducer({chat: [...chat, timeSeparatorObject, ...tempArrayOfMessages]}))
            } else {
                store.dispatch(chatReducer({chat: [...chat, ...tempArrayOfMessages]}))
            }

        } else if(fileArray.length === 0) { //Only images, run everything like normal
            messageObject.message_id = uuidv4()
            if(match === undefined || newMessage.new_conversation === true){
                messageObject.message_id_time = uuidv4()
                messageObject.timestamp = getCurrentTime(true)
                socket.emit('message', {...messageObject, ...{time_separator: 1, timestamp: getCurrentTime(), id: current.id, message_id_time: messageObject.message_id_time}})
            } else{
                socket.emit('message', {...messageObject, ...{time_separator: false}})
            }
        }

        
        socket.emit('typing', { value: false })
        store.dispatch(chatReducer({reply: { reply: false }}))


        /* CLIENT PUSH */
        //If a new conversation was initiated, then select the new conversation automatically
        if(newMessage.new_conversation){
            //Updte Chats
            postRequest('chat', {id: USER_DATA.account_id})
            .then((response) => {
                response.map((e) => {
                    e.members = JSON.parse(e.members)
                    e.settings = JSON.parse(e.settings)
                    e.files = JSON.parse(e.files)
                    e.recent_message = JSON.parse(e.recent_message)
                    e.roles ? e.roles = JSON.parse(e.roles) : null
                })
                dispatch(chatReducer({chats: response}))  
            })
            .catch((err) => {
                errorManagement(err)
            })
        } else if(fileArray.length === 0) {
            //New conversation WAS NOT selected, push the new message like normal
            if(messageObject.message_id_time){
                messageObject.time_separator 
                store.dispatch(chatReducer({chat: [...chat, {time_separator: 1, timestamp: getCurrentTime(), id: current.id, message_id: messageObject.message_id_time}, messageObject]}))
            } else {
                store.dispatch(chatReducer({chat: [...chat, messageObject]}))
            }
        }

        store.dispatch(chatReducer({
            newMessage: {
                is_searching: false,
                new_conversation: false
            },
            isChat_window: false,
            chat_window: undefined
        }))
        store.dispatch(arrayEmpty('USER_SEARCH'))

        //Update filesAndMedia
        try {

            if(filesAndMedia){
                var files = [...filesAndMedia.files]
                var images = [...filesAndMedia.images]
            } else if(current){
                var files = [...current.files.files]
                var images = [...current.files.images]
            }

            for(let i = 0; i < aggregatedFilePath.length; i++){
                var fileExtension = aggregatedFilePath[i].type.split('/')[0]
                if(fileExtension === 'image' || fileExtension === 'video'){
                    images.push(aggregatedFilePath[i])
                } else {
                    files.push(aggregatedFilePath[i])
                }
            }

            store.dispatch(chatReducer({
                filesAndMedia: {
                    files: files,
                    images: images
                }
            }))
        } catch (err) {
            console.log(err)
        }
    }
}

// This function simply updates all meta data associated with a certain conversation (state -> Current)
function updateChats(messageObject, current_id, aggregatedFilePath){
    const state = store.getState().chatReducer.value
    const chats = state.chats

    var currentChat = [...chats].filter((e) => e.id === current_id)[0]

    var newChat = {
        id:         currentChat.id,
        members:    currentChat.members,
        settings:   currentChat.settings,
        files:      currentChat.files,
        alias:      currentChat.alias,
        nickname:   currentChat.nickname,
        roles:      currentChat.roles,
        recent_message: {
            text: messageObject.text,
            files: messageObject.files,
            file_paths: JSON.stringify(aggregatedFilePath),
            sender_id: messageObject.sender_id,
            timestamp: messageObject.timestamp
        }
    }

    var tempChats = [...chats].filter((e) => e.id !== newChat.id)
    tempChats = [newChat, ...tempChats]

    //Order the chats (might happen automatically)
    store.dispatch(chatReducer({chats: tempChats}))
}

// If theres a new conversation, and it is your first conversation, the mutation observer makes sure
// that only once the new conversation has appears among your conversation list, it will be selected
function mutationObserver(id){
    var parent = document.querySelector('.chat-convo-list')

    const mutationObserver = new MutationObserver(entires => {
        document.querySelector(`[data_id="${id}"]`).click()
    })
    mutationObserver.observe(parent, {attributes: true, attributeOldValue: true})
}