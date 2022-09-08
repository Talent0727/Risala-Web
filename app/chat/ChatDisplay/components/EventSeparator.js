import React from "react";
import { useSelector, useDispatch } from "react-redux";

export default function EventSeparator({ value, index, locale }){
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const current = useSelector((state) => state.chatReducer.value.current)

    var changer = undefined; //Who changed
    var nickname = value.text; //The nickname applied
    var originalName = undefined; //The original name, diregards of nickname
    var members = current.members.filter((e) => e.id !== USER_DATA.account_id)

    var only_emoji = removeEmojis(value.text)
    function removeEmojis(str){
        var emojiRE = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
        return str.replace(emojiRE, '')
    }

    if(value.id === current.id && value.time_separator === 2){

        if(only_emoji === "" && value.reciever_id === current.id){
            if(value.sender_id === USER_DATA.account_id){
                changer = locale === "en" ? "You" : "Du"
            } else if (current.members.find((e) => e.id === value.sender_id)) {
                changer = current.members.find((e) => e.id === value.sender_id).firstname
            } else {
                changer = "Participant"
            }

            return (
                <>
                    <li className="separator change" message_id={value.message_id}>
                        {
                            locale === "en" ?
                            `${changer} have choosen the emoji ${value.text}`
                            :
                            `${changer} har valt emojin ${value.text}`
                        }
                    </li>
                </>
            )
        } else if(value.text === "Admin") {
            return (
                <>
                    <li className="separator change" message_id={value.message_id}>
                        {
                            locale === "en" ?
                            `${value.reciever_id} is now the admin of the group`
                            :
                            `${value.reciever_id} är nu gruppadministratör`
                        }
                    </li>
                </>
            )
        } else if (value.text === "Removed"){

            if(value.sender_id === USER_DATA.account_id){
                changer = locale === "en" ? "You" : "Du"
            } else {
                if(current.members.filter((e) => e.id === value.sender_id)[0]){
                    changer = current.members.filter((e) => e.id === value.sender_id)[0].firstname
                } else {
                    changer = value.reciever_id
                }
            }
            return (
                <>
                    <li className="separator change" message_id={value.message_id}>
                        {
                            locale === "en" ?
                            `${changer} removed ${value.reciever_id} from the group`
                            :
                            `${changer} har gett ${value.reciever_id} smeknamnet ${nickname}`
                        }
                    </li>
                </>
            )
        } else if (value.text === "Added"){
            if(value.sender_id === USER_DATA.account_id){
                changer = locale === "en" ? "You" : "Du"
            } else if(current.members.find((e) => e.id === value.sender_id)){
                changer = current.members.find(e => e.id === value.sender_id).firstname
            } else {
                changer = "Participant"
            }

            if(current.members.find(e => e.id === value.reciever_id)){
                var reciever = current.members.find(e => e.id === value.reciever_id).firstname
            } else {
                var reciever = "Participant"
            }
            

            return (
                <>
                    <li 
                        className="separator change" 
                        message_id={value.message_id}  
                    >
                        {
                            locale === "en" ?
                            `${changer} added ${reciever} to the group`
                            :
                            `${changer} har gett ${reciever} smeknamnet ${nickname}`
                        }
                    </li>
                </>
            )
        } else if (value.reciever_id === current.id) {
            if(value.sender_id === USER_DATA.account_id){
                changer = locale === "en" ? "You" : "Du"
            } else if(current.members.find(e => e.id === value.sender_id)) {
                changer = current.members.find(e => e.id === value.sender_id).firstname
            } else {
                changer = "Participant"
            }

            return (
                <>
                    <li 
                        className="separator change" 
                        message_id={value.message_id}
                    >
                        {
                            locale === "en" ?
                            `${changer} changed the group name to ${value.text}`
                            :
                            `${changer} ändrade gruppnamnet till ${value.text}`
                        }
                    </li>
                </>
            )

        } else {
            if(value.sender_id === USER_DATA.account_id){
                changer = locale === "en" ? "You" : "Du"
            } else {
                changer = current.members.filter((e) => e.id === value.sender_id)[0].firstname
            }
        
            if(value.reciever_id === USER_DATA.account_id){
                originalName = `${USER_DATA.firstname} ${USER_DATA.lastname}`
            } else if(current.members) {
                var array = current.members.filter(e => e.id === value.reciever_id)[0]
                if(array){
                    originalName = `${array.firstname} ${array.lastname}`
                }
            }
        
            return (
                <>
                    <li 
                        className="separator change" 
                        message_id={value.message_id}
                    >
                        {
                            locale === "en" ?
                            `${changer} have given ${originalName} the nickname ${nickname}`
                            :
                            `${changer} har gett ${originalName} smeknamnet ${nickname}`
                        }
                    </li>
                </>
            )
        }

    } else if(value.time_separator === 3) {
        try {
            var changer = current.members.find(e => e.id === value.sender_id).firstname
        } catch {
            var changer = "Participant"
        }
        
        return (
            <>
                <li 
                    className="separator change" 
                    message_id={value.message_id}
                >
                    <span>
                    {
                        locale === "en" ?
                        `${changer} has changed the theme to`
                        :
                        `${changer} har ändrat färgtemat till`
                    }
                    </span>
                    <div className="color-palette" style={{backgroundColor: `${value.text}`}}></div>
                </li>
            </>
        )
    } else {
        return null
    }
}