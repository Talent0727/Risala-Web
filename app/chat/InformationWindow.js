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

    function mutationObserver(mutation){
        mutation.forEach((newMessage) => {
            if(newMessage.type === "childList"){
                if(newMessage.addedNodes.length === 1){
                    var element = newMessage.addedNodes[0]
                    var id = parseInt(element.getAttribute('data-id'))

                    setTimeout(() => {
                        removeMessage(id)
                    }, 8000);
                }
                console.log(newMessage.addedNodes[0])
            }
        })
    }

    function initiateObserve(observer){
        observer.observe(document.querySelector('.message-information-wrapper'), { attributes: true, childList: true, subtree: true })
    }

    function removeMessage(id){
        var newMessage = [...MESSAGES].filter(e => e.id !== id);
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
                                data-id={value.id}
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
                                data-id={value.id}
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