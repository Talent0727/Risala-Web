import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatReducer } from "../../../features/chat";
import { postRequest, errorManagement } from "../../../api/api";
import Link from "next/link";

export default function Settings({ closeWindow, locale }){
  const dispatch = useDispatch();
  const isChat_window = useSelector((state) => state.chatReducer.value.isChat_window)
  const chat = useSelector((state) => state.chatReducer.value.chat)
  const current = useSelector((state) => state.chatReducer.value.current)
  const USER_DATA = useSelector((state) => state.chatReducer.value.USER_DATA)
  const selectedUser = useSelector((state) => state.chatReducer.value.selectedUser)

  const [view, setView] = useState('profile_picture')
  const [approved, setApproved] = useState(false)
  const [loading, setLoading] = useState(false)

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false)
  const [passwordApproved, setPasswordApproved] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(false)

  const [uploadSuccess, setUploadSuccess] = useState(false)

  const passwordRef = useRef();
  const repeatPassword = useRef();


  function changeProfilePicture(){
    setLoading(true)
    var formData = new FormData()
    var profile_picture = document.querySelector('.popup-main input').files[0]
    formData.append('profile_picture', profile_picture)
    formData.append('account_id', USER_DATA.account_id)

    postRequest('accounts/upload', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
    .then((response) => {
      if(response === true){
        setLoading(false)
        setApproved(false)
        setUploadSuccess(true)
        console.log(response)
      }
    })
    .catch((err) => {
      setLoading(false)
      console.log(err)
      errorManagement(err)
    })
  }

    //Password

  function passwordInput(e){
    var input = document.querySelectorAll('.popup-main input')
    var value = e.target.value

    if(value.length >= 8){
      var hasUpperCase = false;
      var hasNumber =  /\d/.test(value) ? true : false
      for (var i = 0; i < value.length; i++) {
        if(value[i] === value[i].toUpperCase()){
          hasUpperCase = true;
        }
      }

      if(hasUpperCase && hasNumber){
        setPasswordApproved(true)
        if(input[0].value === input[1].value){
            setPasswordMatch(true)
            setApproved(true)
        } else {
          setPasswordMatch(false)
          setApproved(false)
        }
      } else {
        setPasswordApproved(false)
        setApproved(false)
      }
    }
  }

  function changePassword(){
    setLoading(true)
    postRequest('accounts/change_password', {
        id: USER_DATA.account_id,
        password: document.querySelector('.popup-main input').value
    })
    .then((response) => {
        setLoading(true)
        setApproved(false)
    })
    .catch((er) => {
        setLoading(true)
        setApproved(false)
        errorManagement(err)
        console.log(err)
    })
  }

    return(
        <>
            <div className="chat-dynamic-popup-top settings" style={{justifyContent: "flex-start"}}>
              <div 
                className={view === "profile_picture" ? "settings-option selected" : "settings-option"}
                style={view === "profile_picture" ? {borderBottom: "2px solid #fff"} : null}
                onClick={(() => { setView('profile_picture') })}
              >
                Profile Picture
              </div>
              <div 
                className={view === "password" ? "settings-option selected" : "settings-option"}
                style={view === "password" ? {borderBottom: "2px solid #fff"} : null}
                onClick={(() => { setView('password') })}
              >
                Password
              </div>
              <div 
                className="popup-close"
                onClick={closeWindow}
              >
                <i className="material-icons">close</i>
              </div>
            </div>
            <div className="popup-main settings" style={{padding: "16px 10px"}}>
                {
                    view === "profile_picture" &&
                    <>
                        {
                          uploadSuccess &&
                          <>
                              <p>Profile picture was successfully uploaded!</p>
                              <span>Please refresh the page to see your new profile picture</span>
                          </>
                        }
                        <label>Profile Picture</label>
                        <input
                            type={"file"} 
                            onChange={(() => {
                                setApproved(true)
                            })}
                        ></input>
                        <Link href={USER_DATA.profile_picture ? USER_DATA.profile_picture : ""}>
                            <a target="_blank" rel="noopener noreferrer">
                              {
                                USER_DATA && USER_DATA.profile_picture &&
                                <>
                                    {USER_DATA.profile_picture.substring(11, USER_DATA.profile_picture.length)}
                                </>
                              }  
                            </a>
                        </Link>
                    </>

                }
                {
                    view === "password" &&
                    <>
                        <h2 style={{margin: "0 auto 10px auto"}}>Change your password</h2>
                        <div className="input-div">
                          <label>{locale !== "sv" ? "Password" : "Lösenord"}</label>
                          <div className="password-wrapper">
                            <input
                              id="loginpassword-input"
                              type={!passwordVisible ? "password" : "text"}
                              ref={passwordRef}
                              onChange={passwordInput}
                            ></input>
                            <span
                              className={!passwordVisible ? "untoggled" : "toggled"}
                              onClick={(() => { setPasswordVisible(!passwordVisible)})}
                            >
                              {
                                passwordVisible ?
                                <i className="material-icons">visibility</i>
                                :
                                <i className="material-icons">visibility_off</i>
                              }
                            </span>
                          </div>
                          <span style={{color: "#999"}}>Password must contain at least 8 characters with one numeric value and a uppercase letter</span>
                        </div>
                        <div className="input-div">
                          <label>{locale === "en" ? "Repeat Password" : "Repetera Lösenord"}</label>
                          <div className="password-wrapper">
                            <input
                              type={!repeatPasswordVisible ? "password" : "text"}
                              ref={repeatPassword}
                              onChange={passwordInput}
                            ></input>
                            <span
                              id="login-show-password"
                              className={!repeatPasswordVisible ? "untoggled" : "toggled"}
                              onClick={(() => { setRepeatPasswordVisible(!repeatPasswordVisible)})}
                            >
                              {
                                repeatPasswordVisible ?
                                <i className="material-icons">visibility</i>
                                :
                                <i className="material-icons">visibility_off</i>
                              }
                            </span>
                          </div>
                        </div>
                    </>
                }
            </div>
            <div className="button-wrapper">
                <button className="button-cancel" onClick={closeWindow}>
                    {locale === "en" ? "Cancel" : "Avbryt"}
                </button>
                {
                  view === "profile_picture" ?
                  <button 
                    className={approved ? "button button-yellow-square confirm" : "button button-yellow-square deactivated"}
                    style={{margin: "0px", width: "150px"}}
                    onClick={approved ? changeProfilePicture : null}
                  >
                    {
                      !loading ?
                      <>{locale === "en" ? "Confirm" : "Bekfräfta"}</>
                      :
                      <div className="lds-dual-ring"></div>
                    }
                  </button>
                  :
                  <button 
                    className={approved ? "button button-yellow-square confirm" : "button button-yellow-square deactivated"}
                    style={{margin: "0px", width: "150px"}}
                    onClick={approved ? changePassword : null}
                  >
                    {
                      !loading ?
                      <>{locale === "en" ? "Confirm" : "Bekfräfta"}</>
                      :
                      <div className="lds-dual-ring"></div>
                    }
                  </button>
                }
            </div>

        </>
    )
}