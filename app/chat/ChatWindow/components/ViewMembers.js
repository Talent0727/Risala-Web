import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import useLocale from "../../../hooks/useLocale";
import { postRequest, errorManagement } from "../../../api/api";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function ViewMembers({closeWindow}){
    const locale = useLocale();
    const dispatch = useDispatch();
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const selectedUser = useSelector((state) => state.chatReducer.value.selectedUser)

    const [view, setView] = useState('All')
    
    return(
        <>
            <div className="chat-dynamic-popup-top members">
                <div className="group-member-options-wrapper">
                    <div 
                        className="group-member-option" 
                        onClick={(() => {setView("All")})}
                        style={view === "All" ? {borderBottom: `2px solid ${current.settings.color}`} : null}
                    >
                        {locale === "en" ? "All" : "Alla"}
                    </div>
                    <div 
                        className="group-member-option" 
                        onClick={(() => {setView("Admin")})}
                        style={view === "Admin" ? {borderBottom: `2px solid ${current.settings.color}`} : null}
                    >
                        {locale === "en" ? "Admins" : "Administratörer"}
                    </div>
                </div>
                <div 
                    className="popup-close"
                    onClick={closeWindow}
                >
                    <i className="material-icons">close</i>
                </div>
            </div>
            <div className="popup-main members">
                {
                    view === "All" ?
                    <>
                        {
                            current.members.map((e, i) => {
                                return (
                                    <div className="user" key={i}>
                                        <figure>
                                            <img src={e.profile_picture ? e.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"} alt="profile_picture"/>
                                        </figure>
                                        <span>
                                            {e.firstname + ' ' + e.lastname}
                                        </span>
                                    </div>
                                )
                            })
                        }
                    </>
                    :
                    <>
                        {
                            current.members.filter(e => (e.id === current.roles.admin)).map((e, i) => {
                                return (
                                    <div className="user" key={i}>
                                        <figure>
                                            <img src={e.profile_picture ? e.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"} alt="profile_picture"/>
                                        </figure>
                                        <span>
                                            {e.firstname + ' ' + e.lastname}
                                        </span>
                                    </div>
                                )
                            })
                        }
                    </>
                }
            </div>
        </>
    )
}