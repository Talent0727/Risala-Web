import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../features/chat";
import fileSizeFormatter from "../../modules/fileSizeFormatter";

//Components
import GroupMembers from "./GroupMembers";

export default function ChatSettings({ locale, current, USER_DATA }){
    const dispatch = useDispatch();
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const chat_settings = useSelector((state) => state.chatReducer.value.chat_settings)
    const settings = useSelector((state) => state.chatReducer.value.settings)
    const selectedUser = useSelector((state) => state.chatReducer.value.selectedUser)
    const filesAndMedia = useSelector((state) => state.chatReducer.value.filesAndMedia)

    const chat_window = useSelector((state) => state.chatReducer.value.chat_window) //Data for the purpose behind popup Window
    const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window) //true or false

    //Media & Files states
    const [isMediaFiles, setMediaFiles] = useState(false)
    const [mediaFilesPurpose, setMediaFilesPurpose] = useState(undefined)
    
    const [isLoading, setLoading] = useState(true)
    const [group, setGroup] = useState(undefined)
    const [alias, setAlias] = useState(undefined)
    const [options, setOptions] = useState(undefined)
    const [optionSettings, setOptionsSetting] = useState(undefined) //Unclear usage
    const [nickname, setNickname] = useState(undefined);

    //Group Member States
    const [selected, setSelected] = useState(undefined) //<-- This is for Group Member selection
    const [admin, setAdmin] = useState(false)
    const [isSelf, setIsSelf] = useState(false)

    const videoExtension = ['mkv', 'mp4', 'mpe', 'mpeg', 'mpeg4', 'mpeg-4']

    useEffect(() => {

        //If current is a group, then find group and store the values
        if(current && COUNTER_DATA){
            if(current.members.length > 2){
                var members = [...current.members].filter((e) => e.id !== USER_DATA.account_id)
                setGroup(members)
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
        } else {
            setGroup(undefined)
        }
    }, [current, COUNTER_DATA])

    useEffect(() => {
        if(options){
            console.log(options)
            window.addEventListener('click', windowClick)
        } else {
            window.removeEventListener('click', windowClick)
        }

        return(() => {
            window.removeEventListener('click', windowClick)
        })
    }, [options])

    useEffect(() => {
        if(selected && USER_DATA){
            if((selected.id === USER_DATA.account_id) || (selected.account_id === USER_DATA.account_id)){
                setIsSelf(true)
            } else {
                setIsSelf(false)
            }
            dispatch(chatReducer({
                selectedUser: selected
            }))
        } else {
            setIsSelf(false)
        }
    }, [selected])

    //Fixed
    function windowClick(e){
        var optionsWindow = document.querySelector('.member-settings')
        if((!e.target.classList.contains('material-icons') && !e.target.parentElement.classList.contains('member-options')) && !e.target.classList.contains('member-options')){
            if(!optionsWindow.contains(e.target)){
                setOptions(undefined)
            }
        }
    }
    
    function settingsOptionClick(e){
        e.currentTarget.parentElement.classList.toggle('expanded')
    }

    function chatWindow(e){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {purpose: e}
        }))
    }
    
    function makeAdmin(){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {
                purpose: "change_admin"
            }
        }))
    }

    function removeUser(){
        dispatch(chatReducer({
            isChat_window: true,
            chat_window: {
                purpose: 'remove_member'
            }
        }))
    }

    function leaveChat(){
        dispatch(chatReducer({
            chat_window: { 
                purpose: 'remove_member'
            },
            isChat_window: true
        }))
        setSelected(USER_DATA)
    }

    return(
        <>
            {
                current &&
                <div className={settings === true ? "chat-settings visible" : "chat-settings"}>
                {
                    (isMediaFiles && mediaFilesPurpose && !isLoading) &&
                    <MediaAndFilesWindow/>
                }
                {
                    (!isMediaFiles && !mediaFilesPurpose && !isLoading) &&
                    <>
                        <div className="conversation-overview">
                            {
                                group ?
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
                                :
                                <>
                                {
                                    COUNTER_DATA &&
                                    <>
                                        <figure>
                                            <img src={(current.members && current.members.length > 0) ? COUNTER_DATA[0].profile_picture ? COUNTER_DATA[0].profile_picture : "https://codenoury.se/assets/generic-profile-picture.png" : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                                        </figure>
                                        {
                                            nickname ?
                                            <span>{nickname}</span>
                                            :
                                            <span>{ (current.members && current.members.length > 0) ? COUNTER_DATA[0].firstname + ' ' + COUNTER_DATA[0].lastname : "Participant"}</span>
                                        }
                                    </>
                                }
                                </>
                            }
                        </div>
                        <div className="settings-list">
                            <CustomiseChat/>
                            <MediaAndFilesDropDown/>
                            {
                                group && group !== undefined &&
                                <>
                                    <GroupMembers
                                        admin={admin}
                                        setAdmin={setAdmin}
                                        options={options}
                                        setOptions={setOptions}
                                        group={group}
                                        selected={selected}
                                        setSelected={setSelected}
                                    />
                                    <div className="options-wrapper-wrapper">
                                        <div 
                                            onClick={leaveChat}
                                            className="settings-option"
                                        >
                                            <i className="material-icons">logout</i>
                                            <span>{locale === "en" ? "Leave Chat" : "Lämna chat"}</span>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </>
                }
                {
                    isLoading &&
                    <div>

                    </div>
                }
                {
                    options &&
                    <div 
                        className="member-settings"
                        style={{top: `${options + 20}px`}}
                    >
                        <span>
                            {locale === "en" ? "Send a message" : "Skicka meddelande"}
                        </span>
                        {
                            admin &&
                            <>
                            <div className="line"></div>
                                <span
                                    onClick={makeAdmin}
                                >
                                    {locale === "en" ? "Make admin" : "Gör till administratör"}
                                </span>
                                {
                                    isSelf ?
                                    <span
                                        onClick={removeUser}
                                    >
                                        {locale === "en" ? "Leave Group" : "Lämna Gruppen"}
                                    </span>
                                    :
                                    <span 
                                        onClick={removeUser}
                                    >
                                        {locale === "en" ? "Remove member" : "Ta bort medlem"}
                                    </span>
                                }
                            </>
                        }
                        {
                            isSelf && !admin &&
                            <>
                                <div className="line"></div>
                                <span
                                    onClick={removeUser}
                                >
                                    {locale === "en" ? "Leave Group" : "Lämna Gruppen"}
                                </span>
                            </>
                        }
                    </div>
                }
                </div>
            }
        </>
    )

    function MediaAndFilesWindow(){
        const selectedMenu = {
            backgroundColor: chat_settings.color
        }

        function fileClick(e){
            dispatch(chatReducer({
                imageCarousel: {
                    images: filesAndMedia.images,
                    selected: e
                }
            }))
        }

        return(
            <>
                <div  className="media-files-top">
                    <i 
                        className="material-icons"
                        onClick={(() => {
                            setMediaFiles(false)
                            setMediaFilesPurpose(undefined)
                        })}
                    >keyboard_backspace</i>
                    {locale === "en" ? "Media and Files" : "Media och Filer"}
                </div>
                <div className="media-files-selection">
                    <div 
                        className={mediaFilesPurpose === "media" ? "media-files-option selected" : "media-files-option"} 
                        data-value="media"
                        style={mediaFilesPurpose === "media" ? selectedMenu : null}
                        onClick={(() => {
                            setMediaFilesPurpose("media")
                        })}
                    >
                        Media
                    </div>
                    <div 
                        className={mediaFilesPurpose === "files" ? "media-files-option selected" : "media-files-option"} 
                        data-value="files"
                        style={mediaFilesPurpose === "files" ? selectedMenu : null}
                        onClick={(() => {
                            setMediaFilesPurpose("files")
                        })}
                    >
                        {locale === "en" ? "Files" : "Filer"}
                    </div>
                </div>
                <div className={mediaFilesPurpose === "files" ? "media-files-display files" : "media-files-display"}>
                    {
                        (filesAndMedia && mediaFilesPurpose === "media") &&
                        filesAndMedia.images.map((value, index) => {

                            var type = value.type.split('/')[0]
                            var widthStyle = document.querySelector('.chat-settings').clientWidth * 0.3

                            if(type === "image" || type === "video"){
                                if(type === "video"){
                                    return(
                                        <div 
                                            className="image"
                                            key={value.path}
                                            style={{height: `${widthStyle}px`}}
                                            onClick={(() => { fileClick(value.path) })}
                                        >
                                            <video src={`../${value.path.substring(3)}`}/>
                                        </div>
                                    )
                                } else {
                                    return(
                                        <div 
                                            className="image"
                                            key={value.path}
                                            style={{height: `${widthStyle}px`}}
                                            onClick={(() => { fileClick(value.path) })}
                                        >
                                            <img src={`../${value.path.substring(3)}`}/>
                                        </div>
                                    )
                                }
                            }
                        })
                    }
                    {
                        (filesAndMedia && mediaFilesPurpose === "files") &&
                        filesAndMedia.files.map((value, index) => {
                            var name = value.path.substring(21)
                            var fileSize = fileSizeFormatter(value.size, 2)

                            if(window.location.hostname === "localhost"){
                                return(
                                    <a 
                                        className="file-row"
                                        key={value.path}
                                        href={`../${value.path.substring(3)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                    >
                                        <i className="material-icons">description</i>
                                        <div className="file-description">
                                            <span>
                                                {name.length > 20 ? `${name.substring(0,20)}...` : name}
                                            </span>
                                            <span>{fileSize}</span>
                                        </div>
                                    </a>
                                )
                            } else{
                                return(
                                    <a 
                                        className="file-row"
                                        key={value.path}
                                        href={`https://risala.codenoury.se/${value.path.substring(3)}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                    >
                                        <i className="material-icons">description</i>
                                        <div className="file-description">
                                            <span>{name}</span>
                                            <span>{fileSize}</span>
                                        </div>
                                    </a>
                                )
                            }
                        })
                    }
                </div>
            </>
        )
    }

    //Store dropdown options
    function CustomiseChat(){
        return(
            <div className="options-wrapper-wrapper">
                <div 
                    className="options-wrapper-wrapper-header"
                    onClick={settingsOptionClick} 
                >
                    <span>{locale === "en" ? "Customise Chat" : "Anpassa Chatt"}</span>
                    <i className="material-icons more">expand_more</i>
                    <i className="material-icons less">expand_less</i>
                </div>
                <div className="options-wrapper">
                    {
                        group &&
                        <div className="settings-option" onClick={(() => { chatWindow('change_name') })}>
                            <div className="settings-color">
                                <i className="material-icons">edit</i>
                            </div>
                            <span>{locale === "en" ? "Change group name" : "Ändra Chattnamn"}</span>
                        </div>
                    }
                    <div className="settings-option" onClick={(() => { chatWindow('change_color') })}>
                        <div
                            className="settings-color" style={chat_settings.color ? {backgroundColor: chat_settings.color} : {backgroundColor: '#d39400'}}
                        >
                            <div className="dot"></div>
                        </div>
                        <span>{locale === "en" ? "Change Theme" : "Ändra Tema"}</span>
                    </div>
                    <div className="settings-option" onClick={(() => { chatWindow('change_emoji') })}>
                        {
                            chat_settings.emoji &&
                            <div className="emoji">
                                {chat_settings.emoji}
                            </div>
                        }
                        <span>{locale === "en" ? "Change Emoji" : "Byt Emoji"}</span>
                    </div>
                    <div className="settings-option" onClick={(() => { chatWindow('change_nickname') })}>
                        <div className="settings-color">
                            Aa
                        </div>
                        <span>{locale === "en" ? "Change nickname" : "Ändra Smeknamn"}</span>
                    </div>
                </div>
            </div>
        )
    }

    function MediaAndFilesDropDown(){
        return(
            <div className="options-wrapper-wrapper">
                <div 
                    className="options-wrapper-wrapper-header"
                    onClick={settingsOptionClick} 
                >
                    <span>{locale === "en" ? "Media and Files" : "Mediaobjekt och Filer"}</span>
                    <i className="material-icons more">expand_more</i>
                    <i className="material-icons less">expand_less</i>
                </div>
                <div className="options-wrapper">
                    <div 
                        className="settings-option"
                        onClick={(() => {
                            setMediaFiles(true)
                            setMediaFilesPurpose("media")
                        })}
                    >
                        <div>
                            <i className="material-icons">image</i>
                        </div>
                        <span>{locale === "en" ? "Media" : "Media"}</span>
                    </div>
                    <div 
                        className="settings-option"
                        onClick={(() => {
                            setMediaFiles(true)
                            setMediaFilesPurpose("files")
                        })}
                    >
                        <div>
                            <i className="material-icons">description</i>
                        </div>
                        <span>{locale === "en" ? "Files" : "Filer"}</span>
                    </div>
                </div>
            </div>
        )
    }
}