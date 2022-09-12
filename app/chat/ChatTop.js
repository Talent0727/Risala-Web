import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer, user_search_remove } from "../features/chat";
import { callSettingReducer } from "../features/callSettings";
import { postRequest, errorManagement } from "../api/api";
import informationManager from "../modules/informationManager";
import Peer from 'simple-peer'

export default function  ChatTop({setWidth, socket}){
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_SEARCH = useSelector((state) => state.chatReducer.value.USER_SEARCH)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const settings = useSelector((state) => state.chatReducer.value.settings)
    const MESSAGES = useSelector((state) => state.chatReducer.value.MESSAGES)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const callSettings = useSelector((state) => state.chatReducer.value.callSettings)

    const userSearchRef = useRef(); //for create new message
    const [userSelected, setUserSelected] = useState(undefined) //select of user in suggestion window
    const [userSearch, setUserSearch] = useState("");
    const [userSearchResult, setUserSearchResult] = useState(undefined);
    const [userSuggestLoading, setUserSuggestLoading] = useState(false)
    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [loading, setLoading] = useState(true)
    const [nickname, setNickname] = useState(undefined)
    const [counter, setCounter] = useState(undefined)

    useEffect(() => {
        if(userSearchRef.current){
            userSearchRef.current.focus()
        }
    }, [userSearchRef.current])

    useEffect(() => {
        if(newMessage.is_searching){
            userSearchRef.current.focus();
            findConversation([...USER_SEARCH.ID, USER_DATA.account_id])
        }
    }, [newMessage.is_searching, newMessage.new_conversation, USER_SEARCH])

    useEffect(() => {
        setLoading(true)
        if(current && current.members){
            setCounter()
            if(current.members.length > 2){
                setGroup(current.members)
            } else {
                setGroup(undefined)
                var nicknames = current.nicknames

                if(nicknames){
                    nicknames = JSON.parse(current.nicknames)
                    if(nicknames.find((e) => e.id !== USER_DATA.account_id)){
                        setNickname(nicknames.find((e) => e.id !== USER_DATA.account_id).nickname)
                    } else {
                        setNickname(undefined)
                    }
                } else {
                    setNickname(undefined)
                }
            }

            if(current.alias){
                setAlias(current.alias)
            } else {
                if(current && current.alias){
                    setAlias(current.alias)
                } else {
                    setAlias(undefined)
                }
            }
            setLoading(false)
        }
    }, [current])

    function escapeClick(e){
        if(e.code === "Escape" && newMessage.is_searching === true){
            dispatch(chatReducer({
                newMessage: {
                    is_searching: false
                },
                USER_SEARCH: {
                    ID: [],
                    NAMES: [],
                    MEMBERS: []
                }
            }))
            setUserSearch("")
            setUserSearchResult(undefined)
        } else if(e.code === "Backspace" && (USER_SEARCH.NAMES.length > 0 || !USER_SEARCH.NAMES) && userSearchRef.current.value.length === 0){
            if(USER_SEARCH.NAMES.length === 1){
                dispatch(chatReducer({USER_SEARCH: {
                    ID: [],
                    NAMES: [],
                    MEMBERS: []
                }}))
            } else {
                dispatch(chatReducer({ USER_SEARCH: {
                    ID: USER_SEARCH.ID.filter((e, i) => i !== (USER_SEARCH.NAMES.length - 1)),
                    NAMES: USER_SEARCH.NAMES.filter((e, i) => i !== (USER_SEARCH.NAMES.length - 1)),
                    MEMBERS: USER_SEARCH.MEMBERS.filter((e, i) => i !== (USER_SEARCH.NAMES.length - 1))
                }}))
            }
        } else if(e.code === "ArrowDown"){
            //Fix so that it selects from top and down when ArrowDown is clicked
        }
    }

    //If user clicks on (X) in the USER_BOX
    function removeTag(e){
        var element = e.target.parentElement
        var value = element.textContent.substring(0, element.textContent.length - 1)
        var index = USER_SEARCH.NAMES.findIndex((e) => e === value)
        if(USER_SEARCH.NAMES.length === 1){
            dispatch(chatReducer({ USER_SEARCH: {
                ID: [],
                NAMES: [],
                MEMBERS: []
            }}))
            userSearchRef.current.focus();
        } else{
            dispatch(chatReducer({ USER_SEARCH: {
                ID: USER_SEARCH.ID.filter((e, i) => i !== index),
                NAMES: USER_SEARCH.NAMES.filter((e, i) => i !== index),
                MEMBERS: USER_SEARCH.MEMBERS.filter((e, i) => i !== index)
            }}))
        }
    }

    function inputWidth(){
        if(USER_SEARCH.NAMES){
            if(USER_SEARCH.NAMES.length === 0){
                return "200px"
            } else {
                return ""
            }
        } else {
            return ""
        }
    }

    function conversationOptions(e){
        if(settings){
            setWidth(window.innerWidth - 360)
        } else {
            setWidth(window.innerWidth - (360 + 289))
        }
        dispatch(chatReducer({settings: !settings}))
    }

    return(
        <div 
            className="chat-top"
            data-label={newMessage.is_searching === true ? "user-search" : ""}
        >
            {
                newMessage.is_searching &&
                <div className="new-message-top">
                    <span>To: </span>
                    <div 
                        className="input-search-suggest"
                        style={{width: inputWidth()}}
                    >
                        {
                            USER_SEARCH.NAMES &&
                            USER_SEARCH.NAMES.map((value, index) => {

                                return(
                                    <div 
                                        className="tag-box"
                                        key={value}
                                    >
                                        {value}
                                        <span onClick={removeTag}>
                                            &#10005;
                                        </span>
                                    </div>
                                )
                            })
                        }
                        <input 
                            value={userSearch}
                            onInput={userMsgSearch}
                            ref={userSearchRef}
                            onKeyDown={escapeClick}
                            placeholder="Type the name of a person"
                        >
                        </input>
                    </div>
                </div>
            }
            {
                (!newMessage.is_searching && current) &&
                <>
                    <div className="message-top">
                    {
                        (group && !loading) &&
                        <>
                            <div className="group-figure">
                                <figure>
                                    <img src={group[0].profile_picture ? `${group[0].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                </figure>
                                <figure>
                                    <img src={group[1].profile_picture ? `${group[1].profile_picture}` : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                </figure>
                            </div>
                            <span>
                                {
                                    (group && !alias) &&
                                    group.map((e, i, row) => {
                                        if(i + 1 === row.length){
                                            return e.firstname
                                        } else {
                                            return `${e.firstname}, `
                                        }
                                    })
                                }
                                {
                                    (group && alias) &&
                                    <>{alias}</>
                                }
                            </span>
                        </>
                    }
                    {
                        (!group && !loading && COUNTER_DATA) &&
                        <>
                            <figure>
                                <img src={COUNTER_DATA ? COUNTER_DATA[0].profile_picture ? `https://risala.codenoury.se${COUNTER_DATA[0].profile_picture.substring(2)}` : "https://codenoury.se/assets/generic-profile-picture.png" : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                            </figure>
                            {
                                nickname ?
                                <span>{nickname}</span>
                                :
                                <span>{ COUNTER_DATA ? COUNTER_DATA[0].firstname + ' ' + COUNTER_DATA[0].lastname : ""}</span>
                            }
                        </>
                    }
                    {
                        loading &&
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
                    <div className="conversation-options">
                        {
                            !group &&
                            <>
                                <div 
                                    data-value="call"
                                    onClick={(() => { callClick('call') })}
                                >
                                    <i className="material-icons">call</i>
                                </div>
                                <div 
                                    data-value="video"
                                    onClick={(() => { callClick('video') })}
                                >
                                    <i className="material-icons">videocam</i>
                                </div>
                            </>
                        }
                        <div onClick={conversationOptions} data-value="settings">
                            <i className="material-icons">tune</i>
                        </div>
                    </div>
                </>
            }
            {
                (userSearchResult && newMessage.is_searching && !userSuggestLoading && USER_DATA) &&
                <SearchResultSuggestion/>
            }
            {
                (userSuggestLoading && newMessage.is_searching) &&
                <div className="search-result-window">
                    <div className="user-search-mock"><div className="mock-profile"><div className="skeleton"></div></div><div className="mock"><div className="skeleton"></div></div></div>
                    <div className="user-search-mock"><div className="mock-profile"><div className="skeleton"></div></div><div className="mock"><div className="skeleton"></div></div></div>
                    <div className="user-search-mock"><div className="mock-profile"><div className="skeleton"></div></div><div className="mock"><div className="skeleton"></div></div></div>
                    <div className="user-search-mock"><div className="mock-profile"><div className="skeleton"></div></div><div className="mock"><div className="skeleton"></div></div></div>
                    <div className="user-search-mock"><div className="mock-profile"><div className="skeleton"></div></div><div className="mock"><div className="skeleton"></div></div></div>
                </div>
            }
        </div>
    )

    //This function is triggered when user clicks on a profile in the 
    //suggestion list that pops up when typing in the search bar
    function userSelect(id, firstname, lastname, profile_picture){
        if(id && firstname && lastname){
            let name = firstname + " " + lastname
            var profileObject = {
                id: id,
                firstname: firstname,
                lastname: lastname,
                profile_picture: profile_picture
            }
            try{
                if(USER_SEARCH.ID){
                    dispatch(chatReducer({
                        USER_SEARCH: {
                            ID: [...USER_SEARCH.ID, id],
                            NAMES: [...USER_SEARCH.NAMES, name],
                            MEMBERS: [...USER_SEARCH.MEMBERS, profileObject]
                        }
                    }))
                } else {
                    dispatch(chatReducer({
                        USER_SEARCH: {
                            ID: [id],
                            NAMES: [name],
                            MEMBERS: [profileObject]
                        }
                    }))
                }
            } catch(err){
                errorManagement(err)
                console.log(err)
            }

            setUserSelected(id)
    
            userSearchRef.current.value = "";
            setUserSearch("");
            setUserSearchResult("");

            try{
                var searchID = [...USER_SEARCH.ID, id, USER_DATA.account_id]
            } catch (err){
                dispatch(chatReducer({
                    USER_SEARCH: {
                        ID: [id],
                        NAMES: [`${firstname} ${lastname}`],
                        MEMBERS: [profileObject]
                    }
                }))
            }
            userSearchRef.current.focus();
        } else {
            //console.log(id, firstname, lastname)
        }
    }

    function userMsgSearch(e){
        if(!userSearchResult || userSearchResult.length === 0){
            setUserSuggestLoading(true)
        }

        e.preventDefault()
        setUserSearch(e.target.value)
        e.target.focus()

        if(e.target.value !== ""){
            postRequest('chat/search', {
                search: e.target.value.replace(/[^A-Za-z\s]/g, ""),
                user: USER_DATA.account_id,
                selected: USER_SEARCH.ID
            })
            .then((response) => {
                setUserSuggestLoading(false)
                setUserSearchResult(response)
            })
            .catch((err) => {
                informationManager({purpose: 'error', message: err.message})
                errorManagement(err)
                console.log(err)
            })
        } else {
            setUserSuggestLoading(false)
            setUserSearchResult("")
        }
    }

    function SearchResultSuggestion(){
        return(
            <div className="search-result-window">
            {
                userSearchResult.map((value, index) => {
                    return(
                        <div
                            className="search-result"
                            data-id={value.account_id}
                            data-firstname={value.firstname}
                            data-lastname={value.lastname}
                            data-profile_picture={value.profile_picture}
                            key={index}
                            onClick={(() => { userSelect(value.account_id, value.firstname, value.lastname, value.profile_picture)})}
                        >
                            <figure>
                                <img src={value.profile_picture ? value.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                            </figure>
                            <span>
                                {value.firstname} {value.lastname}
                            </span>
                        </div>
                    )
                })
            }
            </div>  
        )
    }

    // This function is triggered whenever an user has been selected, or if the a user has been deleted
    // Thus whenever the number of users selected in your search list has changed, this function is triggered
    // In order to assess whether a conversation ALREADY exists with the selected users or not.
    function findConversation(searchID){
        let match;
        let matchIndex;
        chats.map(e => e.members.filter((e,i,a) => a.length === searchID.length)).forEach((conversation, index, array) => {
            if(conversation.map(e => e.id).sort().toString() === searchID.sort().toString()) {
                match = chats[index].id
                matchIndex = index
            }
        })

        // No match
        if(!match){
            console.log("No match")
            dispatch(chatReducer({
                newMessage: {
                    is_searching: true,
                    new_conversation: true
                }
            }))
        } else if(match){ // Match
            dispatch(chatReducer({
                newMessage: {
                    is_searching: true,
                    new_conversation: false
                },
                current: chats.find(e => e.id === match)
            }))
        }
    }

    // This is triggered whenever a user has clicked on the videocall button or call button.
    // Triggers ChatCall.js
    function callClick(type){
        navigator.mediaDevices.getUserMedia({
            video: type === "video" ? true : false,
            audio: true
        })
        .then((stream) => {
            initCall(stream)
        })
        .catch((err) => {
            informationManager({purpose: 'error', message: `${err.message} Please allow your browser to access the camera/microphone.`})
            console.log(err)
        })

        function initCall(stream){
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream
            })
            dispatch(callSettingReducer({
                isActive: true,
                isInCall: true,
                purpose: type,
                id: current.id,
                members: [...current.members],
                joined: [USER_DATA.account_id],
                initiator: true,
                initiatorID: USER_DATA.account_id,
                userSettings: {
                    isCam: type === "video" ? true : false,
                    isMuted: false,
                    userPeer: peer,
                    userStream: stream
                }
            }))
        }
    }
}