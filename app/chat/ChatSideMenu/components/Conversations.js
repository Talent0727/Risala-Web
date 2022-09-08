import React from "react";
import { useDispatch, useSelector }     from "react-redux";
import { timeStamp }                    from "../../../modules/timeStamp";
import { chatReducer, arrayEmpty }      from "../../../features/chat";

export default function Conversations({chats, conversationSelect}){
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const current = useSelector((state) => state.chatReducer.value.current)
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)

    return(
        <>
            {
                chats.map((value, index) => {

                    var text = undefined;
                    if((value.recent_message.files === "1" || value.recent_message.files === true) && value.recent_message.text === ""){
                        text = "Files"
                    } else{
                        text = value.recent_message.text
                    }
                    if(current){
                        if(current.id === value.id){
                            var current_selected = true
                        } else {
                            var current_selected = false
                        }
                    }
                    if(current && typing.chat_id !== undefined && typing.chat_id.length > 0){
                        if(typeof typing.chat_id === "object"){
                            var match = typing.chat_id.filter(e => e === value.id);
                        } else if(typing.chat_id === value.id){
                            var match = value.id
                        }
                    }
                    //Filter out your own account array
                    if(value.members){
                        var members = [...value.members].filter((e) => e.id !== USER_DATA.account_id)
                    }

                    if(value.nicknames){
                        var nicknames = JSON.parse(value.nicknames)
                        if(nicknames.find((e) => e.id !== USER_DATA.account_id)){
                           var nickname = nicknames.find((e) => e.id !== USER_DATA.account_id).nickname
                        } else {
                            var nickname = undefined
                        }
                    } else {
                        var nickname = undefined;
                    }
                    
                    
                    //timestamp fix
                    var time_stamp = timeStamp(value.recent_message.timestamp, false)
                    return(
                        <div
                            className={members.length > 1 ? "conversation-item group" : "conversation-item"}
                            data_id={value.id}
                            user_id={value.sender_id === USER_DATA.account_id ? value.reciever_id : value.sender_id}
                            data_selected={(current_selected === true && !newMessage.is_searching) ? "true" : "false"}
                            key={value + index}
                            onClick={conversationSelect}
                        >
                            {
                                members.length === 1 &&
                                <figure>
                                    <img src={members[0].profile_picture ? `${members[0].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                </figure>
                            }
                            {
                                members.length > 1 &&
                                <div className="group-figure">
                                    <figure>
                                        <img src={members[0].profile_picture ? `${members[0].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                    </figure>
                                    <figure>
                                        <img src={members[1].profile_picture ? `${members[1].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                    </figure>
                                </div> 
                            }
                            <div className="chat-info">
                                <span className="preview-text">
                                {
                                    members.length === 1 &&
                                    <>
                                        {
                                            nickname ?
                                            <span className="preview-text">{nickname}</span>
                                            :
                                            <span className="preview-text">{members[0].firstname + ' ' + members[0].lastname}</span>
                                        }
                                    </>
                                }
                                {
                                    (members.length > 1 && !value.alias) &&
                                    members.map((e, i, row) => {
                                        if(i + 1 === row.length){
                                            return `${e.firstname}`
                                        } else {
                                            return  `${e.firstname}, `
                                        }
                                    })
                                }
                                {
                                    (members && value.alias) &&
                                    <span className="preview-text">{value.alias}</span>
                                }
                                </span>
                                <div className="chat-preview">
                                    <span>
                                        {
                                            value.sender_id === USER_DATA.account_id ?
                                            `You: ${text.length > 24 ? (text.substring(0, 24) + '...') : text}` 
                                            :
                                            `${text.length > 30 ? text.substring(0, 30) + '...' : text}`
                                        }
                                    </span>
                                    {
                                        (match === undefined || match.length === 0) ?
                                        <span>&#183; {time_stamp}</span>
                                        : ""
                                    }
                                </div> 
                            </div>
                            {
                                (match !== undefined && match.length > 0) ?
                                <div className="background-typing typing-bubble">
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                    <div className="bubble"></div>
                                </div>
                                : ""
                            }
                        </div>
                    )
                })    
            }
        </>
    )
}