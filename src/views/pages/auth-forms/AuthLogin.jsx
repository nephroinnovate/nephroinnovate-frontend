import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import authApi from '../../../api/auth';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [checked, setChecked] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    if (errors[prop]) {
      setErrors({ ...errors, [prop]: '' });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!values.email) {
      newErrors.email = 'Email is required';
    }
    if (!values.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password
      });

      // Store the access token and user role in localStorage
        const accessToken = response.access_token || response.tokens?.access;
        const refreshToken = response.refresh_token || response.tokens?.refresh;
        const userRole = response.role || response.user?.role || 'patient';
        const userId = response.id || response.user?.id || '';
        const relatedEntityId = response.relatedEntityId || response.user?.relatedEntityId;

        localStorage.setItem('token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
      }
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userId', userId);

        if (relatedEntityId) {
            localStorage.setItem('relatedEntityId', relatedEntityId.toString());
        }

      // Store user data if needed
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      setNotification({
        show: true,
        message: 'Login successful!',
        type: 'success'
      });

      // Redirect based on user role
      setTimeout(() => {
        // If patient role, redirect to dialysis data page
        if (response.role === 'patient') {
          navigate('/patients/dialysis-data');
        } else {
          // Otherwise redirect to dashboard
          navigate('/dashboard/default');
        }
      }, 1000);

    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Login failed. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={Boolean(errors.email)}>
          <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
          <OutlinedInput
            id="outlined-adornment-email-login"
            type="email"
            value={values.email}
            name="email"
            onChange={handleChange('email')}
            label="Email Address"
          />
          {errors.email && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {errors.email}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={Boolean(errors.password)}>
          <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password-login"
            type={showPassword ? 'text' : 'password'}
            value={values.password}
            name="password"
            onChange={handleChange('password')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
          {errors.password && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {errors.password}
            </Typography>
          )}
        </FormControl>

        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
              label="Keep me logged in"
            />
          </Grid>
          <Grid>
            <Typography variant="subtitle1" component={Link} to="/forgot-password" color="secondary" sx={{ textDecoration: 'none' }}>
              Forgot Password?
            </Typography>
          </Grid>
        </Grid>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </AnimateButton>
        </Box>
      </form>

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
    </>
  );
}
