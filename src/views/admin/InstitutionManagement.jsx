import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Alert
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Project imports
import MainCard from 'ui-component/cards/MainCard';

// SUPER SIMPLE DIRECT API IMPLEMENTATION
// All requests use axios directly
// Base URL for API requests (auto-proxy in development)
const API_URL = '/api';

// Create a direct axios instance with the auth token
const axiosAuth = axios.create({
  baseURL: API_URL,
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

const InstitutionManagement = () => {
  // States for institutions data and UI
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    email: '',
    registration_number: '',
    institution_type: '',
    establishment_date: '',
    total_bed_capacity: '',
    dialysis_stations_count: '',
    operating_hours: ''
  });

  // User role from localStorage
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  // Direct API methods
  const api = {
    // Make a request with authorization
    request: async (method, url, data = null) => {
      const token = localStorage.getItem('token');

      try {
        // Log the request for debugging
        console.log(`API ${method} ${url}`, data ? data : '');

        // Make the request with authorization header
        const config = {
          method,
          url: `${API_BASE_URL}${url}`,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          data
        };

        const response = await axios(config);
        console.log(`API ${method} ${url} response:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`API Error (${method} ${url}):`, error);

        // Handle authentication error
        if (error.response?.status === 401) {
          console.log('Authentication error detected, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          window.location.href = '/';
          return null;
        }

        throw new Error(error.response?.data?.message || `Failed to ${method} data`);
      }
    },

    // Wrapper methods for common HTTP verbs
    get: (url) => api.request('GET', url),
    post: (url, data) => api.request('POST', url, data),
    patch: (url, data) => api.request('PATCH', url, data),
    delete: (url) => api.request('DELETE', url),

    // Domain-specific API methods
    getInstitutions: () => api.get('/institutions'),
    getInstitution: (id) => api.get(`/institutions/${id}`),
    createInstitution: (data) => api.post('/institutions', data),
    updateInstitution: (id, data) => api.patch(`/institutions/${id}`, data),
    deleteInstitution: (id) => api.delete(`/institutions/${id}`)
  };

  // Fetch institutions on load
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all institutions
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching institutions...');
      const response = await axiosAuth.get('/institutions');
      console.log('Institutions data:', response.data);
      setInstitutions(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setAlert({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Display alerts
  const showAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open form dialog for adding new institution
  const handleAddNew = () => {
    setFormData({
      name: '',
      address: '',
      contact_number: '',
      email: '',
      registration_number: '',
      institution_type: '',
      establishment_date: '',
      total_bed_capacity: '',
      dialysis_stations_count: '',
      operating_hours: ''
    });
    setSelectedInstitution(null);
    setOpenForm(true);
  };

  // Open form dialog for editing institution
  const handleEdit = (institution) => {
    setSelectedInstitution(institution);
    setFormData({
      name: institution.name || '',
      address: institution.address || '',
      contact_number: institution.contact_number || '',
      email: institution.email || '',
      registration_number: institution.registration_number || '',
      institution_type: institution.institution_type || '',
      establishment_date: institution.establishment_date ? institution.establishment_date.split('T')[0] : '',
      total_bed_capacity: institution.total_bed_capacity || '',
      dialysis_stations_count: institution.dialysis_stations_count || '',
      operating_hours: institution.operating_hours || ''
    });
    setOpenForm(true);
  };

  // Open delete confirmation dialog
  const handleDeleteConfirmation = (institution) => {
    setSelectedInstitution(institution);
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

  // Submit institution form (create or update)
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selectedInstitution) {
        // Update existing institution
        console.log(`Updating institution ${selectedInstitution.id} with data:`, formData);
        await axiosAuth.patch(`/institutions/${selectedInstitution.id}`, formData);
        showAlert('Institution updated successfully');
      } else {
        // Create new institution
        console.log('Creating new institution with data:', formData);
        await axiosAuth.post('/institutions', formData);
        showAlert('Institution created successfully');
      }
      setOpenForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving institution:', error);
      showAlert(`Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete institution
  const handleDelete = async () => {
    if (!selectedInstitution) return;

    setLoading(true);
    try {
      console.log(`Deleting institution ${selectedInstitution.id}`);
      await axiosAuth.delete(`/institutions/${selectedInstitution.id}`);
      showAlert('Institution deleted successfully');
      setOpenDelete(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting institution:', error);
      showAlert(`Error: ${error.response?.data?.message || error.message}`, 'error');
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

  return (
    <MainCard title="Institution Management">
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Institution
        </Button>
      </Box>

      {/* Institutions table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Registration #</TableCell>
              <TableCell>Establishment Date</TableCell>
              <TableCell>Dialysis Stations</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.length > 0 ? (
              institutions.map((institution) => (
                <TableRow key={institution.id}>
                  <TableCell>{institution.name || '-'}</TableCell>
                  <TableCell>{institution.institution_type || '-'}</TableCell>
                  <TableCell>{institution.contact_number || '-'}</TableCell>
                  <TableCell>{institution.email || '-'}</TableCell>
                  <TableCell>{institution.registration_number || '-'}</TableCell>
                  <TableCell>{formatDate(institution.establishment_date)}</TableCell>
                  <TableCell>{institution.dialysis_stations_count || '-'}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(institution)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteConfirmation(institution)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1">
                    {loading ? 'Loading institutions...' : 'No institutions found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Institution Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedInstitution ? 'Edit Institution' : 'Add New Institution'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Institution Name */}
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Institution Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Institution Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="institution-type-label">Institution Type</InputLabel>
                <Select
                  labelId="institution-type-label"
                  name="institution_type"
                  value={formData.institution_type}
                  onChange={handleChange}
                  label="Institution Type"
                >
                  <MenuItem value="hospital">Hospital</MenuItem>
                  <MenuItem value="clinic">Clinic</MenuItem>
                  <MenuItem value="dialysis_center">Dialysis Center</MenuItem>
                  <MenuItem value="medical_center">Medical Center</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} md={6}>
              <TextField
                name="contact_number"
                label="Contact Number"
                value={formData.contact_number}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Registration Number */}
            <Grid item xs={12} md={6}>
              <TextField
                name="registration_number"
                label="Registration Number"
                value={formData.registration_number}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Establishment Date */}
            <Grid item xs={12} md={6}>
              <TextField
                name="establishment_date"
                label="Establishment Date"
                type="date"
                value={formData.establishment_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Total Bed Capacity */}
            <Grid item xs={12} md={4}>
              <TextField
                name="total_bed_capacity"
                label="Total Bed Capacity"
                type="number"
                value={formData.total_bed_capacity}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Dialysis Stations Count */}
            <Grid item xs={12} md={4}>
              <TextField
                name="dialysis_stations_count"
                label="Dialysis Stations Count"
                type="number"
                value={formData.dialysis_stations_count}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Operating Hours */}
            <Grid item xs={12} md={4}>
              <TextField
                name="operating_hours"
                label="Operating Hours"
                value={formData.operating_hours}
                onChange={handleChange}
                fullWidth
                placeholder="e.g. 8:00 AM - 6:00 PM"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete institution "{selectedInstitution?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
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

export default InstitutionManagement;
