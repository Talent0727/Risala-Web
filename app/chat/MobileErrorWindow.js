import React, { useEffect } from "react";
import Layout from "../components/layout";
import Link from "next/link";

export default function MobileErrorWindow({ }){

    return(
        <Layout title={"Risala | Mobile"}>
            <div className="mobile-error-window" style={style}>
                <h1 style={headerStyle}>Risala Mobile</h1>
                <p className="light" style={{fontSize: '20px'}}>
                    Risala Web Edition is not developed for the purpose of being used on a mobile.
                    Please use a computer in order to achieve the best possible experience. <br/><br/>
                    A mobile app is currenly in development, and will be released as soon as possible.
                </p>
            </div>
        </Layout>
    )
}

const headerStyle = {
    color: "#ffb301",
    fontSize: '40px'
}

const style = {
    paddingTop: '80px',
    width: 'min(80%, 1000px)',
    margin: 'auto'
}