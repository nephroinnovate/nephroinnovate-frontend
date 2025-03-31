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
      const patientId = localStorage.getItem('relatedEntityId');
      if (!patientId) {
        throw new Error('Patient ID not found');
      }

      // Fetch patient data and dialysis sessions
      const patientData = await patientsApi.getPatient(parseInt(patientId));
      setPatient(patientData);

      const sessionsData = await dialysisApi.getSessionsByPatient(parseInt(patientId));
      setSessions(sessionsData);

      // Fetch laboratory results
      const labResultsData = await laboratoryApi.getLabResultsByPatient(parseInt(patientId));
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
      if (!patient) {
        throw new Error('Patient data not found');
      }

      const sessionData = {
        ...formData,
        patient_id: patient.id
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
      const userId = localStorage.getItem('relatedEntityId');
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
    <MainCard title="My Dialysis Data" sx={{ borderRadius: 8, boxShadow: theme.shadows[8] }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {patient && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 600, 
            color: theme.palette.primary.dark,
            borderBottom: `2px solid ${theme.palette.primary.light}`,
            pb: 1
          }}>
            Welcome, {patient.first_name} {patient.last_name}
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ 
                bgcolor: theme.palette.primary.light, 
                borderRadius: 4,
                boxShadow: theme.shadows[4],
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>Medical Record #</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{patient.medical_record_number || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ 
                bgcolor: theme.palette.secondary.light, 
                borderRadius: 4,
                boxShadow: theme.shadows[4],
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>Diagnosis</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{patient.primary_diagnosis || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ 
                bgcolor: theme.palette.success.light, 
                borderRadius: 4,
                boxShadow: theme.shadows[4],
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>Dialysis Start</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{formatDate(patient.dialysis_start_date)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ 
                bgcolor: theme.palette.warning.light, 
                borderRadius: 4,
                boxShadow: theme.shadows[4],
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>Total Sessions</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{sessions.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 3,
        '& .MuiTab-root': {
          minHeight: 64,
          fontWeight: 600
        },
        '& .Mui-selected': {
          color: theme.palette.primary.main,
          fontWeight: 700
        }
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="dialysis data tabs"
          sx={{ 
            '& .MuiTabs-indicator': { 
              height: 3,
              borderRadius: 1.5
            }
          }}
        >
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
              sx={{ 
                borderRadius: 8,
                px: 3,
                py: 1,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              Add New Session
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ 
            borderRadius: 4, 
            boxShadow: theme.shadows[4],
            overflow: 'hidden'
          }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Duration (min)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Pre Weight (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Post Weight (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Blood Flow Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Dialysate Flow Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Complications</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Staff</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length > 0 ? (
                  sessions
                    .slice()
                    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date))
                    .map((session, index) => (
                    <TableRow 
                      key={session.id} 
                      sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover },
                        '&:hover': { bgcolor: theme.palette.action.selected }
                      }}
                    >
                      <TableCell>{formatDate(session.session_date)}</TableCell>
                      <TableCell>{session.duration_minutes || '-'}</TableCell>
                      <TableCell>{session.pre_weight || '-'}</TableCell>
                      <TableCell>{session.post_weight || '-'}</TableCell>
                      <TableCell>{session.blood_flow_rate || '-'}</TableCell>
                      <TableCell>{session.dialysate_flow_rate || '-'}</TableCell>
                      <TableCell>{session.complications || '-'}</TableCell>
                      <TableCell>{session.attending_staff || '-'}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenSessionForm(session)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: theme.palette.primary.lighter,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteDialogOpen(session)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: theme.palette.error.lighter,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton 
                          color="info" 
                          onClick={() => handleViewSessionDetails(session)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: theme.palette.info.lighter,
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                          }}
                        >
                          <AssessmentIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
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
        <Box sx={{ 
          height: 500, 
          p: 3, 
          bgcolor: '#f5f5f5', 
          borderRadius: 4,
          boxShadow: theme.shadows[4]
        }}>
          {sessions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={prepareWeightChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                />
                <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: 8,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    border: 'none'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="preWeight" 
                  name="Pre-Dialysis Weight (kg)" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2 }}
                  activeDot={{ r: 8, stroke: theme.palette.primary.dark }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="postWeight" 
                  name="Post-Dialysis Weight (kg)" 
                  stroke={theme.palette.secondary.main} 
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weightLoss" 
                  name="Weight Loss (kg)" 
                  stroke={theme.palette.error.main} 
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h4" sx={{ color: theme.palette.text.secondary }}>
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
              sx={{ 
                borderRadius: 8,
                px: 3,
                py: 1,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              Add New Lab Result
            </Button>
          </Box>

          {/* Lab Results Chart */}
          {labResults.length > 0 && (
            <Box sx={{ 
              height: 300, 
              mb: 4, 
              p: 3, 
              bgcolor: '#f5f5f5',
              borderRadius: 4,
              boxShadow: theme.shadows[4]
            }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: theme.palette.primary.dark
                }}
              >
                Lab Results Trends
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareLabChartData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 8,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      border: 'none'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 20 }}
                    iconType="circle"
                  />
                  <Line type="monotone" dataKey="hemoglobin" name="Hemoglobin (g/dL)" stroke="#ff0000" strokeWidth={2} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="hematocrit" name="Hematocrit (scaled)" stroke="#bf00ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="potassium" name="Potassium (mmol/L)" stroke="#00ff00" strokeWidth={2} />
                  <Line type="monotone" dataKey="creatinine" name="Creatinine (mg/dL)" stroke="#0000ff" strokeWidth={2} />
                  <Line type="monotone" dataKey="urea" name="Urea (scaled)" stroke="#ff8c00" strokeWidth={2} />
                  <Line type="monotone" dataKey="kt_v" name="Kt/V" stroke="#00bfff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}

          <TableContainer component={Paper} sx={{ 
            borderRadius: 4, 
            boxShadow: theme.shadows[4],
            overflow: 'hidden'
          }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Session Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Hemoglobin (g/dL)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Hematocrit (%)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Potassium (mmol/L)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Creatinine (mg/dL)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Urea (mg/dL)</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Kt/V</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
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
                        <TableRow 
                          key={result.id}
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: theme.palette.action.hover },
                            '&:hover': { bgcolor: theme.palette.action.selected }
                          }}
                        >
                          <TableCell>{formatDate(result.test_date)}</TableCell>
                          <TableCell>{formatDate(relatedSession.session_date)}</TableCell>
                          <TableCell>{result.hemoglobin || '-'}</TableCell>
                          <TableCell>{result.hematocrit || '-'}</TableCell>
                          <TableCell>{result.potassium || '-'}</TableCell>
                          <TableCell>{result.creatinine || '-'}</TableCell>
                          <TableCell>{result.urea || '-'}</TableCell>
                          <TableCell>{result.kt_v || '-'}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenLabResultForm(result)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: theme.palette.primary.lighter,
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteLabDialogOpen(result)}
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: theme.palette.error.lighter,
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
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
      <Dialog 
        open={sessionFormOpen} 
        onClose={handleCloseSessionForm} 
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
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {selectedSession ? 'Edit Dialysis Session' : 'Add New Dialysis Session'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="attending_staff"
                label="Attending Staff"
                value={formData.attending_staff}
                onChange={handleFormChange}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            {!selectedSession && (
              <Box sx={{ mt: 2, ml: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={createLabWithSession}
                      onChange={(e) => setCreateLabWithSession(e.target.checked)}
                      name="createLabWithSession"
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main
                        }
                      }}
                    />
                  }
                  label="Add laboratory results for this session"
                />
              </Box>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleCloseSessionForm}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitSession}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Result Form Dialog */}
      <Dialog 
        open={labResultFormOpen} 
        onClose={handleCloseLabResultForm} 
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
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {selectedLabResult ? 'Edit Laboratory Result' : 'Add New Laboratory Result'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleCloseLabResultForm}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitLabResult}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleDeleteDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.dark,
          py: 2
        }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete this dialysis session from {formatDate(selectedSession?.session_date)}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleDeleteDialogClose}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSession}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Lab Result Confirmation Dialog */}
      <Dialog 
        open={deleteLabDialogOpen} 
        onClose={handleDeleteLabDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.dark,
          py: 2
        }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to delete this laboratory result from {formatDate(selectedLabResult?.test_date)}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleDeleteLabDialogClose}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteLabResult}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Details Dialog */}
      <Dialog 
        open={sessionDetailsOpen} 
        onClose={handleCloseSessionDetails} 
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
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          Session Details - {formatDate(sessionDetails?.session_date)}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {sessionDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.dark,
                  borderBottom: `2px solid ${theme.palette.primary.light}`,
                  pb: 1
                }}>
                  Dialysis Session Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[6],
                  } 
                }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Date:</strong> {formatDate(sessionDetails.session_date)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Duration:</strong> {sessionDetails.duration_minutes || '-'} minutes
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Staff:</strong> {sessionDetails.attending_staff || '-'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[6],
                  } 
                }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Weight Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Pre-Dialysis Weight:</strong> {sessionDetails.pre_weight || '-'} kg
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Post-Dialysis Weight:</strong> {sessionDetails.post_weight || '-'} kg
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
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
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[6],
                  } 
                }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Flow Rates
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Blood Flow Rate:</strong> {sessionDetails.blood_flow_rate || '-'} ml/min
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      <strong>Dialysate Flow Rate:</strong> {sessionDetails.dialysate_flow_rate || '-'} ml/min
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  boxShadow: theme.shadows[3],
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[6],
                  } 
                }}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Complications
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      {sessionDetails.complications || 'No complications reported'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              {sessionAssociatedLabs.length > 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    boxShadow: theme.shadows[3]
                  }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                      Associated Laboratory Results
                    </Typography>
                    <TableContainer sx={{ mt: 2 }}>
                      <Table size="small" sx={{ 
                        '& .MuiTableCell-head': { 
                          backgroundColor: theme.palette.primary.lighter,
                          fontWeight: 700
                        },
                        '& .MuiTableRow-root:nth-of-type(odd)': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }}>
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
                            <TableRow key={lab.id} hover>
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
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 4,
                    boxShadow: theme.shadows[3]
                  }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                      Laboratory Results
                    </Typography>
                    <Box sx={{ mt: 2, mb: 3 }}>
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
                      sx={{ 
                        borderRadius: 8,
                        px: 3,
                        py: 1,
                        boxShadow: theme.shadows[1],
                        '&:hover': {
                          boxShadow: theme.shadows[3]
                        }
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
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f5f5f5' }}>
          <Button 
            onClick={handleCloseSessionDetails}
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              handleCloseSessionDetails();
              handleOpenSessionForm(sessionDetails);
            }} 
            color="primary"
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
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
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          sx={{ 
            width: '100%', 
            boxShadow: theme.shadows[3],
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default PatientDialysisData;
