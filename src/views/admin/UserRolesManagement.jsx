import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from 'api/config';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';

// SUPER SIMPLE DIRECT API IMPLEMENTATION
// All requests use axios directly

// Create a direct axios instance with the auth token
const axiosAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // Important - don't share credentials between requests
});

// Add auth token to every request
axiosAuth.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
axiosAuth.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response && error.response.status === 401) {
      alert('Authentication error! Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const UserRolesManagement = () => {
  const theme = useTheme();

  // State variables
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [roleAction, setRoleAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Display alerts
  const showAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching users, patients, and institutions data...');
      console.log('Auth status:', localStorage.getItem('token') ? 'Token exists' : 'No token');
      console.log('User role:', localStorage.getItem('userRole'));

      // Get all data
      const usersResponse = await axiosAuth.get('/users');
      console.log('Users data:', usersResponse.data);
      setUsers(usersResponse.data);

      const patientsResponse = await axiosAuth.get('/patients');
      console.log('Patients data:', patientsResponse.data);
      setPatients(patientsResponse.data);

      const institutionsResponse = await axiosAuth.get('/institutions');
      console.log('Institutions data:', institutionsResponse.data);
      setInstitutions(institutionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlert(`Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the dialog for role assignment
  const handleOpenRoleDialog = (user, action) => {
    setCurrentUser(user);
    setRoleAction(action);
    setSelectedEntity('');
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setCurrentUser(null);
    setRoleAction('');
  };

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      if (roleAction === 'admin') {
        console.log(`Making user ${currentUser.id} an admin`);
        await axiosAuth.post(`/user-roles/make-admin/${currentUser.id}`);
      } else if (roleAction === 'patient' && selectedEntity) {
        console.log(`Linking user ${currentUser.id} to patient ${selectedEntity}`);
        await axiosAuth.post(`/user-roles/link-patient/${currentUser.id}/${selectedEntity}`);
      } else if (roleAction === 'institution' && selectedEntity) {
        console.log(`Linking user ${currentUser.id} to institution ${selectedEntity}`);
        await axiosAuth.post(`/user-roles/link-institution/${currentUser.id}/${selectedEntity}`);
      } else {
        throw new Error('Invalid role action or missing entity selection');
      }

      showAlert(`Successfully assigned ${roleAction} role to ${currentUser.username}`);
      handleClose();
      fetchData(); // Refresh data to show updated roles
    } catch (error) {
      console.error('Error assigning role:', error);
      showAlert(`Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Close alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <MainCard title="User Role Management">
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="user roles table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Current Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.firstName || '-'}</TableCell>
                  <TableCell>{user.lastName || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bold',
                        color: user.role === 'admin' ? theme.palette.error.main :
                              user.role === 'patient' ? theme.palette.primary.main :
                              theme.palette.secondary.main
                      }}
                    >
                      {user.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleOpenRoleDialog(user, 'admin')}
                      >
                        Make Admin
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={() => handleOpenRoleDialog(user, 'patient')}
                      >
                        Link Patient
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="info"
                        onClick={() => handleOpenRoleDialog(user, 'institution')}
                      >
                        Link Institution
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? 'Loading users...' : 'No users found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role assignment dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {roleAction === 'admin'
            ? 'Make User an Admin'
            : roleAction === 'patient'
              ? 'Link User to Patient'
              : 'Link User to Institution'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {roleAction === 'admin'
              ? `Are you sure you want to make ${currentUser?.username} an admin?`
              : roleAction === 'patient'
                ? `Select a patient to link with user ${currentUser?.username}:`
                : `Select an institution to link with user ${currentUser?.username}:`}
          </DialogContentText>

          {roleAction !== 'admin' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="entity-select-label">
                {roleAction === 'patient' ? 'Patient' : 'Institution'}
              </InputLabel>
              <Select
                labelId="entity-select-label"
                value={selectedEntity}
                label={roleAction === 'patient' ? 'Patient' : 'Institution'}
                onChange={(e) => setSelectedEntity(e.target.value)}
                required
              >
                {roleAction === 'patient' ? (
                  patients.length > 0 ? (
                    patients.map(patient => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {`${patient.firstName} ${patient.lastName} (ID: ${patient.id})`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No patients available</MenuItem>
                  )
                ) : (
                  institutions.length > 0 ? (
                    institutions.map(institution => (
                      <MenuItem key={institution.id} value={institution.id}>
                        {`${institution.name} (ID: ${institution.id})`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No institutions available</MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button
            onClick={handleAssignRole}
            color="primary"
            disabled={(roleAction !== 'admin' && !selectedEntity) || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default UserRolesManagement;
