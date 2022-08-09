import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './components/Messages/messagesSlice';

export default configureStore({
    reducer: {
        messages: messagesReducer
    }
})