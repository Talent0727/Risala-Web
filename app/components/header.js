import React, { useEffect, useState } from "react"
import Link from "next/link";
import { useSelector } from "react-redux";
import { getCookie } from "../modules/cookie";

export default function Header({ locale }){
  const [navbar, setNavbar] = useState(false);    //navbar background
  const [mobileNavbar, setMobileNavbar] = useState(false) //hamburger menu & Mobile navbar
  const [account, setAccount] = useState(false)
  const [privilege, setPrivilege] = useState(0)

  function navbarScroll(){
    if(window.innerWidth > 1000){
      if(window.pageYOffset >= 1){
        setNavbar(true)
      }
      else{
        setNavbar(false)
      }
    }
    else{
      setNavbar(true)
    }
  }

  useEffect(() => {
    console.log(getCookie('user'))
    window.addEventListener('scroll', navbarScroll)
    window.addEventListener('load', navbarScroll)
  
    if(localStorage.getItem('user')){
      try {
        setAccount(true)
        setPrivilege(JSON.parse(localStorage.getItem('user')).privilege) 
      } catch (err) {
        setAccount(false)
      }
    }

    return(() => {
      window.removeEventListener('scroll', navbarScroll)
      window.removeEventListener('load', navbarScroll)
    })
  }, [])

  function navbarMobileList(e){
    var navbarList = document.getElementById('desktop-navbar-list')
    var listItems = navbarList.querySelectorAll('ul li')
    if(mobileNavbar === false && window.innerWidth < 875){
      setMobileNavbar(true)
      document.body.style.cssText = "overflow-y: hidden;"
      let i = 0;
      fadeList();
      function fadeList() {                         
        if (i < listItems.length) {  
            listItems[i].classList.add('fade') 
            i++;          
            setTimeout(function() {                    
              fadeList();               
            }, 100)    
        }                       
      }
    } else if(mobileNavbar === true && window.innerWidth < 875){
        setMobileNavbar(false)
        document.body.style.cssText = "overflow-y: initial;"
        for(let i=0; i<listItems.length; i++){
          listItems[i].classList.remove('fade');
        }
    }
  }

  return(
    <header className='navbar-wrapper' style={ navbar === true ? {background: '#141414', borderBottom: '1px solid #ffffff33'} : {backgroundColor: 'transparent', borderBottom: '1px solid transparent'}}>
      <nav id="navbar">
          <Link  onClick={() => {setMobileNavbar(false)} } href={locale === "Sv" ? "/Sv" : "/"}>
            <a className='desktop-logo'><img src="https://codenoury.se/assets/logo-long-yellow.svg" alt="logo-yellow"/></a>
          </Link>
          <div id="mobile-navbar-list" onClick={ navbarMobileList }>
              {
                mobileNavbar === false ? 
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                  </svg> 
                </>
                :
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
                      <path d="M0 0h24v24H0V0z" fill="none"/>
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                </>
              }
          </div>
          <div id="desktop-navbar-list" style={mobileNavbar === false ? {width: '0vw'} : {width: '100vw'}}>
              <ul>
                <li><Link onClick={ navbarMobileList } href={"/services"}>{locale !== "sv" ? 'Services' : 'Tjänster'}</Link></li>
                <li><Link onClick={ navbarMobileList } href={"/projects"}>{locale !== "sv" ? "Previous Projects" : "Tidigare Projekt"}</Link></li>
                <li className="separator"><div className="separator"></div></li>
                <li>
                  <div className="button-wrapper-mobile">
                    <Link 
                      onClick={ navbarMobileList } 
                      href={locale === "sv" ? "/Sv/contact" : "/contact"}
                    >
                      {locale !== "sv" ? "Contact me" : "Kontakta mig"}
                    </Link>
                    { account === false ? 
                      <Link onClick={ navbarMobileList } href={"/login"}>{locale !== "sv" ? "Sign in" : "Logga in"}</Link> :
                      <Link onClick={ navbarMobileList } href={"/admin"}>Admin</Link>
                    }
                  </div>
                </li>
              </ul>
          </div>
          <div className="button-wrapper" style={ locale !== "sv" ? {width: '240px'} : {width: '250px'}}>
            <Link href={"/contact"}>{locale !== "sv" ? "Contact me" : "Kontakta mig"}</Link>
            { account === false ? 
              <Link href={"/login"}>{locale !== "sv" ? "Sign in" : "Logga in"}</Link> :
              <Link href={"/admin"}>Admin</Link>
            }
          </div>
      </nav>
    </header>
  )
}