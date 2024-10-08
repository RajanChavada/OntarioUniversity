import React, { useEffect, useState } from 'react';
import { TextField, Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import { useAuth } from './AuthContext';
import { firestore } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function GradeInput() {
    const [grades, setGrades] = useState(Array(6).fill(''));
    const [alertOpen, setAlertOpen] = useState(false); // For controlling the popup alert
    const [errorMessage, setErrorMessage] = useState(''); // To store the validation message
    const [average, setAverage] = useState(0); // To store the average of grades
    const { user } = useAuth();

    // fetch grades if available 
    useEffect(() => {
        if (user) { // if the user is logged in
            const fetchGrades = async () => { 
                try {
                    const docRef = doc(firestore, "userGrades", user.uid); // grades for userid
                    const docSnap = await getDoc(docRef); 

                    if (docSnap.exists()) { 

                        const data = docSnap.data(); 
                        setGrades(data.grades); 
                        setAverage(data.average); 
                    }
                    else { 
                        console.log("No grades found for this user"); 
                    }
                }
                catch(error) { 
                    console.log("There was an error fetching the grades ", error); 
                }
            }; 
            fetchGrades(); // call function

        }
    }, [user]); 

    // Handle input change for grades
    const handleGradeChange = (index, event) => {
        const value = event.target.value;
        if (value === '' || Number(value) >= 0 && Number(value) <= 100) {
            const newGrades = [...grades];
            newGrades[index] = event.target.value;
            setGrades(newGrades);
        }
    };

    // Handle submit function with validation
    const handleSubmit = async () => {
        // Check if any grade field is empty
        if (grades.some((grade) => grade === '')) {
            setErrorMessage('All fields are required. Please fill in all grades.');
            setAlertOpen(true);
            return;
        }

        // If all grades are filled, calculate the average
        const total = grades.reduce((sum, grade) => sum + Number(grade), 0);
        const avg = total / grades.length;
        setAverage(avg); // This sets the state for average but won't be immediately available

        if (user) {
            try {
                await setDoc(doc(firestore, "userGrades", user.uid), {
                    grades: grades,
                    average: avg,
                    timestamp: new Date()
                });
                setErrorMessage('Grades submitted and saved successfully!');
            } catch (error) {
                console.error("Error saving grades: ", error);
                setErrorMessage('Error saving grades. Please try again.');
            }
        } else {
            setErrorMessage('Grades submitted successfully! (Guest Mode - Not Saved)');
        }

        // Display success message
        setAlertOpen(true);

        // Log the grades and the average
        console.log('Grades submitted:', grades);
        console.log('Average grade:', avg); // Using `avg` directly here to ensure it logs correctly
    };

    // Handle closing the alert popup
    const handleCloseAlert = () => {
        setAlertOpen(false);
    };

    const handleClear = () => {
        setAverage(0);
        setGrades(Array(6).fill(''));
        setErrorMessage('');
    }

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
            {grades.map((grade, index) => (
                <TextField
                    key={index}
                    label={`Grade ${index + 1}`}
                    variant="outlined"
                    fullWidth
                    value={grade}
                    onChange={(event) => handleGradeChange(index, event)}
                />
            ))}

            {/* Submit Button */}
            <Button variant="contained" color="secondary" fullWidth onClick={handleSubmit}>
                Submit
            </Button>

            <Button variant="contained" color="primary" fullWidth onClick={handleClear}>
                Clear
            </Button>

            {/* Display Average */}
            {average > 0 && (
                <Typography variant="h6" component="p">
                    Average Grade: {average.toFixed(2)}
                </Typography>
            )}

            {/* Snackbar Alert */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={4000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={errorMessage.includes('successfully') ? 'success' : 'error'}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
