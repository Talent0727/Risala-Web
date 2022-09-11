import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { chatReducer, arrayAdd } from "../features/chat"

export default function InformationWindow({}){
    const dispatch = useDispatch()
    const MESSAGES = useSelector((state) => state.chatReducer.value.MESSAGES)

    useEffect(() => {
        const observer = new MutationObserver(mutationObserver);
        initiateObserve(observer)

        return(() => {
            observer.disconnect()
        })
    }, [])

    function test(){
        var messages = [
            {purpose: 'error', message: "ERROR!!!!"},
            {purpose: 'error', message: "Connection error :("},
            {purpose: 'information', message: "Welcome to Risala!"}
        ]

        dispatch(chatReducer({
            MESSAGES: messages
        }))
    }

    function mutationObserver(mutation){
        mutation.forEach((newMessage) => {
            if(newMessage.type === "childList"){
                if(newMessage.addedNodes.length === 1){
                    var element = newMessage.addedNodes[0]
                    var index = parseInt(element.getAttribute('data-index'))

                    setTimeout(() => {
                        removeMessage(index)
                    }, 8000);
                }
                console.log(newMessage.addedNodes[0])
            }
        })
    }

    function initiateObserve(observer){
        observer.observe(document.querySelector('.message-information-wrapper'), { attributes: true, childList: true, subtree: true })
    }

    function removeMessage(index){
        var newMessage = [...MESSAGES].filter((e,i) => i !== index);
        dispatch(chatReducer({
            MESSAGES: newMessage
        }))
    }

    return(
        <div className="message-information-wrapper">
            {
                MESSAGES &&
                MESSAGES.map((value, index, array) => {
                    if(value.purpose === "error"){
                        return(
                            <div 
                                className="error-window"
                                data-index={index}
                                key={index + value}
                            >
                                <i className="material-icons">error</i>
                                <span>{value.message}</span>
                            </div>
                        )
                    } else if(value.purpose === "information") {
                        return(
                            <div 
                                className="message-window"
                                data-index={index}
                                key={index + value}
                            >
                                <i className="material-icons">info</i>
                                <span>{value.message}</span>
                            </div>
                        )
                    }
                })
            }
        </div>
    )
}