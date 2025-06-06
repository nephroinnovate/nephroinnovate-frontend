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

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// Project imports
import MainCard from 'ui-component/cards/MainCard';

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

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

  // Transform frontend data to FHIR format
  const transformToFHIR = (data) => {
    const fhirData = {
      name: data.name,
      active: true,
      resourceType: 'Organization'
    };

    // Transform contact number and email to telecom array
    const telecom = [];
    if (data.contact_number) {
      telecom.push({
        system: 'phone',
        value: data.contact_number,
        use: 'work'
      });
    }
    if (data.email) {
      telecom.push({
        system: 'email',
        value: data.email,
        use: 'work'
      });
    }
    if (telecom.length > 0) {
      fhirData.telecom = telecom;
    }

    // Transform institution type to type array
    if (data.institution_type) {
      fhirData.type = [
        {
          coding: [
            {
              system: 'http://example.org/institution-type',
              code: data.institution_type,
              display: data.institution_type.charAt(0).toUpperCase() + data.institution_type.slice(1).replace('_', ' ')
            }
          ]
        }
      ];
    }

    // Transform address to address array
    if (data.address) {
      fhirData.address = [
        {
          use: 'work',
          type: 'physical',
          text: data.address
        }
      ];
    }

    // Add identifiers
    const identifier = [];
    if (data.registration_number) {
      identifier.push({
        system: 'http://example.org/registration',
        value: data.registration_number
      });
    }
    if (identifier.length > 0) {
      fhirData.identifier = identifier;
    }

    // Store extra fields in extension
    const extensions = [];
    if (data.establishment_date) {
      extensions.push({
        url: 'http://example.org/establishment-date',
        valueDate: data.establishment_date
      });
    }
    if (data.total_bed_capacity) {
      extensions.push({
        url: 'http://example.org/bed-capacity',
        valueInteger: parseInt(data.total_bed_capacity)
      });
    }
    if (data.dialysis_stations_count) {
      extensions.push({
        url: 'http://example.org/dialysis-stations',
        valueInteger: parseInt(data.dialysis_stations_count)
      });
    }
    if (data.operating_hours) {
      extensions.push({
        url: 'http://example.org/operating-hours',
        valueString: data.operating_hours
      });
    }
    if (extensions.length > 0) {
      fhirData.extension = extensions;
    }

    return fhirData;
  };

  // Transform FHIR data back to frontend format
  const transformFromFHIR = (fhirData) => {
    const data = {
      id: fhirData.id, // Preserve the ID
      name: fhirData.name || '',
      address: '',
      contact_number: '',
      email: '',
      registration_number: '',
      institution_type: '',
      establishment_date: '',
      total_bed_capacity: '',
      dialysis_stations_count: '',
      operating_hours: ''
    };

    // Extract telecom
    if (fhirData.telecom && Array.isArray(fhirData.telecom)) {
      const phone = fhirData.telecom.find((t) => t.system === 'phone');
      const email = fhirData.telecom.find((t) => t.system === 'email');
      if (phone) data.contact_number = phone.value;
      if (email) data.email = email.value;
    }

    // Extract type
    if (fhirData.type && Array.isArray(fhirData.type) && fhirData.type.length > 0) {
      const typeCode = fhirData.type[0].coding?.[0]?.code;
      if (typeCode) data.institution_type = typeCode;
    }

    // Extract address
    if (fhirData.address && Array.isArray(fhirData.address) && fhirData.address.length > 0) {
      data.address = fhirData.address[0].text || '';
    }

    // Extract identifier
    if (fhirData.identifier && Array.isArray(fhirData.identifier)) {
      const regNum = fhirData.identifier.find((i) => i.system === 'http://example.org/registration');
      if (regNum) data.registration_number = regNum.value;
    }

    // Extract extensions
    if (fhirData.extension && Array.isArray(fhirData.extension)) {
      fhirData.extension.forEach((ext) => {
        switch (ext.url) {
          case 'http://example.org/establishment-date':
            data.establishment_date = ext.valueDate || '';
            break;
          case 'http://example.org/bed-capacity':
            data.total_bed_capacity = ext.valueInteger?.toString() || '';
            break;
          case 'http://example.org/dialysis-stations':
            data.dialysis_stations_count = ext.valueInteger?.toString() || '';
            break;
          case 'http://example.org/operating-hours':
            data.operating_hours = ext.valueString || '';
            break;
        }
      });
    }

    return data;
  };

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
    getInstitutions: () => api.get('/organizations/'),
    getInstitution: (id) => api.get(`/organizations/${id}/`),
    createInstitution: (data) => api.post('/organizations/', data),
    updateInstitution: (id, data) => api.patch(`/organizations/${id}/`, data),
    deleteInstitution: (id) => api.delete(`/organizations/${id}/`)
  };

  // Fetch institutions on load or page change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  // Fetch all institutions
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching institutions...');
      const response = await axiosAuth.get(`/organizations/?page=${page + 1}&limit=${rowsPerPage}`);
      console.log('Institutions data:', response.data);

      // Ensure we always set an array, even if empty
      const items = response.data?.items || response.data?.results || response.data || [];
      const transformedItems = Array.isArray(items) ? items.map(transformFromFHIR) : [];
      setInstitutions(transformedItems);
      setTotalRows(response.data?.total || response.data?.count || transformedItems.length);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setInstitutions([]); // Set empty array on error
      setTotalRows(0);
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
    // Store the full institution object (already transformed from FHIR)
    setSelectedInstitution(institution);
    // Set form data with the same institution data
    setFormData(institution);
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
      const fhirData = transformToFHIR(formData);

      if (selectedInstitution) {
        // Update existing institution
        console.log(`Updating institution ${selectedInstitution.id} with FHIR data:`, fhirData);
        await axiosAuth.patch(`/organizations/${selectedInstitution.id}/`, fhirData);
        showAlert('Institution updated successfully');
      } else {
        // Create new institution
        console.log('Creating new institution with FHIR data:', fhirData);
        await axiosAuth.post('/organizations/', fhirData);
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
      await axiosAuth.delete(`/organizations/${selectedInstitution.id}/`);
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
    <MainCard title="Institution Management">
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
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
            {institutions && institutions.length > 0 ? (
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton color="primary" onClick={() => handleEdit(institution)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteConfirmation(institution)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1">{loading ? 'Loading institutions...' : 'No institutions found'}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
      </TableContainer>

      {/* Institution Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{selectedInstitution ? 'Edit Institution' : 'Add New Institution'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Institution Name */}
            <Grid item xs={12} md={6}>
              <TextField name="name" label="Institution Name" value={formData.name} onChange={handleChange} fullWidth required />
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
              <TextField name="address" label="Address" value={formData.address} onChange={handleChange} fullWidth multiline rows={2} />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} md={6}>
              <TextField name="contact_number" label="Contact Number" value={formData.contact_number} onChange={handleChange} fullWidth />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleChange} fullWidth />
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
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete institution "{selectedInstitution?.name}"? This action cannot be undone.
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

export default InstitutionManagement;
