import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import dialysisApi from 'api/dialysis';
import laboratoryApi from 'api/laboratory';
import patientsApi from 'api/patients';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Chart imports
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PatientDialysisData = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [labResultFormOpen, setLabResultFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLabDialogOpen, setDeleteLabDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedLabResult, setSelectedLabResult] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [sessionAssociatedLabs, setSessionAssociatedLabs] = useState([]);
  const [createLabWithSession, setCreateLabWithSession] = useState(false);

  // Form data for creating/editing sessions
  const [formData, setFormData] = useState({
    session_date: '',
    duration_minutes: '',
    pre_weight: '',
    post_weight: '',
    blood_flow_rate: '',
    dialysate_flow_rate: '',
    complications: '',
    attending_staff: ''
  });

  // Form data for creating/editing lab results
  const [labFormData, setLabFormData] = useState({
    hemodialysis_session_id: '',
    test_date: '',
    hemoglobin: '',
    hematocrit: '',
    potassium: '',
    creatinine: '',
    urea: '',
    phosphorus: '',
    calcium: '',
    albumin: '',
    kt_v: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // For patient role, fetch only their specific record
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch patient data and dialysis sessions
      const patientData = await patientsApi.getPatient(userId);
      setPatient(patientData);

      const sessionsData = await dialysisApi.getSessionsByPatient(userId);
      setSessions(sessionsData);

      // Fetch laboratory results
      const labResultsData = await laboratoryApi.getLabResultsByPatient(userId);
      setLabResults(labResultsData);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleOpenSessionForm = (session = null) => {
    if (session) {
      // Editing existing session
      setSelectedSession(session);
      setFormData({
        session_date: session.session_date ? session.session_date.split('T')[0] : '',
        duration_minutes: session.duration_minutes || '',
        pre_weight: session.pre_weight || '',
        post_weight: session.post_weight || '',
        blood_flow_rate: session.blood_flow_rate || '',
        dialysate_flow_rate: session.dialysate_flow_rate || '',
        complications: session.complications || '',
        attending_staff: session.attending_staff || ''
      });
    } else {
      // Creating new session
      setSelectedSession(null);
      setFormData({
        session_date: new Date().toISOString().split('T')[0],
        duration_minutes: '',
        pre_weight: '',
        post_weight: '',
        blood_flow_rate: '',
        dialysate_flow_rate: '',
        complications: '',
        attending_staff: ''
      });
    }
    setSessionFormOpen(true);
  };

  const handleCloseSessionForm = () => {
    setSessionFormOpen(false);
  };

  const handleDeleteDialogOpen = (session) => {
    setSelectedSession(session);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitSession = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const sessionData = {
        ...formData,
        patient_id: parseInt(userId)
      };

      let createdSession;
      if (selectedSession) {
        // Update existing session
        await dialysisApi.updateSession(selectedSession.id, sessionData);
        setAlert({
          open: true,
          message: 'Dialysis session updated successfully',
          severity: 'success'
        });
      } else {
        // Create new session
        createdSession = await dialysisApi.createSession(sessionData);
        setAlert({
          open: true,
          message: 'Dialysis session created successfully',
          severity: 'success'
        });

        // If the user selected to create lab results with this session,
        // open the lab result form with this session pre-selected
        if (createdSession && createLabWithSession) {
          setLabFormData({
            ...labFormData,
            hemodialysis_session_id: createdSession.id,
            test_date: formData.session_date
          });
          setSessionFormOpen(false);
          setTimeout(() => {
            setLabResultFormOpen(true);
          }, 500);
          return;
        }
      }
      setSessionFormOpen(false);
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

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    setLoading(true);
    try {
      await dialysisApi.deleteSession(selectedSession.id);
      setAlert({
        open: true,
        message: 'Dialysis session deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
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

  const handleLabFormChange = (e) => {
    const { name, value } = e.target;
    setLabFormData({
      ...labFormData,
      [name]: value
    });
  };

  const handleOpenLabResultForm = (labResult = null) => {
    if (labResult) {
      // Editing existing lab result
      setSelectedLabResult(labResult);
      setLabFormData({
        hemodialysis_session_id: labResult.hemodialysis_session_id || '',
        test_date: labResult.test_date ? labResult.test_date.split('T')[0] : '',
        hemoglobin: labResult.hemoglobin || '',
        hematocrit: labResult.hematocrit || '',
        potassium: labResult.potassium || '',
        creatinine: labResult.creatinine || '',
        urea: labResult.urea || '',
        phosphorus: labResult.phosphorus || '',
        calcium: labResult.calcium || '',
        albumin: labResult.albumin || '',
        kt_v: labResult.kt_v || ''
      });
    } else {
      // Creating new lab result
      setSelectedLabResult(null);
      setLabFormData({
        hemodialysis_session_id: '',
        test_date: new Date().toISOString().split('T')[0],
        hemoglobin: '',
        hematocrit: '',
        potassium: '',
        creatinine: '',
        urea: '',
        phosphorus: '',
        calcium: '',
        albumin: '',
        kt_v: ''
      });
    }
    setLabResultFormOpen(true);
  };

  const handleCloseLabResultForm = () => {
    setLabResultFormOpen(false);
  };

  const handleDeleteLabDialogOpen = (labResult) => {
    setSelectedLabResult(labResult);
    setDeleteLabDialogOpen(true);
  };

  const handleDeleteLabDialogClose = () => {
    setDeleteLabDialogOpen(false);
  };

  const handleSubmitLabResult = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const resultData = {
        ...labFormData,
        patient_id: parseInt(userId)
      };

      if (selectedLabResult) {
        // Update existing lab result
        await laboratoryApi.updateLabResult(selectedLabResult.id, resultData);
        setAlert({
          open: true,
          message: 'Laboratory result updated successfully',
          severity: 'success'
        });
      } else {
        // Create new lab result
        await laboratoryApi.createLabResult(resultData);
        setAlert({
          open: true,
          message: 'Laboratory result created successfully',
          severity: 'success'
        });
      }
      setLabResultFormOpen(false);
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

  const handleDeleteLabResult = async () => {
    if (!selectedLabResult) return;

    setLoading(true);
    try {
      await laboratoryApi.deleteLabResult(selectedLabResult.id);
      setAlert({
        open: true,
        message: 'Laboratory result deleted successfully',
        severity: 'success'
      });
      setDeleteLabDialogOpen(false);
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

  const handleViewSessionDetails = (session) => {
    setSessionDetails(session);
    setSessionDetailsOpen(true);
    const associatedLabs = labResults.filter(lab => lab.hemodialysis_session_id === session.id);
    setSessionAssociatedLabs(associatedLabs);
  };

  const handleCloseSessionDetails = () => {
    setSessionDetailsOpen(false);
    setSessionAssociatedLabs([]);
  };

  // Prepare chart data
  const prepareWeightChartData = () => {
    return sessions
      .slice()
      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
      .map((session) => ({
        date: formatDate(session.session_date),
        preWeight: session.pre_weight,
        postWeight: session.post_weight,
        weightLoss: session.pre_weight && session.post_weight
          ? Number((session.pre_weight - session.post_weight).toFixed(2))
          : null
      }));
  };

  // Prepare lab results chart data
  const prepareLabChartData = () => {
    return labResults
      .slice()
      .sort((a, b) => new Date(a.test_date) - new Date(b.test_date))
      .map((result) => ({
        date: formatDate(result.test_date),
        hemoglobin: result.hemoglobin,
        hematocrit: result.hematocrit ? result.hematocrit / 3 : null, // scaled down for better visualization
        potassium: result.potassium,
        creatinine: result.creatinine,
        urea: result.urea ? result.urea / 10 : null, // scaled down for better visualization
        kt_v: result.kt_v
      }));
  };

  return (
    <MainCard title="My Dialysis Data">
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {patient && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            Welcome, {patient.first_name} {patient.last_name}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: theme.palette.primary.light }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Medical Record #</Typography>
                  <Typography variant="h3">{patient.medical_record_number || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: theme.palette.secondary.light }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Diagnosis</Typography>
                  <Typography variant="h5">{patient.primary_diagnosis || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: theme.palette.success.light }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Dialysis Start</Typography>
                  <Typography variant="h4">{formatDate(patient.dialysis_start_date)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ bgcolor: theme.palette.warning.light }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">Total Sessions</Typography>
                  <Typography variant="h3">{sessions.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dialysis data tabs">
          <Tab label="Sessions" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Weight Trends" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Laboratory Results" icon={<AssessmentIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Sessions Tab */}
      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenSessionForm()}
            >
              Add New Session
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Duration (min)</TableCell>
                  <TableCell>Pre Weight (kg)</TableCell>
                  <TableCell>Post Weight (kg)</TableCell>
                  <TableCell>Blood Flow Rate</TableCell>
                  <TableCell>Dialysate Flow Rate</TableCell>
                  <TableCell>Complications</TableCell>
                  <TableCell>Staff</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length > 0 ? (
                  sessions
                    .slice()
                    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
                    .map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{formatDate(session.session_date)}</TableCell>
                      <TableCell>{session.duration_minutes || '-'}</TableCell>
                      <TableCell>{session.pre_weight || '-'}</TableCell>
                      <TableCell>{session.post_weight || '-'}</TableCell>
                      <TableCell>{session.blood_flow_rate || '-'}</TableCell>
                      <TableCell>{session.dialysate_flow_rate || '-'}</TableCell>
                      <TableCell>{session.complications || '-'}</TableCell>
                      <TableCell>{session.attending_staff || '-'}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenSessionForm(session)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteDialogOpen(session)}>
                          <DeleteIcon />
                        </IconButton>
                        <IconButton color="info" onClick={() => handleViewSessionDetails(session)}>
                          <AssessmentIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1">
                        {loading ? 'Loading sessions...' : 'No dialysis sessions found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Weight Trends Tab */}
      {tabValue === 1 && (
        <Box sx={{ height: 500 }}>
          {sessions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={prepareWeightChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="preWeight" name="Pre-Dialysis Weight (kg)" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="postWeight" name="Post-Dialysis Weight (kg)" stroke={theme.palette.secondary.main} />
                <Line type="monotone" dataKey="weightLoss" name="Weight Loss (kg)" stroke={theme.palette.error.main} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h4">
                {loading ? 'Loading data...' : 'No sessions available to display chart'}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Laboratory Results Tab */}
      {tabValue === 2 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenLabResultForm()}
            >
              Add New Lab Result
            </Button>
          </Box>

          {/* Lab Results Chart */}
          {labResults.length > 0 && (
            <Box sx={{ height: 300, mb: 4 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>Lab Results Trends</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareLabChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hemoglobin" name="Hemoglobin (g/dL)" stroke="#ff0000" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="hematocrit" name="Hematocrit (scaled)" stroke="#bf00ff" />
                  <Line type="monotone" dataKey="potassium" name="Potassium (mmol/L)" stroke="#00ff00" />
                  <Line type="monotone" dataKey="creatinine" name="Creatinine (mg/dL)" stroke="#0000ff" />
                  <Line type="monotone" dataKey="urea" name="Urea (scaled)" stroke="#ff8c00" />
                  <Line type="monotone" dataKey="kt_v" name="Kt/V" stroke="#00bfff" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Session Date</TableCell>
                  <TableCell>Hemoglobin (g/dL)</TableCell>
                  <TableCell>Hematocrit (%)</TableCell>
                  <TableCell>Potassium (mmol/L)</TableCell>
                  <TableCell>Creatinine (mg/dL)</TableCell>
                  <TableCell>Urea (mg/dL)</TableCell>
                  <TableCell>Kt/V</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {labResults.length > 0 ? (
                  labResults
                    .slice()
                    .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
                    .map((result) => {
                      const relatedSession = sessions.find(s => s.id === result.hemodialysis_session_id) || {};
                      return (
                        <TableRow key={result.id}>
                          <TableCell>{formatDate(result.test_date)}</TableCell>
                          <TableCell>{formatDate(relatedSession.session_date)}</TableCell>
                          <TableCell>{result.hemoglobin || '-'}</TableCell>
                          <TableCell>{result.hematocrit || '-'}</TableCell>
                          <TableCell>{result.potassium || '-'}</TableCell>
                          <TableCell>{result.creatinine || '-'}</TableCell>
                          <TableCell>{result.urea || '-'}</TableCell>
                          <TableCell>{result.kt_v || '-'}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleOpenLabResultForm(result)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteLabDialogOpen(result)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1">
                        {loading ? 'Loading laboratory results...' : 'No laboratory results found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Session Form Dialog */}
      <Dialog open={sessionFormOpen} onClose={handleCloseSessionForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSession ? 'Edit Dialysis Session' : 'Add New Dialysis Session'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="session_date"
                label="Session Date"
                type="date"
                value={formData.session_date}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="duration_minutes"
                label="Duration (minutes)"
                type="number"
                value={formData.duration_minutes}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="pre_weight"
                label="Pre-Dialysis Weight (kg)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.pre_weight}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="post_weight"
                label="Post-Dialysis Weight (kg)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={formData.post_weight}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="blood_flow_rate"
                label="Blood Flow Rate (ml/min)"
                type="number"
                value={formData.blood_flow_rate}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="dialysate_flow_rate"
                label="Dialysate Flow Rate (ml/min)"
                type="number"
                value={formData.dialysate_flow_rate}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="complications"
                label="Complications"
                value={formData.complications}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="attending_staff"
                label="Attending Staff"
                value={formData.attending_staff}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            {!selectedSession && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createLabWithSession}
                      onChange={(e) => setCreateLabWithSession(e.target.checked)}
                      name="createLabWithSession"
                    />
                  }
                  label="Add laboratory results for this session"
                />
              </Box>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSessionForm}>Cancel</Button>
          <Button
            onClick={handleSubmitSession}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Result Form Dialog */}
      <Dialog open={labResultFormOpen} onClose={handleCloseLabResultForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedLabResult ? 'Edit Laboratory Result' : 'Add New Laboratory Result'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="session-label">Hemodialysis Session</InputLabel>
                <Select
                  labelId="session-label"
                  name="hemodialysis_session_id"
                  value={labFormData.hemodialysis_session_id}
                  onChange={handleLabFormChange}
                  label="Hemodialysis Session"
                >
                  <MenuItem value="">None</MenuItem>
                  {sessions.map((session) => (
                    <MenuItem key={session.id} value={session.id}>
                      {formatDate(session.session_date)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="test_date"
                label="Test Date"
                type="date"
                value={labFormData.test_date}
                onChange={handleLabFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="hemoglobin"
                label="Hemoglobin (g/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.hemoglobin}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="hematocrit"
                label="Hematocrit (%)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.hematocrit}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="potassium"
                label="Potassium (mmol/L)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.potassium}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="creatinine"
                label="Creatinine (mg/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.creatinine}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="urea"
                label="Urea (mg/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.urea}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phosphorus"
                label="Phosphorus (mg/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.phosphorus}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="calcium"
                label="Calcium (mg/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.calcium}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="albumin"
                label="Albumin (g/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={labFormData.albumin}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="kt_v"
                label="Kt/V"
                type="number"
                inputProps={{ step: "0.01" }}
                value={labFormData.kt_v}
                onChange={handleLabFormChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLabResultForm}>Cancel</Button>
          <Button
            onClick={handleSubmitLabResult}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this dialysis session from {formatDate(selectedSession?.session_date)}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button
            onClick={handleDeleteSession}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Lab Result Confirmation Dialog */}
      <Dialog open={deleteLabDialogOpen} onClose={handleDeleteLabDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this laboratory result from {formatDate(selectedLabResult?.test_date)}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteLabDialogClose}>Cancel</Button>
          <Button
            onClick={handleDeleteLabResult}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog open={sessionDetailsOpen} onClose={handleCloseSessionDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Session Details - {formatDate(sessionDetails?.session_date)}
        </DialogTitle>
        <DialogContent>
          {sessionDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                  Dialysis Session Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      <strong>Date:</strong> {formatDate(sessionDetails.session_date)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Duration:</strong> {sessionDetails.duration_minutes || '-'} minutes
                    </Typography>
                    <Typography variant="body1">
                      <strong>Staff:</strong> {sessionDetails.attending_staff || '-'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Weight Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      <strong>Pre-Dialysis Weight:</strong> {sessionDetails.pre_weight || '-'} kg
                    </Typography>
                    <Typography variant="body1">
                      <strong>Post-Dialysis Weight:</strong> {sessionDetails.post_weight || '-'} kg
                    </Typography>
                    <Typography variant="body1">
                      <strong>Weight Loss:</strong> {
                        sessionDetails.pre_weight && sessionDetails.post_weight
                          ? (sessionDetails.pre_weight - sessionDetails.post_weight).toFixed(2)
                          : '-'
                      } kg
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Flow Rates
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      <strong>Blood Flow Rate:</strong> {sessionDetails.blood_flow_rate || '-'} ml/min
                    </Typography>
                    <Typography variant="body1">
                      <strong>Dialysate Flow Rate:</strong> {sessionDetails.dialysate_flow_rate || '-'} ml/min
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Complications
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      {sessionDetails.complications || 'No complications reported'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              {sessionAssociatedLabs.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Associated Laboratory Results
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Test Date</TableCell>
                            <TableCell>Hemoglobin</TableCell>
                            <TableCell>Hematocrit</TableCell>
                            <TableCell>Potassium</TableCell>
                            <TableCell>Creatinine</TableCell>
                            <TableCell>Urea</TableCell>
                            <TableCell>Kt/V</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sessionAssociatedLabs.map((lab) => (
                            <TableRow key={lab.id}>
                              <TableCell>{formatDate(lab.test_date)}</TableCell>
                              <TableCell>{lab.hemoglobin || '-'}</TableCell>
                              <TableCell>{lab.hematocrit || '-'}</TableCell>
                              <TableCell>{lab.potassium || '-'}</TableCell>
                              <TableCell>{lab.creatinine || '-'}</TableCell>
                              <TableCell>{lab.urea || '-'}</TableCell>
                              <TableCell>{lab.kt_v || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              )}
              {sessionAssociatedLabs.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Laboratory Results
                    </Typography>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="body1">
                        No laboratory results associated with this session.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        handleCloseSessionDetails();
                        setLabFormData({
                          ...labFormData,
                          hemodialysis_session_id: sessionDetails.id,
                          test_date: sessionDetails.session_date ? sessionDetails.session_date.split('T')[0] : ''
                        });
                        setLabResultFormOpen(true);
                      }}
                    >
                      Add Lab Results
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSessionDetails}>Close</Button>
          <Button onClick={() => {
            handleCloseSessionDetails();
            handleOpenSessionForm(sessionDetails);
          }} color="primary">
            Edit Session
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

export default PatientDialysisData;
