import React, { useContext, useEffect, useState}    from "react";
import { useDispatch, useSelector }                 from "react-redux";
import chat, { chatReducer, arrayEmpty }            from "../../features/chat";
import { errorManagement, postRequest }             from "../../api/api";

// Components
import TempChats        from "./components/TempChats";
import Conversations    from "./components/Conversations";
import searchFunction from "./functions/searchFunction";

export default function ChatSideMenu({}){
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.chatReducer.value.newMessage)
    const current = useSelector((state) => state.chatReducer.value.current)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const typing = useSelector((state) => state.chatReducer.value.typing)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const noConversations = useSelector((state) => state.chatReducer.value.noConversations)

    const [tempChats, setTempChats] = useState(undefined) //Temp chat are chats which you have searched
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if(!chats && !noConversations){
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [chats])

    function conversationSelect(e){
        var chat_id = e.currentTarget.getAttribute('data_id')

        if(chats.length >= 2 && current.id !== chat_id){
            var selected = e.currentTarget.getAttribute('data_selected')
            var x = document.querySelectorAll('[data_selected="true"]')
        
            if(x.length > 0){
                x.forEach((e) => {
                    e.setAttribute('data_selected', 'false')
                })
            }
        
            if(selected === "false"){
                e.currentTarget.setAttribute('data_selected', 'true')
            } else {
                e.currentTarget.setAttribute('data_selected', 'false')
            }
            
            dispatch(chatReducer({current: chats.find(e => e.id === chat_id)}))
        } else if(chats.length >= 1 && !current){ //this is when your first conversation was initated by someone else
            dispatch(chatReducer({current: chats.find(e => e.id === chat_id)}))
        }
    }

    // Build some sort of algorithm
    // This is an effort to reduce strains on backend
    function conversationSearch(e){
        var value = e.currentTarget.value
        
        if(value.length > 0 && !newMessage.is_searching){
            if(!tempChats){
                setLoading(true)
            }

            var chatMatches = []
            var searchString = value.toLowerCase()

            // Version 2
            var finalScore = searchFunction(searchString, chats, USER_DATA)

            var temporaryChatMatches = finalScore
            setTempChats(temporaryChatMatches)
            setLoading(false)
            
        } else {
            setTempChats(undefined)
            setLoading(false)
        }
    }

    return(
        <div className="chat-sidemenu">
            <div className="chat-sidemenu-header">
                <div className="chat-sidemenu-header-header">
                    <h1>Chats</h1>
                    <div
                        onClick={(() => 
                            dispatch(chatReducer({
                                newMessage: {
                                    is_searching: true
                                }
                            }))
                        )}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M8 11Q8.425 11 8.713 10.712Q9 10.425 9 10Q9 9.575 8.713 9.287Q8.425 9 8 9Q7.575 9 7.287 9.287Q7 9.575 7 10Q7 10.425 7.287 10.712Q7.575 11 8 11ZM12 11Q12.425 11 12.713 10.712Q13 10.425 13 10Q13 9.575 12.713 9.287Q12.425 9 12 9Q11.575 9 11.288 9.287Q11 9.575 11 10Q11 10.425 11.288 10.712Q11.575 11 12 11ZM16 11Q16.425 11 16.712 10.712Q17 10.425 17 10Q17 9.575 16.712 9.287Q16.425 9 16 9Q15.575 9 15.288 9.287Q15 9.575 15 10Q15 10.425 15.288 10.712Q15.575 11 16 11ZM2 19.575V4Q2 3.175 2.588 2.587Q3.175 2 4 2H20Q20.825 2 21.413 2.587Q22 3.175 22 4V16Q22 16.825 21.413 17.413Q20.825 18 20 18H6L3.7 20.3Q3.225 20.775 2.612 20.512Q2 20.25 2 19.575Z"/></svg>
                    </div>
                </div>
                <div className="chat-sidemenu-header-input-wrapper">
                    <input
                        placeholder="Search"
                        onChange={conversationSearch}
                        autoComplete="off"
                        type={"text"}
                    ></input>
                </div>
            </div>
            <div className="chat-convo-list">
                {
                    newMessage.is_searching &&
                    <div 
                        className="conversation-item new-item"
                        data_selected={"true"}
                    >
                        <figure >
                            <img src="https://codenoury.se/assets/generic-profile-picture.png"/>
                        </figure>
                        <div className="chat-info">
                            <span className="preview-text">New message</span>
                            <div 
                                className="chat-preview"
                                onClick={(() =>                         
                                    dispatch(chatReducer({
                                        newMessage: {
                                            is_searching: false
                                        }
                                    }))
                                )}
                            >
                                &#10005;
                            </div> 
                        </div>
                    </div>
                }
                {
                    (chats && !loading && !tempChats) &&
                    <Conversations 
                        chats={chats} 
                        conversationSelect={conversationSelect}
                    />
                }
                {
                    tempChats &&
                    <TempChats 
                        tempChats={tempChats}
                        conversationSelect={conversationSelect}
                    />
                }
                {
                    loading &&
                    <div className="loading">
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                    </div>
                }
            </div>
        </div>
    )
}    