import store from "../../../features/store";
import { chatReducer } from "../../../features/chat";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function callMessage(socket, callSettings, callTime = null, isMissed = false){
    const state = store.getState().chatReducer.value
    const chats = state.chats
    const chat = state.chat
    const current = state.current
    const COUNTER_DATA = state.COUNTER_DATA
    const USER_DATA = state.USER_DATA

    console.log(callSettings, callTime)

    var textObject = {
        purpose: callSettings.purpose,
        time: callTime
    }

    // Was the call misssed? In that case add it to the object
    if(isMissed){
        textObject.isMissed = true
    }

    var messageObject = {
        id: callSettings.id,
        text: JSON.stringify(textObject),
        timestamp: getCurrentTime(),
        files: null,
        file_paths: null,
        sender_id: callSettings.initiator,
        reciever_id: callSettings.members.length > 2 ? callSettings.id : callSettings.members.filter(e => e.id !== USER_DATA.account_id)[0].id,
        message_id: uuidv4(),
        reply_text: null,
        reply_to_id: null,
        reply_to_message_id: null,
        reply_to_name: null,
        time_separator: 4,
        members: callSettings.members,
        room: callSettings.members.map(e => e.id).filter(e => e !== USER_DATA.account_id)
    }

    var match = 
    chat
    .filter(e => !e.time_separator < 4)
    .map(value => value.timestamp.substring(0, 10))
    .filter((v, i, a) => a.indexOf(v) === i)
    .find(e => e === getCurrentTime().substring(0, 10))

    var senderObject = callSettings.members.find(e => e.id === messageObject.sender_id)
    var textPurpose = textObject.purpose === "call" ? "Audio call" : "Video call"
    textPurpose = textObject.isMissed ? `Missed ${textPurpose.toLocaleLowerCase()}` : textPurpose
    var recentMessageText = `${textPurpose} from ${senderObject.firstname}`;

    var newChats = [...chats].filter((e) => e.id === messageObject.id)[0]
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
            files:      messageObject.files,
            file_paths: messageObject.file_paths,
            sender_id:  messageObject.sender_id,
            timestamp:  messageObject.timestamp
        }
    }

    if(!match || typeof match !== "string"){

        var timeseparator_message_id = uuidv4()

        var timeSeparatorObject = {
            time_separator: 1,
            timestamp: getCurrentTime(),
            room: messageObject.room,
            id: current.id,
            message_id: timeseparator_message_id,
        }
        messageObject.timestamp = getCurrentTime(true)

        // Update sender view
        store.dispatch(chatReducer({
            chat: [...chat, timeSeparatorObject, messageObject],
            chats: [newChat, ...chats.filter((e) => e.id !== messageObject.id)] 
        }))

        // Prepare for back-end object
        var messageObject = {
            ...messageObject, 
            isTimeSeparator: true,
            message_id_time: timeseparator_message_id
        }

        // Emit to reciever(s)
        socket.emit('message', messageObject)
    } else {
        store.dispatch(chatReducer({
            chat: [...chat, messageObject],
            chats: [newChat, ...chats.filter((e) => e.id !== messageObject.id)] 
        }))
        socket.emit('message', messageObject)
    }
}