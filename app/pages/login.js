import React, { useEffect, useRef, useState } from "react"
import useLocale from "../hooks/useLocale";
import Layout from "../components/layout"
import { useRouter } from "next/router";
import { errorManagement, postRequest } from "../api/api";

//Components
import SignIn from '../login/SignIn';
import SignUp from "../login/SignUp";
import Restore from "../login/Restore";

export default function Login() {
  const router = useRouter();
  const locale  = useLocale()
  const accountRef = useRef(null)
  const passwordRef = useRef(null)
  const [incorrect, setIncorrect] = useState(false)
  const [maskPassword, setMaskPassword] = useState(false)
  const [isSignUp, setSignUp] = useState(false);
  const [isRestore, setRestore] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const user = localStorage.getItem('user')
    if (user) {
      try {

        postRequest('accounts', {
          account:  JSON.parse(user).id,
          username: JSON.parse(user).username
        })
        .then((response) =>{
          if(Object.keys(response).length > 0){
            router.push("/")
          } else {
            console.log("Something is wrong")
            console.log(response)
          }
        })
        .catch((err) => {
          console.log(err)
        })
      } catch {
        localStorage.removeItem('user') // Remove so this error does not occur again
      }
    }
  }, [])

  return (
    <Layout
      title={locale === "en" ? "Sign in" : "Logga in"}
    >
      <div className="main" id="login">
        {
          !isSignUp && !isRestore &&
          <SignIn 
            setSignUp={setSignUp}
            setRestore={setRestore}
          />
        }
        {
          isSignUp && !isRestore &&
          <SignUp 
            setSignUp={setSignUp}
            setRestore={setRestore}
          />
        }
        {
          isRestore &&
          <Restore
            setSignUp={setSignUp}
            setRestore={setRestore}
          />
        }
      </div>
    </Layout>
  )
}
