import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Project imports
import MainCard from 'ui-component/cards/MainCard';
import patientsApi from 'api/patients';

const PatientManagement = () => {
  const theme = useTheme();
  // States for patients data and UI
  const [patients, setPatients] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    medical_record_number: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    primary_diagnosis: '',
    dialysis_start_date: '',
    insurance_info: '',
    institution_id: ''
  });

  // User role from localStorage
  const userRole = localStorage.getItem('userRole');
  const isPatientUser = userRole === 'patient';
  const isAdmin = userRole === 'admin';

  // Fetch patients and institutions on load or page change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // For patient role, fetch only their specific record
      if (isPatientUser) {
        const patientId = localStorage.getItem('relatedEntityId');
        console.log('Patient user detected, fetching data with ID:', patientId);
        console.log('User role:', userRole);
        console.log('Local storage contents:', {
          token: localStorage.getItem('token'),
          userRole: localStorage.getItem('userRole'),
          relatedEntityId: localStorage.getItem('relatedEntityId')
        });

          if (patientId) {
              console.log('Attempting to fetch patient data with ID:', patientId);
              const patientData = await patientsApi.getPatient(patientId);
          console.log('Received patient data:', patientData);
          if (patientData) {
            setPatients([patientData]);
            setTotalRows(1);
            console.log('Successfully set patient data');
          } else {
            console.warn('No patient data received from API');
            setAlert({
              open: true,
              message: 'Unable to fetch patient data',
              severity: 'error'
            });
          }
        } else {
          console.warn('Invalid or missing patient ID:', patientId);
          setAlert({
            open: true,
            message: 'Invalid patient ID',
            severity: 'error'
          });
        }
      } else {
        // For admin and institution roles, fetch all accessible patients
        console.log('Non-patient user detected, fetching all accessible patients');
        const patientsData = await patientsApi.getAllPatients(page + 1, rowsPerPage);
        console.log('Received patients data:', patientsData);
        setPatients(patientsData?.items || []);
        setTotalRows(patientsData?.total || 0);
      }

      // Only admins need institutions data for the dropdown
      if (isAdmin) {
        console.log('Admin user detected, fetching institutions');
        const institutionsData = await patientsApi.getAllInstitutions();
        console.log('Received institutions data:', institutionsData);
        setInstitutions(institutionsData?.items || []);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data
      });
      setAlert({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
      setPatients([]);
      setInstitutions([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open form dialog for adding new patient
  const handleAddNew = () => {
    setFormData({
      medical_record_number: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      contact_number: '',
      primary_diagnosis: '',
      dialysis_start_date: '',
      insurance_info: '',
      institution_id: ''
    });
    setSelectedPatient(null);
    setOpenForm(true);
  };

  // Open form dialog for editing patient
  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      medical_record_number: patient.medical_record_number || '',
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
      gender: patient.gender || '',
      contact_number: patient.contact_number || '',
      primary_diagnosis: patient.primary_diagnosis || '',
      dialysis_start_date: patient.dialysis_start_date ? patient.dialysis_start_date.split('T')[0] : '',
      insurance_info: patient.insurance_info || '',
      institution_id: patient.institution_id || ''
    });
    setOpenForm(true);
  };

  // Open delete confirmation dialog
  const handleDeleteConfirmation = (patient) => {
    setSelectedPatient(patient);
    setOpenDelete(true);
  };

  // Close form dialog
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  // Close delete dialog
  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  // Submit patient form (create or update)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selectedPatient) {
        // Update existing patient
        await patientsApi.updatePatient(selectedPatient.id, formData);
        setAlert({
          open: true,
          message: 'Patient updated successfully',
          severity: 'success'
        });
      } else {
        // Create new patient
        await patientsApi.createPatient(formData);
        setAlert({
          open: true,
          message: 'Patient created successfully',
          severity: 'success'
        });
      }
      setOpenForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      setAlert({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete patient
  const handleDelete = async () => {
    if (!selectedPatient) return;

    setLoading(true);
    try {
      await patientsApi.deletePatient(selectedPatient.id);
      setAlert({
        open: true,
        message: 'Patient deleted successfully',
        severity: 'success'
      });
      setOpenDelete(false);
      fetchData(); // Refresh data
    } catch (error) {
      setAlert({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close alert
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <MainCard
      title="Patient Management"
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: theme.palette.background.paper
        }
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Action buttons */}
      {!isPatientUser && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
            Add New Patient
          </Button>
        </Box>
      )}

      {/* Patients table */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: theme.palette.background.paper,
          '& .MuiTable-root': {
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Medical Record #</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Primary Diagnosis</TableCell>
              <TableCell>Dialysis Start Date</TableCell>
              {!isPatientUser && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {patients && patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow
                  key={patient.id || patient._id || `patient-${patients.indexOf(patient)}`}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected
                    }
                  }}
                >
                  <TableCell>{patient.medical_record_number || '-'}</TableCell>
                  <TableCell>{`${patient.first_name || ''} ${patient.last_name || ''}`}</TableCell>
                  <TableCell>{formatDate(patient.date_of_birth)}</TableCell>
                  <TableCell>{patient.gender || '-'}</TableCell>
                  <TableCell>{patient.contact_number || '-'}</TableCell>
                  <TableCell>{patient.primary_diagnosis || '-'}</TableCell>
                  <TableCell>{formatDate(patient.dialysis_start_date)}</TableCell>
                  {!isPatientUser && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton color="primary" onClick={() => handleEdit(patient)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteConfirmation(patient)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isPatientUser ? 7 : 8} align="center">
                  <Typography variant="body1">{loading ? 'Loading patients...' : 'No patients found'}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {!isPatientUser && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          />
        )}
      </TableContainer>

      {/* Patient Form Dialog */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { bgcolor: theme.palette.mode === 'dark' ? '#242b38' : theme.palette.background.paper }
        }}
      >
        <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Medical Record Number */}
            <Grid item xs={12} md={6}>
              <TextField
                name="medical_record_number"
                label="Medical Record Number"
                value={formData.medical_record_number}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* First Name */}
            <Grid item xs={12} md={6}>
              <TextField name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} fullWidth required />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} md={6}>
              <TextField name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} fullWidth required />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} md={6}>
              <TextField
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select labelId="gender-label" name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} md={6}>
              <TextField name="contact_number" label="Contact Number" value={formData.contact_number} onChange={handleChange} fullWidth />
            </Grid>

            {/* Primary Diagnosis */}
            <Grid item xs={12}>
              <TextField
                name="primary_diagnosis"
                label="Primary Diagnosis"
                value={formData.primary_diagnosis}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            {/* Dialysis Start Date */}
            <Grid item xs={12} md={6}>
              <TextField
                name="dialysis_start_date"
                label="Dialysis Start Date"
                type="date"
                value={formData.dialysis_start_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Insurance Info */}
            <Grid item xs={12} md={6}>
              <TextField
                name="insurance_info"
                label="Insurance Information"
                value={formData.insurance_info}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Institution (Admin only) */}
            {isAdmin && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="institution-label">Institution</InputLabel>
                  <Select
                    labelId="institution-label"
                    name="institution_id"
                    value={formData.institution_id}
                    onChange={handleChange}
                    label="Institution"
                    required
                  >
                    {institutions.map((institution) => (
                      <MenuItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        PaperProps={{
          sx: { bgcolor: theme.palette.mode === 'dark' ? '#242b38' : theme.palette.background.paper }
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete patient {selectedPatient?.first_name} {selectedPatient?.last_name}? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert for notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default PatientManagement;
