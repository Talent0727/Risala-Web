import React, { useEffect, useState } from "react";
import useLocale from "../../hooks/useLocale";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";

export default function GroupMembers({group, admin, setAdmin, options, setOptions, selected, setSelected}){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const settings = useSelector((state) => state.chatReducer.value.settings)

    const locale = useLocale();
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        if(!settings){
            setExpanded(false)
            setOptions(false)
        }
    }, [settings])

    useEffect(() => {
        if(current && USER_DATA){
            if(current.roles){
                if(USER_DATA.account_id === current.roles.admin){
                    setAdmin(true)
                } else {
                    setAdmin(false)
                }
            } else {
                setAdmin(false)
            }
        }
    }, [current])
    

    function addMember(){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {purpose: 'add_member'},

        }))
    }

    function expandFunction(){
        setExpanded(!expanded)
    }

    function moreOptionSelect(value, e){
        setSelected(value)
        setOptions(e.clientY)
    }

    return(
        <div className={expanded ? "options-wrapper-wrapper expanded" : "options-wrapper-wrapper"}>
            <div 
                className="options-wrapper-wrapper-header"
                onClick={expandFunction} 
            >
                <span>{locale === "en" ? "Chat members" : "Chattmedlemmar"}</span>
                <i className="material-icons more">expand_more</i>
                <i className="material-icons less">expand_less</i>
            </div>
            <div className="options-wrapper">
                {
                    group &&
                    group.map((value, index) => {
                        return(
                            <div 
                                className="group-member"
                                key={index}
                            >
                                <div className="user-info-wrapper">
                                    <figure>
                                        <img src={value.profile_picture ? value.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                    </figure>
                                    <p>
                                        <span>
                                            {value.firstname + ' ' + value.lastname}
                                        </span>
                                        {
                                            current.roles &&
                                            <>
                                                {
                                                    current.roles.creator === value.id &&
                                                    <span>{locale === "en" ? "Group creator" : "Gruppskapare"}</span>
                                                }
                                                {
                                                    (current.roles.admin === value.id && current.roles.creator !== value.id) &&
                                                    <span>Admin</span>
                                                }
                                                {
                                                    current.roles.admin !== value.id && current.roles.creator !== value.id &&
                                                    <span>{locale === "en" ? "Member" : "Gruppmedlem"}</span>
                                                }
                                            </>
                                        }
                                    </p>
                                </div>
                                <div className="member-options" onClick={((e) => { moreOptionSelect(value, e) })}>
                                    <i className="material-icons">more_horiz</i>
                                </div>
                            </div>
                        )
                    })
                }
                <div className="group-member">
                    <div className="user-info-wrapper">
                        <figure>
                            <img src={USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                        </figure>
                        <p>
                            <span>
                                {USER_DATA.firstname + ' ' + USER_DATA.lastname}
                            </span>
                            {
                                current.roles &&
                                <>
                                    {
                                        current.roles.creator === USER_DATA.account_id &&
                                        <span>{locale === "en" ? "Group creator" : "Gruppskapare"}</span>
                                    }
                                    {
                                        (current.roles.admin === USER_DATA.account_id && current.roles.creator !== USER_DATA.account_id) &&
                                        <span>Admin</span>
                                    }
                                    {
                                        current.roles.admin !== USER_DATA.account_id && current.roles.creator !== USER_DATA.account_id &&
                                        <span>{locale === "en" ? "Member" : "Gruppmedlem"}</span>
                                    }
                                </>
                            }
                        </p>
                    </div>
                    <div className="member-options" onClick={((e) => { moreOptionSelect(USER_DATA, e) })}>
                        <i className="material-icons">more_horiz</i>
                    </div>
                </div>
                <div className="settings-option" onClick={addMember}>
                    <div className="add">
                        <i className="material-icons">add</i>
                    </div>
                    <span>{locale === "en" ? "Add members" : "Lägg till personer"}</span>
                </div>
            </div>
        </div>
    )
}