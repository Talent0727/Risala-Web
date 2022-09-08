import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";

export default function GroupBadge({ locale }){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const chat = useSelector((state) => state.chatReducer.value.chat)


    if(current.members && chat){
        if(current.members.length > 2){
            try {
                var firstSender = chat.find(e => e.sender_id !== null).sender_id
                var firstSenderObject = current.members.find(e => e.id === firstSender)
                var others = current.members.filter(e => e.id !== USER_DATA.account_id)
        
                if(firstSender === USER_DATA.account_id){
                    var sendername = "You"
                } else {
                    var sendername = others.find(e => e.id === firstSender).firstname
                }
        
                var string = `${sendername} created this group`
                
                return(
                    <div className="group-badge-wrapper">
                        <div className="group-figure">
                            <figure>
                                <img src={others[0].profile_picture ? `${others[0].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                            </figure>
                            <figure>
                                <img src={others[1].profile_picture ? `${others[1].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                            </figure>
                        </div>
                        <span className="group-name">
                            {
                                !current.alias &&
                                others.map((e,i, row) => {
                                    if(i + 1 === row.length){
                                        return e.firstname
                                    } else {
                                        return `${e.firstname}, `
                                    }
                                })
                            }
                        </span>
                        {
                            current.alias &&
                            <span className="group-name">{current.alias}</span>
                        }
                        <span className="creator">{string}</span>
                        <div className="group-chat-settings">
                            <div onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "add_member"},
                                }))
                            })}>
                                <i className="material-icons">person_add</i>
                                <span>{locale === "en" ? "Add user" : "Lägg till"}</span>
                            </div>
                            <div onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "change_name"},
                                }))
                            })}>
                                <i className="material-icons">edit</i>
                                <span>{locale === "en" ? "Change name" : "Namn"}</span>
                            </div>
                            <div onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: { purpose: "view_members"},
                                }))
                            })}>
                                <i className="material-icons">groups</i>
                                <span>{locale === "en" ? "Group members" : "Medlemmar"}</span>
                            </div>
                        </div>
                    </div>
                )
            } catch {
                return null
            }
        } else {
            return null
        }
    } else {
        return null
    }
}