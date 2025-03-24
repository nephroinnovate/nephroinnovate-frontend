import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, Button, Container, Typography, Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';

const NotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <MainCard title="Page Not Found">
      <Container sx={{ pt: 5, pb: 10, textAlign: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            height: '200px',
            width: '100%',
            mb: 2
          }}
        >
          {/* Blue circle background */}
          <Box
            sx={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              bgcolor: 'rgba(63, 81, 181, 0.1)',
              top: '0',
              right: '25%',
            }}
          />

          {/* Pink circle background */}
          <Box
            sx={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              bgcolor: 'rgba(245, 0, 87, 0.1)',
              top: '30px',
              right: '15%',
            }}
          />

          {/* Main 404 text */}
          <Typography
            variant="h1"
            color="primary"
            sx={{
              fontSize: '8rem',
              fontWeight: 700,
              position: 'relative',
              zIndex: 2
            }}
          >
            404
          </Typography>

          {/* Question marks */}
          <Box
            sx={{
              position: 'relative',
              mt: -3,
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              color="error.light"
              sx={{ fontSize: '1.5rem', mx: 0.5, fontWeight: 'bold' }}
            >
              ?
            </Typography>
            <Box
              sx={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Sad face */}
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '2.5rem',
                  transform: 'rotate(90deg)',
                  position: 'relative',
                  top: -5
                }}
              >
                :(
              </Typography>
            </Box>
            <Typography
              color="error.light"
              sx={{ fontSize: '1.5rem', mx: 0.5, fontWeight: 'bold' }}
            >
              ?
            </Typography>
          </Box>

          {/* Light circle below */}
          <Box
            sx={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              bgcolor: 'rgba(63, 81, 181, 0.1)',
              mx: 'auto',
              mt: 2
            }}
          />
        </Box>

        {/* Second 404 text */}
        <Typography
          variant="h1"
          color="primary"
          sx={{
            fontSize: '3rem',
            fontWeight: 700,
            mt: 3
          }}
        >
          404
        </Typography>

        {/* Page Not Found text */}
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Page Not Found
        </Typography>

        {/* Description text */}
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>

        {/* Buttons */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<IconArrowLeft />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconHome />}
            onClick={() => window.location.href = '/'}
          >
            Home Page
          </Button>
        </Box>
      </Container>
    </MainCard>
  );
};

export default NotFound;
