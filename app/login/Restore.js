import React, { useRef, useEffect, useState } from "react";
import useLocale from "../hooks/useLocale";
import axios from 'axios';
import Layout from "../components/layout";
import { useRouter } from "next/router";
import { postRequest, errorManagement } from "../api/api";
import { v4 as uuidv4 } from 'uuid';

export default function Restore({setSignUp, setRestore}){
    const router = useRouter();
    const locale  = useLocale()
    const username = useRef()
    const [incorrect, setIncorrect] = useState(false)
    const [success, setSuccess] = useState(false)

    function keyPress(e){
      if(e.code === "Enter" && username.current.value.length > 5 && username.current.value.includes('@')){
        restore()
      }
    }

    /*
    && username.value.length > 5 && username.value.includes('@')
    */

    async function restore(){
      console.log(username.current.value)
      const match = await postRequest('accounts/control', {username: username.current.value})
      
      if(match.length === 1 && match[0].username === username.current.value){
        setIncorrect(false)
        
        postRequest('accounts/restore', {
          username: username.current.value,
          id: uuidv4()
        })
        .then((response) => {
          if(response.errno){
            console.log("error")
          } else {
            setSuccess(true)
          }
          console.log(response)
        })
        .catch((err) => {
          errorManagement(err)
          console.log(err)
        })

      } else {
        setIncorrect(true)
      }
    }

    return (
        <div id="login-wrapper">
            <div className="login-side-div">
              <img src="https://codenoury.se/assets/logo-long-yellow.svg" alt="logo-long-yellow" />
              <h1>{locale === "en" ? "Restore Account" : "Återställ konto"}</h1>
              {
                incorrect &&
                <div id="wrong-password">
                  <span><i className="material-icons">lock</i></span>
                  <span>
                    {
                      locale !== "sv"
                      ? "The username provided could not be found. Please try again"
                      : "Användarnamnet du angav är felaktigt. Var god och försök igen"
                    }
                  </span>
                </div>
              }
              {
                success ?
                <>
                  <p>The restoration was successful. Please check your inbox for further instructions, and make sure to check your spam folder in case you cannot find the email in your inbox</p>
                </>
                :
                <>
                  <div className="input-div">
                    <label>{locale === "sv" ? "E-mailadress" : "E-mail adress"}</label>
                    <input type="email" placeholder="mail@gmail.com" ref={username} onKeyDown={keyPress}></input>
                  </div>
                  <button
                    className="button-yellow-square"
                    onClick={restore}
                    style={{width: "min(600px, 80%)", margin: "0 auto 20px auto"}}
                  >
                    {locale !== "sv" ? "Restore" : "Återställ"}
                  </button>
                  <p className="new-account">
                    {
                      locale === "en" ? "Already have an account?" : "Har du redan ett konto?"
                    } 
                    <span 
                      className="create-account" 
                      onClick={(() => { 
                        setSignUp(false) 
                        setRestore(false)
                      })}
                    >
                      { locale === "en" ? "Sign in" : "Logga in"}
                    </span>
                  </p>
                  <p className="new-account">
                    {
                      locale === "en" ? "Don't have an account?" : "Har du inget konto?"
                    }
                    <span 
                      className="create-account" 
                      onClick={(() => { 
                        setSignUp(true) 
                        setRestore(false)
                      })}
                    >
                      { locale === "en" ? "Sign up" : "Skapa konto"}
                    </span>
                  </p>
                </>
              }
            </div>
        </div>
    )
}