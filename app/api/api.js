import axios from "axios";
import store from "../features/store";
import { chatReducer } from "../features/chat";
import { useDispatch } from "react-redux";

export function postRequest(URL, payload, headers){
    return new Promise((resolve, reject) => {
        let url;
        window.location.hostname === "localhost" ? 
        url = `http://localhost:800/${URL}` :
        url = `https://risala.codenoury.se/api/${URL}`

        axios.post(url, payload, headers)
        .then((response) => {
            if(response.status === 200){
                resolve(response.data)
            } else {
                reject(response.data)
            }
        })
        .catch((err) => {
            reject(err)
        })
    })
}

export function getRequest(URL){
    return new Promise((resolve, reject) => {
        let url;
        window.location.hostname === "localhost" ? 
        url = `http://localhost:800/${URL}` :
        url = `https://risala.codenoury.se/api/${URL}`

        axios(URL)
        .then((response) => {
            if(response.status === 200){
                resolve(response.data)
            } else {
                reject(response.data)
            }
        })
        .catch((err) => {
            reject(err)
        })
    })
}

export function errorManagement(payload){
    const state = store.getState().chatReducer.value
    const MESSAGES = state.MESSAGES

    return new Promise((resolve, reject) => {
        let url;
        window.location.hostname === "localhost" ? 
        url = `http://localhost:800/error` :
        url = `https://risala.codenoury.se/api/error`
    
        try {
            axios.post(url, {
                message: typeof payload.message === "string" ? payload.message : payload
            })
            .then((response) => {
                if(response.status === 200){
                    store.dispatch(chatReducer({ 
                        MESSAGES: [...MESSAGES, { purpose: 'error', message: payload.message }]
                    }))
                    resolve(true)
                }
            })
            .catch((err) => {
                reject(err)
            })
        } catch (err) {
            reject(err)
        }
    })
}