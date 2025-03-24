import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import usersApi from 'api/users';
import { IconKey, IconMail, IconUser, IconUserCircle } from '@tabler/icons-react';
import User1 from 'assets/images/users/user-round.svg';

const AccountSettings = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await usersApi.getCurrentUserProfile();
        setUserProfile(profile);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          username: profile.username || '',
        });
      } catch (error) {
        setAlert({
          open: true,
          message: `Error loading profile: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update user profile
      await usersApi.updateCurrentUserProfile(formData);
      setAlert({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });

      // Refresh user profile
      const updatedProfile = await usersApi.getCurrentUserProfile();
      setUserProfile(updatedProfile);
    } catch (error) {
      setAlert({
        open: true,
        message: `Error updating profile: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle closing alerts
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  if (loading) {
    return (
      <MainCard title="Account Settings">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Account Settings">
      <Grid container spacing={3}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.primary.light }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar
                  src={User1}
                  alt="User Profile"
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: `2px solid ${theme.palette.background.paper}`
                  }}
                />
                <Typography variant="h3">
                  {userProfile?.firstName} {userProfile?.lastName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" textTransform="capitalize">
                  {userProfile?.role || 'User'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List>
                <ListItem>
                  <ListItemIcon>
                    <IconUser stroke={1.5} size="20px" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Username"
                    secondary={userProfile?.username}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <IconMail stroke={1.5} size="20px" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={userProfile?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <IconKey stroke={1.5} size="20px" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Created"
                    secondary={userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Edit Profile Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h3" gutterBottom>
              Edit Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : null}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h3" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" paragraph>
              Password changes are currently only available through administrators.
              Please contact your system administrator if you need to reset your password.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alert for notifications */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default AccountSettings;
