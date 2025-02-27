import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import authApi from '../../../api/auth'

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

// ===========================|| JWT - REGISTER ||=========================== //

export default function AuthRegister() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    showPassword: false,
    terms: false
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
    // Clear error when user starts typing
    if (errors[prop]) {
      setErrors({ ...errors, [prop]: '' });
    }
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!values.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!values.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(values.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!values.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
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
      const response = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      });

      setNotification({
        show: true,
        message: 'Registration successful! Please login to continue.',
        type: 'success'
      });

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || 'Registration failed. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Grid container direction="column" spacing={2} sx={{ justifyContent: 'center' }}>
          <Grid container sx={{ alignItems: 'center', justifyContent: 'center' }} size={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Sign up with Email address</Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 0, sm: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              name="firstName"
              type="text"
              value={values.firstName}
              onChange={handleChange('firstName')}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              sx={{ ...theme.typography.customInput }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              name="lastName"
              type="text"
              value={values.lastName}
              onChange={handleChange('lastName')}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              sx={{ ...theme.typography.customInput }}
            />
          </Grid>
        </Grid>

        <FormControl fullWidth sx={{ ...theme.typography.customInput }} error={Boolean(errors.email)}>
          <InputLabel htmlFor="outlined-adornment-email-register">Email Address</InputLabel>
          <OutlinedInput
            id="outlined-adornment-email-register"
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
          <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password-register"
            type={values.showPassword ? 'text' : 'password'}
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
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
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
              control={
                <Checkbox
                  checked={values.terms}
                  onChange={(event) => setValues({ ...values, terms: event.target.checked })}
                  name="terms"
                  color="primary"
                />
              }
              label={
                <Typography variant="subtitle1">
                  Agree with &nbsp;
                  <Typography variant="subtitle1" component={Link} to="#">
                    Terms & Condition.
                  </Typography>
                </Typography>
              }
            />
            {errors.terms && (
              <Typography variant="caption" color="error" display="block">
                {errors.terms}
              </Typography>
            )}
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
              {loading ? 'Signing up...' : 'Sign up'}
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