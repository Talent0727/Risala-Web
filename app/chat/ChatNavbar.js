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