import React from 'react';
import { TextField, Box, Button, Typography } from '@mui/material';

export default function GradeInput() {
    // Handle submit function
    const handleSubmit = () => {
        console.log('Submit button clicked');
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={2} // Adds space between each input and button
            maxWidth="400px" // Limits the width of the inputs
            mx="auto" // Centers the box horizontally
        >
            {/* Title */}
            <Typography variant="h4" component="h1" gutterBottom>
                Enter your Top 6 Grades
            </Typography>

            {/* Grade Input Fields */}
            <TextField label="Grade 1" variant="outlined" fullWidth />
            <TextField label="Grade 2" variant="outlined" fullWidth />
            <TextField label="Grade 3" variant="outlined" fullWidth />
            <TextField label="Grade 4" variant="outlined" fullWidth />
            <TextField label="Grade 5" variant="outlined" fullWidth />
            <TextField label="Grade 6" variant="outlined" fullWidth />

            {/* Submit Button */}
            <Button variant="contained" color="secondary" fullWidth onClick={handleSubmit}>
                Submit
            </Button>
        </Box>
    );
}
