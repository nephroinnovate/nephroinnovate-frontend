import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import Logo from 'ui-component/Logo';

// assets
import dialysisIllustration from 'assets/images/dialysis-illustration.svg';

// icons
import {
  IconHeartbeat,
  IconCalendarEvent, 
  IconNurse, 
  IconReportMedical, 
  IconMessage, 
  IconUserCircle,
  IconArrowRight
} from '@tabler/icons-react';

// ==============================|| HOME PAGE ||============================== //

const HomePage = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Simple Header */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Logo />
            <Stack direction="row" spacing={2}>
              <Button 
                variant="text" 
                component={RouterLink} 
                to="/pages/login"
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                component={RouterLink} 
                to="/pages/register"
              >
                Register
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          py: 8, 
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white'
        }}
      >
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h1" gutterBottom>
                Welcome to DialysisHub
              </Typography>
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 'normal' }}>
                A comprehensive platform enhancing communication and coordination between dialysis patients and healthcare providers.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/dashboard/default"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: theme.palette.secondary.light,
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  size="large"
                  component={RouterLink}
                  to="/pages/login"
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src={dialysisIllustration}
                alt="Dialysis Illustration"
                sx={{
                  width: '100%',
                  maxWidth: 450,
                  height: 'auto',
                  display: 'block',
                  mx: 'auto',
                  borderRadius: 2,
                  boxShadow: 10,
                  // Fallback if image is not found
                  fallback: {
                    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNkYWRhZGEiLz48dGV4dCB4PSIyNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOGE4YThhIiBzdHlsZT0idGV4dC1hbmNob3I6IG1pZGRsZSI+RGlhbHlzaXMgSHViPC90ZXh0Pjwvc3ZnPg=='
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Features & Benefits
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
          DialysisHub integrates multiple aspects of kidney care to improve patient outcomes.
        </Typography>

        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <IconHeartbeat size={48} color={theme.palette.primary.main} />
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  Health Monitoring
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Track vital health metrics with real-time updates and alerts for critical changes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <IconCalendarEvent size={48} color={theme.palette.primary.main} />
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  Appointment Management
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Schedule and manage dialysis appointments with ease and receive timely reminders.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <IconNurse size={48} color={theme.palette.primary.main} />
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  Provider Communication
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Direct messaging with your healthcare team for quick answers and continuous care.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 4 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <IconReportMedical size={48} color={theme.palette.primary.main} />
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  Medical Records
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Access your complete medical history and treatment plans in one secure location.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 5 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <IconMessage size={48} color={theme.palette.primary.main} />
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  Community Support
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Connect with others on similar journeys through moderated support groups.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 6 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <IconUserCircle size={48} color={theme.palette.primary.main} />
                <Typography variant="h3" component="div" sx={{ mt: 2 }}>
                  Personalized Care
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Receive tailored care recommendations based on your unique health profile.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ py: 6, bgcolor: theme.palette.grey[100] }}>
        <Container>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h2" gutterBottom>
                Ready to enhance your dialysis care?
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Join DialysisHub today and take control of your kidney health journey.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                endIcon={<IconArrowRight />}
                component={RouterLink}
                to="/pages/register"
                sx={{ px: 4, py: 1 }}
              >
                Get Started
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 3, bgcolor: theme.palette.primary.dark, color: 'white' }}>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} textAlign="center">
              <Typography variant="body2">
                &copy; {new Date().getFullYear()} DialysisHub. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;