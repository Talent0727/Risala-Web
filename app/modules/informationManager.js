import store from "../features/store";
import { chatReducer } from "../features/chat";
import { v4 as uuidv4 } from "uuid";

export default function informationManager(value){
    const state = store.getState().chatReducer.value 
    const MESSAGES = state.MESSAGES

    var object = {
        ...value,
        id: uuidv4()
    }
    console.log(object)

    store.dispatch(chatReducer({
        MESSAGES: [...MESSAGES, object]
    }))
}