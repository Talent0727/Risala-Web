import React from "react"

export default function ChatLoad(){
    return(
        <>
            <div className="chat-sidemenu">
                <div className="chat-convo-list">
                <div className="loading">
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                        <div className="mock"><div className="skeleton"></div></div>
                    </div>
                </div>
                </div>
            <div className="chat-main">
                <div className="chat-top">
                    <div className="message-top">
                        <div className="loading">
                            <div className="mock round"><div className="skeleton"></div></div>
                        </div>
                        <div className="loading">
                            <div className="mock"><div className="skeleton"></div></div>
                        </div>
                    </div>
                </div>
                <div className="chat-display">
                    <ul className="chat-list-wrapper">
                        <div className="loading">
                            <div className="mock"><div className="skeleton"></div></div>
                            <div className="mock-short"><div className="mock"><div className="skeleton"></div></div></div>
                            <div className="mock"><div className="skeleton"></div></div>
                            <div className="mock-short"><div className="mock"><div className="skeleton"></div></div></div>
                            <div className="mock"><div className="skeleton"></div></div>
                            <div className="mock-short"><div className="mock"><div className="skeleton"></div></div></div>
                            <div className="mock"><div className="skeleton"></div></div>
                            <div className="mock-short"><div className="mock"><div className="skeleton"></div></div></div>
                            <div className="mock"><div className="skeleton"></div></div>
                            <div className="mock-short"><div className="mock"><div className="skeleton"></div></div></div>
                        </div>
                    </ul>
                </div>
                <div className="chat-bottom" style={{marginTop: 'auto'}}>
                    <div className="message-box-wrapper">
                        <div className="loading">
                            <div className="mock"><div className="skeleton"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}