import React from 'react';
import { useAuth } from './AuthContext';
import { Typography, Button, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import Nav from './Nav';
import GradeInput from './GradeInput';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <Nav />
      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={4}
          py={4}  // Add some padding to the top and bottom
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Ontario University Programs
          </Typography>
          
          {user ? (
            <>
              <Typography variant="body1">
                You are logged in as {user.email}. Your data will be saved.
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1">
                You are not logged in. Your data will not be saved.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                color="primary"
              >
                Log In
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                color="default"
              >
                Register
              </Button>
            </>
          )}

          <Typography variant="h5" component="h2" gutterBottom>
            Enter Your Grades
          </Typography>

          <GradeInput />

        </Box>
      </Container>
    </div>
  );
}
