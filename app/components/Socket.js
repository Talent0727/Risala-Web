import React, { createContext } from "react";
import { io, Socket } from 'socket.io-client';

//var url = "http://localhost:800"
var url = "https://risala.codenoury.se"

const socket = io.connect(url)
const SocketContext = createContext(socket)

function SocketProvider({ children }){

    return(
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export { SocketContext, SocketProvider };