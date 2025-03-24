import React from 'react';
import { isRouteErrorResponse, useRouteError, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Container, Typography, Grid, Paper } from '@mui/material';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';

// Standalone 404 component
import NotFound from 'views/pages/NotFound';

// ==============================|| ERROR PAGE - GENERIC ||============================== //

const GenericError = ({ status, title, message, primaryAction, secondaryAction }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          maxWidth: '500px',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" color="error" gutterBottom>
          {status}
        </Typography>
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {secondaryAction}
          {primaryAction}
        </Box>
      </Paper>
    </Box>
  );
};

// ==============================|| ELEMENT ERROR - BOUNDARY ||============================== //

export default function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Function to handle going back or to home if no history
  const handleGoBack = () => {
    // Simply simulate clicking the browser back button
    window.history.back();
  };

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }

    if (error.status === 401) {
      return (
        <GenericError
          status="401"
          title="Unauthorized Access"
          message="You don't have permission to access this page. Please log in with appropriate credentials."
          primaryAction={
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.href = '/pages/login'}
            >
              Go to Login
            </Button>
          }
        />
      );
    }

    if (error.status === 503) {
      return (
        <GenericError
          status="503"
          title="Service Unavailable"
          message="Our servers are currently unavailable. Please try again later."
          primaryAction={
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload(true)}
            >
              Refresh Page
            </Button>
          }
        />
      );
    }
  }

  // Generic error
  return (
    <GenericError
      status="Oops!"
      title="Something went wrong"
      message="We're sorry for the inconvenience. Please try again later or contact support."
      primaryAction={
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      }
      secondaryAction={
        <Button
          variant="outlined"
          color="primary"
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      }
    />
  );
}
