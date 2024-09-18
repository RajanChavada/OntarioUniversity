import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';

export default function Login() {

    const history = useNavigate();


    const handleLogin = async () => {
        history('/home'); // Redirect to the main page after login

    };
    return (
        <div>
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}
