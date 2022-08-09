import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from './messagesSlice';

export default function Messages() {
    const messages = useSelector((state) => state.messages.messages);
    const dispatch = useDispatch();

    const [message, setMessage] = useState();

    function handleClick() {
        dispatch(addMessage(message))
    }

    return (
        <div className="messages-wrapper">
            <input name="message" type={"text"} placeholder={"Enter a message to be added to Messages"} value={message} onChange={e => setMessage(e.target.value)}></input>
            <button onClick={handleClick()}>Add Message</button>
            <div className="messages">
                {messages}
            </div>
        </div>
    )
}