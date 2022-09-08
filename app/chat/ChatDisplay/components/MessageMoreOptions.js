import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";

export default function MessageMoreOptions({ sent, inputRef }){
    const dispatch = useDispatch();
    const current = useSelector((state) => state.chatReducer.value.current)
    const reply = useSelector((state) => state.chatReducer.value.reply)
    const COUNTER_DATA = useSelector((state) => state.chatReducer.value.COUNTER_DATA)
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const moreOptions = useSelector((state) => state.chatReducer.value.moreOptions)

    /*
    This function is triggered when more options is selected, more precisely it is crucial for both
    REPLY and MORE OPTIONS. This means that the data is collected here, and is a necessity for the other functions
    dependent on reply or more options data. 
    */
    function optionSelect(e){
        //console.log(COUNTER_DATA, USER_DATA)

        var classNames = e.currentTarget.classList[0]
        var target = e.currentTarget.parentElement.parentElement
        let object = null;

        if(classNames === "reply"){
            //console.log(e.currentTarget.parentElement.parentElement.parentElement.classList[0])
            //console.log(USER_DATA)
            if(target.querySelector('.message')){
                var text = target.querySelector('.message').textContent
                //console.log(target.parentElement.parentElement.getAttribute('user_id'))
            } else {

                // This is triggered if a file/media is being replied to
                var files = target.querySelector('.file-wrapper')
                var figures = target.querySelectorAll('figure')

                if(files !== null){ // User is replying to a file and not a media (video || image)
                    var text = [files.getAttribute('href')]
                    object = 'file'
                    //console.log(files)

                } else if(figures.length === 1){
                    if(figures[0].classList[0] === "video"){
                        var text = [figures[0].querySelector('video').getAttribute('src')]
                        object = "video"
                    } else {
                        var text = [figures[0].querySelector('img').getAttribute('src')]
                        object = "image"
                    }
                    
                } else {
                    var text = [];
                    for(let i = 0; i < figures.length; i++){
                        if(figures[i].classList[0] === "video"){
                            text.push(figures[i].querySelector('video').getAttribute('src'))
                            object = "video"
                        } else {
                            text.push(figures[i].querySelector('img').getAttribute('src'))
                            object = "image"
                        }
                    }
                }

                var text = JSON.stringify(text)
            }

            //Selecting a sent-message (has to be yours)
            if(target.parentElement.classList[0] === "sent-message"){
                if(target.parentElement.getAttribute('message_id')){
                    var message_id = target.parentElement.getAttribute('message_id')
                } else {
                    var message_id = target.parentElement.parentElement.getAttribute('message_id')
                }

                dispatch(chatReducer({
                    reply: {
                        reply: true,
                        text: text,
                        replying_to_name: USER_DATA.firstname,
                        replying_to_id: USER_DATA.account_id,
                        message_id: message_id,
                        type: object
                    }

                }))
            } else {
                console.log(target.parentElement.parentElement.getAttribute('message_id'))

                //Chat is a group chat
                if(current.members.length > 2){
                    var userID = target.parentElement.parentElement.getAttribute('user_id')
                    //console.log(current.members.filter(e => e.id === userID)[0])
                    dispatch(chatReducer({
                        reply: {
                            reply: true,
                            text: text,
                            replying_to_name: current.members.filter(e => e.id === userID)[0].firstname,
                            replying_to_id: target.parentElement.parentElement.getAttribute('user_id'),
                            message_id: target.parentElement.parentElement.getAttribute('message_id'),
                            type: object
                        }
                        
                    }))
                } else {
                    if(target.parentElement.getAttribute('message_id')){
                        var message_id = target.parentElement.getAttribute('message_id')
                    } else {
                        var message_id = target.parentElement.parentElement.getAttribute('message_id')
                    }

                    dispatch(
                        chatReducer({
                            reply: {
                                reply: true,
                                text: text,
                                replying_to_name: COUNTER_DATA[0].firstname,
                                replying_to_id: COUNTER_DATA[0].id,
                                message_id: message_id,
                                type: object
                            }
                        })
                    )
                }
            }

            inputRef.current.focus();
            
        } else if(classNames === "more-options"){
            //console.log(target)
            if(target.parentElement.getAttribute('message_id')){
                var message_id = target.parentElement.getAttribute('message_id')
            } else {
                var message_id = target.parentElement.parentElement.getAttribute('message_id')
            }
            //console.log(target.parentElement, target.parentElement.parentElement)
            //console.log(message_id)

            dispatch(chatReducer({
                moreOptions: {
                    visible: true,
                    top: e.currentTarget.getBoundingClientRect().top,
                    left: (e.currentTarget.getBoundingClientRect().left - (e.currentTarget.clientWidth + 20)),
                    message_id: message_id,
                }
            }))
        }
    }


    return(
        <div className="message-options">
            {
                sent ?
                <>
                    <div className="reply" onClick={optionSelect}>
                        <svg  x="0px" y="0px" width="48.8px" height="46.3px" viewBox="0 0 48.8 46.3">
                            <path d="M17.4,24.1c0,0.2,0,0.3,0,0.5c0,2.3,0,4.6,0,6.8c0,1.2-0.9,2-2,1.9c-0.4-0.1-0.8-0.3-1.1-0.6
                            c-1.6-1.7-3.2-3.4-4.8-5.1c-3-3.2-5.9-6.3-8.9-9.5c-0.6-0.6-0.8-1.3-0.5-2.1c0.1-0.3,0.3-0.5,0.5-0.7c4.6-4.9,9.2-9.8,13.8-14.6
                            c0.6-0.6,1.3-0.8,2-0.5c0.7,0.4,1.1,1,1.1,1.8c0,2.3,0,4.6,0,6.8c0,0.1,0,0.3,0,0.4c0.1,0,0.3,0,0.4,0c3,0,5.9,0,8.9,0.1
                            c3.4,0.1,6.8,0.7,10.1,1.8c2.7,1,5.2,2.3,7.2,4.5c2.1,2.2,3.4,4.9,4,7.9c0.5,2.5,0.7,5,0.7,7.5c-0.1,2.1-0.5,4.1-1.1,6
                            c-0.8,2.8-1.9,5.4-3,8c-0.1,0.3-0.3,0.5-0.4,0.7c-0.3,0.4-0.6,0.5-1,0.3c-0.3-0.1-0.6-0.5-0.6-0.9c0-0.6,0.1-1.1,0.1-1.7
                            c0.2-3,0.2-6-0.5-9c-0.5-2.1-1.2-4.1-2.7-5.8c-1.8-1.9-3.9-3.1-6.4-3.8c-2.1-0.5-4.2-0.9-6.4-0.9c-3.1-0.1-6.1-0.1-9.2-0.1
                            C17.6,24.1,17.6,24.1,17.4,24.1z"/>
                        </svg>
                    </div>
                    <div className="more-options" onClick={optionSelect}> 
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M12 20Q11.175 20 10.588 19.413Q10 18.825 10 18Q10 17.175 10.588 16.587Q11.175 16 12 16Q12.825 16 13.413 16.587Q14 17.175 14 18Q14 18.825 13.413 19.413Q12.825 20 12 20ZM12 14Q11.175 14 10.588 13.412Q10 12.825 10 12Q10 11.175 10.588 10.587Q11.175 10 12 10Q12.825 10 13.413 10.587Q14 11.175 14 12Q14 12.825 13.413 13.412Q12.825 14 12 14ZM12 8Q11.175 8 10.588 7.412Q10 6.825 10 6Q10 5.175 10.588 4.588Q11.175 4 12 4Q12.825 4 13.413 4.588Q14 5.175 14 6Q14 6.825 13.413 7.412Q12.825 8 12 8Z"/></svg>
                    </div>
                </>
                :
                <>
                    <div className="more-options" onClick={optionSelect}> 
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M12 20Q11.175 20 10.588 19.413Q10 18.825 10 18Q10 17.175 10.588 16.587Q11.175 16 12 16Q12.825 16 13.413 16.587Q14 17.175 14 18Q14 18.825 13.413 19.413Q12.825 20 12 20ZM12 14Q11.175 14 10.588 13.412Q10 12.825 10 12Q10 11.175 10.588 10.587Q11.175 10 12 10Q12.825 10 13.413 10.587Q14 11.175 14 12Q14 12.825 13.413 13.412Q12.825 14 12 14ZM12 8Q11.175 8 10.588 7.412Q10 6.825 10 6Q10 5.175 10.588 4.588Q11.175 4 12 4Q12.825 4 13.413 4.588Q14 5.175 14 6Q14 6.825 13.413 7.412Q12.825 8 12 8Z"/></svg>
                    </div>
                    <div className="reply" onClick={optionSelect}>
                        <svg  x="0px" y="0px" width="48.8px" height="46.3px" viewBox="0 0 48.8 46.3">
                            <path d="M17.4,24.1c0,0.2,0,0.3,0,0.5c0,2.3,0,4.6,0,6.8c0,1.2-0.9,2-2,1.9c-0.4-0.1-0.8-0.3-1.1-0.6
                            c-1.6-1.7-3.2-3.4-4.8-5.1c-3-3.2-5.9-6.3-8.9-9.5c-0.6-0.6-0.8-1.3-0.5-2.1c0.1-0.3,0.3-0.5,0.5-0.7c4.6-4.9,9.2-9.8,13.8-14.6
                            c0.6-0.6,1.3-0.8,2-0.5c0.7,0.4,1.1,1,1.1,1.8c0,2.3,0,4.6,0,6.8c0,0.1,0,0.3,0,0.4c0.1,0,0.3,0,0.4,0c3,0,5.9,0,8.9,0.1
                            c3.4,0.1,6.8,0.7,10.1,1.8c2.7,1,5.2,2.3,7.2,4.5c2.1,2.2,3.4,4.9,4,7.9c0.5,2.5,0.7,5,0.7,7.5c-0.1,2.1-0.5,4.1-1.1,6
                            c-0.8,2.8-1.9,5.4-3,8c-0.1,0.3-0.3,0.5-0.4,0.7c-0.3,0.4-0.6,0.5-1,0.3c-0.3-0.1-0.6-0.5-0.6-0.9c0-0.6,0.1-1.1,0.1-1.7
                            c0.2-3,0.2-6-0.5-9c-0.5-2.1-1.2-4.1-2.7-5.8c-1.8-1.9-3.9-3.1-6.4-3.8c-2.1-0.5-4.2-0.9-6.4-0.9c-3.1-0.1-6.1-0.1-9.2-0.1
                            C17.6,24.1,17.6,24.1,17.4,24.1z"/>
                        </svg>
                    </div>
                </>
            }
        </div>
    )
}