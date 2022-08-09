import { createSlice } from '@reduxjs/toolkit'

export const messagesSlice = createSlice({
    name: 'messages',
    initialState: {
        count: 0,
        messages: [],
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages = [state.messages, action.payload];
            state.count += 1;
            setTimeout(messagesSlice.caseReducers.removeMessage, 10000);
        },

        removeMessage: (state) => {
            state.messages.pop();
            state.count -= 1;
        },

        deleteMessages: (state) => {
            state.count = 0;
            state.messages = [];
        }
    }
})

export const { addMessage, getMessages } = messagesSlice.actions;
export default messagesSlice.reducer;