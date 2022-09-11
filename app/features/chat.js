import { createSlice } from "@reduxjs/toolkit";

export const chatSlice = createSlice({
    name: "chat",
    initialState: {
        value: {
            callSignal: undefined,
            isMobile: false,
            chat: [],
            chats: undefined, 
            chat_settings: {
                color: "#e1872c",
                emoji: "👍",
            },
            chat_height: 1,
            chat_bottom_height: 88,
            isChat_window: false,
            chat_window: undefined,
            current: undefined,
            COUNTER_DATA: {
                id: undefined,
                firstname: undefined,
                lastname: undefined,
                profile_picture: undefined
            },
            emoji: false,
            MESSAGES: [],
            files: [], //This is for upload purposes only
            isFiles: false,
            uploadFiles: { //This array consists of objects with information crucial for the file & image update
                files: [],
                images: []
            }, 
            filesAndMedia: undefined,
            imageCarousel: undefined,
            moreOptions: {
                visible: false,
                top: undefined,
                left: undefined,
                message_id: undefined
            },
            newMessage: {
                is_searching: false,
                new_conversation: false
            },
            noConversations: false,
            reply: {
                reply: false,
                text: undefined,
                replying_to_name: undefined,
                replying_to_id: undefined,
                message_id: undefined
            },
            settings: false, //Whether the chat settings is displayed or not
            selectedUser: undefined, //<-- This is for chat_window. Who is being selected for removal, add etc.
            time_separator: [],
            typing: {
                is_typing: false,
                chat_id: [],
            },
            //These are for the user search function
            USER_SEARCH: {
                ID: [],
                NAMES: [],
                MEMBERS: []
            },
            USER_DATA: {
                account_id: undefined,
                firstname: undefined,
                lastname: undefined,
                last_login: undefined,
                profile_picture: undefined,
                username: undefined
            }
        }
    },
    reducers: {
        CHAT_UNIQUE_TIME: (state, action) => {
            state.value[action.payload.key] = action.payload.value
        },
        chatReducer: (state, action) => {
            state.value = {...state.value, ...action.payload};
        },
        objectAdd: (state, action) => {
            state.value[action.payload.key] = Object.assign(state.value[action.payload.key], action.payload.value)
        },
        arrayAdd: (state, action) => {
            //Two parameters in action: target key value, added value;
            //dispatch(arrayAdd({array: state, value: y})) <--- example
            state.value[`${action.payload.array}`] = [...state.value[`${action.payload.array}`], action.payload.value]
        },
        arrayRemoveIndex: (state, action) => {
            console.log(action);
            state.value[action.payload.key] = state.value.filter((e, i) => i !== action.payload.value)
        },
        arrayRemove: (state, action) => {
            state.value[`${action.payload.key}`] = state.value[`${action.payload.key}`].filter(value => value !== action.payload.value)
        },
        arrayEmpty: (state, action) => {
            //dispatch(arrayEmpty('state_name')) <-- example
            state.value[action.payload] = []
        },
        user_search_add: (state, action) => {
            state.value[action.payload.key] = Object.assign(state.value[action.payload.key], {
                ID: [...state.value[action.payload.key]['ID'], action.payload.value_id],
                NAMES: [...state.value[action.payload.key]['NAMES'], action.payload.value_name],
                MEMBERS: [...state.value[action.payload.key]['MEMBERS'], action.payload.value_member]
            })
        },
        user_search_empty: (state, action) => {
            state.value[action.payload] = Object.assign(state.value[action.payload], {ID: [], NAMES: [], MEMBERS: []})
        },
        user_search_remove: (state, action) => {
            state.value[action.payload.key] = {
                ID: state.value[action.payload.key]['ID'].filter((e, i) => i !== action.payload.value),
                NAMES: state.value[action.payload.key]['NAMES'].filter((e, i) => i !== action.payload.value),
                MEMBERS: state.value[action.payload.key]['MEMBERS'].filter((e, i) => i !== action.payload.value)
            }
        }
    },
});

export const { CHAT_UNIQUE_TIME, chatReducer, objectAdd, arrayAdd, arrayRemove, arrayRemoveIndex, arrayEmpty, user_search_add, user_search_empty, user_search_remove } = chatSlice.actions;
export default chatSlice.reducer;