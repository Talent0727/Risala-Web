import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import getCurrentTime from "../../../modules/time";
import { v4 as uuidv4 } from "uuid";

export default function BugReport({ closeWindow, locale }){
    const dispatch = useDispatch();
    const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
    const [approved, setApproved] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const textAreaRef = useRef(null)

    function submitBug(){
        setLoading(true)
        postRequest('error/bug', {
            id: uuidv4(),
            user_id: USER_DATA.account_id, 
            text: textAreaRef.current.value,
            date: getCurrentTime()
        })
        .then((response) => {
            setLoading(false)
            setApproved(false)
            setSubmitted(true)
        })
        .catch((err) => {
            //errorManagement(err)
        })
    }

    function textAreaTyping(e){
        var textValue = e.target.value;
        var textWithoutSpaces = textValue.split("\n").find(e => e !== '') //Checks if text only is made of spaces, is true if not, else is false
        
        if(textValue.length > 0 && textWithoutSpaces){
            setApproved(true)
        } else {
            setApproved(false)
        }
    }

    return(
        <>
            <div className="chat-dynamic-popup-top bug-report">
                <h2>
                    {locale === "en" ? "Report a Bug" : "Bugrapportering"}
                </h2>
                <div 
                  className="popup-close"
                  onClick={closeWindow}
                >
                  <i className="material-icons">close</i>
                </div>
            </div>
            <div className="popup-main bug-report">
                {
                    !submitted ?
                    <>
                        <label>Reporter</label>
                        <div className="user-info">
                            <figure>
                                <img src={USER_DATA.profile_picture ? USER_DATA.profile_picture : "https://codenoury.se/assets/generic-profile-picture.png"}/>
                            </figure>
                            <span>{`${USER_DATA.firstname} ${USER_DATA.lastname}`}</span>
                        </div>
                        <label>Description</label>
                        <textarea 
                            ref={textAreaRef}
                            onChange={textAreaTyping}
                        />
                    </>
                    :
                    <>
                        <span>
                            Your report has successfully been reported. The administrator will review this report shortly, and eventually reach out to you if any questions would arise. 
                            <br></br><br></br>
                            Thank you, you may close the window now.
                        </span>
                    </>
                }
            </div>
            <div className="button-wrapper">
                <button 
                    className="button-cancel" 
                    onClick={closeWindow}
                    style={{margin: "0px", width: "150px"}}
                >
                    { locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                <button
                    className={approved ? "button button-yellow-square confirm" : "button button-yellow-square deactivated"}
                    onClick={approved ? submitBug : null}
                    style={{margin: "0px", width: "150px"}}
                >
                    {
                      !loading ?
                      <>{locale === "en" ? "Confirm" : "Bekfräfta"}</>
                      :
                      <div className="lds-dual-ring"></div>
                    }
                </button>
            </div>
        </>
    )
}