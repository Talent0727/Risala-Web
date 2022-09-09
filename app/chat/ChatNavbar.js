import React, { useState, useEffect } from "react";
import Link from "next/link";
import { eraseCookie } from "../modules/cookie"
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../features/chat";
import { postRequest, errorManagement } from "../api/api";

export default function ChatNavbar({USER_DATA, locale}){
    const dispatch = useDispatch();
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window)
    const chat_window = useSelector((state) => state.chatReducer.value.chat_window)
    const router = useRouter()
    const [isListening, setIsListening] = useState(false)
    const [popUp, setPopUp] = useState({
        visible: false,
        clientX: undefined,
        clientY: undefined
    })

    useEffect(() => {
        const chat = document.querySelector('.chat')
        if(popUp.visible && !isListening){
            setIsListening(true)
            chat.addEventListener('click', popUpClick)
        } else if(!popUp.visible && isListening){
            chat.removeEventListener('click', popUpClick)
        }

        return(() => {
            if(popUp.visible && isListening){
                chat.removeEventListener('click', popUpClick)
            }
        })
    }, [popUp.visible, isListening])

    function popUpClick(e){
        const navbarPopup = document.querySelector('.navbarPopup')
        const userWrapper = document.querySelector('.user-wrapper')

        if(navbarPopup && userWrapper){
            if(!navbarPopup.contains(e.target) && !userWrapper.contains(e.target)){
                setPopUp({
                    visible: false,
                    clientX: undefined,
                    clientY: undefined
                })
            }
        }

    }

    function navbarPopup(e){
        setPopUp({
            visible: !popUp.visible,
            clientX: (window.innerWidth - 220),
            clientY: e.clientY
        })
    }

    if(USER_DATA){
        return(
            <div className="chat-navbar">
                <Link href={locale === "sv" ? "/sv" : "/"}>
                  <a className='desktop-logo'>
                    <img src="https://codenoury.se/assets/logo-long-yellow.svg" alt="codenoury-logo"/>
                  </a>
                </Link>
                <div className="navbar-options">
                    <Link href="https://github.com/pannoury/Risala-Web">
                        <a style={{fill: '#fff'}} target="_blank" rel="noopener noreferrer">
                            <svg aria-hidden="true" height="24" viewBox="0 0 16 16" version="1.1" width="24" data-view-component="true" className="octicon octicon-mark-github"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                        </a>
                    </Link>
                </div>
                <div 
                    className="user-wrapper"
                    onClick={navbarPopup}
                >
                    {
                        USER_DATA.account_id &&
                        <>
                            <figure>
                                <img src={USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                            </figure>
                            <span>
                                {USER_DATA.firstname + ' ' + USER_DATA.lastname}
                            </span>
                        </>
                    }
                </div>
                {
                    popUp.visible &&
                    <div 
                        className="navbarPopup"
                        style={{top: `60px`, left: `${popUp.clientX}px`}}
                    >
                        <ul>
                            <li onClick={(() => {
                                    dispatch(chatReducer({
                                        isChat_window: true,
                                        chat_window: {purpose: "bug_report"}
                                    }))
                                })}
                            >
                                <i className="material-icons">bug_report</i>
                                Bug reporting
                            </li>
                            <li onClick={(() => {
                                dispatch(chatReducer({
                                    isChat_window: true,
                                    chat_window: {purpose: "settings"}
                                }))
                            })}>
                                <i className="material-icons">settings</i>
                                Settings
                            </li>
                            <li
                                onClick={(() => {
                                    localStorage.removeItem('user')
                                    router.push("/login/")
                                })}
                            >
                                <i className="material-icons">logout</i>
                                Log out
                            </li>
                        </ul>
                    </div>
                }
            </div>
        )
    } else {
        return(
            <div className="chat-navbar">

            </div>
        )
    }

}