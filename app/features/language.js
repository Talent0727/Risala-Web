import { createSlice } from "@reduxjs/toolkit";

export const languageSlice = createSlice({
    name: "language",
    initialState: {value: {language: ""}},
    reducers: {
        language: (state, action) => {
            state.value = action.payload;
        }
    }
})

export const { language } = languageSlice.actions;

export default languageSlice.reducer;