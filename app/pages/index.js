import React, { useState, useEffect, useRef, useContext } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer, objectAdd } from "../features/chat";
import useLocale from "../hooks/useLocale";

//Components
import ChatSideMenu         from "../chat/ChatSideMenu/ChatSideMenu";
import ChatTop              from "../chat/ChatTop";
import ChatDisplay          from "../chat/ChatDisplay/ChatDisplay";
import ChatBottom           from "../chat/ChatBottom/ChatBottom";
import ChatNavbar           from "../chat/ChatNavbar";
import ChatLoad             from "../chat/ChatLoad";
import ChatSettings         from "../chat/ChatSettings/ChatSettings";
import ChatWindow           from "../chat/ChatWindow/ChatWindow";
import ChatImageCarousel    from "../chat/ChatImageCarousel";
import ChatCall             from "../chat/ChatCall/ChatCall";
import MobileErrorWindow    from "../chat/MobileErrorWindow";
import { SocketContext }    from "../components/Socket";

import { postRequest, errorManagement } from "../api/api";


import { socketTyping, socketRemove, socketMessage, socketExit, socketJoin, socketConnect } from "../api/socketRoutes";
import { callInit, callJoin } from "../api/callSocketRoutes";

export default function Index(){
    const socket = useContext(SocketContext)
    const locale = useLocale()
    const router = useRouter();
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const isMobile = useSelector((state) => state.chatReducer.value.isMobile)
    const chat = useSelector((state) => state.chatReducer.value.chat)

    //ERROR, either false or an object. If object, it holds value in ERROR.PURPOSE.
    //This is displayed in the error window that appear on top
    const ERROR = useSelector((state) => state.chatReducer.value.ERROR)

    //Chat Window States
    const chat_window = useSelector((state) => state.chatReducer.value.chat_window) //Data for the purpose behind popup Window
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window) //true or false

    const inputRef = useRef();

    const [width, setWidth] = useState()
    const [isMore, setIsMore] = useState(false)
    const [access, setAccess] = useState(false)
    const [chats, setChats] = useState([]) //One object per conversation for ChatSideMenu
    const [counter, setCounter] = useState() //the id of the other person

    //Video call or audio call settings
    const [isIncoming, setIsIncoming] = useState(null);
    const [isOutgoing, setIsOutgoing] = useState(null);
    const [stream, setStream] = useState();
    const [peerStream, setPeerStream] = useState();

    useEffect(() => {
        if(USER_DATA){
            socket.connect()

            socket.on('connect', () => {
                socket.emit('join', USER_DATA.account_id)
            })

            socket.on('message', socketMessage)
            socket.on('typing', socketTyping)
            socket.on('remove', socketRemove)
            socket.on('group-exit', socketExit)
            socket.on('group-join', socketJoin)

            //Call routes
            socket.on('call-init', callInit)
            socket.on('call-join', callJoin)
        }

        return(() => {
            socket.removeAllListeners()
            socket.disconnect()
        })
    }, [USER_DATA])

    //Retrives conversation based on current
    //Current is an object, and id is used to retrieve conversation data
    useEffect(() => {
        if(current && USER_DATA){
            if(chat && chat.length > 0){
                if(chat[0].id !== current.id){
                    postRequest('chat/chat', {chat_id: current.id})
                    .then((response) => {
                        dispatch(chatReducer({
                            chat: response.reverse(),
                            chat_settings: current.settings,
                            filesAndMedia: current.files,
                        }))
                    })
                    .catch((err) => {
                        errorManagement(err)
                    })
                }
            } else {
                postRequest('chat/chat', {chat_id: current.id})
                .then((response) => {
                    dispatch(chatReducer({
                        chat: response.reverse(),
                        chat_settings: current.settings,
                        filesAndMedia: current.files,
                    }))
                })
                .catch((err) => {
                    errorManagement(err)
                })
            }

            dispatch(chatReducer({COUNTER_DATA: current.members.filter((e) => e.id !== USER_DATA.account_id)}))
        }
    }, [current])

    useEffect(() => {
        //window.scrollTo({ top: 0, behavior: "smooth" }); <-- is this needed?
        if (localStorage.getItem('user')) {
            var user = JSON.parse(localStorage.getItem('user'))

            postRequest('accounts', {
                account: user.id,
                username: user.username
            })
            .then((response) =>{
                setAccess(true)
                getHistory();
                dispatch(objectAdd({key: 'USER_DATA', value: response}))
            })
            .catch((err) => {
              console.log(err)
              setTimeout(() => {
                router.push("/login/")
              }, 3000)
            })
        } else {
          router.push("/login/");
        }

    }, [])

    useEffect(() => {
        window.addEventListener('resize', resize)

        return(() => {
            window.removeEventListener('resize', resize)
        })
    }, [isMobile])

    function resize(){
        var width = window.innerWidth

        if(width > 1100 && isMobile){
            dispatch(chatReducer({
                isMobile: false
            }))
        } else if(width < 1100 && !isMobile){
            dispatch(chatReducer({
                isMobile: true
            }))
        }
    }

    //Get conversations
    function getHistory(){
        postRequest('chat', {id: JSON.parse(localStorage.getItem('user')).id})
        .then((response) => {
            response.map((e) => {
                e.members = JSON.parse(e.members)
                e.settings = JSON.parse(e.settings)
                e.files = JSON.parse(e.files)
                e.recent_message = JSON.parse(e.recent_message)
                e.roles ? e.roles = JSON.parse(e.roles) : null
            })
            dispatch(chatReducer({
                chats: response,
                current: response[0]
            }))  
        })
        .catch((err) => {
            errorManagement(err)
        })
    }



    return(
        <>
            <Head>
                <meta name="viewport" content="width=device-width" />
                <meta name="description" content="Webbutvecklare" />
                <meta name="author" content="Patrick Tannoury" />
                <meta name="robots" content="index, follow" />
                <meta property="og:url" content="https://codenoury.se" />
                <meta property="og:description" content={locale !== "sv" ? "Personalised Web development" : "Personlig Webbutveckling"}/>
                <meta property="og:image" content="https://codenoury.se/assets/og_image.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="https://codenoury.se/assets/favicon-16x16.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="https://codenoury.se/assets/favicon-32x32.png"/>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
                <title>{`Risala | Codenoury`}</title>
            </Head>
                <MobileErrorWindow
                    style={isMobile ? {display: 'block'} : null}
                    locale={locale}
                />
                <div 
                    className="chat"
                    user_id={USER_DATA.account_id}
                    style={isChat_window ? {filter: "blur(2px)"} : isMobile ? { display: 'none'} : null}
                >
                    <ChatNavbar 
                        USER_DATA={USER_DATA} 
                        locale={locale}
                    />
                    {
                        (access === true) ? 
                        <div className="chat-wrapper">
                            <ChatSideMenu socket={socket} />
                            <div 
                                className="chat-main"
                                style={{width: `${width}px`}}
                            >
                                <ChatTop 
                                    setWidth={setWidth}
                                    socket={socket}
                                />
                                <ChatDisplay 
                                    socket={socket}
                                    inputRef={inputRef}
                                    chat={chat}
                                    locale={locale}
                                    current={current}
                                    USER_DATA={USER_DATA}
                                />
                                <ChatBottom 
                                    socket={socket}
                                    inputRef={inputRef}
                                />
                            </div>
                            <ChatSettings 
                                locale={locale}
                                current={current}
                                USER_DATA={USER_DATA}
                            />
                        </div>
                        :
                        <div className="chat-wrapper">
                            <ChatLoad/>
                        </div>
                    }
                    <ChatCall
                        socket={socket}
                        locale={locale}
                        current={current}
                        USER_DATA={USER_DATA}
                        inputRef={inputRef}
                    />
                </div>
                <ChatWindow
                    socket={socket}
                    locale={locale}
                />
                <ChatImageCarousel />
                <div className={ERROR === false ? "error-window" : "error-window appear"}>
                    <i className="material-icons">error</i>
                    <span>{ERROR.PURPOSE}</span>
                </div>
        </>
    )
}