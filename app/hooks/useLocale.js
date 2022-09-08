import { useState, useEffect } from "react";

export default function useLocale(){
    const [locale, setLocale] = useState("en")

    useEffect(() => {
        if(window.location.pathname.length >= 3){
            if(window.location.pathname.substring(1,3) === "sv"){
                setLocale("sv")
            } else {
                setLocale("en")
            }
        } else{
            setLocale("en")
        }
    })

    return locale;
}