import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Papa from 'papaparse';
import { db } from '../firebase/config'; // Import your Firestore instance
import { useAuth } from './AuthContext'; // Assuming you have an Auth context
import { collection, doc, getDoc } from 'firebase/firestore'; // Import necessary functions

export default function Search() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programFilter, setProgramFilter] = useState(''); 
  const [universityFilter, setUniversityFilter] = useState(''); 
  const [programCodeFilter, setProgramCodeFilter] = useState(''); 
  const [userAverageGrade, setUserAverageGrade] = useState(null); // State for user's average grade
  const [useAverage, setUseAverage] = useState(false); // Toggle state

  useEffect(() => {
    // Fetch the CSV from the public folder
    fetch('/ontario_university_programs.csv')
      .then((response) => response.text())
      .then((csvText) => {
        // Parse the CSV using PapaParse
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const cleanedPrograms = results.data.map((program, index) => ({
              id: index, // Set unique ID for each row
              programName: program['Program Name'] ? program['Program Name'].trim() : 'Unknown Program',
              universityName: program['University Name'] ? program['University Name'].trim() : 'Unknown University',
              gradeRequirement: program['Grade Range'] ? program['Grade Range'].trim() : 'Unknown',
              programCode: program['Program Code'] ? program['Program Code'].trim() : 'N/A',
              prerequisites: program['Prerequisites']
                ? program['Prerequisites'].replace(/,+/g, ', ').replace(/(, )+$/, '').trim()
                : 'None',
            }));

            setPrograms(cleanedPrograms);
          },
        });
      })
      .catch((error) => {
        console.error('Error fetching or parsing CSV:', error);
      });

    // Fetch user's average grade from Firestore
    if (user) {
      const userRef = doc(db, 'userGrades', user.uid); // Use doc instead of collection
      getDoc(userRef).then((doc) => {
        if (doc.exists()) {
          console.log(doc.data()); 
          setUserAverageGrade(doc.data().average); // Assuming averageGrade is the field name
        } else {
          console.error('No such document!');
        }
      }).catch((error) => {
        console.error('Error fetching user average grade:', error);
      });
    }
  }, [user]);

  const handleClickOpen = (program) => {
    setSelectedProgram(program);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProgram(null);
  };

  // Function to parse grade requirement and check against user's average
  const parseGradeRequirement = (requirement) => {
    const match = requirement.match(/(\d+)(?:-(\d+))?/);
    if (match) {
      const minGrade = parseInt(match[1], 10);
      const maxGrade = match[2] ? parseInt(match[2], 10) : minGrade; // If there's no max, treat as equal to min
      return { minGrade, maxGrade };
    }
    return null; // Return null if no valid grade range found
  };

  // Filter programs based on search input and user's average grade
  const filteredPrograms = programs.filter((program) => {
    const isProgramNameMatch = program.programName.toLowerCase().includes(programFilter.toLowerCase());
    const isUniversityMatch = program.universityName.toLowerCase().includes(universityFilter.toLowerCase());
    const isProgramCodeMatch = program.programCode.toLowerCase().includes(programCodeFilter.toLowerCase());
    
    let isGradeMatch = true; // Default to true for grade check
    if (useAverage && userAverageGrade !== null) {
      const gradeReq = parseGradeRequirement(program.gradeRequirement);
      if (gradeReq) {
        isGradeMatch = userAverageGrade >= gradeReq.minGrade && userAverageGrade <= gradeReq.maxGrade;
      }
    }

    return isProgramNameMatch && isUniversityMatch && isProgramCodeMatch && isGradeMatch;
  });

  // Define the columns for the DataGrid
  const columns = [
    { field: 'programName', headerName: 'Program Name', width: 200 },
    { field: 'universityName', headerName: 'University', width: 150 },
    { field: 'gradeRequirement', headerName: 'Grade Requirement', width: 180 },
    { field: 'programCode', headerName: 'Program Code', width: 130 },
  ];

  return (
    <div>
      {/* Search Input */}
      <TextField
        label="Search Programs"
        variant="outlined"
        fullWidth
        value={programFilter}
        onChange={(e) => setProgramFilter(e.target.value)} // Update search text state on change
        style={{ marginBottom: '20px' }} // Add some spacing between search box and data grid
      />
      <TextField
        label="Search University"
        variant="outlined"
        fullWidth
        value={universityFilter}
        onChange={(e) => setUniversityFilter(e.target.value)} // Update search text state on change
        style={{ marginBottom: '20px' }} // Add some spacing between search box and data grid
      />
      <TextField
        label="Search Program Code"
        variant="outlined"
        fullWidth
        value={programCodeFilter}
        onChange={(e) => setProgramCodeFilter(e.target.value)} // Update search text state on change
        style={{ marginBottom: '20px' }} // Add some spacing between search box and data grid
      />

      {/* Toggle for using average grade */}
      {userAverageGrade !== null && (
        <FormControlLabel
          control={
            <Switch
              checked={useAverage}
              onChange={() => setUseAverage(!useAverage)}
              color="primary"
            />
          }
          label="Use Average Grade"
        />
      )}

      {/* Data Grid */}
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredPrograms} // Apply the filtered rows
          columns={columns}
          pageSize={10}
          onRowClick={(params) => handleClickOpen(params.row)} // Open modal on row click
        />
      </div>

      {/* Modal Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Program Details</DialogTitle>
        <DialogContent>
          {selectedProgram && (
            <>
              <Typography variant="h5">{selectedProgram.programName}</Typography>
              <Typography variant="h6">{selectedProgram.universityName}</Typography>
              <Typography variant="body1"><strong>Grade Requirement:</strong> {selectedProgram.gradeRequirement}</Typography>
              <Typography variant="body1"><strong>Program Code:</strong> {selectedProgram.programCode}</Typography>
              <Typography variant="body1"><strong>Prerequisites:</strong> {selectedProgram.prerequisites}</Typography>
            </>
          )}
        </DialogContent>
        <Button onClick={handleClose} color="primary">Close</Button>
      </Dialog>
    </div>
  );
}
