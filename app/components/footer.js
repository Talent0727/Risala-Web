import React, { useState, useEffect } from "react"
import Link from 'next/link'

export default function Footer(locale) {

  function languageChange(e){
    if (e.target.value === "En") {
      if (locale === "sv") {
        if(window.location.search){
          window.location = `https://codenoury.se/${window.location.pathname.substring(4)}${window.location.search}`
        } else{
          window.location = `https://codenoury.se/${window.location.pathname.substring(4)}`
        }
      }
    } else {
      if(window.location.search){
        window.location = `https://codenoury.se/sv${window.location.pathname}${window.location.search}`
      } else{
        window.location = `https://codenoury.se/sv${window.location.pathname}`
      }
    }
  };

  return (
    <footer>
      <div id="footer-wrapper">
        <div className="footer-line"></div>
        <div className="footer-row">
          <div className="footer-column">
            <Link href="/">
              <a>              
                <img src="https://codenoury.se/assets/logo-long-yellow.svg" alt="logo-yellow" height="50px" width="200px" />
              </a>
            </Link>
          </div>
          <div className="footer-column">
            <h3>{locale === "sv" ? "Tjänster" : "Services"}</h3>
            <ul>
              <li>
                <Link href="/services">
                  <a>Front-end {locale === "sv" ? "utveckling" : "development"}</a>
                </Link>
              </li>
              <li>
                <Link href="/services">
                  <a>Back-end {locale === "sv" ? "utveckling" : "development"}</a>
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>{locale === "sv" ? "Om Codenoury" : "About Codenoury"}</h3>
            <ul>
              <li>
                <Link href="/contact">
                  <a>{locale === "sv" ? "Kontakta mig" : "Contact me"}</a>
                </Link>
              </li>
              <li>
                <Link href="/projects">
                  <a>{locale === "sv" ? "Tidigare projekt" : "Previous Projects"}</a>
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Navigation</h3>
            <ul>
              <li>
                <Link href="/login">
                  <a>{locale === "sv" ? "Logga in" : "Sign in"}</a>
                </Link>
              </li>
              <li></li>
              <li></li>
            </ul>
          </div>
        </div>
        <div className="footer-line"></div>
        <div className="footer-row final-row">
          <div className="final-row-wrapper">
            <p id="copyright-year">
              &copy; {new Date().getFullYear()} Patrick Tannoury
            </p>
            <div className="social-media-wrapper">
              <a href="https://www.linkedin.com/in/patrick-tannoury/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24px"
                  height="24px"
                  viewBox="0 0 34 34"
                >
                  <g>
                    <path
                      d="M34,2.5v29A2.5,2.5,0,0,1,31.5,34H2.5A2.5,2.5,0,0,1,0,31.5V2.5A2.5,2.5,0,0,1,2.5,0h29A2.5,2.5,0,0,1,34,2.5ZM10,13H5V29h5Zm.45-5.5A2.88,2.88,0,0,0,7.59,4.6H7.5a2.9,2.9,0,0,0,0,5.8h0a2.88,2.88,0,0,0,2.95-2.81ZM29,19.28c0-4.81-3.06-6.68-6.1-6.68a5.7,5.7,0,0,0-5.06,2.58H17.7V13H13V29h5V20.49a3.32,3.32,0,0,1,3-3.58h.19c1.59,0,2.77,1,2.77,3.52V29h5Z"
                      fill="currentColor"
                    ></path>
                  </g>
                </svg>
              </a>
              <a href="https://github.com/pannoury">
                <svg
                  aria-hidden="true"
                  height="24"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="24"
                  data-view-component="true"
                  className="octicon octicon-mark-github"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                  ></path>
                </svg>
              </a>
              <a href="https://www.upwork.com/freelancers/~015d0ecb241f77468a">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100px"
                  height="80px"
                  viewBox="0 0 100 80"
                >
                  <path
                    id="XMLID_15_"
                    className="st0"
                    d="M44.1,28.3c-0.2,3.7,0,7.4-0.8,11.1c-0.6,3-1.8,5.9-3.4,8.5c-1.4,2.1-3.1,4-5.1,5.6
              c-6.3,5.1-13.2,6.2-20.4,3.2C6.3,53.3,1.7,46.5,0.2,36.9C0,35.5,0,34.1,0,32.7C0,22.2,0,11.6,0,1.1C0,0.3,0.2,0,1,0
              c3.1,0,6.2,0.1,9.3,0c0.9,0,1.1,0.2,1.1,1.2c0,10.6,0,21.2,0,31.8c0,4.3,1.6,7.7,4.7,10.2c4.6,3.7,11.7,2.2,14.7-3.2
              c1.2-2.2,1.8-4.5,1.8-7.1c0-10.6,0-21.1,0-31.7c0-0.9,0.2-1.3,1.1-1.3c3.1,0.1,6.1,0.1,9.2,0c0.9,0,1.3,0.3,1.5,1.2
              c2.4,8.9,5.7,17.3,10.1,25.2c0.1,0.2,0.3,0.5,0.4,0.7c0.1,0.1,0.1,0.1,0.3,0.3c0.5-1.4,0.9-2.7,1.4-4c2.7-7,6.9-12.3,13.4-14.9
              c6.3-2.4,12.5-1.8,18.3,1.8c4.7,2.9,8.1,7.3,10.1,13c2,5.7,2.2,11.5,0.4,17.3c-2.6,8.5-7.9,14.2-15.6,16.7
              c-4.5,1.5-9.1,1.1-13.6-0.4c-2.4-0.8-4.7-1.9-6.8-3.4c-0.5-0.4-0.8-0.4-0.9,0.4c-0.8,4.4-1.6,8.7-2.5,13.1c-0.8,4-1.5,8-2.3,12.1
              c-0.1,0.7-0.4,0.8-0.9,0.8c-3.3,0-6.6,0-9.9,0c-0.8,0-1-0.3-0.8-1.1c0.9-4.7,1.8-9.4,2.7-14.2c1.3-7,2.6-13.9,3.9-20.9
              c0.1-0.5,0.2-1-0.2-1.4c-2.9-4.2-5.3-8.7-7.4-13.5C44.4,28.8,44.3,28.7,44.1,28.3z M88.5,32.6c-0.1-9.1-8.6-15.3-15.8-11.4
              c-2.5,1.3-4.1,3.6-5.3,6.3c-1.7,3.7-2,7.8-2.9,11.7c-0.1,0.6,0.3,0.9,0.6,1.1c3.2,2.6,6.6,4.5,10.5,5.1
              C82.5,46.3,88.6,40.4,88.5,32.6z"
                  />
                </svg>
              </a>
            </div>
            <select
              id="footer-language-select"
              onChange={languageChange}
              value={locale === "en" ? "En" : "Sv"}
            >
              <option value="Sv">Svenska</option>
              <option value="En">English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  )
}
