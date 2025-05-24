import React, {useState, useEffect, useRef} from 'react';
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
import uploadsApi from 'api/uploads';
import {IconKey, IconMail, IconUser, IconUserCircle, IconCameraPlus} from '@tabler/icons-react';
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
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

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
        // Set initial avatar preview if avatar URL exists
        if (profile.avatar) {
          // Django serves media files with /media/ prefix
          const avatarUrl = profile.avatar.startsWith('http')
              ? profile.avatar
              : `${uploadsApi.API_BASE_URL}/media/${profile.avatar}`;
          setAvatarPreview(avatarUrl);
        }
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

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setAlert({
        open: true,
        message: 'Please select an image to upload.',
        severity: 'warning',
      });
      return;
    }
    setSaving(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found for avatar upload.');
      }
      const response = await uploadsApi.uploadAvatar(avatarFile, userId);
      setAlert({
        open: true,
        message: response.message || 'Avatar uploaded successfully!',
        severity: 'success'
      });
      // Refresh profile to get new avatar URL
      const updatedProfile = await usersApi.getCurrentUserProfile();
      setUserProfile(updatedProfile);
      if (updatedProfile.avatar) {
        // Construct the full URL for the avatar preview
        // This assumes your backend returns a relative path for the avatar
        // and that your apiClient or a config file has the base URL.
        // For uploadsApi, it might be good to expose API_BASE_URL if not already.
        // For now, let's assume a simple concatenation, adjust as needed.
        const baseUrl = uploadsApi.API_BASE_URL || ''; // Or your actual base URL
        const avatarUrl = updatedProfile.avatar.startsWith('http') ? updatedProfile.avatar : `${baseUrl}/media/${updatedProfile.avatar}`;
        setAvatarPreview(avatarUrl);
      }
      setAvatarFile(null); // Clear the selected file
      // Reload the page after a short delay to update the header profile icon
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setAlert({
        open: true,
        message: `Avatar upload failed: ${error.message}`,
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
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
                <Box sx={{position: 'relative', display: 'inline-block'}}>
                  <Avatar
                      src={avatarPreview || userProfile?.avatar || User1} // Show preview, then profile avatar, then default
                      alt="User Profile"
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        border: `2px solid ${theme.palette.background.paper}`,
                        cursor: 'pointer'
                      }}
                      onClick={handleAvatarClick}
                  />
                  <IconButton
                      color="primary"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.lighter,
                        },
                        p: 0.5
                      }}
                      onClick={handleAvatarClick}
                  >
                    <IconCameraPlus stroke={1.5} size="20px"/>
                  </IconButton>
                </Box>
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                />
                {avatarFile && (
                    <Button
                        variant="contained"
                        onClick={handleAvatarUpload}
                        disabled={saving}
                        size="small"
                        sx={{mt: 1}}
                    >
                      {saving ? <CircularProgress size={20}/> : 'Upload Avatar'}
                    </Button>
                )}
                <Typography variant="h3" sx={{mt: avatarFile ? 0 : 2}}>
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
