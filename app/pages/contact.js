import React, { useEffect, useRef, useState } from 'react';
import * as inputControl from '../modules/input';
import getCurrentTime from '../modules/time';
import Layout from '../components/layout';
import axios from 'axios';
import useLocale from '../hooks/useLocale';

export default function Contact() {
    const [contactState, setContactStage] = useState(1)
    const locale = useLocale()

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'})
    }, [])

    function StageOne(){
        const firstname = useRef()
        const lastname = useRef()
        const email = useRef()
        const phonenumber = useRef()
        const company = useRef()
        const description = useRef()

        useEffect(() =>{
            inputControl.eventListenerAdd(firstname.current, "alphabetic")
            inputControl.eventListenerAdd(lastname.current, "alphabetic")
            inputControl.eventListenerAdd(phonenumber.current, "numeric")
        }, [])

        function submitRequest(){
            if(
                firstname.current.value &&
                lastname.current.value &&
                email.current.value &&
                phonenumber.current.value &&
                company.current.value &&
                description.current.value
            ){
                var dataObj = {
                    firstname: firstname.current.value,
                    lastname: lastname.current.value,
                    email: email.current.value,
                    phonenumber: phonenumber.current.value,
                    company: company.current.value,
                    description: description.current.value.replace(/\n/g,"<br>"),
                    date: getCurrentTime()
                }

                let url;
                window.location.hostname === "localhost" ? 
                url = "http://localhost:800/mail" :
                url = "https://codenoury.se/api/mail"

                axios.post(url, {
                    data: dataObj
                })
                .then((response) => {
                    if(response.status === 200){
                        window.scrollTo(0,0)
                        setContactStage(2)
                    }
                })
                .catch((error) => console.log(error))

            } else{
                console.log("error")
            }
        }

        return(
            <>
            <h1>{locale === "sv" ? "Kontakta oss" : "Get in touch"}</h1>
            <p className="light">{
                locale === "sv" ? 
                "Vill du höra mer om hur jag kan hjälpa dig med att utveckla din webbsida? Fyll gärna i formulären så blir du kontaktad så fort som möjligt där du kan få alla dina frågor besvarade" :
                "And I will be happy to answer your questions. Fill out the form and I'll be in touch with you as soon as possible"
            }
            </p>

            <div className="contact-form-wrapper">
                <div className="two-div">
                    <div className="input-div">
                        <label>{locale === "sv" ? "Förnamn" : "Firstname"}</label>
                        <input type="text" id="firstname-index-contact-me" ref={ firstname }/>
                    </div>
                    <div className="input-div">
                        <label>{locale === "sv" ? "Efternamn" : "Surname"}</label>
                        <input type="text" id="lastname-index-contact-me" ref={ lastname }/>
                    </div>
                </div>
                <div className="input-div">
                    <label>{locale === "sv" ? "E-mailadress" : "Email Adress"}</label>
                    <input type="email" id="email-index-contact-me" ref={ email }/>
                </div>
                <div className="two-div">
                    <div className="input-div">
                        <label>{locale === "sv" ? "Telefonnummer" : "Phone Number"}</label>
                        <input type="text" id="phonenumber-index-contact-me" ref={ phonenumber }/>
                    </div>
                    <div className="input-div">
                        <label>{locale === "sv" ? "Bolagsnamn" : "Company Name"}</label>
                        <input type="text" id="companyname-index-contact-me" ref={ company }/>
                    </div>
                </div>
                <div className="input-div">
                    <label>{locale === "sv" ? "Beskrivning" : "Description"}</label>
                    <textarea id="text-index-contact-me" ref={ description }></textarea>
                </div>
                <button className="button-yellow-square" 
                id="contact-me-index-btn"
                onClick={ submitRequest }>
                {locale === "sv" ? "Skicka Förfrågan" : "Send Request"}
                </button>
            </div>
            </>
        )
    }
    function StageTwo(){

        return(
            <>
                <div className="text-wrapper" style={ window.innerWidth > 750 ? {paddingTop: 0} : null}>
                    <h1 style={ locale !== "en" ? {fontSize: "46px"} : null}>{ locale === "en" ? "Your submission has been recieved" : "Din förfrågan har mottagits"}</h1>
                    <p className="light">{ locale === "en" ? "We will be in touch with you as soon as possible" : "Vi kontaktar dig så snart som möjligt"}</p>
                </div>
                <div id="animate-test">
                    <svg id="paper-plane-path" viewBox="0 0 678.3 269.6">
                        <path id="paper-path" d="M18.1,101.9c65.5,73.2,147.3,137.4,246,154.8c52.3,9.2,106.7,5.5,156.6-13.4
                            c32-12.1,66-32.9,83.3-63.3c18.9-33.2,20.4-73.8,10.6-110.1c-5.4-20.2-16.5-39.6-33.9-51.2C465,8.3,444.5,5.2,426.9,11.5
                            c-17.6,6.3-31.7,22.4-34.6,40.9c-2.2,14.6,2.3,29.7,10.5,42c23,34.3,62.5,42.9,101.2,41.8c57.4-1.5,114-29.7,160.1-63.4"/>
                    </svg>
                    <img src="https://codenoury.se/assets/paper-plane.svg" id="paper-plane" alt="paper-plane"/>
                </div>
            </>
        )
    }
    
    return (
    <Layout
        title={locale === "en" ? "Contact" : "Kontakta mig"}
    >
        <div className="contact-wrapper">
            { contactState === 1 ? <StageOne/> : <StageTwo/> }
        </div>
    </Layout>
  )
}