import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";

//Views
import AddMember        from "./components/AddMember";
import ChangeName       from "./components/ChangeName";
import ChangeNickname   from "./components/ChangeNickname";
import ChangeColor      from "./components/ChangeColor";
import ChangeEmoji      from "./components/ChangeEmoji";
import ViewMembers      from "./components/ViewMembers";
import RemoveMessage    from "./components/RemoveMessage";
import RemoveMember     from "./components/RemoveMember";
import ChangeAdmin      from "./components/ChangeAdmin";
import Settings         from "./components/Settings";
import BugReport        from "./components/BugReport";

export default function ChatWindow({socket, locale}){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const chat_window = useSelector((state) => state.chatReducer.value.chat_window) //Data for the purpose behind popup Window
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window) //true or false
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const moreOptions = useSelector((state) => state.chatReducer.value.moreOptions)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const ERROR = useSelector((state) => state.chatReducer.value.ERROR)
    const chat = useSelector((state) => state.chatReducer.value.chat)
    const chats = useSelector((state) => state.chatReducer.value.chats)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)
    const callSettings = useSelector((state) => state.chatReducer.value.callSettings)

    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if(isChat_window){
            if(chat_settings && chat_window.purpose === "change_color" && chat_settings.color && chat_settings.color !== "#e1872c"){
                document.querySelector(`[data-color="${chat_settings.color}"]`).classList.toggle('selected')
            } else if(chat_window.purpose === "change_color") {
                document.querySelector(`[data-color="#e1872c"]`).classList.toggle('selected')
            }
        }
    }, [chat_settings, chat_window])

    function closeWindow(){
        if(chat_window.purpose === "remove_message"){
            dispatch(chatReducer({moreOptions:{visible: false}}))
        }
        dispatch(chatReducer({isChat_window: !isChat_window}))
    }

    return(
        <>
            {   
                (isChat_window && !isLoading && chat_window) &&
                <div className="background-blocker">
                    {
                        (chat_window.purpose !== "loading" && chat_window.purpose !== "call_video") &&
                        <div className="chat-dynamic-popUp">
                            {
                                (chat_window && chat_window.purpose === "remove_message") &&
                                <RemoveMessage
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading} 
                                    closeWindow={closeWindow}
                                    socket={socket}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "change_color") &&
                                <ChangeColor 
                                    closeWindow={closeWindow}
                                    socket={socket}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "change_emoji") &&
                                <ChangeEmoji 
                                    closeWindow={closeWindow} 
                                    socket={socket}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "change_name") &&
                                <ChangeName 
                                    closeWindow={closeWindow}
                                    socket={socket}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "change_nickname") &&
                                <ChangeNickname 
                                    closeWindow={closeWindow}
                                    socket={socket}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "add_member") &&
                                <AddMember 
                                    closeWindow={closeWindow}
                                    socket={socket} 
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "remove_member") &&
                                <RemoveMember 
                                    closeWindow={closeWindow}
                                    socket={socket} 
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "change_admin") &&
                                <ChangeAdmin 
                                    closeWindow={closeWindow}
                                    socket={socket}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "view_members") &&
                                <ViewMembers closeWindow={closeWindow}/>
                            }
                            {
                                (chat_window && chat_window.purpose === "settings") &&
                                <Settings 
                                    closeWindow={closeWindow}
                                    locale={locale}
                                />
                            }
                            {
                                (chat_window && chat_window.purpose === "bug_report") &&
                                <BugReport 
                                    closeWindow={closeWindow} 
                                    locale={locale}
                                />
                            }
                        </div>
                    }
                </div>
            }
            {
                (isChat_window && (isLoading || chat_window.purpose === "loading")) &&
                <div className="background-blocker" style={{display: "flex", justifyContent: "center", alignItems: "Center"}}>
                    <div className="lds-dual-ring large"></div>
                </div>
            }
        </>
    )
}