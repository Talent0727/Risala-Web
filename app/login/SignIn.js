import React, { useRef, useEffect, useState } from "react";
import useLocale from "../hooks/useLocale";
import axios from 'axios';
import Layout from "../components/layout";
import { useRouter } from "next/router";
import { errorManagement, postRequest } from "../api/api";

export default function SignIn({setSignUp, setRestore}){
    const router = useRouter();
    const locale  = useLocale()
    const accountRef = useRef(null)
    const passwordRef = useRef(null)
    const [incorrect, setIncorrect] = useState(false)
    const [maskPassword, setMaskPassword] = useState(false)

    function passwordMask(){
        maskPassword === false ? setMaskPassword(true) : setMaskPassword(false)
    }
    
    function signIn(){
        if (accountRef.current.value !== "" && passwordRef.current.value !== "") {
    
          postRequest('login', {
            username: accountRef.current.value,
            password: passwordRef.current.value
          })
          .then((response) => {
            console.log(response)

            if(typeof response === "object" && response.account_id && response.username){
              var cookieObject = {
                id: response.account_id,
                username: response.username,
                privilege: response.privilege ? response.privilege : 0
              }
              localStorage.setItem('user', JSON.stringify(cookieObject))
              router.push("/")
            } else {
              setIncorrect(true)
            }
          })
          .catch((err) => {
            if(err.message === "Request failed with status code 404"){
              setIncorrect(true)
            } else {
              console.log(err)
              setIncorrect(true)
              //errorManagement(err)
            }
          })
    
        } else {
          setIncorrect(true)
        }
    }

    function keyDown(e) {
        if (e.key === "Enter") {
          signIn()
        }
    }

    return(
        <div id="login-wrapper">
          <div className="login-side-div">
            <img src="https://codenoury.se/assets/logo-long-yellow.svg" alt="logo-long-yellow" />
            <h1>{locale !== "sv" ? "Sign in" : "Logga in"}</h1>
            <p className="light">
              {
                locale !== "sv"
                ? "Enter your credentials to access the admin panel"
                : "Var god och ange dina användaruppgifter för att komma vidare till adminpanelen"
              }
            </p>
            {
              incorrect &&
              <div id="wrong-password">
                <span><i className="material-icons">lock</i></span>
                <span>
                  {locale !== "sv"
                    ? "Wrong username/password entered. Please try again"
                    : "Användarnamnet/Lösenorder du angav är felaktigt. Var god och försök igen"}
                </span>
              </div>
            }
  
            <div className="input-div">
              <label>{locale === "sv" ? "Användarnamn" : "Username"}</label>
              <input
                type="email"
                id="loginemail-input"
                placeholder="mail@gmail.com"
                ref={accountRef}
                onKeyDown={keyDown}
              ></input>
            </div>
            <div className="input-div">
              <label>{locale !== "sv" ? "Password" : "Lösenord"}</label>
              <div className="password-wrapper">
                <input
                  id="loginpassword-input"
                  type={maskPassword === false ? "password" : "text"}
                  ref={passwordRef}
                  onKeyDown={keyDown}
                ></input>
                <span
                  id="login-show-password"
                  className={maskPassword === false ? "untoggled" : "toggled"}
                  onClick={passwordMask}
                >
                  {
                    maskPassword ?
                    <i className="material-icons">visibility</i>
                    :
                    <i className="material-icons">visibility_off</i>
                  }
                </span>
              </div>
            </div>
            <button
              className="button-yellow-square"
              id="login-btn"
              onClick={signIn}
            >
              {locale !== "sv" ? "Sign in" : "Logga in"}
            </button>
            <p className="new-account">
              {
                locale === "en" ? "Don't have an account?" : "Har du inget konto?"
              } 
              <span className="create-account" onClick={(() => { setSignUp(true) })}>
                { locale === "en" ? "Sign up" : "Skapa konto"}
              </span>
            </p>
            <p className="new-account">
              {
                locale === "en" ? "Forgotten your password?" : "Glömt lösenord?"
              }
              <span 
                className="create-account" 
                onClick={(() => { 
                    setSignUp(false) 
                    setRestore(true)
                })}
            >
                { locale === "en" ? "Restore account" : "Skapa konto"}
              </span>
            </p>
          </div>
        </div>
      )
}