import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import removeEmojis from "../functions/removeEmojis";

export default function CallEvent({ value, index, locale, array, USER_DATA, current }){
    const dispatch = useDispatch();
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)

    var counter = current.members.find(e => e.id !== USER_DATA.account_id)

    var infoObject = JSON.parse(value.text)
    var isSender = value.sender_id === USER_DATA.account_id ? true : false
    var isMissed = infoObject.isMissed ? true : false

    if(infoObject.time){
        if(infoObject.time.substring(0,2) === "00"){ // 0 hours
            var newTime = infoObject.time.substring(3, 10)
            if(newTime.substring(0,2) === "00"){ // 0 minutes
                var newTime = newTime.substring(3, 5)
                if(newTime.substring(0) === "0"){
                    newTime = `${newTime.substring(1,3)} sec`
                } else {
                    newTime = `${newTime} sec`
                }
            } else {
                if(newTime.substring(0, 1) === "0"){
                    newTime = `${newTime.substring(1,2)} min`
                } else {
                    newTime = `${newTime} min`
                }
            }
        } else {
            var newTime = infoObject.time
        }
    }

    /********* Next/Previous message identifier *********/

    let previousMatch = false;
    let nextMatch = false;

    var sender = value.sender_id
    var senderTime = value.timestamp.substring(0, 10)

    // This section checks if the previous message was from the same sender, during the same date
    if(index !== 0 && array[index + 1]){
        //The previous message
        var previousSender = array[index - 1].sender_id
        var previousSenderTime = array[index - 1].timestamp.substring(0, 10)
        //The coming message
        var nextSender = array[index + 1] !== undefined ? array[index + 1].sender_id : undefined
        var nextSenderTime = array[index + 1] !== undefined ? array[index + 1].timestamp.substring(0, 10) : undefined

        var isPreviousEmoji = array[index - 1].text !== null ? removeEmojis(array[index - 1].text) : null
        var isNextEmoji = array[index + 1].text !== null ? removeEmojis(array[index +1].text) : null

        if(sender === previousSender && senderTime === previousSenderTime && (!array[index - 1].time_separator || array[index - 1].time_separator === 4) && isPreviousEmoji !== ""){
            previousMatch = true;
        }

        if(sender === nextSender && senderTime === nextSenderTime && (!array[index +1].time_separator || array[index +1].time_separator === 4) && isNextEmoji !== ""){
            nextMatch = true;
        }
    } else if(index !== 0){
        //The previous message
        var previousSender = array[index - 1].sender_id
        var previousSenderTime = array[index - 1].timestamp.substring(0, 10)

        var isPreviousEmoji = array[index - 1].text !== null ? removeEmojis(array[index - 1].text) : null

        if(sender === previousSender && senderTime === previousSenderTime && !array[index - 1].time_separator < 4 && isPreviousEmoji !== ""){
            previousMatch = true;
        }
    } else if(index === 0 && array[index + 1]){
        var isNextEmoji = array[index + 1].text !== null ? removeEmojis(array[index +1].text) : null
        
        //The coming message
        var nextSender = array[index + 1] !== undefined ? array[index + 1].sender_id : undefined
        var nextSenderTime = array[index + 1] !== undefined ? array[index + 1].timestamp.substring(0, 10) : undefined

        if(sender === nextSender && senderTime === nextSenderTime && (!array[index + 1].time_separator || array[index + 1].time_separator === 4) && isNextEmoji !== ""){
            nextMatch = true;
        }
    }

    return(
        <li
            id={value.message_id}
            className={value.sender_id === USER_DATA.account_id ? "sent-message call" : "recieved-message call"}
            title={value.timestamp}
            timestamp={value.timestamp}
            key={value.message_id}
            message_id={value.message_id}
            file={null}
        >
            {
                (!nextMatch && !isSender) &&
                <figure className="sent-profile-img">
                    <img src={counter.profile_picture ? counter.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                </figure>
            }
            <div 
                className="call-object-wrapper"
                style={{marginLeft: (!nextMatch && !isSender) ? "0px" : null}}
            >
                {
                    (isSender) ?
                    <>
                        {
                            (infoObject.purpose === "call" && !isMissed) &&
                            <div className="event-icon">
                                <i className="material-icons">call_made</i>
                                <i className="material-icons">call</i>
                            </div>
                        }
                        {
                            (infoObject.purpose === "call" && isMissed) &&
                            <div className="event-icon missed">
                                <i className="material-icons">close</i>
                                <i className="material-icons">call</i>
                            </div>
                        }
                        {
                            (infoObject.purpose === "video" && !isMissed) &&
                            <div className="event-icon video">
                                <i className="material-icons">call_made</i>
                                <i className="material-icons">videocam</i>
                            </div>
                        }
                        {
                            (infoObject.purpose === "video" && isMissed) &&
                            <div className="event-icon video missed">
                                <i className="material-icons">close</i>
                                <i className="material-icons">videocam</i>
                            </div>
                        }
                    </>
                    :
                    <>
                        {
                            (infoObject.purpose === "call" && !isMissed) &&
                            <div className="event-icon">
                                <i className="material-icons">call_received</i>
                                <i className="material-icons">call</i>
                            </div>
                        }
                        {
                            (infoObject.purpose === "call" && isMissed) &&
                            <div className="event-icon missed">
                                <i className="material-icons">close</i>
                                <i className="material-icons">call</i>
                            </div>
                        }
                        {
                            (infoObject.purpose === "video" && !isMissed) &&
                            <div className="event-icon video">
                                <i className="material-icons">call_received</i>
                                <i className="material-icons">videocam</i>
                            </div>
                        }
                        {
                            (infoObject.purpose === "video" && isMissed) &&
                            <div className="event-icon video missed">
                                <i className="material-icons">close</i>
                                <i className="material-icons">videocam</i>
                            </div>
                        }
                    </>
                }
                <div className="event-info">
                    <span>
                        {
                            (infoObject.purpose === "call" && !isMissed) &&
                            "Audio call"
                        }
                        {
                            infoObject.purpose !== "call" && !isMissed &&
                            "Video call"
                        }
                        {
                            infoObject.isMissed &&
                            "Missed call"
                        }
                    </span>
                    <span>
                        {
                            infoObject.isMissed &&
                            value.timestamp.substring(11,16)
                        }
                        {
                            (infoObject.time !== "" && !infoObject.isMissed)&&
                            newTime
                        }
                        {
                            (infoObject.time === "" && !infoObject.isMissed)&&
                            value.timestamp.substring(11,16)
                        }
                    </span>
                </div>
            </div>
        </li>
    )
}