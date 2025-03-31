import React, { useState, useEffect } from 'react';
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
  useTheme,
  TextField,
  Grid,
  TablePagination
} from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';
import usersApi from 'api/users';
import authApi from 'api/auth';

const UserRolesManagement = () => {
  const theme = useTheme();

  // State variables
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
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
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientPage, setPatientPage] = useState(0);
  const [patientRowsPerPage, setPatientRowsPerPage] = useState(5);
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientLoading, setPatientLoading] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [institutionPage, setInstitutionPage] = useState(0);
  const [institutionRowsPerPage, setInstitutionRowsPerPage] = useState(5);
  const [totalInstitutions, setTotalInstitutions] = useState(0);
  const [institutionLoading, setInstitutionLoading] = useState(false);
  const [filters, setFilters] = useState({
    medical_record_number: '',
    name: '',
    date_of_birth: ''
  });
  const [institutionFilters, setInstitutionFilters] = useState({
    name: '',
    address: '',
    contact: ''
  });

  // Fetch data on component mount or page change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

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
      console.log('Starting to fetch data...', { page, rowsPerPage });
      
      // Get users with pagination - page is 0-based in MUI but 1-based in API
      const usersData = await usersApi.getAllUsers(page + 1, rowsPerPage);
      console.log('Users API response:', usersData);
      
      if (!usersData || !Array.isArray(usersData.items)) {
        console.warn('Invalid users data structure:', usersData);
        setUsers([]);
        setTotalRows(0);
      } else {
        console.log('Setting users state:', {
          items: usersData.items,
          itemsLength: usersData.items.length,
          total: usersData.total
        });
        setUsers(usersData.items);
        setTotalRows(usersData.total);
      }

      // Get patients and institutions for dropdowns
      const patientsData = await usersApi.getAllPatients();
      console.log('Patients data:', patientsData);
      setPatients(patientsData?.items || []);

      const institutionsData = await usersApi.getAllInstitutions();
      console.log('Institutions data:', institutionsData);
      setInstitutions(institutionsData?.items || []);
    } catch (error) {
      console.error('Error in fetchData:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAlert({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
      setUsers([]);
      setPatients([]);
      setInstitutions([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
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

  // Calculate pagination display values
  const calculatePaginationValues = (page, rowsPerPage, totalRows) => {
    const from = page * rowsPerPage + 1;
    const to = Math.min((page + 1) * rowsPerPage, totalRows);
    return { from, to };
  };

  // Fetch all patients at once
  const fetchAllPatients = async () => {
    setPatientLoading(true);
    try {
      // Fetch all patients by setting a large limit
      const patientsData = await usersApi.getAllPatients(1, 1000);
      setPatients(patientsData?.items || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setPatientLoading(false);
    }
  };

  // Fetch all institutions at once
  const fetchAllInstitutions = async () => {
    setInstitutionLoading(true);
    try {
      // Fetch all institutions by setting a large limit
      const institutionsData = await usersApi.getAllInstitutions(1, 1000);
      setInstitutions(institutionsData?.items || []);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setInstitutions([]);
    } finally {
      setInstitutionLoading(false);
    }
  };

  // Handle opening the dialog for role assignment
  const handleOpenRoleDialog = async (user, action) => {
    setCurrentUser(user);
    setRoleAction(action);
    setSelectedEntity('');
    setOpen(true);

    // Reset filters when opening dialog
    if (action === 'patient') {
      setFilters({
        medical_record_number: '',
        name: '',
        date_of_birth: ''
      });
      await fetchAllPatients();
    } else if (action === 'institution') {
      setInstitutionFilters({
        name: '',
        address: '',
        contact: ''
      });
      await fetchAllInstitutions();
    }
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
        await usersApi.makeUserAdmin(currentUser.id);
      } else if (roleAction === 'patient' && selectedEntity) {
        await usersApi.linkUserToPatient(currentUser.id, selectedEntity);
        // Force user to log out and log in again to get new JWT token
        authApi.logout();
        showAlert(`Successfully linked patient to ${currentUser.username}. User must log in again to access their patient data.`);
        handleClose();
        return;
      } else if (roleAction === 'institution' && selectedEntity) {
        await usersApi.linkUserToInstitution(currentUser.id, selectedEntity);
      } else {
        throw new Error('Invalid role action or missing entity selection');
      }

      showAlert(`Successfully assigned ${roleAction} role to ${currentUser.username}`);
      handleClose();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error assigning role:', error);
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Close alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Open add user dialog
  const handleOpenAddUserDialog = () => {
    setNewUser({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setAddUserDialogOpen(true);
  };

  // Close add user dialog
  const handleCloseAddUserDialog = () => {
    setAddUserDialogOpen(false);
  };

  // Handle input change for new user form
  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new user
  const handleCreateUser = async () => {
    setLoading(true);
    try {
      // Use the register endpoint to create a new user
      await usersApi.registerUser({
        username: newUser.email,
        email: newUser.email,
        password: newUser.password,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });

      showAlert(`User ${newUser.email} created successfully`, 'success');
      handleCloseAddUserDialog();
      fetchData(); // Refresh the user list
    } catch (error) {
      console.error('Error creating user:', error);
      showAlert(`Error: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes for patients
  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Apply filters to patients
  useEffect(() => {
    if (!patients) return;
    
    let filtered = [...patients];
    
    if (filters.medical_record_number) {
      filtered = filtered.filter(patient => 
        patient.medical_record_number?.toLowerCase().includes(filters.medical_record_number.toLowerCase())
      );
    }
    
    if (filters.name) {
      filtered = filtered.filter(patient => {
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
        return fullName.includes(filters.name.toLowerCase());
      });
    }
    
    if (filters.date_of_birth) {
      filtered = filtered.filter(patient => {
        const dob = new Date(patient.date_of_birth).toLocaleDateString();
        return dob.includes(filters.date_of_birth);
      });
    }
    
    setFilteredPatients(filtered);
    setTotalPatients(filtered.length);
    setPatientPage(0); // Reset to first page when filters change
  }, [patients, filters]);

  // Remove unused effects and functions
  const handlePatientPageChange = (event, newPage) => {
    setPatientPage(newPage);
  };

  const handlePatientRowsPerPageChange = (event) => {
    setPatientRowsPerPage(parseInt(event.target.value, 10));
    setPatientPage(0);
  };

  // Apply filters to institutions
  useEffect(() => {
    if (!institutions) return;
    
    let filtered = [...institutions];
    
    if (institutionFilters.name) {
      filtered = filtered.filter(institution => 
        institution.name?.toLowerCase().includes(institutionFilters.name.toLowerCase())
      );
    }
    
    if (institutionFilters.address) {
      filtered = filtered.filter(institution => 
        institution.address?.toLowerCase().includes(institutionFilters.address.toLowerCase())
      );
    }
    
    if (institutionFilters.contact) {
      filtered = filtered.filter(institution => 
        institution.contact_info?.toLowerCase().includes(institutionFilters.contact.toLowerCase())
      );
    }
    
    setFilteredInstitutions(filtered);
    setTotalInstitutions(filtered.length);
    setInstitutionPage(0); // Reset to first page when filters change
  }, [institutions, institutionFilters]);

  // Handle institution filter changes
  const handleInstitutionFilterChange = (field) => (event) => {
    setInstitutionFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle institution page change
  const handleInstitutionPageChange = (event, newPage) => {
    setInstitutionPage(newPage);
  };

  // Handle institution rows per page change
  const handleInstitutionRowsPerPageChange = (event) => {
    setInstitutionRowsPerPage(parseInt(event.target.value, 10));
    setInstitutionPage(0);
  };

  return (
    <MainCard title="User Roles Management">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddUserDialog}
        >
          Add User
        </Button>
      </Box>

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
            {users && users.length > 0 ? (
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
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '-'}
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
                  <Typography variant="body1">
                    {loading ? 'Loading users...' : 'No users found'}
                  </Typography>
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
          labelDisplayedRows={({ from, to, count }) => {
            const values = calculatePaginationValues(page, rowsPerPage, count);
            return `${values.from}-${values.to} of ${count}`;
          }}
        />
      </TableContainer>

      {/* Role assignment dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.light,
          color: theme.palette.primary.dark,
          py: 2,
          fontWeight: 700
        }}>
          {roleAction === 'admin'
            ? 'Make User an Admin'
            : roleAction === 'patient'
              ? 'Link User to Patient'
              : 'Link User to Institution'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {roleAction === 'admin'
              ? `Are you sure you want to make ${currentUser?.username} an admin?`
              : roleAction === 'patient'
                ? `Select a patient to link with user ${currentUser?.username}:`
                : `Select an institution to link with user ${currentUser?.username}:`}
          </DialogContentText>

          {roleAction === 'patient' ? (
            <>
              <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter Medical Record #"
                          value={filters.medical_record_number}
                          onChange={handleFilterChange('medical_record_number')}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter Name"
                          value={filters.name}
                          onChange={handleFilterChange('name')}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter Date of Birth"
                          value={filters.date_of_birth}
                          onChange={handleFilterChange('date_of_birth')}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patientLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients
                        .slice(patientPage * patientRowsPerPage, (patientPage + 1) * patientRowsPerPage)
                        .map((patient) => (
                          <TableRow 
                            key={patient.id}
                            selected={selectedEntity === patient.id}
                            hover
                            onClick={() => setSelectedEntity(patient.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{patient.medical_record_number || '-'}</TableCell>
                            <TableCell>{`${patient.first_name} ${patient.last_name}`}</TableCell>
                            <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant={selectedEntity === patient.id ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setSelectedEntity(patient.id)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No patients found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={totalPatients}
                page={patientPage}
                onPageChange={handlePatientPageChange}
                rowsPerPage={patientRowsPerPage}
                onRowsPerPageChange={handlePatientRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          ) : roleAction === 'institution' ? (
            <>
              <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter Institution Name"
                          value={institutionFilters.name}
                          onChange={handleInstitutionFilterChange('name')}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter Address"
                          value={institutionFilters.address}
                          onChange={handleInstitutionFilterChange('address')}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Filter Contact"
                          value={institutionFilters.contact}
                          onChange={handleInstitutionFilterChange('contact')}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {institutionLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : filteredInstitutions.length > 0 ? (
                      filteredInstitutions
                        .slice(institutionPage * institutionRowsPerPage, (institutionPage + 1) * institutionRowsPerPage)
                        .map((institution) => (
                          <TableRow 
                            key={institution.id}
                            selected={selectedEntity === institution.id}
                            hover
                            onClick={() => setSelectedEntity(institution.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{institution.name}</TableCell>
                            <TableCell>{institution.address || '-'}</TableCell>
                            <TableCell>{institution.contact_info || '-'}</TableCell>
                            <TableCell>
                              <Button
                                variant={selectedEntity === institution.id ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setSelectedEntity(institution.id)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No institutions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                component="div"
                count={totalInstitutions}
                page={institutionPage}
                onPageChange={handleInstitutionPageChange}
                rowsPerPage={institutionRowsPerPage}
                onRowsPerPageChange={handleInstitutionRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleAssignRole}
            color="primary"
            variant="contained"
            disabled={(roleAction !== 'admin' && !selectedEntity) || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onClose={handleCloseAddUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the details for the new user.
          </DialogContentText>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={newUser.email}
                onChange={handleNewUserInputChange}
                margin="normal"
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                fullWidth
                value={newUser.password}
                onChange={handleNewUserInputChange}
                margin="normal"
                required
                type="password"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                value={newUser.firstName}
                onChange={handleNewUserInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                value={newUser.lastName}
                onChange={handleNewUserInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUserDialog} color="primary">Cancel</Button>
          <Button
            onClick={handleCreateUser}
            color="primary"
            disabled={!newUser.email || !newUser.password || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create User'}
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
