import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';
import Papa from 'papaparse';

export default function ProgramSearch() {
  const [programs, setPrograms] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    // Fetch the CSV from the public folder
    fetch('/ontario_university_programs.csv')
      .then((response) => response.text())
      .then((csvText) => {
        // Parse the CSV using PapaParse
        Papa.parse(csvText, {
          header: true, // Treat the first row as headers
          skipEmptyLines: true, // Skip empty lines to avoid errors
          complete: (results) => {
            if (results.errors.length) {
              console.error('Parsing errors:', results.errors); // Log any parsing errors
            }

            const cleanedPrograms = results.data.slice(0, 200).map(program => {
              // Clean up the Prerequisites field
              const cleanedPrerequisites = program['Prerequisites']
                ? program['Prerequisites']
                  .replace(/,+/g, ', ') // Replace multiple commas with a single comma followed by space
                  .replace(/(, )+$/, '') // Remove trailing commas and spaces
                  .trim() // Remove extra spaces
                : ''; // Handle empty fields

              // Clean other fields too if needed
              const cleanedProgramName = program['Program Name'] ? program['Program Name'].trim() : 'Unknown Program';
              const cleanedUniversityName = program['University Name'] ? program['University Name'].trim() : 'Unknown University';

              // Return the cleaned object
              return {
                ...program,
                'Program Name': cleanedProgramName,
                'University Name': cleanedUniversityName,
                'Prerequisites': cleanedPrerequisites
              };
            });

            setPrograms(cleanedPrograms); // Set the cleaned rows
          },
        });
      })
      .catch((error) => {
        console.error('Error fetching or parsing CSV:', error);

      });
  }, []);

  const handleClickOpen = (program) => {
    setSelectedProgram(program);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProgram(null);
  };

  return (
    <div>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Program Name</TableCell>
            <TableCell>University</TableCell>
            <TableCell>Grade Requirement</TableCell>
            <TableCell>Program Code</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {programs.map((program, index) => (
            <TableRow key={index} onClick={() => handleClickOpen(program)} style={{ cursor: 'pointer' }}>
              <TableCell>
                <Typography variant="h6">{program['Program Name']}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1">{program['University Name']}</Typography>
              </TableCell>
              <TableCell>{program['Grade Range']}</TableCell>
              <TableCell>{program['Program Code']}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Modal Dialog */}
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Program Details</DialogTitle>
      <DialogContent>
        {selectedProgram && (
          <>
            <Typography variant="h5">{selectedProgram['Program Name']}</Typography>
            <Typography variant="h6">{selectedProgram['University Name']}</Typography>
            <Typography variant="body1"><strong>Grade Requirement:</strong> {selectedProgram['Grade Range']}</Typography>
            <Typography variant="body1"><strong>Program Code:</strong> {selectedProgram['Program Code']}</Typography>
            <Typography variant="body1"><strong>Prerequisites:</strong> {selectedProgram['Prerequisites']}</Typography>
          </>
        )}
      </DialogContent>
      <Button onClick={handleClose} color="primary">Close</Button>
    </Dialog>
  </div>
  );
}
