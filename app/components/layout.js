import React, { useEffect, useState } from "react"
import Head from 'next/head'
import Header from "./header"
import Footer from "./footer"
import { getCookie, createCookie, eraseCookie } from "../modules/cookie"
import useLocale from "../hooks/useLocale"

export default function Layout({ children, title, margin}){
  const locale = useLocale()
  const [consent, setConsent] = useState(true)

  useEffect(() => {
    var user = getCookie("cookie_consent");
    if(user !== ""){
      setConsent(true)
    } else {
      setConsent(false)
    }
  }, [])

  function consentClicked(){
    createCookie("cookie_consent", "true", 365);
    document.getElementById('cookieConsentWindow').remove();
  };

  return (
    <>
      <Header
        locale={locale}
      />
      <Head>
        <meta name="viewport" content="width=device-width" />
        <meta name="description" content="Webbutvecklare" />
        <meta name="author" content="Patrick Tannoury" />
        <meta name="robots" content="index, follow" />
        <meta property="og:url" content="https://codenoury.se" />
        <meta property="og:description" content={locale !== "sv" ? "Personalised Web development" : "Personlig Webbutveckling"}/>
        <meta property="og:image" content="https://codenoury.se/assets/og_image.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="https://codenoury.se/assets/favicon-16x16.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="https://codenoury.se/assets/favicon-32x32.png"/>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"></link>
        <title>{`${title} | Codenoury`}</title>
      </Head>
      <main style={{marginTop: margin ? margin : null}}>
        {children}
      </main>
      <Footer 
        locale={locale}
      />
      {
        !consent && 
        <div id="cookieConsentWindow">
          <div id="cookie-consent-wrapper">
            <div>
              <h3>Cookies &#127850;</h3>
              <p>{ locale === "en" ? 
              "This website uses cookies to enhance your browsing experience. For more information on how the website uses cookies, please click on the link" :
              "Denna hemsida använder sig av cookies för statistiska syften, samt för att förbättra upplevelsen på hemsida. För mer information, var god och tryck på länken"}
              </p>
            </div>
            <button className="button-yellow-round" 
              id="cookieConsentButton"
              onClick={consentClicked}>
              { locale === "en" ? "I understand" : "Jag förstår"}
            </button>
          </div>
        </div>
      }
    </>
  )
}