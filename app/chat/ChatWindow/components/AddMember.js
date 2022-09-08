import React, { useState, useEffect } from "react";
import useLocale from "../../../hooks/useLocale";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from 'uuid';

export default function AddMember({closeWindow, socket}){
    const locale = useLocale();
    const [userSearch, setUserSearch] = useState("");
    const [userSearchResult, setUserSearchResult] = useState(undefined);
    const [userSuggestLoading, setUserSuggestLoading] = useState(false)
    const [userSelected, setUserSelected] = useState(undefined) //select of user in suggestion window, array
    const [members, setMembers] = useState(undefined)
    const [active, setActive] = useState(false)

    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)

    useEffect(() => {
        if(current){
            setMembers(current.members)
        }

    }, [])

    function typing(e){
        if(e.target.value !== ""){
            setUserSuggestLoading(true)
            postRequest('chat/search', {
                search: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                selected: members.map((e) => e.id)
            })
            .then((response) => {
                setUserSuggestLoading(false)
                setUserSearchResult(response)
            })
            .catch((err) => {
                errorManagement(err)
                console.log(err)
            })
        } else {
            setUserSuggestLoading(false)
            setUserSearchResult(undefined)
        }
    }

    function addUser(e){
        if(!userSelected){
            setUserSelected([e])
            setActive(true)
        } else{
            setUserSelected(userSelected => [...userSelected, e])
        }
    }

    function removeUser(e){
        if(userSelected.length === 1){
            document.querySelector(`[account_id="${e.account_id}"] input`).checked = false
            setUserSelected(undefined)
            setActive(false)
        } else {
            var newSelected = userSelected.filter((value) => value.account_id !== e.account_id)
            document.querySelector(`[account_id="${e.account_id}"] input`).checked = false
            setUserSelected(newSelected)
        }
    }

    //Update this
    function updateMembers(){
        userSelected.map((e) => {
            e.id = e.account_id
            delete e.account_id
            delete e.username
        })
        var groupMembers = [...current.members, ...userSelected]

        var newMembers = userSelected.map(e => e.id)
        var oldMembers = current.members.map(e => e.id) // <--- Send to existing users

        var data = {
            time_separator: 2, 
            timestamp: getCurrentTime(), 
            id: current.id, 
            sender_id: USER_DATA.account_id, 
            reciever_id: newMembers,
            text: 'Added',
            message_id: uuidv4(),
            files: null,
            file_paths: null,
            reply_to_id: null,
            reply_text: null,
            reply_to_message_id: null,
            reply_to_name: null,
            room: oldMembers,
            groupMembers: [...current.members, ...userSelected]
        }

        var newCurrent = {
            ...current,
            ['members']: groupMembers
        }

        postRequest('chat/members', {
            members: JSON.stringify(groupMembers),
            id: current.id,
            update: true
        })
        .then((response) => {
            dispatch(chatReducer({
                isChat_window: false,
                chat: [...chat, data],
                current: newCurrent
            }))
            socket.emit('message', (data))
            socket.emit('group-join', (newMembers))
        })
        .catch((err) => {
            errorManagement(err)
        })
    }

    return(
        <>
            <div className="chat-dynamic-popup-top">
                <h2>
                    {locale === "en" ? "Add new members" : "Lägg till personer"}
                </h2>
                <div 
                    className="popup-close"
                    onClick={closeWindow}
                >
                    <i className="material-icons">close</i>
                </div>
            </div>
            <div className="popup-main add-member">
                <div className="input-wrapper">
                    <input onChange={typing}></input>
                    <i className="material-icons">search</i>
                </div>
                <div className="suggestion-window">
                    <div className="selected-wrapper">
                        {
                            !userSelected &&
                            <p>{locale === "en" ? "No users selected" : "Inga användare har valts"}</p>
                        }
                        {
                            userSelected &&
                            userSelected.map((e, i) => {
                                return(
                                    <div className="user-selected" key={i}>
                                        <figure>
                                            <img src={e.profile_picture ? e.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                        </figure>
                                        <span>{e.firstname + ' ' + e.lastname}</span>
                                        <div
                                            className="close"
                                            onClick={(() => {
                                                removeUser(e)
                                            })}
                                        >
                                            <i className="material-icons">close</i>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="user-suggest-window">
                        {
                            (!userSuggestLoading && userSearchResult) &&
                            userSearchResult.map((e, i) => {

                                if(userSelected){
                                    var match = userSelected.find((value) => (value.account_id === e.account_id) || (value.id === e.id))
                                }

                                return(
                                    <div className="user-wrapper" key={i} account_id={e.account_id}>
                                        <div className="user-info">
                                            <figure>
                                                <img src={e.profile_picture ? e.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                            </figure>
                                            <span>{e.firstname + ' ' + e.lastname}</span>
                                        </div>
                                        <input 
                                            type={"checkbox"}
                                            defaultChecked={match ? true : false}
                                            onClick={((x) => {
                                                if(x.target.checked){
                                                    addUser(e)
                                                } else {
                                                    removeUser(e)
                                                }
                                            })}
                                        >
                                        </input>
                                    </div>
                                )
                            })
                        }
                        {
                            userSuggestLoading &&
                            <>
                                <div className="mock">
                                    <div className="skeleton"></div>
                                </div>
                                <div className="mock">
                                    <div className="skeleton"></div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
            <button 
                className={active ? "button button-yellow-square confirm" : "button button-yellow-square confirm deactive"}
                onClick={active ? updateMembers : null}
            >
                {locale === "en" ? "Add members" : "Lägg till personer"}
            </button>
        </>
    )
}