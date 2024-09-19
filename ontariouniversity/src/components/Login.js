import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import Nav from "./Nav"

export default function Login() {

    const history = useNavigate();

    const handleLogin = async () => {
        history('/home'); // Redirect to the main page after login

    };
    return (
        <div>
            <Nav />
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                gap={2}
                maxWidth="400px"
                mx="auto"
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="email"
                        required
                    />

                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Login
                    </Button>
                </form>
            </Box>
        </div>
    )
}
