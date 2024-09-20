import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Nav from './Nav';

export default function Register() {
  const [registerData, setRegisterData] = useState({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
  });

  const [registerResult, setRegisterResult] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    const { email, password } = registerData;

    if (email !== registerData.confirmEmail) {
      alert('Emails do not match');
      return;
    }

    if (password !== registerData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    console.log('Attempting to register with:', email);
    console.log('Auth object:', auth);

    try {
      console.log('Starting user creation...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user);

      console.log('Storing user data in Firestore...');
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date()
      });
      console.log('User data stored successfully');

      setRegisterResult(true);
      navigate('/');
    } catch (error) {
      console.error('Detailed error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert('Error registering user: ' + error.message);
    }
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
          Register
        </Typography>

        <form onSubmit={handleRegister}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            name="email"
            onChange={handleChange}
            margin="normal"
            type="email"
            required
          />

          <TextField
            label="Confirm Email"
            variant="outlined"
            fullWidth
            name="confirmEmail"
            onChange={handleChange}
            margin="normal"
            type="email"
            required
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            name="password"
            onChange={handleChange}
            margin="normal"
            type="password"
            required
          />

          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            name="confirmPassword"
            onChange={handleChange}
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
            Register
          </Button>

          <small>Already have an Account <a href='/login'>Login here</a></small>
        </form>
      </Box>
    </div>
  );
}
