import React, { useRef, useEffect, useState } from "react";
import useLocale from "../hooks/useLocale";
import axios from 'axios';
import Layout from "../components/layout";
import { useRouter } from "next/router";
import { errorManagement, postRequest } from "../api/api";
import { alphabeticInput } from "../modules/input";
import { v4 as uuidv4 } from 'uuid';

export default function SignUp({setSignUp, setRestore}){
    const router = useRouter();
    const locale  = useLocale()
    const passwordRef = useRef();
    const repeatPassword = useRef();
    const [loading, setLoading] = useState(false)
    const [incorrect, setIncorrect] = useState(undefined)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false)

    //States for account creation
    const [passwordApproved, setPasswordApproved] = useState(false)
    const [passwordMatch, setPasswordMatch] = useState(false)
    const [nameApprove, setNameApprove] = useState(false)
    const [emailApprove, setEmailApprove] = useState(false)

    //For confirmation
    const [confirmed, setConfirmed] = useState(false)


    async function signUp(){
      var input = document.querySelectorAll('input')

      if(passwordMatch && passwordApproved && nameApprove && emailApprove){
        setLoading(true)
        var values = []
        for(let i = 0; i < input.length; i++){
          values.push(input[i].value)
        }

        const match = await postRequest('accounts/control', {username: values[2]})

        console.log(match)
        if(match.length === 0){
          postRequest('accounts/create', {
            id: uuidv4(),
            firstname: values[0],
            lastname: values[1],
            username: values[2],
            password: values[3],
            temp: uuidv4(),
          })
          .then((response) => {
            setConfirmed(true)
            setLoading(false)
          })
          .catch((err) => {
            //errorManagement(err)
            setLoading(false)
            alert("An error has occurred, please inform the administrator of this website")
            console.log(err)
          })

        } else {
          setIncorrect({purpose: locale === "en" ? "An account for this e-mailadress already exists" : "Ett konto med det angivna e-postadressen existerar redan"})
          setLoading(false)
        }
        
      } else {
        if(!passwordMatch){
          setIncorrect({purpose: locale === "en" ? "Passwords do not match, please try again" : "Lösenorden matchar inte, var god och försök igen"})
        } else if(passwordApproved){
          setIncorrect({purpose: locale === "en" ? "Given password does not meet the requirements" : "Angivna lösenordet matchar inte med kraven, var god och försök igen"})
        } else if(!nameApprove) {
          setIncorrect({purpose: locale === "en" ? "Please fill in your first- and lastname" : "Var god och fyll i för- & efternamn"})
        } else if(!emailApprove){
          setIncorrect({purpose: locale === "en" ? "Please provide a valid e-mail adress" : "Var god och fyll i en giltig e-mailadress"})
        }
      }
    }

    function passwordInput(e){
      var input = document.querySelectorAll('input')
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

          if(input[3].value === input[4].value){
            setPasswordMatch(true)
          } else {
            setPasswordMatch(false)
          }

        } else {
          setPasswordApproved(false)
        }
      }
    }

    function emailInput(e){
      var value = e.target.value
      if(value.length > 5 && value.includes('@')){
        setEmailApprove(true)
      } else {
        setEmailApprove(false)
      }
    }

    function nameInput(){
      var input = document.querySelectorAll('input')
      var firstname = input[0].value
      var lastname = input[1].value

      if(firstname.length > 0 && lastname.length > 0){
        setNameApprove(true)
      } else {
        setNameApprove(false)
      }
    }

    return (
      <div id="login-wrapper">
      <div className="login-side-div">
        <img src="https://codenoury.se/assets/logo-long-yellow.svg" alt="logo-long-yellow" />
        {
          confirmed ?
          <>
          <h1>Account has been successfully created!</h1>
          <p>Please check your inbox and your junk mail for a confirmation mail. Follow the instructions to complete your account set up</p>
          </>
          :
          <>
          <h1>{locale !== "sv" ? "Sign up" : "Skapa konto"}</h1>
        {
          incorrect &&
          <div id="wrong-password" style={{marginTop: "20px"}}>
            <span><i className="material-icons">error</i></span>
            <span>{incorrect.purpose}</span>
          </div>
        }
        <div className="input-div">
          <label>{locale === "sv" ? "Förnamn" : "Firstname"}</label>
          <input 
            placeholder="John" 
            onInput={alphabeticInput} 
            onChange={nameInput}
          ></input>
        </div>
        <div className="input-div">
          <label>{locale === "sv" ? "Efternamn" : "Lastname"}</label>
          <input 
            placeholder="Doe" 
            onInput={alphabeticInput} 
            onChange={nameInput}
          ></input>
        </div>
        <div className="input-div">
          <label>{locale === "sv" ? "E-mailadress" : "E-mail adress"}</label>
          <input type="email" placeholder="mail@gmail.com" onChange={emailInput}></input>
        </div>
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
        <button
          className="button-yellow-square"
          id="login-btn"
          onClick={signUp}
        >
          {
            loading ?
            <div className="lds-dual-ring"></div> :
            <>
              {locale !== "sv" ? "Sign up" : "Skapa konto"}
            </>
          }
        </button>
        <p className="new-account">
          {
            locale === "en" ? "Already have an account?" : "Har du redan ett konto?"
          } 
          <span className="create-account" onClick={(() => { setSignUp(false) })}>
            { locale === "en" ? "Sign in" : "Logga in"}
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
            { locale === "en" ? "Restore account" : "Återställ konto"}
          </span>
        </p>
          </>
        }
      </div>
    </div>
    )
}