import { Grid, Typography } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| SETTINGS PAGE ||============================== //

const Settings = () => {
  const userRole = localStorage.getItem('userRole');

  return (
    <MainCard title="Settings">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3">Account Settings</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            You are currently logged in as: <strong>{userRole}</strong>
          </Typography>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <MainCard title="Profile Settings" sx={{ height: '100%' }}>
            <Typography variant="body1">
              Profile settings would appear here. This is accessible by both admin and institution roles.
            </Typography>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <MainCard title="Notification Settings" sx={{ height: '100%' }}>
            <Typography variant="body1">
              Configure notification preferences here.
            </Typography>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <MainCard title="Security Settings" sx={{ height: '100%' }}>
            <Typography variant="body1">
              Change password and security settings.
            </Typography>
          </MainCard>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Settings;
