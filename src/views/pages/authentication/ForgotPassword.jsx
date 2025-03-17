import { useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AnimateButton from 'ui-component/extended/AnimateButton';

// ========================|| FORGOT PASSWORD ||======================== //

export default function ForgotPassword() {
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleChange = (event) => {
    setEmail(event.target.value);
    if (error) {
      setError('');
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Replace with actual API call when implemented
      // await authApi.forgotPassword({ email });

      // For now, just simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNotification({
        show: true,
        message: 'Password reset instructions have been sent to your email.',
        type: 'success'
      });

    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Failed to send reset instructions. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid size={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Grid sx={{ mb: 3 }}>
                    <Link to="#" aria-label="logo">
                      <Logo />
                    </Link>
                  </Grid>
                  <Grid size={12}>
                    <Grid container direction="column" sx={{ alignItems: 'center' }}>
                      <Typography gutterBottom variant="h3" sx={{ color: 'secondary.main' }}>
                        Forgot Password?
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '16px', textAlign: 'center' }}>
                        Enter your email address below and we'll send you password reset instructions
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid size={12}>
                    <form onSubmit={handleSubmit}>
                      <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                        <InputLabel htmlFor="outlined-adornment-email-forgot">Email Address</InputLabel>
                        <OutlinedInput
                          id="outlined-adornment-email-forgot"
                          type="email"
                          value={email}
                          name="email"
                          onChange={handleChange}
                          label="Email Address"
                        />
                        {error && (
                          <FormHelperText error id="standard-weight-helper-text-email-forgot">
                            {error}
                          </FormHelperText>
                        )}
                      </FormControl>

                      <Box sx={{ mt: 2 }}>
                        <AnimateButton>
                          <Button
                            disableElevation
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            color="secondary"
                            disabled={loading}
                          >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                          </Button>
                        </AnimateButton>
                      </Box>
                    </form>
                  </Grid>
                  <Grid container direction="column" sx={{ alignItems: 'center', mt: 3 }} size={12}>
                    <Typography component={Link} to="/pages/login" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                      Back to Login
                    </Typography>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ px: 3, my: 3 }} size={12}>
          <AuthFooter />
        </Grid>
      </Grid>

      <Snackbar
        open={notification.show}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </AuthWrapper1>
  );
}
